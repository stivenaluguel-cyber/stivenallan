-- Automação "comentário → DM" do Instagram (estilo ManyChat), portada de um
-- template comprado pra dentro do CRM em vez de rodar como app separado —
-- reaproveita o mesmo webhook/token/Meta App do funil de DM já em produção
-- (ver docs/funil-ig-dm/README.md e src/app/api/webhook/instagram/route.ts).
--
-- Fluxo: comentário com palavra-chave num post → resposta pública opcional →
-- DM automática (texto + até 3 botões), com gate opcional de "me segue
-- primeiro" (Instagram não tem webhook de novo-seguidor; o gate confirma
-- com um botão de postback em vez de checar seguidor de verdade em loop).

create table public.ig_comment_automacoes (
  "id" uuid default gen_random_uuid() not null primary key,
  "nome" text not null,
  "ativo" boolean default true not null,
  -- ID do post (permalink) pra restringir a automação a um post específico.
  -- Nulo = dispara em comentário de qualquer post da conta.
  "media_id" text,
  "keywords" text[] default '{}'::text[] not null,
  "match_type" text not null default 'contains'
    constraint ig_comment_automacoes_match_type_check
      check (match_type in ('any', 'contains', 'exact')),
  -- Evita mandar a mesma DM de novo se a pessoa comentar a palavra-chave
  -- várias vezes (a Meta também só permite 1 DM por comentário/7 dias).
  "only_once_per_user" boolean default true not null,
  "public_reply" text,
  "dm_message" text,
  -- [{ title, url? , payload? }], até 3 (limite do template de botão da Meta).
  "dm_buttons" jsonb default '[]'::jsonb not null,
  "require_follow" boolean default false not null,
  "follow_prompt" text,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

alter table public.ig_comment_automacoes enable row level security;

create policy service_role_all on public.ig_comment_automacoes
  as permissive for all to service_role using (true) with check (true);

-- Log de execução: 1 linha por comentário que bateu numa regra. Base das
-- métricas por automação (execuções, DMs enviados, erro) mostradas na UI.
create table public.ig_comment_automacao_execucoes (
  "id" uuid default gen_random_uuid() not null primary key,
  "automacao_id" uuid not null references public.ig_comment_automacoes(id) on delete cascade,
  "comment_id" text,
  "media_id" text,
  "commenter_id" text,
  "commenter_username" text,
  "comment_text" text,
  "public_reply_status" text,
  "dm_status" text,
  "error" text,
  "created_at" timestamp with time zone default now() not null
);

create index ig_comment_automacao_execucoes_automacao_idx
  on public.ig_comment_automacao_execucoes (automacao_id, created_at desc);

alter table public.ig_comment_automacao_execucoes enable row level security;

create policy service_role_all on public.ig_comment_automacao_execucoes
  as permissive for all to service_role using (true) with check (true);

-- Fila do gate "me segue primeiro": guarda quem ainda não confirmou, pra
-- quando o postback FOLLOW_CHECK chegar saber qual automação/mensagem liberar.
create table public.ig_comment_automacao_pendentes (
  "id" uuid default gen_random_uuid() not null primary key,
  "automacao_id" uuid not null references public.ig_comment_automacoes(id) on delete cascade,
  "commenter_id" text not null,
  "created_at" timestamp with time zone default now() not null,
  constraint ig_comment_automacao_pendentes_unica unique (automacao_id, commenter_id)
);

alter table public.ig_comment_automacao_pendentes enable row level security;

create policy service_role_all on public.ig_comment_automacao_pendentes
  as permissive for all to service_role using (true) with check (true);

-- Clique nos botões da DM (CTR = cliques / DMs entregues). Botões web_url
-- são reescritos pra passar pelo redirect de tracking antes do destino real.
create table public.ig_comment_automacao_cliques (
  "id" uuid default gen_random_uuid() not null primary key,
  "automacao_id" uuid not null references public.ig_comment_automacoes(id) on delete cascade,
  "button_index" int,
  "commenter_id" text,
  "created_at" timestamp with time zone default now() not null
);

create index ig_comment_automacao_cliques_automacao_idx
  on public.ig_comment_automacao_cliques (automacao_id);

alter table public.ig_comment_automacao_cliques enable row level security;

create policy service_role_all on public.ig_comment_automacao_cliques
  as permissive for all to service_role using (true) with check (true);
