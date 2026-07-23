-- 0018_empreendimentos_unidades_completo.sql
-- Traz `empreendimentos_unidades` pra dentro do controle de versão (mesma
-- situação de `configuracoes_cub` na migration 0016: a tabela já existe em
-- produção, criada fora de uma migration rastreada numa sessão anterior).
-- `create table if not exists` é um no-op em produção — o schema abaixo
-- reflete exatamente as colunas já confirmadas existirem (via
-- information_schema.columns) antes de escrever este arquivo.
--
-- Além disso, adiciona as colunas que estavam faltando pro pedido de
-- disponibilidade granular por unidade:
--   - vagas: quantidade de vagas de garagem da unidade (hoje só existe a
--     nível de tipologia/empreendimento, não por unidade individual).
--   - data_tabela: data em que a construtora publicou aquela tabela de
--     preços — DIFERENTE de `updated_at`, que é só a última vez que a LINHA
--     foi editada no nosso banco (pode ter sido editada hoje mesmo com uma
--     tabela de preços de 3 meses atrás).
--   - situacao: substitui o booleano `disponivel` (disponível/vendida) por
--     um enum textual com mais granularidade (reservada, bloqueada,
--     indisponível), necessário pro CRM distinguir "nunca importei essa
--     unidade" de "está reservada/vendida".

create table if not exists public.empreendimentos_unidades (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references public.properties(id) on delete cascade,
  bloco text,
  unidade text not null,
  andar smallint,
  metragem numeric,
  dormitorios smallint,
  suites smallint,
  orientacao text,
  valor_tabela numeric,
  valor_promocional numeric,
  valor_entrada_min numeric,
  disponivel boolean not null default true,
  reservado_ate timestamptz,
  lead_id_reserva uuid references public.leads(id) on delete set null,
  condicoes_negociacao text,
  cub_fator numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Colunas novas pedidas nesta rodada (aditivo, sem tocar no que já existe).
alter table public.empreendimentos_unidades add column if not exists vagas smallint;
alter table public.empreendimentos_unidades add column if not exists data_tabela date;
alter table public.empreendimentos_unidades add column if not exists situacao text not null default 'disponivel';

alter table public.empreendimentos_unidades drop constraint if exists empreendimentos_unidades_situacao_check;
alter table public.empreendimentos_unidades add constraint empreendimentos_unidades_situacao_check
  check (situacao in ('disponivel', 'reservada', 'vendida', 'bloqueada', 'indisponivel'));

-- Migra o booleano antigo `disponivel` pra `situacao`. Só toca linhas que
-- ainda estão no default recém-criado ('disponivel') — como a coluna é nova
-- nesta mesma migration, isso roda exatamente uma vez (não há como uma linha
-- já ter `situacao` diferente do default antes deste ALTER rodar).
update public.empreendimentos_unidades
  set situacao = case when disponivel = false then 'vendida' else 'disponivel' end
  where situacao = 'disponivel';

-- NÃO removemos `disponivel` — mantida por compatibilidade com código/
-- integrações antigas. Código novo deve ler/escrever `situacao` como fonte
-- de verdade (ver src/app/api/admin/unidades/route.ts e crm-view.tsx).

comment on table public.empreendimentos_unidades is
  'Unidades individuais de cada empreendimento (disponibilidade granular). `situacao` é a fonte de verdade desde a migration 0018; `disponivel` (boolean) fica só por compatibilidade.';

-- ROLLBACK:
--   alter table public.empreendimentos_unidades drop constraint if exists empreendimentos_unidades_situacao_check;
--   alter table public.empreendimentos_unidades drop column if exists situacao;
--   alter table public.empreendimentos_unidades drop column if exists data_tabela;
--   alter table public.empreendimentos_unidades drop column if exists vagas;
-- (não reverta o `create table` — a tabela já existia em produção antes
-- desta migration; um rollback completo dela não é seguro de automatizar
-- aqui.)
