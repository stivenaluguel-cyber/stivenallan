-- Tabela de preferências do corretor. Não existia nenhuma até agora — foi
-- por isso que o componente Perfil do Score de Operação ficou de fora
-- (ver src/lib/score/operacao.ts).
--
-- Por que uma tabela nova em vez de estender `crm_corretores`: aquela
-- tabela nasceu pra rede de corretores PARCEIROS (base do futuro SA
-- Gestão — ver migration 20260728193314), com `admin_id` NULLABLE de
-- propósito porque um parceiro pode existir sem nunca ter login no painel.
-- Hoje está com 0 linhas em produção: ninguém populou nem o próprio dono da
-- operação lá. Preferências de conta (meta diária, e futuramente o próprio
-- perfil público) são conceito de "configuração do usuário logado", não de
-- "membro da rede" — são coisas diferentes que só coincidem porque hoje só
-- existe um corretor. Ver [[feedback-stivenallan-corretor-autonomo-nao-confundir-sa-gestao]]
-- na memória do projeto.
--
-- `meta_diaria_followups` usa a MESMA definição de follow-up do componente
-- Frequência do Score (src/lib/score/interacoes.ts: leads_interacoes com
-- tipo IN ('nota','proposta')) — é o que a Parte 3 do briefing pede
-- explicitamente ("Meta diária e Frequência precisam contar exatamente a
-- mesma coisa"). NÃO é o mesmo "followups" de crm_metas_diarias (aquele
-- conta eventos do Modo Foco via crm_focus_events) — os dois sistemas
-- coexistem por decisão explícita, cada um com sua própria fonte.
--
-- Os 5 campos de perfil público (foto/CRECI/WhatsApp/bio/Instagram) vêm
-- NULOS de propósito — a Parte 2 do briefing pede só que o schema esteja
-- preparado pra recebê-los depois, não que sejam implementados agora. Uma
-- vez preenchidos, destravam o componente Perfil do Score.
create table public.crm_preferencias (
  "id" uuid primary key default gen_random_uuid(),
  "admin_id" uuid not null references public.admin_users(id) on delete cascade,
  "meta_diaria_followups" integer not null default 5,
  "foto_url" text,
  "creci" text,
  "whatsapp" text,
  "bio" text,
  "instagram" text,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint crm_preferencias_admin_unique unique (admin_id),
  constraint crm_preferencias_meta_nao_negativa check (meta_diaria_followups >= 0)
);

-- RLS ligado sem policy nenhuma — mesmo padrão de crm_metas_diarias e
-- crm_corretores: o acesso de verdade é todo via service_role no backend
-- (requireAdmin() + filtro por admin_id na query), não há sessão Supabase
-- Auth pra uma policy baseada em auth.uid() fazer sentido aqui — o login do
-- painel é JWT próprio (dashboard_token), não Supabase Auth.
alter table public.crm_preferencias enable row level security;
