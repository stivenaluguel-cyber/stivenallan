import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { normalizarComissao, resumirComissoes, STATUS_COMISSAO, type StatusComissao } from '@/lib/comissoes/calcular'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const SELECT_COMISSAO = `
  *,
  leads(nome, whatsapp),
  empreendimentos(nome, slug),
  captador:crm_corretores!crm_comissoes_corretor_captador_id_fkey(id, nome),
  vendedor:crm_corretores!crm_comissoes_corretor_vendedor_id_fkey(id, nome)
`

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const corretorId = searchParams.get('corretorId')

  let q = sb().from('crm_comissoes').select(SELECT_COMISSAO).order('data_venda', { ascending: false, nullsFirst: false })
  if (status && (STATUS_COMISSAO as readonly string[]).includes(status)) q = q.eq('status', status)
  // Um corretor aparece no negócio como captador OU como vendedor — filtrar
  // só por um dos dois esconderia metade das comissões dele.
  if (corretorId) q = q.or(`corretor_captador_id.eq.${corretorId},corretor_vendedor_id.eq.${corretorId}`)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, resumo: resumirComissoes(data ?? []) })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })

  const normalizado = normalizarComissao(body)
  if (!normalizado.ok) return NextResponse.json({ error: normalizado.erro }, { status: 400 })

  const { data, error } = await sb().from('crm_comissoes').insert(normalizado.insert).select(SELECT_COMISSAO).single()

  if (error) {
    // Índice único parcial em proposta_id: cada proposta gera no máximo uma
    // comissão, senão a mesma venda seria contada duas vezes no relatório.
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Já existe comissão registrada para esta proposta' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const id = typeof body?.id === 'string' ? body.id : null
  if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (body.status !== undefined) {
    if (!(STATUS_COMISSAO as readonly string[]).includes(body.status)) {
      return NextResponse.json({ error: 'status invalido' }, { status: 400 })
    }
    update.status = body.status as StatusComissao
    // "Recebida" sem data de recebimento deixaria o relatório de caixa sem
    // como responder "recebemos quando?".
    if (body.status === 'recebida' && !body.data_recebimento) {
      update.data_recebimento = new Date().toISOString().slice(0, 10)
    }
  }

  if (body.data_recebimento !== undefined) {
    const d = body.data_recebimento
    if (d !== null && !/^\d{4}-\d{2}-\d{2}$/.test(String(d))) {
      return NextResponse.json({ error: 'data_recebimento deve estar no formato AAAA-MM-DD' }, { status: 400 })
    }
    update.data_recebimento = d
  }

  if (body.observacoes !== undefined) {
    update.observacoes = typeof body.observacoes === 'string' ? body.observacoes.slice(0, 1000) : null
  }

  const { data, error } = await sb().from('crm_comissoes').update(update).eq('id', id).select(SELECT_COMISSAO).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
