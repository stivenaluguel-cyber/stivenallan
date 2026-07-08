import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

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

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    const body = await req.json()
    const { nome, telefone, email, mensagem, canal_preferido, pagina_origem, property_id } = body

    if (!nome || !telefone) {
      return NextResponse.json({ error: 'Nome e telefone obrigatorios' }, { status: 400 })
    }

    const base: Record<string, unknown> = {
      nome,
      whatsapp: telefone,
      email: email || null,
      anotacoes: [mensagem, canal_preferido ? `Canal preferido: ${canal_preferido}` : null].filter(Boolean).join(' | ') || null,
      source: pagina_origem || null,
      property_id: property_id || null,
      origem: 'Site',
      status: 'novo',
    }

    const extras: Record<string, unknown> = {}
    for (const field of GROWTH_FIELDS) {
      if (typeof body[field] === 'string' && body[field]) extras[field] = body[field]
    }

    let { error } = await supabaseAdmin.from('leads').insert({ ...base, ...extras })

    // Colunas de growth ainda sem migração: não pode derrubar a captação
    if (error && Object.keys(extras).length > 0 && isMissingColumnError(error)) {
      console.error('Colunas de growth ausentes (rodar 0002_leads_growth.sql):', error.message)
      ;({ error } = await supabaseAdmin.from('leads').insert(base))
    }

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Erro ao salvar lead' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('Route error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
