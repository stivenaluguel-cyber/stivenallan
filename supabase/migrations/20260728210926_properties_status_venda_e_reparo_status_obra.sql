-- 1) status_venda ganha coluna propria.
-- Antes `status` era usada para DUAS coisas ao mesmo tempo: o seletor
-- Ativo/Pausado/Encerrado da listagem do painel gravava por cima do status de
-- OBRA do empreendimento (na planta / em obras / pronto / entregue).
alter table public.properties
  add column if not exists status_venda text not null default 'ativo';

alter table public.properties
  drop constraint if exists properties_status_venda_check;
alter table public.properties
  add constraint properties_status_venda_check
  check (status_venda in ('ativo','pausado','encerrado'));

-- 2) Normaliza o vocabulario de status de obra para o unico que o site sabe
-- exibir (StatusObra em src/lib/empreendimentos.ts, renderizado por
-- statusLabel). Havia TRES vocabularios convivendo na mesma coluna, porque o
-- form de cadastro mandava `lancamento`/`em_obras` e a tela de edicao mandava
-- `em_construcao`/`breve_lancamento`/`concluido` — nenhum deles reconhecido.
-- 15 registros exibiam "Sob consulta" no lugar do status real.
update public.properties set status = 'em obras'  where status in ('obras','em_obras','em construcao','em_construcao');
update public.properties set status = 'na planta' where status in ('lancamento','breve_lancamento','planta');
update public.properties set status = 'entregue'  where status in ('concluido');

-- 3) Repara os 8 empreendimentos que perderam o status de obra por causa do
-- update parcial defeituoso (o PUT montava a linha inteira com `?? null`).
-- Valores restaurados da fonte de verdade estatica, src/data/imoveis.ts,
-- casados por slug. O `status is null` no WHERE garante idempotencia: rodar de
-- novo nao sobrescreve nada que ja tenha valor.
update public.properties set status = 'na planta' where status is null and slug = 'avezzano-centro-sideropolis-sc';
update public.properties set status = 'em obras'  where status is null and slug = 'bosco-del-montello-centro-criciuma-sc';
update public.properties set status = 'em obras'  where status is null and slug = 'due-fratelli-centro-criciuma-sc';
update public.properties set status = 'em obras'  where status is null and slug = 'pavia-rio-maina-criciuma-sc';
update public.properties set status = 'em obras'  where status is null and slug = 'pianezze-centro-icara-sc';
update public.properties set status = 'em obras'  where status is null and slug = 'rocca-pietore-centro-sideropolis-sc';
update public.properties set status = 'na planta' where status is null and slug = 'villaggio-verde-residenziale-grande-prospera-criciuma-sc';
update public.properties set status = 'pronto'    where status is null and slug = 'villammare-residencial-balneario-rincao-sc';

-- Nota: `campos-da-montanha-bom-jardim-da-serra-sc` fica com status
-- 'loteamento' de proposito. E um loteamento de verdade (terreno, nao
-- apartamento), entao nao existe StatusObra correspondente — forcar um valor
-- seria inventar dado. Ele exibe "Sob consulta", que e o comportamento correto
-- ate existir um vocabulario proprio para loteamentos.
