-- O indice era PARCIAL (where whatsapp is not null and whatsapp <> ''), e
-- ON CONFLICT nao consegue inferir indice com clausula WHERE: o upsert da rota
-- publica falhava com 42P10 ("no unique or exclusion constraint matching the
-- ON CONFLICT specification"). Descoberto chamando a rota de verdade.
--
-- A clausula era redundante: `whatsapp` e NOT NULL na tabela, e string vazia
-- nao passa pela validacao da rota (normalizePhone devolve null). Indice total
-- resolve e ainda serve ao ON CONFLICT.
drop index if exists public.crm_proprietarios_whatsapp_key;

create unique index if not exists crm_proprietarios_whatsapp_key
  on public.crm_proprietarios (whatsapp);
