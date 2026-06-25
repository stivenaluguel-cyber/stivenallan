import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email obrigatorio' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: admin } = await supabase
      .from('admin_users')
      .select('id, email, nome')
      .eq('email', email.toLowerCase().trim())
      .single()

    // Sempre retornar sucesso para nao revelar se email existe
    if (!admin) {
      return NextResponse.json({ success: true })
    }

    // Criar token de redefinicao
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await supabase.from('password_reset_tokens').insert({
      admin_id: admin.id,
      token,
      expires_at: expires.toISOString()
    })

    // Enviar email via Resend (gratuito ate 3000/mes)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'
    const resetUrl = `${siteUrl}/dashboard/redefinir-senha?token=${token}`

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'SA Imoveis <noreply@stivenallan.vercel.app>',
        to: [admin.email],
        subject: 'Redefinir senha - Dashboard SA Imoveis',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
            <h2 style="color:#c9a24b">Redefinir sua senha</h2>
            <p>Ola, ${admin.nome}!</p>
            <p>Clique no botao abaixo para redefinir sua senha. O link expira em 1 hora.</p>
            <a href="${resetUrl}" style="display:inline-block;background:#c9a24b;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
              Redefinir senha
            </a>
            <p style="color:#666;font-size:12px">Se voce nao solicitou isso, ignore este email.</p>
            <p style="color:#666;font-size:12px">Link: ${resetUrl}</p>
          </div>
        `
      })
    })

    if (!emailRes.ok) {
      console.error('Email error:', await emailRes.text())
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Esqueci senha error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
