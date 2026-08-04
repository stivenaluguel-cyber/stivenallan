import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { cookieHolder, supabaseHolder } = vi.hoisted(() => ({
  cookieHolder: { logado: true },
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (cookieHolder.logado && name === 'dashboard_token' ? { value: 'valid-token' } : undefined),
  }),
}))
vi.mock('jose', () => ({ jwtVerify: async () => ({ payload: { adminId: 'admin-1' } }) }))
vi.mock('@supabase/supabase-js', () => ({ createClient: () => supabaseHolder.current }))

import { POST } from './route'

type ProspeccaoLead = {
  id: string
  place_id: string
  nome: string
  telefone: string | null
  endereco: string | null
  contexto_ia: string | null
  lead_id: string | null
  prospeccao_campanhas?: { nome: string }
}

function makeSupabase(cfg: {
  prospeccaoLead?: ProspeccaoLead | null
  leadInsertConflita?: boolean
  leadExistentePorWhatsapp?: { id: string } | null
}) {
  const leadsInseridos: Record<string, unknown>[] = []
  const prospeccaoUpdates: Record<string, unknown>[] = []
  return {
    leadsInseridos,
    prospeccaoUpdates,
    from(tabela: string) {
      if (tabela === 'prospeccao_leads') {
        return {
          select: () => ({ eq: () => ({ single: async () => ({ data: cfg.prospeccaoLead ?? null, error: cfg.prospeccaoLead ? null : { message: 'nao encontrado' } }) }) }),
          update: (row: Record<string, unknown>) => {
            prospeccaoUpdates.push(row)
            return { eq: async () => ({ error: null }) }
          },
        }
      }
      if (tabela === 'leads') {
        return {
          insert: (row: Record<string, unknown>) => {
            leadsInseridos.push(row)
            return {
              select: () => ({
                single: async () =>
                  cfg.leadInsertConflita
                    ? { data: null, error: { code: '23505', message: 'duplicate key' } }
                    : { data: { id: 'lead-novo' }, error: null },
              }),
            }
          },
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: cfg.leadExistentePorWhatsapp ?? null, error: null }),
            }),
          }),
        }
      }
      throw new Error('tabela inesperada: ' + tabela)
    },
  }
}

const req = () => ({} as unknown as NextRequest)
const params = { params: Promise.resolve({ id: 'pl-1' }) }

const PL_COM_CELULAR: ProspeccaoLead = {
  id: 'pl-1',
  place_id: 'place-1',
  nome: 'Transportes Natal',
  telefone: '(48) 99164-2332',
  endereco: 'Av. X, 260 - Criciúma - SC',
  contexto_ia: 'Bate em cheio com o ICP.',
  lead_id: null,
  prospeccao_campanhas: { nome: 'Investidores PJ Criciúma' },
}

const PL_SO_FIXO: ProspeccaoLead = { ...PL_COM_CELULAR, telefone: '(48) 3431-0600' }
const PL_SEM_TELEFONE: ProspeccaoLead = { ...PL_COM_CELULAR, telefone: null }

describe('POST /api/admin/prospeccao/leads/[id]/promover', () => {
  beforeEach(() => {
    cookieHolder.logado = true
    supabaseHolder.current = makeSupabase({ prospeccaoLead: PL_COM_CELULAR })
  })
  afterEach(() => vi.restoreAllMocks())

  it('sem sessao admin devolve 401', async () => {
    cookieHolder.logado = false
    const res = await POST(req(), params)
    expect(res.status).toBe(401)
  })

  it('resultado inexistente devolve 404', async () => {
    supabaseHolder.current = makeSupabase({ prospeccaoLead: null })
    const res = await POST(req(), params)
    expect(res.status).toBe(404)
  })

  it('já promovido antes: devolve o mesmo lead_id sem inserir de novo (idempotente)', async () => {
    supabaseHolder.current = makeSupabase({ prospeccaoLead: { ...PL_COM_CELULAR, lead_id: 'lead-existente' } })
    const res = await POST(req(), params)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ lead_id: 'lead-existente', ja_promovido: true })
    const sb = supabaseHolder.current as ReturnType<typeof makeSupabase>
    expect(sb.leadsInseridos).toHaveLength(0)
  })

  it('telefone com cara de celular vira o whatsapp real do lead', async () => {
    await POST(req(), params)
    const sb = supabaseHolder.current as ReturnType<typeof makeSupabase>
    expect(sb.leadsInseridos[0].whatsapp).toBe('48991642332')
  })

  it('telefone fixo NÃO vira whatsapp — usa o placeholder pj:<place_id>', async () => {
    supabaseHolder.current = makeSupabase({ prospeccaoLead: PL_SO_FIXO })
    await POST(req(), params)
    const sb = supabaseHolder.current as ReturnType<typeof makeSupabase>
    expect(sb.leadsInseridos[0].whatsapp).toBe('pj:place-1')
  })

  it('sem telefone nenhum, também usa o placeholder', async () => {
    supabaseHolder.current = makeSupabase({ prospeccaoLead: PL_SEM_TELEFONE })
    await POST(req(), params)
    const sb = supabaseHolder.current as ReturnType<typeof makeSupabase>
    expect(sb.leadsInseridos[0].whatsapp).toBe('pj:place-1')
  })

  it('grava origem/source reconhecíveis e o contexto da IA nas anotações', async () => {
    await POST(req(), params)
    const sb = supabaseHolder.current as ReturnType<typeof makeSupabase>
    const row = sb.leadsInseridos[0]
    expect(row.origem).toBe('Prospecção')
    expect(row.source).toBe('prospeccao')
    expect(row.anotacoes).toContain('Investidores PJ Criciúma')
    expect(row.anotacoes).toContain('Bate em cheio com o ICP.')
  })

  it('marca o resultado como promovido e liga o lead_id', async () => {
    await POST(req(), params)
    const sb = supabaseHolder.current as ReturnType<typeof makeSupabase>
    expect(sb.prospeccaoUpdates[0]).toEqual({ lead_id: 'lead-novo', status: 'promovido' })
  })

  it('colisão de whatsapp (23505): liga ao lead que já existe em vez de falhar', async () => {
    supabaseHolder.current = makeSupabase({
      prospeccaoLead: PL_COM_CELULAR,
      leadInsertConflita: true,
      leadExistentePorWhatsapp: { id: 'lead-ja-existia' },
    })
    const res = await POST(req(), params)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ lead_id: 'lead-ja-existia', ja_promovido: false })
  })

  it('colisão de whatsapp sem achar o lead existente (inconsistência) devolve 500 em vez de mentir', async () => {
    supabaseHolder.current = makeSupabase({ prospeccaoLead: PL_COM_CELULAR, leadInsertConflita: true, leadExistentePorWhatsapp: null })
    const res = await POST(req(), params)
    expect(res.status).toBe(500)
  })
})
