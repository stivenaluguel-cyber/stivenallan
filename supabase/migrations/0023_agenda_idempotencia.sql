-- Auditoria encontrou uma lacuna real: o cache que impedia duplicar um
-- compromisso na Agenda ao reenviar Follow-up/Visita (umaVezPorTentativa em
-- page.tsx) vivia só em memória do componente React. Cenário não coberto:
--   1. Agenda criada com sucesso;
--   2. a chamada seguinte (registrar evento/pontuação) falha;
--   3. a página recarrega (memória perdida);
--   4. o usuário tenta de novo;
--   5. um SEGUNDO compromisso é criado na Agenda.
--
-- Correção: idempotência real no banco. client_event_id é opcional (a tela
-- de Agenda humana em /dashboard/agenda não manda esse campo e continua
-- funcionando exatamente igual) — só o Modo Foco envia, e quando envia, o
-- unique index parcial abaixo garante que o mesmo client_event_id nunca
-- cria uma segunda linha, não importa quantas vezes o POST for repetido.
alter table crm_agenda add column if not exists client_event_id uuid;

create unique index if not exists crm_agenda_client_event_id_unique
  on crm_agenda (client_event_id)
  where client_event_id is not null;
