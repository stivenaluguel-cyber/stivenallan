-- 0013_cron_runs_status_partial.sql
-- Adiciona o status 'partial' a cron_runs.status. Antes, um cron que enviava
-- 3 mensagens e errava 2 ainda gravava status='ok' (o campo só refletia se o
-- try/catch chegou ao fim, não se os envios individuais tiveram erro) — por
-- isso a tela de cron conseguia mostrar "100% de sucesso" e "10 erros de
-- envio" ao mesmo tempo. src/lib/cron/classificacao.ts agora calcula o
-- status de verdade a partir de enviados/erros_envio; esta migration só
-- amplia o CHECK constraint pra aceitar o novo valor.
--
-- Aditivo e seguro: nenhuma row existente tem status='partial' hoje, então
-- trocar o constraint não quebra nem reclassifica dado nenhum já gravado.
--
-- ROLLBACK (reversível): reverter para o constraint antigo só é seguro se
-- nenhuma row tiver status='partial' no momento — confirme com
-- `select count(*) from cron_runs where status = 'partial'` antes de rodar:
--   alter table public.cron_runs drop constraint if exists cron_runs_status_check;
--   alter table public.cron_runs add constraint cron_runs_status_check
--     check (status in ('running', 'ok', 'skipped', 'error'));

alter table public.cron_runs drop constraint if exists cron_runs_status_check;

alter table public.cron_runs add constraint cron_runs_status_check
  check (status in ('running', 'ok', 'partial', 'skipped', 'error'));
