import { describe, expect, it } from 'vitest'
import { recordFocusEvent } from './focus-session-events'

type MockSession = { processed_leads: number; skipped_leads: number; earned_points: number }

// Reproduz em memória o MESMO contrato da função Postgres record_focus_event
// (migrations 0014/0015): ON CONFLICT (session_id, client_event_id) do
// nothing, e só quando o insert é novo é que os contadores da sessão
// avançam. Isso deixa o teste validar exatamente o comportamento que a
// auditoria pediu — clique duplo/retry vs. repetição legítima — sem
// precisar de um Postgres real.
function makeMockClient(sessoesIniciais: Record<string, MockSession> = { 'sess-1': { processed_leads: 0, skipped_leads: 0, earned_points: 0 } }) {
  const eventosGravados = new Set<string>()
  const sessoes = new Map<string, MockSession>(Object.entries(sessoesIniciais))
  return {
    sessoes,
    async rpc(fn: string, args: Record<string, unknown>) {
      if (fn !== 'record_focus_event') throw new Error('rpc inesperada: ' + fn)
      const chave = args.p_session_id + ':' + args.p_client_event_id
      if (eventosGravados.has(chave)) {
        return { data: { alreadyProcessed: true, points: 0 }, error: null }
      }
      eventosGravados.add(chave)
      const sessao = sessoes.get(args.p_session_id as string)
      if (sessao) {
        sessao.processed_leads += args.p_is_primary && !args.p_is_skip ? 1 : 0
        sessao.skipped_leads += args.p_is_skip ? 1 : 0
        sessao.earned_points += args.p_points as number
      }
      return { data: { alreadyProcessed: false, points: args.p_points }, error: null }
    },
  } as unknown as { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: any; error: any }>; sessoes: Map<string, MockSession> }
}

describe('recordFocusEvent — clique duplo e retry (mesmo client_event_id)', () => {
  it('a segunda chamada com o mesmo client_event_id não pontua de novo', async () => {
    const client = makeMockClient()
    const primeira = await recordFocusEvent(client as any, {
      sessionId: 'sess-1', leadId: 'lead-1', adminId: 'admin-1', actionType: 'anotacao', clientEventId: 'evt-1',
    })
    const retry = await recordFocusEvent(client as any, {
      sessionId: 'sess-1', leadId: 'lead-1', adminId: 'admin-1', actionType: 'anotacao', clientEventId: 'evt-1',
    })

    expect(primeira).toEqual({ alreadyProcessed: false, points: 3 })
    expect(retry).toEqual({ alreadyProcessed: true, points: 0 })
    expect(client.sessoes.get('sess-1')?.earned_points).toBe(3) // não dobrou
  })

  it('duas ações de tipos diferentes com o mesmo client_event_id (bug de implementação do chamador) ainda são protegidas pela chave', async () => {
    // Se o chamador acidentalmente reusar o id certo mas mudar o payload,
    // o índice único ainda impede um segundo registro — o insert é
    // rejeitado independentemente do conteúdo, só pela chave (sessão+id).
    const client = makeMockClient()
    await recordFocusEvent(client as any, { sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'anotacao', clientEventId: 'evt-1' })
    const segunda = await recordFocusEvent(client as any, { sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'contato_confirmado', clientEventId: 'evt-1' })
    expect(segunda.alreadyProcessed).toBe(true)
  })
})

describe('recordFocusEvent — repetição legítima (client_event_id diferente)', () => {
  it('uma segunda anotação no MESMO lead, na MESMA sessão, pontua de novo', async () => {
    const client = makeMockClient()
    const primeira = await recordFocusEvent(client as any, {
      sessionId: 'sess-1', leadId: 'lead-1', adminId: 'admin-1', actionType: 'anotacao', clientEventId: 'evt-1',
    })
    const segunda = await recordFocusEvent(client as any, {
      sessionId: 'sess-1', leadId: 'lead-1', adminId: 'admin-1', actionType: 'anotacao', clientEventId: 'evt-2',
    })

    expect(primeira.alreadyProcessed).toBe(false)
    expect(segunda.alreadyProcessed).toBe(false)
    expect(segunda.points).toBe(3)
    expect(client.sessoes.get('sess-1')?.earned_points).toBe(6)
  })

  it('um segundo follow-up (mesmo lead, mesma sessão) depois de reagendar pontua de novo', async () => {
    const client = makeMockClient()
    await recordFocusEvent(client as any, { sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'followup_agendado', clientEventId: 'evt-1' })
    const reagendado = await recordFocusEvent(client as any, { sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'followup_agendado', clientEventId: 'evt-2' })
    expect(reagendado.alreadyProcessed).toBe(false)
    expect(client.sessoes.get('sess-1')?.earned_points).toBe(16) // 8 + 8
  })

  it('a mesma ação em LEADS diferentes nunca colide (client_event_id sempre distinto)', async () => {
    const client = makeMockClient()
    const a = await recordFocusEvent(client as any, { sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'pular', clientEventId: 'evt-1' })
    const b = await recordFocusEvent(client as any, { sessionId: 'sess-1', leadId: 'lead-2', adminId: 'a', actionType: 'pular', clientEventId: 'evt-2' })
    expect(a.alreadyProcessed).toBe(false)
    expect(b.alreadyProcessed).toBe(false)
  })
})

describe('recordFocusEvent — contadores da sessão', () => {
  it('pular soma em skipped_leads, não em processed_leads', async () => {
    const client = makeMockClient()
    await recordFocusEvent(client as any, { sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'pular', clientEventId: 'evt-1' })
    expect(client.sessoes.get('sess-1')).toMatchObject({ processed_leads: 0, skipped_leads: 1 })
  })

  it('perdido é ação primária e soma em processed_leads', async () => {
    const client = makeMockClient()
    await recordFocusEvent(client as any, { sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'perdido', nextStage: 'perdido', clientEventId: 'evt-1' })
    expect(client.sessoes.get('sess-1')).toMatchObject({ processed_leads: 1, skipped_leads: 0 })
  })

  it('ações secundárias (anotação, contato confirmado) não mexem em processed/skipped', async () => {
    const client = makeMockClient()
    await recordFocusEvent(client as any, { sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'anotacao', clientEventId: 'evt-1' })
    await recordFocusEvent(client as any, { sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'contato_confirmado', clientEventId: 'evt-2' })
    expect(client.sessoes.get('sess-1')).toMatchObject({ processed_leads: 0, skipped_leads: 0 })
  })

  it('etapa_alterada para fechado pontua 100 mesmo sendo uma ação secundária (não mexe em processed_leads)', async () => {
    const client = makeMockClient()
    const r = await recordFocusEvent(client as any, {
      sessionId: 'sess-1', leadId: 'lead-1', adminId: 'a', actionType: 'etapa_alterada',
      previousStage: 'negociacao', nextStage: 'fechado', clientEventId: 'evt-1',
    })
    expect(r.points).toBe(100)
    expect(client.sessoes.get('sess-1')).toMatchObject({ processed_leads: 0, earned_points: 100 })
  })
})

describe('recordFocusEvent — erro do RPC', () => {
  it('propaga erro do banco como Error JS', async () => {
    const client = { rpc: async () => ({ data: null, error: { message: 'conexão recusada' } }) }
    await expect(
      recordFocusEvent(client as any, { sessionId: 's', leadId: 'l', adminId: null, actionType: 'pular', clientEventId: 'e' }),
    ).rejects.toThrow('conexão recusada')
  })
})
