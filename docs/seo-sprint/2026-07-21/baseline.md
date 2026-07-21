# Baseline — SEO Sprint 2026-07-21

Repo: `/Users/stivenallan/sistema-imoveis-stiven/stivenallan` · Branch: `seo/organic-sprint-20260721-2118` (worktree isolado)
Domínio canônico: `https://stivenallan.com.br` (sem `www`) · Stack: Next.js 15.3.9 App Router / Vercel.

Toda conclusão é classificada como **Confirmado**, **Parcialmente confirmado**, **Divergente** ou **Não verificável neste ambiente**, com fonte e data (2026-07-21).

## 0. Pré-voo (Bloco -1)

- Package manager: **npm** (`package-lock.json`). Scripts reais: `dev`, `build`, `start`, `lint`, `test` (vitest run), `test:coverage`. **Não existe script `typecheck`** — equivalente real é `npx tsc --noEmit`. — Confirmado, fonte: `package.json`.
- `npm ci` rodou limpo no worktree isolado (662 pacotes, 3 vulnerabilidades pré-existentes não relacionadas a este sprint, não tratadas aqui). — Confirmado.
- Windsor.ai conectado, connector `searchconsole` disponível para `sc-domain:stivenallan.com.br`. Schema exposto (`get_fields`) só cobre a tabela **Search Analytics** (query, page, clicks, impressions, ctr, position, device, country, search_type, date) e **Sitemaps** (submitted/indexed-deprecated/errors/warnings). **Não há Page Indexing nem URL Inspection acessível via Windsor.** — Confirmado, fonte: `mcp Windsor get_fields(searchconsole)`, 2026-07-21.
- Consequência: qualquer contagem de "páginas indexadas/rastreadas" fica **Não verificável neste ambiente**. Este relatório não afirma esses números em nenhum ponto.
- Período de dados usado: **28 dias fechados, 2026-06-18 a 2026-07-15** (hoje é 2026-07-21; deixamos ~6 dias de margem para lag de processamento do GSC, evitando dias parciais). Tipo de busca: web (padrão). Sem filtro de país/dispositivo (agregado). Sem truncamento aparente (39 queries, 54 páginas retornadas, volumes baixos — site de nicho local).

## 1. HTTP/HTML — produção (baixa frequência, 2026-07-21)

| URL | HTTP | Redirects | Title | Canonical | Robots meta | Indexável |
|---|---|---|---|---|---|---|
| `https://stivenallan.com.br/` | 200 | — | "Apartamentos na Planta com Financiamento Direto em Criciúma/SC" | self | index,follow | Sim |
| `https://www.stivenallan.com.br/` | 301 → apex | 1 hop | — | — | — | N/A (redirect) |
| `https://stivenallan.vercel.app/` | 200 | — | — | **`https://stivenallan.com.br`** (aponta pro apex, não pro próprio host) | index,follow | Sinal correto via canonical; ver nota abaixo |
| `https://stivenallan.com.br/empreendimentos` (listagem) | 200 | — | "Empreendimentos em Criciúma SC e região \| Stiven Allan" | self | index,follow | Sim |
| `.../empreendimento/fontana/monte-leone-centro-criciuma-sc` (estático) | 200 | — | "Monte Leone Residencial — Alto Padrão Criciúma/SC \| Stiven Allan" | self | index,follow | Sim |
| `.../empreendimento/fontana/calliano-centro-criciuma-sc` (estático) | 200 | — | "Calliano Residencial \| Centro Criciúma SC \| Stiven Allan" | self | index,follow | Sim |
| `.../empreendimento/eraldo/arbor-centro-criciuma-sc` (estático, sem par dinâmico real) | 200 | — | "Árbor \| Centro Criciúma \| Stiven Allan" | self | index,follow | Sim |
| `.../lancamentos/criciuma-sc` (cidade) | 200 | — | "Lançamentos Imobiliários em Criciúma/SC \| Stiven Allan" | self | index,follow | Sim |
| `.../guia/financiamento-direto-construtora` (guia) | 200 | — | "Financiamento Direto com a Construtora: Guia Completo \| Stiven Allan" | self | index,follow | Sim |
| `.../lp/monte-leone-centro-criciuma-sc` (LP) | 200 | — | "Monte Leone Residencial — condições direto com a construtora \| Stiven Allan" | aponta pro apex `/` (não pra si mesma) | **noindex,nofollow** | Não (por design, correto) |
| `.../imovel/residencial-bosco-del-montello-.../AP0097` (legado mapeado) | 308 | 1 hop | → `/empreendimento/fontana/bosco-del-montello-centro-criciuma-sc` (200) | — | — | Redirect correto, 1 salto |
| `.../imovel/residencial-sordello-.../AP0110-194` (legado, unidade descontinuada) | 308 | 1 hop | → `/empreendimentos` | — | — | **Ver achado B1-4** |
| `.../imovel/residencial-volpago-.../AP0115-200` (legado, unidade descontinuada) | 308 | 1 hop | → `/empreendimentos` | — | — | **Ver achado B1-4** |
| `www.stivenallan.com.br/imovel/residencial-bosco-del-montello-.../AP0097` (host antigo) | 301 então 308 | **2 hops** | www→apex, depois apex→destino final | — | — | **Ver achado B1-5** |
| `.../imoveis/?cidade=Urubici` (busca legada com querystring) | 308, 308 | 2 hops | trailing-slash + path → `/empreendimentos?cidade=Urubici` (200) | — | — | **Ver achado B1-6** |

## 2. Achados técnicos (Bloco 1) — Confirmados

**B1-1 — `lastmod` do sitemap usa data de build, não data real.**
`src/app/sitemap.ts:16` faz `const now = new Date()` e usa esse valor idêntico em **todas** as 70 URLs. Viola a regra "lastmod só pode existir se houver data real". Nenhuma fonte de dado (`imoveis.ts`, `properties` no Supabase via `getVitrineImoveis`) expõe `updated_at`/`atualizado_em`. — Confirmado, fonte: leitura de código + `curl https://stivenallan.com.br/sitemap.xml`, 2026-07-21.

**B1-2 — Sitemap de produção tem 8 URLs duplicadas (todas as 8 `/empreendimento/eraldo/*`).**
Contagem real do sitemap de produção: 70 `<loc>`, sendo as 8 URLs eraldo cada uma repetida 2×. Causa raiz: `getVitrineImoveis()` (`src/lib/vitrine.ts`) já mescla a tabela `properties` do Supabase com o estático — os 8 empreendimentos Eraldo agora existem em `properties` (o comentário em `sitemap.ts:89-91` afirma o contrário, mas está desatualizado), então `empPages` (linha 82-87) gera essas 8 URLs a partir do banco, e `eraldoPages` (linha 92-98) gera as mesmas 8 de novo via array hardcoded. — Confirmado, fonte: dump do sitemap de produção + leitura de `sitemap.ts` e `vitrine.ts`, 2026-07-21.

**B1-3 — Rota dinâmica `[construtora]/[slug]` usa `SITE_URL` local hardcoded, dessincronizada da constante central.**
`src/app/empreendimento/[construtora]/[slug]/page.tsx:19` redefine `const SITE_URL = 'https://stivenallan.com.br'` em vez de importar de `@/lib/site`. Valor atual é idêntico ao central (não há resíduo de vercel.app), mas a duplicação é um risco de divergência futura. Além disso essa rota não injeta o componente `<PropertySchema>` (JSON-LD de produto) que as páginas estáticas usam. — Confirmado, fonte: leitura de código, 2026-07-21. Nota: **hoje, para todos os 27 slugs Fontana + 8 Eraldo com pasta estática literal, essa rota dinâmica nunca é servida** (Next.js resolve segmento literal antes de `[param]`) — confirmado via dump do sitemap de produção, que só lista URLs estáticas. Não há atualmente nenhum empreendimento público que dependa exclusivamente da rota dinâmica.

**B1-4 — Redirect em massa para `/empreendimentos` de unidades confirmadas como descontinuadas (viola regra "nunca redirecionar em massa para página irrelevante sem equivalência real").**
`next.config.ts:112-124`: fallback wildcard `/imovel/:path*` e `/agendar-visita/:path*` → `/empreendimentos` (301/308), usado hoje para URLs de unidades que o próprio comentário do código (linha 66-71) identifica como descontinuadas: Sordello, Volpago, Gabiano, Belfiore, Hexa Prime, Longarone, terrenos/casas avulsas. Testado ao vivo: Sordello e Volpago confirmados batendo no wildcard (308 → `/empreendimentos`), sem equivalente real. Dado de negócio (comentário do próprio código) confirma remoção definitiva — pela regra, isso deveria ser **410**, não redirect para o catálogo. — Confirmado por teste HTTP + comentário de código como evidência de negócio, 2026-07-21.

**B1-5 — Cadeia de 2 saltos para URLs legadas acessadas via `www.stivenallan.com.br`.**
`www` → apex é um redirect 301 de **domínio/plataforma Vercel** (não existe no código do repo — não há regra `www` em `next.config.ts` nem em `middleware.ts`). Qualquer URL legada mapeada em `next.config.ts` (ex.: `/imovel/.../AP0097`) sofre esse 301 e **depois** o 308 específico do app → 2 saltos. Correção depende de configuração de domínio na Vercel (fora da autorização desta sessão: proibido acesso a Vercel/DNS). — Confirmado via teste HTTP; correção é **pendência do proprietário**.

**B1-6 — `/imoveis/?cidade=X` sofre 2 saltos (normalização de trailing slash do Next.js + redirect do app) e a querystring é preservada mas ignorada no destino.**
Teste ao vivo: `/imoveis/?cidade=Urubici` → 308 (trailing slash) → 308 (`/imoveis` → `/empreendimentos`) → 200 em `/empreendimentos?cidade=Urubici`, e a página de catálogo não lê esse parâmetro. Não é um bug grave (usuário chega num catálogo funcional), mas tecnicamente 2 saltos e parâmetro morto. Baixa prioridade dado o volume (1 impressão no período). — Confirmado, registrado como observação, não tratado nesta sessão por prioridade/tempo.

**B1-7 — `stivenallan.vercel.app` responde 200 (não é redirecionado nem bloqueado), mas o `<link rel="canonical">` renderizado nessa URL já aponta corretamente para `https://stivenallan.com.br`.**
Sinal técnico correto está presente (o app usa a constante `SITE_URL` fixa, independente do host da requisição). Não há resíduo de `stivenallan.vercel.app` em nenhum lugar do código-fonte (`grep` exaustivo em `src/`, `next.config.ts` — zero ocorrências). — Confirmado, fonte: `curl` + `grep` recursivo, 2026-07-21. Nenhuma ação de código necessária aqui.

**B1-8 — Hardcode de `SITE_URL` fora da constante central em páginas públicas relevantes para SEO.**
Arquivos que montam canonical/OG/JSON-LD com a URL literal em vez de importar `SITE_URL` de `@/lib/site`: `blog/page.tsx`, `blog/[slug]/page.tsx`, `contato/page.tsx`, `sobre/page.tsx`, `empreendimentos/page.tsx`, `lancamentos/[cidade]/page.tsx`, `lancamentos/[cidade]/[bairro]/page.tsx`, além do já citado `[construtora]/[slug]/page.tsx` e da página estática `mar-di-nizza-mar-grosso-laguna-sc`. Valor literal é idêntico ao correto — não há bug de domínio errado, só inconsistência de manutenção. — Confirmado, fonte: leitura de código, 2026-07-21.

## 3. Dados GSC — candidatas a CTR (Bloco 2), 28 dias fechados

Site de baixíssimo volume (a maioria das páginas/consultas tem menos de 20 impressões em 28 dias). Critério estrito de "mínimo 50 impressões" deixaria quase nenhuma candidata — aplicado como está, sem afrouxar, e documentado quem não passa:

| Página | Impressões | Posição média | CTR | Passa nos critérios? |
|---|---|---|---|---|
| `/empreendimento/fontana/calliano-centro-criciuma-sc` | 57 | 7.77 | 1.75% | **Sim** — única página que atinge ≥50 impressões com posição 5–12 |
| `/empreendimento/fontana/bosco-del-montello-centro-criciuma-sc` | 49 | 9.18 | 4.08% | Não — abaixo do limiar de impressões (49 < 50); e CTR já está acima do observado para posições próximas (não está "abaixo da mediana") |
| `/empreendimento/fontana/pavia-rio-maina-criciuma-sc` | 22 | 10.59 | 0% | Não — impressões insuficientes |
| Demais páginas de empreendimento | ≤14 | variável | variável | Não — impressões insuficientes para conclusão estatística confiável |

Decisão: **1 candidata** (`calliano-centro-criciuma-sc`) será tratada no Bloco 2 — nenhuma outra página do site atinge volume suficiente para uma mudança de title/description com confiança, e forçar mais candidatas violaria a regra de não otimizar sem evidência.

## 4. Limitação de cobertura local (Supabase)

`.env.local` não permite conexão local ao Supabase neste ambiente (limitação conhecida, não bug). Por isso:
- `getVitrineImoveis()`/`getVitrineEmpreendimentos()` rodando localmente (`npm run dev`/build) só enxergam os estáticos de `src/data/imoveis.ts` — os 8 Eraldo vindos de `properties` (achado B1-2) só são visíveis comparando com o **sitemap.xml de produção**, não localmente.
- Qualquer teste local de sitemap/páginas só-do-banco é parcial por definição; a validação real de contagem de URLs é feita contra produção.
