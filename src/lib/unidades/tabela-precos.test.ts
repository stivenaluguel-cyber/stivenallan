import { describe, expect, it } from 'vitest'
import {
  caminhoTabela,
  competenciaDoMes,
  competenciaISO,
  competenciaLabel,
  tabelaVencida,
  validarTabela,
  MIME_TABELA,
} from './tabela-precos'

describe('validarTabela', () => {
  it('aceita PDF dentro do limite', () => {
    expect(validarTabela('tabela-pineto.pdf', MIME_TABELA, 800_000)).toEqual({ ok: true })
  })

  it('recusa print de tela — tabela de preço é documento, não foto', () => {
    const r = validarTabela('print.png', 'image/png', 500_000)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toContain('PDF')
  })

  it('recusa arquivo vazio e sem nome', () => {
    expect(validarTabela('t.pdf', MIME_TABELA, 0).ok).toBe(false)
    expect(validarTabela('  ', MIME_TABELA, 100).ok).toBe(false)
  })

  it('recusa acima de 15 MB dizendo o tamanho recebido', () => {
    const r = validarTabela('t.pdf', MIME_TABELA, 20 * 1024 * 1024)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toContain('20.0 MB')
  })
})

describe('competenciaISO', () => {
  it('normaliza qualquer dia do mês para o dia 1', () => {
    // A tabela vale o mês inteiro; guardar o dia criaria duplicata do mesmo mês.
    expect(competenciaISO('2026-07-15')).toBe('2026-07-01')
    expect(competenciaISO('2026-07')).toBe('2026-07-01')
  })

  it('aceita o formato que se digita no Brasil', () => {
    expect(competenciaISO('07/2026')).toBe('2026-07-01')
  })

  it('recusa mês inexistente', () => {
    expect(competenciaISO('2026-13')).toBeNull()
    expect(competenciaISO('2026-00')).toBeNull()
  })

  it('recusa lixo e vazio', () => {
    expect(competenciaISO('julho')).toBeNull()
    expect(competenciaISO('')).toBeNull()
    expect(competenciaISO(null)).toBeNull()
  })
})

describe('competenciaLabel', () => {
  it('escreve o mês por extenso', () => {
    expect(competenciaLabel('2026-07-01')).toBe('julho de 2026')
    expect(competenciaLabel('2026-03-01')).toBe('março de 2026')
  })

  it('não quebra com valor inválido', () => {
    expect(competenciaLabel(null)).toBe('—')
    expect(competenciaLabel('abc')).toBe('—')
  })
})

describe('caminhoTabela', () => {
  it('agrupa por prédio e carimba a competência', () => {
    expect(caminhoTabela('pineto-centro-criciuma-sc', '2026-07-01', 'abc123'))
      .toBe('tabelas/pineto-centro-criciuma-sc/2026-07-01-abc123.pdf')
  })

  it('não deixa slug malicioso escapar da pasta', () => {
    const c = caminhoTabela('../../etc/passwd', '2026-07-01', 'x')
    expect(c).not.toContain('..')
    expect(c.startsWith('tabelas/')).toBe(true)
  })
})

describe('tabelaVencida', () => {
  const emJulho = new Date('2026-07-30T12:00:00Z')

  it('tabela do mês corrente está vigente', () => {
    expect(tabelaVencida('2026-07-01', emJulho)).toBe(false)
  })

  it('tabela de junho está vencida em julho', () => {
    // Sem isto a tela mostraria preço velho como se fosse o de hoje.
    expect(tabelaVencida('2026-06-01', emJulho)).toBe(true)
  })

  it('tabela do mês seguinte ainda não venceu', () => {
    expect(tabelaVencida('2026-08-01', emJulho)).toBe(false)
  })

  it('competenciaDoMes acompanha a data informada', () => {
    expect(competenciaDoMes(new Date(2026, 6, 30))).toBe('2026-07-01')
    expect(competenciaDoMes(new Date(2026, 11, 1))).toBe('2026-12-01')
  })
})
