-- ROLLBACK da migration 20260729171057_score_anexos_financeiro_metas
--
-- ⚠️ NÃO EXECUTADO. Documento de contingência.
-- Execute apenas se as 10 frentes precisarem ser revertidas DEPOIS de já
-- aplicadas em produção.
--
-- ─────────────────────────────────────────────────────────────────────
-- ANTES DE TUDO: você provavelmente NÃO precisa deste arquivo
-- ─────────────────────────────────────────────────────────────────────
--
-- A migration é puramente ADITIVA: não derruba, não renomeia e não muda o
-- tipo de nada que já existia, e as cinco funções que ela cria não existiam
-- em produção (conferido antes de aplicar). Isso significa que, com o código
-- ANTIGO rodando, o schema novo é inerte — nada o lê.
--
-- Portanto, se o problema for no CÓDIGO (tela quebrada, comportamento
-- errado), o caminho certo é reverter o DEPLOY, não o banco. Rodar este
-- rollback nesse cenário destrói dados sem resolver nada.
--
-- Use este arquivo só se o problema for no PRÓPRIO SCHEMA.
--
-- ─────────────────────────────────────────────────────────────────────
-- O QUE SE PERDE (leia antes de rodar)
-- ─────────────────────────────────────────────────────────────────────
--
-- PERDA DEFINITIVA DE DADOS:
--
-- 1. `crm_anexos` inteira — o catálogo de todo documento enviado (RG, CPF,
--    comprovante de renda, contratos). Os ARQUIVOS continuam no bucket
--    `documentos`, mas viram órfãos: sem a linha, nada no sistema sabe a
--    que lead pertencem, de que tipo são nem qual o nome original. Na
--    prática são irrecuperáveis pela interface, e continuam sendo cobrados
--    como armazenamento.
--    → Antes de rodar, exporte: select * from crm_anexos;
--
-- 2. `crm_comissao_parcelas` inteira — o plano de recebimento de cada
--    comissão, incluindo quais parcelas já foram baixadas e em que data.
--    A comissão em si sobrevive (crm_comissoes não é tocada), mas volta a
--    ser um valor único sem cronograma. O histórico de "o que já entrou"
--    não é reconstituível.
--
-- 3. `crm_metas_mensais` e `crm_metas_dia_historico` — as metas de VGV e o
--    calendário selado. O calendário é PARCIALMENTE reconstituível: os dias
--    voltam a ser calculados ao vivo a partir de crm_focus_events. Mas o
--    congelamento se perde, então dias antigos passam a ser avaliados
--    contra a meta ATUAL — que é exatamente a distorção que o selo existia
--    para evitar.
--
-- 4. `crm_propostas.valor_recebido`, `valor_a_receber`, `data_venda` e
--    `cliente_nome` — o financeiro de cada venda. `cliente_nome` é o mais
--    grave: vendas lançadas direto no Financeiro (sem lead) ficam SEM
--    NENHUMA identificação de cliente. A proposta sobrevive como um valor
--    anônimo.
--    → Antes de rodar, exporte:
--      select id, numero, cliente_nome, data_venda, valor_recebido, valor_a_receber
--      from crm_propostas where cliente_nome is not null or data_venda is not null;
--
-- 5. `leads.lead_score_detalhe` e `lead_score_atualizado_em` — a explicação
--    do score. `lead_score` (o número) NÃO é tocado e sobrevive, mas fica
--    congelado no último valor calculado, sem nada que o atualize e sem a
--    conta que o originou.
--
-- 6. `crm_metas_diarias.sla_primeiro_atendimento_min` — o alvo de SLA volta
--    ao padrão de 15 minutos embutido no código.
--
-- O QUE NÃO SE PERDE: leads, propostas (as linhas), comissões, agenda,
-- interações, eventos do Modo Foco, simulações, empreendimentos, CUB.
--
-- ─────────────────────────────────────────────────────────────────────
-- ORDEM
-- ─────────────────────────────────────────────────────────────────────
-- Funções primeiro (leem as tabelas), tabelas depois, colunas por último.

-- 1. Funções
drop function if exists public.sinais_lead_score(uuid[]);
drop function if exists public.leads_parados(integer, integer);
drop function if exists public.tempo_medio_movimentacoes(date, date, integer);
drop function if exists public.relatorio_vendas(date, date);
drop function if exists public.resumo_atividades_periodo(uuid, date, date);

-- 2. Tabelas novas
drop table if exists public.crm_anexos;
drop table if exists public.crm_comissao_parcelas;
drop table if exists public.crm_metas_dia_historico;
drop table if exists public.crm_metas_mensais;

-- 3. Colunas adicionadas
alter table public.crm_propostas
  drop constraint if exists crm_propostas_valores_recebimento_check;
drop index if exists public.crm_propostas_data_venda_idx;
alter table public.crm_propostas
  drop column if exists valor_recebido,
  drop column if exists valor_a_receber,
  drop column if exists data_venda,
  drop column if exists cliente_nome;

alter table public.crm_metas_diarias
  drop constraint if exists crm_metas_diarias_sla_check;
alter table public.crm_metas_diarias
  drop column if exists sla_primeiro_atendimento_min;

drop index if exists public.leads_score_idx;
alter table public.leads
  drop column if exists lead_score_detalhe,
  drop column if exists lead_score_atualizado_em;

-- 4. Bucket
--
-- O DELETE só passa com o bucket VAZIO. Isso é proposital: se ainda houver
-- documento de comprador lá dentro, o comando falha e obriga uma decisão
-- explícita em vez de apagar RG e comprovante de renda de gente real por
-- efeito colateral de um rollback.
--
-- Para esvaziar de propósito (irreversível):
--   delete from storage.objects where bucket_id = 'documentos';
delete from storage.buckets where id = 'documentos';
