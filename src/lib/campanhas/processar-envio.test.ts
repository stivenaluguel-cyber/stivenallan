import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { processarEnvioCampanha } from './processar-envio'

vi.mock('@/lib/email/resend', () => ({
  enviarEmailResend: vi.fn(async ({ to }: { to: string }) =>
    to.includes('fail') ? { ok: false, error: 'recusado pelo provedor' } : { ok: true, id: 'msg-' + to },
  ),
}))

// Fake mínimo do client do supabase-js — implementa só o subconjunto de
// filtros/operações que processar-envio.ts realmente usa (eq/not/is/limit/
// single/maybeSingle/update/upsert/select com count), operando sobre um
// "banco" em memória. Mutações (update/upsert) alteram os MESMOS objetos que
// vivem no array da tabela, então uma leitura seguinte já enxerga o estado
// novo — isso é o que permite testar a transição atômica rascunho→enviando
// e a contagem final de enviados/erros sem precisar de um banco de verdade.
type Row = Record<string, unknown>

class FakeQuery implements PromiseLike<{ data: unknown; error: unknown; count?: number }> {
  private filters: Array<(r: Row) => boolean> = []
  private limitN: number | null = null
  private mode: 'select' | 'update' | 'upsert' = 'select'
  private updatePayload: Row | null = null
  private upsertRows: Row[] = []
  private wantCount = false
  private isSingle = false
  private isMaybeSingle = false

  constructor(private table: string, private db: Record<string, Row[]>) {
    this.db[table] = this.db[table] ?? []
  }

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    if (opts?.count) this.wantCount = true
    return this
  }
  eq(field: string, val: unknown) {
    this.filters.push((r) => r[field] === val)
    return this
  }
  not(field: string, _op: string, val: unknown) {
    this.filters.push((r) => r[field] !== val)
    return this
  }
  lte(field: string, val: unknown) {
    this.filters.push((r) => (r[field] as string) <= (val as string))
    return this
  }
  limit(n: number) {
    this.limitN = n
    return this
  }
  update(payload: Row) {
    this.mode = 'update'
    this.updatePayload = payload
    return this
  }
  upsert(rows: Row[], _opts?: { onConflict?: string; ignoreDuplicates?: boolean }) {
    this.mode = 'upsert'
    this.upsertRows = rows
    return this
  }
  single() {
    this.isSingle = true
    return this.exec()
  }
  maybeSingle() {
    this.isMaybeSingle = true
    return this.exec()
  }
  then<TResult1 = { data: unknown; error: unknown; count?: number }, TResult2 = never>(
    onfulfilled?: ((value: { data: unknown; error: unknown; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected)
  }

  private matched(): Row[] {
    return this.db[this.table].filter((r) => this.filters.every((f) => f(r)))
  }

  private async exec(): Promise<{ data: unknown; error: unknown; count?: number }> {
    if (this.mode === 'update') {
      const rows = this.matched() // captura quem bate ANTES de aplicar a mudança
      rows.forEach((r) => Object.assign(r, this.updatePayload))
      // clona antes de devolver — igual a um roundtrip real, o chamador não
      // pode enxergar mutações FUTURAS de outra query só por ter guardado a
      // referência de uma leitura anterior (ex.: `campanha.status` lido antes
      // não pode virar 'enviando' sozinho só porque outra query mudou a row).
      const clones = rows.map((r) => ({ ...r }))
      if (this.isSingle) return { data: clones[0] ?? null, error: clones.length ? null : { message: 'not found' } }
      return { data: clones, error: null }
    }
    if (this.mode === 'upsert') {
      for (const row of this.upsertRows) {
        const existe = this.db[this.table].some((r) => r.campanha_id === row.campanha_id && r.lead_id === row.lead_id)
        if (!existe) this.db[this.table].push({ id: 'gen-' + Math.random().toString(36).slice(2), ...row })
      }
      return { data: null, error: null }
    }
    let rows = this.matched()
    if (this.limitN !== null) rows = rows.slice(0, this.limitN)
    if (this.wantCount) return { data: null, error: null, count: rows.length }
    const clones = rows.map((r) => ({ ...r }))
    if (this.isSingle) return clones.length === 1 ? { data: clones[0], error: null } : { data: null, error: { message: 'not found' } }
    if (this.isMaybeSingle) return { data: clones[0] ?? null, error: null }
    return { data: clones, error: null }
  }
}

function makeSupabase(seed: { campanhas?: Row[]; leads?: Row[]; campanha_destinatarios?: Row[]; properties?: Row[] }) {
  const db: Record<string, Row[]> = {
    campanhas: seed.campanhas ?? [],
    leads: seed.leads ?? [],
    campanha_destinatarios: seed.campanha_destinatarios ?? [],
    properties: seed.properties ?? [],
  }
  const client = { from: (table: string) => new FakeQuery(table, db) }
  return { client: client as unknown as SupabaseClient, db }
}

describe('processarEnvioCampanha', () => {
  beforeEach(() => {
    process.env.UNSUBSCRIBE_SECRET = 'test-secret'
    process.env.NEXT_PUBLIC_SITE_URL = 'https://stivenallan.com.br'
  })

  afterEach(() => {
    delete process.env.UNSUBSCRIBE_SECRET
    delete process.env.NEXT_PUBLIC_SITE_URL
    vi.clearAllMocks()
  })

  it('campanha com zero destinatários: não monta público, reverte status, erro claro', async () => {
    const { client, db } = makeSupabase({
      campanhas: [{ id: 'c1', status: 'rascunho', segmento: { origem: ['inexistente'] }, assunto: 'Oi', corpo_html: '<p>Oi {nome}</p>' }],
      leads: [{ id: 'l1', email: 'a@a.com', estagio_funil: 'qualificado', temperatura: 2, origem: 'Site', cidade_interesse: 'Criciúma', unsubscribed_at: null, nome: 'Ana', property_id: null, property_name: 'Monte Leone' }],
    })

    const resultado = await processarEnvioCampanha(client, 'c1')

    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.error).toMatch(/nenhum lead corresponde/i)
      expect(resultado.status).toBe(400)
    }
    // status volta pro que era antes (rascunho) — não fica travada em "enviando" sem ninguém
    expect(db.campanhas[0].status).toBe('rascunho')
    expect(db.campanha_destinatarios).toHaveLength(0)
  })

  it('falha parcial de envio: 1 sucesso + 1 falha → status final "parcial", não "enviada"', async () => {
    const { client, db } = makeSupabase({
      campanhas: [{ id: 'c1', status: 'rascunho', segmento: {}, assunto: 'Oi {nome}', corpo_html: '<p>{empreendimento}</p>' }],
      leads: [
        { id: 'l1', email: 'ok@a.com', estagio_funil: 'qualificado', temperatura: 2, origem: 'Site', cidade_interesse: 'Criciúma', unsubscribed_at: null, nome: 'Ana', property_id: null, property_name: 'Monte Leone' },
        { id: 'l2', email: 'fail@a.com', estagio_funil: 'qualificado', temperatura: 2, origem: 'Site', cidade_interesse: 'Criciúma', unsubscribed_at: null, nome: 'Beto', property_id: null, property_name: 'Lavis' },
      ],
    })

    const resultado = await processarEnvioCampanha(client, 'c1')

    expect(resultado.ok).toBe(true)
    if (resultado.ok) {
      expect(resultado.enviados).toBe(1)
      expect(resultado.erros).toBe(1)
      expect(resultado.restantes).toBe(0)
      expect(resultado.statusFinal).toBe('parcial') // NÃO pode virar "enviada" com erro no meio
    }
    expect(db.campanhas[0].status).toBe('parcial')

    const destOk = db.campanha_destinatarios.find((d) => d.email === 'ok@a.com')
    const destFail = db.campanha_destinatarios.find((d) => d.email === 'fail@a.com')
    expect(destOk?.status).toBe('enviado')
    expect(destFail?.status).toBe('erro')
  }, 10_000)

  it('retry: uma segunda chamada não reprocessa quem já foi enviado nem duplica destinatários', async () => {
    const { client, db } = makeSupabase({
      campanhas: [{ id: 'c1', status: 'rascunho', segmento: {}, assunto: 'Oi', corpo_html: '<p>Oi</p>' }],
      leads: [{ id: 'l1', email: 'ok@a.com', estagio_funil: 'qualificado', temperatura: 2, origem: 'Site', cidade_interesse: 'Criciúma', unsubscribed_at: null, nome: 'Ana', property_id: null, property_name: 'Monte Leone' }],
    })

    const primeira = await processarEnvioCampanha(client, 'c1')
    expect(primeira.ok).toBe(true)
    expect(db.campanha_destinatarios).toHaveLength(1)

    // campanha já está 'enviada' (1 lead, sucesso) — uma segunda chamada deve recusar
    const segunda = await processarEnvioCampanha(client, 'c1')
    expect(segunda.ok).toBe(false)
    if (!segunda.ok) expect(segunda.error).toMatch(/já foi enviada/i)

    // nenhuma duplicata foi criada
    expect(db.campanha_destinatarios).toHaveLength(1)
  }, 10_000)

  it('campanha cancelada não pode ser processada', async () => {
    const { client } = makeSupabase({
      campanhas: [{ id: 'c1', status: 'cancelada', segmento: {}, assunto: 'Oi', corpo_html: '<p>Oi</p>' }],
    })
    const resultado = await processarEnvioCampanha(client, 'c1')
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.error).toMatch(/cancelada/i)
  })

  it('campanha inexistente retorna 404', async () => {
    const { client } = makeSupabase({})
    const resultado = await processarEnvioCampanha(client, 'nao-existe')
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.status).toBe(404)
  })
})
