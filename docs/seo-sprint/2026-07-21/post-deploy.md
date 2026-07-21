# Fila de Validação Pós-Deploy — SEO Sprint 2026-07-21

Execute nesta ordem, só depois do merge + deploy em produção (Vercel). Nenhum item aqui foi executado ainda.

## 1. Validação HTTP imediata (minutos após deploy)

```bash
# Sitemap: confirmar 0 duplicatas e 0 lastmod
curl -s https://stivenallan.com.br/sitemap.xml | grep -o "<loc>[^<]*</loc>" | sort | uniq -d   # deve retornar vazio
curl -s https://stivenallan.com.br/sitemap.xml | grep -c lastmod                               # deve ser 0

# 410 nas 9 unidades descontinuadas (ver redirects.csv para lista completa)
curl -s -o /dev/null -w "%{http_code}\n" https://stivenallan.com.br/imovel/residencial-sordello-lancamento-ao-lado-do-combo-atacadista-em-criciuma-194/AP0110-194   # esperado: 410
curl -s -o /dev/null -w "%{http_code}\n" https://stivenallan.com.br/imovel/residencial-volpago-del-montello-conforto-e-praticidade-em-criciuma-200/AP0115-200      # esperado: 410

# Redirects reais continuam de pé (1 salto)
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://stivenallan.com.br/imovel/residencial-bosco-del-montello-pronto-para-morar-no-centro-de-criciuma-178/AP0097   # esperado: 308 → /empreendimento/fontana/bosco-del-montello-centro-criciuma-sc

# Calliano com title/description novos
curl -s https://stivenallan.com.br/empreendimento/fontana/calliano-centro-criciuma-sc | grep -o '<title>[^<]*</title>'

# Tubarão (achado novo desta rodada): deve virar 200 com conteúdo real, nunca mais
# 200 com "Cidade não encontrada"
curl -s -o /dev/null -w "%{http_code}\n" https://stivenallan.com.br/lancamentos/tubarao-sc   # esperado: 200
curl -s https://stivenallan.com.br/lancamentos/tubarao-sc | grep -o '<title>[^<]*</title>\|<link rel="canonical"[^>]*>\|Gran Palazzo\|Play Residence\|Cidade não encontrada'
# esperado: título "Lançamentos Imobiliários em Tubarão/SC | Stiven Allan", canonical
# self, "Gran Palazzo" e "Play Residence" presentes, "Cidade não encontrada" ausente

# Sitemap: Aura Residence deve aparecer mesmo antes de qualquer alteração no Supabase
curl -s https://stivenallan.com.br/sitemap.xml | grep -c aura-residence-centro-criciuma-sc   # esperado: 1
```

## 2. Reindexação manual (Google Search Console — URL Inspection)

Só faz sentido pedir reindexação de URLs **canônicas e valiosas** — não peça reindexação das 9 URLs que agora são 410 (o objetivo ali é o Google **parar** de rastrear/mostrar, não indexar de novo).

Solicitar "Testar URL publicada" + "Solicitar indexação" para:
1. `https://stivenallan.com.br/empreendimento/fontana/calliano-centro-criciuma-sc` (title/description mudaram)
2. `https://stivenallan.com.br/lancamentos/tubarao-sc` (antes retornava "Cidade não encontrada" com 200; agora tem conteúdo, title e canonical reais — vale pedir reindexação pra substituir o snapshot antigo que o Google possa ter guardado)
3. `https://stivenallan.com.br/sitemap.xml` (reenviar no Search Console após confirmar 0 duplicatas e a presença do Aura Residence)

## 3. Checar relatório Page Indexing (2–3 dias após deploy, depois de novo em ~14 dias)

- Confirmar que as 9 URLs 410 aparecem como "Removida (410)" ou saem do relatório de "Não encontrada (404)" anterior — **não afirmar isso antes de ver o relatório real**.
- Confirmar que nenhuma URL canônica válida (as testadas no baseline) passou a aparecer como "Rastreada, não indexada" ou "Excluída por tag noindex" inesperadamente.
- **Não comparar contagem de URLs enviadas vs. indexadas usando dados do Windsor/Search Analytics** — esse connector não expõe Page Indexing; use a UI do GSC ou a extensão Chrome (prompt abaixo).

## 4. Nova janela de dados do Search Analytics (mínimo 28 dias fechados pós-deploy)

- Extrair novamente `query`/`page`/`clicks`/`impressions`/`ctr`/`position` para `calliano-centro-criciuma-sc` e comparar com o baseline desta sessão (57 impr, posição 7.77, CTR 1.75%) — só então afirmar se houve melhora real de CTR.
- Repetir a checagem de duplicidade do sitemap contra o número de URLs realmente enviadas no GSC.
- Verificar se `/lancamentos/tubarao-sc` começa a acumular impressões próprias (hoje não há dado de query/página específico pra essa URL no Search Analytics, já que ela nunca teve conteúdo real antes deste patch).

## 5. Watch estrutural: novas cidades vindas do Supabase antes de entrarem em `CIDADES`

O fallback que causava "Cidade não encontrada" com 200 foi trocado por `notFound()` real em `src/app/lancamentos/[cidade]/page.tsx` — isso vale pra **qualquer** cidade nova que apareça em `properties` no Supabase antes de alguém adicionar a entrada correspondente em `CIDADES`. Comportamento agora é seguro (404 real, nunca mais um 200 fake), mas ainda gera um buraco temporário no funil (sitemap referencia a URL, a página 404 até a entrada ser adicionada). Se o Page Indexing mostrar uma nova cidade em "Não encontrada (404)", é sinal pra adicionar a cidade em `CIDADES` com dados reais, não pra ignorar.

## PROMPT PRONTO PARA A EXTENSÃO DO CHROME (usar só depois do deploy)

```
Abra o Google Search Console para a propriedade sc-domain:stivenallan.com.br.

1. Use a ferramenta "Inspeção de URL" para verificar, uma de cada vez, estas URLs:
   - https://stivenallan.com.br/empreendimento/fontana/calliano-centro-criciuma-sc
   - https://stivenallan.com.br/sitemap.xml
   Para cada uma, relate: status de indexação, canonical detectado pelo Google (se é o mesmo
   declarado na página), e se há algum erro de rastreamento.

2. Para a URL https://stivenallan.com.br/empreendimento/fontana/calliano-centro-criciuma-sc,
   se o status permitir, clique em "Solicitar indexação" e confirme a URL exata antes de enviar.

3a. Verifique https://stivenallan.com.br/lancamentos/tubarao-sc especificamente: confirme
   que o Google já enxerga o novo title ("Lançamentos Imobiliários em Tubarão/SC") e
   canonical (a própria URL, não mais a home) — relate exatamente o que a Inspeção de
   URL mostrar, incluindo se ainda há uma versão em cache com o conteúdo antigo.

3. Vá em Indexação > Páginas (relatório Page Indexing) e verifique se estas 9 URLs aparecem
   como "Não encontrada (404)" ou "Removida (410)" — relate o status exato de cada uma, não
   assuma:
   - https://stivenallan.com.br/imovel/residencial-sordello-lancamento-ao-lado-do-combo-atacadista-em-criciuma-194/AP0110-194
   - https://stivenallan.com.br/imovel/residencial-volpago-del-montello-conforto-e-praticidade-em-criciuma-200/AP0115-200
   - https://stivenallan.com.br/imovel/belfiore-residencial-conforto-e-sofisticacao-no-bairro-michel-criciuma-176/AP0095-176
   - https://stivenallan.com.br/imovel/hexa-prime-residence-conforto-e-modernidade-em-um-so-lugar-173/AP0094-173
   - https://stivenallan.com.br/imovel/longarone-residencial-alto-padrao-da-construtora-fontana-em-criciuma-185/AP0103-185
   - https://stivenallan.com.br/imovel/casa-alto-padrao-no-bairro-santa-barbara-criciuma-sc-3-suites-piscina-e-localizacao-privilegiada-174/CA0012-174
   - https://stivenallan.com.br/imovel/apartamento-a-venda-em-criciuma-centro-com-3-quartos-169-38m
   - https://stivenallan.com.br/imovel/loteamento-murialdo-terrenos-de-163m-a-partir-de-rs-163-000-em-orleans-sc-com-vista-deslumbrante-da-serra-catarinense-169/TE0014-169
   - https://stivenallan.com.br/imovel/terrenos-em-condominio-fechado-de-alto-padrao-no-bairro-sao-simao-criciuma-sc-161/TE0006-161

4. No relatório de Sitemaps, reenvie https://stivenallan.com.br/sitemap.xml e relate quantas
   URLs o Google contabilizou (comparar com a contagem local pós-deploy).

Não solicite reindexação das 9 URLs do item 3 — o objetivo ali é o Google descartar essas
páginas, não indexá-las. Relate os resultados exatos vistos na tela, sem arredondar ou inferir
o que não estiver explicitamente visível.
```
