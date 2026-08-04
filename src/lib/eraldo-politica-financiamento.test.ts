import { describe, expect, it } from 'vitest'
import { classificarPoliticaFinanciamento } from './eraldo-politica-financiamento'
import { arbor } from '@/data/eraldo/arbor'
import { granMichel } from '@/data/eraldo/gran-michel'
import { granPalazzo } from '@/data/eraldo/gran-palazzo'
import { harmony } from '@/data/eraldo/harmony'
import { horizon } from '@/data/eraldo/horizon'
import { lessence } from '@/data/eraldo/lessence'
import { play } from '@/data/eraldo/play'
import { symphony } from '@/data/eraldo/symphony'

// P1-6: testa a classificação contra os dados REAIS de @/data/eraldo/* (não
// fixtures inventadas) — o objetivo é garantir que a leitura da tabela vigente
// de cada empreendimento continua correta conforme o texto comercial muda.
describe('classificarPoliticaFinanciamento — dados reais dos 8 empreendimentos Eraldo', () => {
  it('Gran Palazzo exige financiamento bancário, sem alternativa direta na tabela vigente → bancario', () => {
    expect(classificarPoliticaFinanciamento(granPalazzo.politicaComercial)).toBe('bancario')
  })

  it('Play Residence exige financiamento bancário, sem alternativa direta na tabela vigente → bancario', () => {
    expect(classificarPoliticaFinanciamento(play.politicaComercial)).toBe('bancario')
  })

  it('Arbor é parcelamento direto com a construtora, sem menção a banco → direto', () => {
    expect(classificarPoliticaFinanciamento(arbor.politicaComercial)).toBe('direto')
  })

  it('Harmony Residence é parcelamento direto com a construtora, sem menção a banco → direto', () => {
    expect(classificarPoliticaFinanciamento(harmony.politicaComercial)).toBe('direto')
  })

  it('Symphony é parcelamento direto com a construtora, sem menção a banco → direto', () => {
    expect(classificarPoliticaFinanciamento(symphony.politicaComercial)).toBe('direto')
  })

  it('Gran Michel oferece financiamento bancário OU direto com a construtora → hibrido', () => {
    expect(classificarPoliticaFinanciamento(granMichel.politicaComercial)).toBe('hibrido')
  })

  it('Horizon oferece financiamento bancário OU parcelas corrigidas por IGPM → hibrido', () => {
    expect(classificarPoliticaFinanciamento(horizon.politicaComercial)).toBe('hibrido')
  })

  it('Lessence oferece financiamento bancário OU direto com a construtora → hibrido', () => {
    expect(classificarPoliticaFinanciamento(lessence.politicaComercial)).toBe('hibrido')
  })
})

describe('classificarPoliticaFinanciamento — casos-limite', () => {
  it('politicaComercial null → nao_informado', () => {
    expect(classificarPoliticaFinanciamento(null)).toBe('nao_informado')
  })

  it('politicaComercial undefined → nao_informado', () => {
    expect(classificarPoliticaFinanciamento(undefined)).toBe('nao_informado')
  })

  it('condicoes vazio → nao_informado', () => {
    expect(classificarPoliticaFinanciamento({ condicoes: [], correcaoCub: false })).toBe('nao_informado')
  })

  it('condição menciona banco sem "ou" → bancario', () => {
    expect(
      classificarPoliticaFinanciamento({
        condicoes: [{ titulo: 'Estrutura', texto: '50% de entrada e 50% via financiamento bancário.' }],
        correcaoCub: false,
      }),
    ).toBe('bancario')
  })

  it('condição menciona banco com "ou" oferecendo alternativa → hibrido', () => {
    expect(
      classificarPoliticaFinanciamento({
        condicoes: [{ titulo: 'Estrutura', texto: '50% de entrada e 50% via financiamento bancário ou parcelado direto.' }],
        correcaoCub: false,
      }),
    ).toBe('hibrido')
  })

  it('uma condição bancária sem alternativa entre várias condições → bancario (a mais restritiva vence)', () => {
    expect(
      classificarPoliticaFinanciamento({
        condicoes: [
          { titulo: 'Condição 1', texto: '30% de entrada e 70% via financiamento bancário.' },
          { titulo: 'Desconto à vista', texto: '10% de desconto para pagamento à vista.' },
        ],
        correcaoCub: false,
      }),
    ).toBe('bancario')
  })

  it('nenhuma condição menciona banco → direto', () => {
    expect(
      classificarPoliticaFinanciamento({
        condicoes: [{ titulo: 'Estrutura', texto: '20% de entrada e 80% em parcelas mensais corrigidas pelo CUB.' }],
        correcaoCub: true,
      }),
    ).toBe('direto')
  })

  it('detecta variações de "bancário" (banco, bancária, bancários)', () => {
    expect(classificarPoliticaFinanciamento({ condicoes: [{ titulo: 't', texto: 'Aceita crédito de banco.' }], correcaoCub: false })).toBe('bancario')
    expect(classificarPoliticaFinanciamento({ condicoes: [{ titulo: 't', texto: 'Via linha bancária.' }], correcaoCub: false })).toBe('bancario')
  })
})
