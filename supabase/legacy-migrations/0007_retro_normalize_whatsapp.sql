-- 0007_retro_normalize_whatsapp.sql
-- Retro-normalização de leads legados: converte whatsapp com máscara/formatação
-- (ex: "(48) 9 9164-2332") para dígitos-só (ex: "48991642332").
--
-- A partir da Pilha A, novos leads já são normalizados no server via
-- normalizePhone(). Este script alinha o histórico com o padrão atual.
--
-- SEGURANÇA:
-- - Faz backup na coluna anotacoes ANTES de sobrescrever, se o valor original
--   for diferente do normalizado (rastreável em caso de auditoria).
-- - Rows onde regexp_replace resulta em string vazia são deixadas intactas
--   (evita apagar dados quando o campo tinha só símbolos).
-- - Rodar durante janela de baixo tráfego. Cerca de 5-15 segundos por 10k rows.

begin;

-- Coluna auxiliar temporária pro backup (removida no fim se tudo der certo)
alter table public.leads add column if not exists whatsapp_original_pre_normalize text;

-- Backup antes do update
update public.leads
set whatsapp_original_pre_normalize = whatsapp
where whatsapp_original_pre_normalize is null
  and whatsapp is not null
  and whatsapp ~ '\D';   -- só rows onde tem algum não-dígito (precisam de normalize)

-- Normaliza
update public.leads
set whatsapp = regexp_replace(whatsapp, '\D', '', 'g')
where whatsapp is not null
  and whatsapp ~ '\D'
  and regexp_replace(whatsapp, '\D', '', 'g') != '';   -- não vira empty

-- Comentário rastreável pra futuro debug
comment on column public.leads.whatsapp_original_pre_normalize is
  'Backup do whatsapp original antes da normalização retro do 0007. Pode ser dropada depois de validar em prod.';

commit;

-- Após validar (query manual + spot-check em algumas rows), rodar:
--   alter table public.leads drop column whatsapp_original_pre_normalize;
-- Deixado comentado propositalmente — decisão manual, não idempotente.
