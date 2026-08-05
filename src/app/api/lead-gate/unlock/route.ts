import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizeString } from '@/lib/leads/normalize'
import { extractIp, isBotSubmission } from '@/lib/leads/anti-spam'
import { checkRateLimit } from '@/lib/leads/rate-limit'
import { resolveLeadForGate } from '@/lib/leads/lead-identity'
import { recordPropertyInterest } from '@/lib/leads/property-interest'
import { recordLeadEvento } from '@/lib/leads/record-lead-evento'
import { isLeadGateEnabledForSlug } from '@/lib/lead-gate/flags'
import { generateSessionToken, hashSessionToken, sessionCookieOptions, sessionExpiresAt, SESSION_COOKIE_NAME } from '@/lib/lead-gate/session'
import { logError, logWarn } from '@/lib/log'
import type { Attribution } from '@/lib/tracking'

export const dynamic = 'force-dynamic'

const SOURCE = 'api/lead-gate/unlock'

// Todos os 6 campos do cadastro único são obrigatórios — diferente do
// /api/leads legado, que só exige nome+telefone. Mensagens específicas por
// campo aqui não violam a anti-enumeração: o que a API nunca revela é SE o
// contato já existia, não se o payload está bem formado.
function validatePayload(body: Record<string, unknown>): string | null {
  if (!normalizeString(body.nome)) return 'Nome é obrigatório'
  if (!normalizeString(body.whatsapp)) return 'WhatsApp é obrigatório'
  if (!normalizeString(body.email)) return 'E-mail é obrigatório'
  if (!normalizeString(body.faixaInvestimento)) return 'Faixa de investimento é obrigatória'
  if (!normalizeString(body.prazoCompra)) return 'Prazo para compra é obrigatório'
  if (!normalizeString(body.entradaDisponivel)) return 'Entrada disponível é obrigatória'
  if (!normalizeString(body.propertyId)) return 'Empreendimento não identificado'
  if (!normalizeString(body.propertySlug)) return 'Empreendimento não identificado'
  if (body.consentimento !== true) return 'É necessário concordar com os termos para continuar'
  return null
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Configuração incompleta' }, { status: 503 })
    }

    const body = await req.json()

    if (isBotSubmission(body)) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    const rl = await checkRateLimit(extractIp(req), { identifier: 'lead-gate-unlock', limit: 5, windowSeconds: 60 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas, tente novamente em instantes' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } },
      )
    }

    const validationError = validatePayload(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const propertySlug = normalizeString(body.propertySlug)!
    const propertyIdInput = normalizeString(body.propertyId)!

    if (!isLeadGateEnabledForSlug(propertySlug)) {
      return NextResponse.json({ error: 'Cadastro indisponível para este empreendimento' }, { status: 404 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // property_id nunca é confiado às cegas: confirma que existe e bate com
    // o slug informado antes de gravar qualquer coisa vinculada a ele.
    const { data: property } = await supabaseAdmin
      .from('properties')
      .select('id, nome')
      .eq('id', propertyIdInput)
      .eq('slug', propertySlug)
      .maybeSingle()
    if (!property) {
      return NextResponse.json({ error: 'Empreendimento não encontrado' }, { status: 400 })
    }

    const attribution: Attribution = {
      utm_source: normalizeString(body.utm_source) ?? undefined,
      utm_medium: normalizeString(body.utm_medium) ?? undefined,
      utm_campaign: normalizeString(body.utm_campaign) ?? undefined,
      utm_content: normalizeString(body.utm_content) ?? undefined,
      utm_term: normalizeString(body.utm_term) ?? undefined,
      gclid: normalizeString(body.gclid) ?? undefined,
      fbclid: normalizeString(body.fbclid) ?? undefined,
    }

    const identidade = await resolveLeadForGate(supabaseAdmin, {
      nome: normalizeString(body.nome),
      whatsapp: normalizeString(body.whatsapp),
      email: normalizeString(body.email),
      propertyId: property.id,
      propertyName: property.nome,
      source: normalizeString(body.source),
      faixaInvestimento: normalizeString(body.faixaInvestimento),
      prazoCompra: normalizeString(body.prazoCompra),
      entradaDisponivel: normalizeString(body.entradaDisponivel),
      attribution,
    })

    if (identidade.status === 'invalid') {
      return NextResponse.json({ error: identidade.motivo }, { status: 400 })
    }
    if (identidade.status === 'error') {
      logError(SOURCE, 'falha ao resolver identidade', { motivo: identidade.motivo })
      return NextResponse.json({ error: 'Erro ao processar cadastro' }, { status: 500 })
    }

    if (identidade.conflito) {
      // Nunca revelado na resposta pública — só registrado internamente para
      // a fila de revisão manual (lead_identity_conflicts, gravada dentro da
      // própria função resolve_lead_for_gate).
      logWarn(SOURCE, 'conflito de identidade telefone x email detectado', { leadId: identidade.leadId })
    }

    const token = generateSessionToken()
    const expiresAt = sessionExpiresAt()
    const { error: sessionError } = await supabaseAdmin.from('lead_access_sessions').insert({
      lead_id: identidade.leadId,
      token_hash: hashSessionToken(token),
      expires_at: expiresAt.toISOString(),
    })
    if (sessionError) {
      logError(SOURCE, 'falha ao criar sessao de acesso', sessionError)
      return NextResponse.json({ error: 'Erro ao processar cadastro' }, { status: 500 })
    }

    await recordPropertyInterest(supabaseAdmin, {
      leadId: identidade.leadId,
      propertyId: property.id,
      propertySlug,
      eventType: 'unlock',
      source: normalizeString(body.source),
      attribution,
    })
    await recordLeadEvento(supabaseAdmin, {
      leadId: identidade.leadId,
      tipo: 'unlock',
      slug: propertySlug,
      propertyId: property.id,
      clientEventId: normalizeString(body.clientEventId),
    })

    // Resposta sempre no mesmo shape, independente de lead novo/existente/em
    // conflito — anti-enumeração: o navegador nunca aprende se o contato já
    // era conhecido.
    const response = NextResponse.json({ unlocked: true }, { status: 201 })
    response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions())
    return response
  } catch (err) {
    logError(SOURCE, 'route exception', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
