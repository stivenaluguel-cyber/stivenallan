import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizeEmail, normalizePhone, normalizeString } from '@/lib/leads/normalize'
import { extractIp, isBotSubmission } from '@/lib/leads/anti-spam'
import { checkRateLimit } from '@/lib/leads/rate-limit'
import { logError, logWarn } from '@/lib/log'

export const dynamic = 'force-dynamic'

const SOURCE = 'api/lead-capture'

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Configuracao incompleta' }, { status: 503 })
    }

    const body = await req.json()

    // Honeypot antes de qualquer trabalho — bot barato eliminado sem tocar em rate-limit/Supabase
    if (isBotSubmission(body)) {
      return NextResponse.json({ error: 'Payload invalido' }, { status: 400 })
    }

    // Rate limit por IP: 5 requests/min/IP no download do book
    const rl = await checkRateLimit(extractIp(req), {
      identifier: 'lead-capture',
      limit: 5,
      windowSeconds: 60,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas, tente novamente em instantes' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } },
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const nome = normalizeString(body.nome)
    const whatsapp = normalizePhone(body.whatsapp)
    const email = normalizeEmail(body.email)
    const propertyId = normalizeString(body.property_id)
    const propertyName = normalizeString(body.property_name)

    if (!nome || !whatsapp) {
      return NextResponse.json({ error: 'Nome e whatsapp obrigatorios' }, { status: 400 })
    }

    const base = {
      nome,
      whatsapp,
      email,
      property_id: propertyId,
      origem: 'Site',
      estagio_funil: 'primeiro_contato',
      source: 'book_download',
      requer_atencao: false,
      proximo_followup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    // property_name entra em `extras` — se a coluna não existir no schema, o fallback
    // insert-sem-extras ainda captura o lead (mesmo padrão defensivo do /api/leads).
    const growthFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'] as const
    const extras: Record<string, unknown> = {}
    if (propertyName) extras.property_name = propertyName
    for (const field of growthFields) {
      if (typeof body[field] === 'string' && body[field]) extras[field] = body[field]
    }

    let { data, error } = await supabaseAdmin
      .from('leads')
      .insert({ ...base, ...extras })
      .select('id')
      .single()

    // Colunas de growth ainda sem migração: não pode derrubar a captação
    if (error && Object.keys(extras).length > 0 && (error.code === 'PGRST204' || /column/i.test(error.message ?? ''))) {
      logWarn(SOURCE, 'columns pending — rodar 0002_leads_growth.sql', { db_message: error.message ?? '' })
      ;({ data, error } = await supabaseAdmin.from('leads').insert(base).select('id').single())
    }

    if (error) {
      logError(SOURCE, 'supabase insert failed', error)
      return NextResponse.json({ error: 'Erro ao salvar lead' }, { status: 500 })
    }

    return NextResponse.json({ id: data?.id }, { status: 201 })
  } catch (err) {
    logError(SOURCE, 'route exception', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
