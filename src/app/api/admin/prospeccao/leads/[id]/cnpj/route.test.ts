import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { cookieHolder, supabaseHolder, cnpjaHolder } = vi.hoisted(() => ({
  cookieHolder: { logado: true },
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
  cnpjaHolder: { current: null as unknown as (nome: string) => Promise<unknown> },
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (cookieHolder.logado && name === 'dashboard_token' ? { value: 'valid-token' } : undefined),
  }),
}))
vi.mock('jose', () => ({ jwtVerify: async () => ({ payload: { adminId: 'admin-1' } }) }))
vi.mock('@supabase/supabase-js', () => ({ createClient: () => supabaseHolder.current }))
vi.mock('@/lib/prospeccao/cnpja', () => ({ buscarCnpjPorNome: (nome: string) => cnpjaHolder.current(nome) }))

import { POST } from './route'

type ProspeccaoLead = { id: string; nome: string; cnpj: string | null; razao_social: string | null; situacao_cnpj: string | null; socios: unknown }

function makeSupabase(cfg: { lead?: ProspeccaoLead | null } = {}) {
  const updates: Record<string, unknown>[] = []
  return {
    updates,
    from(tabela: string) {
      if (tabela !== 'prospeccao_leads') throw new Error('tabela inesperada: ' + tabela)
      return {
        select: () => ({ eq: () => ({ single: async () => ({ data: cfg.lead ?? null, error: cfg.lead ? null : { message: 'nao encontrado' } }) }) }),
        update: (row: Record<string, unknown>) => {
          updates.push(row)
          return { eq: async () => ({ error: null }) }
        },
      }
    },
  }
}

const LEAD_SEM_CNPJ: ProspeccaoLead = { id: 'pl-1', nome: 'Duda Imóveis', cnpj: null, razao_social: null, situacao_cnpj: null, socios: null }
const LEAD_COM_CNPJ: ProspeccaoLead = {
  id: 'pl-1', nome: 'Duda Imóveis', cnpj: '37335118000180', razao_social: 'DUDA IMOVEIS LTDA',
  situacao_cnpj: 'Ativa', socios: [{ nome: 'MARIA DUDA SILVA', cargo: 'Sócia' }],
}

const DADOS_OK = {
  cnpj: '37335118000180', razaoSocial: 'DUDA IMOVEIS LTDA', situacao: 'Ativa',
  telefone: '(48) 34310600', email: null, socios: [{ nome: 'MARIA DUDA SILVA', cargo: 'Sócia' }],
}

const req = () => ({} as unknown as NextRequest)
const params = { params: Promise.resolve({ id: 'pl-1' }) }

describe('POST /api/admin/prospeccao/leads/[id]/cnpj', () => {
  beforeEach(() => {
    cookieHolder.logado = true
    supabaseHolder.current = makeSupabase({ lead: LEAD_SEM_CNPJ })
    cnpjaHolder.current = async () => ({ ok: true, skipped: false, dados: DADOS_OK })
  })

  it('sem sessao admin devolve 401 sem chamar o cnpja.com', async () => {
    cookieHolder.logado = false
    const chamou = vi.fn()
    cnpjaHolder.current = chamou as never
    const res = await POST(req(), params)
    expect(res.status).toBe(401)
    expect(chamou).not.toHaveBeenCalled()
  })

  it('resultado inexistente devolve 404', async () => {
    supabaseHolder.current = makeSupabase({ lead: null })
    const res = await POST(req(), params)
    expect(res.status).toBe(404)
  })

  it('já tem CNPJ gravado: devolve do cache sem chamar o cnpja.com de novo', async () => {
    supabaseHolder.current = makeSupabase({ lead: LEAD_COM_CNPJ })
    const chamou = vi.fn()
    cnpjaHolder.current = chamou as never

    const res = await POST(req(), params)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ cnpj: '37335118000180', razaoSocial: 'DUDA IMOVEIS LTDA', situacao: 'Ativa', socios: [{ nome: 'MARIA DUDA SILVA', cargo: 'Sócia' }], origem: 'cache' })
    expect(chamou).not.toHaveBeenCalled()
  })

  it('sem CNPJA_API_KEY (skipped) devolve 503', async () => {
    cnpjaHolder.current = async () => ({ ok: false, skipped: true })
    const res = await POST(req(), params)
    expect(res.status).toBe(503)
  })

  it('erro do cnpja.com devolve 502', async () => {
    cnpjaHolder.current = async () => ({ ok: false, skipped: false, error: 'cnpja.com recusou a busca (status 401)' })
    const res = await POST(req(), params)
    expect(res.status).toBe(502)
  })

  it('nenhuma empresa encontrada devolve 404 com mensagem que sugere o manual', async () => {
    cnpjaHolder.current = async () => ({ ok: true, skipped: false, dados: null })
    const res = await POST(req(), params)
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toMatch(/Buscar CNPJ/)
  })

  it('caminho feliz: grava no banco e devolve os dados com origem online', async () => {
    const res = await POST(req(), params)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ cnpj: '37335118000180', razaoSocial: 'DUDA IMOVEIS LTDA', situacao: 'Ativa', socios: [{ nome: 'MARIA DUDA SILVA', cargo: 'Sócia' }], origem: 'online' })

    const sb = supabaseHolder.current as ReturnType<typeof makeSupabase>
    expect(sb.updates[0]).toEqual({ cnpj: '37335118000180', razao_social: 'DUDA IMOVEIS LTDA', situacao_cnpj: 'Ativa', socios: [{ nome: 'MARIA DUDA SILVA', cargo: 'Sócia' }] })
  })

  it('resposta nunca inclui telefone/e-mail do cnpja.com — só CNPJ, razão social, situação e sócios', async () => {
    const res = await POST(req(), params)
    const body = await res.json()
    expect(body).not.toHaveProperty('telefone')
    expect(body).not.toHaveProperty('email')
  })
})
