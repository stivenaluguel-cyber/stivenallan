# Tracking, consentimento LGPD e validação

Referência do que o site mede, sob quais condições, e como validar. Código-fonte:
`src/lib/consent.ts` (consentimento), `src/lib/tracking.ts` (eventos),
`src/components/AnalyticsScripts.tsx` (carga condicional), `src/components/CookieConsent.tsx`
(banner), `src/app/api/meta-capi/route.ts` (Conversions API).

## 1. Modelo de consentimento (LGPD)

| Categoria | O que cobre | Antes do aceite |
|---|---|---|
| Necessários (sempre ativos) | funcionamento do site, formulários, radar de visitas first-party (Supabase próprio), UTMs em `sessionStorage` p/ CRM | funciona normalmente — nada vai a terceiros |
| Análise | GA4 (`G-…`) | gtag.js **não carrega**, nenhum evento GA4 sai |
| Marketing | Meta Pixel + CAPI, Google Ads | Pixel **não carrega**; CAPI bloqueada no client; conversão Ads não dispara |

- Decisão persiste em `localStorage.sa_consent` (versão 1 — subir `CONSENT_VERSION` re-pergunta a todos).
- Revogação: link "Preferências de cookies" no rodapé. Revogar expira cookies `_ga*`, `_fbp`, `_fbc`, `_gcl_*` (best-effort) e chama `fbq('consent','revoke')`.
- **Google Consent Mode v2**: script inline no `<head>` (layout) seta default `denied` para `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage` antes de qualquer gtag, e restaura a escolha salva sincronicamente. `gtag('consent','update')` roda a cada decisão.
- Nenhum dado pessoal bruto vai a plataforma de anúncio: Enhanced Conversions e CAPI usam SHA-256 (e-mail, telefone E.164, nome); GA4 nunca recebe nome/telefone/e-mail.

## 2. Dicionário de eventos

| Momento | Meta Pixel | GA4 | Parâmetros compartilhados |
|---|---|---|---|
| Carga inicial (pós-consent) | `PageView` (snippet) | `page_view` (config) | — |
| Navegação SPA | `PageView` | `page_view` | `page_path`, `page_location`, `page_title` (GA4) |
| Abertura de pág. de empreendimento (1× por página/canal) | `ViewContent` | `view_item` | slug em `content_ids`/`item_id`; nome, construtora (`item_brand`), cidade (`item_category`), bairro, status. **Nunca preço** (site é "sob consulta") |
| Clique CTA WhatsApp (`[data-wpp]`, com fallback p/ qualquer link `wa.me` sem anotação) | `Contact` | `contact_whatsapp` | `content_name`, `method:'whatsapp'`, `empreendimento` (slug), `position` (valor do `data-wpp`; `link_whatsapp` no fallback) |
| Lead (SÓ após `res.ok` da API) | `Lead` + `eventID` | `generate_lead` | `content_name`, `method:'form'`, `empreendimento` (slug), `position` (`contact_form` \| `catalog_modal`) |
| Lead server-side | CAPI `Lead` com o **mesmo** `event_id` (deduplica com o Pixel) | — | hashes em/ph/fn/ln, `fbp`/`fbc` de cookie, `fbc` sintetizado do `fbclid` com timestamp do click |
| Conversão Google Ads | — | `conversion` (`send_to`) + Enhanced Conversions (hashes) | requer `NEXT_PUBLIC_GADS_CONVERSION` + consent marketing |
| Funil pré-lead (GA4 only) | — | `form_open`, `form_start`, `form_submit`, `catalog_click`, `planta_open` | `empreendimento`, `content_name`, `form_type` |

Comparação WhatsApp × formulário: os dois carregam `empreendimento` + `position` + `content_name` — no GA4, explorar `contact_whatsapp` vs `generate_lead` por essas dimensões; na Meta, `Contact` vs `Lead`.

## 3. Variáveis de ambiente

| Env | Onde | Obrigatória? |
|---|---|---|
| `NEXT_PUBLIC_GA4_ID` | Vercel (client) | fallback hardcoded existe; declarar mesmo assim |
| `NEXT_PUBLIC_META_PIXEL_ID` | Vercel (client) | idem |
| `NEXT_PUBLIC_GADS_ID` / `NEXT_PUBLIC_GADS_CONVERSION` | Vercel (client) | só quando criar o Google Ads |
| `META_CAPI_TOKEN` | Vercel (server, Sensitive) | sem ela a CAPI vira no-op silencioso |
| `META_TEST_EVENT_CODE` | Vercel (server) | só durante validação — **remover depois** |

## 4. Checklist de validação manual

Pré-requisito: aceitar "Todos" no banner (ou a categoria testada). Em `next dev`, todo evento loga `[tracking] …` no console (só em desenvolvimento).

**Banner/consentimento**
1. Janela anônima → banner aparece; DevTools → Network: **zero** requests a `googletagmanager.com`/`connect.facebook.net` antes de decidir.
2. "Rejeitar não essenciais" → navegar/clicar WhatsApp → continua zero requests de tracking; formulário continua funcionando.
3. "Aceitar todos" → gtag.js + fbevents.js carregam; cookies `_ga*`/`_fbp` criados.
4. Rodapé → "Preferências de cookies" → desmarcar tudo → `_ga*`/`_fbp` expirados.
5. `localStorage.sa_consent` reflete cada decisão; recarregar não reabre o banner.

**GA4 (DebugView)**: Admin → DebugView com a extensão Google Analytics Debugger (ou `?_dbg=1` não existe aqui — usar a extensão). Conferir: 1 `page_view` no load, 1 por navegação SPA (sem duplicar), `view_item` com `item_name`/`item_brand` ao abrir empreendimento (1×), `contact_whatsapp` no clique, `generate_lead` só depois do envio com sucesso.
⚠️ Admin → Fluxos de dados → Medição aprimorada → **desligar "Alterações de página com base em eventos do navegador"** (senão o page_view SPA duplica).

**Meta (Test Events)**: Gerenciador de Eventos → Testar eventos. Pixel: informar a URL do site na aba do browser de teste. CAPI: criar env `META_TEST_EVENT_CODE` com o código exibido → enviar um lead real de teste → devem aparecer **dois** `Lead` (Browser + Server) com o mesmo `event_id` e a etiqueta "Desduplicado" (processado 1×). Conferir Event Match Quality (alvo ≥ 6: em/ph/fn/ln + fbp/fbc + IP/UA). Ao final, **remover** `META_TEST_EVENT_CODE` e apagar o lead de teste no CRM.

**Google Ads** (quando existir): vincular GA4 ↔ Ads, importar `generate_lead` OU usar a conversão de tag (`NEXT_PUBLIC_GADS_CONVERSION`); em Ferramentas → Conversões, conferir "Conversões avançadas: registrando" (~24-48h). Consent Mode v2 aparece em Diagnóstico da conversão.

**Testes automatizados**: `npm test` cobre gates de consentimento, first-touch, hashes, params padronizados e enriquecimento do view_item (`src/lib/consent.test.ts`, `src/lib/tracking.test.ts`).
