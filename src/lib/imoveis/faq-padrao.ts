export type FaqItem = { pergunta: string; resposta: string }

type DadosEmpreendimento = {
  nome?: string | null
  cidade?: string | null
  bairro?: string | null
  endereco?: string | null
  uf?: string | null
  dormitorios?: string | null
  suites?: string | null
  vagas?: string | null
  metragem?: string | null
  status?: string | null
  previsao_entrega?: string | null
}

// FAQ é o formato que mais faz uma página ser citada por buscadores e por
// assistentes de IA — mas o formulário do painel não tinha campo pra isso, então
// todo empreendimento cadastrado nascia SEM FAQPage no JSON-LD e sem a seção na
// página. Aqui montamos um FAQ mínimo a partir dos campos que o corretor já
// preencheu, para que nenhuma página nasça sem essa cobertura.
//
// Regra que vale a pena manter: cada pergunta só entra se existir dado REAL para
// respondê-la. Nada de "consulte-nos" genérico repetido em todas as páginas —
// isso seria conteúdo duplicado em escala, que prejudica em vez de ajudar.
export function gerarFaqPadrao(d: DadosEmpreendimento): FaqItem[] {
  const nome = (d.nome || '').trim()
  if (!nome) return []

  const faq: FaqItem[] = []

  const local = [d.endereco, d.bairro, d.cidade && d.uf ? `${d.cidade}/${d.uf}` : d.cidade]
    .map((p) => (p || '').trim())
    .filter(Boolean)
    .join(', ')
  if (local) {
    faq.push({
      pergunta: `Onde fica o ${nome}?`,
      resposta: `O ${nome} fica em ${local}.`,
    })
  }

  const specs: string[] = []
  if (d.dormitorios) specs.push(`${d.dormitorios} dormitório(s)`)
  if (d.suites) specs.push(`${d.suites} suíte(s)`)
  if (d.metragem) specs.push(`${d.metragem} m² de área privativa`)
  if (d.vagas) specs.push(`${d.vagas} vaga(s) de garagem`)
  if (specs.length > 0) {
    faq.push({
      pergunta: `Quais as plantas e metragens do ${nome}?`,
      resposta: `O ${nome} tem unidades com ${specs.join(', ')}. Consulte a disponibilidade atualizada para conferir as plantas de cada tipologia.`,
    })
  }

  const fase = (d.status || '').trim()
  if (fase) {
    const entrega = (d.previsao_entrega || '').trim()
    faq.push({
      pergunta: `Qual o estágio da obra do ${nome}?`,
      resposta: `O ${nome} está na fase "${fase}".` + (entrega ? ` A previsão de entrega é ${entrega}.` : ''),
    })
  }

  // Só faz sentido falar de financiamento direto se houver empreendimento
  // identificado — e essa é a pergunta comercial mais frequente do site.
  faq.push({
    pergunta: `Como funciona o pagamento do ${nome}?`,
    resposta:
      `O ${nome} pode ser negociado com financiamento direto com a construtora, sem depender de aprovação bancária para começar. ` +
      'Entrada, parcelas, reforços e índices de correção variam conforme o empreendimento e a tabela vigente — fale com o corretor para receber as condições atuais.',
  })

  return faq
}

/** Usa o FAQ preenchido à mão quando existir; senão, o gerado dos dados. */
export function resolverFaq(faqSalvo: unknown, dados: DadosEmpreendimento): FaqItem[] {
  if (Array.isArray(faqSalvo)) {
    const validos = faqSalvo.filter(
      (f): f is FaqItem =>
        typeof f?.pergunta === 'string' && f.pergunta.trim() !== '' &&
        typeof f?.resposta === 'string' && f.resposta.trim() !== '',
    )
    if (validos.length > 0) return validos
  }
  return gerarFaqPadrao(dados)
}
