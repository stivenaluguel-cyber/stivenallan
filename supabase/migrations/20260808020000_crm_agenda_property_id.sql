-- Fundação do vínculo crm_agenda -> properties (Item 10A).
--
-- Objetivo: permitir que um compromisso da Agenda real (crm_agenda) aponte
-- pra exatamente qual imóvel ele é sobre. Hoje isso não existe — auditado
-- via database.generated.ts + introspecção (pg_class/pg_policies/pg_indexes)
-- antes de escrever esta migration:
--   - crm_agenda tem lead_id (FK -> leads.id) mas nenhuma coluna de imóvel.
--   - leads.property_id é um campo DO LEAD (um valor só, sobrescrito a cada
--     mudança de interesse) — não identifica qual imóvel uma visita
--     ESPECÍFICA, entre várias marcadas ao longo do tempo, é sobre.
--   - lead_property_interests é N:N (várias linhas de interesse por lead),
--     sem nenhuma ligação de volta pra um compromisso específico da agenda
--     — não dá pra saber qual linha de interesse corresponde a qual visita.
--   - agendamentos.empreendimento_id (tabela legada, gravada hoje pela IA
--     via agent.ts) referencia `empreendimentos`, não `properties` — as
--     duas tabelas não têm coluna de ligação entre si (achado do Item 9).
--
-- Esta migration é exclusivamente aditiva: cria a coluna, a FK e o índice.
-- NÃO faz backfill (registros antigos de crm_agenda não têm informação
-- relacional confiável pra inferir a property — nenhuma heurística de nome/
-- descrição/legado foi usada), NÃO altera `agendamentos`, NÃO altera RLS
-- (crm_agenda já está com RLS ligado e zero policies — mesmo padrão de
-- crm_notas_fiscais; acesso real é 100% via service_role no backend, que
-- ignora RLS por definição, então uma coluna nova não muda esse contrato).
--
-- O código do agent (src/lib/agent.ts) e a API/dashboard da Agenda
-- (src/app/api/admin/agenda/route.ts, src/app/dashboard/agenda/page.tsx)
-- NÃO são alterados aqui — ficam para o Item 10B, depois desta migration
-- ser aplicada e os tipos oficiais regenerados via `supabase gen types`.
--
-- NÃO APLICADA em produção — escreve schema novo. Aguarda autorização
-- explícita.

alter table public.crm_agenda
  add column if not exists property_id uuid;

alter table public.crm_agenda
  add constraint crm_agenda_property_id_fkey
  foreign key (property_id)
  references public.properties(id)
  on delete set null;

create index if not exists crm_agenda_property_id_idx
  on public.crm_agenda using btree (property_id);
