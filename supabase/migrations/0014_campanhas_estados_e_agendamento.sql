-- 0014_campanhas_estados_e_agendamento.sql
-- Amplia o ciclo de vida de campanhas (antes só existiam rascunho/enviando/
-- enviada/erro, sem CHECK constraint nenhum) e acrescenta trava de corrida
-- no bootstrap de envio.

-- Novas colunas de agendamento/cancelamento.
alter table public.campanhas add column if not exists agendada_para timestamptz;
alter table public.campanhas add column if not exists cancelada_em timestamptz;

-- Vocabulário completo de status, agora com CHECK constraint (não existia
-- nenhum antes — qualquer string passava). 'erro' foi mantido como está
-- (não renomeado pra 'falhou') porque já é valor gravado em rows reais;
-- a UI traduz pro rótulo "Falhou" (ver src/lib/campanhas/estados.ts).
alter table public.campanhas drop constraint if exists campanhas_status_check;
alter table public.campanhas add constraint campanhas_status_check
  check (status in ('rascunho', 'agendada', 'enviando', 'enviada', 'parcial', 'erro', 'cancelada'));

-- Trava contra corrida no bootstrap de envio: sem isso, duas requisições
-- concorrentes (clique duplo, ou o cron de agendamento rodando junto de um
-- clique manual em "Enviar agora") podiam inserir o MESMO lead duas vezes
-- como destinatário da mesma campanha, duplicando o envio. A trave em
-- código (transição atômica rascunho/agendada→enviando em
-- src/lib/campanhas/processar-envio.ts) já reduz a janela quase a zero; este
-- índice é a segunda camada de defesa em nível de banco.
--
-- Antes de aplicar, confirme que não há duplicatas já gravadas
-- (nenhuma esperada, mas o índice falha ao criar se houver):
--   select campanha_id, lead_id, count(*) from campanha_destinatarios
--   group by campanha_id, lead_id having count(*) > 1;
create unique index if not exists campanha_destinatarios_unico_por_lead
  on public.campanha_destinatarios (campanha_id, lead_id);

-- ROLLBACK (reversível):
--   drop index if exists campanha_destinatarios_unico_por_lead;
--   alter table public.campanhas drop constraint if exists campanhas_status_check;
--   alter table public.campanhas add constraint campanhas_status_check
--     check (status in ('rascunho', 'enviando', 'enviada', 'erro'));
--   -- (as colunas agendada_para/cancelada_em podem ficar — são aditivas e
--   -- inofensivas mesmo sem uso; só remova se precisar mesmo:
--   -- alter table public.campanhas drop column if exists agendada_para;
--   -- alter table public.campanhas drop column if exists cancelada_em;)
