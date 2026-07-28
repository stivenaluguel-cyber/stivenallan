import { describe, expect, it } from 'vitest'
import {
  criarAcumuladorParcial,
  normalizarStatusObra,
  normalizarStatusVenda,
  slugificar,
  STATUS_OBRA_VALIDOS,
} from './normalizar'
import { statusLabel } from '@/lib/empreendimentos'

describe('slugificar', () => {
  it('normaliza o que o usuário digita no campo Construtora', () => {
    expect(slugificar('Acme Construções')).toBe('acme-construcoes')
    expect(slugificar('Fontana')).toBe('fontana')
    expect(slugificar('  ERALDO  ')).toBe('eraldo')
  })

  it('não altera um slug que já está correto (idempotente)', () => {
    expect(slugificar('acme-construcoes')).toBe('acme-construcoes')
    expect(slugificar(slugificar('Acme Construções'))).toBe('acme-construcoes')
  })

  it('remove pontuação e hífens sobrando das pontas', () => {
    expect(slugificar('Construtora & Cia. Ltda.')).toBe('construtora-cia-ltda')
    expect(slugificar('--Acme--')).toBe('acme')
  })

  it('devolve string vazia para entrada inválida', () => {
    expect(slugificar(null)).toBe('')
    expect(slugificar(undefined)).toBe('')
    expect(slugificar('')).toBe('')
    expect(slugificar('   ')).toBe('')
    expect(slugificar(123)).toBe('')
  })
})

describe('normalizarStatusObra', () => {
  it('aceita o vocabulário oficial sem alterar', () => {
    for (const s of STATUS_OBRA_VALIDOS) expect(normalizarStatusObra(s)).toBe(s)
  })

  // Regressão: o select de cadastro mandava lancamento/em_obras, que o site
  // não reconhece — 15 registros em produção ficaram assim e exibiam
  // "Sob consulta" no lugar do status real.
  it('traduz o vocabulário que os formulários do painel enviavam', () => {
    expect(normalizarStatusObra('lancamento')).toBe('na planta')
    expect(normalizarStatusObra('em_obras')).toBe('em obras')
    expect(normalizarStatusObra('breve_lancamento')).toBe('na planta')
    expect(normalizarStatusObra('em_construcao')).toBe('em obras')
    expect(normalizarStatusObra('concluido')).toBe('entregue')
  })

  it('traduz os valores legados encontrados no banco de produção', () => {
    expect(normalizarStatusObra('obras')).toBe('em obras')
  })

  it('é tolerante a acento, caixa e espaço', () => {
    expect(normalizarStatusObra('Em Obras')).toBe('em obras')
    expect(normalizarStatusObra('  PRONTO  ')).toBe('pronto')
    expect(normalizarStatusObra('Lançamento')).toBe('na planta')
  })

  it('devolve null quando não dá pra mapear — melhor não gravar do que gravar errado', () => {
    expect(normalizarStatusObra('loteamento')).toBeNull()
    expect(normalizarStatusObra('qualquer coisa')).toBeNull()
    expect(normalizarStatusObra('')).toBeNull()
    expect(normalizarStatusObra(null)).toBeNull()
    expect(normalizarStatusObra(undefined)).toBeNull()
  })

  // Trava o contrato com a UI: todo valor que sai daqui tem rótulo próprio.
  it('todo valor normalizado é exibível — nunca cai em "Sob consulta"', () => {
    const entradas = ['lancamento', 'em_obras', 'obras', 'pronto', 'entregue', 'na planta', 'Em Obras']
    for (const e of entradas) {
      const s = normalizarStatusObra(e)
      expect(s, `"${e}" deveria normalizar`).not.toBeNull()
      expect(statusLabel(s!), `"${e}" -> "${s}" não deve virar Sob consulta`).not.toBe('Sob consulta')
    }
  })
})

describe('normalizarStatusVenda', () => {
  it('aceita os três valores válidos, tolerando caixa', () => {
    expect(normalizarStatusVenda('ativo')).toBe('ativo')
    expect(normalizarStatusVenda('Pausado')).toBe('pausado')
    expect(normalizarStatusVenda('ENCERRADO')).toBe('encerrado')
  })

  it('rejeita status de OBRA — as duas colunas não podem se misturar', () => {
    expect(normalizarStatusVenda('em obras')).toBeNull()
    expect(normalizarStatusVenda('pronto')).toBeNull()
    expect(normalizarStatusVenda(null)).toBeNull()
  })
})

describe('criarAcumuladorParcial', () => {
  it('inclui só as chaves realmente enviadas', () => {
    const { row, set } = criarAcumuladorParcial()
    set('nome', 'Villa X')
    set('cidade', undefined)
    set('bairro', null)
    expect(row).toEqual({ nome: 'Villa X', bairro: null })
    expect('cidade' in row).toBe(false)
  })

  // O coração do bug: um update parcial não pode tocar em campo nenhum além
  // do que foi enviado.
  it('update só de status não encosta em nenhum outro campo', () => {
    const { row, set } = criarAcumuladorParcial()
    const form: Record<string, unknown> = { status_venda: 'pausado' }
    set('nome', form.nome)
    set('cidade', form.cidade)
    set('descricao', form.descricao_completa)
    set('preco', form.preco)
    set('status_venda', form.status_venda)
    expect(row).toEqual({ status_venda: 'pausado' })
  })

  it('aceita gravar vazio de propósito (string vazia é um valor)', () => {
    const { row, set } = criarAcumuladorParcial()
    set('bairro', '')
    expect(row).toEqual({ bairro: '' })
  })
})
