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
  <div style="background:#F3F2EE;padding:32px 16px;font-family:system-ui,-apple-system,sans-serif">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)">
      <div style="background:#D24E22;padding:24px;text-align:center">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:#ffffff;border-radius:14px;font-size:22px;font-weight:800;color:#D24E22;margin-bottom:12px">SA</div>
        <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0">Novo Lead Recebido</h1>
      </div>
      <div style="padding:28px 24px">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="color:#8a8a85;padding:10px 0;border-bottom:1px solid #F3F2EE;font-size:13px;width:40%">Nome</td>
            <td style="color:#1a1a1a;padding:10px 0;border-bottom:1px solid #F3F2EE;font-weight:600;font-size:14px">${nome}</td>
          </tr>
          <tr>
            <td style="color:#8a8a85;padding:10px 0;border-bottom:1px solid #F3F2EE;font-size:13px">WhatsApp</td>
            <td style="color:#1a1a1a;padding:10px 0;border-bottom:1px solid #F3F2EE;font-weight:600;font-size:14px">${whatsapp}</td>
          </tr>
          ${body.email ? `<tr>
            <td style="color:#8a8a85;padding:10px 0;border-bottom:1px solid #F3F2EE;font-size:13px">E-mail</td>
            <td style="color:#1a1a1a;padding:10px 0;border-bottom:1px solid #F3F2EE;font-weight:600;font-size:14px">${body.email}</td>
          </tr>` : ''}
          <tr>
            <td style="color:#8a8a85;padding:10px 0;font-size:13px">Empreendimento</td>
            <td style="color:#1a1a1a;padding:10px 0;font-weight:600;font-size:14px">${property_name ?? '-'}</td>
          </tr>
        </table>
        <div style="text-align:center;margin-top:24px">
          <a href="https://wa.me/55${whatsapp}" style="display:inline-block;background:#25D366;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin:0 4px 8px">Abrir WhatsApp</a>
          <a href="https://stivenallan.vercel.app/dashboard/leads" style="display:inline-block;background:#D24E22;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin:0 4px 8px">Ver Dashboard</a>
        </div>
      </div>
      <div style="background:#F3F2EE;padding:14px;text-align:center">
        <p style="color:#8a8a85;font-size:11px;margin:0">SA Imóveis · Notificação automática de lead</p>
      </div>
    </div>
  </div>
`,      }),
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
