import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const { nome, telefone, email, mensagem, canal_preferido, empreendimento_slug, pagina_origem, property_id } = body

    if (!nome || !telefone) {
      return NextResponse.json({ error: 'Nome e telefone obrigatorios' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from('leads').insert({
      nome,
      telefone,
      email: email || null,
      mensagem: mensagem || null,
      canal_preferido: canal_preferido || 'whatsapp',
      property_id: property_id || null,
      pagina_origem: pagina_origem || null,
      status: 'novo',
    })

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
