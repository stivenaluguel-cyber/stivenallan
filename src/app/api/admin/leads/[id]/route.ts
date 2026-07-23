import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { sendMetaCapiEvent } from '@/lib/meta-capi'
import { ESTAGIO_META_EVENT } from '@/lib/dashboard/estagios'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function auth() {
  const s = await cookies(); const t = s.get('dashboard_token')?.value; if (!t) return false
  try { await jwtVerify(t, new TextEncoder().encode(process.env.JWT_SECRET!)); return true } catch { return false }
}

type Params = { params: Promise<{ id: string }> }

// Loga a transição no histórico do lead (relatório de conversão por etapa)
// e dispara o evento correspondente pro Meta CAPI — todo avanço real de
// estágio no Kanban vira sinal de otimização pro Gerenciador de Anúncios,
// não só o Lead inicial do formulário. Fire-and-forget: uma falha no CAPI
// (ex: token ausente, Graph API fora do ar) nunca deve impedir o corretor
// de mover o card no Kanban.
async function registrarMudancaEstagio(id: string, estagioDe: string, estagioPara: string) {
  const client = sb()
  await client.from('leads_interacoes').insert({ lead_id: id, tipo: 'status_change', descricao: 'Movido de ' + estagioDe + ' para ' + estagioPara, estagio_de: estagioDe, estagio_para: estagioPara })

  const eventName = ESTAGIO_META_EVENT[estagioPara as keyof typeof ESTAGIO_META_EVENT]
  if (!eventName) return
  const { data: lead } = await client.from('leads').select('nome, whatsapp, email, fbclid').eq('id', id).single()
  if (!lead?.nome || !lead?.whatsapp) return
  sendMetaCapiEvent({
    eventName,
    eventId: randomUUID(),
    nome: lead.nome,
    telefone: lead.whatsapp,
    email: lead.email,
    fbclid: lead.fbclid,
  }).then((result) => {
    if (!result.ok && !('skipped' in result)) logError('admin/leads/registrarMudancaEstagio', 'capi falhou', new Error(result.error))
  }).catch((err) => logError('admin/leads/registrarMudancaEstagio', 'capi exception', err))
}

export async function GET(_req: NextRequest, { params }: Params) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { data, error } = await sb().from('leads').select('*, empreendimentos(nome, slug), leads_interacoes(*)').eq('id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Lead nao encontrado' }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  body.updated_at = new Date().toISOString()
  if (body.estagio_funil) {
    const { data: lead } = await sb().from('leads').select('estagio_funil').eq('id', id).single()
    if (lead && lead.estagio_funil !== body.estagio_funil) {
      await registrarMudancaEstagio(id, lead.estagio_funil, body.estagio_funil)
    }
  }
  const { data, error } = await sb().from('leads').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const allowed = ['estagio_funil','lead_score','requer_atencao','notas','temperatura','kanban_ordem','anotacoes','nome','whatsapp','email','origem','orcamento_max','atendimento_humano_ativo']
  // Loga a transição de estágio (mesma lógica do PUT acima) — o Kanban
  // arrasta-e-solta usa PATCH, então sem isso o relatório de funil nunca
  // teria histórico de mudança de estágio.
  if (body.estagio_funil) {
    const { data: lead } = await sb().from('leads').select('estagio_funil').eq('id', id).single()
    if (lead && lead.estagio_funil !== body.estagio_funil) {
      await registrarMudancaEstagio(id, lead.estagio_funil, body.estagio_funil)
    }
  }
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const k of allowed) { if (k in body) update[k] = body[k] }
  const { data, error } = await sb().from('leads').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await sb().from('leads').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
