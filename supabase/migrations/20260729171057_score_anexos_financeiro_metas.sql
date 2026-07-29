-- Dez frentes tiradas do benchmark com o Habitus CRM (plano STARTER, o que
-- eles vendem para corretor autônomo), adaptadas a um modelo que eles não
-- atendem: empreendimento na planta com financiamento DIRETO, onde o
-- corretor é também quem aprova o crédito e recebe comissão parcelada.
--
--  1. Lead score real e explicável (hoje a coluna existe e quase ninguém escreve nela)
--  2. Anexos/documentos por lead e por proposta — bucket PRIVADO
--  3. Financeiro fora do localStorage (recebido/a receber viram coluna)
--  4. Comissão parcelada
--  5. Leads parados + tempo médio entre movimentações
--  9. VGV, ticket médio e conversão por origem
-- 10. Meta mensal de VGV + histórico diário selado para o calendário
--
-- Itens 6, 7 e 8 (campos no card, SLA e importação de CSV) não precisam de
-- schema novo: os campos já existem em `leads`. Só o 7 ganha aqui o alvo de
-- SLA configurável.

-- ─────────────────────────────────────────────────────────────────────
-- 1. LEAD SCORE EXPLICÁVEL
-- ─────────────────────────────────────────────────────────────────────
-- `leads.lead_score` já existia e já ordena a fila do Modo Foco, mas o único
-- ponto do sistema que escrevia nele era o webhook do Resend somando pontos
-- por abertura de e-mail. Na prática a fila vinha ordenada por zero.
--
-- O número sozinho também não serve: "87" não diz o que fazer. Guardamos o
-- detalhe do cálculo para a tela poder mostrar de onde veio cada ponto e o
-- que está pesando contra.

alter table public.leads
  add column if not exists lead_score_detalhe jsonb not null default '{}'::jsonb,
  add column if not exists lead_score_atualizado_em timestamptz;

-- A fila do Foco e o Kanban ordenam por score desc; sem índice isso é
-- seq scan a cada abertura de tela.
create index if not exists leads_score_idx on public.leads (lead_score desc nulls last);

-- A função que agrega os sinais do score vem mais abaixo, depois de
-- crm_anexos: ela lê aquela tabela, e função SQL é validada na criação.

-- ─────────────────────────────────────────────────────────────────────
-- 2. ANEXOS / DOCUMENTOS
-- ─────────────────────────────────────────────────────────────────────
-- No financiamento direto quem analisa o crédito é o corretor, não o banco.
-- RG, CPF, comprovante de renda e certidão são o gargalo da venda e hoje
-- vivem no WhatsApp.
--
-- O bucket é PRIVADO de propósito. `midias` (fotos de empreendimento) é
-- público porque o site consome; documento pessoal de comprador não pode
-- ficar atrás de uma URL adivinhável. O acesso sai por signed URL de curta
-- duração emitida pelo backend depois de checar a sessão de admin.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documentos',
  'documentos',
  false,
  31457280, -- 30 MB, mesmo teto que o Habitus usa para documento
  array[
    'application/pdf',
    'image/jpeg', 'image/png', 'image/webp', 'image/heic',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Sem policy em storage.objects para este bucket: igual ao resto do projeto,
-- ausência de policy com RLS ligado significa service_role apenas.

create table if not exists public.crm_anexos (
  "id" uuid primary key default gen_random_uuid(),
  "lead_id" uuid references public.leads(id) on delete cascade,
  "proposta_id" uuid references public.crm_propostas(id) on delete cascade,
  "admin_id" uuid references public.admin_users(id) on delete set null,
  "tipo" text not null default 'outro',
  "nome_arquivo" text not null,
  "storage_path" text not null,
  "mime_type" text,
  "tamanho_bytes" bigint,
  "observacao" text,
  "created_at" timestamptz not null default now(),
  -- Um anexo sem dono não aparece em lugar nenhum e vira lixo pago no
  -- Storage; exigimos vínculo com lead ou com proposta.
  constraint crm_anexos_vinculo_check check (lead_id is not null or proposta_id is not null),
  constraint crm_anexos_tipo_check check (tipo in (
    'documento_identidade', 'cpf', 'comprovante_renda', 'comprovante_residencia',
    'certidao', 'contrato', 'comprovante_pagamento', 'proposta_assinada', 'outro'
  )),
  constraint crm_anexos_tamanho_check check (tamanho_bytes is null or tamanho_bytes >= 0)
);

create index if not exists crm_anexos_lead_idx on public.crm_anexos (lead_id, created_at desc);
create index if not exists crm_anexos_proposta_idx on public.crm_anexos (proposta_id, created_at desc);
-- Mesmo arquivo não pode ser catalogado duas vezes apontando para o mesmo
-- objeto no Storage — senão excluir um deixa o outro apontando para o vazio.
create unique index if not exists crm_anexos_storage_path_unique on public.crm_anexos (storage_path);

alter table public.crm_anexos enable row level security;

-- ─────────────────────────────────────────────────────────────────────
-- 1b. SINAIS DO LEAD SCORE (depende de crm_anexos, logo vem aqui)
-- ─────────────────────────────────────────────────────────────────────
-- Sinais agregados por lead em UMA query, para o motor de score em TypeScript
-- não precisar de um round-trip por lead. Devolve jsonb indexado por lead_id.
create or replace function public.sinais_lead_score(p_lead_ids uuid[])
returns jsonb
language sql
stable
set search_path to 'public', 'pg_temp'
as $function$
  with alvo as (
    select unnest(p_lead_ids) as lead_id
  ),
  interacoes as (
    select lead_id,
           count(*) as total,
           count(*) filter (where created_at > now() - interval '30 days') as ultimos_30d,
           max(created_at) as ultima
    from leads_interacoes
    where lead_id = any(p_lead_ids)
    group by lead_id
  ),
  eventos as (
    select lead_id,
           count(*) as total,
           count(*) filter (where action_type in ('contato_confirmado', 'proposta_enviada', 'visita_agendada')) as comerciais
    from crm_focus_events
    where lead_id = any(p_lead_ids)
    group by lead_id
  ),
  simulacoes as (
    select lead_id, count(*) as total
    from crm_simulacoes
    where lead_id = any(p_lead_ids)
    group by lead_id
  ),
  propostas as (
    select lead_id, count(*) as total
    from crm_propostas
    where lead_id = any(p_lead_ids)
    group by lead_id
  ),
  anexos as (
    select lead_id, count(*) as total
    from crm_anexos
    where lead_id = any(p_lead_ids)
    group by lead_id
  ),
  visitas as (
    select lead_id, count(*) as total
    from crm_agenda
    where lead_id = any(p_lead_ids) and tipo = 'visita' and status = 'concluido'
    group by lead_id
  )
  select coalesce(
    jsonb_object_agg(
      alvo.lead_id::text,
      jsonb_build_object(
        'interacoes_total',   coalesce(interacoes.total, 0),
        'interacoes_30d',     coalesce(interacoes.ultimos_30d, 0),
        'ultima_interacao',   interacoes.ultima,
        'eventos_total',      coalesce(eventos.total, 0),
        'eventos_comerciais', coalesce(eventos.comerciais, 0),
        'simulacoes',         coalesce(simulacoes.total, 0),
        'propostas',          coalesce(propostas.total, 0),
        'anexos',             coalesce(anexos.total, 0),
        'visitas_realizadas', coalesce(visitas.total, 0)
      )
    ),
    '{}'::jsonb
  )
  from alvo
  left join interacoes on interacoes.lead_id = alvo.lead_id
  left join eventos    on eventos.lead_id    = alvo.lead_id
  left join simulacoes on simulacoes.lead_id = alvo.lead_id
  left join propostas  on propostas.lead_id  = alvo.lead_id
  left join anexos     on anexos.lead_id     = alvo.lead_id
  left join visitas    on visitas.lead_id    = alvo.lead_id;
$function$;

revoke all on function public.sinais_lead_score(uuid[]) from public, anon, authenticated;
grant execute on function public.sinais_lead_score(uuid[]) to service_role;

-- ─────────────────────────────────────────────────────────────────────
-- 3. FINANCEIRO FORA DO localStorage
-- ─────────────────────────────────────────────────────────────────────
-- /dashboard/financeiro guardava `propostas_local` e `cub_historico` no
-- navegador. Trocar de aparelho ou limpar cache apagava o financeiro inteiro,
-- e os valores nunca batiam com as propostas reais do banco.
--
-- `recebido` e `a_receber` já existiam no formato que a tela manipula; só
-- nunca tiveram coluna. O histórico de CUB não precisa de tabela nova:
-- `configuracoes_cub` já existe e já tem rota.

alter table public.crm_propostas
  add column if not exists valor_recebido numeric(14,2) not null default 0,
  add column if not exists valor_a_receber numeric(14,2) not null default 0,
  -- A data da venda é a competência do fluxo de caixa e não é o mesmo que
  -- `created_at` (venda antiga pode ser cadastrada hoje).
  add column if not exists data_venda date,
  -- Venda lançada direto no Financeiro (histórico antigo, cliente que nunca
  -- passou pelo CRM) precisa de um nome. A alternativa seria criar um lead
  -- fantasma por venda antiga só para ter onde pendurar o nome, o que
  -- poluiria o funil e as métricas de conversão.
  add column if not exists cliente_nome text;

alter table public.crm_propostas
  drop constraint if exists crm_propostas_valores_recebimento_check;
alter table public.crm_propostas
  add constraint crm_propostas_valores_recebimento_check
  check (valor_recebido >= 0 and valor_a_receber >= 0);

create index if not exists crm_propostas_data_venda_idx
  on public.crm_propostas (data_venda desc nulls last) where (status = 'aceita');

-- ─────────────────────────────────────────────────────────────────────
-- 4. COMISSÃO PARCELADA
-- ─────────────────────────────────────────────────────────────────────
-- `crm_comissoes` trata a comissão como valor único com uma data de
-- recebimento. No financiamento direto ela quase nunca cai de uma vez: sai
-- por etapa (assinatura, entrada quitada, N parcelas pagas). Sem isso não dá
-- para responder "quanto eu tenho a receber nos próximos 90 dias".

create table if not exists public.crm_comissao_parcelas (
  "id" uuid primary key default gen_random_uuid(),
  "comissao_id" uuid not null references public.crm_comissoes(id) on delete cascade,
  "numero" integer not null,
  "descricao" text,
  "valor" numeric(14,2) not null,
  "data_prevista" date not null,
  "data_pagamento" date,
  "status" text not null default 'prevista',
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint crm_comissao_parcelas_status_check check (status in ('prevista', 'recebida', 'cancelada')),
  constraint crm_comissao_parcelas_valor_check check (valor > 0),
  constraint crm_comissao_parcelas_numero_check check (numero > 0),
  constraint crm_comissao_parcelas_unica unique (comissao_id, numero)
);

create index if not exists crm_comissao_parcelas_previsao_idx
  on public.crm_comissao_parcelas (data_prevista) where (status = 'prevista');
create index if not exists crm_comissao_parcelas_comissao_idx
  on public.crm_comissao_parcelas (comissao_id, numero);

alter table public.crm_comissao_parcelas enable row level security;

-- ─────────────────────────────────────────────────────────────────────
-- 5. LEADS PARADOS E TEMPO ENTRE MOVIMENTAÇÕES
-- ─────────────────────────────────────────────────────────────────────
-- Os dois relatórios que o Habitus mais destaca. Aqui saem de graça: o
-- sistema já grava toda movimentação em leads_interacoes e crm_focus_events.
--
-- "Movimentação" = qualquer registro na timeline do lead. Não usamos
-- leads.updated_at porque ele muda em edição de campo (corrigir um telefone
-- não é trabalhar o lead) e faria o relatório mentir para melhor.

create or replace function public.leads_parados(p_dias_min integer default 3, p_limite integer default 50)
returns table (
  lead_id uuid,
  nome text,
  whatsapp text,
  estagio_funil text,
  origem text,
  lead_score integer,
  ultima_movimentacao timestamptz,
  dias_parado integer
)
language sql
stable
set search_path to 'public', 'pg_temp'
as $function$
  with movimentos as (
    select lead_id, max(created_at) as ultima from leads_interacoes group by lead_id
    union all
    select lead_id, max(created_at) as ultima from crm_focus_events group by lead_id
  ),
  consolidado as (
    select lead_id, max(ultima) as ultima from movimentos group by lead_id
  )
  select
    l.id,
    l.nome,
    l.whatsapp,
    l.estagio_funil,
    l.origem,
    coalesce(l.lead_score, 0),
    coalesce(c.ultima, l.created_at) as ultima_movimentacao,
    -- Truncado para dia inteiro: "parado há 4 dias" e não "há 3,7 dias".
    floor(extract(epoch from (now() - coalesce(c.ultima, l.created_at))) / 86400)::int as dias_parado
  from leads l
  left join consolidado c on c.lead_id = l.id
  -- Lead fechado ou perdido não está parado, está encerrado. Os valores são
  -- exatamente os de leads_estagio_funil_check e leads_status_check —
  -- conferidos contra o banco, não supostos.
  where coalesce(l.estagio_funil, '') not in ('fechado', 'perdido')
    and coalesce(l.status, '') not in ('perdido', 'convertido')
    and coalesce(c.ultima, l.created_at) < now() - make_interval(days => greatest(p_dias_min, 0))
  order by coalesce(c.ultima, l.created_at) asc
  limit greatest(p_limite, 1);
$function$;

revoke all on function public.leads_parados(integer, integer) from public, anon, authenticated;
grant execute on function public.leads_parados(integer, integer) to service_role;

-- Tempo médio entre uma movimentação e a seguinte, por lead. Responde
-- "quanto tempo eu levo para dar o próximo passo neste lead".
create or replace function public.tempo_medio_movimentacoes(p_de date, p_ate date, p_limite integer default 50)
returns table (
  lead_id uuid,
  nome text,
  whatsapp text,
  estagio_funil text,
  movimentacoes bigint,
  media_horas numeric
)
language sql
stable
set search_path to 'public', 'pg_temp'
as $function$
  with limites as (
    select
      (p_de::timestamp at time zone 'America/Sao_Paulo') as ini,
      ((p_ate + 1)::timestamp at time zone 'America/Sao_Paulo') as fim
  ),
  movimentos as (
    select li.lead_id, li.created_at from leads_interacoes li, limites
      where li.created_at >= limites.ini and li.created_at < limites.fim
    union all
    select fe.lead_id, fe.created_at from crm_focus_events fe, limites
      where fe.created_at >= limites.ini and fe.created_at < limites.fim
  ),
  intervalos as (
    select
      lead_id,
      created_at,
      lag(created_at) over (partition by lead_id order by created_at) as anterior
    from movimentos
  )
  select
    l.id,
    l.nome,
    l.whatsapp,
    l.estagio_funil,
    count(i.anterior) + 1 as movimentacoes,
    -- Só intervalos entre dois pontos contam; um lead com uma única
    -- movimentação não tem "tempo médio" e sai com NULL, não com zero.
    round((avg(extract(epoch from (i.created_at - i.anterior))) / 3600)::numeric, 1) as media_horas
  from intervalos i
  join leads l on l.id = i.lead_id
  group by l.id, l.nome, l.whatsapp, l.estagio_funil
  having count(i.anterior) > 0
  order by media_horas desc nulls last
  limit greatest(p_limite, 1);
$function$;

revoke all on function public.tempo_medio_movimentacoes(date, date, integer) from public, anon, authenticated;
grant execute on function public.tempo_medio_movimentacoes(date, date, integer) to service_role;

-- ─────────────────────────────────────────────────────────────────────
-- 7. ALVO DE SLA DO PRIMEIRO ATENDIMENTO
-- ─────────────────────────────────────────────────────────────────────
-- `leads.primeiro_atendimento_em` e `alerta_sem_atendimento` já existiam sem
-- ninguém definir contra qual prazo comparar. A coluna mora em
-- crm_metas_diarias porque é exatamente o que aquela tabela guarda: o alvo
-- de rotina do corretor, uma linha por admin.

alter table public.crm_metas_diarias
  add column if not exists sla_primeiro_atendimento_min integer not null default 15;

alter table public.crm_metas_diarias
  drop constraint if exists crm_metas_diarias_sla_check;
alter table public.crm_metas_diarias
  add constraint crm_metas_diarias_sla_check
  check (sla_primeiro_atendimento_min > 0 and sla_primeiro_atendimento_min <= 1440);

-- ─────────────────────────────────────────────────────────────────────
-- 9. VGV, TICKET MÉDIO E CONVERSÃO POR ORIGEM
-- ─────────────────────────────────────────────────────────────────────
-- A linguagem que incorporadora fala. `data_venda` quando preenchida vence
-- `created_at`, porque venda antiga cadastrada hoje pertence ao mês em que
-- aconteceu.

create or replace function public.relatorio_vendas(p_de date, p_ate date)
returns jsonb
language sql
stable
set search_path to 'public', 'pg_temp'
as $function$
  with limites as (
    select
      (p_de::timestamp at time zone 'America/Sao_Paulo') as ini,
      ((p_ate + 1)::timestamp at time zone 'America/Sao_Paulo') as fim
  ),
  -- VISÃO DE CAIXA: vendas fechadas DENTRO do período. `data_venda` quando
  -- preenchida vence `created_at`, porque venda antiga cadastrada hoje
  -- pertence ao mês em que aconteceu.
  vendas as (
    select p.* from crm_propostas p, limites
    where p.status = 'aceita'
      and coalesce((p.data_venda::timestamp at time zone 'America/Sao_Paulo'), p.created_at) >= limites.ini
      and coalesce((p.data_venda::timestamp at time zone 'America/Sao_Paulo'), p.created_at) < limites.fim
  ),
  -- VISÃO DE INVESTIMENTO: a coorte de leads captada no período.
  leads_periodo as (
    select l.* from leads l, limites
    where l.created_at >= limites.ini and l.created_at < limites.fim
  ),
  -- A venda da coorte conta INDEPENDENTEMENTE de quando aconteceu.
  --
  -- A primeira versão cruzava "venda no período" com "lead criado no
  -- período", e no financiamento direto o ciclo é longo: capta em março,
  -- fecha em julho. Verificado contra dados reais no descartável — um lead
  -- captado em 19/06 que vendeu em 26/07 dava conversão ZERO nos dois meses.
  -- A métrica ficaria ~0 para sempre e não serviria para decidir mídia.
  coorte as (
    select lp.id, lp.origem,
           max(p.valor_proposto) as valor_venda,
           count(p.id) filter (where p.status = 'aceita') as vendas
    from leads_periodo lp
    left join crm_propostas p on p.lead_id = lp.id and p.status = 'aceita'
    group by lp.id, lp.origem
  )
  select jsonb_build_object(
    -- Caixa
    'vgv_total',      coalesce((select sum(valor_proposto) from vendas), 0),
    'vendas',         (select count(*) from vendas),
    'ticket_medio',   coalesce((select avg(valor_proposto) from vendas), 0),
    'entradas_total', coalesce((select sum(coalesce(valor_entrada, 0)) from vendas), 0),
    'recebido',       coalesce((select sum(valor_recebido) from vendas), 0),
    'a_receber',      coalesce((select sum(valor_a_receber) from vendas), 0),
    -- Coorte
    'leads_periodo',  (select count(*) from leads_periodo),
    'vendas_coorte',  (select count(*) from coorte where vendas > 0),
    'vgv_coorte',     coalesce((select sum(valor_venda) from coorte where vendas > 0), 0),
    'conversao_geral', case
      when (select count(*) from coorte) = 0 then 0
      else round((select count(*) from coorte where vendas > 0)::numeric * 100
                 / (select count(*) from coorte), 1)
    end,
    'por_origem', coalesce((
      select jsonb_agg(x order by x->>'origem')
      from (
        select jsonb_build_object(
          'origem', coalesce(origem, 'sem_origem'),
          'leads', count(*),
          'vendas', count(*) filter (where vendas > 0),
          'vgv', coalesce(sum(valor_venda) filter (where vendas > 0), 0),
          'conversao', round(count(*) filter (where vendas > 0)::numeric * 100 / count(*), 1)
        ) as x
        from coorte group by coalesce(origem, 'sem_origem')
      ) s
    ), '[]'::jsonb),
    'funil', coalesce((
      select jsonb_agg(x order by x->>'estagio')
      from (
        select jsonb_build_object('estagio', coalesce(estagio_funil, 'sem_estagio'), 'leads', count(*)) as x
        from leads_periodo group by coalesce(estagio_funil, 'sem_estagio')
      ) s
    ), '[]'::jsonb)
  );
$function$;

revoke all on function public.relatorio_vendas(date, date) from public, anon, authenticated;
grant execute on function public.relatorio_vendas(date, date) to service_role;

-- ─────────────────────────────────────────────────────────────────────
-- 10. META MENSAL DE VGV + HISTÓRICO DIÁRIO PARA O CALENDÁRIO
-- ─────────────────────────────────────────────────────────────────────

create table if not exists public.crm_metas_mensais (
  "id" uuid primary key default gen_random_uuid(),
  "admin_id" uuid not null references public.admin_users(id) on delete cascade,
  -- Sempre dia 1: a competência é o mês, e permitir 15/07 e 01/07 na mesma
  -- tabela criaria duas metas para julho.
  "competencia" date not null,
  "meta_vgv" numeric(14,2) not null default 0,
  "meta_vendas" integer not null default 0,
  "meta_propostas" integer not null default 0,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint crm_metas_mensais_unica unique (admin_id, competencia),
  constraint crm_metas_mensais_dia1_check check (extract(day from competencia) = 1),
  constraint crm_metas_mensais_nao_negativas check (meta_vgv >= 0 and meta_vendas >= 0 and meta_propostas >= 0)
);

alter table public.crm_metas_mensais enable row level security;

-- Calendário de metas batidas.
--
-- O dia é SELADO na primeira leitura depois de encerrado, com a meta que
-- estava em vigor naquele dia. Sem isso, baixar a meta de 20 para 10
-- contatos pintaria de verde meses inteiros de dias que na época não foram
-- cumpridos — o histórico mudaria retroativamente e perderia a serventia.
-- O dia de hoje nunca é selado; ele continua sendo recalculado ao vivo.
create table if not exists public.crm_metas_dia_historico (
  "id" uuid primary key default gen_random_uuid(),
  "admin_id" uuid not null references public.admin_users(id) on delete cascade,
  "data" date not null,
  "metas" jsonb not null default '{}'::jsonb,
  "resumo" jsonb not null default '{}'::jsonb,
  "cumpridas" integer not null default 0,
  "total" integer not null default 0,
  "percentual" integer not null default 0,
  "dia_completo" boolean not null default false,
  "selado_em" timestamptz not null default now(),
  -- Colunas sem aspas de propósito: é como crm_atividades_manuais declara a
  -- mesma chave, e é a forma que a guarda de onConflict (upsert-indices.test)
  -- reconhece ao conferir se todo upsert tem unique TOTAL correspondente.
  constraint crm_metas_dia_historico_unica unique (admin_id, data),
  constraint crm_metas_dia_historico_faixas check (
    cumpridas >= 0 and total >= 0 and cumpridas <= total
    and percentual >= 0 and percentual <= 100
  )
);

create index if not exists crm_metas_dia_historico_admin_data_idx
  on public.crm_metas_dia_historico (admin_id, "data" desc);

alter table public.crm_metas_dia_historico enable row level security;

-- Mesma agregação de resumo_atividades_dia, mas para um intervalo inteiro em
-- uma query. Um mês de calendário são 31 dias; 31 round-trips por abertura de
-- tela seria absurdo.
create or replace function public.resumo_atividades_periodo(p_admin_id uuid, p_de date, p_ate date)
returns jsonb
language sql
stable
set search_path to 'public', 'pg_temp'
as $function$
  with dias as (
    select generate_series(p_de, p_ate, interval '1 day')::date as dia
  ),
  eventos as (
    select
      ((created_at at time zone 'America/Sao_Paulo')::date) as dia,
      action_type,
      count(*) as n
    from crm_focus_events
    where admin_id = p_admin_id
      and created_at >= (p_de::timestamp at time zone 'America/Sao_Paulo')
      and created_at < ((p_ate + 1)::timestamp at time zone 'America/Sao_Paulo')
    group by 1, 2
  ),
  visitas as (
    select ((updated_at at time zone 'America/Sao_Paulo')::date) as dia, count(*) as n
    from crm_agenda
    where admin_id = p_admin_id and tipo = 'visita' and status = 'concluido'
      and updated_at >= (p_de::timestamp at time zone 'America/Sao_Paulo')
      and updated_at < ((p_ate + 1)::timestamp at time zone 'America/Sao_Paulo')
    group by 1
  ),
  manuais as (
    select "data" as dia, tipo, sum(quantidade)::int as n
    from crm_atividades_manuais
    where admin_id = p_admin_id and "data" between p_de and p_ate
    group by 1, 2
  )
  select coalesce(
    jsonb_object_agg(
      to_char(dias.dia, 'YYYY-MM-DD'),
      jsonb_build_object(
        'novos_contatos', coalesce((select n from eventos where eventos.dia = dias.dia and action_type = 'contato_confirmado'), 0),
        'followups',      coalesce((select n from eventos where eventos.dia = dias.dia and action_type = 'followup_agendado'), 0),
        'visitas',        coalesce((select n from visitas where visitas.dia = dias.dia), 0),
        'conteudos',      coalesce((select n from manuais where manuais.dia = dias.dia and tipo = 'conteudo'), 0),
        'reunioes',       coalesce((select n from manuais where manuais.dia = dias.dia and tipo = 'reuniao_presencial'), 0)
      )
    ),
    '{}'::jsonb
  )
  from dias;
$function$;

revoke all on function public.resumo_atividades_periodo(uuid, date, date) from public, anon, authenticated;
grant execute on function public.resumo_atividades_periodo(uuid, date, date) to service_role;
