-- ROLLBACK REVISADO da migration 20260728041224_modo_foco_v2_sessao_persistente
--
-- ⚠️ NÃO EXECUTADO. Documento de contingência.
-- Execute apenas se a V2 precisar ser revertida DEPOIS de já aplicada.
--
-- ─────────────────────────────────────────────────────────────────────
-- O QUE SE PERDE (leia antes de rodar)
-- ─────────────────────────────────────────────────────────────────────
--
-- PERDA DEFINITIVA DE DADOS:
--
-- 1. `crm_focus_session_leads` inteira — o snapshot de quais leads
--    pertenciam a cada sessão, em que posição, com que status
--    (pendente/processado/pulado/adiado) e com que `snoozed_until`.
--    Consequência prática: sessões em andamento perdem a fila; leads
--    "adiados" perdem a data de retorno e voltam a aparecer
--    normalmente. NÃO é reconstituível a partir de crm_focus_events
--    (os eventos só registram o que foi feito, não o que estava
--    pendente nem em que ordem).
--
-- 2. `crm_propostas.client_event_id` — chaves de idempotência das
--    propostas. Perder isso não apaga proposta nenhuma, mas um retry
--    posterior de uma criação antiga deixaria de ser reconhecido como
--    repetição e poderia gerar proposta duplicada.
--
-- 3. `leads_interacoes.client_event_id` — idem para anotações.
--    As anotações em si (linhas de leads_interacoes) PERMANECEM.
--
-- 4. Eventos com action_type = 'adiado' passam a violar o CHECK
--    constraint restaurado. Por isso o passo 5 abaixo os remove
--    explicitamente — sem isso, o ALTER TABLE falha. Esses eventos
--    (e os pontos que geraram) somem do histórico.
--
-- NÃO SE PERDE:
--   • crm_focus_sessions e crm_focus_events (exceto os 'adiado')
--   • propostas já criadas, com seus números
--   • anotações, agenda, leads — nada é tocado
--
-- ATENÇÃO — a numeração de propostas: ao remover o DEFAULT de `numero`,
-- a coluna volta a ser NOT NULL sem default. O código da V2 não envia
-- `numero` (conta com o default), então criar proposta volta a falhar
-- como falhava antes. Por isso o rollback do BANCO só é seguro junto
-- com o rollback do CÓDIGO (revert do commit da V2).
--
-- ─────────────────────────────────────────────────────────────────────

begin;

-- 1. Funções novas (nenhuma outra coisa depende delas)
drop function if exists public.advance_focus_session_lead(uuid, uuid, uuid, text, text, text, integer, jsonb, uuid, boolean, boolean, text, timestamptz);
drop function if exists public.start_focus_session(uuid, jsonb, uuid[]);
drop function if exists public.sum_focus_points_month(uuid);

-- 2. Snapshot da fila (PERDA DE DADOS — ver nota 1 acima)
drop table if exists public.crm_focus_session_leads;

-- 3. Índice único de sessão ativa → volta ao índice não-único original.
--    ⚠️ Se existirem DUAS sessões 'ativa' para o mesmo admin depois
--    disso, nada mais impede — era exatamente o bug que a V2 corrigiu.
drop index if exists public.crm_focus_sessions_admin_ativa_unique;
create index if not exists crm_focus_sessions_admin_ativa_idx
  on public.crm_focus_sessions (admin_id, status) where (status = 'ativa');

-- 4. Propostas: numeração e idempotência
drop index if exists public.crm_propostas_client_event_unique;
drop index if exists public.crm_propostas_numero_unique;
drop index if exists public.crm_propostas_lead_idx;
alter table public.crm_propostas drop column if exists client_event_id;
alter table public.crm_propostas alter column numero drop default;
drop sequence if exists public.crm_propostas_numero_seq;

-- 5. Ação 'adiado' deixa de existir. Os eventos precisam sair ANTES do
--    CHECK ser restaurado, senão o ALTER falha. (PERDA DE DADOS)
--    Confira o impacto antes:
--      select count(*) from crm_focus_events where action_type = 'adiado';
delete from public.crm_focus_events where action_type = 'adiado';

alter table public.crm_focus_events drop constraint if exists crm_focus_events_action_type_check;
alter table public.crm_focus_events add constraint crm_focus_events_action_type_check
  check (action_type = any (array[
    'pular', 'perdido', 'followup_agendado', 'visita_agendada',
    'visita_concluida', 'visita_nao_ocorreu', 'contato_confirmado',
    'anotacao', 'etapa_alterada', 'proposta_enviada'
  ]));

-- 6. Anotações: só a chave de idempotência sai; as anotações ficam.
drop index if exists public.leads_interacoes_client_event_unique;
drop index if exists public.leads_interacoes_lead_created_idx;
alter table public.leads_interacoes drop column if exists client_event_id;

commit;

-- Verificação pós-rollback:
--   select to_regclass('public.crm_focus_session_leads');            -- deve ser null
--   select count(*) from pg_proc where proname in
--     ('start_focus_session','advance_focus_session_lead','sum_focus_points_month'); -- deve ser 0
--   select indexname from pg_indexes where tablename = 'crm_focus_sessions';
