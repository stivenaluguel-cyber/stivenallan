import { createHmac, timingSafeEqual } from 'node:crypto'

// Verificação manual de assinatura Svix (usada pelo Resend), no mesmo
// estilo de node:crypto já usado em src/lib/leads/unsubscribe-token.ts —
// sem adicionar a lib `svix` como dependência.
//
// Algoritmo: HMAC-SHA256(base64_decode(secret sem prefixo "whsec_"),
// `${svix-id}.${svix-timestamp}.${rawBody}`), comparado contra cada entrada
// "v1,<base64>" do header svix-signature (pode vir mais de uma, espaço-
// separadas). SEMPRE usar o corpo raw — reserializar o JSON quebra a
// assinatura.

const TOLERANCIA_SEGUNDOS = 5 * 60

export function verificarAssinaturaResend(params: {
  secret: string
  svixId: string
  svixTimestamp: string
  svixSignature: string
  rawBody: string
  agora?: number
}): boolean {
  const { secret, svixId, svixTimestamp, svixSignature, rawBody } = params
  const agora = params.agora ?? Math.floor(Date.now() / 1000)

  const ts = Number(svixTimestamp)
  if (!Number.isFinite(ts) || Math.abs(agora - ts) > TOLERANCIA_SEGUNDOS) return false

  const semPrefixo = secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret
  let chave: Buffer
  try {
    chave = Buffer.from(semPrefixo, 'base64')
  } catch {
    return false
  }

  const conteudoAssinado = `${svixId}.${svixTimestamp}.${rawBody}`
  const esperado = createHmac('sha256', chave).update(conteudoAssinado).digest('base64')
  const esperadoBuf = Buffer.from(esperado, 'base64')

  const assinaturas = svixSignature
    .split(' ')
    .map((entrada) => entrada.split(',')[1])
    .filter((v): v is string => Boolean(v))

  return assinaturas.some((sig) => {
    try {
      const sigBuf = Buffer.from(sig, 'base64')
      return sigBuf.length === esperadoBuf.length && timingSafeEqual(sigBuf, esperadoBuf)
    } catch {
      return false
    }
  })
}

// Eventos do catálogo do Resend não listados aqui (email.sent,
// email.delivery_delayed, email.failed, email.received) são ignorados de
// propósito — o handler responde 200 sem ação pra não entrar em
// retry-loop.
export const MAPA_TIPO_EVENTO: Record<string, 'entregue' | 'aberto' | 'clicado' | 'bounce' | 'reclamado'> = {
  'email.delivered': 'entregue',
  'email.opened': 'aberto',
  'email.clicked': 'clicado',
  'email.bounced': 'bounce',
  'email.suppressed': 'bounce',
  'email.complained': 'reclamado',
}
