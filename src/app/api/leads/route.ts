import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nome, telefone, email, mensagem, canal_preferido, empreendimento_slug, pagina_origem } = body

    if (!nome || !telefone) {
      return NextResponse.json({ error: 'Nome e telefone obrigatorios' }, { status: 400 })
    }

    let empreendimento_id: string | null = null
    if (empreendimento_slug) {
      const { data: emp } = await supabaseAdmin
        .from('empreendimentos')
        .select('id')
        .eq('slug', empreendimento_slug)
        .single()
      if (emp) empreendimento_id = emp.id
    }

    const { error } = await supabaseAdmin.from('leads').insert({
      nome,
      telefone,
      email: email || null,
      mensagem: mensagem || null,
      canal_preferido: canal_preferido || 'whatsapp',
      empreendimento_id,
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
