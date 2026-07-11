import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizeEmail, normalizePhone, normalizeString } from '@/lib/leads/normalize'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Configuracao incompleta' }, { status: 503 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    const body = await req.json()

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
      property_name: propertyName,
      origem: 'Site',
      estagio_funil: 'primeiro_contato',
      source: 'book_download',
      requer_atencao: false,
      proximo_followup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    const growthFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'] as const
    const extras: Record<string, unknown> = {}
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
      console.error('Colunas de growth ausentes (rodar 0002_leads_growth.sql):', error.message)
      ;({ data, error } = await supabaseAdmin.from('leads').insert(base).select('id').single())
    }

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Erro ao salvar lead' }, { status: 500 })
    }

    return NextResponse.json({ id: data?.id }, { status: 201 })
  } catch (err) {
    console.error('Route error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
