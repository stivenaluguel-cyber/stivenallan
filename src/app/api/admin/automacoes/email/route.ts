import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autenticado } from '@/lib/dashboard/auth-check'
import { validarCadenciaEmail } from '@/lib/automacoes/validacao'
import { logWarn } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb().from('automacao_email_passos').select('ordem, dias_minimos, assunto, corpo_html').order('ordem', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ passos: data ?? [] })
}

export async function PUT(req: NextRequest) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const passos: { ordem: number; dias_minimos: number; assunto: string; corpo_html: string }[] = Array.isArray(body.passos) ? body.passos : []

  const erros = validarCadenciaEmail(passos)
  if (erros.length > 0) {
    return NextResponse.json({ error: erros.join(' ') }, { status: 400 })
  }

  const client = sb()

  // Estado anterior pra registrar em automacao_historico — fail-open.
  const { data: passosAntes } = await client.from('automacao_email_passos').select('ordem, dias_minimos, assunto, corpo_html')

  const { error: delErr } = await client.from('automacao_email_passos').delete().gte('ordem', 0)
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })
  const { error: insErr } = await client.from('automacao_email_passos').insert(passos)
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

  try {
    await client.from('automacao_historico').insert({
      tipo: 'email',
      payload_antes: passosAntes ?? [],
      payload_depois: passos,
    })
  } catch (err) {
    logWarn('admin/automacoes/email', 'automacao_historico insert falhou (cadência salva normalmente)', {
      error: err instanceof Error ? err.message : String(err),
    })
  }

  return NextResponse.json({ success: true })
}
