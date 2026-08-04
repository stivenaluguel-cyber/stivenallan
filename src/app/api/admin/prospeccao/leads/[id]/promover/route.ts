import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { normalizePhone, pareceCelularBR, PJ_WHATSAPP_PLACEHOLDER_PREFIX } from '@/lib/leads/normalize'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

function montarAnotacoes(prospeccaoLead: { endereco: string | null; contexto_ia: string | null }, nomeCampanha: string): string {
  const partes = ['Promovido da Prospecção — campanha "' + nomeCampanha + '".']
  if (prospeccaoLead.contexto_ia) partes.push(prospeccaoLead.contexto_ia)
  if (prospeccaoLead.endereco) partes.push(prospeccaoLead.endereco)
  return partes.join(' ')
}

/**
 * Promove um resultado de Prospecção para um lead de verdade em `leads`.
 *
 * Idempotente: chamar de novo num resultado já promovido devolve o mesmo
 * lead_id em vez de tentar criar outro — o botão "Promover" na tela não
 * precisa se preocupar com clique duplo.
 *
 * Telefone de empresa (Google Places) costuma ser fixo, que não recebe
 * WhatsApp. Só grava o número real em `leads.whatsapp` quando ele TEM CARA
 * de celular (11 dígitos, 9 na terceira posição) — senão grava um
 * placeholder reconhecível (`pj:<place_id>`), o mesmo mecanismo que já
 * existe pra lead de DM do Instagram sem telefone. `temWhatsappReal()`
 * continua sendo o jeito certo de checar isso em qualquer tela.
 */
export async function POST(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const client = sb()
  const { data: prospeccaoLead } = await client.from('prospeccao_leads').select('*, prospeccao_campanhas(nome)').eq('id', id).single()
  if (!prospeccaoLead) return NextResponse.json({ error: 'Resultado nao encontrado' }, { status: 404 })

  if (prospeccaoLead.lead_id) {
    return NextResponse.json({ lead_id: prospeccaoLead.lead_id, ja_promovido: true })
  }

  const digitos = normalizePhone(prospeccaoLead.telefone)
  const whatsapp = digitos && pareceCelularBR(digitos) ? digitos : PJ_WHATSAPP_PLACEHOLDER_PREFIX + prospeccaoLead.place_id

  const nomeCampanha = (prospeccaoLead as { prospeccao_campanhas?: { nome?: string } }).prospeccao_campanhas?.nome ?? 'Prospecção'

  const novoLead = {
    whatsapp,
    nome: prospeccaoLead.nome,
    origem: 'Prospecção',
    source: 'prospeccao',
    estagio_funil: 'primeiro_contato',
    status: 'novo',
    anotacoes: montarAnotacoes(prospeccaoLead, nomeCampanha),
  }

  const { data: leadCriado, error } = await client.from('leads').insert(novoLead).select('id').single()

  let leadId: string
  if (error) {
    // 23505 = já existe um lead com esse whatsapp — pode ser coincidência de
    // telefone entre dois candidatos, ou essa empresa já é lead por outro
    // canal. Em vez de falhar, liga este resultado ao lead que já existe.
    if (error.code === '23505') {
      const { data: existente } = await client.from('leads').select('id').eq('whatsapp', whatsapp).maybeSingle()
      if (!existente) return NextResponse.json({ error: error.message }, { status: 500 })
      leadId = existente.id
    } else {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    leadId = leadCriado!.id
  }

  await client.from('prospeccao_leads').update({ lead_id: leadId, status: 'promovido' }).eq('id', id)

  return NextResponse.json({ lead_id: leadId, ja_promovido: false })
}
