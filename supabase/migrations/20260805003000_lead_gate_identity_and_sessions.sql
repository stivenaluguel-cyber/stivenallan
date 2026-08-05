-- Feature: cadastro único + liberação progressiva de conteúdo (lead gate).
-- 100% aditivo — nenhuma coluna existente é alterada em tipo/nulidade/default.
-- Ver plano completo em /Users/stivenallan/.claude/plans/wiggly-gathering-walrus.md
--
-- NÃO APLICAR sem aprovação explícita adicional (feature flags ficam false
-- por padrão mesmo depois de aplicada — ver LEAD_GATE_ENABLED/.env.example).
--
-- Revisão de segurança (rodada 2, pré-QA): corrigido bug de view_count
-- (dedup comparava contra last_seen_at, que qualquer evento toca — 'unlock'
-- e o primeiro 'view' chegam a ~5s um do outro e ficariam sempre dentro da
-- janela de dedup, nunca incrementando a 1ª visita real; agora usa uma
-- coluna dedicada last_view_counted_at). Adicionado: schema explícito
-- (public.) em toda referência dentro das funções, validação de input nas
-- duas funções, índice de limpeza por expires_at em lead_access_sessions.

-- =====================================================================
-- 1. lead_access_sessions — sessão de acesso global (token opaco + hash)
-- =====================================================================
create table public.lead_access_sessions (
  "id" uuid default gen_random_uuid() not null,
  "lead_id" uuid not null,
  "token_hash" text not null,
  "created_at" timestamp with time zone default now() not null,
  "expires_at" timestamp with time zone not null,
  "last_seen_at" timestamp with time zone default now() not null,
  "revoked_at" timestamp with time zone
);
alter table public.lead_access_sessions add constraint lead_access_sessions_pkey primary key (id);
alter table public.lead_access_sessions add constraint lead_access_sessions_lead_id_fkey
  foreign key (lead_id) references public.leads(id) on delete cascade;
alter table public.lead_access_sessions add constraint lead_access_sessions_token_hash_key unique (token_hash);
create index lead_access_sessions_lead_id_idx on public.lead_access_sessions using btree (lead_id);
create index lead_access_sessions_active_idx on public.lead_access_sessions using btree (token_hash) where (revoked_at is null);
-- Índice de limpeza: sustenta um futuro job "DELETE FROM lead_access_sessions
-- WHERE expires_at < now()" sem full scan.
create index lead_access_sessions_expires_at_idx on public.lead_access_sessions using btree (expires_at);
alter table public.lead_access_sessions enable row level security;
-- Sem policy: só service_role acessa (padrão dominante do projeto — RLS
-- habilitado + zero policy = a service role key bypassa e é a única via de acesso).
comment on table public.lead_access_sessions is
  'Sessão de acesso global do site público (cadastro único). Token opaco (crypto.randomBytes) — só o hash SHA-256 é gravado aqui, nunca o token em claro. Cookie HttpOnly só carrega o token; lead_id nunca sai do servidor.';

-- =====================================================================
-- 2. lead_property_interests — estado agregado atual por (lead, propriedade)
-- =====================================================================
create table public.lead_property_interests (
  "id" uuid default gen_random_uuid() not null,
  "lead_id" uuid not null,
  "property_id" uuid not null,
  "property_slug" text not null,
  "first_seen_at" timestamp with time zone default now() not null,
  "last_seen_at" timestamp with time zone default now() not null,
  "view_count" integer default 1 not null,
  -- Timestamp dedicado pra decidir a janela de dedup do view_count — NUNCA
  -- reusar last_seen_at pra isso (esse é tocado por qualquer evento, não só
  -- 'view'; ver nota de revisão no topo do arquivo).
  "last_view_counted_at" timestamp with time zone,
  "unlocked_at" timestamp with time zone,
  "whatsapp_clicked_at" timestamp with time zone,
  "catalog_downloaded_at" timestamp with time zone,
  "floorplan_viewed_at" timestamp with time zone,
  "gallery_viewed_at" timestamp with time zone,
  "availability_viewed_at" timestamp with time zone,
  "source" text,
  "utm_source" text,
  "utm_medium" text,
  "utm_campaign" text,
  "fbclid" text,
  "gclid" text,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);
alter table public.lead_property_interests add constraint lead_property_interests_pkey primary key (id);
alter table public.lead_property_interests add constraint lead_property_interests_lead_id_fkey
  foreign key (lead_id) references public.leads(id) on delete cascade;
alter table public.lead_property_interests add constraint lead_property_interests_property_id_fkey
  foreign key (property_id) references public.properties(id) on delete cascade;
alter table public.lead_property_interests add constraint lead_property_interests_lead_property_key unique (lead_id, property_id);
alter table public.lead_property_interests add constraint lead_property_interests_view_count_check check (view_count >= 0);
create index lead_property_interests_lead_id_idx on public.lead_property_interests using btree (lead_id);
create index lead_property_interests_property_id_idx on public.lead_property_interests using btree (property_id);
create index lead_property_interests_last_seen_idx on public.lead_property_interests using btree (last_seen_at desc);
alter table public.lead_property_interests enable row level security;
comment on table public.lead_property_interests is
  'Estado agregado atual de interesse de um lead JÁ CONHECIDO por empreendimento. Não existe linha pré-conversão (visitante anônimo continua só em localStorage/VisitTracker). Complementa lead_eventos (timeline crua) — não o substitui.';

-- =====================================================================
-- 3. lead_identity_conflicts — fila de revisão manual (telefone×e-mail em leads diferentes)
-- =====================================================================
create table public.lead_identity_conflicts (
  "id" uuid default gen_random_uuid() not null,
  "lead_id_a" uuid not null,
  "lead_id_b" uuid not null,
  "whatsapp" text,
  "email" text,
  "detected_at" timestamp with time zone default now() not null,
  "resolved_at" timestamp with time zone,
  "resolved_by" uuid,
  "resolution" text
);
alter table public.lead_identity_conflicts add constraint lead_identity_conflicts_pkey primary key (id);
alter table public.lead_identity_conflicts add constraint lead_identity_conflicts_lead_a_fkey
  foreign key (lead_id_a) references public.leads(id) on delete cascade;
alter table public.lead_identity_conflicts add constraint lead_identity_conflicts_lead_b_fkey
  foreign key (lead_id_b) references public.leads(id) on delete cascade;
alter table public.lead_identity_conflicts add constraint lead_identity_conflicts_resolved_by_fkey
  foreign key (resolved_by) references public.admin_users(id) on delete set null;
create index lead_identity_conflicts_pending_idx on public.lead_identity_conflicts using btree (detected_at) where (resolved_at is null);
alter table public.lead_identity_conflicts enable row level security;
comment on table public.lead_identity_conflicts is
  'Registrado quando telefone e e-mail submetidos no gate apontam para leads diferentes — nunca mesclado automaticamente. Fila de revisão manual no dashboard (fora do escopo desta migration).';

-- =====================================================================
-- 4. lead_eventos — aditivo (sem CHECK novo em `tipo`, não quebra dado já gravado)
-- =====================================================================
alter table public.lead_eventos add column "property_id" uuid;
alter table public.lead_eventos add constraint lead_eventos_property_id_fkey
  foreign key (property_id) references public.properties(id) on delete set null;
alter table public.lead_eventos add column "client_event_id" uuid;
create index lead_eventos_lead_id_idx on public.lead_eventos using btree (lead_id);
create index lead_eventos_slug_idx on public.lead_eventos using btree (slug);
create index lead_eventos_created_at_idx on public.lead_eventos using btree (created_at desc);
-- SEM `where (client_event_id is not null)`: um índice único PARCIAL não pode
-- ser usado como alvo de `.upsert(..., {onConflict:'client_event_id'})` do
-- supabase-js (Postgres exige repetir o predicado na query, o que o cliente
-- não faz) — regressão conhecida do projeto (ver src/lib/db/upsert-indices.test.ts).
-- Índice TOTAL aqui funciona igual: múltiplas linhas com client_event_id NULL
-- continuam permitidas (NULL nunca colide consigo mesmo em índice único).
create unique index lead_eventos_client_event_id_unique on public.lead_eventos using btree (client_event_id);

-- =====================================================================
-- 5. leads — só um índice funcional (sem UNIQUE: dado existente pode ter duplicata de email)
-- =====================================================================
create index leads_email_lower_idx on public.leads using btree (lower(email)) where (email is not null);

-- =====================================================================
-- 6. Função: resolução/merge de identidade — atômica, race-safe via FOR UPDATE.
-- Mesmo molde de public.start_focus_session (20260728152434): sem
-- `security definer` — roda com o privilégio de quem chama via .rpc(), que
-- é sempre o client de service_role (nunca anon/authenticated). Sem
-- SECURITY DEFINER não há elevação de privilégio pra auditar, mas mesmo
-- assim: search_path travado, todo objeto referenciado com schema explícito,
-- execução revogada de PUBLIC/anon/authenticated, inputs obrigatórios validados.
-- =====================================================================
create or replace function public.resolve_lead_for_gate(
  p_whatsapp text,
  p_email text,
  p_nome text,
  p_property_id uuid,
  p_property_name text,
  p_source text,
  p_utm_source text,
  p_utm_medium text,
  p_utm_campaign text,
  p_utm_content text,
  p_utm_term text,
  p_gclid text,
  p_fbclid text,
  p_faixa_investimento text,
  p_prazo_compra text,
  p_entrada_disponivel text
) returns jsonb
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_by_phone record;
  v_by_email record;
  v_lead_id uuid;
  v_conflito boolean := false;
  v_created boolean := false;
begin
  -- Validação de input na própria função — defesa em profundidade além da
  -- validação já feita em /api/lead-gate/unlock (a rota é a única chamadora,
  -- mas a função não pode confiar cegamente nisso).
  if p_whatsapp is null or btrim(p_whatsapp) = '' then
    raise exception 'resolve_lead_for_gate: whatsapp é obrigatório';
  end if;
  if p_nome is null or btrim(p_nome) = '' then
    raise exception 'resolve_lead_for_gate: nome é obrigatório';
  end if;
  if p_email is null or btrim(p_email) = '' then
    raise exception 'resolve_lead_for_gate: email é obrigatório';
  end if;

  -- Ordem fixa de lock (telefone antes de e-mail) em toda chamada — evita
  -- deadlock entre duas requisições concorrentes que travam os mesmos dois
  -- leads em ordem invertida.
  select id into v_by_phone from public.leads where whatsapp = p_whatsapp for update;
  select id into v_by_email from public.leads where email = p_email for update;

  if v_by_phone.id is not null and v_by_email.id is not null and v_by_phone.id <> v_by_email.id then
    -- Telefone e e-mail apontam para leads DIFERENTES: nunca mescla
    -- automaticamente. Usa o lead do telefone (chave historicamente única
    -- do projeto) como alvo do merge desta submissão, registra o conflito
    -- para revisão manual e marca os dois para atenção.
    v_lead_id := v_by_phone.id;
    v_conflito := true;
    insert into public.lead_identity_conflicts (lead_id_a, lead_id_b, whatsapp, email)
      values (v_by_phone.id, v_by_email.id, p_whatsapp, p_email);
    update public.leads set requer_atencao = true where id in (v_by_phone.id, v_by_email.id);
  elsif v_by_phone.id is not null then
    v_lead_id := v_by_phone.id;
  elsif v_by_email.id is not null then
    v_lead_id := v_by_email.id;
  else
    insert into public.leads (
      whatsapp, email, nome, property_id, property_name, origem, source, status, estagio_funil,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, fbclid,
      faixa_investimento, prazo_compra, entrada_disponivel, requer_atencao
    ) values (
      p_whatsapp, p_email, p_nome, p_property_id, p_property_name, 'Site', p_source, 'novo', 'primeiro_contato',
      p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, p_utm_term, p_gclid, p_fbclid,
      p_faixa_investimento, p_prazo_compra, p_entrada_disponivel, false
    ) returning id into v_lead_id;
    v_created := true;
  end if;

  if not v_created then
    -- Merge fill-only-missing: nunca sobrescreve o que já existia, nunca
    -- toca status/estagio_funil/anotacoes/kanban_ordem. property_id só é
    -- setado se estava NULL — depois de preenchido, nunca troca por aqui.
    update public.leads set
      nome = coalesce(nome, p_nome),
      email = coalesce(email, p_email),
      property_id = coalesce(property_id, p_property_id),
      property_name = coalesce(property_name, p_property_name),
      faixa_investimento = coalesce(faixa_investimento, p_faixa_investimento),
      prazo_compra = coalesce(prazo_compra, p_prazo_compra),
      entrada_disponivel = coalesce(entrada_disponivel, p_entrada_disponivel),
      utm_source = coalesce(utm_source, p_utm_source),
      utm_medium = coalesce(utm_medium, p_utm_medium),
      utm_campaign = coalesce(utm_campaign, p_utm_campaign),
      utm_content = coalesce(utm_content, p_utm_content),
      utm_term = coalesce(utm_term, p_utm_term),
      gclid = coalesce(gclid, p_gclid),
      fbclid = coalesce(fbclid, p_fbclid),
      updated_at = now()
    where id = v_lead_id;
  end if;

  return jsonb_build_object('leadId', v_lead_id, 'created', v_created, 'conflito', v_conflito);
end;
$function$;

revoke all on function public.resolve_lead_for_gate(
  text, text, text, uuid, text, text, text, text, text, text, text, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.resolve_lead_for_gate(
  text, text, text, uuid, text, text, text, text, text, text, text, text, text, text, text, text
) to service_role;

-- =====================================================================
-- 7. Função: registro idempotente de interesse por propriedade.
-- =====================================================================
create or replace function public.record_property_interest(
  p_lead_id uuid,
  p_property_id uuid,
  p_property_slug text,
  p_event_type text,
  p_source text,
  p_utm_source text,
  p_utm_medium text,
  p_utm_campaign text,
  p_fbclid text,
  p_gclid text,
  p_view_dedup_minutes integer default 30
) returns void
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
begin
  if p_lead_id is null or p_property_id is null or p_property_slug is null or btrim(p_property_slug) = '' then
    raise exception 'record_property_interest: lead_id, property_id e property_slug são obrigatórios';
  end if;
  if p_event_type not in ('view', 'unlock', 'whatsapp_click', 'catalog_download', 'floorplan_view', 'gallery_view', 'availability_view') then
    raise exception 'record_property_interest: event_type inválido: %', p_event_type;
  end if;

  insert into public.lead_property_interests (
    lead_id, property_id, property_slug, view_count, last_view_counted_at,
    source, utm_source, utm_medium, utm_campaign, fbclid, gclid,
    unlocked_at, whatsapp_clicked_at, catalog_downloaded_at, floorplan_viewed_at, gallery_viewed_at, availability_viewed_at
  ) values (
    p_lead_id, p_property_id, p_property_slug,
    case when p_event_type = 'view' then 1 else 0 end,
    case when p_event_type = 'view' then now() else null end,
    p_source, p_utm_source, p_utm_medium, p_utm_campaign, p_fbclid, p_gclid,
    case when p_event_type = 'unlock' then now() end,
    case when p_event_type = 'whatsapp_click' then now() end,
    case when p_event_type = 'catalog_download' then now() end,
    case when p_event_type = 'floorplan_view' then now() end,
    case when p_event_type = 'gallery_view' then now() end,
    case when p_event_type = 'availability_view' then now() end
  )
  on conflict (lead_id, property_id) do update set
    last_seen_at = now(),
    -- Dedup por last_view_counted_at (dedicado), NUNCA last_seen_at (esse é
    -- tocado por QUALQUER evento — unlock e o primeiro view chegam a ~5s um
    -- do outro e sempre cairiam dentro da janela se comparasse contra ele,
    -- nunca contando a primeira visita real).
    view_count = public.lead_property_interests.view_count + (case
      when p_event_type = 'view' and (
        public.lead_property_interests.last_view_counted_at is null
        or public.lead_property_interests.last_view_counted_at < now() - (p_view_dedup_minutes || ' minutes')::interval
      ) then 1
      else 0
    end),
    last_view_counted_at = case
      when p_event_type = 'view' and (
        public.lead_property_interests.last_view_counted_at is null
        or public.lead_property_interests.last_view_counted_at < now() - (p_view_dedup_minutes || ' minutes')::interval
      ) then now()
      else public.lead_property_interests.last_view_counted_at
    end,
    unlocked_at = case when p_event_type = 'unlock' then coalesce(public.lead_property_interests.unlocked_at, now()) else public.lead_property_interests.unlocked_at end,
    whatsapp_clicked_at = case when p_event_type = 'whatsapp_click' then now() else public.lead_property_interests.whatsapp_clicked_at end,
    catalog_downloaded_at = case when p_event_type = 'catalog_download' then coalesce(public.lead_property_interests.catalog_downloaded_at, now()) else public.lead_property_interests.catalog_downloaded_at end,
    floorplan_viewed_at = case when p_event_type = 'floorplan_view' then coalesce(public.lead_property_interests.floorplan_viewed_at, now()) else public.lead_property_interests.floorplan_viewed_at end,
    gallery_viewed_at = case when p_event_type = 'gallery_view' then coalesce(public.lead_property_interests.gallery_viewed_at, now()) else public.lead_property_interests.gallery_viewed_at end,
    availability_viewed_at = case when p_event_type = 'availability_view' then coalesce(public.lead_property_interests.availability_viewed_at, now()) else public.lead_property_interests.availability_viewed_at end,
    source = coalesce(public.lead_property_interests.source, p_source),
    utm_source = coalesce(public.lead_property_interests.utm_source, p_utm_source),
    utm_medium = coalesce(public.lead_property_interests.utm_medium, p_utm_medium),
    utm_campaign = coalesce(public.lead_property_interests.utm_campaign, p_utm_campaign),
    fbclid = coalesce(public.lead_property_interests.fbclid, p_fbclid),
    gclid = coalesce(public.lead_property_interests.gclid, p_gclid),
    updated_at = now();
end;
$function$;

revoke all on function public.record_property_interest(
  uuid, uuid, text, text, text, text, text, text, text, text, integer
) from public, anon, authenticated;
grant execute on function public.record_property_interest(
  uuid, uuid, text, text, text, text, text, text, text, text, integer
) to service_role;
