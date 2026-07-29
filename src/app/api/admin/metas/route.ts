import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { calcularProgresso, mensagemDoDia, normalizarMetas, normalizarResumo } from '@/lib/dashboard/metas-diarias'
import { hojeEmSaoPaulo, horaEmSaoPaulo } from '@/lib/dashboard/timezone-sp'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const SOURCE = 'api/admin/metas'

const TIPOS_MANUAIS = new Set(['conteudo', 'reuniao_presencial'])

// GET — progresso do dia. Contatos/follow-ups/visitas vêm da RPC
// resumo_atividades_dia, que lê os eventos que o sistema já grava; o
// corretor não digita nada disso.
export async function GET(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const data = searchParams.get('data') || hojeEmSaoPaulo()
  const client = sb()

  const [{ data: metaRow }, { data: resumoRpc, error: rpcError }] = await Promise.all([
    client.from('crm_metas_diarias').select('*').eq('admin_id', adminId).maybeSingle(),
    client.rpc('resumo_atividades_dia', { p_admin_id: adminId, p_data: data }),
  ])

  if (rpcError) {
    logError(SOURCE, 'falha ao agregar atividades do dia', rpcError, { data })
    return NextResponse.json({ error: 'Falha ao calcular o progresso do dia' }, { status: 500 })
  }

  // Sem configuração salva, vale o padrão — o painel funciona no primeiro
  // acesso, sem exigir setup.
  const metas = metaRow?.ativo === false ? { novos_contatos: 0, followups: 0, visitas: 0, conteudos: 0, reunioes: 0 } : normalizarMetas(metaRow)
  const resumo = normalizarResumo(resumoRpc as Record<string, unknown> | null)
  const progresso = calcularProgresso(resumo, metas)

  return NextResponse.json({
    data,
    metas,
    resumo,
    progresso,
    mensagem: mensagemDoDia(progresso, horaEmSaoPaulo()),
    configurado: !!metaRow,
  })
}

// PATCH — ajusta as metas do corretor. Zero desliga o acompanhamento
// daquela atividade.
export async function PATCH(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })

  const metas = normalizarMetas(body)
  const ativo = typeof body.ativo === 'boolean' ? body.ativo : true

  const { data, error } = await sb()
    .from('crm_metas_diarias')
    .upsert({ admin_id: adminId, ...metas, ativo, updated_at: new Date().toISOString() }, { onConflict: 'admin_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST — registra o que o sistema não tem como observar: vídeo publicado e
// reunião presencial. Idempotente por (admin, dia, tipo): reenviar o mesmo
// dia substitui a quantidade em vez de somar duas vezes.
export async function POST(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })

  const tipo = String(body.tipo ?? '')
  if (!TIPOS_MANUAIS.has(tipo)) {
    return NextResponse.json(
      { error: 'tipo deve ser "conteudo" ou "reuniao_presencial" — as demais atividades são derivadas automaticamente' },
      { status: 400 },
    )
  }

  const quantidade = Number(body.quantidade ?? 1)
  if (!Number.isFinite(quantidade) || quantidade < 0) {
    return NextResponse.json({ error: 'quantidade deve ser um número >= 0' }, { status: 400 })
  }

  const data = typeof body.data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.data) ? body.data : hojeEmSaoPaulo()

  const { data: row, error } = await sb()
    .from('crm_atividades_manuais')
    .upsert(
      { admin_id: adminId, data, tipo, quantidade: Math.floor(quantidade), observacao: typeof body.observacao === 'string' ? body.observacao.slice(0, 500) : null, updated_at: new Date().toISOString() },
      { onConflict: 'admin_id,data,tipo' },
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: row }, { status: 201 })
}
