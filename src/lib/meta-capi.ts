import { createHash } from 'crypto'
import { logError, logInfo } from '@/lib/log'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '364836344657445'
const SOURCE = 'lib/meta-capi'

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function hashEmail(email: string) {
  return sha256(email.trim().toLowerCase())
}

function hashPhone(phone: string) {
  let digits = phone.replace(/\D/g, '')
  if (digits.length === 10 || digits.length === 11) digits = '55' + digits
  return sha256(digits)
}

function hashFirstName(nome: string) {
  return sha256(nome.trim().toLowerCase().split(/\s+/)[0])
}

// Sobrenome (última palavra) quando o nome tem 2+ palavras — sobe o match
// quality sem nenhum dado extra do visitante. Sempre hasheado, nunca bruto.
function hashLastName(nome: string): string | null {
  const parts = nome.trim().toLowerCase().split(/\s+/)
  if (parts.length < 2) return null
  return sha256(parts[parts.length - 1])
}

export interface SendMetaCapiEventInput {
  eventName: string
  eventId: string
  nome: string
  telefone: string
  email?: string | null
  contentName?: string | null
  url?: string | null
  // Atribuição — vem de cookie (chamada client-side, no momento do Lead) ou
  // do fbclid salvo no lead (chamada server-side, num estágio posterior do
  // funil, quando não há cookie de navegador disponível).
  fbclid?: string | null
  fbclidTs?: number | null
  fbp?: string | null
  fbcCookie?: string | null
  clientIp?: string | null
  userAgent?: string | null
}

export type SendMetaCapiEventResult =
  | { ok: true }
  | { ok: false; skipped: true }
  | { ok: false; error: string }

export async function sendMetaCapiEvent(input: SendMetaCapiEventInput): Promise<SendMetaCapiEventResult> {
  const token = process.env.META_CAPI_TOKEN
  if (!token) return { ok: false, skipped: true }

  // F-Match-Verify: classifica origem do _fbc pra agregar match quality no log.
  //   cookie = Pixel plantou (melhor)
  //   synthesized_click_ts = sintetizado com timestamp do click original (bom)
  //   synthesized_now = sintetizado com timestamp do evento (aceitável — Meta docs
  //                     dizem que baixa um pouco o match quality)
  //   none = sem fbc (organic, sem ad Meta)
  const clickTsSafe = input.fbclidTs ?? Date.now()
  const fbc = input.fbcCookie || (input.fbclid ? `fb.1.${clickTsSafe}.${input.fbclid}` : null)
  const fbc_source: 'cookie' | 'synthesized_click_ts' | 'synthesized_now' | 'none' =
    input.fbcCookie ? 'cookie'
    : !input.fbclid ? 'none'
    : input.fbclidTs != null ? 'synthesized_click_ts'
    : 'synthesized_now'

  const userData: Record<string, unknown> = {
    ph: [hashPhone(input.telefone)],
    fn: [hashFirstName(input.nome)],
  }
  if (input.userAgent) userData.client_user_agent = input.userAgent
  const ln = hashLastName(input.nome)
  if (ln) userData.ln = [ln]
  if (input.email) userData.em = [hashEmail(input.email)]
  if (input.clientIp) userData.client_ip_address = input.clientIp
  if (input.fbp) userData.fbp = input.fbp
  if (fbc) userData.fbc = fbc

  // META_TEST_EVENT_CODE (env server, opcional): roteia os eventos pra aba
  // "Testar eventos" do Gerenciador de Eventos SEM poluir os dados reais.
  // Usar só durante validação; remover a env depois.
  const testEventCode = process.env.META_TEST_EVENT_CODE
  const payload = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: 'website',
        event_source_url: input.url || undefined,
        user_data: userData,
        custom_data: input.contentName ? { content_name: input.contentName } : undefined,
      },
    ],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  }

  // F-Match-Verify: agregável no Vercel Log Viewer pra medir % de cada fbc_source.
  // Só booleanos + enum — zero PII no log.
  logInfo(SOURCE, 'capi payload built', {
    event_name: input.eventName,
    fbc_source,
    has_fbp: Boolean(input.fbp),
    has_email: Boolean(input.email),
    has_phone: Boolean(input.telefone),
    has_ip: Boolean(input.clientIp),
  })

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )

    if (!res.ok) {
      const detail = await res.text()
      logError(SOURCE, 'graph api failed', new Error(`status=${res.status} body=${detail}`))
      return { ok: false, error: 'CAPI falhou' }
    }
    return { ok: true }
  } catch (err) {
    logError(SOURCE, 'fetch exception', err)
    return { ok: false, error: 'Erro de rede' }
  }
}
