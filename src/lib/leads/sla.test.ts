import { describe, it, expect } from 'vitest'
import { statusSla, CORES_SLA, SLA_PADRAO_MIN } from './sla'

const AGORA = new Date('2026-07-29T12:00:00Z')
const minutosAtras = (m: number) => new Date(AGORA.getTime() - m * 60_000).toISOString()

describe('statusSla', () => {
  it('lead recém-chegado fica em ok com o prazo quase cheio', () => {
    const r = statusSla({ created_at: minutosAtras(1) }, 15, AGORA)
    expect(r.estado).toBe('ok')
    expect(r.restanteMin).toBeCloseTo(14, 1)
    expect(r.texto).toBe('14:00 restantes')
    expect(r.urgente).toBe(false)
  })

  it('passada a metade do prazo vira atenção', () => {
    const r = statusSla({ created_at: minutosAtras(8) }, 15, AGORA)
    expect(r.estado).toBe('atencao')
    expect(r.urgente).toBe(true)
  })

  it('exatamente na metade já conta como atenção', () => {
    expect(statusSla({ created_at: minutosAtras(7.5) }, 15, AGORA).estado).toBe('atencao')
  })

  it('depois do prazo fica estourado com quanto tempo faz', () => {
    const r = statusSla({ created_at: minutosAtras(20) }, 15, AGORA)
    expect(r.estado).toBe('estourado')
    expect(r.restanteMin!).toBeLessThan(0)
    expect(r.texto).toMatch(/^SLA vencido há 5:00/)
  })

  it('estouro de horas é mostrado em horas, não em minutos gigantes', () => {
    const r = statusSla({ created_at: minutosAtras(200) }, 15, AGORA)
    expect(r.texto).toContain('3h')
  })

  // O cronômetro para quando o corretor responde. Sem isso, todo lead já
  // trabalhado viraria alarme vermelho permanente no Kanban.
  it('lead já atendido não tem cronômetro nem urgência', () => {
    const r = statusSla(
      { created_at: minutosAtras(500), primeiro_atendimento_em: minutosAtras(480) },
      15, AGORA,
    )
    expect(r.estado).toBe('atendido')
    expect(r.restanteMin).toBeNull()
    expect(r.urgente).toBe(false)
  })

  it('sem created_at não inventa marco e não mostra selo', () => {
    const r = statusSla({}, 15, AGORA)
    expect(r.estado).toBe('atendido')
    expect(r.texto).toBe('')
  })

  it('data inválida é tratada como ausência de marco', () => {
    expect(statusSla({ created_at: 'ontem' }, 15, AGORA).texto).toBe('')
  })

  it('SLA inválido cai no padrão em vez de dividir por zero', () => {
    const r = statusSla({ created_at: minutosAtras(1) }, 0, AGORA)
    expect(r.restanteMin).toBeCloseTo(SLA_PADRAO_MIN - 1, 1)
    expect(statusSla({ created_at: minutosAtras(1) }, NaN, AGORA).estado).toBe('ok')
  })

  it('respeita um SLA customizado maior', () => {
    const r = statusSla({ created_at: minutosAtras(20) }, 60, AGORA)
    expect(r.estado).toBe('ok')
    expect(r.restanteMin).toBeCloseTo(40, 1)
  })

  it('formata segundos com dois dígitos', () => {
    const r = statusSla({ created_at: new Date(AGORA.getTime() - 10.5 * 60_000).toISOString() }, 15, AGORA)
    expect(r.texto).toBe('4:30 restantes')
  })
})

// ─────────────────────────────────────────────────────────────────────
// Regressão do bug que foi para produção em 29/07/2026.
//
// Nada no sistema escrevia `primeiro_atendimento_em`, então todo lead antigo
// mostrava "SLA vencido há 500h" em vermelho, permanentemente. Um alarme que
// ninguém pode resolver treina o corretor a ignorar a cor vermelha.
// ─────────────────────────────────────────────────────────────────────
describe('statusSla — janela máxima', () => {
  it('lead antigo sem atendimento sai da janela em vez de ficar vermelho para sempre', () => {
    const tresSemanas = new Date(AGORA.getTime() - 21 * 24 * 60 * 60_000).toISOString()
    const r = statusSla({ created_at: tresSemanas }, 15, AGORA)
    expect(r.estado).toBe('fora_da_janela')
    expect(r.texto).toBe('')
    expect(r.urgente).toBe(false)
  })

  it('dentro de 24h o estouro AINDA aparece — a falha real continua visível', () => {
    const seisHoras = new Date(AGORA.getTime() - 6 * 60 * 60_000).toISOString()
    const r = statusSla({ created_at: seisHoras }, 15, AGORA)
    expect(r.estado).toBe('estourado')
    expect(r.urgente).toBe(true)
  })

  it('exatamente na borda de 24h ainda é estouro; passando dela, some', () => {
    const antes = new Date(AGORA.getTime() - 23.9 * 60 * 60_000).toISOString()
    const depois = new Date(AGORA.getTime() - 24.1 * 60 * 60_000).toISOString()
    expect(statusSla({ created_at: antes }, 15, AGORA).estado).toBe('estourado')
    expect(statusSla({ created_at: depois }, 15, AGORA).estado).toBe('fora_da_janela')
  })

  it('lead antigo JÁ ATENDIDO continua como atendido, não some', () => {
    const tresSemanas = new Date(AGORA.getTime() - 21 * 24 * 60 * 60_000).toISOString()
    const r = statusSla({ created_at: tresSemanas, primeiro_atendimento_em: tresSemanas }, 15, AGORA)
    expect(r.estado).toBe('atendido')
  })

  it('todo estado tem cor definida — nenhum quebra a tela', () => {
    for (const e of ['atendido','ok','atencao','estourado','fora_da_janela'] as const) {
      expect(CORES_SLA[e]).toBeDefined()
    }
  })
})
