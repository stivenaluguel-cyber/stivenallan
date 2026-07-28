import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { recordFocusEvent } from '@/lib/dashboard/focus-session-events'
import { FOCUS_ACTIONS_SOMENTE_SERVIDOR, resolveTrustedNextStage, type FocusActionType } from '@/lib/dashboard/focus-scoring'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const ACTION_TYPES = new Set<FocusActionType>([
  'pular', 'perdido', 'followup_agendado', 'visita_agendada',
  'visita_concluida', 'visita_nao_ocorreu', 'contato_confirmado',
  'anotacao', 'etapa_alterada', 'proposta_enviada', 'adiado',
])

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Sanitização simples de texto livre vindo do cliente (motivo/observação):
// corta tamanho e remove apenas o que quebraria o JSON armazenado — a
// mutação real do lead (estagio_funil, anotações, agenda) já passa pelos
// endpoints existentes antes desta chamada; aqui só auditamos/pontuamos.
function sanitizeMetadata(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === 'string') out[k] = v.slice(0, 500)
    else if (typeof v === 'number' || typeof v === 'boolean' || v === null) out[k] = v
    else continue
  }
  return out
}

// Ponto único de mutação para toda ação do Modo Foco: valida que a sessão é
// do próprio admin e está ativa, valida que o lead existe, e delega a
// gravação idempotente + soma de pontos pro serviço compartilhado. A
// mutação de negócio em si (mudar estagio_funil, criar linha na agenda,
// salvar anotação) já aconteceu via os endpoints existentes antes desta
// chamada ser feita pelo frontend — esta rota nunca duplica essa lógica,
// só registra que a ação aconteceu dentro da sessão e pontua.
export async function POST(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })

  const { sessionId, leadId, actionType, previousStage, nextStage, clientEventId } = body
  if (!sessionId || !leadId || !actionType) {
    return NextResponse.json({ error: 'sessionId, leadId e actionType são obrigatórios' }, { status: 400 })
  }
  if (!ACTION_TYPES.has(actionType)) {
    return NextResponse.json({ error: 'actionType desconhecido: ' + actionType }, { status: 400 })
  }
  // 'proposta_enviada' vale 25 pontos e só é legítima se existir uma
  // proposta de verdade — ela é registrada pelo fluxo que cria a proposta
  // (/api/admin/propostas), nunca aqui. Sem esta trava, um POST manual
  // neste endpoint rendia os pontos sem proposta nenhuma.
  if (FOCUS_ACTIONS_SOMENTE_SERVIDOR.has(actionType)) {
    return NextResponse.json(
      { error: 'actionType so pode ser registrado pelo fluxo real correspondente: ' + actionType },
      { status: 403 },
    )
  }
  // clientEventId é a chave de idempotência: um UUID por INTENÇÃO do
  // usuário, gerado no frontend. Um clique duplo ou um retry de rede da
  // MESMA requisição reaproveita o mesmo id (o unique index em
  // (session_id, client_event_id) barra a repetição); uma ação nova —
  // mesmo que seja o mesmo lead/ação de novo — sempre manda outro id, então
  // nunca bloqueia repetições legítimas (dois follow-ups, duas anotações).
  if (typeof clientEventId !== 'string' || !UUID_RE.test(clientEventId)) {
    return NextResponse.json({ error: 'clientEventId é obrigatório e deve ser um UUID' }, { status: 400 })
  }
  if (actionType === 'perdido') {
    const motivo = (body.metadata ?? {}).motivo
    const MOTIVOS = ['sem_interesse', 'sem_retorno', 'orcamento_incompativel', 'comprou_com_outro', 'cadastro_invalido', 'outro']
    if (!MOTIVOS.includes(motivo)) {
      return NextResponse.json({ error: 'metadata.motivo inválido para ação perdido' }, { status: 400 })
    }
    if (motivo === 'outro' && !String((body.metadata ?? {}).detalhe ?? '').trim()) {
      return NextResponse.json({ error: 'metadata.detalhe é obrigatório quando motivo é "outro"' }, { status: 400 })
    }
  }

  const client = sb()

  const { data: sessao, error: sessaoError } = await client
    .from('crm_focus_sessions')
    .select('id, admin_id, status')
    .eq('id', sessionId)
    .single()
  if (sessaoError || !sessao) return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 })
  if (sessao.admin_id !== adminId) return NextResponse.json({ error: 'Sessão não pertence a este usuário' }, { status: 403 })
  if (sessao.status !== 'ativa') return NextResponse.json({ error: 'Sessão não está ativa' }, { status: 409 })

  const { data: lead, error: leadError } = await client.from('leads').select('id, estagio_funil').eq('id', leadId).single()
  if (leadError || !lead) return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })

  const nextStageConfiavel = resolveTrustedNextStage(actionType, lead.estagio_funil, nextStage ?? null)

  try {
    const result = await recordFocusEvent(client, {
      sessionId,
      leadId,
      adminId,
      actionType,
      previousStage: previousStage ?? null,
      nextStage: nextStageConfiavel,
      metadata: sanitizeMetadata(body.metadata),
      clientEventId,
      snoozedUntil: typeof body.snoozedUntil === 'string' ? body.snoozedUntil : null,
    })
    if (result.error === 'item_nao_pertence_a_sessao') {
      return NextResponse.json({ error: 'Este lead não faz parte da sessão atual' }, { status: 409 })
    }
    return NextResponse.json({ data: result })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro ao registrar evento' }, { status: 500 })
  }
}
