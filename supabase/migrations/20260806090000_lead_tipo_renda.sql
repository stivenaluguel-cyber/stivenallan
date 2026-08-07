-- Qualificação de tipo de renda/vínculo no formulário de contato.
--
-- O diferencial de venda da Fontana é financiamento direto com a construtora,
-- sem análise bancária de renda formal — isso atrai especificamente quem TEM
-- patrimônio mas NÃO tem holerite CLT pra comprovar (empresário, autônomo,
-- profissional liberal PJ). Sem essa coluna, o lead chega com faixa de
-- investimento e entrada disponível, mas sem o dado que diz se o financiamento
-- direto é a arma certa pra fechar essa venda especificamente.
--
-- Nullable e sem default: leads antigos (e o teste de baixa fricção do Casa
-- Guaíba Park, que pula as 3 perguntas de qualificação) continuam válidos.

alter table public.leads
  add column if not exists tipo_renda text;
