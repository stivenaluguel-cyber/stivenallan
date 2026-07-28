import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { normalizarProposta } from '@/lib/propostas/normalizar-proposta'
import { registrarMudancaEstagio } from '@/lib/leads/registrar-mudanca-estagio'
import { getActiveFocusSession, recordFocusEvent } from '@/lib/dashboard/focus-session-events'
import { requireAdmin } from '@/lib/dashboard/admin-auth'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const lead_id = searchParams.get('lead_id')
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  // Colunas reais: `leads` não tem `telefone` (é `whatsapp`) e
  // `empreendimentos_unidades` não tem `tipologia`/`valor_base` — o join
  // antigo pedia campos inexistentes e derrubava a listagem inteira.
  let q = sb().from('crm_propostas').select(`
    *,
    leads(nome, whatsapp, email),
    empreendimentos(nome, slug),
    empreendimentos_unidades(unidade, bloco, metragem, valor_tabela)
  `, { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limit - 1)

  if (lead_id) q = q.eq('lead_id', lead_id)
  if (status) q = q.eq('status', status)

  const { data, error, count } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count, page, limit })
}

export async function POST(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })

  const normalizado = normalizarProposta(body, adminId)
  if (!normalizado.ok) return NextResponse.json({ error: normalizado.erro }, { status: 400 })
  const insert = normalizado.insert

  const client = sb()

  // O lead precisa existir de verdade — uma proposta órfã contaria pontos
  // sem ter dono.
  const { data: leadAtual } = await client.from('leads').select('id, estagio_funil').eq('id', insert.lead_id).maybeSingle()
  if (!leadAtual) return NextResponse.json({ error: 'Lead nao encontrado' }, { status: 404 })

  // Retry da MESMA intenção: devolve a proposta que já existe em vez de
  // criar uma segunda. Cobre o caso "proposta gravou, o passo seguinte
  // falhou, usuário tentou de novo".
  if (insert.client_event_id) {
    const { data: existente } = await client.from('crm_propostas').select('*').eq('client_event_id', insert.client_event_id).maybeSingle()
    if (existente) return NextResponse.json({ data: existente, alreadyExists: true })
  }

  // `numero` NÃO é enviado daqui: vem do default da coluna (sequence), que
  // é atômico e sequencial de verdade — gerar no aplicativo exigiria um
  // max()+1 sujeito a corrida entre duas criações simultâneas.
  const { data, error } = await client.from('crm_propostas').insert(insert).select().single()

  if (error) {
    // 23505 = corrida com o mesmo client_event_id: a outra requisição
    // ganhou. Devolve o que ela criou, nunca duplica.
    if (error.code === '23505' && insert.client_event_id) {
      const { data: existente } = await client.from('crm_propostas').select('*').eq('client_event_id', insert.client_event_id).maybeSingle()
      if (existente) return NextResponse.json({ data: existente, alreadyExists: true })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Só a partir daqui a proposta existe de fato. Tudo o que vem abaixo é
  // consequência dela — inclusive a pontuação.
  if (leadAtual.estagio_funil !== 'proposta_enviada') {
    await registrarMudancaEstagio(client, insert.lead_id, leadAtual.estagio_funil, 'proposta_enviada')
    await client.from('leads').update({ estagio_funil: 'proposta_enviada', updated_at: new Date().toISOString() }).eq('id', insert.lead_id)
  }
  await client.from('leads_interacoes').insert({
    lead_id: insert.lead_id,
    tipo: 'proposta',
    descricao: 'Proposta ' + data.numero + ' criada no valor de ' + Number(insert.valor_proposto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
  })

  // Pontuação do Modo Foco: só quando existe sessão ativa E o lead faz parte
  // da fila daquela sessão. Sem essa segunda checagem, criar uma proposta
  // para um lead qualquer renderia pontos numa sessão que nem inclui ele.
  // clientEventId derivado do id da proposta: um retry que caia aqui de novo
  // reaproveita a mesma chave e não pontua em dobro.
  const sessaoAtiva = await getActiveFocusSession(client, adminId)
  if (sessaoAtiva) {
    const { data: itemDaSessao } = await client
      .from('crm_focus_session_leads')
      .select('lead_id')
      .eq('session_id', sessaoAtiva.id)
      .eq('lead_id', insert.lead_id)
      .maybeSingle()

    if (itemDaSessao) {
      await recordFocusEvent(client, {
        sessionId: sessaoAtiva.id, leadId: insert.lead_id, adminId,
        actionType: 'proposta_enviada',
        metadata: { propostaId: data.id, numero: data.numero },
        clientEventId: uuidDaProposta(data.id),
      })
    }
  }

  return NextResponse.json({ data, alreadyExists: false }, { status: 201 })
}

// O id da proposta JÁ é um uuid e é único por proposta — usá-lo como chave
// de idempotência do evento garante que a mesma proposta nunca pontue duas
// vezes, mesmo que este trecho seja reexecutado num retry.
function uuidDaProposta(propostaId: string): string {
  return propostaId
}

export async function PATCH(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, ...update } = body
  if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })

  update.updated_at = new Date().toISOString()
  const client = sb()

  if (update.status === 'aceita') {
    const { data: prop } = await client.from('crm_propostas').select('lead_id, valor_proposto').eq('id', id).single()
    if (prop) {
      const { data: leadAtual } = await client.from('leads').select('estagio_funil').eq('id', prop.lead_id).single()
      if (leadAtual && leadAtual.estagio_funil !== 'fechado') {
        await registrarMudancaEstagio(client, prop.lead_id, leadAtual.estagio_funil, 'fechado')
      }
      await client.from('leads').update({ estagio_funil: 'fechado', updated_at: new Date().toISOString() }).eq('id', prop.lead_id)
      await client.from('leads_interacoes').insert({ lead_id: prop.lead_id, tipo: 'proposta_aceita', descricao: 'Proposta aceita: R$ ' + Number(prop.valor_proposto).toLocaleString('pt-BR') })

      const sessaoAtiva = await getActiveFocusSession(client, adminId)
      if (sessaoAtiva && leadAtual) {
        await recordFocusEvent(client, {
          sessionId: sessaoAtiva.id, leadId: prop.lead_id, adminId,
          actionType: 'etapa_alterada', previousStage: leadAtual.estagio_funil, nextStage: 'fechado',
          clientEventId: randomUUID(),
        })
      }
    }
  }

  const { data, error } = await client.from('crm_propostas').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
