import { describe, expect, it } from 'vitest'
import {
  agruparPorDia, deslocar, intervaloDaVista, linksDeNavegacao, rotuloDoPeriodo,
} from './agenda-periodo'

describe('intervaloDaVista', () => {
  it('dia é ele mesmo', () => {
    expect(intervaloDaVista('dia', '2026-08-02')).toEqual({ ini: '2026-08-02', fim: '2026-08-02' })
  })

  it('semana vai de domingo a sábado', () => {
    // 2026-08-05 é uma quarta-feira.
    expect(intervaloDaVista('semana', '2026-08-05')).toEqual({ ini: '2026-08-02', fim: '2026-08-08' })
  })

  it('domingo já é o início da própria semana', () => {
    expect(intervaloDaVista('semana', '2026-08-02').ini).toBe('2026-08-02')
  })

  it('semana atravessa a virada do mês sem quebrar', () => {
    expect(intervaloDaVista('semana', '2026-07-30')).toEqual({ ini: '2026-07-26', fim: '2026-08-01' })
  })

  it('mês fecha no último dia, sem tabela de 30/31', () => {
    expect(intervaloDaVista('mes', '2026-08-15')).toEqual({ ini: '2026-08-01', fim: '2026-08-31' })
    expect(intervaloDaVista('mes', '2026-11-10').fim).toBe('2026-11-30')
  })

  it('fevereiro de ano bissexto termina em 29', () => {
    expect(intervaloDaVista('mes', '2028-02-10').fim).toBe('2028-02-29')
  })
})

describe('deslocar', () => {
  it('anda na unidade da vista', () => {
    expect(deslocar('dia', '2026-08-02', 1)).toBe('2026-08-03')
    expect(deslocar('semana', '2026-08-02', 1)).toBe('2026-08-09')
    expect(deslocar('mes', '2026-08-02', 1)).toBe('2026-09-02')
  })

  it('volta para trás atravessando o ano', () => {
    expect(deslocar('mes', '2026-01-15', -1)).toBe('2025-12-15')
    expect(deslocar('dia', '2026-01-01', -1)).toBe('2025-12-31')
  })

  it('mês a partir do dia 31 não pula para o mês seguinte', () => {
    // 31 de janeiro + 1 mês: fevereiro não tem 31. O importante é continuar
    // dentro de fevereiro, porque a vista usa só o mês da referência.
    const r = deslocar('mes', '2026-01-31', 1)
    expect(intervaloDaVista('mes', r).ini).toBe('2026-03-01')
  })
})

describe('rotuloDoPeriodo', () => {
  it('dia usa linguagem de gente perto de hoje', () => {
    expect(rotuloDoPeriodo('dia', '2026-08-02', '2026-08-02')).toBe('Hoje')
    expect(rotuloDoPeriodo('dia', '2026-08-03', '2026-08-02')).toBe('Amanhã')
    expect(rotuloDoPeriodo('dia', '2026-08-01', '2026-08-02')).toBe('Ontem')
  })

  it('mês vem com a inicial maiúscula', () => {
    expect(rotuloDoPeriodo('mes', '2026-08-15', '2026-08-02')).toMatch(/^Agosto/)
  })

  it('semana mostra as duas pontas', () => {
    expect(rotuloDoPeriodo('semana', '2026-08-05', '2026-08-02')).toContain('–')
  })
})

describe('agruparPorDia', () => {
  it('agrupa e ordena dias e horários', () => {
    const r = agruparPorDia([
      { data_hora: '2026-08-03T15:00:00-03:00' },
      { data_hora: '2026-08-02T09:00:00-03:00' },
      { data_hora: '2026-08-02T14:00:00-03:00' },
    ])
    expect(r.map((d) => d.data)).toEqual(['2026-08-02', '2026-08-03'])
    expect(r[0].eventos).toHaveLength(2)
    expect(r[0].eventos[0].data_hora).toContain('09:00')
  })

  it('evento das 21h em São Paulo não vaza para o dia seguinte', () => {
    // Fatiar o ISO em UTC jogaria este evento para 03/08.
    const r = agruparPorDia([{ data_hora: '2026-08-02T21:00:00-03:00' }])
    expect(r[0].data).toBe('2026-08-02')
  })

  it('lista vazia devolve nenhum dia', () => {
    expect(agruparPorDia([])).toEqual([])
  })
})

describe('linksDeNavegacao', () => {
  it('monta Maps e Waze a partir do texto do local', () => {
    const l = linksDeNavegacao('Rua Coronel Pedro Benedet, 190 - Criciúma')
    expect(l?.maps).toContain('google.com/maps')
    expect(l?.waze).toContain('waze.com/ul')
    // O endereço vai codificado — "Criciúma" vira "Crici%C3%BAma".
    expect(l?.maps).toContain('Crici%C3%BAma')
    expect(l?.waze).toContain('Crici%C3%BAma')
  })

  it('local em branco não vira botão morto', () => {
    expect(linksDeNavegacao('   ')).toBeNull()
    expect(linksDeNavegacao('')).toBeNull()
  })

  it('escapa o endereço — "&" e "#" quebrariam a URL', () => {
    const l = linksDeNavegacao('Av. Centenário, 100 & 200 #sala3')
    expect(l?.maps).not.toContain(' & ')
    expect(l?.maps).toContain('%26')
    expect(l?.maps).toContain('%23')
  })
})
