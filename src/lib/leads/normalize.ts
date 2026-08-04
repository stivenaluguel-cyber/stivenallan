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

// Mesmo problema, origem diferente: lead promovido da Prospecção (empresa
// achada via Google Places) às vezes só tem telefone fixo — que não recebe
// WhatsApp. Em vez de gravar um fixo em `leads.whatsapp` fingindo ser
// utilizável, grava esse placeholder (`pj:<place_id>`) até o corretor
// confirmar um número de verdade.
export const PJ_WHATSAPP_PLACEHOLDER_PREFIX = 'pj:'

const PLACEHOLDER_PREFIXES = [IG_WHATSAPP_PLACEHOLDER_PREFIX, PJ_WHATSAPP_PLACEHOLDER_PREFIX]

export function temWhatsappReal(whatsapp: string | null | undefined): whatsapp is string {
  return !!whatsapp && !PLACEHOLDER_PREFIXES.some((prefixo) => whatsapp.startsWith(prefixo))
}

/**
 * Por que este lead não tem WhatsApp confirmado — pra tela mostrar o motivo
 * certo em vez de sempre dizer "veio do Instagram" (verdade só até a
 * Prospecção existir; hoje "sem WhatsApp real" tem duas causas possíveis).
 * `null` quando o WhatsApp É real — nada a explicar.
 *
 * `artigo` existe só pra concordância nominal de quem monta frase tipo
 * "veio d{artigo} {label}" — "do Instagram" (masculino) x "da Prospecção"
 * (feminino). Quem só precisa do rótulo solto ("Só Instagram", "🏢
 * Prospecção") ignora o campo.
 */
export function motivoSemWhatsappReal(whatsapp: string | null | undefined): { emoji: string; label: string; artigo: 'o' | 'a' } | null {
  if (temWhatsappReal(whatsapp)) return null
  const valor = whatsapp ?? ''
  if (valor.startsWith(PJ_WHATSAPP_PLACEHOLDER_PREFIX)) return { emoji: '🏢', label: 'Prospecção', artigo: 'a' }
  return { emoji: '📷', label: 'Instagram', artigo: 'o' }
}

// Celular brasileiro tem 11 dígitos (DDD + 9 + 8 dígitos); fixo tem 10 (DDD +
// 8 dígitos, sem o 9). `normalizarCelularBR` aceita as duas formas — correto
// pro formulário público, que pede "WhatsApp" e confia no usuário — mas a
// Prospecção lê telefone de cadastro empresarial (Google Places), onde é
// comum vir só o fixo da recepção. Sem essa checagem, um fixo de 10 dígitos
// passava batido e virava um link wa.me morto.
export function pareceCelularBR(digitosComDdd: string): boolean {
  return digitosComDdd.length === 11 && digitosComDdd[2] === '9'
}

/**
 * Celular brasileiro utilizável, para formulário público.
 *
 * `normalizePhone` só remove o que não é dígito — deixa passar qualquer
 * comprimento. No espelho de vendas isso admitiu um "48999924724234" de 14
 * dígitos vindo do site: um lead que nunca poderá ser contatado, ocupando o
 * índice único de `leads.whatsapp`.
 *
 * Aceita 10 ou 11 dígitos (com DDD) e 12/13 com o 55 na frente, que é como
 * export de WhatsApp costuma vir.
 */
export function normalizarCelularBR(value: unknown): string | null {
  const digitos = normalizePhone(value)
  if (!digitos) return null
  const semPais = digitos.length > 11 && digitos.startsWith('55') ? digitos.slice(2) : digitos
  if (semPais.length < 10 || semPais.length > 11) return null
  return semPais
}
