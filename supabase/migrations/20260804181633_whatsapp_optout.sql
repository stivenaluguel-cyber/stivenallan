-- Opt-out de WhatsApp por palavra-chave (PARAR/STOP/SAIR/...).
-- Campo dedicado — NÃO reaproveita leads.unsubscribed_at, que é
-- exclusivamente do fluxo de e-mail (Resend, campanhas, /api/unsubscribe).
-- Um opt-out de WhatsApp não pode silenciar campanhas de e-mail e vice-versa.

alter table public.leads
  add column if not exists whatsapp_optout_at timestamp with time zone,
  add column if not exists whatsapp_optout_motivo text;
