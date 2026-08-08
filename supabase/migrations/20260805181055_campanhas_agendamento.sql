-- Agendamento de campanhas de e-mail: permite marcar uma campanha 'rascunho'
-- pra ser processada automaticamente pelo cron (em vez de só pelo clique
-- manual em "Enviar agora"). status vira 'agendada' enquanto espera —
-- coluna livre (texto), mesma convenção já usada em campanhas.status hoje
-- (sem CHECK constraint), então não precisa alterar nenhum constraint.
alter table public.campanhas add column if not exists agendada_para timestamptz;

-- Índice pro cron: WHERE status='agendada' AND agendada_para<=now().
create index if not exists campanhas_agendada_para_idx
  on public.campanhas (agendada_para)
  where status = 'agendada';
