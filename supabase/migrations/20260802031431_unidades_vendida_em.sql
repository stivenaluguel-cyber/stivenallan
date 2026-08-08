-- Quando a unidade foi vendida.
--
-- `disponivel = false` já dizia QUE foi vendida, mas não QUANDO — e o corretor
-- precisa acompanhar o giro do estoque mês a mês. `updated_at` não serve: ele
-- muda em toda reimportação de tabela, que acontece todo mês em todas as
-- unidades.
--
-- Nulo em unidade disponível. Ao liberar uma baixa feita por engano
-- ("disponibilizar"), volta a nulo.
alter table public.empreendimentos_unidades
  add column if not exists "vendida_em" timestamp with time zone;

comment on column public.empreendimentos_unidades.vendida_em is
  'Data em que a unidade foi marcada como vendida. Nulo enquanto disponível.';

-- O relatório de vendas ordena por esta coluna, filtrando as não-vendidas.
create index if not exists empreendimentos_unidades_vendida_em_idx
  on public.empreendimentos_unidades (vendida_em desc)
  where vendida_em is not null;
