import { describe, expect, it } from 'vitest'
import { recordFocusEvent } from './focus-session-events'

type MockSession = { processed_leads: number; skipped_leads: number; earned_points: number; total_leads: number }
type MockItem = { status: string; snoozed_until?: string | null; primary_action?: string | null }

// Reproduz em memória o contrato da função Postgres
// advance_focus_session_lead (validada contra um Postgres real): além da
// idempotência por (session_id, client_event_id) que já existia em
// record_focus_event, ela TRAVA a linha do item da fila e recusa ações
// primárias em item já processado — o que resolve duas abas agindo no mesmo
// lead com client_event_ids DIFERENTES.
function makeMockClient(opts: {
  sessoes?: Record<string, MockSession>
  itens?: Record<string, MockItem>
} = {}) {
  const sessoes = new Map<string, MockSession>(
    Object.entries(opts.sessoes ?? { 'sess-1': { processed_leads: 0, skipped_leads: 0, earned_points: 0, total_leads: 3 } }),
  )
  const itens = new Map<string, MockItem>(
    Object.entries(opts.itens ?? { 'sess-1:lead-1': { status: 'pendente' } }),
  )
  const eventosGravados = new Set<string>()

  return {
    sessoes,
    itens,
    async rpc(fn: string, args: Record<string, unknown>) {
      if (fn !== 'advance_focus_session_lead') throw new Error('rpc inesperada: ' + fn)
      const sessionId = args.p_session_id as string
      const leadId = args.p_lead_id as string
      const chaveItem = sessionId + ':' + leadId
      const item = itens.get(chaveItem)

      if (args.p_is_primary) {
        if (!item) return { data: { error: 'item_nao_pertence_a_sessao' }, error: null }
        if (!['pendente', 'adiado'].includes(item.status)) {
          return { data: { alreadyProcessed: true, points: 0, sessionLeadStatus: item.status }, error: null }
        }
      }

      const chaveEvento = sessionId + ':' + args.p_client_event_id
      if (eventosGravados.has(chaveEvento)) {
        return { data: { alreadyProcessed: true, points: 0 }, error: null }
      }
      eventosGravados.add(chaveEvento)

      const sessao = sessoes.get(sessionId)
      if (sessao) {
        sessao.processed_leads += args.p_is_primary && !args.p_is_skip ? 1 : 0
        sessao.skipped_leads += args.p_is_skip ? 1 : 0
        sessao.earned_points += args.p_points as number
      }
      if (args.p_is_primary && item) {
        item.status = (args.p_target_status as string) ?? 'processado'
        item.primary_action = args.p_action_type as string
        item.snoozed_until = (args.p_snoozed_until as string) ?? null
      }
      return { data: { alreadyProcessed: false, points: args.p_points, sessionLeadStatus: args.p_target_status }, error: null }
    },
    from() {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: sessoes.get('sess-1') ?? null, error: null }) }),
        }),
      }
    },
  } as unknown as {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: any; error: any }>
    from: () => any
    sessoes: Map<string, MockSession>
    itens: Map<string, MockItem>
  }
}

describe('recordFocusEvent — retry (mesmo client_event_id)', () => {
  it('a segunda chamada com o mesmo client_event_id não pontua de novo', async () => {
    const client = makeMockClient()
    const primeira = await recordFocusEvent(client as any, {
      sessionId: 'sess-1', leadId: 'lead-1', adminId: 'admin-1', actionType: 'anotacao', clientEventId: 'evt-1',
    })
    const retry = await recordFocusEvent(client as any, {
      sessionId: 'sess-1', leadId: 'lead-1', adminId: 'admin-1', actionType: 'anotacao', clientEventId: 'evt-1',
    })

    expect(primeira.alreadyProcessed).toBe(false)
    expect(primeira.points).toBe(3)
    expect(retry.alreadyProcessed).toBe(true)
    expect(retry.points).toBe(0)
    expect(client.sessoes.get('sess-1')?.earned_points).toBe(3)
  })

  it('repetição LEGÍTIMA (novo client_event_id) numa ação secundária pontua de novo', async () => {
    const client = makeMockClient()
    await recordFocusEvent(client as any, { sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'anotacao', clientEventId: 'evt-1' })
    await recordFocusEvent(client as any, { sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'anotacao', clientEventId: 'evt-2' })
    expect(client.sessoes.get('sess-1')?.earned_points).toBe(6)
  })
})

describe('recordFocusEvent — duas abas no mesmo item (client_event_ids diferentes)', () => {
  it('a segunda aba é recusada: o lead conta UMA vez só', async () => {
    const client = makeMockClient()

    const aba1 = await recordFocusEvent(client as any, {
      sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'followup_agendado', clientEventId: 'evt-aba-1',
    })
    // Outra aba, outra intenção, outro UUID — a idempotência por
    // client_event_id sozinha deixaria passar como ação nova e legítima.
    const aba2 = await recordFocusEvent(client as any, {
      sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'visita_agendada', clientEventId: 'evt-aba-2',
    })

    expect(aba1.alreadyProcessed).toBe(false)
    expect(aba2.alreadyProcessed).toBe(true)
    expect(aba2.points).toBe(0)
    expect(client.sessoes.get('sess-1')?.processed_leads).toBe(1)
    expect(client.sessoes.get('sess-1')?.earned_points).toBe(8) // só o follow-up
    expect(client.itens.get('sess-1:lead-1')?.primary_action).toBe('followup_agendado')
  })

  it('ação SECUNDÁRIA continua permitida depois do item processado', async () => {
    const client = makeMockClient({ itens: { 'sess-1:lead-1': { status: 'processado' } } })
    const r = await recordFocusEvent(client as any, {
      sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'anotacao', clientEventId: 'evt-1',
    })
    expect(r.alreadyProcessed).toBe(false)
    expect(r.points).toBe(3)
  })

  it('item que não pertence à sessão é recusado sem gravar nada', async () => {
    const client = makeMockClient()
    const r = await recordFocusEvent(client as any, {
      sessionId: 'sess-1', leadId: 'lead-de-outra-sessao', adminId: 'a', actionType: 'pular', clientEventId: 'evt-1',
    })
    expect(r.error).toBe('item_nao_pertence_a_sessao')
    expect(client.sessoes.get('sess-1')?.skipped_leads).toBe(0)
  })
})

describe('recordFocusEvent — contadores por tipo de ação', () => {
  it('pular conta em skipped_leads, não em processed_leads', async () => {
    const client = makeMockClient()
    await recordFocusEvent(client as any, { sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'pular', clientEventId: 'evt-1' })
    expect(client.sessoes.get('sess-1')?.skipped_leads).toBe(1)
    expect(client.sessoes.get('sess-1')?.processed_leads).toBe(0)
  })

  it('perdido conta como lead processado', async () => {
    const client = makeMockClient()
    await recordFocusEvent(client as any, { sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'perdido', clientEventId: 'evt-1' })
    expect(client.sessoes.get('sess-1')?.processed_leads).toBe(1)
  })

  it('adiar marca o item como adiado com a data de retorno, sem pontuar', async () => {
    const client = makeMockClient()
    await recordFocusEvent(client as any, {
      sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'adiado',
      clientEventId: 'evt-1', snoozedUntil: '2026-08-05T23:59:59-03:00',
    })
    const item = client.itens.get('sess-1:lead-1')
    expect(item?.status).toBe('adiado')
    expect(item?.snoozed_until).toBe('2026-08-05T23:59:59-03:00')
    expect(client.sessoes.get('sess-1')?.earned_points).toBe(0)
  })

  it('lead adiado pode ser retomado depois (status adiado ainda aceita ação)', async () => {
    const client = makeMockClient({ itens: { 'sess-1:lead-1': { status: 'adiado' } } })
    const r = await recordFocusEvent(client as any, {
      sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'followup_agendado', clientEventId: 'evt-2',
    })
    expect(r.alreadyProcessed).toBe(false)
    expect(client.itens.get('sess-1:lead-1')?.status).toBe('processado')
  })

  it('ações secundárias não mexem em processed/skipped', async () => {
    const client = makeMockClient()
    await recordFocusEvent(client as any, { sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'anotacao', clientEventId: 'evt-1' })
    await recordFocusEvent(client as any, { sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'contato_confirmado', clientEventId: 'evt-2' })
    const s = client.sessoes.get('sess-1')
    expect(s?.processed_leads).toBe(0)
    expect(s?.skipped_leads).toBe(0)
    expect(s?.earned_points).toBe(8) // 3 + 5
  })

  it('etapa_alterada para fechado pontua 100 sem contar como lead processado', async () => {
    const client = makeMockClient()
    const r = await recordFocusEvent(client as any, {
      sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'etapa_alterada',
      nextStage: 'fechado', clientEventId: 'evt-1',
    })
    expect(r.points).toBe(100)
    expect(client.sessoes.get('sess-1')?.processed_leads).toBe(0)
  })
})

describe('recordFocusEvent — contadores autoritativos', () => {
  it('devolve os contadores da sessão lidos do servidor, não um delta local', async () => {
    const client = makeMockClient()
    const r = await recordFocusEvent(client as any, {
      sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'followup_agendado', clientEventId: 'evt-1',
    })
    expect(r.session).toEqual({ processed_leads: 1, skipped_leads: 0, earned_points: 8, total_leads: 3 })
  })
})
