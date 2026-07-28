-- Quatro frentes que vieram da análise da operação de um concorrente
-- (Mentoria Método C.I.), adaptadas ao que este sistema já sabe fazer.
--
-- 1. Metas diárias por corretor — lá o corretor DIGITA quantos contatos e
--    visitas fez; aqui a maior parte já está em crm_focus_events e
--    crm_agenda, então só o que o sistema não enxerga (vídeo publicado,
--    reunião presencial) precisa de registro manual.
-- 2. Simulação vinculada ao lead — hoje o /dashboard/simulador calcula e
--    joga fora. Passa a virar histórico e argumento de follow-up.
-- 3. Filtros de imóvel no nível do mercado local (permuta, parcelamento
--    direto, comodidades).
-- 4. Rede de corretores + comissões — base do SA Gestão.

-- ─────────────────────────────────────────────────────────────────────
-- 1. METAS DIÁRIAS
-- ─────────────────────────────────────────────────────────────────────

create table public.crm_metas_diarias (
  "id" uuid primary key default gen_random_uuid(),
  "admin_id" uuid not null references public.admin_users(id) on delete cascade,
  "novos_contatos" integer not null default 20,
  "followups" integer not null default 10,
  "visitas" integer not null default 2,
  "conteudos" integer not null default 1,
  "reunioes" integer not null default 1,
  "ativo" boolean not null default true,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint crm_metas_diarias_admin_unique unique (admin_id),
  constraint crm_metas_diarias_nao_negativas check (
    novos_contatos >= 0 and followups >= 0 and visitas >= 0 and conteudos >= 0 and reunioes >= 0
  )
);

alter table public.crm_metas_diarias enable row level security;

-- Só o que o sistema NÃO consegue observar sozinho. Contatos, follow-ups e
-- visitas saem de crm_focus_events/crm_agenda e nunca são digitados.
create table public.crm_atividades_manuais (
  "id" uuid primary key default gen_random_uuid(),
  "admin_id" uuid not null references public.admin_users(id) on delete cascade,
  "data" date not null,
  "tipo" text not null,
  "quantidade" integer not null default 1,
  "observacao" text,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint crm_atividades_manuais_tipo_check check (tipo in ('conteudo', 'reuniao_presencial')),
  constraint crm_atividades_manuais_qtd_check check (quantidade >= 0),
  constraint crm_atividades_manuais_unica unique (admin_id, data, tipo)
);

create index crm_atividades_manuais_admin_data_idx
  on public.crm_atividades_manuais (admin_id, "data" desc);

alter table public.crm_atividades_manuais enable row level security;

-- ─────────────────────────────────────────────────────────────────────
-- 2. SIMULAÇÕES VINCULADAS AO LEAD
-- ─────────────────────────────────────────────────────────────────────

create table public.crm_simulacoes (
  "id" uuid primary key default gen_random_uuid(),
  "lead_id" uuid references public.leads(id) on delete cascade,
  "admin_id" uuid references public.admin_users(id) on delete set null,
  "empreendimento_slug" text,
  "empreendimento_nome" text,
  "valor_imovel" numeric(14,2) not null,
  "entrada" numeric(14,2),
  "parcelas_qtd" integer,
  "parcelas_valor" numeric(14,2),
  "reforcos_qtd" integer,
  "reforcos_valor" numeric(14,2),
  "chaves_valor" numeric(14,2),
  "correcao" text,
  -- Espelho do cenário completo (tabela de prazos, comparativo bancário,
  -- cronograma) para reabrir a simulação exatamente como foi apresentada.
  "detalhes" jsonb not null default '{}'::jsonb,
  "client_event_id" uuid,
  "created_at" timestamptz not null default now(),
  constraint crm_simulacoes_valor_check check (valor_imovel > 0)
);

create index crm_simulacoes_lead_idx on public.crm_simulacoes (lead_id, created_at desc);
create unique index crm_simulacoes_client_event_unique
  on public.crm_simulacoes (client_event_id) where (client_event_id is not null);

alter table public.crm_simulacoes enable row level security;

-- ─────────────────────────────────────────────────────────────────────
-- 3. FILTROS AVANÇADOS DE IMÓVEL
-- ─────────────────────────────────────────────────────────────────────
-- As colunas vão em `properties`, não em `empreendimentos`: o inventário
-- real vive lá (36 imóveis contra 5), e é `properties` que o dashboard
-- lista e o site público consome. `empreendimentos` fica só como alvo das
-- FKs históricas (leads.empreendimento_interesse, crm_propostas).
--
-- `comodidades` é vocabulário CONTROLADO, e por isso não reaproveita as
-- colunas `lazer`/`diferenciais` que já existem: aquelas são texto livre
-- escrito para leitura humana ("piscina aquecida com raia de 25m"), o que
-- não dá para filtrar de forma confiável.

alter table public.properties
  add column if not exists aceita_financiamento boolean not null default false,
  add column if not exists aceita_permuta boolean not null default false,
  add column if not exists parcelamento_construtora boolean not null default false,
  add column if not exists mobilia text,
  add column if not exists comodidades text[] not null default '{}'::text[];

alter table public.properties
  add constraint properties_mobilia_check
  check (mobilia is null or mobilia in ('sem_mobilia', 'planejados', 'mobiliado'));

-- GIN responde "tem churrasqueira a carvão?" sem tabela de junção.
create index properties_comodidades_idx on public.properties using gin (comodidades);
create index properties_condicoes_idx on public.properties
  (aceita_financiamento, aceita_permuta, parcelamento_construtora);
create index properties_cidade_bairro_idx on public.properties (cidade, bairro);

-- ─────────────────────────────────────────────────────────────────────
-- 4. REDE DE CORRETORES + COMISSÕES
-- ─────────────────────────────────────────────────────────────────────

-- admin_id é NULLABLE de propósito: um corretor parceiro da rede pode
-- existir (e receber comissão) sem nunca ter login no painel.
create table public.crm_corretores (
  "id" uuid primary key default gen_random_uuid(),
  "admin_id" uuid references public.admin_users(id) on delete set null,
  "nome" text not null,
  "creci" text,
  "whatsapp" text,
  "email" text,
  "percentual_padrao" numeric(5,2) not null default 6.00,
  "ativo" boolean not null default true,
  "observacoes" text,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint crm_corretores_percentual_check check (percentual_padrao >= 0 and percentual_padrao <= 100)
);

create unique index crm_corretores_admin_unique
  on public.crm_corretores (admin_id) where (admin_id is not null);
create index crm_corretores_ativo_idx on public.crm_corretores (ativo) where (ativo = true);

alter table public.crm_corretores enable row level security;

-- Quem captou o imóvel para a rede. Permite "Meus imóveis" vs "Todos".
-- Em `properties` pelo mesmo motivo dos filtros: é lá que o inventário está.
alter table public.properties
  add column if not exists corretor_captador_id uuid references public.crm_corretores(id) on delete set null;

create index properties_captador_idx on public.properties (corretor_captador_id);

create table public.crm_comissoes (
  "id" uuid primary key default gen_random_uuid(),
  "proposta_id" uuid references public.crm_propostas(id) on delete set null,
  "lead_id" uuid references public.leads(id) on delete set null,
  "empreendimento_id" uuid references public.empreendimentos(id) on delete set null,
  "valor_venda" numeric(14,2) not null,
  "percentual_total" numeric(5,2) not null default 6.00,
  "valor_comissao" numeric(14,2) not null,
  "corretor_captador_id" uuid references public.crm_corretores(id) on delete set null,
  "corretor_vendedor_id" uuid references public.crm_corretores(id) on delete set null,
  -- Divisão entre quem captou e quem vendeu. Somam 100 quando os dois
  -- existem; com um só corretor, ele fica com 100.
  "percentual_captador" numeric(5,2) not null default 50.00,
  "percentual_vendedor" numeric(5,2) not null default 50.00,
  "status" text not null default 'prevista',
  "data_venda" date,
  "data_recebimento" date,
  "observacoes" text,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint crm_comissoes_status_check check (status in ('prevista', 'confirmada', 'recebida', 'cancelada')),
  constraint crm_comissoes_valores_check check (valor_venda > 0 and valor_comissao >= 0),
  constraint crm_comissoes_percentuais_check check (
    percentual_total >= 0 and percentual_total <= 100
    and percentual_captador >= 0 and percentual_captador <= 100
    and percentual_vendedor >= 0 and percentual_vendedor <= 100
    and (percentual_captador + percentual_vendedor) = 100
  )
);

create index crm_comissoes_status_idx on public.crm_comissoes (status, data_venda desc);
create index crm_comissoes_captador_idx on public.crm_comissoes (corretor_captador_id);
create index crm_comissoes_vendedor_idx on public.crm_comissoes (corretor_vendedor_id);
create index crm_comissoes_lead_idx on public.crm_comissoes (lead_id);
create unique index crm_comissoes_proposta_unique
  on public.crm_comissoes (proposta_id) where (proposta_id is not null);

alter table public.crm_comissoes enable row level security;

-- ─────────────────────────────────────────────────────────────────────
-- Agregação das atividades do dia no banco.
--
-- Contatos, follow-ups e visitas saem dos eventos que o sistema já grava —
-- é isso que dispensa o corretor de digitar. Só conteudo/reuniao vêm de
-- crm_atividades_manuais. Fronteira do dia em America/Sao_Paulo (a Vercel
-- roda em UTC; sem isso, das 21h à meia-noite tudo cairia no dia seguinte).
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.resumo_atividades_dia(p_admin_id uuid, p_data date)
returns jsonb
language sql
stable
set search_path to 'public', 'pg_temp'
as $function$
  with limites as (
    select
      (p_data::timestamp at time zone 'America/Sao_Paulo') as ini,
      ((p_data + 1)::timestamp at time zone 'America/Sao_Paulo') as fim
  ),
  eventos as (
    select action_type, count(*) as n
    from crm_focus_events, limites
    where admin_id = p_admin_id and created_at >= limites.ini and created_at < limites.fim
    group by action_type
  ),
  visitas_agenda as (
    select count(*) as n
    from crm_agenda, limites
    where admin_id = p_admin_id and tipo = 'visita' and status = 'concluido'
      and updated_at >= limites.ini and updated_at < limites.fim
  ),
  manuais as (
    select tipo, sum(quantidade)::int as n
    from crm_atividades_manuais
    where admin_id = p_admin_id and "data" = p_data
    group by tipo
  )
  select jsonb_build_object(
    'novos_contatos', coalesce((select n from eventos where action_type = 'contato_confirmado'), 0),
    'followups',      coalesce((select n from eventos where action_type = 'followup_agendado'), 0),
    'visitas',        coalesce((select n from visitas_agenda), 0),
    'conteudos',      coalesce((select n from manuais where tipo = 'conteudo'), 0),
    'reunioes',       coalesce((select n from manuais where tipo = 'reuniao_presencial'), 0)
  );
$function$;

revoke all on function public.resumo_atividades_dia(uuid, date) from public, anon, authenticated;
grant execute on function public.resumo_atividades_dia(uuid, date) to service_role;
