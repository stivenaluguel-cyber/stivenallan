-- Modo Foco V2 — fila persistida por sessão + garantias atômicas.
--
-- Contexto: hoje a "fila" do Modo Foco é recalculada ao vivo em toda carga
-- de página (GET /api/admin/leads/foco chama buildFocusQueue contra o
-- estado atual de leads+crm_agenda) — nada persiste quais leads pertencem
-- a uma sessão nem em que posição. Isso causa: filtro mutável derruba a
-- sessão quando esvazia; total_leads é confiado do client (items.length);
-- não há trava contra duas sessões 'ativa' concorrentes pro mesmo admin
-- (crm_focus_sessions_admin_ativa_idx é um índice comum, não único).
--
-- Esta migration NÃO toca em crm_focus_events/crm_focus_sessions (ambas já
-- existem, já testadas, já usadas por record_focus_event) — só adiciona a
-- tabela de snapshot que faltava e duas RPCs novas que orquestram criação
-- de sessão e avanço de item de forma atômica, reaproveitando
-- record_focus_event por baixo (chamada direta função→função, mesma
-- transação) em vez de duplicar a lógica de idempotência/pontos.

create table public.crm_focus_session_leads (
  "id" uuid primary key default gen_random_uuid(),
  "session_id" uuid not null references public.crm_focus_sessions(id) on delete cascade,
  "lead_id" uuid not null references public.leads(id) on delete cascade,
  "position" integer not null,
  "status" text not null default 'pendente',
  "primary_action" text,
  "client_event_id" uuid,
  "snoozed_until" timestamptz,
  "completed_at" timestamptz,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint crm_focus_session_leads_status_check
    check (status in ('pendente', 'processando', 'processado', 'pulado', 'adiado')),
  constraint crm_focus_session_leads_session_lead_unique unique (session_id, lead_id)
);

create index crm_focus_session_leads_session_status_position_idx
  on public.crm_focus_session_leads (session_id, status, "position");
create index crm_focus_session_leads_lead_idx on public.crm_focus_session_leads (lead_id);

alter table public.crm_focus_session_leads enable row level security;

-- Uma sessão 'ativa' por admin, de verdade (índice atual é (admin_id,
-- status) não-único — duas requisições concorrentes de POST /sessions
-- podem ambas passar no SELECT "já existe ativa?" antes de qualquer uma
-- inserir). Substitui o índice antigo por um único parcial equivalente.
drop index if exists public.crm_focus_sessions_admin_ativa_idx;
create unique index crm_focus_sessions_admin_ativa_unique
  on public.crm_focus_sessions (admin_id) where (status = 'ativa');

-- Nova ação primária "adiado" (Fase 6 — Adiar), mesmo formato das demais.
alter table public.crm_focus_events drop constraint crm_focus_events_action_type_check;
alter table public.crm_focus_events add constraint crm_focus_events_action_type_check
  check (action_type = any (array[
    'pular', 'perdido', 'followup_agendado', 'visita_agendada',
    'visita_concluida', 'visita_nao_ocorreu', 'contato_confirmado',
    'anotacao', 'etapa_alterada', 'proposta_enviada', 'adiado'
  ]));

-- Anotações sem lost update. Hoje toda anotação é um append a um JSON
-- inteiro em leads.anotacoes (GET → append → PATCH): duas abas salvando ao
-- mesmo tempo fazem a segunda sobrescrever a nota da primeira. Passamos a
-- gravar UMA LINHA por anotação em leads_interacoes (tabela que já existe e
-- já registra mudança de etapa/proposta), com idempotência por
-- client_event_id. Nada do histórico legado é apagado ou convertido — a
-- coluna leads.anotacoes continua existindo e sendo lida (ver /timeline).
alter table public.leads_interacoes add column if not exists client_event_id uuid;
create unique index leads_interacoes_client_event_unique
  on public.leads_interacoes (client_event_id) where (client_event_id is not null);
create index leads_interacoes_lead_created_idx
  on public.leads_interacoes (lead_id, created_at desc);

-- Propostas: numeração automática + idempotência.
--
-- `crm_propostas.numero` é NOT NULL, varchar(20) e NÃO tem default — mas o
-- POST da API nunca o preenchia, então toda criação de proposta falhava
-- (produção tem 0 propostas; o frontend caía num fallback silencioso em
-- localStorage e ninguém percebeu). Gerar o número no aplicativo exigiria um
-- SELECT max()+1 sujeito a corrida; uma sequence resolve isso atomicamente e
-- ainda entrega numeração sequencial de verdade, que é o que um documento
-- comercial precisa. Esta é a justificativa concreta para mexer no schema —
-- não é adaptar o banco a nomes errados do código.
create sequence public.crm_propostas_numero_seq;

-- O ano NÃO é fixo: to_char(now(), 'YYYY') é avaliado a cada insert, então
-- vira 2027 sozinho na virada. O `at time zone 'America/Sao_Paulo'` importa
-- aqui — a Vercel roda em UTC, e sem ele uma proposta criada em 31/12 às
-- 22h (horário de Brasília) já sairia numerada como do ano seguinte.
--
-- A sequence é ÚNICA e contínua entre anos (não reinicia em 00001 a cada
-- janeiro): 2027 continua de onde 2026 parou. Isso é intencional — mantém
-- `numero` globalmente único sem depender de nenhuma rotina de virada de
-- ano, que seria mais uma coisa para falhar. Colisão é impossível: nextval
-- nunca repete, e o índice único abaixo garante isso no banco.
alter table public.crm_propostas
  alter column numero set default (
    'P-' || to_char((now() at time zone 'America/Sao_Paulo'), 'YYYY')
        || '-' || lpad(nextval('public.crm_propostas_numero_seq')::text, 5, '0')
  );

-- `numero` é o identificador do documento — duplicar seria erro de negócio.
-- Seguro: a tabela está vazia hoje, então o índice não pode falhar por dado
-- pré-existente.
create unique index crm_propostas_numero_unique on public.crm_propostas (numero);

-- Idempotência de retry: sem isso, "proposta gravada → evento de pontuação
-- falha → usuário tenta de novo" cria uma SEGUNDA proposta para o mesmo
-- lead. Mesmo padrão já usado em crm_agenda e leads_interacoes.
alter table public.crm_propostas add column if not exists client_event_id uuid;
create unique index crm_propostas_client_event_unique
  on public.crm_propostas (client_event_id) where (client_event_id is not null);

-- FK sem índice apontada pelo advisor de performance. Passa a importar
-- agora que propostas voltam a ser criadas de verdade: tanto a listagem
-- (GET ?lead_id=) quanto a checagem "esta proposta é deste lead?" filtram
-- por lead_id.
create index crm_propostas_lead_idx on public.crm_propostas (lead_id);

-- Início de sessão atômico: monta o snapshot (session_leads) a partir de
-- uma lista de lead_id JÁ ordenada pelo servidor (buildFocusQueue, o mesmo
-- serviço puro/testado que a rota /api/admin/leads/foco já usa — não
-- duplicamos a regra de priorização em SQL) e calcula total_leads a partir
-- do próprio array, nunca de um número enviado pelo cliente. Corrida entre
-- duas abas: a segunda chamada cai no unique_violation do índice parcial
-- acima e devolve a sessão que a primeira já criou, sem tentar de novo.
create or replace function public.start_focus_session(
  p_admin_id uuid,
  p_filtros jsonb,
  p_lead_ids uuid[]
) returns jsonb
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_new_id uuid;
  v_session crm_focus_sessions;
begin
  begin
    insert into crm_focus_sessions (admin_id, status, filtros, total_leads)
    values (p_admin_id, 'ativa', coalesce(p_filtros, '{}'::jsonb), coalesce(array_length(p_lead_ids, 1), 0))
    returning id into v_new_id;
  exception when unique_violation then
    select * into v_session from crm_focus_sessions
    where admin_id = p_admin_id and status = 'ativa'
    order by started_at desc limit 1;
    return jsonb_build_object('session', to_jsonb(v_session), 'reused', true);
  end;

  if p_lead_ids is not null and array_length(p_lead_ids, 1) > 0 then
    insert into crm_focus_session_leads (session_id, lead_id, "position", status)
    select v_new_id, lid, ord, 'pendente'
    from unnest(p_lead_ids) with ordinality as t(lid, ord);
  end if;

  select * into v_session from crm_focus_sessions where id = v_new_id;
  return jsonb_build_object('session', to_jsonb(v_session), 'reused', false);
end;
$function$;

revoke all on function public.start_focus_session(uuid, jsonb, uuid[]) from public, anon, authenticated;
grant execute on function public.start_focus_session(uuid, jsonb, uuid[]) to service_role;

-- Avanço de item de fila atômico: para ações PRIMÁRIAS (is_primary=true —
-- pular/perdido/followup_agendado/visita_agendada/visita_concluida/
-- visita_nao_ocorreu/adiado), trava a linha de crm_focus_session_leads
-- (select ... for update) e só prossegue se ainda estiver 'pendente' ou
-- 'adiado' — isso é o que resolve duas abas processando o mesmo item ao
-- mesmo tempo com client_event_id DIFERENTES (cada aba gerou o seu, então
-- a idempotência por client_event_id sozinha não bastaria: sem esta trava,
-- as duas passariam como ações "novas" e legítimas). Ações SECUNDÁRIAS
-- (anotacao/contato_confirmado/etapa_alterada avulsa, is_primary=false)
-- não tocam status/posição — comportamento idêntico ao atual.
create or replace function public.advance_focus_session_lead(
  p_session_id uuid,
  p_lead_id uuid,
  p_admin_id uuid,
  p_action_type text,
  p_previous_stage text,
  p_next_stage text,
  p_points integer,
  p_metadata jsonb,
  p_client_event_id uuid,
  p_is_skip boolean,
  p_is_primary boolean,
  p_target_status text default null,
  p_snoozed_until timestamptz default null
) returns jsonb
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_row crm_focus_session_leads;
  v_result jsonb;
begin
  if p_is_primary then
    select * into v_row
    from crm_focus_session_leads
    where session_id = p_session_id and lead_id = p_lead_id
    for update;

    if not found then
      return jsonb_build_object('error', 'item_nao_pertence_a_sessao');
    end if;

    if v_row.status not in ('pendente', 'adiado') then
      return jsonb_build_object('alreadyProcessed', true, 'points', 0, 'sessionLeadStatus', v_row.status);
    end if;
  end if;

  v_result := record_focus_event(
    p_session_id, p_lead_id, p_admin_id, p_action_type,
    p_previous_stage, p_next_stage, p_points, p_metadata,
    p_client_event_id, p_is_skip, p_is_primary
  );

  if p_is_primary and not coalesce((v_result ->> 'alreadyProcessed')::boolean, false) then
    update crm_focus_session_leads
    set
      status = coalesce(p_target_status, 'processado'),
      primary_action = p_action_type,
      client_event_id = p_client_event_id,
      snoozed_until = p_snoozed_until,
      completed_at = case when coalesce(p_target_status, 'processado') = 'processado' then now() else completed_at end,
      updated_at = now()
    where session_id = p_session_id and lead_id = p_lead_id;
  end if;

  return v_result || jsonb_build_object('sessionLeadStatus', coalesce(p_target_status, v_row.status));
end;
$function$;

revoke all on function public.advance_focus_session_lead(uuid, uuid, uuid, text, text, text, integer, jsonb, uuid, boolean, boolean, text, timestamptz) from public, anon, authenticated;
grant execute on function public.advance_focus_session_lead(uuid, uuid, uuid, text, text, text, integer, jsonb, uuid, boolean, boolean, text, timestamptz) to service_role;

-- Pontos do mês agregados no banco (era um SELECT de todas as linhas do mês
-- somado em JS — funcionava, mas não escala e não é o padrão pedido).
-- Fronteira de mês calculada em America/Sao_Paulo, não no fuso do servidor
-- (Vercel roda em UTC — perto da virada do mês isso mudava o resultado).
create or replace function public.sum_focus_points_month(p_admin_id uuid)
returns integer
language sql
stable
set search_path to 'public', 'pg_temp'
as $function$
  select coalesce(sum(points), 0)::integer
  from crm_focus_events
  where admin_id = p_admin_id
    and created_at >= (date_trunc('month', (now() at time zone 'America/Sao_Paulo')) at time zone 'America/Sao_Paulo');
$function$;

revoke all on function public.sum_focus_points_month(uuid) from public, anon, authenticated;
grant execute on function public.sum_focus_points_month(uuid) to service_role;
