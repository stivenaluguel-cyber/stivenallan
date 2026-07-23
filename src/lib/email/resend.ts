// Cliente mínimo pra API do Resend (fetch cru, mesmo padrão já usado no
// cron de e-mail — não usa o SDK `resend` instalado no projeto, que hoje
// não é referenciado em lugar nenhum). Extraído do que era só um helper
// interno de src/app/api/cron/email-followup/route.ts porque a campanha
// de e-mail também precisa enviar, e agora precisa também do `id` da
// mensagem retornado pelo Resend (a régua automática nunca precisou disso,
// só a campanha, pra correlacionar os eventos do webhook depois).

export type EnviarEmailResultado =
  | { ok: true; id?: string }
  | { ok: false; error: string }

export async function enviarEmailResend(params: {
  to: string
  subject: string
  html: string
  headers?: Record<string, string>
}): Promise<EnviarEmailResultado> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      headers: params.headers,
    }),
  })

  if (!res.ok) {
    return { ok: false, error: `status=${res.status} body=${await res.text()}` }
  }

  const body = await res.json().catch(() => null) as { id?: string } | null
  return { ok: true, id: body?.id }
}
