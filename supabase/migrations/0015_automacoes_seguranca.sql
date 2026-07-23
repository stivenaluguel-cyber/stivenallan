-- 0015_automacoes_seguranca.sql
-- Trava global de pausar/ativar automações, janela de horário permitido,
-- limite diário, histórico de alterações, e correção de acentuação nas
-- mensagens já semeadas pela migration 0011 (só corrige quem ainda tem o
-- texto original sem acento — se o usuário já editou pela tela, não mexe).

-- Config única (linha singleton) lida por ambos os crons antes de enviar
-- qualquer mensagem.
create table if not exists public.automacao_config (
  id boolean primary key default true check (id = true), -- trava de 1 linha só
  pausado boolean not null default false,
  horario_inicio text not null default '08:00',
  horario_fim text not null default '20:00',
  limite_diario integer, -- null = sem limite
  atualizado_em timestamptz not null default now()
);
insert into public.automacao_config (id) values (true) on conflict (id) do nothing;

comment on table public.automacao_config is
  'Configuração global das automações de follow-up (pausar/ativar, janela de horário, limite diário de envios).';

-- Histórico de alterações na cadência (quem mudou o quê e quando). payload_*
-- guarda o array completo antes/depois pra auditoria — volume baixo (edição
-- manual ocasional), não precisa de índice além do created_at.
create table if not exists public.automacao_historico (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('whatsapp', 'email', 'config')),
  payload_antes jsonb,
  payload_depois jsonb,
  criado_em timestamptz not null default now()
);

create index if not exists automacao_historico_tipo_idx on public.automacao_historico (tipo, criado_em desc);

-- Correção de acentuação — só troca linhas que AINDA têm o texto original
-- sem acento exato da migration 0011 (se o usuário já editou pela tela, o
-- texto não bate mais e o UPDATE não afeta aquela linha).
update public.automacao_whatsapp_mensagens set mensagem =
  'Oi {nome}! Com base no seu perfil, tenho condições especiais para {empreendimento}. Podemos conversar hoje?'
  where estagio_funil = 'qualificado' and ordem = 0
  and mensagem = 'Oi {nome}! Com base no seu perfil, tenho condicoes especiais para {empreendimento}. Podemos conversar hoje?';

update public.automacao_whatsapp_mensagens set mensagem =
  'Olá {nome}! Queria compartilhar uma novidade sobre {empreendimento} que pode te interessar muito.'
  where estagio_funil = 'qualificado' and ordem = 1
  and mensagem = 'Ola {nome}! Queria compartilhar uma novidade sobre {empreendimento} que pode te interessar muito.';

update public.automacao_whatsapp_mensagens set mensagem =
  '{nome}, que tal agendarmos uma visita ao {empreendimento}? Tenho horários disponíveis essa semana.'
  where estagio_funil = 'interessado' and ordem = 0
  and mensagem = '{nome}, que tal agendarmos uma visita ao {empreendimento}? Tenho horarios disponiveis essa semana.';

update public.automacao_whatsapp_mensagens set mensagem =
  'Oi {nome}! Ainda pensando em {empreendimento}? Posso tirar qualquer dúvida por aqui.'
  where estagio_funil = 'interessado' and ordem = 1
  and mensagem = 'Oi {nome}! Ainda pensando em {empreendimento}? Posso tirar qualquer duvida por aqui.';

update public.automacao_whatsapp_mensagens set mensagem =
  '{nome}, você teve chance de analisar a proposta do {empreendimento}? Fico à disposição para tirar qualquer dúvida.'
  where estagio_funil = 'proposta_enviada' and ordem = 0
  and mensagem = '{nome}, voce teve chance de analisar a proposta do {empreendimento}? Fico a disposicao para tirar qualquer duvida.';

update public.automacao_whatsapp_mensagens set mensagem =
  'Oi {nome}! Queria saber se surgiu alguma dúvida sobre a proposta. Posso agendar uma visita se preferir.'
  where estagio_funil = 'proposta_enviada' and ordem = 1
  and mensagem = 'Oi {nome}! Queria saber se surgiu alguma duvida sobre a proposta. Posso agendar uma visita se preferir.';

update public.automacao_whatsapp_mensagens set mensagem =
  'Olá {nome}! Confirmando nossa visita ao {empreendimento}. Você confirma presença? Qualquer imprevisto me avisa.'
  where estagio_funil = 'visita_agendada' and ordem = 0
  and mensagem = 'Ola {nome}! Confirmando nossa visita ao {empreendimento}. Voce confirma presenca? Qualquer imprevisto me avisa.';

-- ROLLBACK (reversível):
--   drop table if exists public.automacao_historico;
--   drop table if exists public.automacao_config;
--   -- a correção de acentuação não tem rollback automático (não guardamos o
--   -- texto antigo em lugar nenhum) — se precisar reverter, reaplique o texto
--   -- sem acento manualmente a partir do 0011_automacao_followup.sql original.
