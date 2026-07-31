-- Idempotência de mensagens do Instagram DM no webhook (/api/webhook/instagram).
--
-- A Meta reenvia a mesma entrega de webhook em caso de timeout ou resposta
-- não-2xx (comportamento documentado deles). O `message.mid` extraído em
-- extrairMensagensInstagram() já era guardado no payload processado, mas
-- nunca persistido nem checado — um reenvio duplicava a linha em
-- `interacoes`, poluindo o histórico de conversa exibido no Kanban.
--
-- `mid` é nulo pra todo canal que não seja Instagram (whatsapp não tem esse
-- conceito hoje) — por isso o índice único é parcial (`where mid is not
-- null`), em vez de NULLS NOT DISTINCT: aqui múltiplos nulos são o caso
-- normal e esperado, não uma falha de chave a proteger.

alter table public.interacoes
  add column if not exists mid text;

create unique index if not exists interacoes_mid_key
  on public.interacoes (mid)
  where mid is not null;
