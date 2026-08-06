import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { calcularProgresso, mensagemDoDia, normalizarMetas, normalizarResumo } from '@/lib/dashboard/metas-diarias'
import { hojeEmSaoPaulo, horaEmSaoPaulo } from '@/lib/dashboard/timezone-sp'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const SOURCE = 'api/admin/metas'

// tipo no banco === chave em ATIVIDADES, exceto estes dois legados (nome
// veio antes de existir a chave 'conteudos'/'reunioes' em metas-diarias.ts).
const CHAVE_PARA_TIPO: Record<string, string> = { conteudos: 'conteudo', reunioes: 'reuniao_presencial' }
const TIPO_PARA_CHAVE: Record<string, string> = Object.fromEntries(Object.entries(CHAVE_PARA_TIPO).map(([c, t]) => [t, c]))
const TIPOS_MANUAIS = new Set(['novos_contatos', 'followups', 'visitas', ...Object.values(CHAVE_PARA_TIPO)])

// GET — progresso do dia. Contatos/follow-ups/visitas vêm da RPC
// resumo_atividades_dia (eventos reais que o sistema já grava) SOMADOS a um
// eventual complemento manual — o corretor pode registrar por cima uma
// atividade real que aconteceu fora do sistema, sem que isso desligue ou
// substitua a contagem automática.
export async function GET(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const data = searchParams.get('data') || hojeEmSaoPaulo()
  const client = sb()

  const [{ data: metaRow }, { data: resumoRpc, error: rpcError }, { data: manuaisRows, error: manuaisError }] = await Promise.all([
    client.from('crm_metas_diarias').select('*').eq('admin_id', adminId).maybeSingle(),
    client.rpc('resumo_atividades_dia', { p_admin_id: adminId, p_data: data }),
    client.from('crm_atividades_manuais').select('tipo, quantidade').eq('admin_id', adminId).eq('data', data),
  ])

  if (rpcError) {
    logError(SOURCE, 'falha ao agregar atividades do dia', rpcError, { data })
    return NextResponse.json({ error: 'Falha ao calcular o progresso do dia' }, { status: 500 })
  }
  if (manuaisError) logError(SOURCE, 'falha ao buscar complemento manual do dia — seguindo sem ele', manuaisError, { data })

  // Sem configuração salva, vale o padrão — o painel funciona no primeiro
  // acesso, sem exigir setup.
  const metas = metaRow?.ativo === false ? { novos_contatos: 0, followups: 0, visitas: 0, conteudos: 0, reunioes: 0 } : normalizarMetas(metaRow)
  const resumo = normalizarResumo(resumoRpc as Record<string, unknown> | null)

  const resumoManual: Record<string, number> = {}
  for (const row of manuaisRows ?? []) {
    const chave = TIPO_PARA_CHAVE[row.tipo as string] ?? (row.tipo as string)
    resumoManual[chave] = Number(row.quantidade) || 0
  }

  const progresso = calcularProgresso(resumo, metas, resumoManual)

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

// POST — registra manualmente uma atividade do dia. Pra conteúdo/reunião
// (que o sistema nunca vê) é o total; pras 3 automáticas, é um COMPLEMENTO
// somado por cima da contagem real — não substitui o que o sistema mediu
// sozinho (ver resumo_atividades_dia). Idempotente por (admin, dia, tipo):
// reenviar o mesmo dia substitui a quantidade em vez de somar duas vezes,
// o que também é como o "desfazer" funciona (reenvia com quantidade-1).
export async function POST(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })

  const tipo = String(body.tipo ?? '')
  if (!TIPOS_MANUAIS.has(tipo)) {
    return NextResponse.json(
      { error: `tipo deve ser um de: ${[...TIPOS_MANUAIS].join(', ')}` },
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

  // Lançar atividade de um dia PASSADO ("editar outro dia") invalida o
  // registro selado daquele dia: o selo guardou o resultado calculado antes
  // deste lançamento, e sem apagá-lo o calendário continuaria mostrando o dia
  // como falhado depois de o corretor corrigir. O dia é reselado na próxima
  // abertura do calendário, já com o número novo.
  if (data < hojeEmSaoPaulo()) {
    const { error: erroSelo } = await sb()
      .from('crm_metas_dia_historico')
      .delete()
      .eq('admin_id', adminId)
      .eq('data', data)
    if (erroSelo) logError(SOURCE, 'falha ao invalidar selo do dia editado', erroSelo, { data })
  }

  return NextResponse.json({ data: row }, { status: 201 })
}
