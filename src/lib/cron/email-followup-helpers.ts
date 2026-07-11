import { generateUnsubscribeToken } from '@/lib/leads/unsubscribe-token'
import { SITE_URL } from '@/lib/site'

// Helpers puros extraídos do route pra evitar a restrição de exports do Next 15:
// route files só aceitam GET/POST/etc + dynamic + maxDuration.

export function buildUnsubscribeUrl(leadId: string): string {
  const token = generateUnsubscribeToken(leadId)
  return `${SITE_URL}/api/unsubscribe?lead_id=${encodeURIComponent(leadId)}&token=${token}`
}

export function montarHtml(corpo: string, unsubUrl: string): string {
  return `
  <div style="background:#F3F2EE;padding:32px 16px;font-family:system-ui,-apple-system,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
      <div style="background:#1A1A1A;padding:20px 24px;text-align:center">
        <p style="color:#F5F2ED;font-size:13px;letter-spacing:0.22em;text-transform:uppercase;margin:0">Stiven Allan</p>
      </div>
      <div style="padding:28px 24px;color:#333;font-size:15px;line-height:1.7">
        ${corpo}
        <p style="margin-top:24px">Um abraço,<br/><strong>Stiven Allan</strong> — CRECI 60.275<br/>
        <a href="https://stivenallan.com.br" style="color:#1A5C3A">stivenallan.com.br</a></p>
      </div>
      <div style="padding:14px 24px;background:#FAFAF8;border-top:1px solid #eee">
        <p style="color:#999;font-size:12px;margin:0">Você recebeu este e-mail porque se cadastrou em stivenallan.com.br. <a href="${unsubUrl}" style="color:#999;text-decoration:underline">Descadastrar</a>.</p>
      </div>
    </div>
  </div>`
}
