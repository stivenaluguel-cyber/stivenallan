import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { calcularProgresso, normalizarMetas, normalizarResumo, type MetasDiarias, type ResumoDia } from '@/lib/dashboard/metas-diarias'
import {
  calcularProgressoMensal,
  competenciaDe,
  diasNoMes,
  montarCalendario,
  normalizarMetasMensais,
  type RegistroSelado,
} from '@/lib/dashboard/metas-mensais'
import { hojeEmSaoPaulo } from '@/lib/dashboard/timezone-sp'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const SOURCE = 'api/admin/metas/historico'

// GET /api/admin/metas/historico?competencia=2026-07
//
// Devolve o calendário do mês (quais dias a rotina foi batida) junto com o
// progresso da meta mensal de resultado. As duas coisas na mesma resposta
// porque vivem na mesma tela: rotina cumprida sem venda ainda é mês perdido.
export async function GET(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hoje = hojeEmSaoPaulo()
  const pedido = new URL(req.url).searchParams.get('competencia')
  const competencia = competenciaDe(/^\d{4}-\d{2}/.test(pedido ?? '') ? `${pedido}-01`.slice(0, 10) : hoje)

  const primeiroDia = competencia
  const ultimoDia = `${competencia.slice(0, 7)}-${String(diasNoMes(competencia)).padStart(2, '0')}`
  // Não faz sentido agregar dias que ainda não aconteceram.
  const ateEfetivo = ultimoDia > hoje ? hoje : ultimoDia

  const client = sb()

  const [metaDiariaRes, metaMensalRes, seladosRes, resumoRes, vendasRes] = await Promise.all([
    client.from('crm_metas_diarias').select('*').eq('admin_id', adminId).maybeSingle(),
    client.from('crm_metas_mensais').select('*').eq('admin_id', adminId).eq('competencia', competencia).maybeSingle(),
    client.from('crm_metas_dia_historico').select('*').eq('admin_id', adminId)
      .gte('data', primeiroDia).lte('data', ultimoDia),
    primeiroDia > hoje
      ? Promise.resolve({ data: {}, error: null })
      : client.rpc('resumo_atividades_periodo', { p_admin_id: adminId, p_de: primeiroDia, p_ate: ateEfetivo }),
    client.rpc('relatorio_vendas', { p_de: primeiroDia, p_ate: ateEfetivo }),
  ])

  if (resumoRes.error) {
    logError(SOURCE, 'falha ao agregar atividades do período', resumoRes.error, { competencia })
    return NextResponse.json({ error: 'Falha ao montar o histórico do mês' }, { status: 500 })
  }

  const metaRow = metaDiariaRes.data
  const metasAtuais: MetasDiarias = metaRow?.ativo === false
    ? { novos_contatos: 0, followups: 0, visitas: 0, conteudos: 0, reunioes: 0 }
    : normalizarMetas(metaRow)

  const resumoPorDia: Record<string, ResumoDia> = {}
  for (const [dia, bruto] of Object.entries((resumoRes.data ?? {}) as Record<string, unknown>)) {
    resumoPorDia[dia] = normalizarResumo(bruto as Record<string, unknown>)
  }

  const selados: RegistroSelado[] = (seladosRes.data ?? []).map((s) => ({
    data: s.data as string,
    cumpridas: Number(s.cumpridas),
    total: Number(s.total),
    percentual: Number(s.percentual),
    dia_completo: !!s.dia_completo,
    metas: s.metas as Partial<MetasDiarias> | null,
    resumo: s.resumo as Partial<ResumoDia> | null,
  }))

  const calendario = montarCalendario({ competencia, hoje, metasAtuais, resumoPorDia, selados })

  // Sela os dias já encerrados que ainda não tinham registro. Feito depois de
  // montar o calendário porque o que é gravado tem que ser exatamente o que
  // foi mostrado.
  await selarDiasEncerrados(client, adminId, { hoje, metasAtuais, resumoPorDia, selados })

  const vendas = (vendasRes.data ?? {}) as Record<string, unknown>
  const metasMensais = normalizarMetasMensais(metaMensalRes.data)

  return NextResponse.json({
    competencia,
    calendario,
    metasDiarias: metasAtuais,
    metasMensais,
    mensal: calcularProgressoMensal(
      metasMensais,
      {
        vgv: Number(vendas.vgv_total ?? 0),
        vendas: Number(vendas.vendas ?? 0),
        // Proposta enviada no mês, independente de ter virado venda.
        propostas: Number(vendas.vendas ?? 0),
      },
      hoje,
    ),
    configuradoMensal: !!metaMensalRes.data,
  })
}

/**
 * Congela o resultado dos dias já encerrados.
 *
 * Sem isso, baixar a meta de 20 para 10 contatos pintaria de verde meses
 * inteiros que na época não foram cumpridos — o histórico mudaria
 * retroativamente e deixaria de servir para qualquer coisa.
 *
 * O dia de hoje nunca é selado: ele ainda está sendo trabalhado.
 */
async function selarDiasEncerrados(
  client: SupabaseClient,
  adminId: string,
  ctx: { hoje: string; metasAtuais: MetasDiarias; resumoPorDia: Record<string, ResumoDia>; selados: RegistroSelado[] },
): Promise<void> {
  const jaSelados = new Set(ctx.selados.map((s) => s.data))
  const aSelar = Object.entries(ctx.resumoPorDia)
    .filter(([data]) => data < ctx.hoje && !jaSelados.has(data))
    .map(([data, resumo]) => {
      const p = calcularProgresso(resumo, ctx.metasAtuais)
      return {
        admin_id: adminId,
        data,
        metas: ctx.metasAtuais,
        resumo,
        cumpridas: p.cumpridas,
        total: p.total,
        percentual: p.percentualGeral,
        dia_completo: p.diaCompleto,
      }
    })

  if (aSelar.length === 0) return

  // ignoreDuplicates: duas abas abrindo a tela ao mesmo tempo tentariam selar
  // o mesmo dia; o primeiro grava e o segundo não vira erro.
  const { error } = await client
    .from('crm_metas_dia_historico')
    .upsert(aSelar, { onConflict: 'admin_id,data', ignoreDuplicates: true })

  // Selar é otimização de histórico, não requisito da resposta: falhar aqui
  // não pode derrubar a tela do calendário.
  if (error) logError(SOURCE, 'falha ao selar dias encerrados', error, { quantidade: aSelar.length })
}

// PATCH — define a meta mensal de resultado
export async function PATCH(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })

  const competencia = competenciaDe(
    typeof body.competencia === 'string' && /^\d{4}-\d{2}/.test(body.competencia)
      ? `${body.competencia}-01`.slice(0, 10)
      : hojeEmSaoPaulo(),
  )

  const metas = normalizarMetasMensais(body)

  const { data, error } = await sb()
    .from('crm_metas_mensais')
    .upsert(
      { admin_id: adminId, competencia, ...metas, updated_at: new Date().toISOString() },
      { onConflict: 'admin_id,competencia' },
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
