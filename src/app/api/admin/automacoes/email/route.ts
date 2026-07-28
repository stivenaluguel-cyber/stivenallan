import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb().from('automacao_email_passos').select('ordem, dias_minimos, assunto, corpo_html').order('ordem', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ passos: data ?? [] })
}

export async function PUT(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const passos: { ordem: number; dias_minimos: number; assunto: string; corpo_html: string }[] = Array.isArray(body.passos) ? body.passos : []

  if (passos.length === 0) {
    return NextResponse.json({ error: 'passos não pode ficar vazio (o cron cairia no fallback hardcoded).' }, { status: 400 })
  }

  const client = sb()
  const { error: delErr } = await client.from('automacao_email_passos').delete().gte('ordem', 0)
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })
  const { error: insErr } = await client.from('automacao_email_passos').insert(passos)
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
