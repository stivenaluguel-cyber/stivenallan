import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/meta-capi', () => ({ sendMetaCapiEvent: vi.fn(async () => ({ ok: false, skipped: true })) }))
vi.mock('@/lib/google-ads-conversion', () => ({ sendGoogleAdsConversion: vi.fn(async () => ({ ok: false, skipped: true })) }))
// after() só é válido dentro de um request scope real do Next.js — nos testes,
// executa o callback direto (mesma semântica de "roda em algum momento").
vi.mock('next/server', () => ({ after: (cb: () => unknown) => { cb() } }))

import { registrarMudancaEstagio } from './registrar-mudanca-estagio'

type Row = Record<string, unknown>

function makeSupabase(leadRow: Row, opts: { upsertError?: { message: string } } = {}) {
  const inserts: { table: string; row: Row }[] = []
  const upserts: { table: string; row: Row; onConflict?: string }[] = []

  return {
    inserts,
    upserts,
    from(table: string) {
      if (table === 'leads_interacoes') {
        return { insert: async (row: Row) => { inserts.push({ table, row }); return { error: null } } }
      }
      if (table === 'leads') {
        return { select: () => ({ eq: () => ({ single: async () => ({ data: leadRow, error: null }) }) }) }
      }
      if (table === 'crm_clientes') {
        return {
          upsert: async (row: Row, options: { onConflict?: string }) => {
            upserts.push({ table, row, onConflict: options?.onConflict })
            return { error: opts.upsertError ?? null }
          },
        }
      }
      throw new Error('Unexpected table: ' + table)
    },
  }
}

describe('registrarMudancaEstagio', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('não mexe em crm_clientes quando o novo estágio não é "fechado"', async () => {
    const sb = makeSupabase({ nome: 'Ana', whatsapp: '5548999999999', email: null, fbclid: null, gclid: null, origem: 'Site', orcamento_max: 300000, anotacoes: null, empreendimentos: null })
    await registrarMudancaEstagio(sb as any, 'lead-1', 'qualificado', 'interessado')
    expect(sb.upserts).toHaveLength(0)
    expect(sb.inserts[0]).toMatchObject({ table: 'leads_interacoes', row: { estagio_de: 'qualificado', estagio_para: 'interessado' } })
  })

  it('converte o lead em cliente (upsert por lead_id) quando chega em "fechado"', async () => {
    const sb = makeSupabase({
      nome: 'Bruno',
      whatsapp: '5548988888888',
      email: 'bruno@example.com',
      fbclid: null,
      gclid: null,
      origem: 'Instagram',
      orcamento_max: 450000,
      anotacoes: 'Quer 3 suítes',
      empreendimentos: { nome: 'Monte Leone' },
    })

    await registrarMudancaEstagio(sb as any, 'lead-2', 'negociacao', 'fechado')

    expect(sb.upserts).toHaveLength(1)
    expect(sb.upserts[0].onConflict).toBe('lead_id')
    expect(sb.upserts[0].row).toMatchObject({
      lead_id: 'lead-2',
      nome: 'Bruno',
      telefone: '5548988888888',
      email: 'bruno@example.com',
      origem: 'Instagram',
      busca_valor_max: 450000,
    })
    expect(sb.upserts[0].row.notas).toContain('Monte Leone')
    expect(sb.upserts[0].row.notas).toContain('Quer 3 suítes')
  })

  it('não lança quando o upsert em crm_clientes falha — só loga', async () => {
    const sb = makeSupabase(
      { nome: 'Carla', whatsapp: '5548977777777', email: null, fbclid: null, gclid: null, origem: null, orcamento_max: null, anotacoes: null, empreendimentos: null },
      { upsertError: { message: 'constraint violation' } },
    )
    await expect(registrarMudancaEstagio(sb as any, 'lead-3', 'negociacao', 'fechado')).resolves.toBeUndefined()
    expect(sb.upserts).toHaveLength(1)
  })

  it('não converte em cliente quando o lead não tem nome/whatsapp', async () => {
    const sb = makeSupabase({ nome: null, whatsapp: null, email: null, fbclid: null, gclid: null, origem: null, orcamento_max: null, anotacoes: null, empreendimentos: null })
    await registrarMudancaEstagio(sb as any, 'lead-4', 'negociacao', 'fechado')
    expect(sb.upserts).toHaveLength(0)
  })
})
