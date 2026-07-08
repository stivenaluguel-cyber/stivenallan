-- 0002_leads_growth.sql
-- Fase 0 do plano de growth: qualificação do lead + rastreamento de origem de campanha.
-- Rodar no SQL Editor do Supabase (idempotente).

alter table public.leads
  add column if not exists faixa_investimento text,
  add column if not exists prazo_compra text,
  add column if not exists entrada_disponivel text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists gclid text,
  add column if not exists fbclid text;

comment on column public.leads.faixa_investimento is 'Qualificação: faixa de investimento declarada no formulário';
comment on column public.leads.prazo_compra is 'Qualificação: prazo de compra declarado no formulário';
comment on column public.leads.entrada_disponivel is 'Qualificação: entrada disponível declarada no formulário';

create index if not exists leads_utm_source_idx on public.leads (utm_source);
create index if not exists leads_utm_campaign_idx on public.leads (utm_campaign);
