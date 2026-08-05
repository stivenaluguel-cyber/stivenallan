import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { lookupSessionByToken } from '@/lib/lead-gate/session-lookup'
import { SESSION_COOKIE_NAME } from '@/lib/lead-gate/session'
import { isLeadGateEnabledForSlug } from '@/lib/lead-gate/flags'
import { getConteudoRestrito, type BlocoRestrito } from '@/lib/lead-gate/conteudo-restrito'
import { extractIp } from '@/lib/leads/anti-spam'
import { checkRateLimit } from '@/lib/leads/rate-limit'
import { logError } from '@/lib/log'

// Entrega o conteúdo restrito SOMENTE depois de validar a sessão.
//
// É esta rota que faz o gate ser real. A página estática nunca contém plantas
// nem as fotos extras — nem no HTML visível, nem no payload RSC (ver a nota em
// lib/lead-gate/conteudo-restrito.ts sobre por que passar children pra um
// Client Component não protege nada).
export const dynamic = 'force-dynamic'

const SOURCE = 'api/lead-gate/content'
const BLOCOS_VALIDOS: readonly BlocoRestrito[] = ['plantas', 'fotos']
const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }

function privateJson(body: { error: string } | { itens: unknown }, status = 200) {
  return NextResponse.json(body, { status, headers: PRIVATE_HEADERS })
}

export async function GET(req: NextRequest) {
  try {
    // Sessão ausente: 401 antes de qualquer outra coisa, e sem tocar o banco.
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!token) {
      return privateJson({ error: 'Sessão inválida' }, 401)
    }

    const rl = await checkRateLimit(extractIp(req), { identifier: 'lead-gate-content', limit: 60, windowSeconds: 60 })
    if (!rl.allowed) {
      const response = privateJson({ error: 'Muitas tentativas, tente novamente em instantes' }, 429)
      response.headers.set('Retry-After', String(rl.retryAfter ?? 60))
      return response
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return privateJson({ error: 'Configuração incompleta' }, 503)
    }

    // Autentica o token ANTES de validar ou consultar o slug. Com apenas um
    // cookie lixo, a ordem antiga devolvia 404 para slug inválido e 401 para
    // slug válido — suficiente para enumerar quais empreendimentos estavam
    // no piloto. Usuário não autenticado agora recebe sempre o mesmo 401.
    const sessao = await lookupSessionByToken(createClient(supabaseUrl, serviceRoleKey), token)
    if (sessao.status === 'invalid') {
      return privateJson({ error: 'Sessão inválida' }, 401)
    }

    const slug = req.nextUrl.searchParams.get('slug')?.trim() ?? ''
    const bloco = req.nextUrl.searchParams.get('bloco')?.trim() ?? ''
    if (!slug || !BLOCOS_VALIDOS.includes(bloco as BlocoRestrito)) {
      return privateJson({ error: 'Payload inválido' }, 400)
    }

    // Slug fora do piloto não tem conteúdo restrito a entregar — evita que a
    // rota vire um jeito genérico de puxar dado de qualquer empreendimento.
    if (!isLeadGateEnabledForSlug(slug)) {
      return privateJson({ error: 'Não disponível' }, 404)
    }

    const itens = getConteudoRestrito(slug, bloco as BlocoRestrito)
    if (!itens) {
      return privateJson({ error: 'Não disponível' }, 404)
    }

    // no-store: resposta é por-sessão. Sem isso um cache intermediário poderia
    // servir o conteúdo liberado para quem não tem cookie.
    return privateJson({ itens })
  } catch (err) {
    logError(SOURCE, 'falha ao entregar conteudo restrito', err)
    return privateJson({ error: 'Erro interno' }, 500)
  }
}
