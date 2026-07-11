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
