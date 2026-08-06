import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { calcularMetaDiaria, resolverHojeESemana, type ResultadoMetaDiaria } from '@/lib/metas/diaria'
import { logError, logWarn } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const SOURCE = 'api/admin/meta-diaria'

const META_PADRAO = 5
const CACHE_TTL_MS = 60_000
let cache: { resultado: ResultadoMetaDiaria; expiraEm: number } | null = null

// A tabela crm_preferencias (migration 20260805230000) ainda não foi
// aplicada em produção — só em local/branch, por decisão explícita (é uma
// migration que ESCREVE dados, diferente das RPCs read-only do Score).
// Até lá (e depois, se o corretor nunca configurou nada), cai no padrão.
async function buscarMeta(client: ReturnType<typeof sb>, adminId: string): Promise<number> {
  const { data, error } = await client
    .from('crm_preferencias')
    .select('meta_diaria_followups')
    .eq('admin_id', adminId)
    .maybeSingle()

  if (error) {
    if (error.code === '42P01') {
      logWarn(SOURCE, 'crm_preferencias ainda não existe neste ambiente — usando meta padrão', { adminId })
    } else {
      logError(SOURCE, 'falha ao buscar meta diária, usando padrão', error, { adminId })
    }
    return META_PADRAO
  }

  return data?.meta_diaria_followups ?? META_PADRAO
}

/**
 * GET — progresso de hoje, fita semanal e streak. Um agregado por dia vem
 * de UMA RPC (meta_diaria_agregados, mesmo padrão do Score); a meta vem de
 * crm_preferencias. Resultado cacheado 60s.
 */
export async function GET() {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (cache && cache.expiraEm > Date.now()) {
    return NextResponse.json(cache.resultado)
  }

  const client = sb()
  const [meta, { data: contagemPorDia, error: rpcError }] = await Promise.all([
    buscarMeta(client, adminId),
    client.rpc('meta_diaria_agregados'),
  ])

  if (rpcError) {
    return NextResponse.json({ error: 'Falha ao carregar a meta diária' }, { status: 500 })
  }

  const { hoje } = resolverHojeESemana()
  const resultado = calcularMetaDiaria(hoje, meta, (contagemPorDia as Record<string, number>) ?? {})
  cache = { resultado, expiraEm: Date.now() + CACHE_TTL_MS }

  return NextResponse.json(resultado)
}

/** PATCH — ajusta a meta diária de follow-ups (0 desliga o acompanhamento). */
export async function PATCH(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const meta = Number(body?.meta_diaria_followups)
  if (!Number.isFinite(meta) || meta < 0) {
    return NextResponse.json({ error: 'meta_diaria_followups deve ser um número >= 0' }, { status: 400 })
  }

  const { data, error } = await sb()
    .from('crm_preferencias')
    .upsert({ admin_id: adminId, meta_diaria_followups: Math.floor(meta), updated_at: new Date().toISOString() }, { onConflict: 'admin_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  cache = null
  return NextResponse.json({ data })
}
