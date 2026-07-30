// A mensagem que o cliente recebe no WhatsApp depois de pedir a simulação.
//
// A página promete "eu te mando o valor e as condições pelo WhatsApp". Até
// agora não mandava nada: o lead entrava no CRM e a pessoa ficava esperando
// uma mensagem que nunca chegava — a promessa mais visível da página era a
// única parte que não existia.
//
// Função pura, para o texto poder ser lido num teste em vez de descoberto em
// produção pelo cliente.

import type { Simulacao } from './simular'

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const brlExato = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export type DadosMensagem = {
  nomeCliente: string
  empreendimento: string
  unidade: string
  metragem: number
  dormitorios?: number | null
  andar?: number | null
  simulacao: Simulacao | null
  /** true quando a pessoa marcou "já quero esta unidade". */
  demonstrouInteresse: boolean
  corretor?: string
}

/**
 * Monta a mensagem. Sem emoji decorativo e sem "olá, tudo bem?" — é uma
 * resposta a algo que a pessoa acabou de pedir, não uma abordagem fria.
 *
 * O negrito do WhatsApp é `*texto*`; o itálico, `_texto_`.
 */
export function montarMensagemSimulacao(d: DadosMensagem): string {
  const nome = (d.nomeCliente || '').trim().split(/\s+/)[0] || 'Olá'
  const corretor = d.corretor || 'Stiven Allan'

  const ficha = [
    `${d.metragem}m²`,
    d.dormitorios ? `${d.dormitorios} quartos` : null,
    d.andar ? `${d.andar}º andar` : null,
  ].filter(Boolean).join(' · ')

  const linhas: string[] = [
    `${nome}, aqui é o ${corretor}.`,
    '',
    `Você pediu as condições da *unidade ${d.unidade}* do *${d.empreendimento}*:`,
    '',
    ficha,
  ]

  const s = d.simulacao
  if (s) {
    linhas.push(
      `*${brl(s.valorTotal)}*`,
      '',
      '*Como fica o pagamento*',
      `Entrada: ${brlExato(s.entrada)} (${s.entradaPercentual}%)`,
      `${s.parcelasQtd}x de ${brlExato(s.parcelaValor)}`,
    )
    if (s.reforcosQtd > 0) {
      linhas.push(`${s.reforcosQtd} reforços anuais de ${brlExato(s.reforcoValor)}`)
    }
    linhas.push(
      `Até as chaves: ${brlExato(s.ateAsChaves)} (${s.ateAsChavesPercentual}%)`,
      `Saldo na entrega: ${brlExato(s.saldoFinanciamento)}`,
    )
    // Quem mexeu no slider fez uma escolha — vale reconhecer, porque é o
    // gancho da conversa seguinte.
    if (!s.padraoDaTabela) {
      linhas.push('', `_Simulação com a entrada de ${brl(s.entrada)} que você escolheu._`)
    }
  } else {
    linhas.push('', 'Te passo os valores e as condições completas em seguida.')
  }

  linhas.push(
    '',
    '_Valores corrigidos pelo CUB/SC até a entrega e sujeitos à tabela vigente e à análise da construtora._',
  )

  if (d.demonstrouInteresse) {
    // A pessoa marcou "já quero". Não prometemos exclusividade — o estoque é
    // da construtora — mas confirmamos que a sinalização foi registrada.
    linhas.push('', 'Anotei seu interesse nesta unidade. Vou confirmar a disponibilidade com a construtora e te retorno hoje.')
  } else {
    linhas.push('', 'Qualquer dúvida é só responder por aqui.')
  }

  return linhas.join('\n')
}

/**
 * Aviso para o corretor. Separado da mensagem do cliente porque o que
 * interessa aqui é outra coisa: quem é, qual unidade e quanto a pessoa disse
 * que tem de entrada.
 */
export function montarAvisoCorretor(d: DadosMensagem & { whatsappCliente: string }): string {
  const s = d.simulacao
  const linhas = [
    d.demonstrouInteresse
      ? '*Interesse em unidade — pelo site*'
      : '*Simulação pedida no site*',
    '',
    `${d.nomeCliente} · +${d.whatsappCliente}`,
    `${d.empreendimento} · unidade ${d.unidade}`,
  ]
  if (s) {
    linhas.push(
      `${brl(s.valorTotal)} · entrada ${brl(s.entrada)} (${s.entradaPercentual}%) · ${s.parcelasQtd}x ${brl(s.parcelaValor)}`,
    )
    if (!s.padraoDaTabela) linhas.push('_Entrada escolhida pelo cliente, acima da tabela._')
  }
  linhas.push('', `https://wa.me/${d.whatsappCliente}`)
  return linhas.join('\n')
}
