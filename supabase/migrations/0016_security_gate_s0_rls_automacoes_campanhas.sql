-- Security Gate S0: contenção de emergência para 6 tabelas encontradas com
-- RLS desabilitado, sem nenhuma policy e com grants completos (SELECT,
-- INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER) para os papéis
-- `anon` e `authenticated`, idênticos aos de `service_role`. Confirmado por
-- auditoria somente-leitura em 2026-07-26: HEAD contra a Data API com a
-- chave anon pública retornou HTTP 200 com Content-Range real (contagem de
-- linhas) nas 6 tabelas, sem qualquer autenticação além dessa chave pública.
--
-- automacao_whatsapp_intervalos, automacao_whatsapp_mensagens e
-- automacao_email_passos guardam o conteúdo/regra das réguas de follow-up.
-- campanhas, campanha_destinatarios e campanha_eventos guardam campanhas de
-- e-mail e, nas duas últimas, e-mail do lead e o vínculo (lead_id) com a
-- tabela `leads` — dados pessoais.
--
-- Todo o acesso legítimo a essas 6 tabelas já é feito exclusivamente pelo
-- backend com SUPABASE_SERVICE_ROLE_KEY (rotas /api/admin/*, os crons de
-- followup/email-followup e o webhook do Resend) — confirmado por
-- levantamento de todas as referências no código antes desta migration.
-- Nenhum consumidor real usa `anon`/`authenticated` nessas tabelas, por isso
-- esta contenção não cria nenhuma policy para esses papéis: a ausência de
-- policy é intencional, e não uma lacuna a preencher depois.
--
-- Escopo deliberadamente limitado: não mexe em FORCE ROW LEVEL SECURITY
-- (desnecessário — `service_role` ignora RLS independente dessa flag), não
-- revoga USAGE do schema `public` (outras partes do site dependem dele), e
-- não altera privilégios padrão de funções, sequences ou de `service_role`
-- (exigem auditoria de impacto separada, fora deste Gate S0).
--
-- NUMERAÇÃO: a última migration commitada em origin/main é 0012. No momento
-- desta auditoria existem 3 migrations locais NÃO commitadas em outra
-- branch/worktree (0013_modo_foco.sql, 0014_modo_foco_client_event_id.sql,
-- 0015_modo_foco_hardening.sql) que ainda não subiram pra main. Para não
-- colidir com esse trabalho em andamento quando ele for commitado, esta
-- migration usa o número 0016 em vez do próximo número sequencial (0013).
-- Renumerar antes do merge se a numeração final divergir.

-- A) Habilita RLS nas 6 tabelas — sem policies, ou seja, nega todo acesso
--    de anon/authenticated e mantém `service_role`, que ignora RLS.
alter table public.automacao_whatsapp_intervalos enable row level security;
alter table public.automacao_whatsapp_mensagens enable row level security;
alter table public.automacao_email_passos enable row level security;
alter table public.campanhas enable row level security;
alter table public.campanha_destinatarios enable row level security;
alter table public.campanha_eventos enable row level security;

-- B) Remove explicitamente todo privilégio de anon/authenticated nas 6
--    tabelas — defesa em profundidade além do RLS (grant + RLS, não só um
--    dos dois). `service_role` não é mencionado aqui e mantém os privilégios
--    atuais intactos.
revoke all privileges on table public.automacao_whatsapp_intervalos from anon, authenticated;
revoke all privileges on table public.automacao_whatsapp_mensagens from anon, authenticated;
revoke all privileges on table public.automacao_email_passos from anon, authenticated;
revoke all privileges on table public.campanhas from anon, authenticated;
revoke all privileges on table public.campanha_destinatarios from anon, authenticated;
revoke all privileges on table public.campanha_eventos from anon, authenticated;

-- E) Corrige o privilégio padrão de tabelas futuras no schema `public`
--    criadas pelo role `postgres` — sem isso, qualquer tabela nova herdaria
--    o mesmo acesso total de anon/authenticated que causou esta exposição.
--    Escopo limitado a `FOR ROLE postgres`: o default privilege equivalente
--    do grantor `supabase_admin` (também encontrado na auditoria) não é
--    alterado aqui e fica registrado como pendência de auditoria separada.
alter default privileges for role postgres in schema public
  revoke all privileges on tables from anon, authenticated;
