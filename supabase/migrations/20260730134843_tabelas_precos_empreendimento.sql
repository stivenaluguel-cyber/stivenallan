-- Tabela de preços em PDF, guardada por empreendimento.
--
-- Motivo: a Fontana retira os PDFs do Drive no meio do mês e publica a tabela
-- seguinte no lugar. Quem precisa conferir a condição passada ao cliente na
-- semana anterior fica sem o documento, e as unidades importadas no espelho não
-- guardam o papel que as originou.
--
-- A chave é o SLUG, não um id. O mesmo prédio tem linha em `properties` e em
-- `empreendimentos` com ids diferentes; o slug é a única coisa igual nas duas.
-- Uma FK aqui obrigaria a escolher uma das tabelas e quebraria na outra.

create table if not exists public.empreendimentos_tabelas_precos (
  id uuid primary key default gen_random_uuid(),
  empreendimento_slug text not null,
  -- Sempre o dia 1: a tabela vale o mês inteiro, guardar o dia duplicaria.
  competencia date not null,
  storage_path text not null,
  nome_arquivo text not null,
  tamanho_bytes integer,
  -- CUB impresso na tabela, para conferir contra configuracoes_cub na hora de
  -- importar as unidades.
  cub_valor_m2 numeric(12,2),
  observacao text,
  admin_id uuid references public.admin_users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Uma tabela por prédio por mês. Reenviar o mesmo mês substitui, em vez de
-- acumular versões que ninguém sabe distinguir.
create unique index if not exists empreendimentos_tabelas_precos_unica
  on public.empreendimentos_tabelas_precos (empreendimento_slug, competencia);

-- A leitura mais comum é "a tabela mais recente deste prédio".
create index if not exists empreendimentos_tabelas_precos_recente_idx
  on public.empreendimentos_tabelas_precos (empreendimento_slug, competencia desc);

-- Convenção do projeto: RLS ligado sem policy = acesso só pelo service_role.
alter table public.empreendimentos_tabelas_precos enable row level security;

comment on table public.empreendimentos_tabelas_precos is
  'PDF da tabela de preços vigente por empreendimento, chaveado por slug. Arquivo no bucket privado documentos/tabelas/.';
