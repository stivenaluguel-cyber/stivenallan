-- Prospecção: busca ativa de empresas via Google Places, qualificadas por IA.
--
-- Motivo: o dashboard hoje só recebe lead que chega sozinho (site, DM do
-- Instagram, Google Leads, CSV). Não existe nada que SAIA procurando
-- contato — o que a campanha de imóvel-como-investimento PJ e a rede de
-- parceiros (corretores/imobiliárias) do SA Gestão precisam.
--
-- Tabela separada de `leads` de propósito: `leads.whatsapp` é NOT NULL e
-- UNIQUE, e o Modo Foco/SLA/score tratam todo lead como alguém que já
-- interagiu. Um resultado de busca (frio, sem contato ainda, às vezes sem
-- telefone confiável) envenenaria a fila do Modo Foco se caísse direto ali.
-- `prospeccao_leads.lead_id` é o elo — só populado quando o corretor decide
-- promover aquele resultado pra um lead de verdade.
create table public.prospeccao_campanhas (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.admin_users (id) on delete set null,
  nome text not null,
  -- As 5 respostas do formulário que viraram o perfil de cliente ideal.
  produto text not null,
  publico text,
  problema text,
  localizacao text,
  exemplos text,
  -- Saída da IA a partir das respostas acima — guardada pra reexibir a
  -- campanha sem rechamar o modelo.
  alvo text,
  abordagem text,
  estrategia text,
  criterios jsonb not null default '[]'::jsonb,
  queries_busca jsonb not null default '[]'::jsonb,
  leads_solicitados integer not null default 0,
  leads_entregues integer not null default 0,
  status text not null default 'ativa',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index prospeccao_campanhas_admin_idx on public.prospeccao_campanhas (admin_id, created_at desc);

-- Convenção do projeto: RLS ligado sem policy = acesso só pelo service_role.
alter table public.prospeccao_campanhas enable row level security;

create table public.prospeccao_leads (
  id uuid primary key default gen_random_uuid(),
  campanha_id uuid not null references public.prospeccao_campanhas (id) on delete cascade,
  -- Place ID do Google — chave de dedupe entre buscas repetidas na mesma
  -- campanha ("Garimpar mais") e o único id estável antes de existir CNPJ.
  place_id text not null,
  nome text not null,
  endereco text,
  telefone text,
  site text,
  rating numeric(2, 1),
  rating_count integer,
  tipos jsonb not null default '[]'::jsonb,
  score integer,
  score_fit integer,
  score_potencial integer,
  score_acessibilidade integer,
  classificacao text,
  contexto_ia text,
  status text not null default 'novo',
  -- Populado só quando promovido para `leads` — ver comentário da tabela acima.
  lead_id uuid references public.leads (id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index prospeccao_leads_unica_por_campanha on public.prospeccao_leads (campanha_id, place_id);
create index prospeccao_leads_campanha_idx on public.prospeccao_leads (campanha_id, score desc nulls last);

alter table public.prospeccao_leads enable row level security;

comment on table public.prospeccao_campanhas is
  'Campanha de busca ativa (Google Places + IA) — o perfil de cliente que a IA monta a partir das respostas do formulário.';
comment on table public.prospeccao_leads is
  'Resultado de uma busca de Prospecção. lead_id só é preenchido quando o corretor promove o resultado para um lead de verdade em public.leads.';
