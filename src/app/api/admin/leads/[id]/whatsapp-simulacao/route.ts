import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { montarMensagemSimulacao } from '@/lib/unidades/mensagem-espelho'
import { temWhatsappReal } from '@/lib/leads/normalize'
import type { Simulacao } from '@/lib/unidades/simular'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

/**
 * GET /api/admin/leads/[id]/whatsapp-simulacao
 *
 * Devolve a mensagem pronta e um link `wa.me` com o texto pré-preenchido, para
 * o corretor revisar e enviar com um clique.
 *
 * Por que não enviar direto: o follow-up com o cliente é manual, por opção —
 * mensagem para comprador é conversa comercial dele, não notificação de
 * sistema. Isto mantém o controle na mão dele e tira o trabalho de redigitar
 * entrada, parcela e reforço a cada lead.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const client = sb()

  const { data: lead } = await client
    .from('leads')
    .select('id, nome, whatsapp, property_name')
    .eq('id', id)
    .maybeSingle()

  if (!lead) return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })

  // Lead de DM do Instagram carrega um placeholder no lugar do telefone —
  // montar wa.me com ele geraria um link para um número que não existe.
  if (!temWhatsappReal(lead.whatsapp as string)) {
    return NextResponse.json({ error: 'Este lead ainda não tem telefone real' }, { status: 400 })
  }

  // A simulação mais recente do lead. `detalhes` guarda o objeto inteiro como
  // foi apresentado no site — é ele que reproduz a mensagem fiel ao que a
  // pessoa viu na tela.
  const { data: simulacao } = await client
    .from('crm_simulacoes')
    .select('empreendimento_nome, valor_imovel, detalhes, created_at')
    .eq('lead_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!simulacao) {
    return NextResponse.json({ error: 'Este lead não tem simulação registrada' }, { status: 404 })
  }

  const detalhes = (simulacao.detalhes ?? {}) as Record<string, unknown>
  const sim = (detalhes.simulacao ?? null) as Simulacao | null
  const unidade = typeof detalhes.unidade === 'string' ? detalhes.unidade : '—'

  // Metragem e dormitórios não vão em crm_simulacoes; vêm da unidade, quando
  // ela ainda existir no espelho.
  const { data: u } = await client
    .from('empreendimentos_unidades')
    .select('metragem, dormitorios, andar')
    .eq('unidade', unidade)
    .limit(1)
    .maybeSingle()

  const texto = montarMensagemSimulacao({
    nomeCliente: (lead.nome as string) || '',
    empreendimento: (simulacao.empreendimento_nome as string) || 'empreendimento',
    unidade,
    metragem: Number(u?.metragem ?? 0),
    dormitorios: (u?.dormitorios ?? null) as number | null,
    andar: (u?.andar ?? null) as number | null,
    simulacao: sim,
    demonstrouInteresse: false,
  })

  const numero = String(lead.whatsapp).replace(/\D/g, '')
  return NextResponse.json({
    texto,
    // 55 na frente quando o número vem só com DDD, que é como o site grava.
    url: `https://wa.me/${numero.length <= 11 ? '55' + numero : numero}?text=${encodeURIComponent(texto)}`,
    unidade,
    simuladoEm: simulacao.created_at,
  })
}
