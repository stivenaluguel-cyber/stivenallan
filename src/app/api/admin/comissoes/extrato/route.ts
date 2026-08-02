import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { montarExtratoAnual, type LinhaComissao } from '@/lib/comissoes/extrato-anual'
import { hojeEmSaoPaulo } from '@/lib/dashboard/timezone-sp'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const SOURCE = 'api/admin/comissoes/extrato'

// GET /api/admin/comissoes/extrato?ano=2026
//
// Extrato de caixa do ano para a declaração. Traz todas as recebidas (não só
// as do ano pedido) porque a própria lista de anos disponíveis sai daí — o
// seletor precisa saber quais anos existem antes de filtrar.
export async function GET(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const anoBruto = Number(searchParams.get('ano'))
  const ano = Number.isInteger(anoBruto) && anoBruto >= 2000 && anoBruto <= 2100
    ? anoBruto
    : Number(hojeEmSaoPaulo().slice(0, 4))

  const client = sb()

  const [comissoes, meuCadastro] = await Promise.all([
    client
      .from('crm_comissoes')
      .select(`
        id, status, valor_comissao, data_recebimento, data_venda,
        leads(nome), empreendimentos(nome),
        participantes:crm_comissao_participantes(corretor_id, percentual)
      `)
      .eq('status', 'recebida')
      .order('data_recebimento', { ascending: true, nullsFirst: false }),
    // Qual corretor cadastrado é o próprio operador. Sem isso não dá para
    // separar o que ele recebeu do que passou pela conta e foi repassado.
    client.from('crm_corretores').select('id').eq('admin_id', adminId).maybeSingle(),
  ])

  if (comissoes.error) {
    logError(SOURCE, 'falha ao buscar comissões', comissoes.error, { ano })
    return NextResponse.json({ error: 'Falha ao montar o extrato' }, { status: 500 })
  }

  const linhas = (comissoes.data ?? []) as unknown as LinhaComissao[]
  const extrato = montarExtratoAnual(linhas, ano, meuCadastro.data?.id ?? null)

  return NextResponse.json({
    ...extrato,
    // A tela precisa saber se o "sua parte" é confiável ou é o bruto repetido.
    identificouCorretor: !!meuCadastro.data?.id,
    lancamentos: linhas
      .filter((l) => (l.data_recebimento ?? '').slice(0, 4) === String(ano))
      .map((l) => ({
        id: l.id,
        data_recebimento: l.data_recebimento,
        valor: Number(l.valor_comissao ?? 0),
        cliente: l.leads?.nome ?? null,
        empreendimento: l.empreendimentos?.nome ?? null,
      })),
  })
}
