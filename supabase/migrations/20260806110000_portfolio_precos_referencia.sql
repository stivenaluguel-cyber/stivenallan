-- Preço de referência por empreendimento, pra segmentação do portfólio em
-- tiers de preço (lib/portfolio/tiers.ts).
--
-- Fonte escolhida, confirmada por introspecção (não pelas migrations
-- locais):
--   - `properties.preco` existe mas está 100% NULO (0 de 36 linhas) — não
--     é usável.
--   - `empreendimentos.preco_a_partir_de` só está preenchido em 4 de 39
--     linhas — sparso demais.
--   - `empreendimentos_unidades.valor_tabela` está 100% preenchido (578 de
--     578 linhas, positivo em todas), cobrindo 33 empreendimentos
--     distintos — a fonte real e completa.
--
-- `properties` não tem FK pra `empreendimentos`/`empreendimentos_unidades`
-- (só texto solto: slug, nome, construtora_slug), MAS `properties.slug` e
-- `empreendimentos.slug` batem exatamente pras 36 linhas (confirmado por
-- join direto, 36/36 — não é match aproximado por nome, é igualdade exata
-- de slug). Diferente do caso de `properties.galeria` (links soltos do
-- Google Drive da construtora, sem correspondência confiável no schema),
-- aqui a chave de junção é real e verificável.
--
-- MIN(valor_tabela) por empreendimento = "a partir de R$X", a convenção
-- padrão do mercado imobiliário pra preço de anúncio (mesmo nome já usado
-- em `empreendimentos.preco_a_partir_de`).
--
-- 33 de 36 properties resolvem preço por essa cadeia (as 3 sem preço são
-- empreendimentos sem nenhuma unidade importada no espelho — ex.: Águas de
-- Marano, removido do Drive pela construtora, já mapeado em memória
-- separada). 33 está bem acima do piso de 9 pra tercis fazerem sentido.
--
-- RPC read-only, mesmo padrão de score_operacao_agregados/
-- meta_diaria_agregados — pode ser aplicada com autorização simples.
create or replace function public.portfolio_precos_referencia()
returns jsonb
language sql
stable
as $$
  select coalesce(
    jsonb_agg(jsonb_build_object('id', p.id, 'preco', pm.preco_min, 'ativo', p.ativo)),
    '[]'::jsonb
  )
  from public.properties p
  join public.empreendimentos e on e.slug = p.slug
  join lateral (
    select min(u.valor_tabela) as preco_min
    from public.empreendimentos_unidades u
    where u.empreendimento_id = e.id and u.valor_tabela > 0
  ) pm on pm.preco_min is not null
$$;

grant execute on function public.portfolio_precos_referencia() to service_role;
