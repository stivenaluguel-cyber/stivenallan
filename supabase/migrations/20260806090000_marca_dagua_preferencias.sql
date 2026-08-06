-- Marca d'água automática nas fotos de imóvel: configuração do corretor.
--
-- ⚠️ DEPENDÊNCIA ENTRE BRANCHES: esta migration faz ALTER TABLE em
-- `crm_preferencias`, criada na branch feat/score-operacao-dashboard
-- (migration 20260805230000_crm_preferencias.sql, ainda não mesclada nesta
-- branch — por isso não aparece em supabase/migrations/ aqui). A tabela JÁ
-- EXISTE em produção (aplicada em 05/08/2026 com autorização explícita do
-- usuário), mas a migration de CREATE TABLE só existe no histórico daquela
-- outra branch. Se as branches forem mescladas fora de ordem, aplicar esta
-- migration antes de crm_preferencias ser criada vai falhar (ALTER em
-- tabela inexistente) — mesclar feat/score-operacao-dashboard primeiro, ou
-- rebasear esta migration por cima daquela migration quando as branches
-- forem combinadas.
--
-- NÃO APLICADA em produção — escreve dados (colunas novas + bucket novo),
-- diferente de RPC read-only. Aguarda autorização explícita.
alter table public.crm_preferencias
  add column if not exists marca_dagua_logo_path text,
  add column if not exists marca_dagua_posicao text not null default 'inferior-direita',
  add column if not exists marca_dagua_opacidade numeric(3,2) not null default 0.60,
  add column if not exists marca_dagua_largura_relativa numeric(4,3) not null default 0.250;

alter table public.crm_preferencias
  add constraint crm_preferencias_marca_dagua_posicao_check
    check (marca_dagua_posicao in ('centro', 'inferior-direita', 'inferior-esquerda'));

alter table public.crm_preferencias
  add constraint crm_preferencias_marca_dagua_opacidade_check
    check (marca_dagua_opacidade > 0 and marca_dagua_opacidade <= 1);

alter table public.crm_preferencias
  add constraint crm_preferencias_marca_dagua_largura_check
    check (marca_dagua_largura_relativa > 0 and marca_dagua_largura_relativa <= 1);

-- Bucket dedicado pra logo do corretor. Público de propósito: é a marca
-- d'água que já vai aparecer em fotos públicas do site, não tem por que a
-- logo isolada ser mais restrita que o resultado final. Só 1 arquivo por
-- corretor na prática (a validação de upload já exige PNG ≤2MB), então sem
-- necessidade de teto de tamanho de bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('marcas-dagua', 'marcas-dagua', true, 2097152, array['image/png'])
on conflict (id) do nothing;
