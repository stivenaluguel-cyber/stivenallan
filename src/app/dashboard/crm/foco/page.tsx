'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Filter } from 'lucide-react'
import { D, tempInfo } from '@/components/dashboard/focus/tokens'
import { FocusModeHeader } from '@/components/dashboard/focus/FocusModeHeader'
import { FocusLeadCard } from '@/components/dashboard/focus/FocusLeadCard'
import { FocusPrimaryActions } from '@/components/dashboard/focus/FocusPrimaryActions'
import { FollowUpModal, type FollowUpPayload } from '@/components/dashboard/focus/FollowUpModal'
import { VisitModal, type AgendarVisitaPayload } from '@/components/dashboard/focus/VisitModal'
import { LostReasonModal, type LostReasonPayload } from '@/components/dashboard/focus/LostReasonModal'
import { StageChangePrompt } from '@/components/dashboard/focus/StageChangePrompt'
import { FocusSessionSummary, type FocusSessionBreakdown } from '@/components/dashboard/focus/FocusSessionSummary'
import { useFocusSession } from '@/lib/dashboard/use-focus-session'
import { useFocusQueue } from '@/lib/dashboard/use-focus-queue'
import { useFocusActionRunner } from '@/lib/dashboard/use-focus-action-runner'
import type { FocusQueueFilters } from '@/lib/dashboard/focus-queue'
import { createAgendaEvento, patchAgendaEvento, patchLead, postFocusEvent, salvarNotaIdempotente } from '@/lib/dashboard/focus-client'
import { ESTAGIOS_FUNIL } from '@/lib/dashboard/estagios'
import { temWhatsappReal } from '@/lib/leads/normalize'

const FILTROS_STORAGE_KEY = 'modo-foco-filtros-v1'

// Filtro de temperatura como toggle sempre visível na abertura do Modo
// Foco (não escondido dentro do painel "Filtros") — é o filtro mais usado
// pra recortar a fila rapidamente. `v` é o mesmo valor numérico de
// lead.temperatura (tokens.ts); reaproveitar tempInfo(v) evita duplicar
// cor/emoji/label que já existem lá.
const TEMP_FILTROS: { value: NonNullable<FocusQueueFilters['temperatura']>; v: number }[] = [
  { value: 'quente', v: 3 },
  { value: 'morno', v: 2 },
  { value: 'frio', v: 1 },
]

type ModalAberto = 'followup' | 'visita' | 'perdido' | 'stagechange' | null
type Feedback = { mensagem: string; href?: string; cta?: string }

function carregarFiltrosSalvos(): FocusQueueFilters {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(FILTROS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function primeiroNome(nome?: string | null) {
  return nome?.trim().split(/\s+/)[0] || 'tudo bem'
}

function interessePrincipal(lead: { empreendimentos?: { nome?: string } | null; property_name?: string | null }) {
  return lead.empreendimentos?.nome ?? lead.property_name ?? null
}

// A situação usada aqui é a MESMA razão já mostrada no bloco "Por que está
// aqui" do card (mesma ordem de prioridade de focus-guidance.ts) — a
// mensagem só traduz esse motivo real para um texto que o corretor pode
// editar antes de enviar, nunca inventa contexto que não exista nos dados.
function mensagemWhatsApp(item: NonNullable<ReturnType<typeof useFocusQueue>['current']>) {
  const nome = primeiroNome(item.lead.nome)
  const interesse = interessePrincipal(item.lead)
  const sobre = interesse ? ` sobre o ${interesse}` : ''
  if (item.followupVencido) return `Olá, ${nome}! Tudo bem? Passando para retomar nosso contato${sobre}. Posso te ajudar com alguma informação?`
  if (item.agendaVencida) return `Olá, ${nome}! Tudo bem? Vi que ficamos de nos falar${sobre} e o compromisso ficou pendente. Podemos remarcar?`
  if (item.nuncaContatado) return `Olá, ${nome}! Tudo bem? Sou da Stiven Allan. Vi seu interesse${sobre} e estou à disposição para te ajudar.`
  if (item.quente) return `Olá, ${nome}! Tudo bem? Notei seu interesse${sobre} e queria entender melhor o que você procura — posso te ajudar agora?`
  return `Olá, ${nome}! Tudo bem? Estou passando para saber se ainda faz sentido conversarmos${sobre}.`
}

export default function FocusModePage() {
  const router = useRouter()
  const [filters, setFilters] = useState<FocusQueueFilters>(() => carregarFiltrosSalvos())
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [modal, setModal] = useState<ModalAberto>(null)
  const [contatoPendenteLeadId, setContatoPendenteLeadId] = useState<string | null>(null)
  const [encerrada, setEncerrada] = useState(false)
  const [breakdown, setBreakdown] = useState<FocusSessionBreakdown | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const { session, monthPoints, loading: sessionLoading, error: sessionError, start, finish, applyDelta, reload: reloadSession } = useFocusSession()
  const { items, current, loading: queueLoading, error: queueError, refetch, advancePast, updateLeadLocally } = useFocusQueue(filters)
  const runner = useFocusActionRunner()

  const sessaoIniciadaRef = useRef(false)

  useEffect(() => {
    window.localStorage.setItem(FILTROS_STORAGE_KEY, JSON.stringify(filters))
  }, [filters])

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 6000)
    return () => window.clearTimeout(timer)
  }, [feedback])

  // Inicia a sessão automaticamente assim que soubermos quantos leads
  // existem na fila — só uma vez (o ref evita criar uma segunda sessão em
  // re-renders). Se já existir uma sessão 'ativa' (retomada), não mexe nela.
  useEffect(() => {
    if (sessionLoading || queueLoading || sessaoIniciadaRef.current || encerrada) return
    if (session) { sessaoIniciadaRef.current = true; return }
    if (items.length === 0) return
    sessaoIniciadaRef.current = true
    start(items.length, filters as Record<string, unknown>)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading, queueLoading, session, items.length, encerrada])

  const carregarResumo = useCallback(async (sessionId: string) => {
    const res = await fetch('/api/admin/focus/sessions/' + sessionId)
    const json = await res.json()
    if (res.ok) setBreakdown(json.breakdown)
  }, [])

  // A fila esvaziou durante uma sessão já em andamento — encerra
  // automaticamente e mostra o resumo (não é o mesmo caso de "nunca teve
  // leads", tratado como estado vazio simples mais abaixo).
  useEffect(() => {
    if (encerrada || !session || session.status !== 'ativa') return
    if (queueLoading || items.length > 0) return
    if (!sessaoIniciadaRef.current) return
    ;(async () => {
      const finalizada = await finish('concluida')
      if (finalizada) await carregarResumo(finalizada.id)
      setEncerrada(true)
    })()
  }, [encerrada, session, queueLoading, items.length, finish, carregarResumo])

  const handlePular = useCallback(() => {
    if (!current || !session) return
    const leadId = current.lead.id
    // Fire-and-forget: erro já aparece no banner da página (runner.erro);
    // o .catch(noop) só evita o warning de "unhandled rejection" no
    // console, já que ninguém aqui está esperando essa Promise.
    runner.run('pular:' + leadId, async (clientEventId) => {
      const { data } = await postFocusEvent({ sessionId: session.id, leadId, actionType: 'pular', clientEventId })
      applyDelta({ points: data.points, skipped: true })
      advancePast(leadId)
      setFeedback({ mensagem: 'Lead pulado. Ele continua disponível no CRM.' })
    }).catch(() => {})
  }, [current, session, runner, applyDelta, advancePast])

  const handleAbrirWhatsApp = useCallback(() => {
    if (!current) return
    // Lead veio de DM do Instagram (placeholder ig:<igsid> em vez de
    // telefone real) — não há como montar um link wa.me válido.
    if (!temWhatsappReal(current.lead.whatsapp)) return
    const telefone = current.lead.whatsapp.replace(/\D/g, '')
    const numero = telefone.startsWith('55') ? telefone : '55' + telefone
    const texto = mensagemWhatsApp(current)
    window.open('https://wa.me/' + numero + '?text=' + encodeURIComponent(texto), '_blank', 'noopener,noreferrer')
    setContatoPendenteLeadId(current.lead.id)
    setFeedback({ mensagem: 'Mensagem sugerida aberta no WhatsApp. Confirme o contato apenas depois de enviar.' })
  }, [current])

  function handlePerdido(payload: LostReasonPayload): Promise<void> {
    if (!current || !session) return Promise.resolve()
    const lead = current.lead
    return runner.run('perdido:' + lead.id, async (clientEventId) => {
      const motivoLabel = payload.motivo.replace(/_/g, ' ')
      const notaTexto = 'Perdido: ' + motivoLabel + (payload.detalhe ? ' — ' + payload.detalhe : '')
      // salvarNotaIdempotente busca o lead fresco e só acrescenta a nota se
      // um client_event_id igual ainda não estiver lá — protege contra
      // duplicar a nota num retry após reload (estagio_funil já é
      // idempotente por si só: a rota só loga a transição quando o valor
      // atual difere do novo).
      await patchLead(lead.id, { estagio_funil: 'perdido' })
      await salvarNotaIdempotente(lead.id, notaTexto, clientEventId)
      const { data } = await postFocusEvent({
        sessionId: session.id, leadId: lead.id, actionType: 'perdido',
        previousStage: lead.estagio_funil, nextStage: 'perdido',
        metadata: { motivo: payload.motivo, detalhe: payload.detalhe },
        clientEventId,
      })
      applyDelta({ points: data.points, processed: true })
      advancePast(lead.id)
      setModal(null)
      setFeedback({ mensagem: 'Lead marcado como perdido. O histórico foi preservado.', href: '/dashboard/crm?lead=' + lead.id, cta: 'Rever no CRM' })
    })
  }

  function handleFollowUp(payload: FollowUpPayload): Promise<void> {
    if (!current || !session) return Promise.resolve()
    const lead = current.lead
    return runner.run('followup:' + lead.id, async (clientEventId) => {
      const dataHora = payload.data + 'T' + payload.horario + ':00'
      const canalLabel = payload.canal === 'ligacao' ? 'Ligação' : payload.canal === 'whatsapp' ? 'WhatsApp' : payload.canal === 'email' ? 'E-mail' : 'Outro'
      const tipoAgenda = payload.canal === 'ligacao' ? 'ligacao' : 'outro'
      // client_event_id vai direto no POST da Agenda — idempotência real no
      // banco (migration 0016): mesmo que a página recarregue entre este
      // passo e o próximo, um retry nunca cria um segundo compromisso.
      const { data: agenda } = await createAgendaEvento({
        titulo: 'Follow-up (' + canalLabel + ') — ' + (lead.nome || lead.whatsapp),
        data_hora: dataHora, tipo: tipoAgenda, lead_id: lead.id,
        descricao: payload.observacao || null, lembrete_min: 30,
        client_event_id: clientEventId,
      })
      await patchLead(lead.id, { proximo_followup: dataHora })
      const { data } = await postFocusEvent({
        sessionId: session.id, leadId: lead.id, actionType: 'followup_agendado',
        metadata: { agendaId: agenda?.id, canal: payload.canal },
        clientEventId,
      })
      applyDelta({ points: data.points, processed: true })
      advancePast(lead.id)
      setModal(null)
      setFeedback({ mensagem: 'Follow-up agendado e vinculado à Agenda.', href: '/dashboard/agenda', cta: 'Ver agenda' })
    })
  }

  function handleVisitaAgendar(payload: AgendarVisitaPayload): Promise<void> {
    if (!current || !session) return Promise.resolve()
    const lead = current.lead
    return runner.run('visita-agendar:' + lead.id, async (clientEventId) => {
      const dataHora = payload.data + 'T' + payload.horario + ':00'
      const { data: agenda } = await createAgendaEvento({
        titulo: 'Visita — ' + (lead.nome || lead.whatsapp),
        data_hora: dataHora, tipo: 'visita', lead_id: lead.id,
        local: payload.local || null, descricao: payload.observacao || null, lembrete_min: 60,
        client_event_id: clientEventId,
      })
      const { data } = await postFocusEvent({
        sessionId: session.id, leadId: lead.id, actionType: 'visita_agendada',
        metadata: { agendaId: agenda?.id }, clientEventId,
      })
      applyDelta({ points: data.points, processed: true })
      advancePast(lead.id)
      setModal(null)
      setFeedback({ mensagem: 'Visita agendada e vinculada à Agenda.', href: '/dashboard/agenda', cta: 'Ver agenda' })
    })
  }

  function handleVisitaConcluir(agendaId: string): Promise<void> {
    if (!current || !session) return Promise.resolve()
    const leadId = current.lead.id
    // patchAgendaEvento (status='concluido') é idempotente — reexecutar num
    // retry só reafirma o mesmo status, sem duplicar nada. Só depois de
    // postFocusEvent confirmar é que abrimos o prompt de mudança de etapa
    // (não adianta a próxima etapa do fluxo antes de persistir a anterior).
    return runner.run('visita-concluir:' + leadId + ':' + agendaId, async (clientEventId) => {
      await patchAgendaEvento(agendaId, { status: 'concluido' })
      const { data } = await postFocusEvent({
        sessionId: session.id, leadId, actionType: 'visita_concluida', metadata: { agendaId }, clientEventId,
      })
      applyDelta({ points: data.points, processed: true })
      setModal('stagechange')
      setFeedback({ mensagem: 'Visita registrada como realizada. Escolha agora a próxima etapa.' })
    })
  }

  function handleVisitaNaoOcorreu(agendaId: string): Promise<void> {
    if (!current || !session) return Promise.resolve()
    const leadId = current.lead.id
    return runner.run('visita-naoocorreu:' + leadId + ':' + agendaId, async (clientEventId) => {
      await patchAgendaEvento(agendaId, { status: 'nao_compareceu' })
      const { data } = await postFocusEvent({
        sessionId: session.id, leadId, actionType: 'visita_nao_ocorreu', metadata: { agendaId }, clientEventId,
      })
      applyDelta({ points: data.points, processed: true })
      advancePast(leadId)
      setModal(null)
      setFeedback({ mensagem: 'Visita registrada como não ocorrida. O histórico foi atualizado.' })
    })
  }

  function handleEscolhaEtapaPosVisita(novoEstagio: string | null) {
    if (!current) { setModal(null); return }
    const lead = current.lead
    const leadId = lead.id
    if (!novoEstagio) {
      advancePast(leadId)
      setModal(null)
      return
    }
    if (!session) return
    runner.run('etapa-pos-visita:' + leadId, async (clientEventId) => {
      await patchLead(leadId, { estagio_funil: novoEstagio })
      const { data } = await postFocusEvent({
        sessionId: session.id, leadId, actionType: 'etapa_alterada',
        previousStage: lead.estagio_funil, nextStage: novoEstagio, clientEventId,
      })
      applyDelta({ points: data.points })
      advancePast(leadId)
      setModal(null)
      setFeedback({ mensagem: 'Etapa mantida. Lead atualizado no CRM.' })
    }).catch(() => {})
  }

  // Fire-and-forget: o card já limpa o campo otimisticamente, e o erro
  // (se houver) aparece no banner da página com "tentar de novo".
  function handleAdicionarNota(texto: string) {
    if (!current || !session) return
    const lead = current.lead
    runner.run('nota:' + lead.id, async (clientEventId) => {
      const novasAnotacoes = await salvarNotaIdempotente(lead.id, texto, clientEventId)
      const { data } = await postFocusEvent({ sessionId: session.id, leadId: lead.id, actionType: 'anotacao', clientEventId })
      applyDelta({ points: data.points })
      updateLeadLocally(lead.id, { anotacoes: novasAnotacoes })
      setFeedback({ mensagem: 'Anotação salva no histórico do lead.' })
    }).catch(() => {})
  }

  function handleMoverEtapaRapido(novoEstagio: string) {
    if (!current || !session) return
    const lead = current.lead
    runner.run('etapa-rapido:' + lead.id, async (clientEventId) => {
      await patchLead(lead.id, { estagio_funil: novoEstagio })
      const { data } = await postFocusEvent({
        sessionId: session.id, leadId: lead.id, actionType: 'etapa_alterada',
        previousStage: lead.estagio_funil, nextStage: novoEstagio, clientEventId,
      })
      applyDelta({ points: data.points })
      updateLeadLocally(lead.id, { estagio_funil: novoEstagio })
      setFeedback({ mensagem: 'Etapa atualizada no CRM.' })
    }).catch(() => {})
  }

  // Abrir o WhatsApp NUNCA equivale a "contato realizado" — isso só é
  // registrado (com pontos e ultimo_contato atualizado) quando o corretor
  // confirma explicitamente no chip que aparece depois de abrir a conversa.
  function handleConfirmarContato() {
    if (!current || !session) return
    const lead = current.lead
    runner.run('contato:' + lead.id, async (clientEventId) => {
      const agora = new Date().toISOString()
      await patchLead(lead.id, { ultimo_contato: agora })
      const { data } = await postFocusEvent({ sessionId: session.id, leadId: lead.id, actionType: 'contato_confirmado', clientEventId })
      applyDelta({ points: data.points })
      updateLeadLocally(lead.id, { ultimo_contato: agora })
      setContatoPendenteLeadId(null)
      setFeedback({ mensagem: 'Contato confirmado e registrado no histórico.' })
    }).catch(() => {})
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const alvo = e.target as HTMLElement
      const digitando = ['INPUT', 'TEXTAREA', 'SELECT'].includes(alvo.tagName) || alvo.isContentEditable
      if (digitando || modal || !current || runner.processando) return
      if (e.key === 'p' || e.key === 'P') { e.preventDefault(); setModal('perdido') }
      else if (e.key === ' ') { e.preventDefault(); handlePular() }
      else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); setModal('followup') }
      else if (e.key === 'v' || e.key === 'V') { e.preventDefault(); setModal('visita') }
      else if (e.key === 'w' || e.key === 'W') { e.preventDefault(); handleAbrirWhatsApp() }
      else if (e.key === 'Escape') { e.preventDefault(); router.push('/dashboard/crm') }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [modal, current, runner.processando, handlePular, handleAbrirWhatsApp, router])

  async function handleNovaSessao() {
    setEncerrada(false)
    setBreakdown(null)
    sessaoIniciadaRef.current = false
    await refetch()
  }

  const loading = sessionLoading || queueLoading
  const posicaoAtual = session ? Math.min(session.processed_leads + session.skipped_leads + 1, Math.max(session.total_leads, 1)) : 0

  // Dois domínios de erro distintos, com retries distintos: uma falha ao
  // CARREGAR sessão/fila pede um refetch/reload; uma falha ao EXECUTAR uma
  // ação (já em andamento) pede o retry idempotente do runner (mesmo
  // client_event_id). Nunca misturamos os dois botões.
  const erroCarregamento = sessionError || queueError
  const erroAcao = runner.erro

  if (encerrada && session && breakdown) {
    return (
      <FocusSessionSummary
        session={session}
        breakdown={breakdown}
        onVoltarCrm={() => router.push('/dashboard/crm')}
        onNovaSessao={handleNovaSessao}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: D.bg }}>
      <FocusModeHeader
        posicaoAtual={posicaoAtual}
        total={session?.total_leads ?? items.length}
        sessionPoints={session?.earned_points ?? 0}
        monthPoints={monthPoints}
        onClose={() => router.push('/dashboard/crm')}
      />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px clamp(14px,3vw,24px) 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TEMP_FILTROS.map(({ value, v }) => {
              const info = tempInfo(v)
              const ativo = filters.temperatura === value
              return (
                <button
                  key={value}
                  onClick={() => setFilters((f) => ({ ...f, temperatura: ativo ? undefined : value }))}
                  aria-pressed={ativo}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 999, padding: '7px 12px',
                    fontSize: 12.5, fontWeight: 700, cursor: 'pointer', minHeight: 36,
                    border: '1.5px solid ' + (ativo ? info.cor : D.line),
                    background: ativo ? info.cor + '1c' : '#fff',
                    color: ativo ? info.cor : D.ink,
                  }}
                >
                  {info.emoji} {info.label}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setFiltrosAbertos((v) => !v)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: filtrosAbertos ? D.bronze : '#fff', color: filtrosAbertos ? '#fff' : D.ink, border: '1px solid ' + D.line, borderRadius: 8, padding: '7px 12px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', minHeight: 36 }}
          >
            <Filter size={13} /> Mais filtros
          </button>
        </div>

        {filtrosAbertos && (
          <div style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 12, padding: 16, marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <select
              value={filters.estagioFunil ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, estagioFunil: e.target.value || undefined }))}
              style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid ' + D.line, fontSize: 13 }}
            >
              <option value="">Todas etapas</option>
              {ESTAGIOS_FUNIL.map((e) => <option key={e.key} value={e.key}>{e.label}</option>)}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: D.ink }}>
              <input type="checkbox" checked={!!filters.apenasFollowupVencido} onChange={(e) => setFilters((f) => ({ ...f, apenasFollowupVencido: e.target.checked || undefined }))} />
              Só follow-up vencido
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: D.ink }}>
              Sem ação há
              <input
                type="number" min={0} placeholder="dias"
                value={filters.semAcaoDias ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, semAcaoDias: e.target.value ? Number(e.target.value) : undefined }))}
                style={{ width: 60, padding: '6px 8px', borderRadius: 6, border: '1px solid ' + D.line, fontSize: 13 }}
              />
              dias
            </label>
          </div>
        )}

        {(erroCarregamento || erroAcao) && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#991B1B', fontSize: 13 }}>{erroCarregamento || erroAcao}</span>
            <button
              onClick={erroAcao ? runner.retry : (sessionError ? reloadSession : refetch)}
              style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Tentar de novo
            </button>
          </div>
        )}

        {feedback && (
          <div role="status" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 13, fontWeight: 600, flexWrap: 'wrap' }}>
            <span>{feedback.mensagem}</span>
            {feedback.href && (
              <a href={feedback.href} style={{ color: '#047857', fontWeight: 800, whiteSpace: 'nowrap', padding: '6px 4px', minHeight: 32, display: 'inline-flex', alignItems: 'center' }}>{feedback.cta ?? 'Abrir'}</a>
            )}
          </div>
        )}

        {loading ? (
          <div aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[0, 1].map((i) => (
              <div key={i} className="focus-skeleton" style={{ height: 220, borderRadius: 16, background: '#eee', backgroundSize: '200% 100%' }} />
            ))}
          </div>
        ) : !current ? (
          <div style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🎉</div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 18, fontWeight: 800, color: D.ink, margin: '0 0 6px' }}>Nenhum lead precisa de atenção agora</h2>
            <p style={{ fontSize: 13.5, color: D.muted, margin: '0 0 20px' }}>Todos os leads elegíveis para o Modo Foco já foram atendidos com os filtros atuais.</p>
            <button onClick={() => router.push('/dashboard/crm')} style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>Voltar ao CRM</button>
          </div>
        ) : (
          <div key={current.lead.id} className="focus-card-enter">
            <FocusLeadCard
              item={current}
              contatoPendenteConfirmacao={contatoPendenteLeadId === current.lead.id}
              processando={runner.processando}
              onAbrirWhatsApp={handleAbrirWhatsApp}
              onConfirmarContato={handleConfirmarContato}
              onAdicionarNota={handleAdicionarNota}
              onMoverEtapa={handleMoverEtapaRapido}
            />
          </div>
        )}
      </div>

      {current && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0 }}>
          <FocusPrimaryActions
            disabled={runner.processando}
            recommendedAction={current.recomendacao.action}
            onPerdido={() => setModal('perdido')}
            onPular={handlePular}
            onFollowUp={() => setModal('followup')}
            onVisita={() => setModal('visita')}
          />
        </div>
      )}

      {modal === 'followup' && current && (
        <FollowUpModal
          onClose={() => setModal(null)}
          onSubmit={handleFollowUp}
          contexto={interessePrincipal(current.lead) ? `Retomar interesse em ${interessePrincipal(current.lead)}.` : current.recomendacao.detail}
        />
      )}
      {modal === 'visita' && current && (
        <VisitModal
          proximaVisita={current.proximaVisita}
          onClose={() => setModal(null)}
          onAgendar={handleVisitaAgendar}
          onConcluir={handleVisitaConcluir}
          onNaoOcorreu={handleVisitaNaoOcorreu}
          localSugerido={interessePrincipal(current.lead) ?? ''}
          observacaoSugerida={current.recomendacao.detail}
        />
      )}
      {modal === 'perdido' && current && (
        <LostReasonModal nomeLead={current.lead.nome || '+' + current.lead.whatsapp} onClose={() => setModal(null)} onConfirm={handlePerdido} />
      )}
      {modal === 'stagechange' && current && (
        <StageChangePrompt estagioAtual={current.lead.estagio_funil} onClose={() => handleEscolhaEtapaPosVisita(null)} onEscolher={handleEscolhaEtapaPosVisita} />
      )}

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .focus-card-enter { animation: focus-card-in .22s ease; }
          @keyframes focus-card-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
          .focus-skeleton { background-image: linear-gradient(90deg, #eee, #f6f6f6, #eee); animation: focus-skeleton-pulse 1.4s ease infinite; }
          @keyframes focus-skeleton-pulse { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        }
        @media (prefers-reduced-motion: reduce) {
          .focus-skeleton { background: #eee; }
        }
      `}</style>
    </div>
  )
}
