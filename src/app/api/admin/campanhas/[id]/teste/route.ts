import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autenticado } from '@/lib/dashboard/auth-check'
import { montarHtml } from '@/lib/cron/email-followup-helpers'
import { enviarEmailResend } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST { email, assunto?, corpo_html? } — manda 1 e-mail de teste pro
// endereço informado, usando o conteúdo ATUAL do editor (não precisa ter
// salvo ainda) ou, se omitido, o que já está gravado na campanha. NUNCA
// grava em campanha_destinatarios/campanha_eventos nem muda o status da
// campanha — é só um envio avulso pra conferência visual.
export async function POST(req: NextRequest, { params }: Params) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = sb()

  const body = await req.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Informe um e-mail válido para o envio de teste.' }, { status: 400 })
  }

  const { data: campanha, error } = await supabase.from('campanhas').select('assunto, corpo_html').eq('id', id).single()
  if (error || !campanha) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })

  const assunto = typeof body.assunto === 'string' && body.assunto.trim() ? body.assunto : campanha.assunto
  const corpoHtml = typeof body.corpo_html === 'string' && body.corpo_html.trim() ? body.corpo_html : campanha.corpo_html

  const substituir = (txt: string) => txt.replace(/{nome}/g, 'Teste').replace(/{empreendimento}/g, 'nosso empreendimento')

  const resultado = await enviarEmailResend({
    to: email,
    subject: '[TESTE] ' + substituir(assunto),
    html: montarHtml(substituir(corpoHtml), '#'),
  })

  if (!resultado.ok) return NextResponse.json({ error: resultado.error }, { status: 502 })
  return NextResponse.json({ success: true })
}
