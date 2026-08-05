import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { lookupSessionByToken, touchSessionLastSeen } from '@/lib/lead-gate/session-lookup'
import { SESSION_COOKIE_NAME } from '@/lib/lead-gate/session'
import { previewSupabaseRefHeaders } from '@/lib/lead-gate/preview-ref-header'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'

const SOURCE = 'api/lead-access/status'

// Só em Preview, esta rota também carrega X-Preview-Supabase-Ref — permite
// confirmar qual projeto Supabase um deployment está usando de fato sem expor
// URL completa nem chave nenhuma. Ver lib/lead-gate/preview-ref-header.ts.
function statusJson(body: { unlocked: boolean }) {
  return NextResponse.json(body, { headers: previewSupabaseRefHeaders() })
}

// Sessão é global (vale para todos os empreendimentos no mesmo navegador) —
// esta rota nunca recebe nem precisa de propertySlug pra decidir o booleano.
// leadId é resolvido aqui dentro e NUNCA sai da rota.
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!token) {
      return statusJson({ unlocked: false })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return statusJson({ unlocked: false })
    }
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const sessao = await lookupSessionByToken(supabaseAdmin, token)
    if (sessao.status === 'invalid') {
      const response = statusJson({ unlocked: false })
      response.cookies.delete(SESSION_COOKIE_NAME)
      return response
    }

    await touchSessionLastSeen(supabaseAdmin, sessao.sessionId, sessao.lastSeenAt)
    return statusJson({ unlocked: true })
  } catch (err) {
    logError(SOURCE, 'route exception', err)
    return statusJson({ unlocked: false })
  }
}
