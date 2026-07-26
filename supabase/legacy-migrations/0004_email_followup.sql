-- 0004_email_followup.sql
-- Rastreio da régua de e-mail (D+2 e D+7) enviada pelo cron /api/cron/email-followup.
-- Rodar no SQL Editor do Supabase (idempotente), junto com 0002 e 0003.

alter table public.leads
  add column if not exists email_followup_etapa integer not null default 0,
  add column if not exists email_followup_em timestamptz;

comment on column public.leads.email_followup_etapa is 'Régua de e-mail: 0=nenhum, 1=D+2 enviado, 2=D+7 enviado (fim)';
comment on column public.leads.email_followup_em is 'Timestamp do último e-mail da régua enviado';
