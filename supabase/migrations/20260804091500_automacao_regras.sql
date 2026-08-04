-- Motor de regras "SE/ENTÃO" pra automação de leads, além da única sequência
-- fixa por tempo que já existe (automacao_whatsapp_mensagens/_intervalos).
-- Avaliado dentro do cron /api/cron/followup já existente (Vercel Hobby só
-- permite os crons já cadastrados em vercel.json, sem novo slot).
--
-- ativo começa false por padrão de propósito: nenhuma regra nova dispara
-- sem o corretor revisar e ativar manualmente pelo painel.
create table public.automacao_regras (
  "id" uuid default gen_random_uuid() not null primary key,
  "nome" text not null,
  "ativo" boolean default false not null,
  "gatilho_tipo" text not null,
  "gatilho_params" jsonb default '{}'::jsonb not null,
  "filtro_estagio" text[],
  "acao_tipo" text not null,
  "acao_params" jsonb default '{}'::jsonb not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  constraint automacao_regras_gatilho_tipo_check
    check (gatilho_tipo in ('estagio_parado_dias', 'score_acima', 'sem_resposta_dias')),
  constraint automacao_regras_acao_tipo_check
    check (acao_tipo in ('mover_estagio', 'notificar_stiven', 'enviar_whatsapp'))
);

alter table public.automacao_regras enable row level security;

create policy service_role_all on public.automacao_regras
  as permissive for all to service_role using (true) with check (true);

-- Um "carimbo" por (regra, lead) executado — NÃO um timestamp único na
-- regra, porque uma condição como "score acima de 80" pode continuar
-- verdadeira dia após dia pro mesmo lead; sem dedup por lead ela dispararia
-- de novo em todo cron. O cron consulta esta tabela antes de agir e insere
-- depois de agir com sucesso.
create table public.automacao_regras_execucoes (
  "id" uuid default gen_random_uuid() not null primary key,
  "regra_id" uuid not null references public.automacao_regras(id) on delete cascade,
  "lead_id" uuid not null references public.leads(id) on delete cascade,
  "executado_em" timestamp with time zone default now() not null
);

create index automacao_regras_execucoes_regra_lead_idx
  on public.automacao_regras_execucoes (regra_id, lead_id, executado_em desc);

alter table public.automacao_regras_execucoes enable row level security;

create policy service_role_all on public.automacao_regras_execucoes
  as permissive for all to service_role using (true) with check (true);
