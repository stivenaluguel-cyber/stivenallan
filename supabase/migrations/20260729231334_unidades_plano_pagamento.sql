-- Plano de pagamento por unidade.
--
-- O espelho já mostra preço e disponibilidade, mas o botão só oferecia
-- "Reservar 48h" — um pedido alto para quem acabou de chegar na página. O que
-- move a conversa no financiamento direto é o COMO PAGA: entrada, parcela,
-- reforço. Esse dado existe na tabela da construtora e o importador já lia,
-- mas não tinha onde guardar.
--
-- Por que jsonb e não colunas:
--
-- Cada empreendimento tem um plano diferente — Pineto é 8% de entrada + 40
-- parcelas + 4 reforços; Thiene é 10% com condição especial de 40% até as
-- chaves; Aura é 40/60. Colunas fixas (parcela_valor, reforco_qtd...) só
-- caberiam no plano de hoje e virariam NULL no primeiro empreendimento com
-- estrutura diferente. O jsonb guarda a forma que o plano TEM, não a que
-- gostaríamos que tivesse.
--
-- E resolve de quebra o `cub_fator`: aquela coluna é numeric(6,4), teto de
-- 99,9999, desenhada como multiplicador (default 1.0). A QUANTIDADE de CUBs
-- do Pineto vai de 210 a 264 e estourava o campo — por isso as 54 unidades
-- foram importadas com cub_fator nulo. A quantidade passa a viver aqui, onde
-- cabe, e `cub_fator` fica reservado ao uso original de multiplicador.

alter table public.empreendimentos_unidades
  add column if not exists plano_pagamento jsonb;

comment on column public.empreendimentos_unidades.plano_pagamento is
  'Plano de pagamento da tabela da construtora. Forma esperada: '
  '{entrada, parcelas_qtd, parcela_valor, reforcos_qtd, reforco_valor, '
  'saldo_financiamento, cub_quantidade, percentual_ate_chaves}. '
  'jsonb porque cada empreendimento tem uma estrutura diferente.';

-- Índice parcial: as consultas do espelho perguntam "quais unidades têm plano
-- para exibir", nunca varrem o conteúdo do jsonb. Um GIN aqui seria caro e
-- inútil; o parcial responde a pergunta real e ocupa quase nada.
create index if not exists empreendimentos_unidades_com_plano_idx
  on public.empreendimentos_unidades (empreendimento_id)
  where (plano_pagamento is not null);
