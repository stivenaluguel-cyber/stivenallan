import { describe, expect, it } from 'vitest'
import { buildLeadBadges } from './LeadAttentionBadge'

const base = {
  followupVencido: false,
  requerAtencao: false,
  nuncaContatado: false,
  diasSemContato: 2 as number | null,
  proximoEvento: null as { titulo: string; inicio: string; tipo: string } | null,
  prioridade: { title: 'Prioridade da fila', detail: '', level: 'normal' as const },
}

describe('buildLeadBadges', () => {
  it('não duplica como badge o mesmo motivo já mostrado no bloco "Por que está aqui"', () => {
    const badges = buildLeadBadges({ ...base, followupVencido: true, prioridade: { title: 'Follow-up vencido', detail: '', level: 'urgent' } })
    expect(badges.find((b) => b.key === 'followup')).toBeUndefined()
  })

  it('mostra um sinal secundário como badge quando ele NÃO é o motivo principal', () => {
    const badges = buildLeadBadges({
      ...base,
      followupVencido: true,
      requerAtencao: true,
      prioridade: { title: 'Follow-up vencido', detail: '', level: 'urgent' },
    })
    expect(badges.find((b) => b.key === 'followup')).toBeUndefined()
    expect(badges.find((b) => b.key === 'atencao')).toBeDefined()
  })

  it('compromisso/visita hoje sempre aparece, mesmo sendo outro o motivo principal', () => {
    const badges = buildLeadBadges({
      ...base,
      proximoEvento: { titulo: 'Visita', inicio: new Date().toISOString(), tipo: 'visita' },
      prioridade: { title: 'Lead quente', detail: '', level: 'attention' },
    })
    expect(badges.find((b) => b.key === 'hoje')).toBeDefined()
  })

  it('sem nenhum sinal, não gera badges', () => {
    expect(buildLeadBadges(base)).toHaveLength(0)
  })
})
