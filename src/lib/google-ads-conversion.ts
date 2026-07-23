import { logError, logInfo } from '@/lib/log'

const SOURCE = 'lib/google-ads-conversion'
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token'
// Bumpar a versão de tempos em tempos — Google descontinua versões antigas
// da Google Ads API ~1 ano após lançamento. Ver: developers.google.com/google-ads/api/docs/release-notes
const API_VERSION = 'v18'

// Env obrigatórias (nenhuma tem default — a integração fica desligada, não
// quebrada, se qualquer uma faltar). Ver checklist de setup no PR.
function readConfig() {
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID // só dígitos, sem hífen
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || null // conta MCC, se houver

  if (!developerToken || !clientId || !clientSecret || !refreshToken || !customerId) return null
  return { developerToken, clientId, clientSecret, refreshToken, customerId, loginCustomerId }
}

// GOOGLE_ADS_CONVERSION_ACTION_<ESTAGIO EM MAIÚSCULO> — cada Conversion
// Action precisa existir antes no Google Ads (Ferramentas > Conversões >
// Nova ação de conversão > Importação > Cliques em anúncios). Guarda só o
// ID numérico (não o resource name completo). Estágio sem env configurada
// = sem upload pra esse estágio, sem erro — dá pra ligar 1 por vez.
function conversionActionIdFor(estagioFunil: string): string | null {
  const key = `GOOGLE_ADS_CONVERSION_ACTION_${estagioFunil.toUpperCase()}`
  return process.env[key] || null
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(cfg: NonNullable<ReturnType<typeof readConfig>>): Promise<string | null> {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 30_000) {
    return cachedAccessToken.token
  }
  try {
    const res = await fetch(OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        refresh_token: cfg.refreshToken,
        grant_type: 'refresh_token',
      }),
    })
    if (!res.ok) {
      logError(SOURCE, 'oauth token refresh failed', new Error(`status=${res.status}`))
      return null
    }
    const data = await res.json()
    cachedAccessToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 }
    return cachedAccessToken.token
  } catch (err) {
    logError(SOURCE, 'oauth token refresh exception', err)
    return null
  }
}

export interface SendGoogleAdsConversionInput {
  estagioFunil: string
  gclid: string
  // Momento em que o estágio mudou (ISO 8601) — a API exige o formato
  // "AAAA-MM-DD HH:MM:SS+00:00", convertido aqui a partir de um Date.
  conversionDateTime: Date
  conversionValue?: number
  currencyCode?: string
}

export type SendGoogleAdsConversionResult =
  | { ok: true }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; error: string }

function formatConversionDateTime(d: Date): string {
  // "AAAA-MM-DD HH:MM:SS+00:00" em UTC, como a API exige.
  const iso = d.toISOString() // 2026-07-23T15:04:05.000Z
  const [date, time] = iso.split('T')
  return `${date} ${time.slice(0, 8)}+00:00`
}

export async function sendGoogleAdsConversion(input: SendGoogleAdsConversionInput): Promise<SendGoogleAdsConversionResult> {
  const cfg = readConfig()
  if (!cfg) return { ok: false, skipped: true, reason: 'credenciais ausentes' }

  const conversionActionId = conversionActionIdFor(input.estagioFunil)
  if (!conversionActionId) return { ok: false, skipped: true, reason: `nenhuma conversion action configurada para o estágio "${input.estagioFunil}"` }

  if (!input.gclid) return { ok: false, skipped: true, reason: 'lead sem gclid (não veio do Google Ads)' }

  const accessToken = await getAccessToken(cfg)
  if (!accessToken) return { ok: false, error: 'falha ao obter access token' }

  const payload = {
    conversions: [
      {
        gclid: input.gclid,
        conversionAction: `customers/${cfg.customerId}/conversionActions/${conversionActionId}`,
        conversionDateTime: formatConversionDateTime(input.conversionDateTime),
        ...(input.conversionValue != null ? { conversionValue: input.conversionValue, currencyCode: input.currencyCode ?? 'BRL' } : {}),
      },
    ],
    partialFailure: true,
  }

  logInfo(SOURCE, 'upload click conversion', { estagio: input.estagioFunil, has_value: input.conversionValue != null })

  try {
    const res = await fetch(
      `https://googleads.googleapis.com/${API_VERSION}/customers/${cfg.customerId}:uploadClickConversions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': cfg.developerToken,
          ...(cfg.loginCustomerId ? { 'login-customer-id': cfg.loginCustomerId } : {}),
        },
        body: JSON.stringify(payload),
      }
    )
    const body = await res.json().catch(() => null)
    if (!res.ok) {
      logError(SOURCE, 'uploadClickConversions failed', new Error(`status=${res.status} body=${JSON.stringify(body)}`))
      return { ok: false, error: 'Google Ads API falhou' }
    }
    // partialFailure=true faz a API responder 200 mesmo com erro por conversão
    // individual (ex: gclid expirado, fora da janela de 90 dias) — loga sem
    // tratar como falha da chamada em si.
    if (body?.partialFailureError) {
      logError(SOURCE, 'partial failure na conversão', new Error(JSON.stringify(body.partialFailureError)))
    }
    return { ok: true }
  } catch (err) {
    logError(SOURCE, 'fetch exception', err)
    return { ok: false, error: 'Erro de rede' }
  }
}
