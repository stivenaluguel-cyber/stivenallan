import { describe, expect, it } from 'vitest'
import { gerarFaqPadrao, resolverFaq } from './faq-padrao'

const completo = {
  nome: 'Villa Nova',
  cidade: 'Criciúma',
  uf: 'SC',
  bairro: 'Centro',
  endereco: 'Rua das Flores, 100',
  dormitorios: '3',
  suites: '1',
  vagas: '2',
  metragem: '97',
  status: 'em obras',
  previsao_entrega: 'dez/2027',
}

describe('gerarFaqPadrao', () => {
  it('monta perguntas com os dados reais do empreendimento', () => {
    const faq = gerarFaqPadrao(completo)
    const perguntas = faq.map((f) => f.pergunta)
    expect(perguntas).toContain('Onde fica o Villa Nova?')
    expect(perguntas).toContain('Quais as plantas e metragens do Villa Nova?')
    expect(perguntas).toContain('Qual o estágio da obra do Villa Nova?')
    expect(perguntas).toContain('Como funciona o pagamento do Villa Nova?')
  })

  it('responde a localização com o endereço completo', () => {
    const f = gerarFaqPadrao(completo).find((x) => x.pergunta.startsWith('Onde fica'))!
    expect(f.resposta).toContain('Rua das Flores, 100')
    expect(f.resposta).toContain('Criciúma/SC')
  })

  it('inclui a previsão de entrega quando existe', () => {
    const f = gerarFaqPadrao(completo).find((x) => x.pergunta.startsWith('Qual o estágio'))!
    expect(f.resposta).toContain('dez/2027')
  })

  // A regra que impede conteúdo duplicado em escala: pergunta sem dado real
  // pra responder simplesmente não é gerada.
  it('omite perguntas sem dado para respondê-las', () => {
    const faq = gerarFaqPadrao({ nome: 'Só Nome' })
    const perguntas = faq.map((f) => f.pergunta)
    expect(perguntas).not.toContain('Onde fica o Só Nome?')
    expect(perguntas).not.toContain('Quais as plantas e metragens do Só Nome?')
    expect(perguntas).not.toContain('Qual o estágio da obra do Só Nome?')
    // A comercial sempre vale, é a dúvida mais frequente do site.
    expect(perguntas).toContain('Como funciona o pagamento do Só Nome?')
  })

  it('sem nome não gera FAQ nenhum', () => {
    expect(gerarFaqPadrao({})).toEqual([])
    expect(gerarFaqPadrao({ nome: '   ' })).toEqual([])
  })

  it('toda resposta gerada tem texto de verdade', () => {
    for (const f of gerarFaqPadrao(completo)) {
      expect(f.pergunta.trim().length).toBeGreaterThan(0)
      expect(f.resposta.trim().length).toBeGreaterThan(20)
    }
  })
})

describe('resolverFaq', () => {
  it('prefere o FAQ escrito à mão quando existe', () => {
    const manual = [{ pergunta: 'Tem piscina?', resposta: 'Sim, aquecida.' }]
    expect(resolverFaq(manual, completo)).toEqual(manual)
  })

  it('cai no gerado quando o salvo está vazio ou ausente', () => {
    expect(resolverFaq([], completo).length).toBeGreaterThan(0)
    expect(resolverFaq(null, completo).length).toBeGreaterThan(0)
    expect(resolverFaq(undefined, completo).length).toBeGreaterThan(0)
  })

  it('descarta entradas incompletas em vez de renderizar pergunta sem resposta', () => {
    const sujo = [
      { pergunta: 'Vale?', resposta: '' },
      { pergunta: '', resposta: 'Resposta órfã' },
      { pergunta: 'Tem elevador?', resposta: 'Dois por torre.' },
    ]
    expect(resolverFaq(sujo, completo)).toEqual([{ pergunta: 'Tem elevador?', resposta: 'Dois por torre.' }])
  })

  it('se o salvo só tem lixo, usa o gerado em vez de ficar sem FAQ', () => {
    const faq = resolverFaq([{ pergunta: '', resposta: '' }], completo)
    expect(faq.length).toBeGreaterThan(0)
    expect(faq.some((f) => f.pergunta.includes('Villa Nova'))).toBe(true)
  })
})
