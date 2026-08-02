/**
 * Quem mais está no negócio, além do comprador.
 *
 * O lead tem um telefone só. O negócio anda com mais gente: o
 * correspondente da Caixa que analisa o crédito, o contato da construtora
 * que libera a unidade, o despachante do cartório, o cônjuge que assina
 * junto. Cada um vive hoje numa conversa solta do WhatsApp, e achar o
 * número certo na hora de destravar o negócio é caçar no histórico.
 */

export const PAPEIS_ENVOLVIDO = [
  { value: 'construtora', label: 'Construtora' },
  { value: 'correspondente', label: 'Correspondente / banco' },
  { value: 'despachante', label: 'Despachante / cartório' },
  { value: 'advogado', label: 'Advogado' },
  { value: 'conjuge', label: 'Cônjuge' },
  { value: 'familiar', label: 'Familiar' },
  { value: 'parceiro', label: 'Corretor parceiro' },
  { value: 'outro', label: 'Outro' },
] as const

export type PapelEnvolvido = (typeof PAPEIS_ENVOLVIDO)[number]['value']

const PAPEIS_VALIDOS = new Set<string>(PAPEIS_ENVOLVIDO.map((p) => p.value))

export const ROTULO_ENVOLVIDO: Record<string, string> = Object.fromEntries(
  PAPEIS_ENVOLVIDO.map((p) => [p.value, p.label]),
)

export type EnvolvidoNormalizado = {
  nome: string
  papel: PapelEnvolvido
  whatsapp: string | null
  email: string | null
  observacoes: string | null
}

export type ResultadoEnvolvido =
  | { ok: true; envolvido: EnvolvidoNormalizado }
  | { ok: false; erro: string }

const texto = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null

/**
 * Deixa o número pronto para virar link.
 *
 * Guarda só dígitos com DDD, sem o 55: o país entra na hora de montar a
 * URL. Guardar formatado obrigaria a limpar a cada clique, e guardar com o
 * 55 já embutido faria "5548..." virar "555548..." no link.
 */
export function normalizarWhatsapp(bruto: unknown): string | null {
  if (typeof bruto !== 'string') return null
  let digitos = bruto.replace(/\D/g, '')
  if (!digitos) return null

  // Número colado do WhatsApp costuma vir com o 55 na frente.
  if (digitos.length > 11 && digitos.startsWith('55')) digitos = digitos.slice(2)

  return digitos.length >= 10 && digitos.length <= 13 ? digitos : null
}

/** Link do WhatsApp já com o país. Sem número, não há botão. */
export function linkWhatsapp(whatsapp: string | null, mensagem?: string): string | null {
  if (!whatsapp) return null
  const texto = mensagem ? '?text=' + encodeURIComponent(mensagem) : ''
  return `https://wa.me/55${whatsapp}${texto}`
}

export function normalizarEnvolvido(body: Record<string, unknown>): ResultadoEnvolvido {
  const nome = texto(body.nome, 120)
  if (!nome) return { ok: false, erro: 'informe o nome' }

  const papel = typeof body.papel === 'string' ? body.papel.trim() : ''
  if (!PAPEIS_VALIDOS.has(papel)) return { ok: false, erro: 'papel inválido' }

  // Número digitado errado é pior do que número ausente: o botão abriria uma
  // conversa com desconhecido. Melhor recusar do que gravar meio número.
  const whatsappBruto = typeof body.whatsapp === 'string' ? body.whatsapp.trim() : ''
  const whatsapp = normalizarWhatsapp(whatsappBruto)
  if (whatsappBruto && !whatsapp) {
    return { ok: false, erro: 'WhatsApp inválido — use DDD + número' }
  }

  const email = texto(body.email, 160)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, erro: 'e-mail inválido' }
  }

  return {
    ok: true,
    envolvido: {
      nome,
      papel: papel as PapelEnvolvido,
      whatsapp,
      email,
      observacoes: texto(body.observacoes, 500),
    },
  }
}
