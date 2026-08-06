import { describe, it, expect } from 'vitest'
import {
  resolverHojeESemana,
  inicioSemana,
  calcularFitaSemanal,
  calcularStreak,
  calcularProgressoHoje,
  calcularMetaDiaria,
} from './diaria'

describe('resolverHojeESemana — virada de dia no fuso correto', () => {
  it('23h de sexta em São Paulo (02h de sábado em UTC) ainda é sexta, não sábado', () => {
    // 2026-08-07 é sexta-feira. 23h BRT = 2026-08-08T02:00:00Z.
    const r = resolverHojeESemana(new Date('2026-08-08T02:00:00Z'))
    expect(r.hoje).toBe('2026-08-07')
  })

  it('meia-noite e um minuto em São Paulo (03:01 UTC) já virou o dia seguinte', () => {
    const r = resolverHojeESemana(new Date('2026-08-08T03:01:00Z'))
    expect(r.hoje).toBe('2026-08-08')
  })

  it('domingo pertence à semana que começou na segunda anterior, não numa semana nova', () => {
    // 2026-08-09 é domingo.
    const r = resolverHojeESemana(new Date('2026-08-09T15:00:00Z'))
    expect(r.hoje).toBe('2026-08-09')
    expect(r.inicioSemana).toBe('2026-08-03') // segunda daquela semana
    expect(r.fimSemana).toBe('2026-08-09')
  })

  it('segunda-feira é o próprio início da semana', () => {
    const r = resolverHojeESemana(new Date('2026-08-03T15:00:00Z'))
    expect(r.inicioSemana).toBe('2026-08-03')
  })
})

describe('inicioSemana', () => {
  it('resolve segunda pra qualquer dia da semana', () => {
    expect(inicioSemana('2026-08-03')).toBe('2026-08-03') // seg
    expect(inicioSemana('2026-08-05')).toBe('2026-08-03') // qua
    expect(inicioSemana('2026-08-09')).toBe('2026-08-03') // dom
  })
})

describe('calcularProgressoHoje', () => {
  it('0 feitos é não_iniciado', () => {
    expect(calcularProgressoHoje(0, 5).estado).toBe('nao_iniciado')
  })
  it('entre 0 e a meta é em_andamento', () => {
    const p = calcularProgressoHoje(3, 5)
    expect(p.estado).toBe('em_andamento')
    expect(p.percentual).toBe(60)
  })
  it('bateu ou passou da meta é meta_batida, percentual nunca passa de 100', () => {
    expect(calcularProgressoHoje(5, 5).estado).toBe('meta_batida')
    const p = calcularProgressoHoje(9, 5)
    expect(p.estado).toBe('meta_batida')
    expect(p.percentual).toBe(100)
  })
})

describe('calcularFitaSemanal — semana parcial (hoje no meio da semana)', () => {
  const hoje = '2026-08-05' // quarta
  const contagem = { '2026-08-03': 5, '2026-08-04': 2, '2026-08-05': 5 }

  it('7 dias, segunda a domingo', () => {
    const fita = calcularFitaSemanal(hoje, 5, contagem)
    expect(fita.dias).toHaveLength(7)
    expect(fita.dias[0].data).toBe('2026-08-03')
    expect(fita.dias[6].data).toBe('2026-08-09')
  })

  it('dias passados e hoje mostram o valor real, inclusive zero medido', () => {
    const fita = calcularFitaSemanal(hoje, 5, contagem)
    expect(fita.dias[0].feitos).toBe(5) // seg
    expect(fita.dias[1].feitos).toBe(2) // ter
    expect(fita.dias[2].feitos).toBe(5) // qua = hoje
  })

  it('dias futuros vêm com feitos=null (a UI renderiza "—"), nunca 0', () => {
    const fita = calcularFitaSemanal(hoje, 5, contagem)
    const futuros = fita.dias.slice(3) // qui, sex, sab, dom
    for (const d of futuros) {
      expect(d.ehFuturo).toBe(true)
      expect(d.feitos).toBeNull()
      expect(d.metaBatida).toBe(false)
    }
  })

  it('marca ehHoje só no dia certo e metaBatida só quando feitos >= meta', () => {
    const fita = calcularFitaSemanal(hoje, 5, contagem)
    expect(fita.dias[2].ehHoje).toBe(true)
    expect(fita.dias.filter((d) => d.ehHoje)).toHaveLength(1)
    expect(fita.dias[0].metaBatida).toBe(true) // seg: 5 >= 5
    expect(fita.dias[1].metaBatida).toBe(false) // ter: 2 < 5
  })
})

describe('calcularFitaSemanal — semana vazia', () => {
  it('nenhum follow-up registrado: dias passados mostram 0 real (medido), futuros mostram null', () => {
    const fita = calcularFitaSemanal('2026-08-05', 5, {})
    expect(fita.dias[0].feitos).toBe(0)
    expect(fita.dias[0].ehFuturo).toBe(false)
    expect(fita.dias[6].feitos).toBeNull()
    expect(fita.dias.every((d) => !d.metaBatida)).toBe(true)
  })
})

describe('calcularStreak', () => {
  it('conta pra trás a partir de ontem, soma hoje só se hoje já bateu', () => {
    const contagem = {
      '2026-08-05': 5, // hoje, bateu
      '2026-08-04': 5, // ontem, bateu
      '2026-08-03': 5, // anteontem, bateu
    }
    expect(calcularStreak('2026-08-05', 5, contagem)).toBe(3)
  })

  it('hoje ainda em andamento não conta, mas não impede contar os dias anteriores', () => {
    const contagem = { '2026-08-05': 2, '2026-08-04': 5, '2026-08-03': 5 }
    expect(calcularStreak('2026-08-05', 5, contagem)).toBe(2)
  })

  it('um buraco no meio (dia sem meta batida) zera a sequência ali — não pula o buraco', () => {
    const contagem = {
      '2026-08-05': 5, // hoje, bateu
      '2026-08-04': 5, // ontem, bateu
      '2026-08-03': 1, // buraco: não bateu
      '2026-08-02': 5, // bateu, mas fica isolado do outro lado do buraco
      '2026-08-01': 5,
    }
    // conta hoje(05) + 04, para no buraco de 03 — não soma 02/01 mesmo tendo batido.
    expect(calcularStreak('2026-08-05', 5, contagem)).toBe(2)
  })

  it('dia ausente do mapa conta como 0 e quebra a sequência igual a um dia explícito com 0', () => {
    const contagem = { '2026-08-05': 5, '2026-08-04': 5 } // 03 ausente
    expect(calcularStreak('2026-08-05', 5, contagem)).toBe(2)
  })

  it('meta alterada no meio da semana recalcula a sequência inteira contra o valor novo', () => {
    const contagem = { '2026-08-05': 5, '2026-08-04': 5, '2026-08-03': 5 }
    expect(calcularStreak('2026-08-05', 5, contagem)).toBe(3)
    // corretor abaixa a meta pra 3: os mesmos dias (que faziam 5) continuam batendo.
    expect(calcularStreak('2026-08-05', 3, contagem)).toBe(3)
    // corretor sobe a meta pra 10: nenhum dia histórico bate mais, streak zera.
    expect(calcularStreak('2026-08-05', 10, contagem)).toBe(0)
  })

  it('meta zero (acompanhamento desligado) nunca produz streak', () => {
    expect(calcularStreak('2026-08-05', 0, { '2026-08-05': 99 })).toBe(0)
  })
})

describe('calcularMetaDiaria — integração', () => {
  it('junta progresso, fita e streak num resultado só', () => {
    const r = calcularMetaDiaria('2026-08-05', 5, { '2026-08-05': 3, '2026-08-04': 5 })
    expect(r.hoje).toBe('2026-08-05')
    expect(r.meta).toBe(5)
    expect(r.progressoHoje.feitos).toBe(3)
    expect(r.progressoHoje.estado).toBe('em_andamento')
    expect(r.fita.dias).toHaveLength(7)
    expect(r.streak).toBe(1) // hoje não bateu ainda (não conta), mas ontem (08-04) bateu, então a sequência corrente é 1
  })
})
