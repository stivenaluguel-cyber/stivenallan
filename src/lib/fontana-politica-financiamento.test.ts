import { describe, expect, it } from 'vitest'
import { FONTANA_POLITICA_FINANCIAMENTO, politicaFinanciamentoFontana } from './fontana-politica-financiamento'
import { imoveis } from '@/data/imoveis'

const SLUGS_FONTANA = imoveis.filter((i) => i.construtora_slug === 'fontana').map((i) => i.slug)

describe('FONTANA_POLITICA_FINANCIAMENTO — integridade do manifesto', () => {
  it('toda chave do manifesto corresponde a um slug real em @/data/imoveis (sem entrada órfã)', () => {
    for (const slug of Object.keys(FONTANA_POLITICA_FINANCIAMENTO)) {
      expect(SLUGS_FONTANA, `"${slug}" não existe em @/data/imoveis`).toContain(slug)
    }
  })

  it('cobre todos os 27 empreendimentos Fontana ativos — nenhum fica de fora por esquecimento', () => {
    const semEntrada = SLUGS_FONTANA.filter((slug) => !(slug in FONTANA_POLITICA_FINANCIAMENTO))
    expect(semEntrada, `slugs sem classificação: ${semEntrada.join(', ')}`).toEqual([])
  })

  it('slug desconhecido (empreendimento novo, ainda não auditado) cai em nao_informado, nunca em direto', () => {
    expect(politicaFinanciamentoFontana('empreendimento-que-nao-existe-ainda')).toBe('nao_informado')
  })
})

describe('FONTANA_POLITICA_FINANCIAMENTO — amostras verificadas manualmente contra o texto publicado', () => {
  it('Avezzano e Bellante oferecem banco OU direto na mesma condição → hibrido', () => {
    expect(politicaFinanciamentoFontana('avezzano-centro-sideropolis-sc')).toBe('hibrido')
    expect(politicaFinanciamentoFontana('bellante-comerciario-criciuma-sc')).toBe('hibrido')
  })

  it('Bosco Del Montello e Tremezzo afirmam "sem banco" explicitamente → direto', () => {
    expect(politicaFinanciamentoFontana('bosco-del-montello-centro-criciuma-sc')).toBe('direto')
    expect(politicaFinanciamentoFontana('tremezzo-residencial-centro-criciuma-sc')).toBe('direto')
  })

  it('Águas de Marano não tem tabela vigente localizada → nao_informado', () => {
    expect(politicaFinanciamentoFontana('aguas-de-marano-frente-mar-balneario-picarras-sc')).toBe('nao_informado')
  })

  it('Piazza Castello só tem a FAQ genérica de banco/FGTS, sem condição real descrita → nao_informado', () => {
    expect(politicaFinanciamentoFontana('piazza-castello-centro-icara-sc')).toBe('nao_informado')
  })
})
