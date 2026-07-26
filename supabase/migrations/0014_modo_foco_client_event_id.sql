-- Auditoria pré-deploy encontrou dois problemas reais na migration 0013:
--
-- 1) idempotency_key = "sessão:lead:ação" bloqueava ações LEGÍTIMAS repetidas
--    no mesmo lead dentro da mesma sessão (uma segunda anotação, um segundo
--    follow-up depois de reagendar, um segundo "mover etapa"). O unique index
--    fazia o segundo insert colidir e a rota tratava isso como "já
--    processado" — silenciosamente descartando uma ação real do corretor e
--    não dando os pontos correspondentes.
--
-- 2) O incremento de processed_leads/skipped_leads/earned_points em
--    src/lib/dashboard/focus-session-events.ts fazia SELECT do valor atual
--    em JS, somava, e dava UPDATE com o literal calculado — um clássico
--    "lost update": duas abas (ou dois cliques quase simultâneos) podiam
--    ler o mesmo valor antigo e um dos incrementos desaparecia.
--
-- Correção:
-- - Idempotência agora é por (session_id, client_event_id): o FRONTEND gera
--   um UUID por INTENÇÃO do usuário (um clique = um id; um retry da MESMA
--   requisição reaproveita o mesmo id; uma ação nova sempre gera outro id).
--   Isso nunca bloqueia repetições legítimas, só cliques duplos/retries.
-- - O insert + o incremento dos contadores da sessão agora rodam dentro de
--   UMA função Postgres (record_focus_event), executada como uma única
--   transação pelo Postgres — o UPDATE ... SET col = col + x é atômico e
--   protegido por row lock, eliminando o "lost update" mesmo com duas abas.

drop index if exists crm_focus_events_idempotency_key_unique;
alter table crm_focus_events drop column if exists idempotency_key;
alter table crm_focus_events add column client_event_id uuid not null;

create unique index if not exists crm_focus_events_session_client_event_unique
  on crm_focus_events (session_id, client_event_id);

create or replace function record_focus_event(
  p_session_id uuid,
  p_lead_id uuid,
  p_admin_id uuid,
  p_action_type text,
  p_previous_stage text,
  p_next_stage text,
  p_points int,
  p_metadata jsonb,
  p_client_event_id uuid,
  p_is_skip boolean,
  p_is_primary boolean
) returns jsonb
language plpgsql
as $$
declare
  v_id uuid;
begin
  insert into crm_focus_events (
    session_id, lead_id, admin_id, action_type,
    previous_stage, next_stage, points, metadata, client_event_id
  ) values (
    p_session_id, p_lead_id, p_admin_id, p_action_type,
    p_previous_stage, p_next_stage, p_points, p_metadata, p_client_event_id
  )
  on conflict (session_id, client_event_id) do nothing
  returning id into v_id;

  -- Conflito = clique duplo/retry da MESMA intenção (mesmo client_event_id).
  -- Não pontua de novo, não mexe nos contadores da sessão.
  if v_id is null then
    return jsonb_build_object('alreadyProcessed', true, 'points', 0);
  end if;

  -- Único UPDATE, com incremento relativo (col = col + x) — atômico mesmo
  -- com duas abas/sessões de navegador batendo ao mesmo tempo, porque o
  -- Postgres serializa via row lock na linha de crm_focus_sessions, sem
  -- depender de um SELECT anterior feito em JS.
  update crm_focus_sessions
  set
    processed_leads = processed_leads + (case when p_is_primary and not p_is_skip then 1 else 0 end),
    skipped_leads = skipped_leads + (case when p_is_skip then 1 else 0 end),
    earned_points = earned_points + p_points,
    updated_at = now()
  where id = p_session_id;

  return jsonb_build_object('alreadyProcessed', false, 'points', p_points, 'eventId', v_id);
end;
$$;
