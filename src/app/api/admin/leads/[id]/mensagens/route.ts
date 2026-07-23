import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'
import { enviarMensagem } from '@/lib/evolution'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function auth() {
  const s = await cookies(); const t = s.get('dashboard_token')?.value; if (!t) return false
  try { await jwtVerify(t, new TextEncoder().encode(process.env.JWT_SECRET!)); return true } catch { return false }
}

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const [{ data, error }, { data: lead }] = await Promise.all([
    sb()
      .from('interacoes')
      .select('id, direcao, mensagem, processado_por_ia, created_at')
      .eq('lead_id', id)
      .eq('canal', 'whatsapp')
      .order('created_at', { ascending: true }),
    sb().from('leads').select('atendimento_humano_ativo').eq('id', id).single(),
  ])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [], atendimento_humano_ativo: lead?.atendimento_humano_ativo ?? false })
}

// Envio manual pelo painel — pausa a IA automaticamente (atendimento_humano_ativo=true)
// pra não ter bot e corretor respondendo em paralelo.
export async function POST(req: NextRequest, { params }: Params) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const texto = typeof body.texto === 'string' ? body.texto.trim() : ''
  if (!texto) return NextResponse.json({ error: 'Texto vazio' }, { status: 400 })

  const { data: lead, error: leadErr } = await sb().from('leads').select('whatsapp').eq('id', id).single()
  if (leadErr || !lead?.whatsapp) return NextResponse.json({ error: 'Lead sem WhatsApp cadastrado' }, { status: 404 })

  const enviado = await enviarMensagem(lead.whatsapp, texto)
  if (!enviado) return NextResponse.json({ error: 'Falha ao enviar pela Evolution API' }, { status: 502 })

  const client = sb()
  await client.from('interacoes').insert({
    lead_id: id,
    canal: 'whatsapp',
    direcao: 'saida',
    mensagem: texto,
    processado_por_ia: false,
  })
  await client.from('leads').update({ atendimento_humano_ativo: true, updated_at: new Date().toISOString() }).eq('id', id)

  return NextResponse.json({ success: true })
}
