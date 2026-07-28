import { temWhatsappReal } from '@/lib/leads/normalize'

export type LeadMensagem = {
  nome?: string | null
  whatsapp: string
  empreendimentos?: { nome?: string } | null
  property_name?: string | null
}

export type SinaisMensagem = {
  followupVencido?: boolean
  agendaVencida?: boolean
  nuncaContatado?: boolean
  quente?: boolean
}

// Primeiro nome do lead, ou null quando não há nome utilizável. Não devolve
// um "fallback" que vira saudação — o texto antigo usava 'tudo bem' como
// fallback de nome e produzia "Olá, tudo bem! Tudo bem?".
export function primeiroNome(nome?: string | null): string | null {
  const limpo = nome?.trim()
  if (!limpo) return null
  const primeiro = limpo.split(/\s+/)[0]
  return primeiro && primeiro.length > 1 ? primeiro : null
}

export function interessePrincipal(lead: LeadMensagem): string | null {
  return lead.empreendimentos?.nome ?? lead.property_name ?? null
}

// A mensagem só traduz o motivo REAL pelo qual o lead está na fila — nunca
// inventa imóvel, cidade, orçamento ou fala do cliente. A ordem dos casos é
// a mesma de explainFocusPriority/recommendFocusAction.
export function mensagemWhatsApp(lead: LeadMensagem, sinais: SinaisMensagem): string {
  const nome = primeiroNome(lead.nome)
  const saudacao = nome ? `Olá, ${nome}! Tudo bem?` : 'Olá! Tudo bem?'
  const interesse = interessePrincipal(lead)
  const sobre = interesse ? ` sobre o ${interesse}` : ''

  if (sinais.followupVencido) return `${saudacao} Passando para retomar nosso contato${sobre}. Posso te ajudar com alguma informação?`
  if (sinais.agendaVencida) return `${saudacao} Vi que ficamos de nos falar${sobre} e o compromisso ficou pendente. Podemos remarcar?`
  if (sinais.nuncaContatado) return `${saudacao} Sou da Stiven Allan. Vi seu interesse${sobre} e estou à disposição para te ajudar.`
  if (sinais.quente) return `${saudacao} Notei seu interesse${sobre} e queria entender melhor o que você procura — posso te ajudar agora?`
  return `${saudacao} Estou passando para saber se ainda faz sentido conversarmos${sobre}.`
}

export function montarLinkWhatsApp(whatsapp: string, texto: string): string | null {
  if (!temWhatsappReal(whatsapp)) return null
  const digitos = whatsapp.replace(/\D/g, '')
  if (!digitos) return null
  const numero = digitos.startsWith('55') ? digitos : '55' + digitos
  return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto)
}

// Abre a conversa detectando bloqueio de pop-up. Antes, o window.open era
// disparado sem checar o retorno e o aviso de sucesso aparecia mesmo quando
// nada tinha aberto.
export function abrirWhatsApp(url: string): { popupBloqueado: boolean } {
  const janela = window.open(url, '_blank', 'noopener,noreferrer')
  return { popupBloqueado: !janela || janela.closed }
}
