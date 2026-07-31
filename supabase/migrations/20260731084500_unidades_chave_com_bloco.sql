-- A chave natural do espelho passa a incluir o BLOCO.
--
-- Prédio de várias torres repete o número do apartamento: o Pavia tem um 704
-- na T1 e outro na T2. Com a chave (empreendimento_id, unidade), um
-- sobrescreveria o outro no upsert da importação — sobrariam 9 unidades onde
-- há 10, sem erro nenhum, que é o modo de falha mais caro deste sistema.
--
-- NULLS NOT DISTINCT é obrigatório, não detalhe: 398 das 404 unidades têm
-- bloco nulo (prédio de torre única). O Postgres trata cada NULL como
-- distinto, então sem essa cláusula o índice deixaria de proteger justamente
-- a maioria — e a reimportação mensal passaria a INSERIR em vez de atualizar,
-- duplicando o espelho inteiro em silêncio.
--
-- Ordem proposital: o índice novo é criado ANTES de a restrição antiga sair,
-- para não existir janela sem proteção numa tabela de preços em produção.

create unique index if not exists empreendimentos_unidades_emp_bloco_unidade_key
  on empreendimentos_unidades (empreendimento_id, bloco, unidade)
  nulls not distinct;

alter table empreendimentos_unidades
  drop constraint if exists empreendimentos_unidades_empreendimento_id_unidade_key;
