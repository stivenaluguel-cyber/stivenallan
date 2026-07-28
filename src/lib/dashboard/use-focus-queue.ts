'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

export type FocusQueueLeadFull = {
  id: string
  nome?: string | null
  whatsapp: string
  email?: string | null
  estagio_funil: string
  status?: string | null
  origem?: string | null
  temperatura?: number | null
  lead_score?: number | null
  requer_atencao?: boolean | null
  orcamento_max?: number | null
  anotacoes?: string | null
  proximo_followup?: string | null
  ultimo_contato?: string | null
  created_at: string
  empreendimentos?: { nome?: string; cidade?: string } | null
  property_name?: string | null
}

export type AgendaRef = { id: string; titulo: string; inicio: string; tipo?: string; status?: string }

export type FocusQueueItem = {
  lead: FocusQueueLeadFull
  followupVencido: boolean
  requerAtencao: boolean
  agendaVencida: boolean
  nuncaContatado: boolean
  quente: boolean
  diasSemContato: number | null
  prioridade: { title: string; detail: string; level: 'urgent' | 'attention' | 'normal' }
  recomendacao: { action: 'whatsapp' | 'followup' | 'visita' | 'atualizar_etapa'; title: string; detail: string }
  proximoEvento: { titulo: string; inicio: string; tipo: string } | null
  compromissoVencido: AgendaRef | null
  // Separados de propósito: só visitaVencida pode ser marcada como realizada.
  visitaVencida: AgendaRef | null
  visitaFutura: AgendaRef | null
  posicao: number
}

// A fila agora vem do SNAPSHOT da sessão (crm_focus_session_leads), não de um
// recálculo ao vivo a cada carga: um lead já tratado não reaparece depois de
// um reload, e a ordem não muda no meio da sessão.
export function useFocusQueue(sessionId: string | null) {
  const [items, setItems] = useState<FocusQueueItem[]>([])
  const [pendentesTotal, setPendentesTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // "A fila já carregou com sucesso ao menos uma vez?" — sem isso, o estado
  // inicial (zero itens, zero pendentes, sem erro ainda) é indistinguível de
  // "a fila acabou", e quem observa esse estado conclui a sessão antes de a
  // primeira resposta chegar. Foi exatamente esse o bug que encerrou uma
  // sessão real: a busca da fila falhou, mas no instante ANTES do erro ser
  // registrado o estado já parecia uma fila vazia legítima.
  const [carregouComSucesso, setCarregouComSucesso] = useState(false)
  // Sequência monotônica: descarta a resposta de um fetch antigo que
  // chegue depois de um mais novo (senão a fila pisca de volta pro estado
  // anterior). O AbortController cancela o que der pra cancelar.
  const seqRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    if (!sessionId) { setItems([]); setPendentesTotal(0); setLoading(false); setCarregouComSucesso(false); return }
    const seq = ++seqRef.current
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/leads/foco?sessionId=' + sessionId, { signal: controller.signal })
      const json = await res.json()
      if (seq !== seqRef.current) return
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar a fila')
      setItems(json.data ?? [])
      setPendentesTotal(json.pendentesTotal ?? 0)
      setCarregouComSucesso(true)
    } catch (e) {
      if ((e as Error)?.name === 'AbortError' || seq !== seqRef.current) return
      // Erro de carregamento NÃO esvazia a fila nem encerra a sessão —
      // mantém o que já estava na tela e oferece retry.
      setError(e instanceof Error ? e.message : 'Falha ao carregar a fila')
    } finally {
      if (seq === seqRef.current) setLoading(false)
    }
  }, [sessionId])

  useEffect(() => { load() }, [load])

  // Refetch ao voltar pra aba (progresso feito em outra aba aparece aqui),
  // com dedupe: focus e visibilitychange disparam quase juntos e sem isso
  // fariam duas requisições idênticas.
  useEffect(() => {
    if (!sessionId) return
    let ultimo = 0
    function aoVoltar() {
      if (document.visibilityState !== 'visible') return
      const agora = Date.now()
      if (agora - ultimo < 1500) return
      ultimo = agora
      load()
    }
    document.addEventListener('visibilitychange', aoVoltar)
    window.addEventListener('focus', aoVoltar)
    return () => {
      document.removeEventListener('visibilitychange', aoVoltar)
      window.removeEventListener('focus', aoVoltar)
    }
  }, [sessionId, load])

  const advancePast = useCallback((leadId: string) => {
    setItems((prev) => prev.filter((it) => it.lead.id !== leadId))
    setPendentesTotal((n) => Math.max(0, n - 1))
  }, [])

  const updateLeadLocally = useCallback((leadId: string, patch: Partial<FocusQueueLeadFull>) => {
    setItems((prev) => prev.map((it) => (it.lead.id === leadId ? { ...it, lead: { ...it.lead, ...patch } } : it)))
  }, [])

  return {
    items,
    current: items[0] ?? null,
    pendentesTotal,
    loading,
    error,
    carregouComSucesso,
    refetch: load,
    advancePast,
    updateLeadLocally,
  }
}
