import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { hojeEmSaoPaulo } from '@/lib/dashboard/timezone-sp'
import { resumirParcelas, type Parcela } from '@/lib/comissoes/parcelas'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const SOURCE = 'api/admin/relatorios'

const EH_DATA = (s: string | null): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s)

// Primeiro dia do mês corrente, quando o período não vem na query.
function inicioDoMes(hoje: string): string {
  return `${hoje.slice(0, 7)}-01`
}

// GET /api/admin/relatorios?de=&ate=&diasParado=
//
// Um endpoint só para os três relatórios porque a tela mostra os três juntos:
// separar em três rotas seria três round-trips para desenhar uma página.
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const hoje = hojeEmSaoPaulo()
  const de = EH_DATA(searchParams.get('de')) ? searchParams.get('de')! : inicioDoMes(hoje)
  const ate = EH_DATA(searchParams.get('ate')) ? searchParams.get('ate')! : hoje
  if (de > ate) return NextResponse.json({ error: 'A data inicial não pode ser depois da final' }, { status: 400 })

  const diasParadoBruto = Number(searchParams.get('diasParado') ?? 3)
  const diasParado = Number.isFinite(diasParadoBruto) ? Math.max(0, Math.min(365, Math.floor(diasParadoBruto))) : 3

  const client = sb()

  const [vendas, parados, tempoMedio, parcelas] = await Promise.all([
    client.rpc('relatorio_vendas', { p_de: de, p_ate: ate }),
    client.rpc('leads_parados', { p_dias_min: diasParado, p_limite: 50 }),
    client.rpc('tempo_medio_movimentacoes', { p_de: de, p_ate: ate, p_limite: 50 }),
    // Pipeline de comissão não depende do período escolhido: a pergunta é
    // sempre "o que entra daqui para a frente".
    client.from('crm_comissao_parcelas').select('numero, valor, data_prevista, data_pagamento, status'),
  ])

  for (const [nome, r] of [
    ['relatorio_vendas', vendas],
    ['leads_parados', parados],
    ['tempo_medio_movimentacoes', tempoMedio],
    ['crm_comissao_parcelas', parcelas],
  ] as const) {
    if (r.error) {
      logError(SOURCE, `falha em ${nome}`, r.error, { de, ate })
      return NextResponse.json({ error: 'Falha ao montar os relatórios' }, { status: 500 })
    }
  }

  const listaParcelas: Parcela[] = (parcelas.data ?? []).map((p) => ({
    numero: Number(p.numero),
    valor: Number(p.valor),
    data_prevista: p.data_prevista as string,
    data_pagamento: p.data_pagamento as string | null,
    status: p.status as Parcela['status'],
  }))

  return NextResponse.json({
    periodo: { de, ate },
    vendas: vendas.data,
    leadsParados: parados.data ?? [],
    diasParado,
    tempoMedio: (tempoMedio.data ?? []).map((t: Record<string, unknown>) => ({
      ...t,
      media_horas: t.media_horas === null ? null : Number(t.media_horas),
    })),
    comissoes: resumirParcelas(listaParcelas, hoje),
  })
}
