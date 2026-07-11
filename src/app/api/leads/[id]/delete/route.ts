import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyDeleteToken } from '@/lib/leads/delete-token'
import { deleteLeadCascade } from '@/lib/leads/delete-lead'
import { logError, logInfo, logWarn } from '@/lib/log'

// LGPD Art. 18 — direito ao esquecimento. Hard-delete do lead + registros filhos.
// De propósito só aceita POST (não GET): links em e-mail/scanners de segurança fazem
// pre-fetch automático de GETs, o que tornaria essa ação destrutiva disparável sem
// intenção do titular dos dados. Verificação por token — ver src/lib/leads/delete-token.ts.

export const dynamic = 'force-dynamic'

const SOURCE = 'api/leads/delete'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params

  const url = new URL(req.url)
  let token = url.searchParams.get('token')

  if (!token) {
    const contentType = req.headers.get('content-type') ?? ''
    try {
      if (contentType.includes('form')) {
        const form = await req.formData()
        token = (form.get('token') as string | null) ?? null
      } else if (contentType.includes('json')) {
        const body = (await req.json()) as { token?: string } | null
        token = body?.token ?? null
      }
    } catch {
      // Body inválido: segue com o que já veio da query (null)
    }
  }

  if (!id || !verifyDeleteToken(id, token)) {
    logWarn(SOURCE, 'invalid attempt', { leadId: id ?? 'none' })
    return htmlResponse(400, htmlError())
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    logError(SOURCE, 'envs missing', undefined, { leadId: id })
    return htmlResponse(503, htmlError())
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const { error } = await deleteLeadCascade(supabase, id)

  if (error) {
    logError(SOURCE, 'delete failed', error, { leadId: id })
    return htmlResponse(500, htmlError())
  }

  logInfo(SOURCE, 'lead deleted (lgpd)', { leadId: id })
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
    'Dados excluídos',
    'Seus dados foram removidos da nossa base, conforme a Lei Geral de Proteção de Dados (LGPD).',
    'Se você preencher o formulário novamente no futuro, um novo cadastro será criado normalmente.',
  )
}

function htmlError(): string {
  return renderPage(
    'Link inválido',
    'O link de exclusão de dados é inválido ou expirou.',
    'Se você acredita que isso é um erro, entre em contato pelo WhatsApp.',
  )
}

function renderPage(title: string, primary: string, secondary: string): string {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — Stiven Allan</title></head><body style="margin:0;background:#F3F2EE;font-family:system-ui,-apple-system,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px"><div style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;text-align:center"><div style="background:#1A1A1A;padding:20px 24px"><p style="color:#F5F2ED;font-size:13px;letter-spacing:0.22em;text-transform:uppercase;margin:0">Stiven Allan</p></div><div style="padding:36px 28px"><h1 style="font-size:22px;font-weight:700;color:#18181b;margin:0 0 12px">${title}</h1><p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 20px">${primary}</p><p style="font-size:13px;color:#71717a;line-height:1.5;margin:0">${secondary}</p></div></div></body></html>`
}
