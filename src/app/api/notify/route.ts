import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nome, whatsapp, property_name } = body

    if (!nome || !whatsapp) {
      return NextResponse.json({ error: 'Dados insuficientes' }, { status: 400 })
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'SA Imoveis <onboarding@resend.dev>',
        to: ['stiven.aluguel@gmail.com'],
        subject: `Novo lead: ${nome}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#121315;color:#fff;border-radius:16px">
            <div style="text-align:center;margin-bottom:24px">
              <div style="background:#c9a24b;color:#121315;font-size:24px;font-weight:800;width:64px;height:64px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center">SA</div>
            </div>
            <h2 style="color:#c9a24b;text-align:center;margin-top:0">Novo Lead Recebido</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              <tr>
                <td style="color:#a7adb4;padding:8px 0;border-bottom:1px solid #1e2023;width:40%">Nome</td>
                <td style="padding:8px 0;border-bottom:1px solid #1e2023;font-weight:600">${nome}</td>
              </tr>
              <tr>
                <td style="color:#a7adb4;padding:8px 0;border-bottom:1px solid #1e2023">WhatsApp</td>
                <td style="padding:8px 0;border-bottom:1px solid #1e2023;font-weight:600">${whatsapp}</td>
              </tr>
              <tr>
                <td style="color:#a7adb4;padding:8px 0;border-bottom:1px solid #1e2023">Empreendimento</td>
                <td style="padding:8px 0;border-bottom:1px solid #1e2023">${property_name ?? '-'}</td>
              </tr>
            </table>
            <div style="text-align:center">
              <a href="https://wa.me/55${whatsapp}"
                style="background:#25D366;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;margin-right:8px">
                Abrir WhatsApp
              </a>
              <a href="https://stivenallan.vercel.app/dashboard/leads"
                style="background:#c9a24b;color:#121315;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
                Ver Dashboard
              </a>
            </div>
            <p style="color:#a7adb4;font-size:12px;text-align:center;margin-top:24px">
              SA Imóveis · Notificação automática
            </p>
          </div>
        `,
      }),
    })

    if (!emailRes.ok) {
      const errText = await emailRes.text()
      console.error('Resend error:', errText)
      return NextResponse.json({ error: 'Falha ao enviar email' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Notify route error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
