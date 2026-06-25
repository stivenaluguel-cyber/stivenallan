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

    // Enviar email via Resend
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'
    const resetUrl = `${siteUrl}/dashboard/redefinir-senha?token=${token}`

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'SA Imoveis <onboarding@resend.dev>',
        to: ['stiven.aluguel@gmail.com'],
        subject: 'Redefinir senha - Dashboard SA Imoveis',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#121315;color:#fff;border-radius:16px">
            <div style="text-align:center;margin-bottom:24px">
              <div style="background:#c9a24b;color:#121315;font-size:24px;font-weight:800;width:64px;height:64px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center">SA</div>
            </div>
            <h2 style="color:#c9a24b;text-align:center">Redefinir sua senha</h2>
            <p>Ola, ${admin.nome}!</p>
            <p>Clique no botao abaixo para redefinir sua senha. O link expira em <strong>1 hora</strong>.</p>
            <div style="text-align:center;margin:32px 0">
              <a href="${resetUrl}" style="background:#c9a24b;color:#121315;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block">
                Redefinir senha
              </a>
            </div>
            <p style="color:#a7adb4;font-size:12px">Se voce nao solicitou isso, ignore este email.</p>
            <p style="color:#a7adb4;font-size:12px">Link direto: ${resetUrl}</p>
          </div>
        `
      })
    })

    if (!emailRes.ok) {
      const errText = await emailRes.text()
      console.error('Resend error:', errText)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Esqueci senha error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
