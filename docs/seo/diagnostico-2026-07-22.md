# Diagnóstico SEO/AEO — stivenallan.com.br — 2026-07-22

Escopo: Etapa 1 (diagnóstico e proposta) do processo com gate de aprovação. Nenhuma alteração de código foi feita neste documento — apenas leitura, `curl` e consultas ao Google Search Console via Windsor.ai.

## 0. Observações de ambiente (antes de qualquer dado)

- **Repo local divergiu do remoto**: `main` local tinha commits que `origin/main` não tinha, e vice-versa (`git status` no início da sessão). Por isso a branch de Etapa 2 (`feat/seo-aeo-2026-07-22`) foi criada a partir de `origin/main` atualizada, não da `main` local.
- Sitemap de produção: `curl -s .../sitemap.xml | grep -c "<loc>"` → **62 URLs**, confirma o número esperado.
- GSC via Windsor.ai (`sc-domain:stivenallan.com.br`) respondeu normalmente — não foi necessário usar o fallback de export CSV.

## 1. Contexto de tráfego (importante para calibrar expectativa)

O site tem histórico de busca orgânica muito recente e ainda muito pequeno. Série diária de impressões (GSC, `date`):

- Maio inteiro e boa parte de junho: 0–3 impressões/dia (praticamente sem presença).
- A partir de ~26/06: sobe para 5–17/dia.
- A partir de ~08/07: sobe para 20–53/dia.

Totais agregados (site inteiro, via `get_data` sem quebra por página):

| Período | Cliques | Impressões | CTR | Posição média |
|---|---|---|---|---|
| Últimos 28d completos (2026-06-22 a 2026-07-19) | 9 | 515 | 1,75% | 10,73 |
| 28d anteriores (2026-05-25 a 2026-06-21) | 0 | 20 | 0% | 8,5 |

Isso é uma rampa real (visível dia a dia), não erro de consulta. **Conclusão prática: a base de dados é pequena, então qualquer leitura precisa vir com o tamanho de amostra explícito** — não vou apresentar padrões como certeza estatística quando são só 1 ou 2 dígitos de impressões.

## 2. Seleção de candidatas — aplicação estrita dos critérios da Seção 4.2

Busquei toda query não-branded com ≥30 impressões/28d no site inteiro (`filters: impressions >= 10`, depois inspecionado por página). **Apenas uma query, em uma única página, cruza o limiar de 30 impressões**: `bosco del montello` → 30 impressões na página do empreendimento (posição 9,43, 0 cliques). A mesma query também aparece na página de imóvel individual (AP0097) com 20 impressões (abaixo do limiar) — as duas páginas competem pela mesma busca (canibalização, ver §5).

Nenhuma outra query isolada chega a 30 impressões. As mais próximas: `calliano residencial` (20, pos. 6,7), `residencial bosco del montello fotos` (13, pos. 3,77 — posição ótima mas volume baixo), `residencial calliano` (13, pos. 11,3). Fica registrado que existem, mas **não viram candidatas** por não atingirem o limiar objetivo — não vou forçar encaixe.

Pela via alternativa (defeito de qualidade documentável, máximo 1 candidata), conferi os 3 guias mais antigos (por data de criação real via `git log`, não por suposição):

| Guia | Criado em | Defeito de acentuação confirmado no HTML de produção? |
|---|---|---|
| `comprar-apartamento-na-planta-criciuma` | 2026-07-02 | Não — o único "match" do grep-padrão era falso positivo (`Analise o contrato`, imperativo correto sem acento) |
| `cub-sc-correcao-parcelas` | 2026-07-02 | **Sim** — 11+ ocorrências reais: "correcao", "simulacao", "orcamento", "financiamento bancario", "historico de credito", "apos as chaves", "Alem disso", "taxas bancarias", "e um índice" (falta "é") |
| `financiamento-direto-construtora` | 2026-07-02 | Não — nenhum defeito real no corpo do texto |

**Divergência com a premissa do prompt**: a afirmação "os 3 guias mais antigos foram escritos sem acentuação" só se confirma para **um** deles (`cub-sc-correcao-parcelas`). Os outros dois já estão corretos. Sigo a realidade encontrada: só `cub-sc-correcao-parcelas` entra como candidata por esta via.

**Resultado: 2 candidatas aprovadas pelos critérios, não 3.** Não vou inflar a lista — "menos de 3" é o resultado honesto aqui.

## 3. Guia novo — não proposto

Não há volume de busca (nem um único non-branded query com evidência de demanda) para um tema ainda não coberto pelos 7 guias existentes. Proponho **não criar guia novo nesta rodada** — não há fato de dados que sustente a escolha de tema sem ser um chute.

## 4. Pré-voo técnico (leitura, nada alterado)

| URL | Arquivo que serve a rota | Status | Canonical | Meta robots | No sitemap? | Conteúdo no HTML server-rendered? |
|---|---|---|---|---|---|---|
| `/empreendimento/fontana/bosco-del-montello-centro-criciuma-sc` | `src/app/empreendimento/fontana/bosco-del-montello-centro-criciuma-sc/page.tsx` (pasta literal confirmada via `ls`) | 200 | self (`.../bosco-del-montello-centro-criciuma-sc`) | `index, follow` | Sim (1 match) | Sim — H1 "Bosco Del Montello" e blocos de financiamento direto aparecem no HTML puro |
| `/guia/cub-sc-correcao-parcelas` | `src/app/guia/cub-sc-correcao-parcelas/page.tsx` | 200 | self | `index, follow` | Sim (1 match) | Sim — H2/H3/parágrafos com os erros de acentuação aparecem no HTML puro (confirmado, não é conteúdo client-side) |

Schema existente em cada página (preservar, não duplicar):
- `bosco-del-montello`: `RealEstateAgent`, `City`. **Sem `BreadcrumbList` e sem `FAQPage`** — nenhuma das 27 páginas de empreendimento Fontana tem `BreadcrumbList`. Isso diverge da premissa do prompt de que `BreadcrumbList` está presente e deve ser preservado universalmente — na prática só existe em algumas páginas de guia (as mais novas), na listagem `/empreendimentos`, no blog e em `/lancamentos/[cidade]`. Não adicionei `BreadcrumbList` nesta rodada — não foi pedido e schema novo fora do que já existe na própria página não está no escopo aprovado.
- `cub-sc-correcao-parcelas`: `Article`, `FAQPage` (com `Question`/`Answer`), `Organization`, `Person`, `City`, `RealEstateAgent`. **Sem `BreadcrumbList`** também. O `FAQPage` é legítimo (a seção "Perguntas Frequentes" é visível na página) — preservado, e o texto das respostas foi corrigido junto com o texto visível equivalente.

## 5. Matriz de oportunidades

| URL | Query/intenção real | Evidência GSC (28d) | Lacuna atual | Melhoria proposta | Risco | Decisão |
|---|---|---|---|---|---|---|
| `/empreendimento/fontana/bosco-del-montello-centro-criciuma-sc` | `bosco del montello` — intenção provável de quem já viu o nome do empreendimento e busca por ele (nome também é um local histórico real na Itália, o que pode gerar ambiguidade parcial de intenção, como já observado em Tremezzo/Calliano/Pavia) | 30 impressões, 0 cliques, posição média 9,43, CTR 0% | Meta description com **213 caracteres** (limite prático ~155-160) — provavelmente truncada no SERP, cortando a chamada final; title com 67 caracteres (levemente acima do recomendado ~60). Amostra pequena (30 impressões): 0 cliques não é estatisticamente alarmante sozinho na posição ~9-10 (CTR esperado nessa posição já é baixo, ~2-4%), mas o truncamento é um fato técnico verificável, não uma suposição | Reescrever title (≤60 car.) e meta description (≤155 car.) para caber inteiros no SERP, mantendo os fatos já corretos (2 dorm./1 suíte, até 66m², financiamento direto, CRECI 60.275) só reordenados/encurtados — hipótese: reduzir truncamento aumenta CTR | Baixo — só reescrita de metadata, sem mudança de conteúdo visível da página | **Aprovado** |
| `/guia/cub-sc-correcao-parcelas` | Não é uma query específica — via defeito de qualidade documentado (não dados de CTR/posição, já que a página tem 0 impressões nos últimos 28d) | 0 impressões (28d) — baseline zerado, nenhuma comparação possível ainda | 11+ erros de acentuação confirmados no HTML de produção (ver §2), inclusive nos próprios H2 ("Simulacao", "orcamento") | Corrigir a acentuação em todo o corpo do texto e no bloco `FAQPage` (JSON-LD) junto | Baixo — correção textual, sem mudança de estrutura ou schema novo | **Aprovado** |

Observação registrada, não uma candidata: `calliano-centro-criciuma-sc` tem 83 impressões totais somando várias queries pequenas (nenhuma isolada ≥30), CTR 1,2% — pode virar candidata em uma próxima rodada se alguma query individual crescer.

## 6. Ledger de afirmações das mudanças propostas

| Afirmação | Fonte | Data | Condições | Pode publicar? |
|---|---|---|---|---|
| Bosco Del Montello: 2 dormitórios (1 suíte), até 66m² | Já publicado na própria página em produção (meta description atual) | Conferido 2026-07-22 | — | Sim, já é fato existente — só reaproveitado ao encurtar |
| Bosco Del Montello: financiamento direto com a construtora, sem banco | Já publicado na página (corpo + meta) | Conferido 2026-07-22 | Condições variam por empreendimento e análise da construtora | Sim, linguagem condicional já usada na página |
| CRECI 60.275, sem citar estado | Regra fixa do projeto | — | — | Sim |
| CUB/SC, IGPM, prazos (180/240 meses) no guia `cub-sc-correcao-parcelas` | Já publicado no próprio texto do guia — só corrigindo ortografia, não o conteúdo/números | Conferido 2026-07-22 | Nenhum número foi alterado, só a grafia | Sim — é correção de forma, não de conteúdo |

Nenhuma afirmação nova de preço, prazo, disponibilidade ou fase de obra foi introduzida. **Nota de investigação**: a página do empreendimento usa a palavra "lançamento" — mas ao conferir, essa palavra vem exclusivamente da descrição genérica do schema `RealEstateAgent` (branding: "especialista em lançamentos com financiamento direto da construtora"), não de uma afirmação específica sobre a fase de obra deste residencial. Divergência inicialmente suspeitada com a página do imóvel individual (AP0097, "pronto para morar") foi checada e não representa um conflito de fato — não houve necessidade de alteração.

## 7. Baseline de medição (últimos 28 dias completos, 2026-06-22 a 2026-07-19)

| Página | Cliques | Impressões | CTR | Posição média |
|---|---|---|---|---|
| `/empreendimento/fontana/bosco-del-montello-centro-criciuma-sc` (query `bosco del montello`) | 0 | 30 | 0% | 9,43 |
| `/guia/cub-sc-correcao-parcelas` | 0 | 0 | — | — (sem dado) |
| **Site inteiro** | 9 | 515 | 1,75% | 10,73 |

## 8. Title/meta aplicados (Etapa 2)

**`/empreendimento/fontana/bosco-del-montello-centro-criciuma-sc`**
- Antes (title, 67 car.): `Bosco Del Montello Residencial | Centro Criciúma SC | Stiven Allan`
- Antes (meta, 213 car. — truncado no SERP): `Veja fotos e plantas do Bosco Del Montello Residencial, no Centro de Criciúma/SC — 2 dormitórios (1 suíte), até 66 m². Financiamento direto com a construtora, sem banco. Fale com Stiven Allan, CRECI 60.275.`
- Depois (title, 59 car. renderizado com template): `Apartamento Bosco Del Montello | Criciúma/SC | Stiven Allan`
- Depois (meta, 149 car.): `Bosco Del Montello — 2 dormitórios (1 suíte), até 66 m², Centro de Criciúma/SC. Financiamento direto com a Fontana, sem banco. Fale com Stiven Allan.`
- Hipótese: reduzir o truncamento melhora CTR. **Ressalva honesta**: com só 30 impressões na amostra, 0 cliques também é compatível com "nada de errado, amostra pequena" — o D+28 depois do merge vai dizer se a hipótese se sustenta ou não.
- Como medir em D+28: mesma query (`bosco del montello`), mesma página, comparar cliques/CTR/posição contra esta baseline.

## 9. Plano de medição (registrado, não executado)

- **D+0** (dia do merge, decisão sua): validar as URLs alteradas em produção (200, canonical, conteúdo novo no HTML). Posso gerar um mini-prompt para você colar na extensão do Claude no Chrome, para inspecionar as duas URLs no GSC (Page Indexing/URL Inspection, que eu não acesso por automação aqui).
- **D+28 e D+56**: comparar contra este baseline, mesmos intervalos de data, via Windsor — cliques/impressões/CTR/posição por página e por query, mais GA4 (leads/cliques de WhatsApp). Sem atribuição causal prematura.
- Indisponível: qualquer métrica de presença em AI Overviews/ChatGPT/Perplexity — não medido, não afirmado.

## 10. O que foi implementado (Etapa 2)

Ambas as linhas do gate foram aprovadas ("Aprovo tudo"):

1. **Bosco Del Montello** — title e meta description reescritos (ver §8), sem alterar nenhum outro conteúdo da página.
2. **Guia CUB/SC** — corrigida a acentuação em todo o corpo do texto visível e no `FAQPage` (JSON-LD), sem alterar nenhum número, prazo ou fato. Fora do escopo, mas registrado: os mesmos textos institucionais sem acento ("Stiven Allan Imoveis" no schema `Organization`, "Imoveis em Criciuma e Sul de SC" no rodapé) aparecem em mais 5 dos 7 guias — só o guia `apartamento-frente-mar-rincao-ou-laguna` já estava correto. Corrigi apenas dentro do arquivo aprovado (`cub-sc-correcao-parcelas`); os outros 5 exigiriam um novo gate, por serem páginas fora desta rodada.

Validação: `tsc --noEmit` limpo, `npm run build` ok, `npm test` (232 testes) verde, self-check de acentuação (regra 3.2) limpo nos dois arquivos alterados, conteúdo novo confirmado no HTML server-rendered via `next start` local.

**Nota de processo**: a branch `feat/seo-aeo-2026-07-22` foi criada a partir de `origin/main`. Isso foi necessário porque a `main` local está sendo usada ativamente para outro trabalho em paralelo (Lotes 4/5 de condições comerciais dos empreendimentos Fontana) — as duas linhas de trabalho não se sobrepõem em nenhum arquivo.
