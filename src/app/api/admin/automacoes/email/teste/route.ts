import { NextRequest, NextResponse } from 'next/server'
import { autenticado } from '@/lib/dashboard/auth-check'
import { montarHtml } from '@/lib/cron/email-followup-helpers'
import { enviarEmailResend } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST { email, assunto, corpo_html } — envio avulso de conferência de UM
// passo específico da régua de e-mail, direto do editor (antes ou depois de
// salvar). Mesmo espírito de /api/admin/campanhas/[id]/teste: prefixa
// "[TESTE]", troca os placeholders, NÃO grava nada no banco.
export async function POST(req: NextRequest) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    return NextResponse.json({ error: 'RESEND_API_KEY / RESEND_FROM não configurado.' }, { status: 503 })
  }

  const body = await req.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const assunto = typeof body.assunto === 'string' ? body.assunto : ''
  const corpoHtml = typeof body.corpo_html === 'string' ? body.corpo_html : ''

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Informe um e-mail válido para o envio de teste.' }, { status: 400 })
  }
  if (!assunto.trim() || !corpoHtml.trim()) {
    return NextResponse.json({ error: 'assunto e corpo_html são obrigatórios.' }, { status: 400 })
  }

  const substituir = (txt: string) => txt.replace(/{nome}/g, 'Teste').replace(/{empreendimento}/g, 'nosso empreendimento')

  const resultado = await enviarEmailResend({
    to: email,
    subject: '[TESTE] ' + substituir(assunto),
    html: montarHtml(substituir(corpoHtml), '#'),
  })

  if (!resultado.ok) return NextResponse.json({ error: resultado.error }, { status: 502 })
  return NextResponse.json({ success: true })
}
