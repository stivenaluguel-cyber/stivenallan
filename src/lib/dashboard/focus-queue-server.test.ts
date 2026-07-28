import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cruzarAgenda, leadsAdiadosAtivos, montarFilaServidor, type AgendaRow } from './focus-queue-server'

const AGORA = new Date('2026-07-28T12:00:00Z')

function evento(over: Partial<AgendaRow> = {}): AgendaRow {
  return { id: 'ev-1', lead_id: 'lead-1', titulo: 'Visita', inicio: '2026-07-27T12:00:00Z', tipo: 'visita', status: 'agendado', ...over }
}

describe('cruzarAgenda — separa o que já passou do que ainda vai acontecer', () => {
  it('visita no passado vira visitaVencida, nunca visitaFutura', () => {
    const r = cruzarAgenda([evento({ inicio: '2026-07-27T12:00:00Z' })], AGORA)
    expect(r.visitaVencidaPorLead['lead-1']?.id).toBe('ev-1')
    expect(r.visitaFuturaPorLead['lead-1']).toBeUndefined()
  })

  it('visita no futuro vira visitaFutura, nunca visitaVencida — o bug da V1', () => {
    const r = cruzarAgenda([evento({ inicio: '2026-07-31T12:00:00Z' })], AGORA)
    expect(r.visitaFuturaPorLead['lead-1']?.id).toBe('ev-1')
    expect(r.visitaVencidaPorLead['lead-1']).toBeUndefined()
  })

  it('lead com visita futura E visita vencida não confunde as duas', () => {
    const r = cruzarAgenda([
      evento({ id: 'passada', inicio: '2026-07-20T12:00:00Z' }),
      evento({ id: 'futura', inicio: '2026-08-10T12:00:00Z' }),
    ], AGORA)
    expect(r.visitaVencidaPorLead['lead-1']?.id).toBe('passada')
    expect(r.visitaFuturaPorLead['lead-1']?.id).toBe('futura')
  })

  it('compromisso vencido que NÃO é visita não vira visitaVencida', () => {
    const r = cruzarAgenda([evento({ tipo: 'ligacao', inicio: '2026-07-25T12:00:00Z' })], AGORA)
    expect(r.agendaPorLead['lead-1'].compromissoVencido?.tipo).toBe('ligacao')
    expect(r.visitaVencidaPorLead['lead-1']).toBeUndefined()
  })

  it('o compromisso vencido exato é o mais atrasado', () => {
    const r = cruzarAgenda([
      evento({ id: 'recente', inicio: '2026-07-27T12:00:00Z' }),
      evento({ id: 'antigo', inicio: '2026-07-10T12:00:00Z' }),
    ], AGORA)
    expect(r.agendaPorLead['lead-1'].compromissoVencido?.id).toBe('antigo')
  })
})

// Achado do smoke test: o filtro de adiamento existia DENTRO da sessão, mas
// montar uma sessão nova ignorava adiamentos — bastava encerrar e iniciar
// outra pro lead adiado reaparecer no mesmo dia.
function supabaseFake(cfg: { leads: { id: string }[]; adiados: { lead_id: string }[] }) {
  return {
    from(tabela: string) {
      if (tabela === 'leads') {
        return { select: () => ({ order: async () => ({ data: cfg.leads, error: null }) }) }
      }
      if (tabela === 'crm_agenda') {
        return { select: () => ({ eq: () => ({ not: async () => ({ data: [], error: null }) }) }) }
      }
      if (tabela === 'crm_focus_session_leads') {
        return { select: () => ({ eq: () => ({ gt: async () => ({ data: cfg.adiados, error: null }) }) }) }
      }
      throw new Error('tabela inesperada: ' + tabela)
    },
  } as unknown as SupabaseClient
}

function lead(id: string) {
  return { id, nome: id, whatsapp: '55489999' + id, estagio_funil: 'qualificado', created_at: '2026-07-01T12:00:00Z' }
}

describe('leadsAdiadosAtivos / montarFilaServidor — adiamento sobrevive à troca de sessão', () => {
  it('lead adiado para data futura fica FORA da fila de uma sessão nova', async () => {
    const client = supabaseFake({ leads: [lead('a'), lead('b'), lead('c')], adiados: [{ lead_id: 'b' }] })
    const fila = await montarFilaServidor(client, {})
    expect(fila).not.toContain('b')
    expect(fila).toEqual(expect.arrayContaining(['a', 'c']))
  })

  it('sem nenhum adiamento ativo, a fila sai completa', async () => {
    const client = supabaseFake({ leads: [lead('a'), lead('b')], adiados: [] })
    expect(await montarFilaServidor(client, {})).toHaveLength(2)
  })

  it('leadsAdiadosAtivos devolve um Set com os ids adiados', async () => {
    const client = supabaseFake({ leads: [], adiados: [{ lead_id: 'x' }, { lead_id: 'y' }] })
    const set = await leadsAdiadosAtivos(client)
    expect(set.has('x')).toBe(true)
    expect(set.has('z')).toBe(false)
  })
})
