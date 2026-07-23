import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'
import { parseSegmento } from '@/lib/campanhas/segmento'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function auth() {
  const s = await cookies(); const t = s.get('dashboard_token')?.value; if (!t) return false
  try { await jwtVerify(t, new TextEncoder().encode(process.env.JWT_SECRET!)); return true } catch { return false }
}

export async function GET() {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb().from('campanhas').select('*').order('criado_em', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const titulo = typeof body.titulo === 'string' ? body.titulo.trim() : ''
  const assunto = typeof body.assunto === 'string' ? body.assunto.trim() : ''
  const corpo_html = typeof body.corpo_html === 'string' ? body.corpo_html : ''
  if (!titulo || !assunto || !corpo_html) {
    return NextResponse.json({ error: 'titulo, assunto e corpo_html são obrigatórios' }, { status: 400 })
  }
  const segmento = parseSegmento(body.segmento)
  const { data, error } = await sb().from('campanhas').insert({ titulo, assunto, corpo_html, segmento }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
