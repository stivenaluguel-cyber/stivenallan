-- Modo Foco: fila priorizada de atendimento sequencial no CRM (inspirada em
-- fluxos "swipe" de CRM, adaptada à identidade e ao schema deste projeto).
--
-- Duas tabelas novas, sem duplicar nada que já existe:
--   crm_focus_sessions — uma sessão de atendimento (quando começou/terminou,
--   quantos leads tinha a fila, contadores agregados e os filtros usados).
--   crm_focus_events — o log auditável de cada ação tomada dentro de uma
--   sessão (pular, perdido, follow-up agendado, visita, mudança de etapa...),
--   com pontuação e uma idempotency_key única para garantir que um clique
--   duplo (ou um retry de rede) nunca é contado/pontuado duas vezes.
--
-- Não recriamos timeline/agenda/kanban: a mudança real de estágio continua
-- passando por leads.estagio_funil + leads_interacoes (via
-- registrarMudancaEstagio, compartilhado com a rota PATCH existente), e
-- follow-up/visita continuam sendo linhas normais em crm_agenda. Aqui só
-- registramos QUE uma ação de Modo Foco aconteceu, para o resumo da sessão
-- e para auditoria — a fonte de verdade de cada dado continua sendo a
-- tabela original.

create table if not exists crm_focus_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references admin_users(id) on delete set null,
  status text not null default 'ativa' check (status in ('ativa', 'concluida', 'abandonada')),
  filtros jsonb not null default '{}',
  total_leads int not null default 0,
  processed_leads int not null default 0,
  skipped_leads int not null default 0,
  earned_points int not null default 0,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Uma sessão "ativa" por corretor é o que permite retomar o Modo Foco após
-- fechar a aba ou recarregar a página (a rota GET busca por essa condição).
create index if not exists crm_focus_sessions_admin_ativa_idx
  on crm_focus_sessions (admin_id, status)
  where status = 'ativa';

create table if not exists crm_focus_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references crm_focus_sessions(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  admin_id uuid references admin_users(id) on delete set null,
  action_type text not null check (action_type in (
    'pular', 'perdido', 'followup_agendado', 'visita_agendada',
    'visita_concluida', 'visita_nao_ocorreu', 'contato_confirmado',
    'anotacao', 'etapa_alterada', 'proposta_enviada'
  )),
  previous_stage text,
  next_stage text,
  points int not null default 0,
  metadata jsonb not null default '{}',
  -- Determinística: "{session_id}:{lead_id}:{action_type}" — dentro de uma
  -- mesma sessão, uma ação sobre um lead só é contada (e pontuada) uma vez.
  -- Um clique duplo ou um retry de rede colide no unique index abaixo e a
  -- rota trata isso como sucesso idempotente, sem inserir de novo.
  idempotency_key text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists crm_focus_events_idempotency_key_unique
  on crm_focus_events (idempotency_key);

create index if not exists crm_focus_events_session_idx on crm_focus_events (session_id);
create index if not exists crm_focus_events_lead_idx on crm_focus_events (lead_id);

-- Suporta o tier "follow-up vencido" da fila priorizada do Modo Foco
-- (leads.proximo_followup < now()) sem varrer a tabela inteira.
create index if not exists leads_proximo_followup_idx
  on leads (proximo_followup)
  where proximo_followup is not null;

-- Mesmo padrao das tabelas irmas do CRM (crm_agenda, crm_propostas, leads,
-- leads_interacoes): RLS habilitado sem policies. O acesso de leitura/escrita
-- continua 100% via service_role (rotas /api/admin/*), que sempre contorna
-- RLS — isso apenas fecha a mesma brecha que essas tabelas ja fecham, caso
-- algum codigo futuro chegue a consultar com a anon key.
-- (Aplicado em produção via uma segunda chamada separada "modo_foco_rls" no
-- momento original — incorporado aqui para que a migration versionada
-- reflita integralmente o que existe hoje no banco.)
alter table crm_focus_sessions enable row level security;
alter table crm_focus_events enable row level security;
