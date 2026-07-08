-- 0003_remove_hub_lavis_duplicado.sql
-- As páginas hub-smart-home-criciuma-sc e lavis-centro-criciuma-sc (duplicata do
-- Lavis Residencial oficial) foram removidas do código a pedido do usuário.
-- Sem isso, essas duas linhas voltam a aparecer na home e no sitemap.xml, porque
-- getVitrineImoveis() mescla properties do banco que não estão nos arrays estáticos.
-- Rodar no SQL Editor do Supabase (idempotente).

delete from public.properties
where slug in ('hub-smart-home-criciuma-sc', 'lavis-centro-criciuma-sc');
