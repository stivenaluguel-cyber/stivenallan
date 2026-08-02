import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { agruparEspelho, expiraEm, resumoEspelho, type UnidadeEspelho } from '@/lib/unidades/espelho'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const SOURCE = 'api/admin/espelho'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// GET /api/admin/espelho?empreendimento_id=...
//
// Visão INTERNA: traz tudo (condições de negociação, lead da reserva,
// cub_fator) já agrupado em grade por bloco/andar. Sem o parâmetro, devolve
// só a lista de empreendimentos com contagem, para o seletor da tela.
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const empId = url.searchParams.get('empreendimento_id')
  const client = sb()

  // ?vendidas=1 — RELATÓRIO consolidado, todas as unidades vendidas de todos
  // os empreendimentos, da mais recente para a mais antiga.
  //
  // Existe porque a página pública deixou de mostrar a vendida (o cliente não
  // precisa saber qual foi) mas o corretor precisa: é como ele acompanha o
  // giro do estoque mês a mês.
  if (url.searchParams.get('vendidas') === '1') {
    const [{ data: vendidas, error: erroV }, { data: emps }] = await Promise.all([
      client.from('empreendimentos_unidades')
        .select('id, empreendimento_id, bloco, unidade, metragem, dormitorios, valor_tabela, vendida_em')
        .eq('disponivel', false)
        .order('vendida_em', { ascending: false, nullsFirst: false }),
      client.from('empreendimentos').select('id, nome'),
    ])
    if (erroV) {
      logError(SOURCE, 'falha ao listar vendidas', erroV)
      return NextResponse.json({ error: erroV.message }, { status: 500 })
    }
    const nome = new Map((emps ?? []).map((e) => [e.id as string, e.nome as string]))
    const lista = (vendidas ?? []).map((u) => ({
      id: u.id as string,
      empreendimento: nome.get(u.empreendimento_id as string) ?? '—',
      bloco: u.bloco as string | null,
      unidade: u.unidade as string,
      metragem: Number(u.metragem),
      dormitorios: u.dormitorios as number | null,
      valor_tabela: u.valor_tabela === null ? null : Number(u.valor_tabela),
      // Nulo nas que foram baixadas antes desta coluna existir.
      vendida_em: (u.vendida_em as string | null) ?? null,
    }))
    return NextResponse.json({
      vendidas: lista,
      total: lista.length,
      valorTotal: lista.reduce((s, u) => s + (u.valor_tabela ?? 0), 0),
    })
  }

  if (!empId) {
    const [{ data: emps }, { data: contagem }] = await Promise.all([
      client.from('empreendimentos').select('id, nome, slug').order('nome'),
      client.from('empreendimentos_unidades').select('empreendimento_id'),
    ])
    const porEmp = new Map<string, number>()
    for (const u of contagem ?? []) {
      const k = u.empreendimento_id as string
      porEmp.set(k, (porEmp.get(k) ?? 0) + 1)
    }
    return NextResponse.json({
      empreendimentos: (emps ?? []).map((e) => ({ ...e, unidades: porEmp.get(e.id as string) ?? 0 })),
    })
  }

  const [{ data: unidades, error }, { data: cub }] = await Promise.all([
    client.from('empreendimentos_unidades').select('*').eq('empreendimento_id', empId),
    client.from('configuracoes_cub').select('valor_m2, mes_referencia')
      .order('mes_referencia', { ascending: false }).limit(1).maybeSingle(),
  ])

  if (error) {
    logError(SOURCE, 'falha ao listar unidades', error, { empId })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const lista = (unidades ?? []) as UnidadeEspelho[]
  const agora = new Date()

  // Nomes dos leads que têm reserva vigente — o corretor precisa saber DE QUEM
  // é a reserva, senão o status "reservada" não serve para nada.
  const idsLead = [...new Set(lista.map((u) => u.lead_id_reserva).filter((x): x is string => !!x))]
  const nomePorLead = new Map<string, string>()
  if (idsLead.length > 0) {
    const { data: leads } = await client.from('leads').select('id, nome, whatsapp').in('id', idsLead)
    for (const l of leads ?? []) {
      nomePorLead.set(l.id as string, (l.nome as string) || (l.whatsapp as string) || 'lead')
    }
  }

  return NextResponse.json({
    grade: agruparEspelho(lista),
    resumo: resumoEspelho(lista, agora),
    cub_vigente: cub?.valor_m2 ? Number(cub.valor_m2) : null,
    cub_competencia: cub?.mes_referencia ?? null,
    nomesReserva: Object.fromEntries(nomePorLead),
  })
}

const ACOES = ['reservar', 'liberar', 'vender', 'disponibilizar'] as const
type Acao = (typeof ACOES)[number]

// PATCH /api/admin/espelho — { unidade_id, acao, lead_id?, horas? }
//
// Ações nomeadas em vez de update livre de colunas: "vender" e "liberar
// reserva" mexem em campos diferentes, e deixar o cliente escolher as colunas
// abriria espaço para marcar vendida sem limpar a reserva (ou o contrário),
// deixando a unidade num estado que a interface não sabe representar.
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const unidadeId = typeof body?.unidade_id === 'string' ? body.unidade_id : null
  const acao = typeof body?.acao === 'string' ? body.acao : null

  if (!unidadeId) return NextResponse.json({ error: 'unidade_id obrigatório' }, { status: 400 })
  if (!acao || !(ACOES as readonly string[]).includes(acao)) {
    return NextResponse.json({ error: `acao deve ser uma de: ${ACOES.join(', ')}` }, { status: 400 })
  }

  const agora = new Date()
  const update: Record<string, unknown> = { updated_at: agora.toISOString() }

  switch (acao as Acao) {
    case 'reservar': {
      const leadId = typeof body.lead_id === 'string' && body.lead_id ? body.lead_id : null
      if (!leadId) return NextResponse.json({ error: 'lead_id obrigatório para reservar' }, { status: 400 })
      const horas = Number.isFinite(Number(body.horas)) && Number(body.horas) > 0 ? Number(body.horas) : undefined
      update.reservado_ate = expiraEm(agora, horas)
      update.lead_id_reserva = leadId
      break
    }
    case 'liberar':
      // Limpa os DOIS campos: deixar `lead_id_reserva` órfão sugeriria uma
      // reserva que não existe mais.
      update.reservado_ate = null
      update.lead_id_reserva = null
      break
    case 'vender':
      update.disponivel = false
      // A DATA da venda, não só o fato: é o que sustenta o relatório de giro
      // do estoque. `updated_at` não serviria — muda em toda reimportação de
      // tabela, que acontece todo mês em todas as unidades.
      update.vendida_em = agora.toISOString()
      // A reserva cumpriu o papel; manter o carimbo faria a unidade aparecer
      // como "vendida e reservada" ao mesmo tempo.
      update.reservado_ate = null
      break
    case 'disponibilizar':
      update.disponivel = true
      // Baixa feita por engano: a data sai junto, senão a unidade voltaria
      // disponível e continuaria no relatório de vendas.
      update.vendida_em = null
      update.reservado_ate = null
      update.lead_id_reserva = null
      break
  }

  const client = sb()
  const { data, error } = await client
    .from('empreendimentos_unidades')
    .update(update)
    .eq('id', unidadeId)
    .select('*')
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Unidade não encontrada' }, { status: 404 })

  return NextResponse.json({ data })
}
