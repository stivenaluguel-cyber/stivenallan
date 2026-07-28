import { describe, expect, it } from 'vitest'
import { normalizarFiltrosFoco, filtrosDaQueryString, PRESETS_FOCO } from './focus-filters'

describe('normalizarFiltrosFoco', () => {
  it('aceita só valores válidos de temperatura', () => {
    expect(normalizarFiltrosFoco({ temperatura: 'quente' })).toEqual({ temperatura: 'quente' })
    expect(normalizarFiltrosFoco({ temperatura: 'roxo' })).toEqual({})
  })

  it('descarta campos desconhecidos vindos do cliente', () => {
    expect(normalizarFiltrosFoco({ temperatura: 'frio', admin: true, sql: 'drop table' })).toEqual({ temperatura: 'frio' })
  })

  it('ignora semAcaoDias inválido ou negativo', () => {
    expect(normalizarFiltrosFoco({ semAcaoDias: 'abc' })).toEqual({})
    expect(normalizarFiltrosFoco({ semAcaoDias: -5 })).toEqual({})
    expect(normalizarFiltrosFoco({ semAcaoDias: 7 })).toEqual({ semAcaoDias: 7 })
    expect(normalizarFiltrosFoco({ semAcaoDias: 7.9 })).toEqual({ semAcaoDias: 7 })
  })

  it('entrada não-objeto vira filtro vazio, não quebra', () => {
    expect(normalizarFiltrosFoco(null)).toEqual({})
    expect(normalizarFiltrosFoco('texto')).toEqual({})
    expect(normalizarFiltrosFoco([1, 2])).toEqual({})
  })

  it('é idempotente — normalizar o já normalizado não muda nada', () => {
    const f = { temperatura: 'quente' as const, semAcaoDias: 3, apenasFollowupVencido: true }
    expect(normalizarFiltrosFoco(normalizarFiltrosFoco(f))).toEqual(normalizarFiltrosFoco(f))
  })
})

describe('filtrosDaQueryString', () => {
  it('converte a query string com os mesmos critérios', () => {
    const p = new URLSearchParams('temperatura=quente&semAcaoDias=5&apenasFollowupVencido=true')
    expect(filtrosDaQueryString(p)).toEqual({ temperatura: 'quente', semAcaoDias: 5, apenasFollowupVencido: true })
  })

  it('query vazia vira filtro vazio', () => {
    expect(filtrosDaQueryString(new URLSearchParams())).toEqual({})
  })
})

describe('PRESETS_FOCO', () => {
  it('todo preset produz filtros que passam pela normalização sem perder nada', () => {
    for (const preset of PRESETS_FOCO) {
      expect(normalizarFiltrosFoco(preset.filtros)).toEqual(preset.filtros)
    }
  })

  it('cobre os atalhos que o briefing pediu', () => {
    const chaves = PRESETS_FOCO.map((p) => p.key)
    expect(chaves).toContain('followups_vencidos')
    expect(chaves).toContain('quentes_sem_contato')
    expect(chaves).toContain('parados')
  })
})
