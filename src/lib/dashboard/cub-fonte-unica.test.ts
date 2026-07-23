import { describe, expect, it } from 'vitest'
import {
  competenciaLabelFromChave,
  formatarCubCompleto,
  formatarCubValor,
  statusAtualizacaoCub,
} from './cub-fonte-unica'

describe('competenciaLabelFromChave', () => {
  it('julho vira "julho de 2026" — sem passar por Date (evita o bug de fuso)', () => {
    expect(competenciaLabelFromChave('2026-07')).toBe('julho de 2026')
    expect(competenciaLabelFromChave('2026-07-01')).toBe('julho de 2026')
  })

  it('confirma que new Date(chave) sofreria o bug que este módulo evita', () => {
    // Prova viva do bug original: interpretar a chave via Date+toLocaleDateString
    // no fuso do Brasil desloca um mês pra trás. Esta função NÃO faz isso.
    const viaDateBugado = new Date('2026-07-01').toLocaleDateString('pt-BR', { month: 'long', timeZone: 'America/Sao_Paulo' })
    expect(viaDateBugado).not.toBe('julho') // confirma que o bug existe se alguém tentasse esse caminho
    expect(competenciaLabelFromChave('2026-07-01')).toBe('julho de 2026') // esta função não sofre disso
  })

  it('janeiro (mês 1) e dezembro (mês 12) nas bordas', () => {
    expect(competenciaLabelFromChave('2026-01')).toBe('janeiro de 2026')
    expect(competenciaLabelFromChave('2026-12')).toBe('dezembro de 2026')
  })
})

describe('formatarCubValor', () => {
  it('precisão completa (padrão): 2 casas decimais', () => {
    expect(formatarCubValor(3121.6)).toBe('R$ 3.121,60')
  })

  it('precisão inteiro: arredonda sem casas decimais', () => {
    expect(formatarCubValor(3121.62, 'inteiro')).toBe('R$ 3.122')
  })
})

describe('formatarCubCompleto', () => {
  it('monta a linha completa pedida: "CUB/SC — competência X — R$ Y/m²"', () => {
    const linha = formatarCubCompleto({ valor_m2: 3121.62, mes_referencia: '2026-07-01' })
    expect(linha).toBe('CUB/SC — competência julho de 2026 — R$ 3.121,62/m²')
  })
})

describe('statusAtualizacaoCub', () => {
  it('mesmo mês do "agora" → atualizado', () => {
    const agora = new Date('2026-07-15T12:00:00.000Z') // meio-dia UTC, bem longe de qualquer borda de fuso
    expect(statusAtualizacaoCub('2026-07-01', agora)).toBe('atualizado')
  })

  it('1 mês de defasagem ainda conta como atualizado (divulgação mensal)', () => {
    const agora = new Date('2026-07-15T12:00:00.000Z')
    expect(statusAtualizacaoCub('2026-06-01', agora)).toBe('atualizado')
  })

  it('2+ meses de defasagem vira desatualizado', () => {
    const agora = new Date('2026-07-15T12:00:00.000Z')
    expect(statusAtualizacaoCub('2026-05-01', agora)).toBe('desatualizado')
  })
})
