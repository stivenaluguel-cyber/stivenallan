import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'

// CRUD das automações de comentário→DM (ig_comment_automacoes).
// Sem seletor visual de post: media_id é colado à mão (ID do post), evitando
// uma chamada extra à Graph API só pra listar mídia recente na v1.

export const dynamic = 'force-dynamic'

const MATCH_TYPES = new Set(['any', 'contains', 'exact'])

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

function normalizarKeywords(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.map((k) => String(k).trim()).filter(Boolean)
}

function normalizarBotoes(v: unknown): Array<{ title: string; url?: string; payload?: string }> {
  if (!Array.isArray(v)) return []
  return v
    .filter((b): b is { title?: unknown; url?: unknown; payload?: unknown } => b && typeof b === 'object')
    .map((b) => ({
      title: String(b.title ?? '').slice(0, 20),
      ...(typeof b.url === 'string' && b.url ? { url: b.url } : {}),
      ...(typeof b.payload === 'string' && b.payload ? { payload: b.payload } : {}),
    }))
    .filter((b) => b.title && (b.url || b.payload))
    .slice(0, 3)
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await sb().from('ig_comment_automacoes').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  if (!body || typeof body.nome !== 'string' || !body.nome.trim()) {
    return NextResponse.json({ error: 'Campo obrigatório: nome' }, { status: 400 })
  }
  const matchType = MATCH_TYPES.has(body.match_type) ? body.match_type : 'contains'

  const linha = {
    nome: body.nome.trim(),
    ativo: body.ativo !== false,
    media_id: typeof body.media_id === 'string' && body.media_id.trim() ? body.media_id.trim() : null,
    keywords: normalizarKeywords(body.keywords),
    match_type: matchType,
    only_once_per_user: body.only_once_per_user !== false,
    public_reply: typeof body.public_reply === 'string' && body.public_reply.trim() ? body.public_reply.trim() : null,
    dm_message: typeof body.dm_message === 'string' && body.dm_message.trim() ? body.dm_message.trim() : null,
    dm_buttons: normalizarBotoes(body.dm_buttons),
    require_follow: body.require_follow === true,
    follow_prompt: typeof body.follow_prompt === 'string' && body.follow_prompt.trim() ? body.follow_prompt.trim() : null,
  }

  const { data, error } = await sb().from('ig_comment_automacoes').insert(linha).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  if (!body || typeof body.id !== 'string') {
    return NextResponse.json({ error: 'Campo obrigatório: id' }, { status: 400 })
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.nome === 'string') patch.nome = body.nome.trim()
  if (typeof body.ativo === 'boolean') patch.ativo = body.ativo
  if ('media_id' in body) patch.media_id = typeof body.media_id === 'string' && body.media_id.trim() ? body.media_id.trim() : null
  if ('keywords' in body) patch.keywords = normalizarKeywords(body.keywords)
  if (MATCH_TYPES.has(body.match_type)) patch.match_type = body.match_type
  if (typeof body.only_once_per_user === 'boolean') patch.only_once_per_user = body.only_once_per_user
  if ('public_reply' in body) patch.public_reply = typeof body.public_reply === 'string' && body.public_reply.trim() ? body.public_reply.trim() : null
  if ('dm_message' in body) patch.dm_message = typeof body.dm_message === 'string' && body.dm_message.trim() ? body.dm_message.trim() : null
  if ('dm_buttons' in body) patch.dm_buttons = normalizarBotoes(body.dm_buttons)
  if (typeof body.require_follow === 'boolean') patch.require_follow = body.require_follow
  if ('follow_prompt' in body) patch.follow_prompt = typeof body.follow_prompt === 'string' && body.follow_prompt.trim() ? body.follow_prompt.trim() : null

  const { data, error } = await sb().from('ig_comment_automacoes').update(patch).eq('id', body.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Parâmetro obrigatório: id' }, { status: 400 })

  const { error } = await sb().from('ig_comment_automacoes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
