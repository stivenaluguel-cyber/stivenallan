import { ESTAGIOS_FUNIL } from './estagios'

// O "Sócio" é a segunda opinião na hora de responder um lead: recebe a
// mensagem que ele mandou e devolve três caminhos de resposta com tons
// diferentes. Só monta prompt e interpreta a saída do modelo — a chamada
// HTTP vive na rota (src/app/api/admin/leads/[id]/sugestoes/route.ts), pra
// esta parte continuar testável sem rede.

export type TomSugestao = 'direto' | 'firme' | 'leve'

export type Sugestao = { tom: TomSugestao; texto: string }

export type LeadSocio = {
  nome?: string | null
  estagio_funil?: string | null
  temperatura?: number | null
  perfil?: string | null
  motivacao?: string | null
  prazo_compra?: string | null
  cidade_interesse?: string | null
  orcamento_max?: number | null
  faixa_investimento?: string | null
  entrada_disponivel?: string | null
  anotacoes?: string | null
  property_name?: string | null
  empreendimentos?: Empreendimento | Empreendimento[] | null
}

type Empreendimento = { nome?: string | null; cidade?: string | null }

export type MensagemSocio = { direcao: 'entrada' | 'saida'; mensagem: string }

// O join `empreendimentos(...)` chega como objeto pelo PostgREST (a FK é
// muitos-para-um), mas o supabase-js tipa como array porque não sabe a
// cardinalidade. Aceitar as duas formas evita um cast que esconderia o dia em
// que o formato mudar de verdade.
const primeiro = <T,>(v: T | T[] | null | undefined): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : (v ?? null)

export const TONS: { tom: TomSugestao; label: string; descricao: string }[] = [
  { tom: 'direto', label: 'Direto', descricao: 'Vai ao ponto e propõe o próximo passo' },
  { tom: 'firme', label: 'Firme', descricao: 'Assume a condução da conversa' },
  { tom: 'leve', label: 'Leve', descricao: 'Tira a pressão e mantém a porta aberta' },
]

// Corta paste gigante antes de virar prompt. Um lead não manda 2000
// caracteres no WhatsApp; o que passa disso normalmente é print de conversa
// inteira colado sem querer.
export const MAX_MENSAGEM = 2000

// Quantas mensagens de contexto vão junto. Oito cobre a rodada atual da
// conversa sem arrastar o histórico de meses atrás pro prompt.
export const MAX_HISTORICO = 8

const TEMPERATURA_LABEL: Record<number, string> = { 3: 'quente', 2: 'morno', 1: 'frio' }

const estagioLabel = (key?: string | null) =>
  ESTAGIOS_FUNIL.find((e) => e.key === key)?.label ?? null

const primeiroNome = (nome?: string | null): string | null => {
  const limpo = nome?.trim()
  if (!limpo) return null
  const primeiro = limpo.split(/\s+/)[0]
  return primeiro && primeiro.length > 1 ? primeiro : null
}

const interesse = (lead: LeadSocio): string | null =>
  primeiro(lead.empreendimentos)?.nome ?? lead.property_name ?? null

/**
 * Última coisa que o LEAD falou (direcao 'entrada'). O histórico chega em
 * ordem cronológica, então a busca é de trás pra frente.
 */
export function ultimaMensagemDoLead(historico: MensagemSocio[]): string | null {
  for (let i = historico.length - 1; i >= 0; i--) {
    const m = historico[i]
    if (m.direcao === 'entrada' && m.mensagem?.trim()) return m.mensagem.trim()
  }
  return null
}

function linhasDeContexto(lead: LeadSocio): string[] {
  const linhas: string[] = []
  const nome = primeiroNome(lead.nome)
  if (nome) linhas.push(`- Primeiro nome: ${nome}`)
  const estagio = estagioLabel(lead.estagio_funil)
  if (estagio) linhas.push(`- Estágio no funil: ${estagio}`)
  const temp = lead.temperatura ? TEMPERATURA_LABEL[lead.temperatura] : null
  if (temp) linhas.push(`- Temperatura: ${temp}`)
  const imovel = interesse(lead)
  if (imovel) linhas.push(`- Empreendimento de interesse: ${imovel}`)
  if (lead.cidade_interesse) linhas.push(`- Cidade de interesse: ${lead.cidade_interesse}`)
  if (lead.perfil && lead.perfil !== 'indefinido') linhas.push(`- Perfil: ${lead.perfil}`)
  if (lead.motivacao) linhas.push(`- Motivação declarada: ${lead.motivacao}`)
  if (lead.prazo_compra) linhas.push(`- Prazo de compra: ${lead.prazo_compra}`)
  if (lead.faixa_investimento) linhas.push(`- Faixa de investimento: ${lead.faixa_investimento}`)
  if (lead.entrada_disponivel) linhas.push(`- Entrada disponível: ${lead.entrada_disponivel}`)
  if (lead.orcamento_max) linhas.push(`- Orçamento máximo: R$ ${Math.round(lead.orcamento_max).toLocaleString('pt-BR')}`)
  if (lead.anotacoes?.trim()) linhas.push(`- Anotações do corretor: ${lead.anotacoes.trim().slice(0, 400)}`)
  return linhas
}

export function montarPromptSocio(params: {
  lead: LeadSocio
  mensagem: string
  historico?: MensagemSocio[]
}): string {
  const { lead, mensagem } = params
  const historico = (params.historico ?? []).slice(-MAX_HISTORICO)
  const contexto = linhasDeContexto(lead)

  const conversa = historico.length
    ? historico
        .map((m) => `${m.direcao === 'entrada' ? 'Lead' : 'Corretor'}: ${m.mensagem.trim().slice(0, 400)}`)
        .join('\n')
    : '(sem histórico registrado no painel)'

  return `Você é o sócio experiente de Stiven Allan, corretor em Criciúma/SC especializado em apartamento na planta com financiamento direto da construtora.

Ele acabou de receber uma resposta de um lead no WhatsApp e precisa de três caminhos diferentes para continuar a conversa.

REGRAS OBRIGATÓRIAS
- Escreva como mensagem de WhatsApp: 2 a 4 frases, sem assinatura, sem "prezado", no máximo um emoji.
- NUNCA invente preço, metragem, unidade disponível, prazo de entrega, juros ou condição de pagamento. Se precisar tocar em número, escreva de um jeito que deixe o corretor confirmar depois.
- NUNCA invente algo que o lead disse ou um imóvel que não está no contexto.
- Use o primeiro nome do lead só se ele aparecer no contexto abaixo.
- Toda resposta termina puxando o próximo passo — uma pergunta ou um convite claro.
- Português do Brasil, informal-profissional.

CONTEXTO DO LEAD
${contexto.length ? contexto.join('\n') : '(nenhum dado além da conversa)'}

CONVERSA RECENTE (mais antiga primeiro)
${conversa}

MENSAGEM QUE PRECISA DE RESPOSTA
"${mensagem.trim().slice(0, MAX_MENSAGEM)}"

Devolva exatamente três respostas, nada além disso, exatamente neste formato:
<<<DIRETO>>>
(objetiva, vai ao ponto e propõe o próximo passo)
<<<FIRME>>>
(assume a condução, cria urgência real sem pressionar nem inventar escassez)
<<<LEVE>>>
(descontraída, tira a pressão e mantém a porta aberta)`
}

const MAPA_TOM: Record<string, TomSugestao> = { DIRETO: 'direto', FIRME: 'firme', LEVE: 'leve' }

// O modelo às vezes devolve a resposta entre aspas, com **negrito** ou com um
// parêntese de rótulo herdado do próprio formato do prompt. Nada disso pode
// chegar no WhatsApp do cliente.
function limpar(bruto: string): string {
  return bruto
    .replace(/\*\*/g, '')
    .replace(/^\s*\((?:objetiva|assume|descontraída)[^)]*\)\s*/i, '')
    .trim()
    .replace(/^["“”']+|["“”']+$/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 700)
}

/**
 * Interpreta a saída do modelo. Formato marcado (<<<DIRETO>>>) em vez de JSON
 * de propósito: o texto tem aspas, quebra de linha e acento, e JSON malformado
 * era a forma mais provável de a feature falhar em produção.
 *
 * Devolve só os tons que vieram com texto — se o modelo entregar dois em vez
 * de três, mostrar dois é melhor que descartar a resposta inteira.
 */
export function parseSugestoes(bruto: string): Sugestao[] {
  const partes = String(bruto ?? '').split(/<<<\s*(DIRETO|FIRME|LEVE)\s*>>>/i)
  const out: Sugestao[] = []
  for (let i = 1; i < partes.length; i += 2) {
    const tom = MAPA_TOM[partes[i].toUpperCase()]
    const texto = limpar(partes[i + 1] ?? '')
    if (tom && texto && !out.some((s) => s.tom === tom)) out.push({ tom, texto })
  }
  return out
}
