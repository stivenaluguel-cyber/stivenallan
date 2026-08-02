import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

vi.mock('@/lib/leads/rate-limit', () => ({ checkRateLimit: async () => ({ allowed: true }) }))

const { holder } = vi.hoisted(() => ({ holder: { current: null as any } }))
vi.mock('@supabase/supabase-js', () => ({ createClient: () => holder.current }))

import { POST } from './route'

function makeSupabase() {
  const upserts: { row: Record<string, unknown>; opts: unknown }[] = []
  return {
    upserts,
    from() {
      return {
        upsert(row: Record<string, unknown>, opts: unknown) {
          upserts.push({ row, opts })
          return { select: () => ({ single: async () => ({ data: { id: 'novo-id' }, error: null }) }) }
        },
      }
    },
  }
}

const req = (body: unknown) =>
  ({ json: async () => body, headers: new Headers() }) as unknown as NextRequest

describe('POST /api/proprietarios — captura pública', () => {
  it('exige nome e whatsapp', async () => {
    holder.current = makeSupabase()
    expect((await POST(req({ whatsapp: '48999990000' }))).status).toBe(400)
    expect((await POST(req({ nome: 'Ana' }))).status).toBe(400)
  })

  // Descoberto chamando a rota de verdade: com a linha montada inteira e null
  // nos campos ausentes, o segundo envio APAGAVA cidade/tipo/valor do registro.
  // Mesmo padrão que zerou 8 empreendimentos.
  it('reenvio com menos campos não inclui as colunas ausentes no upsert', async () => {
    const sb = makeSupabase()
    holder.current = sb

    await POST(req({ nome: 'Ana', whatsapp: '48999990000' }))

    const { row } = sb.upserts[0]
    expect(row).toMatchObject({ nome: 'Ana', whatsapp: '48999990000' })
    for (const c of ['cidade', 'bairro', 'tipo_imovel', 'valor_pretendido', 'email', 'anotacoes']) {
      expect(c in row, `"${c}" não deveria entrar no upsert quando não foi enviado`).toBe(false)
    }
  })

  // Reenviar o formulário não pode arrastar de volta pra "novo" alguém que o
  // corretor já moveu para "avaliação agendada".
  it('nunca reescreve o estágio', async () => {
    const sb = makeSupabase()
    holder.current = sb
    await POST(req({ nome: 'Ana', whatsapp: '48999990000', estagio: 'publicado' }))
    expect('estagio' in sb.upserts[0].row).toBe(false)
  })

  it('deduplica por whatsapp', async () => {
    const sb = makeSupabase()
    holder.current = sb
    await POST(req({ nome: 'Ana', whatsapp: '48999990000' }))
    expect(sb.upserts[0].opts).toEqual({ onConflict: 'whatsapp' })
  })

  it('vocabulário inválido cai no default em vez de estourar constraint', async () => {
    const sb = makeSupabase()
    holder.current = sb
    await POST(req({ nome: 'Ana', whatsapp: '48999990000', intencao: 'trocar', tipo_imovel: 'iate' }))
    expect(sb.upserts[0].row.intencao).toBe('vender')
    expect('tipo_imovel' in sb.upserts[0].row).toBe(false)
  })

  it('honeypot devolve 200 sem gravar — bot não aprende que foi detectado', async () => {
    const sb = makeSupabase()
    holder.current = sb
    const res = await POST(req({ nome: 'Bot', whatsapp: '48911112222', hp_url: 'http://spam' }))
    expect(res.status).toBe(200)
    expect(sb.upserts).toHaveLength(0)
  })

  it('corpo que não é JSON devolve 400', async () => {
    holder.current = makeSupabase()
    const bad = { json: async () => { throw new Error('x') }, headers: new Headers() } as unknown as NextRequest
    expect((await POST(bad)).status).toBe(400)
  })
})
