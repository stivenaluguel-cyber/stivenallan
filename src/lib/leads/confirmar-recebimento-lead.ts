import { enviarEmailResend } from '@/lib/email/resend'
import { logError } from '@/lib/log'

const SOURCE = 'lib/leads/confirmar-recebimento-lead'

function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Recibo pro próprio cliente (distinto de notificarNovoLead, que avisa o
// corretor) — só dispara se ele informou e-mail, campo opcional no
// formulário. Ajuda a lembrar que se cadastrou, mesmo que a conversa no
// WhatsApp não continue na hora.
export async function confirmarRecebimentoLead(params: {
  nome: string
  email?: string | null
  propertyName?: string | null
}): Promise<void> {
  if (!params.email || !process.env.RESEND_API_KEY) {
    return
  }

  const primeiroNome = params.nome.trim().split(/\s+/)[0] || params.nome
  const safeNome = escapeHtml(primeiroNome)
  const safePropertyName = params.propertyName ? escapeHtml(params.propertyName) : null

  const html = `
  <div style="background:#F3F2EE;padding:32px 16px;font-family:system-ui,-apple-system,sans-serif">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)">
      <div style="background:#D24E22;padding:24px;text-align:center">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:#ffffff;border-radius:14px;font-size:22px;font-weight:800;color:#D24E22;margin-bottom:12px">SA</div>
        <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0">Cadastro recebido!</h1>
      </div>
      <div style="padding:28px 24px">
        <p style="color:#1a1a1a;font-size:15px;line-height:1.6;margin:0 0 16px">Olá, ${safeNome}!</p>
        <p style="color:#1a1a1a;font-size:15px;line-height:1.6;margin:0 0 16px">
          Recebemos seu cadastro${safePropertyName ? ` sobre <strong>${safePropertyName}</strong>` : ''}. Em breve
          nossa equipe entra em contato pelo WhatsApp com todas as condições.
        </p>
        <p style="color:#8a8a85;font-size:13px;line-height:1.6;margin:0">
          Guarde este e-mail — é o seu comprovante de que o cadastro foi recebido.
        </p>
      </div>
      <div style="background:#F3F2EE;padding:14px;text-align:center">
        <p style="color:#8a8a85;font-size:11px;margin:0">SA Imóveis</p>
      </div>
    </div>
  </div>
`

  const res = await enviarEmailResend({
    to: params.email,
    subject: `Recebemos seu cadastro${params.propertyName ? ` — ${params.propertyName}` : ''}`,
    html,
  })

  if (!res.ok) {
    // Sem PII no log — só o resultado da chamada ao Resend.
    logError(SOURCE, 'falha ao enviar confirmacao de recebimento ao lead', new Error(res.error))
  }
}
