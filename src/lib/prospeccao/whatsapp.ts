import { pareceCelularBR } from '@/lib/leads/normalize'

// Mensagem de primeiro contato pra empresa achada na Prospecção — sem
// histórico de conversa (decisão: não rastrear mensagem de lead que ainda
// não é lead de verdade). Só compõe o texto; quem manda é o corretor pelo
// próprio WhatsApp, abrindo o link — igual ao "WhatsApp" que já existia,
// agora com o texto pronto em vez de abrir a conversa em branco.

const MAX_TRECHO_PRODUTO = 140

// Só a primeira frase do produto (até '.', '!' ou '?') — o campo é texto
// livre do formulário e pode vir com 2-3 frases; colar tudo no meio de uma
// mensagem de abertura fica comprido e sem jeito de ler no celular.
function primeiraFrase(produto: string): string {
  const trecho = produto.trim().split(/[.!?]/)[0].trim()
  return trecho.length > MAX_TRECHO_PRODUTO ? trecho.slice(0, MAX_TRECHO_PRODUTO).trim() + '…' : trecho
}

export function mensagemWhatsAppProspeccao(nomeEmpresa: string, produto: string): string {
  const resumo = primeiraFrase(produto)
  const sobre = resumo ? ' — ' + resumo : ''
  return `Olá! Tudo bem? Encontrei a ${nomeEmpresa} pesquisando parceiros${sobre}. Faz sentido conversarmos?`
}

/**
 * Link do WhatsApp já com a mensagem preenchida — null quando o telefone
 * não tem cara de celular (fixo não recebe WhatsApp, mesma checagem do
 * placeholder pj: usado na promoção).
 */
export function linkWhatsappProspeccao(telefone: string | null, nomeEmpresa: string, produto: string): string | null {
  const digitos = telefone?.replace(/\D/g, '') ?? ''
  if (!pareceCelularBR(digitos)) return null
  return 'https://wa.me/55' + digitos + '?text=' + encodeURIComponent(mensagemWhatsAppProspeccao(nomeEmpresa, produto))
}
