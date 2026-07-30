import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { paraUnidadeDoBanco, parsearTabelaFontana } from '@/lib/unidades/importar-tabela-fontana'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const SOURCE = 'api/admin/unidades/importar'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

/**
 * POST /api/admin/unidades/importar
 *   { empreendimento_id, texto, confirmar?, ignorarCubDivergente? }
 *
 * Importa uma tabela de vendas da Fontana para o espelho. O texto é o conteúdo
 * do PDF do Drive.
 *
 * Duas travas antes de gravar:
 *
 * 1. PRÉVIA por padrão. Sem `confirmar: true`, devolve o plano e não escreve.
 *    Isso mexe em PREÇO de imóvel — um erro aqui vira proposta com valor errado.
 * 2. CUB CONFERIDO. Se o CUB impresso na tabela não bate com o do sistema, a
 *    importação PARA. Os valores da tabela são múltiplos exatos do CUB do mês;
 *    importar tabela de julho com o CUB de maio no sistema deixaria o espelho
 *    e o simulador discordando entre si. Dá para prosseguir de propósito com
 *    `ignorarCubDivergente: true`, mas nunca por acidente.
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const empId = typeof body?.empreendimento_id === 'string' ? body.empreendimento_id : null
  const texto = typeof body?.texto === 'string' ? body.texto : ''

  if (!empId) return NextResponse.json({ error: 'empreendimento_id obrigatório' }, { status: 400 })
  if (texto.trim().length < 200) {
    return NextResponse.json({ error: 'texto da tabela ausente ou muito curto' }, { status: 400 })
  }

  const client = sb()

  const { data: emp } = await client
    .from('empreendimentos')
    .select('id, nome')
    .eq('id', empId)
    .maybeSingle()
  if (!emp) return NextResponse.json({ error: 'Empreendimento não encontrado' }, { status: 404 })

  const { data: cubRow } = await client
    .from('configuracoes_cub')
    .select('valor_m2, mes_referencia')
    .order('mes_referencia', { ascending: false })
    .limit(1)
    .maybeSingle()

  const cubSistema = cubRow?.valor_m2 ? Number(cubRow.valor_m2) : null
  const r = parsearTabelaFontana(texto, cubSistema)

  if (r.unidades.length === 0) {
    return NextResponse.json(
      { error: 'Nenhuma unidade válida na tabela', rejeitadas: r.rejeitadas, cabecalho: r.cabecalho },
      { status: 400 },
    )
  }

  // O que já existe no espelho — para a prévia dizer o que é novo e o que é
  // atualização de preço, em vez de só "54 unidades".
  const { data: existentes } = await client
    .from('empreendimentos_unidades')
    .select('unidade, valor_tabela, disponivel')
    .eq('empreendimento_id', empId)

  const porUnidade = new Map(
    (existentes ?? []).map((u) => [u.unidade as string, { valor: Number(u.valor_tabela), disponivel: u.disponivel as boolean }]),
  )

  const novas = r.unidades.filter((u) => !porUnidade.has(u.unidade))
  const alteradas = r.unidades.filter((u) => {
    const atual = porUnidade.get(u.unidade)
    return atual !== undefined && Math.abs(atual.valor - u.valor_tabela) > 0.01
  })
  // Unidade já marcada como vendida não volta a ficar disponível por causa de
  // uma reimportação — a tabela da construtora não sabe o que você já vendeu.
  const vendidasPreservadas = r.unidades.filter((u) => porUnidade.get(u.unidade)?.disponivel === false)

  const plano = {
    empreendimento: emp.nome,
    cabecalho: r.cabecalho,
    conferenciaCub: r.conferenciaCub,
    total: r.unidades.length,
    novas: novas.length,
    alteradas: alteradas.length,
    inalteradas: r.unidades.length - novas.length - alteradas.length,
    vendidasPreservadas: vendidasPreservadas.map((u) => u.unidade),
    rejeitadas: r.rejeitadas,
    faixaPreco: {
      min: Math.min(...r.unidades.map((u) => u.valor_tabela)),
      max: Math.max(...r.unidades.map((u) => u.valor_tabela)),
    },
    amostra: r.unidades.slice(0, 3),
  }

  if (body?.confirmar !== true) {
    return NextResponse.json({ simulado: true, ...plano })
  }

  if (r.conferenciaCub.confere === false && body?.ignorarCubDivergente !== true) {
    return NextResponse.json(
      {
        error:
          `CUB divergente: a tabela foi feita com R$ ${r.conferenciaCub.impresso?.toFixed(2)} ` +
          `e o sistema tem R$ ${r.conferenciaCub.sistema?.toFixed(2)}. ` +
          'Atualize o CUB em /dashboard/financeiro ou envie ignorarCubDivergente: true.',
        conferenciaCub: r.conferenciaCub,
      },
      { status: 409 },
    )
  }

  const linhas = r.unidades.map((u) => {
    const linha = paraUnidadeDoBanco(u, empId, r.cabecalho.financiamento_direto, r.cabecalho.opcoes_pagamento)
    // Preserva o que a tabela da construtora não sabe.
    if (porUnidade.get(u.unidade)?.disponivel === false) linha.disponivel = false
    return linha
  })

  // Upsert pela chave natural que já existe no schema
  // (empreendimentos_unidades_empreendimento_id_unidade_key): reimportar a
  // tabela do mês seguinte ATUALIZA preço em vez de duplicar unidade.
  const { data, error } = await client
    .from('empreendimentos_unidades')
    .upsert(linhas, { onConflict: 'empreendimento_id,unidade' })
    .select('id')

  if (error) {
    logError(SOURCE, 'falha ao importar unidades', error, { empId, quantidade: linhas.length })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ importadas: (data ?? []).length, ...plano }, { status: 201 })
}
