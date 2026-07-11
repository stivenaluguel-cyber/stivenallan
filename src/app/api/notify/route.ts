import { NextRequest, NextResponse } from 'next/server'
import { logError, logWarn } from '@/lib/log'

export const dynamic = 'force-dynamic'

const SOURCE = 'api/notify'
const NOTIFY_TO = process.env.NOTIFY_TO ?? 'stiven.aluguel@gmail.com'

// Escapa entidades HTML pra evitar que payload malicioso (ou só barulhento) do
// client injete tags no e-mail que chega no inbox do owner.
function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Prefixa "55" apenas se whatsapp não tiver country code. Pós Pilha A, o campo já
// vem digits-only e frequentemente com "55" na frente (ex: "5548991642332").
function whatsappHref(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  const withCountry = digits.length >= 12 ? digits : '55' + digits
  return `https://wa.me/${withCountry}`
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      logWarn(SOURCE, 'skipped: RESEND_API_KEY ausente')
      return NextResponse.json({ skipped: true, motivo: 'RESEND_API_KEY ausente' })
    }

    const body = await req.json()
    const { nome, whatsapp, property_name } = body

    if (!nome || !whatsapp) {
      return NextResponse.json({ error: 'Dados insuficientes' }, { status: 400 })
    }

    // Todo valor derivado do body é escapado antes de virar HTML.
    const safeNome = escapeHtml(nome)
    const safeWhatsapp = escapeHtml(whatsapp)
    const safeEmail = body.email ? escapeHtml(body.email) : ''
    const safePropertyName = property_name ? escapeHtml(property_name) : '-'
    const whatsappUrl = whatsappHref(whatsapp)

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'SA Imoveis <onboarding@resend.dev>',
        to: [NOTIFY_TO],
        subject: `Novo lead: ${safeNome}`,
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
            <td style="color:#1a1a1a;padding:10px 0;border-bottom:1px solid #F3F2EE;font-weight:600;font-size:14px">${safeNome}</td>
          </tr>
          <tr>
            <td style="color:#8a8a85;padding:10px 0;border-bottom:1px solid #F3F2EE;font-size:13px">WhatsApp</td>
            <td style="color:#1a1a1a;padding:10px 0;border-bottom:1px solid #F3F2EE;font-weight:600;font-size:14px">${safeWhatsapp}</td>
          </tr>
          ${safeEmail ? `<tr>
            <td style="color:#8a8a85;padding:10px 0;border-bottom:1px solid #F3F2EE;font-size:13px">E-mail</td>
            <td style="color:#1a1a1a;padding:10px 0;border-bottom:1px solid #F3F2EE;font-weight:600;font-size:14px">${safeEmail}</td>
          </tr>` : ''}
          <tr>
            <td style="color:#8a8a85;padding:10px 0;font-size:13px">Empreendimento</td>
            <td style="color:#1a1a1a;padding:10px 0;font-weight:600;font-size:14px">${safePropertyName}</td>
          </tr>
        </table>
        <div style="text-align:center;margin-top:24px">
          <a href="${whatsappUrl}" style="display:inline-block;background:#25D366;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin:0 4px 8px">Abrir WhatsApp</a>
          <a href="https://stivenallan.com.br/dashboard/leads" style="display:inline-block;background:#D24E22;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin:0 4px 8px">Ver Dashboard</a>
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
      logError(SOURCE, 'resend send failed', new Error(`status=${emailRes.status} body=${errText}`))
      return NextResponse.json({ error: 'Falha ao enviar email' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    logError(SOURCE, 'route exception', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
