# Validação — SEO Sprint 2026-07-21

Todos os comandos abaixo rodaram no worktree isolado `stivenallan-seo-sprint`, branch `seo/organic-sprint-20260721-2118`, com `npm ci` (imutável) já aplicado.

## Atualização — rodada P0/P1 (mesma data, sessão de retomada)

Uma revisão somente-leitura pós-commit inicial encontrou 2 achados novos, não cobertos no commit anterior:

1. **`/lancamentos/tubarao-sc`** aparecia no sitemap de produção (Tubarão só tem empreendimentos Eraldo, visíveis via Supabase) mas a rota `[cidade]` não tinha entrada para "tubarao"/"tubarao-sc" no dicionário `CIDADES` — a página caía num fallback que retornava **HTTP 200 com "Cidade não encontrada"**, título e canonical genéricos da home.
2. **`aura-residence-centro-criciuma-sc`** tem página estática real, mas dependia 100% do Supabase pra aparecer no sitemap (não tinha fallback estático como os outros 8 Eraldo) — se o Supabase caísse durante o build do sitemap, a URL sumiria silenciosamente, mesmo a página continuando no ar.

### Decisões e correções aplicadas

- **Tubarão (P0)**: adicionadas as chaves `'tubarao'`/`'tubarao-sc'` ao dicionário `CIDADES` em `src/app/lancamentos/[cidade]/page.tsx`, com dados reais extraídos de `src/data/eraldo/gran-palazzo.ts` e `src/data/eraldo/play.ts` (2 empreendimentos Eraldo Construções reais na Vila Moema, Tubarão/SC — únicos existentes na cidade). A listagem de empreendimentos da página agora combina Fontana (`@/data/imoveis`, como já era) **e** Eraldo por cidade (`ERALDO_POR_CIDADE`, nova, fonte real), sem inventar preço/dormitórios onde o dado não existe (`exibir_preco: false`, `dorms: ''`).
- **Correção estrutural (P0, além do pedido literal)**: o branch `if (!info)` da página, que antes renderizava "Cidade não encontrada" com HTTP 200, agora chama `notFound()` (de `next/navigation`). Isso não é específico de Tubarão — vale para **qualquer** cidade futura que apareça via Supabase antes de ganhar uma entrada real em `CIDADES`, prevenindo a recorrência da mesma classe de bug.
- **Aura Residence (P1)**: `sitemap.ts` agora deriva os 8 slugs Eraldo que têm arquivo de dados (`src/data/eraldo/{arbor,gran-michel,gran-palazzo,harmony,horizon,lessence,play,symphony}.ts`) importando os objetos reais em vez de uma string hardcoded — e Aura, que **não** tem arquivo de dados (página bespoke mais antiga, anterior a esse padrão), ganhou sua **própria** lista separada (`auraPages`), em vez de ser misturada no array dos outros 8 (pedido explícito do usuário: "não a coloque artificialmente no array de outra construtora").
- **Config de teste**: `vitest.config.ts` precisou de `oxc: { jsx: { runtime: 'automatic' } }` pra conseguir importar um componente `.tsx` diretamente num teste pela primeira vez neste projeto (todos os 18 testes originais só testavam `lib/*.ts` e `route.ts`) — `tsconfig.json` do app usa `jsx: "preserve"` (o Next.js faz seu próprio transform via SWC), o que quebra o parser do Vitest/oxc ao importar `.tsx` sem esse ajuste. Mudança isolada ao test runner, não afeta o build da aplicação (`next build` continua `✓ Compiled successfully` sem essa opção).
- **`next.config.ts`**: exportado `nextConfig` (objeto bruto, pré-Sentry-wrap) como named export só pra permitir testar `redirects()` diretamente sem depender de como `withSentryConfig` repassa essa propriedade.

### Testes novos (prova das 4 garantias pedidas)

| Arquivo | O que prova |
|---|---|
| `src/app/lancamentos/[cidade]/page.test.ts` | Tubarão: `generateMetadata` com title/canonical reais; página renderiza "Gran Palazzo" e "Play Residence", nunca "Cidade não encontrada". Cidade sem dados: `generateMetadata` retorna `{}`; página dispara `notFound()` (rejeita a Promise) |
| `src/app/sitemap.test.ts` | Sem `lastModified`; sem URLs duplicadas; Aura presente mesmo com Supabase indisponível (o ambiente de teste Node reproduz isso de verdade — `next/headers` `cookies()` lança fora de um request real, cai no mesmo catch de `getVitrineImoveis` observado localmente); os 8 Eraldo com dados próprios presentes; nenhuma URL `/imovel/`, `/agendar-visita/` ou `/imoveis`; todas no domínio canônico, sem `www`/`vercel.app` |
| `src/middleware.test.ts` | As 9 URLs confirmadas como descontinuadas retornam 410; uma URL válida e a home não retornam 410 |
| `tests/next-config-redirects.test.ts` | Os 7 redirects legados 1:1 continuam com `permanent: true` e destino correto; o wildcard `/imovel/:path*`/`/agendar-visita/:path*` não existe mais (trava a regressão); `/imoveis` → `/empreendimentos` continua de pé |

## Verificado localmente

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | **Passou**, sem erros |
| `npm run test -- --run` (vitest) | **Passou** — 22 arquivos de teste, **256 testes** (232 da sessão anterior + 24 novos: sitemap, middleware, next-config-redirects, lancamentos/[cidade]) |
| `npm run build` | **Passou** — `✓ Compiled successfully`, sem erros |
| `node scripts/seo-validate.mjs ...` (8 URLs do baseline) | **0 erros, 0 alertas** (repetido após as mudanças, sem regressão) |
| `curl` local — sitemap.xml | **61 URLs** (60 anteriores + Aura Residence), **0 duplicatas**, **0 `lastmod`** |
| `curl` local — `/lancamentos/tubarao-sc` | **HTTP 200**, título "Lançamentos Imobiliários em Tubarão/SC \| Stiven Allan", canonical self-referencial, conteúdo real (Gran Palazzo + Play Residence), **sem** "Cidade não encontrada" |
| `curl` local — `/lancamentos/cidade-inexistente-xyz-sc` | **HTTP 404** (antes seria 200 com "Cidade não encontrada") |
| `curl` local — 9 URLs descontinuadas | Todas **HTTP 410** (repetido após as mudanças) |
| `curl` local — `/imovel/residencial-bosco-del-montello-.../AP0097` | **HTTP 308 → destino 200**, 1 salto (repetido, sem regressão) |
| `curl` local — `/empreendimento/fontana/calliano-centro-criciuma-sc` | **HTTP 200** direto (repetido, sem regressão) |

## Verificado na produção atual (antes do deploy desta branch)

Ver `baseline.md` — tabela completa da seção 1. Resumo: home, listagem, 2 estáticas, 1 Eraldo (sem par dinâmico real), cidade, guia e LP todas 200/indexáveis corretas. `www` → apex 1 salto. `stivenallan.vercel.app` responde 200 com canonical correto apontando pro apex. Redirects legados testados: mapeados 1:1 funcionam (1 salto); Sordello e Volpago (descontinuados) caíam no wildcard 301→/empreendimentos (comportamento que este patch corrige, pendente de deploy). `www` + path legado = 2 saltos (fora do meu controle — plataforma Vercel). **Achado desta rodada**: `/lancamentos/tubarao-sc` em produção também retorna 200 com "Cidade não encontrada" hoje — mesma causa raiz, ainda não deployada.

## Pendente de deploy

Todas as mudanças de código (sitemap.ts, middleware.ts, next.config.ts, `[construtora]/[slug]/page.tsx`, `calliano-centro-criciuma-sc/page.tsx`, `lancamentos/[cidade]/page.tsx`, `vitest.config.ts`) estão commitadas na branch isolada e **não estão em produção ainda**. Nenhuma alegação de "resolvido no Google" é feita — só "corrigido no código, testado localmente".

## Pendente de validação GSC

- Confirmar, após deploy + nova janela de dados do GSC (mínimo 28 dias fechados pós-deploy), se a mudança de title/description do Calliano Residencial melhorou CTR na posição atual (~7.77).
- Confirmar via URL Inspection (fora do Windsor/Search Analytics) que as 9 URLs convertidas para 410 saem do relatório de Page Indexing como "não encontrada (404)" antigo e passam a "removida (410)", e que isso não gera erro de rastreamento inesperado.
- Confirmar que o sitemap de produção passa a ter 62 URLs únicas (70 − 8 duplicatas) após o deploy, agora incluindo Aura.
- Confirmar que `/lancamentos/tubarao-sc` em produção passa a retornar 200 com conteúdo real (Gran Palazzo + Play Residence), título e canonical corretos.

## Limitação de cobertura local (Supabase)

`.env.local` não permite conexão real ao Supabase neste ambiente. O teste local do sitemap (61 URLs) usa só o fallback estático (`eraldoComDadosProprios` + `auraPages` + `imoveis.ts`); a produção (70 URLs antes do deploy, 62 únicas esperadas depois) reflete os registros que já existem em `properties`. Diferente da rodada anterior, o teste automatizado (`src/app/sitemap.test.ts`) agora prova a ausência de dependência do Supabase pra Aura de forma automatizada e repetível, não só por leitura de código — a contagem exata pós-deploy (62 esperado) só pode ser confirmada contra produção real após o deploy.
