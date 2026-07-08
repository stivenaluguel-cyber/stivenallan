# Manual operacional de campanhas — stivenallan.com.br

> Gerado na madrugada de 2026-07-08. Pré-requisitos: migração 0002 rodada, META_CAPI_TOKEN na Vercel, GSC verificado.

## Destinos de anúncio

| Tráfego | Destino | Quando usar |
|---|---|---|
| Frio (prospecção) | `/lp/[slug]` (ex.: `/lp/monte-leone-centro-criciuma-sc`) | Teste A — LP enxuta, 1 oferta + form |
| Frio (variante B) | `/empreendimento/fontana/[slug]` | Teste B — página EPIC completa |
| Morno (remarketing) | Página EPIC completa | Sempre |

Toda URL de anúncio leva UTMs. Padrão:
`?utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}`
(Google: `utm_source=google` + gclid automático.)

## Meta Ads — estrutura

| Campanha | Objetivo | Orçamento inicial | Destino |
|---|---|---|---|
| 01-PROSP-Conversao | Vendas/Conversão (evento Lead) | R$ 40/dia | LP vs EPIC (teste A/B por conjunto) |
| 02-PROSP-VisitasPerfil | Tráfego → perfil Instagram, só Stories | R$ 30/dia (5× R$ 6) | @stivenallan.ofc |
| 03-RMKT | Conversão (evento Lead) | R$ 15/dia | Página EPIC |

Públicos do 03-RMKT: visitantes do site 30d + envolvimento IG/FB 60d + viewers de vídeo 50%.
Regra de lance: volume máximo até ~50 conversões/semana; depois cost cap = CPL alvo × 1,2.
Kill rule (todo criativo): R$ 60–70 gastos sem lead OU CPL > 2× alvo por 3 dias → pausar.
Scale rule: vencedor +20% de verba a cada 3 dias (nunca dobrar).

### Matriz de criativos (campanha 01) — 3 ângulos × 2 formatos

| # | Ângulo | Formato | Roteiro/gancho |
|---|---|---|---|
| 1 | Liberdade | Vídeo 9:16 15s | Talking head: "Morar bem não deveria depender de um banco. Em Criciúma, você compra na planta direto com a construtora — sem aprovação bancária." CTA: condições no WhatsApp |
| 2 | Liberdade | Carrossel 4 cards | "3 verdades sobre comprar sem banco": 1) contrato direto 2) entrada 20% + obra 3) tabela sobe por fase → card CTA |
| 3 | Exclusividade | Vídeo 9:16 (tour/drone) | "2 apartamentos por andar. Poucos vão morar aqui." (Fidenza/Piazza Castello) — fotos reais, texto mínimo |
| 4 | Exclusividade | Imagem única | Foto aérea frente-mar + overlay: "Frente mar no Rincão, na planta, direto com a construtora" |
| 5 | Investimento | Vídeo 9:16 timelapse obra | "Essa obra sobe todo mês. A tabela também. Quem compra na fase certa sabe disso." |
| 6 | Investimento | Imagem única | Skyline Criciúma + "Seu dinheiro rendendo em m², não no banco" |

Copy fixa nos anúncios (critério de corte do filtro anti-curioso): **"Residências a partir de R$ 600 mil"** — sempre presente na legenda.

### Story ímãs (campanha 02) — 5 criativos R$ 6/dia cada

1. "Ninguém te contou: dá pra comprar apartamento de alto padrão em Criciúma **sem passar por banco**."
2. POV tour: "você descobre que o apê dos sonhos no centro de Criciúma não precisa de aprovação bancária."
3. Obra: "Essa obra sobe todo mês. A tabela também."
4. "Se você paga aluguel alto em Criciúma e já tem uma entrada guardada, isso é pra você."
5. Drone Rincão/Laguna: "Frente mar, na planta, parcelado direto com a construtora."

Regra CPC×100: custo por visita × 100 = orçamento diário para 100 visitas/dia. 48h de teste → manter 1–3 campeões.

## Google Ads — pesquisa

**Grupos e palavras (frase/exata):**
- Na planta + cidade: "apartamento na planta criciúma", "lançamentos imobiliários criciúma", "apartamento em obras içara", "apartamento na planta laguna"
- Financiamento direto: "financiamento direto construtora", "apartamento direto com a construtora", "comprar apartamento sem banco", "apartamento sem financiamento bancário"
- Litoral: "apartamento frente mar balneário rincão", "apartamento mar grosso laguna", "apartamento na praia na planta sc"
- Marca-parceira (alinhar com a Fontana antes): "construtora fontana", "monte leone criciúma", "lavis residencial", "fidenza criciúma"

**Negativas (adicionar no dia 1):** aluguel, alugar, kitnet, usado, leilão, caixa, mcmv, minha casa minha vida, mobiliado, temporada, airbnb, barato, popular.

**RSA (títulos, misturar):** Apartamento na Planta em Criciúma · Direto com a Construtora · Sem Banco e Sem Burocracia · Financiamento Direto Fontana · Entrada de 20% + Parcelas na Obra · Alto Padrão em Criciúma/SC · Frente Mar no Balneário Rincão · Condições Direto no WhatsApp
**Descrições:** "Compre na planta direto com a construtora: sem aprovação bancária, entrada de 20% e parcelas durante a obra." · "Residências de alto padrão em Criciúma, Içara e litoral sul. Receba plantas e condições no WhatsApp."

**Lances:** Maximizar conversões SEM tCPA por 2 semanas → tCPA após 15–30 conversões (começar 20% acima do CPL observado). PMax só com 30+ conversões na conta.

## Rotina Direct (pesca com arpão) — 20 min/dia

- Novo seguidor: "Oi [nome], bem-vindo! Vi que começou a acompanhar os empreendimentos. Está pesquisando pra morar ou pra investir?"
- Viu story de empreendimento: "Oi [nome], vi que acompanhou o story do [empreendimento]. Quer que eu te envie as plantas e as condições direto com a construtora?"
- Curtiu anúncio: "Oi [nome]! O [empreendimento] chamou sua atenção? Te conto como funciona comprar sem banco."
- Esquentou → pega WhatsApp → registra no CRM com origem "instagram-direct".

## Cadência automática (já ligada no código)

Todo lead do site entra com `proximo_followup = D+1`. O cron diário (9h) envia via Evolution:
D+1 apresentação/plantas → D+4 fase de obra/tabela → D+11 última + opt-in "AVISA" → escala pro Stiven.
Lead que responder: mover o estágio no CRM (tira da cadência automática).

## KPIs diários (15 min)

CPL bruto Meta R$ 25–60 · CPL Google R$ 30–80 · CTR Meta > 1% · CTR busca > 5% · conversão LP > 8% · connect rate WhatsApp > 60% · **CPL qualificado ≤ 3× o bruto** · 1ª resposta < 5 min.
