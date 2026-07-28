-- Corrige o indice criado em 20260728200000: ele era PARCIAL
-- (where lead_id is not null), e o Postgres nao consegue inferir um indice
-- parcial num "ON CONFLICT (lead_id)" a menos que o predicado seja repetido
-- na propria query — coisa que o supabase-js nao expoe no
-- .upsert(..., { onConflict: 'lead_id' }). Resultado em producao: a conversao
-- de lead para cliente falhava com
--   "there is no unique or exclusion constraint matching the ON CONFLICT specification"
-- e, como registrarMudancaEstagio so loga o erro (nao lanca), a falha era
-- silenciosa: o lead mudava de estagio normalmente e o cliente nunca nascia.
--
-- Um indice unico TOTAL resolve e nao custa nada: o padrao do Postgres e
-- NULLS DISTINCT, entao N clientes cadastrados a mao (lead_id NULL) continuam
-- convivendo sem conflito — verificado contra o banco real antes deste commit.
drop index if exists public.crm_clientes_lead_id_key;

create unique index if not exists crm_clientes_lead_id_key
  on public.crm_clientes (lead_id);
