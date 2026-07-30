import { describe, it, expect } from 'vitest'
import { montarAvisoCorretor, montarMensagemSimulacao } from './mensagem-espelho'
import type { Simulacao } from './simular'

// Simulação real da unidade 1506 do Pineto, tal como ficou gravada no teste
// de produção de 29/07: entrada da tabela e, depois, a ajustada pelo cliente.
const PADRAO: Simulacao = {
  valorTotal: 752310.42, entrada: 60184.83, entradaPercentual: 8,
  parcelasQtd: 40, parcelaValor: 3009.24,
  reforcosQtd: 4, reforcoValor: 11284.66,
  ateAsChaves: 225693.13, ateAsChavesPercentual: 30,
  saldoFinanciamento: 526617.29,
  padraoDaTabela: true, reforcoEmParcelas: 3.75,
}

const AJUSTADA: Simulacao = {
  ...PADRAO, entrada: 174184.83, entradaPercentual: 23.2,
  parcelaValor: 936.51, reforcoValor: 3511.91,
  padraoDaTabela: false,
}

const BASE = {
  nomeCliente: 'Roberto Lima Souza',
  empreendimento: 'Pineto Residencial',
  unidade: '1506',
  metragem: 75.72,
  dormitorios: 2,
  andar: 15,
  demonstrouInteresse: false,
}

describe('montarMensagemSimulacao', () => {
  it('trata a pessoa pelo primeiro nome, não pelo nome completo', () => {
    const m = montarMensagemSimulacao({ ...BASE, simulacao: PADRAO })
    expect(m.startsWith('Roberto, aqui é o Stiven Allan.')).toBe(true)
    expect(m).not.toContain('Roberto Lima Souza')
  })

  it('entrega o que a página prometeu: valor e as condições completas', () => {
    const m = montarMensagemSimulacao({ ...BASE, simulacao: PADRAO })
    expect(m).toContain('unidade 1506')
    expect(m).toContain('Pineto Residencial')
    expect(m).toContain('75.72m² · 2 quartos · 15º andar')
    expect(m).toContain('Entrada:')
    expect(m).toContain('40x de')
    expect(m).toContain('4 reforços anuais')
    expect(m).toContain('Até as chaves')
    expect(m).toContain('Saldo na entrega')
  })

  it('reconhece a entrada que o cliente escolheu — é o gancho da conversa', () => {
    const m = montarMensagemSimulacao({ ...BASE, simulacao: AJUSTADA })
    expect(m).toMatch(/entrada de R\$\s?174\.185 que você escolheu/)
  })

  it('não menciona escolha de entrada quando é a condição da tabela', () => {
    const m = montarMensagemSimulacao({ ...BASE, simulacao: PADRAO })
    expect(m).not.toMatch(/que você escolheu/)
  })

  it('quem marcou "já quero" NÃO recebe promessa de exclusividade', () => {
    const m = montarMensagemSimulacao({ ...BASE, simulacao: PADRAO, demonstrouInteresse: true })
    expect(m).toContain('confirmar a disponibilidade com a construtora')
    // O estoque é da construtora: nada de "separada" ou "garantida".
    expect(m).not.toMatch(/separada|reservada para você|garantid/i)
  })

  it('sempre carrega a ressalva de correção e tabela vigente', () => {
    for (const interesse of [true, false]) {
      const m = montarMensagemSimulacao({ ...BASE, simulacao: PADRAO, demonstrouInteresse: interesse })
      expect(m).toContain('CUB/SC')
      expect(m).toContain('tabela vigente')
    }
  })

  it('sem simulação, não inventa número — promete o retorno', () => {
    const m = montarMensagemSimulacao({ ...BASE, simulacao: null })
    expect(m).not.toMatch(/R\$/)
    expect(m).toContain('Te passo os valores')
  })

  it('nome vazio não gera saudação quebrada', () => {
    const m = montarMensagemSimulacao({ ...BASE, nomeCliente: '   ', simulacao: PADRAO })
    expect(m.startsWith('Olá, aqui é o')).toBe(true)
  })

  it('omite ficha que não existe em vez de imprimir vazio', () => {
    const m = montarMensagemSimulacao({ ...BASE, dormitorios: null, andar: null, simulacao: PADRAO })
    expect(m).toContain('75.72m²')
    expect(m).not.toContain('quartos')
    expect(m).not.toContain('º andar')
    expect(m).not.toContain('·  ·')
  })
})

describe('montarAvisoCorretor', () => {
  const comZap = { ...BASE, whatsappCliente: '48999998888' }

  it('abre com o que muda a prioridade: interesse é diferente de simulação', () => {
    expect(montarAvisoCorretor({ ...comZap, simulacao: PADRAO })).toContain('Simulação pedida no site')
    expect(montarAvisoCorretor({ ...comZap, simulacao: PADRAO, demonstrouInteresse: true }))
      .toContain('Interesse em unidade')
  })

  it('traz nome, telefone, unidade e o resumo financeiro numa linha', () => {
    const m = montarAvisoCorretor({ ...comZap, simulacao: PADRAO })
    expect(m).toContain('Roberto Lima Souza · +48999998888')
    expect(m).toContain('Pineto Residencial · unidade 1506')
    expect(m).toMatch(/entrada .* · 40x/)
  })

  it('sinaliza quando o cliente ofereceu entrada acima da tabela', () => {
    const m = montarAvisoCorretor({ ...comZap, simulacao: AJUSTADA })
    expect(m).toContain('Entrada escolhida pelo cliente, acima da tabela')
  })

  it('termina com o link direto para responder', () => {
    expect(montarAvisoCorretor({ ...comZap, simulacao: PADRAO })).toContain('https://wa.me/48999998888')
  })
})
