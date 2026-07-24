import { enviarEmailResend } from '@/lib/email/resend'
import { logError } from '@/lib/log'

const SOURCE = 'lib/leads/notificar-novo-lead'
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

// Notifica o owner por e-mail quando um lead novo é salvo. Nunca deve derrubar
// a captação do lead: qualquer falha aqui (Resend fora do ar, RESEND_API_KEY
// ausente) só é logada — o caller já persistiu o lead antes de chamar isso.
export async function notificarNovoLead(params: {
  nome: string
  whatsapp: string
  email?: string | null
  propertyName?: string | null
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    return
  }

  const safeNome = escapeHtml(params.nome)
  const safeWhatsapp = escapeHtml(params.whatsapp)
  const safeEmail = params.email ? escapeHtml(params.email) : ''
  const safePropertyName = params.propertyName ? escapeHtml(params.propertyName) : '-'
  const whatsappUrl = whatsappHref(params.whatsapp)

  const html = `
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
`

  const res = await enviarEmailResend({
    to: NOTIFY_TO,
    subject: `Novo lead: ${safeNome}`,
    html,
  })

  if (!res.ok) {
    // Sem PII no log — só o resultado da chamada ao Resend.
    logError(SOURCE, 'falha ao enviar notificacao de novo lead', new Error(res.error))
  }
}
