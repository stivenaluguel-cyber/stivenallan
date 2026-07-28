// Helpers puros para saneamento de campos de lead antes de gravar.
// Regra: strings vazias / whitespace-only viram null (não ocupam coluna sem valor útil).

export function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

// Telefone: preserva só dígitos. Não valida DDD/país — só remove ruído do input humano.
export function normalizePhone(value: unknown): string | null {
  const s = normalizeString(value)
  if (s === null) return null
  const digits = s.replace(/\D/g, '')
  return digits === '' ? null : digits
}

// E-mail: trim + lowercase. Sem validação de formato aqui — mantém contrato antigo do endpoint.
export function normalizeEmail(value: unknown): string | null {
  const s = normalizeString(value)
  return s ? s.toLowerCase() : null
}

// Lead vindo de DM do Instagram não tem telefone (só o IGSID da conversa) —
// `leads.whatsapp` é NOT NULL, então gravamos um placeholder reconhecível
// (`ig:<igsid>`) até o corretor conseguir o telefone real na conversa e
// editar o lead. Qualquer lugar que monta um link wa.me/CTA de WhatsApp
// deve checar `temWhatsappReal` antes — nunca gerar link a partir do
// placeholder.
export const IG_WHATSAPP_PLACEHOLDER_PREFIX = 'ig:'

export function temWhatsappReal(whatsapp: string | null | undefined): whatsapp is string {
  return !!whatsapp && !whatsapp.startsWith(IG_WHATSAPP_PLACEHOLDER_PREFIX)
}
