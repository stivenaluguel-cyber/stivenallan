// Playbooks de abordagem no DM do Instagram, um por origem da fila de ativação.
//
// A abordagem é MANUAL: o operador copia o texto renderizado e cola no DM.
// Por isso o render precisa falhar de forma explícita quando falta variável —
// devolver "{nome}" cru pro operador colar sem perceber queima o contato.
//
// Regras de conteúdo (não relaxar):
// - NUNCA incluir CRECI nestes textos (regra do usuário para redes sociais).
// - NUNCA prometer aprovação de financiamento nem valorização do imóvel.
// - Sempre terminar com pergunta aberta: o objetivo é abrir conversa, não vender.

export const ORIGENS_ATIVACAO = [
  'novo_seguidor',
  'curtida',
  'comentario',
  'story',
  'seguidor_antigo',
  'reativacao',
] as const

export type OrigemAtivacao = (typeof ORIGENS_ATIVACAO)[number]

export function origemAtivacaoValida(v: unknown): v is OrigemAtivacao {
  return typeof v === 'string' && (ORIGENS_ATIVACAO as readonly string[]).includes(v)
}

export type Playbook = {
  origem: OrigemAtivacao
  /** Nome curto pra UI. */
  label: string
  /** Template com variáveis no formato {nome}. */
  template: string
  /** Variáveis obrigatórias — sem todas elas o render devolve null. */
  variaveis: readonly string[]
}

export const PLAYBOOKS: Record<OrigemAtivacao, Playbook> = {
  novo_seguidor: {
    origem: 'novo_seguidor',
    label: 'Novo seguidor',
    template:
      'Oi, {nome}! Vi que você chegou por aqui agora. Você está buscando apartamento pra morar, pra investir, ou só acompanhando o mercado da região?',
    variaveis: ['nome'],
  },
  curtida: {
    origem: 'curtida',
    label: 'Curtida em post',
    template:
      'Oi, {nome}! Vi que você curtiu nosso post sobre {assunto}. Já conhece o financiamento direto com a construtora ou ainda está pesquisando?',
    variaveis: ['nome', 'assunto'],
  },
  story: {
    origem: 'story',
    label: 'Reação em story',
    template:
      'Oi, {nome}! Vi que o story de {assunto} chamou sua atenção. É algo pra agora ou você está entendendo as opções?',
    variaveis: ['nome', 'assunto'],
  },
  comentario: {
    origem: 'comentario',
    label: 'Comentário',
    template:
      'Oi, {nome}! Vim continuar por aqui pra não te deixar com resposta genérica. Antes de te mandar valores e plantas, me conta: você já tem uma entrada guardada ou pretende montar?',
    variaveis: ['nome'],
  },
  seguidor_antigo: {
    origem: 'seguidor_antigo',
    label: 'Seguidor antigo',
    template:
      'Oi, {nome}! Você acompanha a gente há um tempo e nunca conversamos por aqui. Hoje, comprar apartamento na planta com financiamento direto faz sentido pra você?',
    variaveis: ['nome'],
  },
  reativacao: {
    origem: 'reativacao',
    label: 'Reativação',
    template:
      'Oi, {nome}! A gente já conversou por aqui antes. Como ficou a busca pelo apartamento? Posso te mostrar o que mudou nas condições da construtora?',
    variaveis: ['nome'],
  },
}

// Meta diária de abordagens manuais. O método de referência fala em 100/dia,
// mas começar nesse volume numa conta que nunca abordou em massa é receita de
// bloqueio — o Instagram limita DMs para contas sem histórico. Rampa de
// segurança: começar em 20/dia e só subir depois de semanas sem aviso da conta.
export const META_DIARIA_ABORDAGENS = 20

/**
 * Renderiza o playbook da origem substituindo as variáveis.
 *
 * Devolve `null` quando a origem não existe ou quando falta variável
 * obrigatória (ou ela está vazia) — nunca devolve texto com `{placeholder}`
 * cru pro operador copiar sem ver.
 */
export function renderPlaybook(origem: string, vars: Record<string, string | null | undefined>): string | null {
  if (!origemAtivacaoValida(origem)) return null
  const playbook = PLAYBOOKS[origem]

  for (const variavel of playbook.variaveis) {
    const valor = vars[variavel]
    if (typeof valor !== 'string' || valor.trim() === '') return null
  }

  return playbook.template.replace(/\{(\w+)\}/g, (_m, chave: string) => (vars[chave] ?? '').trim())
}
