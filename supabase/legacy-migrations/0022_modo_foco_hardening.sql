-- Hardening apontado pelo advisor de segurança do Supabase logo após criar
-- record_focus_event:
--
-- 1) function_search_path_mutable (WARN): a função referenciava
--    crm_focus_events/crm_focus_sessions sem schema qualificado e sem
--    `SET search_path` fixo — um search_path manipulado poderia, em teoria,
--    fazer a função resolver esses nomes para objetos de outro schema.
--    Fixamos search_path = public, pg_temp (padrão recomendado pelo próprio
--    Supabase para toda função SQL/PLpgSQL).
--
-- 2) Por padrão o Postgres concede EXECUTE em funções novas do schema
--    public para PUBLIC (o que inclui anon/authenticated via PostgREST,
--    expondo /rest/v1/rpc/record_focus_event). A função é SECURITY INVOKER
--    (não DEFINER), então o INSERT/UPDATE internos já esbarrariam no RLS
--    habilitado sem policies nas duas tabelas se um anon tentasse chamar —
--    mas travamos isso explicitamente também, por defesa em profundidade:
--    só service_role (o único papel que o backend usa) pode executar.

alter function record_focus_event(
  uuid, uuid, uuid, text, text, text, int, jsonb, uuid, boolean, boolean
) set search_path = public, pg_temp;

revoke execute on function record_focus_event(
  uuid, uuid, uuid, text, text, text, int, jsonb, uuid, boolean, boolean
) from public, anon, authenticated;

grant execute on function record_focus_event(
  uuid, uuid, uuid, text, text, text, int, jsonb, uuid, boolean, boolean
) to service_role;
