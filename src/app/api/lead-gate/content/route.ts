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

export async function GET(req: NextRequest) {
  try {
    // Sessão ausente: 401 antes de qualquer outra coisa, e sem tocar o banco.
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
    }

    const rl = await checkRateLimit(extractIp(req), { identifier: 'lead-gate-content', limit: 60, windowSeconds: 60 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas, tente novamente em instantes' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } },
      )
    }

    const slug = req.nextUrl.searchParams.get('slug')?.trim() ?? ''
    const bloco = req.nextUrl.searchParams.get('bloco')?.trim() ?? ''
    if (!slug || !BLOCOS_VALIDOS.includes(bloco as BlocoRestrito)) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    // Slug fora do piloto não tem conteúdo restrito a entregar — evita que a
    // rota vire um jeito genérico de puxar dado de qualquer empreendimento.
    if (!isLeadGateEnabledForSlug(slug)) {
      return NextResponse.json({ error: 'Não disponível' }, { status: 404 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Configuração incompleta' }, { status: 503 })
    }

    const sessao = await lookupSessionByToken(createClient(supabaseUrl, serviceRoleKey), token)
    if (sessao.status === 'invalid') {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
    }

    const itens = getConteudoRestrito(slug, bloco as BlocoRestrito)
    if (!itens) {
      return NextResponse.json({ error: 'Não disponível' }, { status: 404 })
    }

    // no-store: resposta é por-sessão. Sem isso um cache intermediário poderia
    // servir o conteúdo liberado para quem não tem cookie.
    return NextResponse.json({ itens }, { headers: { 'Cache-Control': 'no-store, private' } })
  } catch (err) {
    logError(SOURCE, 'falha ao entregar conteudo restrito', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
