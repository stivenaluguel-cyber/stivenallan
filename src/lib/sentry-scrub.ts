// Remove credenciais do payload que vai pro Sentry.
//
// Por que existe: o httpIntegration (ligado por padrão) grava o request de
// entrada inteiro na isolation scope, incluindo o header `Cookie` cru. No
// caminho de EVENTO (addNormalizedRequestDataToEvent, @sentry/core 10.65) os
// headers são copiados SEM passar por nenhuma deny-list — a filtragem por
// deny-list só existe no caminho de span. E a deny-list padrão cobre apenas
// 'forwarded', '-ip', 'remote-', 'via' e '-user', que não casam com nenhum
// cookie deste projeto.
//
// Resultado sem este scrub: qualquer exceção capturada durante uma requisição
// autenticada exporta para um terceiro
//   - `sa_session`      → token de acesso do site público, 180 dias, sem
//                         rotação e (hoje) sem endpoint de revogação;
//   - `dashboard_token` → o JWT de admin do CRM.
// Ambos são bearer puro: quem lê, assume a sessão.
//
// `dataCollection.cookies: false` resolve o dicionário `event.request.cookies`,
// mas NÃO o header `Cookie` dentro de `event.request.headers` — por isso os
// dois mecanismos. Os demais headers são preservados de propósito: user-agent
// e referer são o que torna um erro de produção diagnosticável, e jogá-los
// fora para resolver um problema de cookie seria trocar um custo real por
// outro.

type EventoComRequest = {
  request?: {
    cookies?: unknown
    headers?: Record<string, unknown>
    [k: string]: unknown
  }
  [k: string]: unknown
}

// Nomes de header que carregam credencial. Comparados em minúsculas — o
// headersToDict do SDK normaliza, mas não custa não depender disso.
const HEADERS_COM_CREDENCIAL = ['cookie', 'set-cookie', 'authorization', 'proxy-authorization']

export function scrubSentryEvent<T>(event: T): T {
  const e = event as EventoComRequest
  if (!e || typeof e !== 'object' || !e.request) return event

  // Dicionário de cookies já parseado pelo SDK.
  if ('cookies' in e.request) delete e.request.cookies

  const headers = e.request.headers
  if (headers && typeof headers === 'object') {
    for (const chave of Object.keys(headers)) {
      if (HEADERS_COM_CREDENCIAL.includes(chave.toLowerCase())) delete headers[chave]
    }
  }

  return event
}
