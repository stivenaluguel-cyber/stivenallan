import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  pickPublico,
  precoMinimoDisponivel,
  resolverEmpreendimentoPorNome,
  resumoEspelho,
  type UnidadeEspelho,
} from '@/lib/unidades/espelho'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const SOURCE = 'api/espelho/[slug]'

function sb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

type Params = { params: Promise<{ slug: string }> }

// GET /api/espelho/[slug] — espelho PÚBLICO de um empreendimento.
//
// Rota anônima de propósito: é o espelho de vendas que o comprador vê antes
// de falar com alguém. Por isso passa por `pickPublico`, que recorta o que
// pode sair (nada de condição de negociação, lead da reserva ou cub_fator).
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params
  const client = sb()

  // O slug da URL é o de `properties` (o site público navega por lá), mas as
  // unidades apontam para `empreendimentos`. Os slugs divergem entre as duas
  // tabelas, então a ponte é feita pelo nome — ver
  // resolverEmpreendimentoPorNome.
  const { data: prop, error: erroProp } = await client
    .from('properties')
    .select('id, nome, slug, exibir_preco, status_venda')
    .eq('slug', slug)
    .maybeSingle()

  if (erroProp) {
    logError(SOURCE, 'falha ao buscar property', erroProp, { slug })
    return NextResponse.json({ error: 'Falha ao carregar' }, { status: 500 })
  }
  if (!prop) return NextResponse.json({ error: 'Empreendimento não encontrado' }, { status: 404 })

  const { data: emps } = await client.from('empreendimentos').select('id, nome')
  // Quem tem estoque desempata os nomes repetidos — ver
  // resolverEmpreendimentoPorNome.
  const { data: comUn } = await client.from('empreendimentos_unidades').select('empreendimento_id')
  const empId = resolverEmpreendimentoPorNome(
    prop.nome as string,
    (emps ?? []) as { id: string; nome: string }[],
    new Set((comUn ?? []).map((u) => u.empreendimento_id as string)),
  )

  // Sem espelho cadastrado não é erro: a maioria dos 36 imóveis não tem
  // unidade nenhuma. `temEspelho: false` faz a seção sumir da página.
  if (!empId) {
    return NextResponse.json({ temEspelho: false, unidades: [], resumo: null, exibirPreco: false })
  }

  const { data: unidades, error } = await client
    .from('empreendimentos_unidades')
    .select('*')
    .eq('empreendimento_id', empId)

  if (error) {
    logError(SOURCE, 'falha ao buscar unidades', error, { slug, empId })
    return NextResponse.json({ error: 'Falha ao carregar' }, { status: 500 })
  }

  const lista = (unidades ?? []) as UnidadeEspelho[]
  if (lista.length === 0) {
    return NextResponse.json({ temEspelho: false, unidades: [], resumo: null, exibirPreco: false })
  }

  const agora = new Date()
  // Empreendimento com venda encerrada não expõe preço, mesmo que a flag
  // esteja ligada — o valor deixou de ser uma oferta.
  const exibirPreco = prop.exibir_preco !== false && prop.status_venda !== 'encerrado'

  return NextResponse.json({
    temEspelho: true,
    empreendimento: { nome: prop.nome, slug: prop.slug },
    exibirPreco,
    resumo: resumoEspelho(lista, agora),
    // Âncora de preço, não a tabela: o menor valor entre as DISPONÍVEIS.
    // Preço por unidade e plano de pagamento só saem por /api/espelho/simular,
    // depois que a pessoa se identifica.
    precoMinimo: exibirPreco ? precoMinimoDisponivel(lista, agora) : null,
    unidades: lista.map((u) => pickPublico(u, agora)),
  })
}
