# Validação — SEO Sprint 2026-07-21

Todos os comandos abaixo rodaram no worktree isolado `stivenallan-seo-sprint`, branch `seo/organic-sprint-20260721-2118`, com `npm ci` (imutável) já aplicado.

## Verificado localmente

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | **Passou**, sem erros (nenhum script `typecheck` dedicado no `package.json`; este é o equivalente real) |
| `npm run test -- --run` (vitest) | **Passou** — 18 arquivos de teste, 232 testes, 1.87s |
| `npm run build` | **Passou** — `✓ Compiled successfully`, sem erros de build. `sitemap.xml` gerado como rota dinâmica (`ƒ`), `middleware` compilado (47.6 kB) |
| `node scripts/seo-validate.mjs http://localhost:3912 / /empreendimentos /empreendimento/fontana/monte-leone-centro-criciuma-sc /empreendimento/fontana/calliano-centro-criciuma-sc /empreendimento/eraldo/arbor-centro-criciuma-sc /lancamentos/criciuma-sc /guia/financiamento-direto-construtora /lp/monte-leone-centro-criciuma-sc` | **0 erros, 0 alertas** em 8 URLs (title/canonical presentes, canonical no domínio certo, noindex só na LP) |
| `curl` local — sitemap.xml (`npm run start -p 3911`) | 60 URLs (local; produção tem 70 pela diferença conhecida do Supabase — ver limitação de cobertura), **0 ocorrências de `lastmod`**, **0 URLs duplicadas** |
| `curl` local — `/imovel/residencial-sordello-.../AP0110-194` | **HTTP 410** (era 308→/empreendimentos antes da mudança) |
| `curl` local — `/imovel/terrenos-em-condominio-.../TE0006-161` | **HTTP 410** |
| `curl` local — `/imovel/residencial-bosco-del-montello-.../AP0097` (mapeamento real, não descontinuado) | **HTTP 308 → `/empreendimento/fontana/bosco-del-montello-centro-criciuma-sc`** — continua funcionando, 1 salto |
| `curl` local — `/imovel/algum-slug-nunca-visto-999/XX9999-999` (path não mapeado, não confirmado como descontinuado) | **HTTP 404** — antes caía no wildcard 301→/empreendimentos; agora comportamento correto (não finge equivalência) |
| `curl` local — `/imoveis` | **HTTP 308 → `/empreendimentos`** — inalterado |
| `curl` local — `/empreendimento/fontana/monte-leone-centro-criciuma-sc` | **HTTP 200** — rota estática segue servindo normalmente (constante `SITE_URL` da rota dinâmica irmã foi realinhada, mas isso não afeta o slug estático, que nunca passa pela rota dinâmica) |

## Verificado na produção atual (antes do deploy desta branch)

Ver `baseline.md` — tabela completa da seção 1. Resumo: home, listagem, 2 estáticas, 1 Eraldo (sem par dinâmico real), cidade, guia e LP todas 200/indexáveis corretas. `www` → apex 1 salto. `stivenallan.vercel.app` responde 200 com canonical correto apontando pro apex. Redirects legados testados: mapeados 1:1 funcionam (1 salto); Sordello e Volpago (descontinuados) caíam no wildcard 301→/empreendimentos (comportamento que este patch corrige, pendente de deploy). `www` + path legado = 2 saltos (fora do meu controle — plataforma Vercel).

## Pendente de deploy

Todas as mudanças de código acima (sitemap.ts, middleware.ts, next.config.ts, `[construtora]/[slug]/page.tsx`, `calliano-centro-criciuma-sc/page.tsx`) estão commitadas na branch isolada e **não estão em produção ainda**. Nenhuma alegação de "resolvido no Google" é feita — só "corrigido no código, testado localmente".

## Pendente de validação GSC

- Confirmar, após deploy + nova janela de dados do GSC (mínimo 28 dias fechados pós-deploy), se a mudança de title/description do Calliano Residencial melhorou CTR na posição atual (~7.77).
- Confirmar via URL Inspection (fora do Windsor/Search Analytics) que as 9 URLs convertidas para 410 saem do relatório de Page Indexing como "não encontrada (404)" antigo e passam a "removida (410)", e que isso não gera erro de rastreamento inesperado.
- Confirmar que o sitemap de produção passa a ter 0 URLs duplicadas (hoje tem 8) após o deploy.

## Limitação de cobertura local (Supabase)

`.env.local` não permite conexão real ao Supabase neste ambiente. O teste local do sitemap (60 URLs) usa só o fallback estático de `eraldoSlugs` + `imoveis.ts`; a produção (70 URLs, com 8 duplicadas antes da correção) reflete os 8 registros Eraldo que já existem em `properties`. O dedupe implementado foi validado por leitura de código e por reprodução do cenário via os dois arrays de fallback simultâneos — a contagem exata pós-deploy (esperado: 62 URLs, 70 − 8 duplicatas) só pode ser confirmada contra produção real após o deploy.
