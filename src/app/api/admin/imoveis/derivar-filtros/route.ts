import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { proporFiltros } from '@/lib/imoveis/derivar-comodidades'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const SOURCE = 'api/admin/imoveis/derivar-filtros'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

/**
 * Preenche `properties.comodidades` a partir do texto de `lazer`/`diferenciais`.
 *
 * A migration criou a coluna e os filtros já sabem consultar, mas as 36 linhas
 * nasceram com array vazio — então todo filtro do catálogo devolve zero.
 *
 * GET  = prévia (não grava nada)
 * POST = aplica
 *
 * A prévia existe porque isto escreve em dado que o SITE PÚBLICO consome: uma
 * comodidade errada não é bug de painel, é promessa falsa numa página de venda.
 */
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await montarPlano())
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  // Confirmação explícita no corpo: um POST acidental (retry, duplo clique)
  // não deve escrever no catálogo público.
  if (body?.confirmar !== true) {
    return NextResponse.json(
      { error: 'Envie { confirmar: true } para aplicar. Use GET para ver a prévia.' },
      { status: 400 },
    )
  }

  const plano = await montarPlano()
  if (plano.erro) return NextResponse.json({ error: plano.erro }, { status: 500 })

  const client = sb()
  const aplicados: string[] = []
  const falhas: { nome: string; erro: string }[] = []

  for (const item of plano.itens) {
    if (!item.mudou) continue

    const update: Record<string, unknown> = { comodidades: item.comodidadesPropostas }
    // Só grava o parcelamento quando há evidência textual. `null` significa
    // "não sei" e a coluna fica como está — nunca afirmamos que NÃO tem.
    if (item.parcelamentoProposto === true) update.parcelamento_construtora = true

    const { error } = await client.from('properties').update(update).eq('id', item.id)
    if (error) falhas.push({ nome: item.nome, erro: error.message })
    else aplicados.push(item.nome)
  }

  if (falhas.length > 0) logError(SOURCE, 'falhas ao aplicar filtros', falhas)

  return NextResponse.json({
    aplicados: aplicados.length,
    nomes: aplicados,
    falhas: falhas.length ? falhas : undefined,
    resumo: plano.resumo,
  })
}

type ItemPlano = {
  id: string
  nome: string
  comodidadesAtuais: string[]
  comodidadesPropostas: string[]
  parcelamentoAtual: boolean | null
  parcelamentoProposto: boolean | null
  evidenciaParcelamento: string | null
  temTexto: boolean
  mudou: boolean
}

async function montarPlano(): Promise<{
  itens: ItemPlano[]
  resumo: {
    total: number
    comComodidade: number
    semTextoNenhum: number
    comParcelamento: number
    vaoMudar: number
  }
  erro?: string
}> {
  const vazio = { itens: [], resumo: { total: 0, comComodidade: 0, semTextoNenhum: 0, comParcelamento: 0, vaoMudar: 0 } }

  const { data, error } = await sb()
    .from('properties')
    .select('id, nome, lazer, diferenciais, comodidades, parcelamento_construtora')
    .order('nome')

  if (error) {
    logError(SOURCE, 'falha ao listar imoveis', error)
    return { ...vazio, erro: error.message }
  }

  const itens: ItemPlano[] = (data ?? []).map((p) => {
    const lazer = (p.lazer ?? []) as string[]
    const diferenciais = (p.diferenciais ?? []) as string[]
    const prop = proporFiltros({ lazer, diferenciais })
    const atuais = ((p.comodidades ?? []) as string[]).slice().sort()

    // Compara conjuntos ordenados: reexecutar a rota não deve reportar
    // mudança onde nada muda (a operação é idempotente).
    const mudouComodidades = JSON.stringify(atuais) !== JSON.stringify(prop.comodidades)
    const mudouParcelamento = prop.parcelamento_construtora === true && p.parcelamento_construtora !== true

    return {
      id: p.id as string,
      nome: p.nome as string,
      comodidadesAtuais: atuais,
      comodidadesPropostas: prop.comodidades,
      parcelamentoAtual: (p.parcelamento_construtora ?? null) as boolean | null,
      parcelamentoProposto: prop.parcelamento_construtora,
      evidenciaParcelamento: prop.evidenciaParcelamento,
      temTexto: lazer.length + diferenciais.length > 0,
      mudou: mudouComodidades || mudouParcelamento,
    }
  })

  return {
    itens,
    resumo: {
      total: itens.length,
      comComodidade: itens.filter((i) => i.comodidadesPropostas.length > 0).length,
      // Sem texto nenhum não é falha da derivação: é cadastro incompleto, e o
      // caminho é preencher lazer/diferenciais no formulário.
      semTextoNenhum: itens.filter((i) => !i.temTexto).length,
      comParcelamento: itens.filter((i) => i.parcelamentoProposto === true).length,
      vaoMudar: itens.filter((i) => i.mudou).length,
    },
  }
}
