-- Assinaturas de Web Push (notificação real no iPhone/Android quando o PWA
-- está instalado) — uma linha por dispositivo/navegador que autorizou
-- notificação, não por admin (o mesmo admin pode ter o app instalado em
-- mais de um aparelho). `endpoint` é único por definição do Push API (a URL
-- do serviço de push do navegador já identifica a assinatura sozinha) —
-- reinstalar/reautorizar no mesmo aparelho deve fazer upsert, não duplicar.
create table public.crm_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.admin_users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create unique index crm_push_subscriptions_endpoint_key on public.crm_push_subscriptions (endpoint);
create index crm_push_subscriptions_admin_idx on public.crm_push_subscriptions (admin_id);

-- RLS habilitada sem policies (mesmo padrão de todas as outras tabelas do
-- CRM): só o service_role (rotas server-side) acessa; anon/authenticated
-- ficam bloqueados por padrão.
alter table public.crm_push_subscriptions enable row level security;
