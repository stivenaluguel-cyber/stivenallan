-- 0017_properties_status_enum.sql
-- Corrige dois problemas reais e confirmados em produção (36 empreendimentos):
--
-- 1) `properties.status` é texto livre, sem enum — hoje convivem 8 grafias
--    diferentes representando só ~4 estados reais:
--      'obras' (13) + 'em obras' (5)      → em_obras
--      'entregue' (2) + 'pronto' (4)      → pronto
--      'na planta' (2) + 'lancamento' (1) → lancamento
--      'loteamento' (1)                   → loteamento (categoria própria)
--      null (8)                           → ver item 2 abaixo, NÃO fabricado
--
-- 2) Bug de código (já corrigido nesta mesma sessão em
--    src/app/api/admin/empreendimentos/route.ts e [id]/route.ts): o PUT
--    tratava "status de obra" e "status de venda" como a MESMA coluna
--    (status: form.status_venda ?? form.status_obra ?? null) — qualquer
--    edição que não mandasse status_venda explicitamente zerava o status
--    de obra pra null. Isso já apagou o status de 8 empreendimentos reais
--    (listados abaixo, NÃO adivinhados — ficam null de propósito, o usuário
--    precisa re-selecionar o status real de cada um pela tela de edição,
--    já corrigida):
--      Avezzano, Bosco Del Montello Residencial, Due Fratelli Residencial,
--      Pavia Residencial, Pianezze Residencial, Rocca Pietore Residencial,
--      Villaggio Verde Residenziale, Villammare Residencial
--
-- A correção de código junto com esta migration faz `status` passar a
-- representar SÓ status de obra; `status_venda` vira uma coluna própria
-- (antes também compartilhava a mesma coluna `status` via código, nunca
-- persistida separadamente de fato).

update public.properties set status = 'em_obras' where status in ('obras', 'em obras');
update public.properties set status = 'pronto' where status in ('entregue', 'pronto') and status <> 'pronto';
update public.properties set status = 'lancamento' where status in ('na planta', 'lancamento') and status <> 'lancamento';
-- 'loteamento' e null ficam como estão.

alter table public.properties drop constraint if exists properties_status_check;
alter table public.properties add constraint properties_status_check
  check (status is null or status in ('lancamento', 'em_obras', 'pronto', 'loteamento'));

alter table public.properties add column if not exists status_venda text not null default 'ativo';
alter table public.properties drop constraint if exists properties_status_venda_check;
alter table public.properties add constraint properties_status_venda_check
  check (status_venda in ('ativo', 'pausado', 'encerrado'));

-- ROLLBACK (reversível, exceto a normalização de texto — não há como saber
-- se uma linha 'em_obras' era originalmente 'obras' ou 'em obras'):
--   alter table public.properties drop constraint if exists properties_status_venda_check;
--   alter table public.properties drop column if exists status_venda;
--   alter table public.properties drop constraint if exists properties_status_check;
