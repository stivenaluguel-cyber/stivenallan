import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { token, novaSenha } = await request.json()

    if (!token || !novaSenha) {
      return NextResponse.json({ error: 'Token e nova senha obrigatorios' }, { status: 400 })
    }

    if (novaSenha.length < 8) {
      return NextResponse.json({ error: 'Senha deve ter ao menos 8 caracteres' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: resetToken, error } = await supabase
      .from('password_reset_tokens')
      .select('*, admin_users(id, email)')
      .eq('token', token)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !resetToken) {
      return NextResponse.json({ error: 'Token invalido ou expirado' }, { status: 400 })
    }

    const hashNovaSenha = await bcrypt.hash(novaSenha, 10)

    await supabase
      .from('admin_users')
      .update({ senha_hash: hashNovaSenha, updated_at: new Date().toISOString() })
      .eq('id', resetToken.admin_id)

    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', resetToken.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Redefinir senha error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
