import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autenticado } from '@/lib/dashboard/auth-check'
import { logWarn } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const SOURCE = 'admin/automacoes/config'

// Mesmo default usado pelos crons quando a migration 0015 ainda não rodou —
// fail-open, mesmo espírito de src/lib/cron/tracker.ts (nunca quebra o
// dashboard só porque a tabela ainda não existe em produção).
const CONFIG_DEFAULT = {
  pausado: false,
  horario_inicio: '08:00',
  horario_fim: '20:00',
  limite_diario: null as number | null,
}

const HORARIO_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export async function GET() {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await sb().from('automacao_config').select('*').eq('id', true).maybeSingle()
  if (error || !data) {
    if (error) logWarn(SOURCE, 'automacao_config indisponível, usando default (migration 0015 pendente?)', { db_message: error.message })
    return NextResponse.json({ ...CONFIG_DEFAULT, migracao_pendente: true })
  }
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const patch: Record<string, unknown> = {}

  if (body.pausado !== undefined) {
    if (typeof body.pausado !== 'boolean') {
      return NextResponse.json({ error: 'pausado precisa ser um boolean.' }, { status: 400 })
    }
    patch.pausado = body.pausado
  }

  if (body.horario_inicio !== undefined) {
    if (typeof body.horario_inicio !== 'string' || !HORARIO_RE.test(body.horario_inicio)) {
      return NextResponse.json({ error: 'horario_inicio precisa estar no formato HH:MM.' }, { status: 400 })
    }
    patch.horario_inicio = body.horario_inicio
  }

  if (body.horario_fim !== undefined) {
    if (typeof body.horario_fim !== 'string' || !HORARIO_RE.test(body.horario_fim)) {
      return NextResponse.json({ error: 'horario_fim precisa estar no formato HH:MM.' }, { status: 400 })
    }
    patch.horario_fim = body.horario_fim
  }

  if (body.limite_diario !== undefined) {
    const valido = body.limite_diario === null || (Number.isInteger(body.limite_diario) && body.limite_diario > 0)
    if (!valido) {
      return NextResponse.json({ error: 'limite_diario precisa ser um número inteiro positivo ou null (sem limite).' }, { status: 400 })
    }
    patch.limite_diario = body.limite_diario
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo válido para atualizar.' }, { status: 400 })
  }

  const client = sb()

  // Estado anterior pra registrar em automacao_historico — best-effort, não
  // bloqueia o update se a leitura falhar (ex.: tabela ainda sem a linha).
  const { data: antes } = await client.from('automacao_config').select('*').eq('id', true).maybeSingle()

  patch.atualizado_em = new Date().toISOString()
  const { data: depois, error } = await client
    .from('automacao_config')
    .update(patch)
    .eq('id', true)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    await client.from('automacao_historico').insert({
      tipo: 'config',
      payload_antes: antes ?? null,
      payload_depois: depois,
    })
  } catch (err) {
    logWarn(SOURCE, 'automacao_historico insert falhou (config atualizada normalmente)', {
      error: err instanceof Error ? err.message : String(err),
    })
  }

  return NextResponse.json({ data: depois })
}
