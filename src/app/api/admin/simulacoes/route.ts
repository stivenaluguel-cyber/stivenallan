import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { normalizarSimulacao, descreverSimulacao } from '@/lib/simulador/normalizar-simulacao'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const SOURCE = 'api/admin/simulacoes'

// GET ?lead_id= — histórico de simulações do lead, mais recente primeiro.
export async function GET(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const leadId = new URL(req.url).searchParams.get('lead_id')
  if (!leadId) return NextResponse.json({ error: 'lead_id obrigatorio' }, { status: 400 })

  const { data, error } = await sb()
    .from('crm_simulacoes')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })

  const normalizado = normalizarSimulacao(body, adminId)
  if (!normalizado.ok) return NextResponse.json({ error: normalizado.erro }, { status: 400 })
  const insert = normalizado.insert

  const client = sb()

  const { data: lead } = await client.from('leads').select('id').eq('id', insert.lead_id).maybeSingle()
  if (!lead) return NextResponse.json({ error: 'Lead nao encontrado' }, { status: 404 })

  // Retry da mesma intenção devolve a simulação existente em vez de poluir
  // o histórico do lead com cópias do mesmo cenário.
  if (insert.client_event_id) {
    const { data: existente } = await client.from('crm_simulacoes').select('*').eq('client_event_id', insert.client_event_id).maybeSingle()
    if (existente) return NextResponse.json({ data: existente, alreadyExists: true })
  }

  const { data, error } = await client.from('crm_simulacoes').insert(insert).select().single()
  if (error) {
    if (error.code === '23505' && insert.client_event_id) {
      const { data: existente } = await client.from('crm_simulacoes').select('*').eq('client_event_id', insert.client_event_id).maybeSingle()
      if (existente) return NextResponse.json({ data: existente, alreadyExists: true })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Entra no histórico do lead para aparecer na timeline unificada — é o que
  // permite retomar o assunto no follow-up seguinte. Best-effort: falhar
  // aqui não invalida a simulação já salva.
  try {
    await client.from('leads_interacoes').insert({
      lead_id: insert.lead_id,
      tipo: 'simulacao',
      descricao: 'Simulação: ' + descreverSimulacao(insert),
    })
  } catch (err) {
    logError(SOURCE, 'simulacao salva, mas falhou ao registrar no historico', err, { leadId: insert.lead_id })
  }

  return NextResponse.json({ data, alreadyExists: false }, { status: 201 })
}
