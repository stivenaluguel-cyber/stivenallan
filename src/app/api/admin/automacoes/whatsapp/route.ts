import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function auth() {
  const s = await cookies(); const t = s.get('dashboard_token')?.value; if (!t) return false
  try { await jwtVerify(t, new TextEncoder().encode(process.env.JWT_SECRET!)); return true } catch { return false }
}

export async function GET() {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [{ data: intervalos, error: e1 }, { data: mensagens, error: e2 }] = await Promise.all([
    sb().from('automacao_whatsapp_intervalos').select('ordem, dias').order('ordem', { ascending: true }),
    sb().from('automacao_whatsapp_mensagens').select('estagio_funil, ordem, mensagem').order('estagio_funil', { ascending: true }).order('ordem', { ascending: true }),
  ])
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 })
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })
  return NextResponse.json({ intervalos: intervalos ?? [], mensagens: mensagens ?? [] })
}

// Substitui o conjunto inteiro de regras (o painel de edição sempre manda o
// estado completo — mais simples e seguro que diffs parciais pra uma tabela
// pequena que só um corretor edita).
export async function PUT(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const intervalos: { ordem: number; dias: number }[] = Array.isArray(body.intervalos) ? body.intervalos : []
  const mensagens: { estagio_funil: string; ordem: number; mensagem: string }[] = Array.isArray(body.mensagens) ? body.mensagens : []

  if (intervalos.length === 0 || mensagens.length === 0) {
    return NextResponse.json({ error: 'intervalos e mensagens não podem ficar vazios (o cron cairia no fallback hardcoded).' }, { status: 400 })
  }

  const client = sb()
  const { error: delErr1 } = await client.from('automacao_whatsapp_intervalos').delete().gte('ordem', 0)
  if (delErr1) return NextResponse.json({ error: delErr1.message }, { status: 500 })
  const { error: insErr1 } = await client.from('automacao_whatsapp_intervalos').insert(intervalos)
  if (insErr1) return NextResponse.json({ error: insErr1.message }, { status: 500 })

  const { error: delErr2 } = await client.from('automacao_whatsapp_mensagens').delete().gte('ordem', 0)
  if (delErr2) return NextResponse.json({ error: delErr2.message }, { status: 500 })
  const { error: insErr2 } = await client.from('automacao_whatsapp_mensagens').insert(mensagens)
  if (insErr2) return NextResponse.json({ error: insErr2.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
