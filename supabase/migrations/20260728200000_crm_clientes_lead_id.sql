-- Vincula crm_clientes ao lead de origem, pra permitir upsert seguro quando
-- um lead avança para o estágio "fechado" (conversão automática lead -> cliente,
-- ver src/lib/leads/registrar-mudanca-estagio.ts). Sem essa coluna, mover um
-- lead pra dentro e fora de "fechado" repetidas vezes criaria um cliente
-- duplicado a cada vez.
alter table public.crm_clientes
  add column if not exists lead_id uuid references public.leads(id) on delete set null;

create unique index if not exists crm_clientes_lead_id_key
  on public.crm_clientes (lead_id)
  where lead_id is not null;
