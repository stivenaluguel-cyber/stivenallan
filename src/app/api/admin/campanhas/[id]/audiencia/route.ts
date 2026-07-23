import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { filtrarLeadsPorSegmento, parseSegmento, type LeadParaSegmento } from '@/lib/campanhas/segmento'
import { autenticado } from '@/lib/dashboard/auth-check'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

// GET ?segmento=<json> — pré-visualiza a audiência de um segmento ainda não
// salvo (o editor chama isso a cada toggle de checkbox). Sem o parâmetro,
// usa o segmento já salvo da campanha.
export async function GET(req: NextRequest, { params }: Params) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const segmentoParam = req.nextUrl.searchParams.get('segmento')
  let segmento
  if (segmentoParam) {
    try { segmento = parseSegmento(JSON.parse(segmentoParam)) } catch { return NextResponse.json({ error: 'segmento inválido' }, { status: 400 }) }
  } else {
    const { data: campanha } = await sb().from('campanhas').select('segmento').eq('id', id).single()
    if (!campanha) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
    segmento = parseSegmento(campanha.segmento)
  }

  type LeadComNome = LeadParaSegmento & { nome: string | null }
  const { data: leads, error } = await sb()
    .from('leads')
    .select('id, email, estagio_funil, temperatura, origem, cidade_interesse, unsubscribed_at, nome')
    .not('email', 'is', null)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const correspondentes = filtrarLeadsPorSegmento((leads ?? []) as LeadComNome[], segmento) as LeadComNome[]

  return NextResponse.json({
    total: correspondentes.length,
    preview: correspondentes.slice(0, 20).map((l) => ({ id: l.id, nome: l.nome, email: l.email })),
    // Não é segredo (é literalmente o remetente que o destinatário vê na
    // caixa de entrada) — exposto pra confirmação mostrar "de quem" antes de enviar.
    remetente: process.env.RESEND_FROM ?? null,
  })
}
