import { describe, expect, it } from 'vitest'
import { buildIcsCalendar, type IcsEvent } from './ics'

function event(overrides: Partial<IcsEvent> = {}): IcsEvent {
  return {
    id: 'abc-123',
    data: '2026-07-13',
    titulo: 'Reflexão urgência: o custo de esperar',
    descricao: 'Linha: Oportunidade\nStatus: Planejado',
    url: 'https://stivenallan.com.br/dashboard/instagram/calendario',
    ...overrides,
  }
}

const FIXED_NOW = new Date('2026-07-12T10:00:00.000Z')

describe('buildIcsCalendar', () => {
  it('gera um VCALENDAR válido com cabeçalho e VEVENT por item', () => {
    const ics = buildIcsCalendar([event()], FIXED_NOW)
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('VERSION:2.0')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1)
    expect(ics.match(/END:VEVENT/g)).toHaveLength(1)
  })

  it('usa UID estável baseado no id da entrada', () => {
    const ics = buildIcsCalendar([event({ id: 'xyz-789' })], FIXED_NOW)
    expect(ics).toContain('UID:xyz-789@stivenallan.com.br')
  })

  it('formata DTSTART/DTEND como evento de dia inteiro (DTEND = dia seguinte)', () => {
    const ics = buildIcsCalendar([event({ data: '2026-07-13' })], FIXED_NOW)
    expect(ics).toContain('DTSTART;VALUE=DATE:20260713')
    expect(ics).toContain('DTEND;VALUE=DATE:20260714')
  })

  it('vira o ano corretamente ao calcular o dia seguinte', () => {
    const ics = buildIcsCalendar([event({ data: '2026-12-31' })], FIXED_NOW)
    expect(ics).toContain('DTSTART;VALUE=DATE:20261231')
    expect(ics).toContain('DTEND;VALUE=DATE:20270101')
  })

  it('escapa vírgula, ponto e vírgula e barra invertida no texto', () => {
    const ics = buildIcsCalendar([event({ titulo: 'Guia: A, B; C\\D' })], FIXED_NOW)
    expect(ics).toContain('Guia: A\\, B\\; C\\\\D')
  })

  it('converte quebra de linha em \\n literal na descrição', () => {
    const ics = buildIcsCalendar([event({ descricao: 'linha1\nlinha2' })], FIXED_NOW)
    expect(ics).toContain('linha1\\nlinha2')
  })

  it('dobra linhas longas com continuação iniciada por espaço (RFC 5545)', () => {
    const tituloLongo = 'A'.repeat(120)
    const ics = buildIcsCalendar([event({ titulo: tituloLongo })], FIXED_NOW)
    const linhasCruas = ics.split('\r\n')
    const primeiraLinhaSummary = linhasCruas.find((l) => l.startsWith('SUMMARY:'))!
    const idx = linhasCruas.indexOf(primeiraLinhaSummary)
    expect(Buffer.byteLength(primeiraLinhaSummary, 'utf8')).toBeLessThanOrEqual(75)
    expect(linhasCruas[idx + 1].startsWith(' ')).toBe(true)
  })

  it('produz calendário vazio (só cabeçalho) quando não há eventos', () => {
    const ics = buildIcsCalendar([], FIXED_NOW)
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).not.toContain('BEGIN:VEVENT')
  })

  it('termina cada linha com CRLF', () => {
    const ics = buildIcsCalendar([event()], FIXED_NOW)
    expect(ics.endsWith('\r\n')).toBe(true)
    expect(ics.includes('\r\n')).toBe(true)
  })
})
