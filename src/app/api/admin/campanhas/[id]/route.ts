import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseSegmento } from '@/lib/campanhas/segmento'
import { aggregateCampanhaEventos } from '@/lib/dashboard/campanhas-stats'
import { autenticado } from '@/lib/dashboard/auth-check'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { data: campanha, error } = await sb().from('campanhas').select('*').eq('id', id).single()
  if (error || !campanha) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })

  const { data: destinatarios } = await sb().from('campanha_destinatarios').select('status').eq('campanha_id', id)
  const contagem = { pendente: 0, enviado: 0, erro: 0 }
  for (const d of destinatarios ?? []) {
    if (d.status in contagem) contagem[d.status as keyof typeof contagem]++
  }

  const { data: eventos } = await sb().from('campanha_eventos').select('tipo').eq('campanha_id', id)
  const stats = aggregateCampanhaEventos(eventos ?? [])

  return NextResponse.json({ data: campanha, destinatarios: contagem, stats })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { data: atual } = await sb().from('campanhas').select('status').eq('id', id).single()
  if (!atual) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
  if (atual.status !== 'rascunho') {
    return NextResponse.json({ error: 'Só é possível editar campanhas em rascunho' }, { status: 400 })
  }

  const body = await req.json()
  const update: Record<string, unknown> = {}
  if (typeof body.titulo === 'string') update.titulo = body.titulo.trim()
  if (typeof body.assunto === 'string') update.assunto = body.assunto.trim()
  if (typeof body.corpo_html === 'string') update.corpo_html = body.corpo_html
  if (body.segmento !== undefined) update.segmento = parseSegmento(body.segmento)

  const { data, error } = await sb().from('campanhas').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { data: atual } = await sb().from('campanhas').select('status').eq('id', id).single()
  if (!atual) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
  if (atual.status !== 'rascunho' && atual.status !== 'erro') {
    return NextResponse.json({ error: 'Só é possível excluir campanhas em rascunho ou com erro' }, { status: 400 })
  }
  const { error } = await sb().from('campanhas').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
