// Mensagens diretas (DM) do Instagram chegam no mesmo formato de webhook do
// Messenger — `entry[].messaging[]`, cada item com `sender.id` (IGSID),
// `message.text` e `message.mid`. A assinatura HMAC (x-hub-signature-256) e
// o handshake de verificação (hub.challenge) são idênticos ao do Lead Ads —
// ver verificarAssinaturaMeta/resolverDesafioVerificacaoMeta em
// meta-leadgen-webhook.ts, reaproveitados aqui sem duplicar.

export type MensagemInstagramDM = {
  senderId: string
  texto: string
  mid: string | null
  timestamp: number | null
}

// Filtra "echoes" (a própria página respondendo, replicada de volta pelo
// webhook) e eventos sem texto (reações, anexos sem legenda, etc.) — só
// interessa aqui o que vira lead/histórico de conversa real.
export function extrairMensagensInstagram(payload: unknown): MensagemInstagramDM[] {
  const resultado: MensagemInstagramDM[] = []
  if (!payload || typeof payload !== 'object') return resultado
  const entries = (payload as { entry?: unknown }).entry
  if (!Array.isArray(entries)) return resultado

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue
    const messaging = (entry as { messaging?: unknown }).messaging
    if (!Array.isArray(messaging)) continue

    for (const evento of messaging) {
      if (!evento || typeof evento !== 'object') continue
      const message = (evento as { message?: unknown }).message
      if (!message || typeof message !== 'object') continue
      if ((message as { is_echo?: unknown }).is_echo === true) continue

      const texto = (message as { text?: unknown }).text
      if (typeof texto !== 'string' || !texto.trim()) continue

      const senderId = (evento as { sender?: { id?: unknown } }).sender?.id
      if (typeof senderId !== 'string' || !senderId) continue

      const mid = (message as { mid?: unknown }).mid
      const timestamp = (evento as { timestamp?: unknown }).timestamp

      resultado.push({
        senderId,
        texto: texto.trim(),
        mid: typeof mid === 'string' ? mid : null,
        timestamp: typeof timestamp === 'number' ? timestamp : null,
      })
    }
  }
  return resultado
}
