'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { D } from '@/components/dashboard/focus/tokens'
import { FocusModeHeader } from '@/components/dashboard/focus/FocusModeHeader'
import { FocusLeadCard } from '@/components/dashboard/focus/FocusLeadCard'
import { FocusPrimaryActions } from '@/components/dashboard/focus/FocusPrimaryActions'
import { FocusPreparation } from '@/components/dashboard/focus/FocusPreparation'
import { FollowUpModal, type FollowUpPayload } from '@/components/dashboard/focus/FollowUpModal'
import { VisitModal, type AgendarVisitaPayload } from '@/components/dashboard/focus/VisitModal'
import { LostReasonModal, type LostReasonPayload } from '@/components/dashboard/focus/LostReasonModal'
import { SnoozeModal, type SnoozePayload } from '@/components/dashboard/focus/SnoozeModal'
import { WhatsAppPreviewModal } from '@/components/dashboard/focus/WhatsAppPreviewModal'
import { StageChangePrompt } from '@/components/dashboard/focus/StageChangePrompt'
import { FocusSessionSummary } from '@/components/dashboard/focus/FocusSessionSummary'
import { useFocusSession } from '@/lib/dashboard/use-focus-session'
import { useFocusQueue } from '@/lib/dashboard/use-focus-queue'
import { useFocusActionRunner } from '@/lib/dashboard/use-focus-action-runner'
import type { FocusQueueFilters } from '@/lib/dashboard/focus-queue'
import type { FocusSessionResumo } from '@/lib/dashboard/focus-summary'
import { createAgendaEvento, patchAgendaEvento, patchLead, postFocusEvent, salvarNota } from '@/lib/dashboard/focus-client'
import { amanhaSaoPaulo, spLocalToISOString } from '@/lib/dashboard/timezone-sp'
import { abrirWhatsApp, interessePrincipal, mensagemWhatsApp, montarLinkWhatsApp } from '@/lib/dashboard/focus-whatsapp'
import { deveEncerrarSessao } from '@/lib/dashboard/focus-encerramento'
import { temWhatsappReal } from '@/lib/leads/normalize'

// localStorage guarda só a PREFERÊNCIA de filtros para a PRÓXIMA sessão.
// Os filtros de uma sessão em andamento vêm sempre de session.filtros (o
// servidor) — antes, retomar uma sessão relia o localStorage, que podia ter
// sido alterado depois, e a fila exibida deixava de bater com a sessão.
const PREF_FILTROS_KEY = 'modo-foco-filtros-v1'

type ModalAberto = 'followup' | 'visita' | 'perdido' | 'stagechange' | 'adiar' | 'whatsapp' | null
type Feedback = { mensagem: string; href?: string; cta?: string }

function carregarPreferenciaFiltros(): FocusQueueFilters {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(PREF_FILTROS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export default function FocusModePage() {
  const router = useRouter()
  const [filtrosPreparacao, setFiltrosPreparacao] = useState<FocusQueueFilters>(() => carregarPreferenciaFiltros())
  const [modal, setModal] = useState<ModalAberto>(null)
  const [contatoPendenteLeadId, setContatoPendenteLeadId] = useState<string | null>(null)
  const [resumo, setResumo] = useState<FocusSessionResumo | null>(null)
  const [sessaoEncerrada, setSessaoEncerrada] = useState<{ id: string } | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [erroResumo, setErroResumo] = useState('')
  const tituloCardRef = useRef<HTMLHeadingElement>(null)

  const { session, monthPoints, loading: sessionLoading, error: sessionError, starting, start, finish, reload: reloadSession, aplicarContadores } = useFocusSession()
  const sessionAtiva = session?.status === 'ativa' ? session : null
  const { items, current, pendentesTotal, loading: queueLoading, error: queueError, carregouComSucesso, refetch, advancePast, updateLeadLocally } = useFocusQueue(sessionAtiva?.id ?? null)
  const runner = useFocusActionRunner()

  // Nenhuma ação/modal é habilitada antes de a sessão estar realmente ativa —
  // antes dava pra clicar e a ação sumia sem feedback.
  const pronto = !!sessionAtiva && !starting

  useEffect(() => {
    window.localStorage.setItem(PREF_FILTROS_KEY, JSON.stringify(filtrosPreparacao))
  }, [filtrosPreparacao])

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 6000)
    return () => window.clearTimeout(timer)
  }, [feedback])

  // Move o foco para o título do próximo lead — quem usa teclado/leitor de
  // tela precisa saber que o card mudou.
  useEffect(() => {
    if (current && pronto) tituloCardRef.current?.focus()
  }, [current?.lead.id, pronto])

  const carregarResumo = useCallback(async (sessionId: string) => {
    setErroResumo('')
    try {
      const res = await fetch('/api/admin/focus/sessions/' + sessionId)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar o resumo')
      setResumo(json.breakdown)
    } catch (e) {
      setErroResumo(e instanceof Error ? e.message : 'Falha ao carregar o resumo')
    }
  }, [])

  // A sessão só é concluída quando o SERVIDOR confirma zero pendentes (o
  // PATCH devolve 409 caso contrário). Um erro de carregamento ou um filtro
  // que não devolveu nada nunca encerram a sessão.
  useEffect(() => {
    const encerrar = deveEncerrarSessao({
      sessaoAtiva: !!sessionAtiva,
      carregando: queueLoading,
      erro: !!queueError,
      carregouComSucesso,
      itensNaTela: items.length,
      pendentesNoServidor: pendentesTotal,
      jaEncerrada: !!sessaoEncerrada,
    })
    if (!encerrar || !sessionAtiva) return
    ;(async () => {
      const r = await finish('concluida')
      if (r && !('conflito' in r && r.conflito)) {
        setSessaoEncerrada({ id: sessionAtiva.id })
        await carregarResumo(sessionAtiva.id)
      }
    })()
  }, [sessionAtiva, items.length, pendentesTotal, queueLoading, queueError, carregouComSucesso, sessaoEncerrada, finish, carregarResumo])

  async function handleIniciar() {
    const nova = await start(filtrosPreparacao)
    if (nova) setFeedback({ mensagem: 'Sessão iniciada. Os filtros ficam travados até o fim.' })
  }

  async function handlePausar() {
    if (!sessionAtiva) return
    await finish('abandonada')
    router.push('/dashboard/crm')
  }

  async function handleEncerrar() {
    if (!sessionAtiva) return
    if (!window.confirm('Encerrar esta sessão agora? Os leads não tratados voltam para o CRM normalmente.')) return
    await finish('abandonada')
    setSessaoEncerrada({ id: sessionAtiva.id })
    await carregarResumo(sessionAtiva.id)
  }

  async function handleNovaSessao() {
    setSessaoEncerrada(null)
    setResumo(null)
    setErroResumo('')
    await reloadSession()
  }

  // Toda ação primária passa por aqui: o servidor devolve os contadores
  // autoritativos, que SUBSTITUEM o estado local (nada de delta otimista,
  // que recontava depois de um alreadyProcessed e divergia entre abas).
  const registrar = useCallback(async (
    chave: string,
    leadId: string,
    executar: (clientEventId: string) => Promise<{ data: { alreadyProcessed: boolean; points: number; session?: unknown } }>,
    aposSucesso: { avancar?: boolean; mensagem?: string; href?: string; cta?: string } = {},
  ) => {
    return runner.run(chave, async (clientEventId) => {
      const { data } = await executar(clientEventId)
      aplicarContadores(data.session as never)
      if (aposSucesso.avancar) advancePast(leadId)
      if (aposSucesso.mensagem) setFeedback({ mensagem: aposSucesso.mensagem, href: aposSucesso.href, cta: aposSucesso.cta })
      setModal(null)
    })
  }, [runner, aplicarContadores, advancePast])

  function handlePular() {
    if (!current || !sessionAtiva || !pronto) return
    const leadId = current.lead.id
    registrar('pular:' + leadId, leadId, (clientEventId) =>
      postFocusEvent({ sessionId: sessionAtiva.id, leadId, actionType: 'pular', clientEventId }),
      { avancar: true, mensagem: 'Lead pulado. Ele continua disponível no CRM.' },
    ).catch(() => {})
  }

  function handleAdiar(payload: SnoozePayload): Promise<void> {
    if (!current || !sessionAtiva) return Promise.resolve()
    const leadId = current.lead.id
    return registrar('adiar:' + leadId, leadId, (clientEventId) =>
      postFocusEvent({
        sessionId: sessionAtiva.id, leadId, actionType: 'adiado',
        metadata: payload.motivo ? { motivo: payload.motivo } : {},
        snoozedUntil: payload.snoozedUntil,
        clientEventId,
      }),
      { avancar: true, mensagem: 'Lead adiado. Ele volta para a fila na data escolhida.' },
    )
  }

  function handlePerdido(payload: LostReasonPayload): Promise<void> {
    if (!current || !sessionAtiva) return Promise.resolve()
    const lead = current.lead
    return registrar('perdido:' + lead.id, lead.id, async (clientEventId) => {
      const motivoLabel = payload.motivo.replace(/_/g, ' ')
      const notaTexto = 'Perdido: ' + motivoLabel + (payload.detalhe ? ' — ' + payload.detalhe : '')
      await patchLead(lead.id, { estagio_funil: 'perdido' })
      await salvarNota(lead.id, notaTexto, clientEventId)
      return postFocusEvent({
        sessionId: sessionAtiva.id, leadId: lead.id, actionType: 'perdido',
        previousStage: lead.estagio_funil, nextStage: 'perdido',
        metadata: { motivo: payload.motivo, detalhe: payload.detalhe },
        clientEventId,
      })
    }, { avancar: true, mensagem: 'Lead marcado como perdido. O histórico foi preservado.', href: '/dashboard/crm?lead=' + lead.id, cta: 'Rever no CRM' })
  }

  function handleFollowUp(payload: FollowUpPayload): Promise<void> {
    if (!current || !sessionAtiva) return Promise.resolve()
    const lead = current.lead
    return registrar('followup:' + lead.id, lead.id, async (clientEventId) => {
      const dataHora = spLocalToISOString(payload.data, payload.horario)
      const canalLabel = payload.canal === 'ligacao' ? 'Ligação' : payload.canal === 'whatsapp' ? 'WhatsApp' : payload.canal === 'email' ? 'E-mail' : 'Outro'
      const { data: agenda } = await createAgendaEvento({
        titulo: 'Follow-up (' + canalLabel + ') — ' + (lead.nome || lead.whatsapp),
        data_hora: dataHora, tipo: payload.canal === 'ligacao' ? 'ligacao' : 'outro', lead_id: lead.id,
        descricao: payload.observacao || null, lembrete_min: 30, client_event_id: clientEventId,
      })
      await patchLead(lead.id, { proximo_followup: dataHora })
      return postFocusEvent({
        sessionId: sessionAtiva.id, leadId: lead.id, actionType: 'followup_agendado',
        metadata: { agendaId: agenda?.id, canal: payload.canal }, clientEventId,
      })
    }, { avancar: true, mensagem: 'Follow-up agendado e vinculado à Agenda.', href: '/dashboard/agenda', cta: 'Ver agenda' })
  }

  function handleVisitaAgendar(payload: AgendarVisitaPayload): Promise<void> {
    if (!current || !sessionAtiva) return Promise.resolve()
    const lead = current.lead
    return registrar('visita-agendar:' + lead.id, lead.id, async (clientEventId) => {
      const { data: agenda } = await createAgendaEvento({
        titulo: 'Visita — ' + (lead.nome || lead.whatsapp),
        data_hora: spLocalToISOString(payload.data, payload.horario), tipo: 'visita', lead_id: lead.id,
        local: payload.local || null, descricao: payload.observacao || null, lembrete_min: 60, client_event_id: clientEventId,
      })
      return postFocusEvent({
        sessionId: sessionAtiva.id, leadId: lead.id, actionType: 'visita_agendada',
        metadata: { agendaId: agenda?.id }, clientEventId,
      })
    }, { avancar: true, mensagem: 'Visita agendada e vinculada à Agenda.', href: '/dashboard/agenda', cta: 'Ver agenda' })
  }

  function handleVisitaConcluir(agendaId: string): Promise<void> {
    if (!current || !sessionAtiva) return Promise.resolve()
    const leadId = current.lead.id
    return runner.run('visita-concluir:' + leadId + ':' + agendaId, async (clientEventId) => {
      // O servidor recusa (409) marcar como realizada uma visita que ainda
      // não aconteceu — a UI já não oferece, isto é a segunda barreira.
      await patchAgendaEvento(agendaId, { status: 'concluido' })
      const { data } = await postFocusEvent({
        sessionId: sessionAtiva.id, leadId, actionType: 'visita_concluida', metadata: { agendaId }, clientEventId,
      })
      aplicarContadores(data.session as never)
      setModal('stagechange')
      setFeedback({ mensagem: 'Visita registrada como realizada. Escolha agora a próxima etapa.' })
    })
  }

  function handleVisitaNaoOcorreu(agendaId: string): Promise<void> {
    if (!current || !sessionAtiva) return Promise.resolve()
    const leadId = current.lead.id
    return registrar('visita-naoocorreu:' + leadId + ':' + agendaId, leadId, async (clientEventId) => {
      await patchAgendaEvento(agendaId, { status: 'nao_compareceu' })
      return postFocusEvent({
        sessionId: sessionAtiva.id, leadId, actionType: 'visita_nao_ocorreu', metadata: { agendaId }, clientEventId,
      })
    }, { avancar: true, mensagem: 'Visita registrada como não ocorrida. O histórico foi atualizado.' })
  }

  function handleEscolhaEtapaPosVisita(novoEstagio: string | null) {
    if (!current) { setModal(null); return }
    const lead = current.lead
    if (!novoEstagio) { advancePast(lead.id); setModal(null); return }
    if (!sessionAtiva) return
    registrar('etapa-pos-visita:' + lead.id, lead.id, async (clientEventId) => {
      await patchLead(lead.id, { estagio_funil: novoEstagio })
      return postFocusEvent({
        sessionId: sessionAtiva.id, leadId: lead.id, actionType: 'etapa_alterada',
        previousStage: lead.estagio_funil, nextStage: novoEstagio, clientEventId,
      })
    }, { avancar: true, mensagem: 'Etapa atualizada no CRM.' }).catch(() => {})
  }

  function handleAdicionarNota(texto: string) {
    if (!current || !sessionAtiva || !pronto) return
    const lead = current.lead
    runner.run('nota:' + lead.id, async (clientEventId) => {
      await salvarNota(lead.id, texto, clientEventId)
      const { data } = await postFocusEvent({ sessionId: sessionAtiva.id, leadId: lead.id, actionType: 'anotacao', clientEventId })
      aplicarContadores(data.session as never)
      setFeedback({ mensagem: 'Anotação salva no histórico do lead.' })
    }).catch(() => {})
  }

  function handleMoverEtapaRapido(novoEstagio: string) {
    if (!current || !sessionAtiva || !pronto) return
    const lead = current.lead
    runner.run('etapa-rapido:' + lead.id, async (clientEventId) => {
      await patchLead(lead.id, { estagio_funil: novoEstagio })
      const { data } = await postFocusEvent({
        sessionId: sessionAtiva.id, leadId: lead.id, actionType: 'etapa_alterada',
        previousStage: lead.estagio_funil, nextStage: novoEstagio, clientEventId,
      })
      aplicarContadores(data.session as never)
      updateLeadLocally(lead.id, { estagio_funil: novoEstagio })
      setFeedback({ mensagem: 'Etapa atualizada no CRM.' })
    }).catch(() => {})
  }

  // Abrir o WhatsApp NUNCA equivale a "contato realizado" — isso só é
  // registrado quando o corretor confirma explicitamente depois de enviar.
  function handleAbrirWhatsApp(texto: string): { popupBloqueado: boolean } {
    if (!current) return { popupBloqueado: false }
    const url = montarLinkWhatsApp(current.lead.whatsapp, texto)
    if (!url) return { popupBloqueado: false }
    const r = abrirWhatsApp(url)
    if (!r.popupBloqueado) {
      setContatoPendenteLeadId(current.lead.id)
      setFeedback({ mensagem: 'Conversa aberta. Confirme o contato apenas depois de enviar.' })
    }
    return r
  }

  function handleConfirmarContato() {
    if (!current || !sessionAtiva || !pronto) return
    const lead = current.lead
    runner.run('contato:' + lead.id, async (clientEventId) => {
      const agora = new Date().toISOString()
      await patchLead(lead.id, { ultimo_contato: agora })
      const { data } = await postFocusEvent({ sessionId: sessionAtiva.id, leadId: lead.id, actionType: 'contato_confirmado', clientEventId })
      aplicarContadores(data.session as never)
      updateLeadLocally(lead.id, { ultimo_contato: agora })
      setContatoPendenteLeadId(null)
      setFeedback({ mensagem: 'Contato confirmado e registrado no histórico.' })
    }).catch(() => {})
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const alvo = e.target as HTMLElement
      const digitando = ['INPUT', 'TEXTAREA', 'SELECT'].includes(alvo.tagName) || alvo.isContentEditable
      if (digitando || modal || !current || runner.processando || !pronto) return
      if (e.key === 'p' || e.key === 'P') { e.preventDefault(); setModal('perdido') }
      else if (e.key === ' ') { e.preventDefault(); handlePular() }
      else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); setModal('followup') }
      else if (e.key === 'v' || e.key === 'V') { e.preventDefault(); setModal('visita') }
      else if (e.key === 'a' || e.key === 'A') { e.preventDefault(); setModal('adiar') }
      else if ((e.key === 'w' || e.key === 'W') && temWhatsappReal(current.lead.whatsapp)) { e.preventDefault(); setModal('whatsapp') }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [modal, current, runner.processando, pronto])

  // ── Resumo final ────────────────────────────────────────────────────
  if (sessaoEncerrada) {
    if (erroResumo) {
      return (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: 40, textAlign: 'center' }}>
          <p role="alert" style={{ color: '#991B1B', fontSize: 14, marginBottom: 16 }}>{erroResumo}</p>
          <button onClick={() => carregarResumo(sessaoEncerrada.id)} style={botaoPrimario}>Tentar de novo</button>
        </div>
      )
    }
    if (!resumo || !session) {
      return <div style={{ padding: 40, textAlign: 'center', color: D.muted }} aria-live="polite">Carregando resumo...</div>
    }
    return (
      <FocusSessionSummary
        session={session}
        resumo={resumo}
        onVoltarCrm={() => router.push('/dashboard/crm')}
        onNovaSessao={handleNovaSessao}
      />
    )
  }

  // ── Preparação ──────────────────────────────────────────────────────
  if (sessionLoading) {
    return <div style={{ padding: 40, textAlign: 'center', color: D.muted }} aria-live="polite">Carregando...</div>
  }

  if (!sessionAtiva) {
    return (
      <div style={{ minHeight: '100vh', background: D.bg }}>
        <FocusPreparation
          filtros={filtrosPreparacao}
          onFiltrosChange={setFiltrosPreparacao}
          onIniciar={handleIniciar}
          iniciando={starting}
          erro={sessionError}
        />
      </div>
    )
  }

  // ── Sessão ativa ────────────────────────────────────────────────────
  const posicaoAtual = Math.min(sessionAtiva.processed_leads + sessionAtiva.skipped_leads + 1, Math.max(sessionAtiva.total_leads, 1))
  const erroCarregamento = sessionError || queueError
  const erroAcao = runner.erro

  return (
    <div style={{ minHeight: '100vh', background: D.bg }}>
      <FocusModeHeader
        posicaoAtual={posicaoAtual}
        total={sessionAtiva.total_leads}
        sessionPoints={sessionAtiva.earned_points}
        monthPoints={monthPoints}
        onClose={handlePausar}
        onEncerrar={handleEncerrar}
      />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px clamp(14px,3vw,24px) calc(120px + env(safe-area-inset-bottom))' }}>
        <FiltrosDaSessao filtros={sessionAtiva.filtros} onTrocar={handleEncerrar} />

        {(erroCarregamento || erroAcao) && (
          <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ color: '#991B1B', fontSize: 13 }}>{erroCarregamento || erroAcao}</span>
            <button
              onClick={erroAcao ? runner.retry : (sessionError ? reloadSession : refetch)}
              style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', minHeight: 44 }}
            >
              Tentar de novo
            </button>
          </div>
        )}

        {feedback && (
          <div role="status" aria-live="polite" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 13, fontWeight: 600, flexWrap: 'wrap' }}>
            <span>{feedback.mensagem}</span>
            {feedback.href && (
              <a href={feedback.href} style={{ color: '#047857', fontWeight: 800, whiteSpace: 'nowrap', padding: '10px 4px', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>{feedback.cta ?? 'Abrir'}</a>
            )}
          </div>
        )}

        {queueLoading && items.length === 0 ? (
          <div aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[0, 1].map((i) => <div key={i} className="focus-skeleton" style={{ height: 220, borderRadius: 16, background: '#eee' }} />)}
          </div>
        ) : !current ? (
          <div style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: D.ink, margin: '0 0 6px' }}>Nada pendente agora</h2>
            <p style={{ fontSize: 13.5, color: D.muted, margin: '0 0 20px' }}>
              {queueError ? 'Não foi possível carregar a fila — tente de novo acima.' : 'Todos os leads desta sessão já foram tratados.'}
            </p>
            <button onClick={() => router.push('/dashboard/crm')} style={botaoPrimario}>Voltar ao CRM</button>
          </div>
        ) : (
          <div key={current.lead.id} className="focus-card-enter">
            <FocusLeadCard
              item={current}
              tituloRef={tituloCardRef}
              contatoPendenteConfirmacao={contatoPendenteLeadId === current.lead.id}
              processando={runner.processando || !pronto}
              onAbrirWhatsApp={() => setModal('whatsapp')}
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
            disabled={runner.processando || !pronto}
            recommendedAction={current.recomendacao.action}
            onPerdido={() => setModal('perdido')}
            onPular={handlePular}
            onAdiar={() => setModal('adiar')}
            onFollowUp={() => setModal('followup')}
            onVisita={() => setModal('visita')}
          />
        </div>
      )}

      {modal === 'followup' && current && (
        <FollowUpModal
          onClose={() => setModal(null)}
          onSubmit={handleFollowUp}
          dataPadrao={amanhaSaoPaulo()}
          contexto={interessePrincipal(current.lead) ? `Retomar interesse em ${interessePrincipal(current.lead)}.` : current.recomendacao.detail}
        />
      )}
      {modal === 'visita' && current && (
        <VisitModal
          visitaVencida={current.visitaVencida}
          visitaFutura={current.visitaFutura}
          dataPadrao={amanhaSaoPaulo()}
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
      {modal === 'adiar' && current && (
        <SnoozeModal onClose={() => setModal(null)} onConfirm={handleAdiar} />
      )}
      {modal === 'whatsapp' && current && (
        <WhatsAppPreviewModal
          nomeLead={current.lead.nome || 'este lead'}
          mensagemSugerida={mensagemWhatsApp(current.lead, current)}
          onClose={() => setModal(null)}
          onEnviar={handleAbrirWhatsApp}
        />
      )}
      {modal === 'stagechange' && current && (
        <StageChangePrompt estagioAtual={current.lead.estagio_funil} onClose={() => handleEscolhaEtapaPosVisita(null)} onEscolher={handleEscolhaEtapaPosVisita} />
      )}

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .focus-card-enter { animation: focus-card-in .22s ease; }
          @keyframes focus-card-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
          .focus-skeleton { background-image: linear-gradient(90deg, #eee, #f6f6f6, #eee); background-size: 200% 100%; animation: focus-skeleton-pulse 1.4s ease infinite; }
          @keyframes focus-skeleton-pulse { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        }
        @media (prefers-reduced-motion: reduce) { .focus-skeleton { background: #eee; } }
        :focus-visible { outline: 3px solid ${D.bronze}; outline-offset: 2px; border-radius: 4px; }
      `}</style>
    </div>
  )
}

// Filtros de uma sessão ativa são imutáveis — trocar exige encerrar e abrir
// outra, senão a fila deixaria de bater com o snapshot já gravado.
function FiltrosDaSessao({ filtros, onTrocar }: { filtros: FocusQueueFilters; onTrocar: () => void }) {
  const partes: string[] = []
  if (filtros.temperatura) partes.push(filtros.temperatura)
  if (filtros.estagioFunil) partes.push(filtros.estagioFunil.replace(/_/g, ' '))
  if (filtros.origem) partes.push(filtros.origem)
  if (filtros.apenasFollowupVencido) partes.push('follow-up vencido')
  if (typeof filtros.semAcaoDias === 'number') partes.push(`sem ação há ${filtros.semAcaoDias}d`)

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 14, fontSize: 12.5, color: D.muted }}>
      <span>Filtros da sessão: <strong style={{ color: D.ink }}>{partes.length ? partes.join(' · ') : 'fila completa'}</strong></span>
      <button onClick={onTrocar} style={{ background: 'none', border: 'none', color: D.bronze, fontWeight: 700, fontSize: 12.5, cursor: 'pointer', padding: '10px 0', minHeight: 44 }}>
        Encerrar e iniciar outra
      </button>
    </div>
  )
}

const botaoPrimario: React.CSSProperties = {
  background: D.bronze, color: '#fff', border: 'none', borderRadius: 8,
  padding: '12px 20px', fontWeight: 700, cursor: 'pointer', minHeight: 44,
}
