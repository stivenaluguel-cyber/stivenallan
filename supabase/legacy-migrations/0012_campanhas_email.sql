-- Campanhas de e-mail avulsas (diferente da régua automática por lead em
-- automacao_email_passos). Usa a mesma infraestrutura de envio (Resend) e
-- reaproveita a supressão de e-mail já existente (leads.unsubscribed_at).

-- Distingue "descadastro manual" de "bounce/reclamação" — mesmo filtro
-- .is('unsubscribed_at', null) continua funcionando sem mudança, isso é só
-- pra permitir reportar/entender o motivo depois.
alter table leads add column if not exists unsubscribe_motivo text;

create table campanhas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  assunto text not null,
  corpo_html text not null,
  segmento jsonb not null,
  status text not null default 'rascunho',
  criado_em timestamptz not null default now(),
  enviada_em timestamptz
);

-- Público congelado no momento do envio (não reavaliado depois). status
-- 'pendente' permite retomar um envio interrompido (timeout de função
-- serverless) sem duplicar quem já recebeu.
create table campanha_destinatarios (
  id uuid primary key default gen_random_uuid(),
  campanha_id uuid not null references campanhas(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade,
  email text not null,
  resend_message_id text,
  status text not null default 'pendente',
  enviado_em timestamptz
);

-- Log de engajamento (append-only, mesmo padrão de interacoes/leads_interacoes).
-- on delete cascade em lead_id: se o lead pedir exclusão (LGPD Art.18), o
-- rastro de campanha some junto — não guardar e-mail solto após erasure.
create table campanha_eventos (
  id uuid primary key default gen_random_uuid(),
  campanha_id uuid not null references campanhas(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade,
  tipo text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists campanha_destinatarios_campanha_idx on campanha_destinatarios(campanha_id, status);
create index if not exists campanha_destinatarios_message_idx on campanha_destinatarios(resend_message_id);
create index if not exists campanha_eventos_campanha_idx on campanha_eventos(campanha_id);
