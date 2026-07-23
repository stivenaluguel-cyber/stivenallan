-- 0016_configuracoes_cub.sql
-- Traz `configuracoes_cub` (já existe em produção, criada fora de controle
-- de versão numa sessão anterior) pra dentro das migrations rastreadas.
-- `create table if not exists` é um no-op em produção (a tabela já existe
-- com este schema exato, confirmado via information_schema antes de escrever
-- este arquivo) — serve só pra documentar o schema e permitir recriar em um
-- ambiente novo (staging, ou se o projeto for clonado).

create table if not exists public.configuracoes_cub (
  id uuid primary key default gen_random_uuid(),
  mes_referencia date not null,
  valor_m2 numeric not null,
  variacao_mensal numeric,
  variacao_anual numeric,
  fonte varchar default 'SINDUSCON-SC',
  notas text,
  atualizado_por uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists configuracoes_cub_mes_referencia_key
  on public.configuracoes_cub (mes_referencia);

comment on table public.configuracoes_cub is
  'Fonte única de verdade do CUB/SC vigente — Home, CRM e Financeiro leem TODOS a mesma linha via GET /api/admin/cub (ver src/lib/dashboard/cub-fonte-unica.ts). Nunca ler/formatar CUB fora desse caminho.';

-- ROLLBACK: drop table if exists public.configuracoes_cub;
-- (destrutivo — só rode se tiver certeza que quer perder o histórico de CUB)
