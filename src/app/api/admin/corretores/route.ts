import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { normalizePhone } from '@/lib/leads/normalize'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const texto = (v: unknown, max = 200): string | null =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null

// Corretores parceiros da rede. admin_id é opcional de propósito: um
// parceiro pode participar de vendas e receber comissão sem nunca ter
// login no painel.
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const incluirInativos = new URL(req.url).searchParams.get('incluirInativos') === 'true'
  let q = sb().from('crm_corretores').select('*').order('nome')
  if (!incluirInativos) q = q.eq('ativo', true)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })

  const nome = texto(body.nome)
  if (!nome) return NextResponse.json({ error: 'nome é obrigatório' }, { status: 400 })

  const percentual = body.percentual_padrao === undefined ? 6 : Number(body.percentual_padrao)
  if (!Number.isFinite(percentual) || percentual < 0 || percentual > 100) {
    return NextResponse.json({ error: 'percentual_padrao deve estar entre 0 e 100' }, { status: 400 })
  }

  const { data, error } = await sb()
    .from('crm_corretores')
    .insert({
      nome,
      creci: texto(body.creci, 30),
      // Mesma normalização dos leads — evita o mesmo corretor cadastrado
      // com o telefone em dois formatos diferentes.
      whatsapp: body.whatsapp ? normalizePhone(body.whatsapp) : null,
      email: texto(body.email, 254)?.toLowerCase() ?? null,
      percentual_padrao: percentual,
      observacoes: texto(body.observacoes, 1000),
      admin_id: texto(body.admin_id, 64),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const id = texto(body?.id, 64)
  if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.nome !== undefined) {
    const nome = texto(body.nome)
    if (!nome) return NextResponse.json({ error: 'nome nao pode ficar vazio' }, { status: 400 })
    update.nome = nome
  }
  if (body.creci !== undefined) update.creci = texto(body.creci, 30)
  if (body.whatsapp !== undefined) update.whatsapp = body.whatsapp ? normalizePhone(body.whatsapp) : null
  if (body.email !== undefined) update.email = texto(body.email, 254)?.toLowerCase() ?? null
  if (body.observacoes !== undefined) update.observacoes = texto(body.observacoes, 1000)
  if (typeof body.ativo === 'boolean') update.ativo = body.ativo
  if (body.percentual_padrao !== undefined) {
    const p = Number(body.percentual_padrao)
    if (!Number.isFinite(p) || p < 0 || p > 100) {
      return NextResponse.json({ error: 'percentual_padrao deve estar entre 0 e 100' }, { status: 400 })
    }
    update.percentual_padrao = p
  }

  const { data, error } = await sb().from('crm_corretores').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
