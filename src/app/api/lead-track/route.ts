import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizeString } from '@/lib/leads/normalize'
import { extractIp } from '@/lib/leads/anti-spam'
import { checkRateLimit } from '@/lib/leads/rate-limit'
import { recordPropertyInterest, type PropertyInterestEventType } from '@/lib/leads/property-interest'
import { recordLeadEvento } from '@/lib/leads/record-lead-evento'
import { lookupSessionByToken } from '@/lib/lead-gate/session-lookup'
import { SESSION_COOKIE_NAME } from '@/lib/lead-gate/session'
import { logError } from '@/lib/log'
import type { Attribution } from '@/lib/tracking'

export const dynamic = 'force-dynamic'

const SOURCE = 'api/lead-track'

const ALLOWED_EVENT_TYPES: readonly PropertyInterestEventType[] = [
  'view',
  'unlock',
  'whatsapp_click',
  'catalog_download',
  'floorplan_view',
  'gallery_view',
  'availability_view',
]

// tipo gravado em lead_eventos (timeline): 'view' reaproveita 'visita', o
// vocabulário já usado por VisitTracker/FormContato — o resto usa o próprio
// nome do evento (sem CHECK na coluna, seguro adicionar strings novas).
function eventoTipo(eventType: PropertyInterestEventType): string {
  return eventType === 'view' ? 'visita' : eventType
}

export async function POST(req: NextRequest) {
  try {
    // Sessão ausente: 401 sem tocar o banco — só um visitante já cadastrado
    // tem o que registrar aqui (pré-conversão continua em VisitTracker/localStorage).
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Configuração incompleta' }, { status: 503 })
    }
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const sessao = await lookupSessionByToken(supabaseAdmin, token)
    if (sessao.status === 'invalid') {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
    }

    const rl = await checkRateLimit(extractIp(req), { identifier: 'lead-track', limit: 30, windowSeconds: 60 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas, tente novamente em instantes' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } },
      )
    }

    const body = await req.json()
    const propertySlug = normalizeString(body.propertySlug)
    const propertyIdInput = normalizeString(body.propertyId)
    const eventType = body.eventType as PropertyInterestEventType

    if (!propertySlug || !propertyIdInput || !ALLOWED_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    // property_id nunca é confiado às cegas, mesmo vindo de uma sessão válida.
    const { data: property } = await supabaseAdmin
      .from('properties')
      .select('id')
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
      gclid: normalizeString(body.gclid) ?? undefined,
      fbclid: normalizeString(body.fbclid) ?? undefined,
    }

    await recordPropertyInterest(supabaseAdmin, {
      leadId: sessao.leadId,
      propertyId: property.id,
      propertySlug,
      eventType,
      source: normalizeString(body.source),
      attribution,
    })
    await recordLeadEvento(supabaseAdmin, {
      leadId: sessao.leadId,
      tipo: eventoTipo(eventType),
      slug: propertySlug,
      propertyId: property.id,
      clientEventId: normalizeString(body.clientEventId),
    })

    return NextResponse.json({ recorded: true })
  } catch (err) {
    logError(SOURCE, 'route exception', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
