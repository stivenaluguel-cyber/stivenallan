-- ─────────────────────────────────────────────────────────────────────
-- As outras pessoas do negócio.
--
-- O lead tem UM telefone: o do comprador. Mas o negócio não anda só com
-- ele — anda com o correspondente da Caixa que analisa o crédito, com o
-- contato da construtora que libera a unidade, com o despachante do
-- cartório, com o cônjuge que assina junto. Hoje cada um desses vive numa
-- conversa solta do WhatsApp, e achar o número certo na hora de destravar
-- o negócio é caçar no histórico de conversas.
--
-- Uma tabela por lead, e não um campo de texto, porque o que se quer é
-- discar: nome, papel e número em campos separados montam o link do
-- WhatsApp; num campo livre viraria texto que ninguém consegue clicar.
-- ─────────────────────────────────────────────────────────────────────

create table public.crm_lead_envolvidos (
  "id" uuid primary key default gen_random_uuid(),
  "lead_id" uuid not null references public.leads(id) on delete cascade,
  "nome" text not null,
  "papel" text not null,
  -- Só dígitos, com DDD. A tela normaliza antes de gravar; guardar
  -- "(48) 99999-9999" obrigaria a limpar de novo a cada montagem de link.
  "whatsapp" text,
  "email" text,
  "observacoes" text,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint crm_lead_envolvidos_papel_check check (
    papel in ('construtora', 'correspondente', 'despachante', 'advogado', 'conjuge', 'familiar', 'parceiro', 'outro')
  ),
  constraint crm_lead_envolvidos_nome_check check (length(btrim(nome)) > 0),
  constraint crm_lead_envolvidos_whatsapp_check check (
    whatsapp is null or whatsapp ~ '^[0-9]{10,13}$'
  )
);

create index crm_lead_envolvidos_lead_idx on public.crm_lead_envolvidos (lead_id, created_at);

alter table public.crm_lead_envolvidos enable row level security;
