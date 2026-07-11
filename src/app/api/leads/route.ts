import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizeEmail, normalizePhone, normalizeString } from '@/lib/leads/normalize'
import { extractIp, isBotSubmission } from '@/lib/leads/anti-spam'
import { checkRateLimit } from '@/lib/leads/rate-limit'
import { logError, logWarn } from '@/lib/log'

export const dynamic = 'force-dynamic'

const SOURCE = 'api/leads'

const GROWTH_FIELDS = [
  'faixa_investimento',
  'prazo_compra',
  'entrada_disponivel',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
] as const

function isMissingColumnError(error: { code?: string; message?: string }) {
  return error.code === 'PGRST204' || /column/i.test(error.message ?? '')
}

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

    // Rate limit por IP: 5 requests/min/IP na captura do formulário
    const rl = checkRateLimit(extractIp(req), {
      identifier: 'leads',
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
    const whatsapp = normalizePhone(body.telefone)
    const email = normalizeEmail(body.email)
    const mensagem = normalizeString(body.mensagem)
    const canalPreferido = normalizeString(body.canal_preferido)
    const paginaOrigem = normalizeString(body.pagina_origem)
    const propertySlug = normalizeString(body.property_slug)
    const propertyIdInput = normalizeString(body.property_id)

    if (!nome || !whatsapp) {
      return NextResponse.json({ error: 'Nome e telefone obrigatorios' }, { status: 400 })
    }

    // Páginas estáticas não conhecem o UUID: resolve pelo slug e aproveita o nome do imóvel
    let resolvedPropertyId = propertyIdInput
    let resolvedPropertyName: string | null = null
    if (!resolvedPropertyId && propertySlug) {
      const { data: prop } = await supabaseAdmin
        .from('properties')
        .select('id, nome')
        .eq('slug', propertySlug)
        .maybeSingle()
      resolvedPropertyId = prop?.id ?? null
      resolvedPropertyName = prop?.nome ?? null
    }

    const anotacoes =
      [mensagem, canalPreferido ? `Canal preferido: ${canalPreferido}` : null]
        .filter(Boolean)
        .join(' | ') || null

    const base: Record<string, unknown> = {
      nome,
      whatsapp,
      email,
      anotacoes,
      source: paginaOrigem,
      property_id: resolvedPropertyId,
      origem: 'Site',
      status: 'novo',
      estagio_funil: 'primeiro_contato',
      requer_atencao: false,
      proximo_followup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    // property_name entra em `extras` — se a coluna não existir no schema, o fallback
    // insert-sem-extras ainda captura o lead (mesmo padrão das colunas de growth).
    const extras: Record<string, unknown> = {}
    if (resolvedPropertyName) extras.property_name = resolvedPropertyName
    for (const field of GROWTH_FIELDS) {
      if (typeof body[field] === 'string' && body[field]) extras[field] = body[field]
    }

    let { data, error } = await supabaseAdmin
      .from('leads')
      .insert({ ...base, ...extras })
      .select('id')
      .single()

    // Colunas de growth / property_name ainda sem migração: não pode derrubar a captação
    if (error && Object.keys(extras).length > 0 && isMissingColumnError(error)) {
      logWarn(SOURCE, 'columns pending — rodar 0002_leads_growth.sql', { db_message: error.message ?? '' })
      ;({ data, error } = await supabaseAdmin.from('leads').insert(base).select('id').single())
    }

    if (error) {
      logError(SOURCE, 'supabase insert failed', error)
      return NextResponse.json({ error: 'Erro ao salvar lead' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id ?? null }, { status: 201 })
  } catch (err) {
    logError(SOURCE, 'route exception', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
