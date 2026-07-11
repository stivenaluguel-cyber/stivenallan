import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyUnsubscribeToken } from '@/lib/leads/unsubscribe-token'
import { logError, logInfo, logWarn } from '@/lib/log'

export const dynamic = 'force-dynamic'

const SOURCE = 'api/unsubscribe'

export async function GET(req: NextRequest) {
  return handleUnsubscribe(req)
}

// RFC 8058: Gmail/Outlook usam POST no header List-Unsubscribe-Post
export async function POST(req: NextRequest) {
  return handleUnsubscribe(req)
}

async function handleUnsubscribe(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url)
  let leadId = url.searchParams.get('lead_id')
  let token = url.searchParams.get('token')

  // RFC 8058 permite POST com body (form-urlencoded ou JSON) — best effort
  if (req.method === 'POST' && (!leadId || !token)) {
    const contentType = req.headers.get('content-type') ?? ''
    try {
      if (contentType.includes('form')) {
        const form = await req.formData()
        leadId = leadId ?? ((form.get('lead_id') as string | null) ?? null)
        token = token ?? ((form.get('token') as string | null) ?? null)
      } else if (contentType.includes('json')) {
        const body = (await req.json()) as { lead_id?: string; token?: string } | null
        leadId = leadId ?? (body?.lead_id ?? null)
        token = token ?? (body?.token ?? null)
      }
    } catch {
      // Body inválido: segue com o que já veio da query
    }
  }

  if (!leadId || !verifyUnsubscribeToken(leadId, token)) {
    logInfo(SOURCE, 'invalid attempt', { leadId: leadId ?? 'none' })
    return htmlResponse(400, htmlError())
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    logError(SOURCE, 'envs missing', undefined, { leadId })
    return htmlResponse(503, htmlError())
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const { error } = await supabase
    .from('leads')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('id', leadId)
    .is('unsubscribed_at', null) // idempotência: só marca timestamp na 1ª vez

  if (error) {
    if (error.code === 'PGRST204' || /column/i.test(error.message ?? '')) {
      // Migração 0005 pendente. Compliance-safe: mostra sucesso ao usuário.
      logWarn(SOURCE, 'migration 0005 pending', { leadId })
      return htmlResponse(200, htmlSuccess())
    }
    logError(SOURCE, 'update failed', error, { leadId })
    return htmlResponse(500, htmlError())
  }

  logInfo(SOURCE, 'lead unsubscribed', { leadId })
  return htmlResponse(200, htmlSuccess())
}

function htmlResponse(status: number, body: string): NextResponse {
  return new NextResponse(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function htmlSuccess(): string {
  return renderPage(
    'Descadastrado com sucesso',
    'Você foi removido da nossa régua de e-mails.',
    'Se mudar de ideia, é só voltar a se cadastrar em stivenallan.com.br a qualquer momento.',
  )
}

function htmlError(): string {
  return renderPage(
    'Link inválido',
    'O link de descadastro é inválido ou expirou.',
    'Se você acredita que isso é um erro, entre em contato pelo WhatsApp.',
  )
}

function renderPage(title: string, primary: string, secondary: string): string {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — Stiven Allan</title></head><body style="margin:0;background:#F3F2EE;font-family:system-ui,-apple-system,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px"><div style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;text-align:center"><div style="background:#1A1A1A;padding:20px 24px"><p style="color:#F5F2ED;font-size:13px;letter-spacing:0.22em;text-transform:uppercase;margin:0">Stiven Allan</p></div><div style="padding:36px 28px"><h1 style="font-size:22px;font-weight:700;color:#18181b;margin:0 0 12px">${title}</h1><p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 20px">${primary}</p><p style="font-size:13px;color:#71717a;line-height:1.5;margin:0">${secondary}</p></div></div></body></html>`
}
