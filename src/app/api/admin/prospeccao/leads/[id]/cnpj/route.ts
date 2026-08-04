import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { buscarCnpjPorNome } from '@/lib/prospeccao/cnpja'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

/**
 * Enriquece UM resultado da Prospecção com CNPJ + sócios, via cnpja.com.
 * Sob demanda de propósito — só roda quando o corretor pede pra esse lead
 * específico, nunca em lote pra campanha inteira (créditos são pagos, e uma
 * busca já traz até 60 candidatos brutos).
 *
 * Idempotente e econômico: se já tem `cnpj` gravado, devolve o que já está
 * no banco sem chamar a API de novo — não gasta crédito repetindo a mesma
 * consulta toda vez que o corretor reabre a ficha.
 */
export async function POST(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const client = sb()
  const { data: lead } = await client.from('prospeccao_leads').select('*').eq('id', id).single()
  if (!lead) return NextResponse.json({ error: 'Resultado nao encontrado' }, { status: 404 })

  if (lead.cnpj) {
    return NextResponse.json({
      cnpj: lead.cnpj,
      razaoSocial: lead.razao_social,
      situacao: lead.situacao_cnpj,
      socios: lead.socios ?? [],
      origem: 'cache',
    })
  }

  const resultado = await buscarCnpjPorNome(lead.nome)
  if (!resultado.ok) {
    if (resultado.skipped) return NextResponse.json({ error: 'CNPJA_API_KEY nao configurada' }, { status: 503 })
    return NextResponse.json({ error: resultado.error }, { status: 502 })
  }
  if (!resultado.dados) {
    return NextResponse.json({ error: 'Não achamos essa empresa na Receita Federal pelo nome — tente "Buscar CNPJ" manual.' }, { status: 404 })
  }

  const { dados } = resultado
  await client
    .from('prospeccao_leads')
    .update({ cnpj: dados.cnpj, razao_social: dados.razaoSocial, situacao_cnpj: dados.situacao, socios: dados.socios })
    .eq('id', id)

  return NextResponse.json({
    cnpj: dados.cnpj,
    razaoSocial: dados.razaoSocial,
    situacao: dados.situacao,
    socios: dados.socios,
    origem: 'online',
  })
}
