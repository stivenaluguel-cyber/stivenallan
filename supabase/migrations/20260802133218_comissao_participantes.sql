-- ─────────────────────────────────────────────────────────────────────
-- Comissão dividida entre quantos envolvidos o negócio tiver.
--
-- crm_comissoes nasceu com dois papéis fixos: corretor_captador_id e
-- corretor_vendedor_id, com percentual_captador + percentual_vendedor = 100.
-- Isso cobre a venda de dois corretores e mais nada. Não cobre a imobiliária
-- que fica com uma fatia, o gerente com override, nem o parceiro de
-- co-corretagem — que é exatamente o desenho da rede de parceiros: o negócio
-- passa por três ou quatro mãos e cada uma tem seu pedaço.
--
-- As colunas antigas continuam de pé e não são migradas. Comissão sem
-- participante nenhum segue lida pelo par captador/vendedor; quem tiver
-- participante passa a ser lido por aqui. Migrar as linhas velhas para o
-- modelo novo reescreveria histórico financeiro já conferido para não ganhar
-- nada — o relatório sabe ler os dois formatos.
-- ─────────────────────────────────────────────────────────────────────

create table public.crm_comissao_participantes (
  "id" uuid primary key default gen_random_uuid(),
  "comissao_id" uuid not null references public.crm_comissoes(id) on delete cascade,
  -- Corretor cadastrado quando existe; nome livre para quem nunca vai virar
  -- cadastro (a imobiliária da ponta, o parceiro de uma venda só).
  "corretor_id" uuid references public.crm_corretores(id) on delete set null,
  "nome" text,
  "papel" text not null,
  "percentual" numeric(5,2) not null,
  "observacoes" text,
  "created_at" timestamptz not null default now(),
  constraint crm_comissao_participantes_papel_check check (
    papel in ('vendedor', 'captador', 'gerente', 'imobiliaria', 'parceiro', 'outro')
  ),
  -- Participante com 0% não é participante, é ruído na tela de divisão.
  constraint crm_comissao_participantes_percentual_check check (percentual > 0 and percentual <= 100),
  -- Sem corretor e sem nome, a linha não diz de quem é o dinheiro.
  constraint crm_comissao_participantes_identificacao_check check (
    corretor_id is not null or (nome is not null and length(btrim(nome)) > 0)
  )
);

create index crm_comissao_participantes_comissao_idx
  on public.crm_comissao_participantes (comissao_id);
create index crm_comissao_participantes_corretor_idx
  on public.crm_comissao_participantes (corretor_id);

alter table public.crm_comissao_participantes enable row level security;

-- ─────────────────────────────────────────────────────────────────────
-- Troca da lista inteira de participantes de uma comissão, de uma vez.
--
-- A tela edita a divisão como um conjunto ("quem fica com quanto"), não linha
-- a linha. Fazer isso pelo client seria um delete seguido de N inserts sem
-- transação: se o insert falhasse no meio, a comissão ficaria com a divisão
-- pela metade ou sem divisão nenhuma — e o valor de cada um sairia errado no
-- relatório sem ninguém perceber. Dentro da função, ou troca tudo ou não
-- troca nada.
--
-- A soma acima de 100% é barrada aqui também, e não só na API: é a única
-- barreira que vale para qualquer caminho de escrita. Abaixo de 100% passa de
-- propósito — dividir 60/20 e deixar 20 para decidir depois é situação real.
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.definir_participantes_comissao(
  p_comissao_id uuid,
  p_participantes jsonb
)
returns void
language plpgsql
volatile
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_soma numeric;
begin
  if not exists (select 1 from crm_comissoes where id = p_comissao_id) then
    raise exception 'comissão % não encontrada', p_comissao_id
      using errcode = 'no_data_found';
  end if;

  select coalesce(sum((item->>'percentual')::numeric), 0)
    into v_soma
    from jsonb_array_elements(coalesce(p_participantes, '[]'::jsonb)) as item;

  if v_soma > 100 then
    -- Sem "%%" na mensagem de propósito: em RAISE o % é placeholder e a
    -- escapada troca a ordem do texto sem avisar.
    raise exception 'a soma dos percentuais é % por cento, acima de 100', v_soma
      using errcode = 'check_violation';
  end if;

  delete from crm_comissao_participantes where comissao_id = p_comissao_id;

  insert into crm_comissao_participantes (comissao_id, corretor_id, nome, papel, percentual, observacoes)
  select
    p_comissao_id,
    nullif(item->>'corretor_id', '')::uuid,
    nullif(btrim(coalesce(item->>'nome', '')), ''),
    item->>'papel',
    (item->>'percentual')::numeric,
    nullif(btrim(coalesce(item->>'observacoes', '')), '')
  from jsonb_array_elements(coalesce(p_participantes, '[]'::jsonb)) as item;
end;
$function$;

revoke all on function public.definir_participantes_comissao(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.definir_participantes_comissao(uuid, jsonb) to service_role;
