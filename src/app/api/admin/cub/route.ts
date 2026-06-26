import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function sb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

async function auth() {
  const store = await cookies()
  const token = store.get('dashboard_token')?.value
  if (!token) return false
  try { await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!)); return true } catch { return false }
}

// GET /api/admin/cub — retorna o CUB vigente e historico
export async function GET() {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb()
    .from('configuracoes_cub')
    .select('*')
    .order('mes_referencia', { ascending: false })
    .limit(24)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, vigente: data?.[0] ?? null })
}

// POST /api/admin/cub — cria ou atualiza o CUB do mes
export async function POST(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { mes_referencia, valor_m2, variacao_mensal, variacao_anual, notas } = body
  if (!mes_referencia || !valor_m2) return NextResponse.json({ error: 'mes_referencia e valor_m2 obrigatorios' }, { status: 400 })

  // Normaliza para primeiro dia do mes
  const mesNorm = mes_referencia.substring(0, 7) + '-01'

  const { data, error } = await sb()
    .from('configuracoes_cub')
    .upsert({ mes_referencia: mesNorm, valor_m2, variacao_mensal, variacao_anual, notas, updated_at: new Date().toISOString() }, { onConflict: 'mes_referencia' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
