-- 0005_leads_unsubscribe.sql
-- Opt-out 1-click LGPD-compliant via link assinado nos e-mails da régua.
-- O cron /api/cron/email-followup pula leads com unsubscribed_at IS NOT NULL.
-- Aditivo e idempotente — pode rodar em prod sem risco.

alter table public.leads
  add column if not exists unsubscribed_at timestamptz;

comment on column public.leads.unsubscribed_at is
  'Timestamp do opt-out via /api/unsubscribe. NULL = ativo. Cron da régua ignora rows não-NULL.';

-- Índice parcial: só leads ATIVOS entram — menor + mais rápido para o filtro do cron
create index if not exists leads_active_followup_idx
  on public.leads (email_followup_etapa)
  where unsubscribed_at is null;
