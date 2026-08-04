-- Base de conhecimento pro Allan IA (loop de auto-aprendizado, item 2).
--
-- Busca textual do Postgres (tsvector/GIN, config 'portuguese') — NÃO
-- embeddings/pgvector. O OPENAI_API_KEY do projeto hoje aponta pra Groq
-- (baseURL custom em src/lib/agent.ts), não é uma chave OpenAI de verdade;
-- RAG com embeddings exigiria contratar uma chave paga nova. Busca textual
-- é suficiente pra dezenas/centenas de entradas de um corretor solo.
--
-- aprovado default true cobre o caminho manual (o corretor que está
-- cadastrando já aprovou ao salvar); o caminho de sugestão automática
-- (origem='ia_sugerida', preenchido pelo cron) força aprovado=false na
-- aplicação — nunca no default da coluna, porque o default não sabe
-- distinguir os dois casos.
create table public.base_conhecimento (
  "id" uuid default gen_random_uuid() not null primary key,
  "pergunta" text not null,
  "resposta" text not null,
  "origem" text not null default 'manual',
  "aprovado" boolean not null default true,
  "ativo" boolean not null default true,
  "lead_id_origem" uuid references public.leads(id) on delete set null,
  "busca" tsvector generated always as (
    to_tsvector('portuguese', coalesce(pergunta, '') || ' ' || coalesce(resposta, ''))
  ) stored,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  constraint base_conhecimento_origem_check check (origem in ('manual', 'ia_sugerida'))
);

create index base_conhecimento_busca_idx on public.base_conhecimento using gin (busca);

alter table public.base_conhecimento enable row level security;

create policy service_role_all on public.base_conhecimento
  as permissive for all to service_role using (true) with check (true);
