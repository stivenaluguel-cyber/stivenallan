// Extração pura do payload de mensagem recebida da WhatsApp Cloud API.
// Formato bem diferente do Evolution (webhook/whatsapp/route.ts) — mais
// parecido com o do Instagram (entry[].changes[].value), só que a lista de
// mensagens vem em value.messages[], não value.messaging[]. A assinatura
// HMAC (x-hub-signature-256) e o handshake (hub.challenge) são os mesmos
// de sempre — ver verificarAssinaturaMeta/resolverDesafioVerificacaoMeta em
// meta-leadgen-webhook.ts, reaproveitados sem duplicar.
//
// A mesma rota de webhook também recebe callbacks de status de entrega
// (value.statuses[], sem value.messages) — esses não têm mensagem nenhuma
// pra extrair, então somem naturalmente do resultado.

export type MensagemWhatsappCloud = {
  from: string
  texto: string
  wamid: string | null
  timestamp: number | null
  phoneNumberId: string | null
}

// Só mensagens de texto por enquanto — imagem/áudio/interativo ficam pra
// quando a integração de verdade (lead/IA) for ligada nesta rota.
export function extrairMensagensWhatsappCloud(payload: unknown): MensagemWhatsappCloud[] {
  const resultado: MensagemWhatsappCloud[] = []
  if (!payload || typeof payload !== 'object') return resultado
  const entries = (payload as { entry?: unknown }).entry
  if (!Array.isArray(entries)) return resultado

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue
    const changes = (entry as { changes?: unknown }).changes
    if (!Array.isArray(changes)) continue

    for (const change of changes) {
      if (!change || typeof change !== 'object') continue
      const value = (change as { value?: unknown }).value
      if (!value || typeof value !== 'object') continue

      const metadata = (value as { metadata?: unknown }).metadata
      const phoneNumberId =
        metadata && typeof metadata === 'object' && typeof (metadata as { phone_number_id?: unknown }).phone_number_id === 'string'
          ? (metadata as { phone_number_id: string }).phone_number_id
          : null

      const messages = (value as { messages?: unknown }).messages
      if (!Array.isArray(messages)) continue

      for (const msg of messages) {
        if (!msg || typeof msg !== 'object') continue
        if ((msg as { type?: unknown }).type !== 'text') continue

        const texto = (msg as { text?: { body?: unknown } }).text?.body
        if (typeof texto !== 'string' || !texto.trim()) continue

        const from = (msg as { from?: unknown }).from
        if (typeof from !== 'string' || !from) continue

        const wamid = (msg as { id?: unknown }).id
        // timestamp da Cloud API vem como STRING de segundos unix (diferente
        // do Instagram, que manda number em ms).
        const timestampRaw = (msg as { timestamp?: unknown }).timestamp
        const timestamp = typeof timestampRaw === 'string' && /^\d+$/.test(timestampRaw) ? Number(timestampRaw) : null

        resultado.push({
          from,
          texto: texto.trim(),
          wamid: typeof wamid === 'string' ? wamid : null,
          timestamp,
          phoneNumberId,
        })
      }
    }
  }
  return resultado
}
