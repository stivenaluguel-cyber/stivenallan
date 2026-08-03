import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { cruzarPermuta, type UnidadeParaPermuta } from '@/lib/unidades/permutas'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const SOURCE = 'api/admin/permutas'

// Quantas combinações voltam por lead. Sem teto, um lead com permuta alta
// casaria com quase as 576 unidades e a tela viraria um paredão inútil.
const MAX_POR_LEAD = 12

// GET /api/admin/permutas
//
// Todo lead que ofereceu imóvel na troca, com as unidades onde aquilo cabe.
export async function GET(_req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = sb()

  const [leads, unidades] = await Promise.all([
    client
      .from('leads')
      .select('id, nome, whatsapp, estagio_funil, permuta_descricao, permuta_valor')
      .not('permuta_valor', 'is', null)
      .order('permuta_valor', { ascending: false }),
    client
      .from('empreendimentos_unidades')
      .select('id, bloco, unidade, valor_tabela, valor_entrada_min, plano_pagamento, disponivel, vendida_em, empreendimentos(nome, slug)')
      .eq('disponivel', true)
      .is('vendida_em', null),
  ])

  for (const [nome, r] of [['leads', leads], ['unidades', unidades]] as const) {
    if (r.error) {
      logError(SOURCE, `falha ao buscar ${nome}`, r.error)
      return NextResponse.json({ error: 'Falha ao montar o cruzamento de permutas' }, { status: 500 })
    }
  }

  type LinhaUnidade = {
    id: string; bloco: string | null; unidade: string | null
    valor_tabela: number | null; valor_entrada_min: number | null
    plano_pagamento: UnidadeParaPermuta['plano_pagamento']
    empreendimentos?: { nome: string; slug: string } | null
  }

  const normalizadas: UnidadeParaPermuta[] = ((unidades.data ?? []) as unknown as LinhaUnidade[]).map((u) => ({
    id: u.id,
    // O identificador que o corretor fala é "bloco + unidade"; só o número
    // repete entre torres e não diz nada sozinho.
    identificador: [u.bloco, u.unidade].filter(Boolean).join(' ') || '—',
    empreendimento_nome: u.empreendimentos?.nome ?? null,
    empreendimento_slug: u.empreendimentos?.slug ?? null,
    valor_tabela: u.valor_tabela,
    valor_entrada_min: u.valor_entrada_min,
    plano_pagamento: u.plano_pagamento,
    status: 'disponivel',
  }))

  const itens = (leads.data ?? []).map((l) => {
    const todas = cruzarPermuta(Number(l.permuta_valor), normalizadas)
    return {
      lead: {
        id: l.id, nome: l.nome, whatsapp: l.whatsapp, estagio_funil: l.estagio_funil,
        permuta_descricao: l.permuta_descricao, permuta_valor: Number(l.permuta_valor),
      },
      total: todas.length,
      combinacoes: todas.slice(0, MAX_POR_LEAD),
    }
  })

  return NextResponse.json({
    itens,
    unidadesConsideradas: normalizadas.length,
    // A tela mostra que a lista é um recorte — "12 de 340" evita a leitura de
    // que só existem 12 opções.
    maxPorLead: MAX_POR_LEAD,
  })
}
