import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { supabaseHolder, requireAdminHolder } = vi.hoisted(() => ({
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
  requireAdminHolder: { current: async () => 'admin-1' as string | null },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

vi.mock('@/lib/dashboard/admin-auth', () => ({
  requireAdmin: () => requireAdminHolder.current(),
}))

vi.mock('@/lib/log', () => ({ logError: vi.fn() }))

import { DELETE, PATCH } from './route'
import { logError } from '@/lib/log'

const PROPERTY_ID = 'property-1'
const FOTO_ID = 'foto-1'

type MockConfig = {
  foto?: { id: string; property_id: string; storage_path_original: string; storage_path_processada: string | null } | null
  deleteError?: { message: string } | null
  updateError?: { message: string } | null
  storageRemoveError?: { message: string } | null
}

function makeSupabase(cfg: MockConfig = {}) {
  const removedPaths: string[][] = []
  const deletedIds: string[] = []
  const updates: Record<string, unknown>[] = []
  return {
    removedPaths,
    deletedIds,
    updates,
    from(table: string) {
      if (table !== 'properties_fotos') throw new Error(`Unexpected table: ${table}`)
      return {
        select() {
          return {
            eq() {
              return {
                eq() {
                  return { maybeSingle: () => Promise.resolve({ data: cfg.foto ?? null }) }
                },
              }
            },
          }
        },
        delete() {
          return {
            eq(_field: string, id: string) {
              deletedIds.push(id)
              return Promise.resolve({ error: cfg.deleteError ?? null })
            },
          }
        },
        update(row: Record<string, unknown>) {
          updates.push(row)
          return {
            eq() {
              return {
                select() {
                  return {
                    single: () =>
                      cfg.updateError
                        ? Promise.resolve({ data: null, error: cfg.updateError })
                        : Promise.resolve({ data: { ...cfg.foto, ...row }, error: null }),
                  }
                },
              }
            },
          }
        },
      }
    },
    storage: {
      from(bucket: string) {
        if (bucket !== 'imoveis') throw new Error(`Unexpected bucket: ${bucket}`)
        return {
          remove(paths: string[]) {
            removedPaths.push(paths)
            return Promise.resolve({ error: cfg.storageRemoveError ?? null })
          },
          getPublicUrl(path: string) {
            return { data: { publicUrl: `https://exemplo.test/${path}` } }
          },
        }
      },
    },
  }
}

function makeReq(fotoId?: string) {
  const url = fotoId
    ? `http://localhost/api/admin/empreendimentos/${PROPERTY_ID}/fotos?fotoId=${fotoId}`
    : `http://localhost/api/admin/empreendimentos/${PROPERTY_ID}/fotos`
  return { url } as NextRequest
}

const PARAMS = { params: Promise.resolve({ id: PROPERTY_ID }) }

beforeEach(() => {
  requireAdminHolder.current = async () => 'admin-1'
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('DELETE /api/admin/empreendimentos/[id]/fotos', () => {
  it('exclui a linha e remove original + processada do storage', async () => {
    const foto = { id: FOTO_ID, property_id: PROPERTY_ID, storage_path_original: 'originais/x.jpg', storage_path_processada: 'galeria/x.jpg' }
    supabaseHolder.current = makeSupabase({ foto })

    const res = await DELETE(makeReq(FOTO_ID), PARAMS)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(supabaseHolder.current.deletedIds).toEqual([FOTO_ID])
    expect(supabaseHolder.current.removedPaths).toEqual([['originais/x.jpg', 'galeria/x.jpg']])
  })

  it('remove só o original quando não há versão processada (upload sem logo configurada)', async () => {
    const foto = { id: FOTO_ID, property_id: PROPERTY_ID, storage_path_original: 'originais/x.jpg', storage_path_processada: null }
    supabaseHolder.current = makeSupabase({ foto })

    await DELETE(makeReq(FOTO_ID), PARAMS)

    expect(supabaseHolder.current.removedPaths).toEqual([['originais/x.jpg']])
  })

  it('404 quando a foto não existe ou não pertence a esse empreendimento', async () => {
    supabaseHolder.current = makeSupabase({ foto: null })

    const res = await DELETE(makeReq(FOTO_ID), PARAMS)

    expect(res.status).toBe(404)
    expect(supabaseHolder.current.deletedIds).toEqual([])
  })

  it('400 quando fotoId não é passado na query', async () => {
    supabaseHolder.current = makeSupabase({})

    const res = await DELETE(makeReq(undefined), PARAMS)

    expect(res.status).toBe(400)
  })

  it('401 sem sessão admin', async () => {
    requireAdminHolder.current = async () => null
    supabaseHolder.current = makeSupabase({})

    const res = await DELETE(makeReq(FOTO_ID), PARAMS)

    expect(res.status).toBe(401)
  })

  it('linha é removida mesmo se a limpeza do storage falhar depois — só loga, não derruba a resposta', async () => {
    const foto = { id: FOTO_ID, property_id: PROPERTY_ID, storage_path_original: 'originais/x.jpg', storage_path_processada: null }
    supabaseHolder.current = makeSupabase({ foto, storageRemoveError: { message: 'boom' } })

    const res = await DELETE(makeReq(FOTO_ID), PARAMS)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(logError).toHaveBeenCalled()
  })

  it('500 quando o delete da linha falha — não tenta limpar storage de uma linha que ainda existe', async () => {
    const foto = { id: FOTO_ID, property_id: PROPERTY_ID, storage_path_original: 'originais/x.jpg', storage_path_processada: null }
    supabaseHolder.current = makeSupabase({ foto, deleteError: { message: 'db down' } })

    const res = await DELETE(makeReq(FOTO_ID), PARAMS)

    expect(res.status).toBe(500)
    expect(supabaseHolder.current.removedPaths).toEqual([])
  })
})

describe('PATCH /api/admin/empreendimentos/[id]/fotos (remover marca d\'água)', () => {
  it('zera storage_path_processada na linha e remove o arquivo processado do storage — original intocado', async () => {
    const foto = { id: FOTO_ID, property_id: PROPERTY_ID, storage_path_original: 'originais/x.jpg', storage_path_processada: 'galeria/x.jpg' }
    supabaseHolder.current = makeSupabase({ foto })

    const res = await PATCH(makeReq(FOTO_ID), PARAMS)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(supabaseHolder.current.updates).toEqual([{ storage_path_processada: null, processado_em: null }])
    expect(supabaseHolder.current.removedPaths).toEqual([['galeria/x.jpg']])
    expect(supabaseHolder.current.deletedIds).toEqual([]) // não é DELETE, a linha continua existindo
    expect(json.data.urls.processada).toBe(null)
    expect(json.data.urls.original).toContain('originais/x.jpg')
  })

  it('idempotente: foto que já não tem marca não vira erro, não escreve nem chama storage', async () => {
    const foto = { id: FOTO_ID, property_id: PROPERTY_ID, storage_path_original: 'originais/x.jpg', storage_path_processada: null }
    supabaseHolder.current = makeSupabase({ foto })

    const res = await PATCH(makeReq(FOTO_ID), PARAMS)

    expect(res.status).toBe(200)
    expect(supabaseHolder.current.updates).toEqual([])
    expect(supabaseHolder.current.removedPaths).toEqual([])
  })

  it('404 quando a foto não existe ou não pertence a esse empreendimento', async () => {
    supabaseHolder.current = makeSupabase({ foto: null })

    const res = await PATCH(makeReq(FOTO_ID), PARAMS)

    expect(res.status).toBe(404)
  })

  it('400 quando fotoId não é passado na query', async () => {
    supabaseHolder.current = makeSupabase({})

    const res = await PATCH(makeReq(undefined), PARAMS)

    expect(res.status).toBe(400)
  })

  it('401 sem sessão admin', async () => {
    requireAdminHolder.current = async () => null
    supabaseHolder.current = makeSupabase({})

    const res = await PATCH(makeReq(FOTO_ID), PARAMS)

    expect(res.status).toBe(401)
  })

  it('500 quando o update da linha falha — não tenta limpar storage de uma linha que ainda aponta pro arquivo', async () => {
    const foto = { id: FOTO_ID, property_id: PROPERTY_ID, storage_path_original: 'originais/x.jpg', storage_path_processada: 'galeria/x.jpg' }
    supabaseHolder.current = makeSupabase({ foto, updateError: { message: 'db down' } })

    const res = await PATCH(makeReq(FOTO_ID), PARAMS)

    expect(res.status).toBe(500)
    expect(supabaseHolder.current.removedPaths).toEqual([])
  })

  it('linha é atualizada mesmo se a limpeza do storage falhar depois — só loga, não derruba a resposta', async () => {
    const foto = { id: FOTO_ID, property_id: PROPERTY_ID, storage_path_original: 'originais/x.jpg', storage_path_processada: 'galeria/x.jpg' }
    supabaseHolder.current = makeSupabase({ foto, storageRemoveError: { message: 'boom' } })

    const res = await PATCH(makeReq(FOTO_ID), PARAMS)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data.urls.processada).toBe(null)
    expect(logError).toHaveBeenCalled()
  })
})
