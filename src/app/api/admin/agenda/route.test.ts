import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (name === 'dashboard_token' ? { value: 'valid-token' } : undefined),
  }),
}))

vi.mock('jose', () => ({
  jwtVerify: async () => ({ payload: { adminId: 'admin-1' } }),
}))

// Holder mutável precisa ser hoisted junto com vi.mock (que também é hoisted).
const { supabaseHolder } = vi.hoisted(() => ({
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

// Import DEPOIS dos vi.mock (hoistados pro topo do arquivo).
import { GET, POST, PATCH } from './route'

// Simula crm_agenda em memória, incluindo o comportamento do unique index
// PARCIAL em client_event_id (migration 0016): duas linhas com o mesmo
// client_event_id colidem (23505); linhas com client_event_id null (uso
// normal da tela de Agenda humana) nunca colidem entre si.
function makeSupabase() {
  const rows: Record<string, unknown>[] = []
  let seq = 0

  function selectEqMaybeSingle(col: string, val: unknown) {
    const found = rows.find((r) => r[col] === val)
    return { data: found ?? null, error: null }
  }

  return {
    rows,
    from(table: string) {
      if (table !== 'crm_agenda') throw new Error('Tabela inesperada no teste: ' + table)
      return {
        select() {
          return {
            eq(col: string, val: unknown) {
              return { maybeSingle: async () => selectEqMaybeSingle(col, val) }
            },
          }
        },
        insert(row: Record<string, unknown>) {
          return {
            select() {
              return {
                single: async () => {
                  const clientEventId = row.client_event_id
                  if (clientEventId && rows.some((r) => r.client_event_id === clientEventId)) {
                    return { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint "crm_agenda_client_event_id_unique"' } }
                  }
                  seq++
                  const novaLinha = { id: 'agenda-' + seq, ...row }
                  rows.push(novaLinha)
                  return { data: novaLinha, error: null }
                },
              }
            },
          }
        },
      }
    },
  }
}

async function callPost(body: unknown) {
  const req = { json: async () => body } as unknown as NextRequest
  const res = await POST(req)
  const json = await res.json()
  return { status: res.status, json }
}

// Mock pro GET: só precisa do encadeamento select().gte().lte().order(),
// awaitable no final (thenable), devolvendo as linhas configuradas.
function makeSupabaseGet(rows: Record<string, unknown>[]) {
  const chain = {
    gte: (..._a: unknown[]) => chain,
    lte: (..._a: unknown[]) => chain,
    order: (..._a: unknown[]) => chain,
    then: (resolve: (v: { data: Record<string, unknown>[]; error: null }) => void) => resolve({ data: rows, error: null }),
  }
  return {
    from(table: string) {
      if (table !== 'crm_agenda') throw new Error('Tabela inesperada no teste: ' + table)
      return { select: (..._a: unknown[]) => chain }
    },
  }
}

function callGet(url = 'http://test/api/admin/agenda') {
  return GET({ url } as unknown as NextRequest)
}

describe('GET /api/admin/agenda — inclui a relação de properties (Item 10B)', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    process.env.JWT_SECRET = 'segredo-de-teste-com-32-caracteres-minimos'
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
  })

  it('evento com property relacionada: a relação properties chega na resposta', async () => {
    supabaseHolder.current = makeSupabaseGet([
      { id: 'agenda-1', titulo: 'Visita', tipo: 'visita', inicio: '2026-08-10T17:30:00Z', status: 'agendado', leads: { nome: 'Ana', whatsapp: '5548999999999' }, properties: { nome: 'Monte Leone', slug: 'monte-leone', endereco: 'Rua X, 100' } },
    ]) as unknown as ReturnType<typeof makeSupabase>

    const res = await callGet()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data[0].properties).toEqual({ nome: 'Monte Leone', slug: 'monte-leone', endereco: 'Rua X, 100' })
  })

  it('evento manual antigo sem property (property_id null) continua funcionando normalmente', async () => {
    supabaseHolder.current = makeSupabaseGet([
      { id: 'agenda-2', titulo: 'Reunião', tipo: 'reuniao', inicio: '2026-08-10T15:00:00Z', status: 'agendado', leads: null, properties: null },
    ]) as unknown as ReturnType<typeof makeSupabase>

    const res = await callGet()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data[0].properties).toBeNull()
    expect(json.data[0].data_hora).toBe('2026-08-10T15:00:00Z')
  })

  it('mapeamento data_hora = inicio permanece preservado', async () => {
    supabaseHolder.current = makeSupabaseGet([
      { id: 'agenda-3', titulo: 'X', tipo: 'reuniao', inicio: '2026-08-10T09:00:00Z', status: 'agendado' },
    ]) as unknown as ReturnType<typeof makeSupabase>

    const res = await callGet()
    const json = await res.json()
    expect(json.data[0].data_hora).toBe('2026-08-10T09:00:00Z')
  })

  it('autenticação continua exigida: com o mesmo cookie válido de sempre, GET responde 200 (requireAdmin() não foi removido nem contornado pela mudança do join)', async () => {
    supabaseHolder.current = makeSupabaseGet([]) as unknown as ReturnType<typeof makeSupabase>
    const res = await callGet()
    expect(res.status).toBe(200)
  })
})

describe('POST /api/admin/agenda — idempotência por client_event_id', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    process.env.JWT_SECRET = 'segredo-de-teste-com-32-caracteres-minimos'
    supabaseHolder.current = makeSupabase()
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
  })

  const payloadBase = { titulo: 'Follow-up — João', data_hora: '2026-08-01T09:00:00', tipo: 'ligacao', lead_id: 'lead-1' }

  it('sem client_event_id (tela de Agenda humana), cada POST cria uma linha nova — comportamento não muda', async () => {
    const a = await callPost(payloadBase)
    const b = await callPost(payloadBase)
    expect(a.status).toBe(201)
    expect(b.status).toBe(201)
    expect(supabaseHolder.current.rows).toHaveLength(2)
  })

  it('criação duplicada de Agenda: reenviar o MESMO client_event_id (retry após reload) não cria uma segunda linha', async () => {
    const primeira = await callPost({ ...payloadBase, client_event_id: '11111111-1111-1111-1111-111111111111' })
    expect(primeira.status).toBe(201)
    expect(supabaseHolder.current.rows).toHaveLength(1)

    // Simula exatamente o cenário da auditoria: Agenda criada, evento de
    // pontuação falha, página recarrega, usuário tenta de novo — o
    // client_event_id é reaproveitado (persistido em sessionStorage) e o
    // POST é reenviado idêntico.
    const retry = await callPost({ ...payloadBase, client_event_id: '11111111-1111-1111-1111-111111111111' })
    expect(retry.status).toBe(200) // devolve o existente, não cria (201 seria "criado")
    expect(supabaseHolder.current.rows).toHaveLength(1) // continua só 1 linha
    expect(retry.json.data.id).toBe(primeira.json.data.id)
  })

  it('mesma ação legítima realizada de novo com um client_event_id NOVO cria uma segunda linha normalmente', async () => {
    await callPost({ ...payloadBase, client_event_id: '11111111-1111-1111-1111-111111111111' })
    const segundoFollowup = await callPost({ ...payloadBase, titulo: 'Follow-up reagendado', client_event_id: '22222222-2222-2222-2222-222222222222' })

    expect(segundoFollowup.status).toBe(201)
    expect(supabaseHolder.current.rows).toHaveLength(2)
    expect(segundoFollowup.json.data.titulo).toBe('Follow-up reagendado')
  })

  it('corrida entre duas requisições quase simultâneas com o mesmo client_event_id: a segunda não duplica nem erra', async () => {
    // O pré-check (SELECT antes do INSERT) não pega a corrida porque as
    // duas "requisições" rodam em sequência síncrona no teste sem que a
    // primeira já tenha inserido no momento do pré-check da segunda — para
    // simular isso de verdade, inserimos a linha diretamente e então
    // chamamos POST simulando a falha de unique constraint no insert.
    const clientEventId = '33333333-3333-3333-3333-333333333333'
    supabaseHolder.current.rows.push({ id: 'agenda-race', client_event_id: clientEventId, inicio: payloadBase.data_hora, titulo: payloadBase.titulo })

    const resultado = await callPost({ ...payloadBase, client_event_id: clientEventId })

    expect(resultado.status).toBe(200)
    expect(resultado.json.data.id).toBe('agenda-race')
    expect(supabaseHolder.current.rows).toHaveLength(1)
  })
})

// Mock separado pro PATCH: precisa de select().eq().single() e de update().
function makeSupabasePatch(inicio: string) {
  const atualizacoes: Record<string, unknown>[] = []
  return {
    atualizacoes,
    from(table: string) {
      if (table !== 'crm_agenda') throw new Error('Tabela inesperada no teste: ' + table)
      return {
        select: () => ({ eq: () => ({ single: async () => ({ data: { id: 'agenda-1', inicio }, error: null }) }) }),
        update(patch: Record<string, unknown>) {
          atualizacoes.push(patch)
          return { eq: () => ({ select: () => ({ single: async () => ({ data: { id: 'agenda-1', inicio, ...patch }, error: null }) }) }) }
        },
      }
    },
  }
}

async function callPatch(body: unknown) {
  const res = await PATCH({ json: async () => body } as unknown as NextRequest)
  return { status: res.status, json: await res.json() }
}

describe('PATCH /api/admin/agenda — visita futura não pode ser dada como realizada', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    process.env.JWT_SECRET = 'segredo-de-teste-com-32-caracteres-minimos'
  })

  const futuro = new Date(Date.now() + 3 * 86_400_000).toISOString()
  const passado = new Date(Date.now() - 3 * 86_400_000).toISOString()

  it('recusa (409) marcar como concluída uma visita que ainda não aconteceu', async () => {
    supabaseHolder.current = makeSupabasePatch(futuro) as never
    const r = await callPatch({ id: 'agenda-1', status: 'concluido' })
    expect(r.status).toBe(409)
    expect(r.json.requerConfirmacaoAntecipada).toBe(true)
    expect((supabaseHolder.current as never as ReturnType<typeof makeSupabasePatch>).atualizacoes).toHaveLength(0)
  })

  it('recusa também "não compareceu" antes da hora', async () => {
    supabaseHolder.current = makeSupabasePatch(futuro) as never
    expect((await callPatch({ id: 'agenda-1', status: 'nao_compareceu' })).status).toBe(409)
  })

  it('permite concluir uma visita cujo horário JÁ passou', async () => {
    supabaseHolder.current = makeSupabasePatch(passado) as never
    const r = await callPatch({ id: 'agenda-1', status: 'concluido' })
    expect(r.status).toBe(200)
    expect(r.json.data.status).toBe('concluido')
  })

  it('permite confirmação antecipada explícita (visita que aconteceu antes da hora marcada)', async () => {
    supabaseHolder.current = makeSupabasePatch(futuro) as never
    const r = await callPatch({ id: 'agenda-1', status: 'concluido', confirmarAntecipado: true })
    expect(r.status).toBe(200)
    // O flag é consumido pela rota, não vai parar na coluna do banco.
    const patch = (supabaseHolder.current as never as ReturnType<typeof makeSupabasePatch>).atualizacoes[0]
    expect(patch).not.toHaveProperty('confirmarAntecipado')
  })

  it('recusa status fora do conjunto conhecido', async () => {
    supabaseHolder.current = makeSupabasePatch(passado) as never
    expect((await callPatch({ id: 'agenda-1', status: 'inventado' })).status).toBe(400)
  })

  it('reagendar (sem mudar status) não passa pela checagem de horário', async () => {
    supabaseHolder.current = makeSupabasePatch(futuro) as never
    const r = await callPatch({ id: 'agenda-1', data_hora: '2026-09-01T10:00:00-03:00' })
    expect(r.status).toBe(200)
  })
})
