-- Rollback de 20260805003000_lead_gate_identity_and_sessions.sql
-- Ordem inversa da migration. Não remove nenhuma coluna/tabela pré-existente.

drop function if exists public.record_property_interest(uuid, uuid, text, text, text, text, text, text, text, text, integer);
drop function if exists public.resolve_lead_for_gate(text, text, text, uuid, text, text, text, text, text, text, text, text, text, text, text, text);

drop index if exists public.leads_email_lower_idx;

drop index if exists public.lead_eventos_client_event_id_unique;
drop index if exists public.lead_eventos_created_at_idx;
drop index if exists public.lead_eventos_slug_idx;
drop index if exists public.lead_eventos_lead_id_idx;
alter table public.lead_eventos drop column if exists client_event_id;
alter table public.lead_eventos drop column if exists property_id;

drop table if exists public.lead_identity_conflicts;
drop table if exists public.lead_property_interests;
drop table if exists public.lead_access_sessions;
