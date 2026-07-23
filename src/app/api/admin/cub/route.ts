import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autenticado } from '@/lib/dashboard/auth-check'
import { competenciaLabelFromChave, statusAtualizacaoCub } from '@/lib/dashboard/cub-fonte-unica'

export const dynamic = 'force-dynamic'

function sb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// GET /api/admin/cub — retorna o CUB vigente e historico. Esta é A fonte
// única de verdade que Home/CRM/Financeiro devem consultar — antes cada
// tela formatava a competência com sua própria chamada a `new Date(...)`,
// e o CRM sofria um bug real de fuso horário nisso (competência aparecia um
// mês atrasada). `competencia_label`/`status_atualizacao` agora vêm PRONTOS
// do servidor, calculados uma única vez com src/lib/dashboard/cub-fonte-unica.ts.
export async function GET() {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb()
    .from('configuracoes_cub')
    .select('*')
    .order('mes_referencia', { ascending: false })
    .limit(24)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const vigenteRaw = data?.[0] ?? null
  const vigente = vigenteRaw
    ? {
        ...vigenteRaw,
        competencia_label: competenciaLabelFromChave(vigenteRaw.mes_referencia),
        status_atualizacao: statusAtualizacaoCub(vigenteRaw.mes_referencia),
      }
    : null

  return NextResponse.json({ data, vigente })
}

// POST /api/admin/cub — cria ou atualiza o CUB do mes
export async function POST(req: NextRequest) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
