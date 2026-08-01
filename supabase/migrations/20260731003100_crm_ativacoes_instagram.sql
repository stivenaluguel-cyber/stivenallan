-- Fila de ativação manual do Instagram — funil "Instagram → DM → Kanban".
--
-- A API da Meta NÃO entrega listas de novos seguidores, curtidas, comentários
-- ou reações em story de forma utilizável pra isso. A fila é preenchida à mão
-- (ou por importação em lote) pelo operador, que olha as listas no app do
-- Instagram e registra quem vai abordar. Cada linha vira um card no Kanban de
-- /dashboard/ativacao; quando o contato responde e engaja, o card é vinculado
-- ao lead correspondente (lead_id).

create table if not exists public.crm_ativacoes_instagram (
  id uuid primary key default gen_random_uuid(),
  -- @ do perfil, sem o arroba, minúsculo (normalizado na API).
  username text not null,
  -- Nome de exibição, quando o operador souber — é o que entra no playbook.
  nome text,
  -- De qual lista do Instagram o contato veio. Mesmo vocabulário dos
  -- playbooks em src/lib/instagram/playbooks.ts.
  origem text not null
    constraint crm_ativacoes_instagram_origem_check check (
      origem in ('novo_seguidor', 'curtida', 'comentario', 'story', 'seguidor_antigo', 'reativacao')
    ),
  -- Contexto livre: qual post curtiu, qual story reagiu, o que comentou.
  contexto text,
  status text not null default 'pendente'
    constraint crm_ativacoes_instagram_status_check check (
      status in ('pendente', 'abordado', 'respondeu', 'virou_lead', 'ignorado')
    ),
  -- Preenchido quando a conversa vira lead de verdade no CRM.
  lead_id uuid references public.leads (id) on delete set null,
  anotacoes text,
  -- Setado pela API quando o status vira 'abordado' — é a base do contador
  -- "abordagens hoje" contra a meta diária.
  abordado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índice único TOTAL (não parcial) de propósito: o `ON CONFLICT (username, origem)`
-- do upsert em lote não infere índice parcial — já quebrou 2x nesta base com
-- erro 42P10. A mesma pessoa pode aparecer em origens diferentes (curtiu E
-- comentou), mas só uma vez por origem.
create unique index if not exists crm_ativacoes_instagram_username_origem_unica
  on public.crm_ativacoes_instagram (username, origem);

-- Leitura mais comum do Kanban: "o que está pendente, do mais antigo pro mais novo".
create index if not exists crm_ativacoes_instagram_status_idx
  on public.crm_ativacoes_instagram (status, created_at);

-- Contador "abordagens hoje".
create index if not exists crm_ativacoes_instagram_abordado_em_idx
  on public.crm_ativacoes_instagram (abordado_em);

-- Convenção do projeto: RLS ligado sem policy = acesso só pelo service_role.
alter table public.crm_ativacoes_instagram enable row level security;

comment on table public.crm_ativacoes_instagram is
  'Fila de ativação manual do Instagram (funil IG → DM → Kanban). Preenchida pelo operador; a Meta não fornece essas listas via API.';
