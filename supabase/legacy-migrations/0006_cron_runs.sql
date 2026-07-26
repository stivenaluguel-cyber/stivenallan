-- 0006_cron_runs.sql
-- Histórico persistente das execuções dos crons. Base pra dashboard de saúde/volume
-- ("quantos e-mails enviados nas últimas N runs, quantas skipped por qual motivo").
-- Fail-open: se essa tabela não existir, os crons continuam rodando (o helper
-- lib/cron/tracker.ts trata insert/update como best-effort).
-- Aditivo e idempotente — pode rodar em prod sem risco.

create table if not exists public.cron_runs (
  id uuid primary key default gen_random_uuid(),
  cron_name text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_ms integer,
  status text not null default 'running'
    check (status in ('running', 'ok', 'skipped', 'error')),
  motivo text,
  processados integer,
  enviados integer,
  pulados integer,
  erros_envio integer,
  details jsonb
);

comment on table public.cron_runs is
  'Histórico de execuções dos crons. Rows órfãs em status=running (sem ended_at) indicam crash entre start e finally.';

create index if not exists cron_runs_name_started_idx
  on public.cron_runs (cron_name, started_at desc);

create index if not exists cron_runs_status_idx
  on public.cron_runs (status);
