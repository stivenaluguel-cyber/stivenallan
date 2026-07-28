import { describe, it, expect } from 'vitest'
import {
  SP_OFFSET,
  spLocalToISOString,
  addDaysSaoPauloDateString,
  amanhaSaoPaulo,
  toSaoPauloDateString,
  endOfSaoPauloDayISOString,
} from './timezone-sp'

describe('spLocalToISOString', () => {
  it('anexa o offset -03:00 em vez de deixar a string sem fuso', () => {
    expect(spLocalToISOString('2026-07-31', '09:00')).toBe('2026-07-31T09:00:00-03:00')
  })

  it('9h em SP é 12h UTC — o horário salvo é o mesmo que o corretor escolheu', () => {
    const iso = spLocalToISOString('2026-07-31', '09:00')
    expect(new Date(iso).toISOString()).toBe('2026-07-31T12:00:00.000Z')
    expect(new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }))
      .toBe('09:00')
  })

  it('meia-noite em SP não vira o dia anterior', () => {
    const iso = spLocalToISOString('2026-07-31', '00:00')
    expect(new Date(iso).toISOString()).toBe('2026-07-31T03:00:00.000Z')
    expect(new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })).toBe('31/07/2026')
  })

  it('23:59 em SP continua no mesmo dia local', () => {
    const iso = spLocalToISOString('2026-07-31', '23:59')
    expect(new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })).toBe('31/07/2026')
  })

  it('SP_OFFSET é fixo — Brasil não tem mais horário de verão desde 2019', () => {
    expect(SP_OFFSET).toBe('-03:00')
    // Janeiro (antigo horário de verão) e julho devem ter o mesmo offset.
    expect(new Date(spLocalToISOString('2026-01-15', '12:00')).toISOString()).toBe('2026-01-15T15:00:00.000Z')
    expect(new Date(spLocalToISOString('2026-07-15', '12:00')).toISOString()).toBe('2026-07-15T15:00:00.000Z')
  })
})

describe('addDaysSaoPauloDateString / amanhaSaoPaulo', () => {
  it('às 22h de SP (já dia seguinte em UTC), "amanhã" avança só um dia local', () => {
    // 2026-07-31 22:00 SP == 2026-08-01 01:00 UTC.
    // O bug antigo (toISOString().slice(0,10) sobre now+1d) devolveria 02/08.
    const agora = new Date('2026-08-01T01:00:00.000Z')
    expect(amanhaSaoPaulo(agora)).toBe('2026-08-01')
  })

  it('às 01h de SP (mesmo dia em UTC) também avança só um dia', () => {
    const agora = new Date('2026-07-31T04:00:00.000Z') // 01:00 SP do dia 31
    expect(amanhaSaoPaulo(agora)).toBe('2026-08-01')
  })

  it('vira o mês corretamente', () => {
    const agora = new Date('2026-07-31T15:00:00.000Z') // 12:00 SP do dia 31
    expect(amanhaSaoPaulo(agora)).toBe('2026-08-01')
  })

  it('vira o ano corretamente', () => {
    const agora = new Date('2026-12-31T15:00:00.000Z')
    expect(amanhaSaoPaulo(agora)).toBe('2027-01-01')
  })

  it('suporta os presets de Adiar: +1, +3 e +7 dias', () => {
    const agora = new Date('2026-07-28T15:00:00.000Z') // 12:00 SP de 28/07
    expect(addDaysSaoPauloDateString(agora, 1)).toBe('2026-07-29')
    expect(addDaysSaoPauloDateString(agora, 3)).toBe('2026-07-31')
    expect(addDaysSaoPauloDateString(agora, 7)).toBe('2026-08-04')
  })

  it('lida com ano bissexto', () => {
    const agora = new Date('2028-02-28T15:00:00.000Z')
    expect(addDaysSaoPauloDateString(agora, 1)).toBe('2028-02-29')
  })
})

describe('toSaoPauloDateString', () => {
  it('um instante UTC do dia seguinte ainda é "hoje" em SP antes das 03h UTC', () => {
    expect(toSaoPauloDateString('2026-08-01T01:00:00.000Z')).toBe('2026-07-31')
  })

  it('depois das 03h UTC já é o novo dia em SP', () => {
    expect(toSaoPauloDateString('2026-08-01T03:00:00.000Z')).toBe('2026-08-01')
  })
})

describe('endOfSaoPauloDayISOString', () => {
  it('adia até o fim do dia escolhido, não até a meia-noite dele', () => {
    const iso = endOfSaoPauloDayISOString('2026-08-05')
    expect(iso).toBe('2026-08-05T23:59:59-03:00')
    expect(new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })).toBe('05/08/2026')
  })
})
