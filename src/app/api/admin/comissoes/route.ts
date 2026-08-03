import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { normalizarComissao, resumirComissoes, STATUS_COMISSAO, type StatusComissao } from '@/lib/comissoes/calcular'
import { normalizarParticipantes } from '@/lib/comissoes/participantes'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const SELECT_COMISSAO = `
  *,
  leads(nome, whatsapp),
  empreendimentos(nome, slug),
  captador:crm_corretores!crm_comissoes_corretor_captador_id_fkey(id, nome),
  vendedor:crm_corretores!crm_comissoes_corretor_vendedor_id_fkey(id, nome),
  participantes:crm_comissao_participantes(id, corretor_id, nome, papel, percentual, observacoes, corretor:crm_corretores(id, nome))
`

/**
 * Grava a divisão entre envolvidos pela função do banco, que troca a lista
 * inteira numa transação só. Um delete seguido de N inserts pelo client
 * deixaria a comissão com a divisão pela metade se o insert falhasse no meio
 * — e o valor de cada um sairia errado no relatório sem ninguém perceber.
 */
async function gravarParticipantes(
  client: ReturnType<typeof sb>,
  comissaoId: string,
  bruto: unknown,
): Promise<string | null> {
  const normalizado = normalizarParticipantes(bruto)
  if (!normalizado.ok) return normalizado.erro
  const { error } = await client.rpc('definir_participantes_comissao', {
    p_comissao_id: comissaoId,
    p_participantes: normalizado.participantes,
  })
  return error ? error.message : null
}

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

  // A divisão é validada ANTES da comissão, e não depois: recusar depois
  // deixaria uma comissão órfã no banco só porque a soma passou de 100 — e o
  // resultado aqui também diz se a divisão já identifica quem recebe, o que
  // libera normalizarComissao de exigir um corretor cadastrado.
  const divisaoInvalida = normalizarParticipantes(body.participantes)
  if (!divisaoInvalida.ok) return NextResponse.json({ error: divisaoInvalida.erro }, { status: 400 })

  const normalizado = normalizarComissao(body, { temParticipantesValidos: divisaoInvalida.participantes.length > 0 })
  if (!normalizado.ok) return NextResponse.json({ error: normalizado.erro }, { status: 400 })

  const client = sb()
  const { data, error } = await client.from('crm_comissoes').insert(normalizado.insert).select(SELECT_COMISSAO).single()

  if (error) {
    // Índice único parcial em proposta_id: cada proposta gera no máximo uma
    // comissão, senão a mesma venda seria contada duas vezes no relatório.
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Já existe comissão registrada para esta proposta' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const erroDivisao = await gravarParticipantes(client, data.id, body.participantes)
  if (erroDivisao) return NextResponse.json({ error: erroDivisao }, { status: 400 })

  // Relê para a resposta já sair com a divisão gravada — a tela desenha a
  // partir dela e não deveria precisar de um segundo GET.
  const { data: comDivisao } = await client.from('crm_comissoes').select(SELECT_COMISSAO).eq('id', data.id).single()

  return NextResponse.json({ data: comDivisao ?? data }, { status: 201 })
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

  const client = sb()

  // `participantes` ausente NÃO significa "apague a divisão": os PATCHs que já
  // existiam (mudar status, anotar recebimento) mandam só o campo alterado e
  // zerariam quem recebe o quê.
  if (body.participantes !== undefined) {
    const erroDivisao = await gravarParticipantes(client, id, body.participantes)
    if (erroDivisao) return NextResponse.json({ error: erroDivisao }, { status: 400 })
  }

  const { data, error } = await client.from('crm_comissoes').update(update).eq('id', id).select(SELECT_COMISSAO).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
