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
-- NUMERAÇÃO — reconciliada em 2026-07-26 cruzando 3 fontes read-only:
--
--   A) origin/main: última migration commitada é 0012.
--   B) supabase_migrations.schema_migrations (banco remoto, real): além de
--      0010-0012, há 4 versões aplicadas com nomes "modo_foco",
--      "modo_foco_rls", "modo_foco_client_event_id" e "modo_foco_hardening"
--      (timestamps 2026-07-26), que NÃO seguem a convenção NNNN_nome.sql e
--      não têm arquivo correspondente em origin/main — uma divergência de
--      histórico real (aplicado no banco, ausente da main). Confirmado por
--      leitura direta do conteúdo local (não commitado) desses arquivos:
--      eles só criam/alteram `crm_focus_sessions` e `crm_focus_events` —
--      zero sobreposição com as 6 tabelas desta migration. Registrado como
--      pendência de reconciliação separada, fora deste Gate S0; NÃO
--      renomeado/resolvido aqui.
--   C) Branch `fix/dashboard-hardening-audit` (local e em origin, ainda não
--      mergeada em main) já reivindica formalmente 0013 a 0018
--      (0013_cron_runs_status_partial.sql,
--      0014_campanhas_estados_e_agendamento.sql,
--      0015_automacoes_seguranca.sql, 0016_configuracoes_cub.sql,
--      0017_properties_status_enum.sql,
--      0018_empreendimentos_unidades_completo.sql) — nenhuma dessas 6 está
--      aplicada no banco remoto (ausentes de schema_migrations), mas os
--      números já estão comprometidos em git. Conteúdo dessas migrations
--      também revisado: não toca nas 6 tabelas desta contenção.
--
-- Como nem 0013 nem 0016 (escolha original desta migration) ficam livres em
-- todas as branches simultaneamente, o número usado é 0019 — confirmado sem
-- colisão em nenhuma branch local ou remota no momento desta revisão.
-- Renumerar antes do merge se a numeração final da main divergir disso.
--
-- ATOMICIDADE: nem Supabase CLI, nem Docker, nem Supabase Branching (exige
-- plano Pro — indisponível neste projeto) puderam ser usados para verificar
-- empiricamente se o mecanismo real de aplicação desta migration encapsula
-- todos os comandos numa única transação. Sem essa confirmação, o script é
-- deliberadamente envolto num BEGIN/COMMIT explícito para garantir
-- atomicidade independente do executor: se o executor já abrir sua própria
-- transação, o BEGIN aqui apenas emite um aviso inofensivo do Postgres
-- ("there is already a transaction in progress") e continua na mesma
-- transação — não há transação aninhada real, nem erro, nem risco de
-- contenção parcial em nenhum dos dois cenários. Todos os comandos deste
-- arquivo (ENABLE ROW LEVEL SECURITY, REVOKE, ALTER DEFAULT PRIVILEGES) são
-- válidos dentro de um bloco de transação no Postgres.

begin;

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

-- E) Impede grants automáticos para tabelas futuras criadas pelo role
--    `postgres` no schema `public`. Isso NÃO resolve universalmente todas
--    as tabelas futuras: o default ACL equivalente identificado sob o
--    grantor `supabase_admin` (também encontrado na auditoria, concedendo o
--    mesmo acesso total a anon/authenticated) permanece como pendência
--    S1 e não foi alterado nesta contenção — requer teste de impacto
--    próprio antes de qualquer mudança.
alter default privileges for role postgres in schema public
  revoke all privileges on tables from anon, authenticated;

commit;
