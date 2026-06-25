import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { createToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json()

    if (!email || !senha) {
      return NextResponse.json({ error: 'Email e senha obrigatorios' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !admin) {
      return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 })
    }

    const senhaValida = await bcrypt.compare(senha, admin.senha_hash)
    if (!senhaValida) {
      return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 })
    }

    const token = await createToken(admin.id)

    const response = NextResponse.json({ success: true, nome: admin.nome })
    response.cookies.set('dashboard_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: '/'
    })

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
