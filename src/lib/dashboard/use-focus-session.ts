'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FocusQueueFilters } from './focus-queue'

export type FocusSession = {
  id: string
  admin_id: string
  status: 'ativa' | 'concluida' | 'abandonada'
  filtros: FocusQueueFilters
  total_leads: number
  processed_leads: number
  skipped_leads: number
  earned_points: number
  started_at: string
  finished_at: string | null
}

export type SessionPhase = 'carregando' | 'preparacao' | 'iniciando' | 'ativa' | 'encerrada' | 'erro'

// Canal de sincronização entre abas: depois de qualquer ação, as outras abas
// abertas no Modo Foco recarregam o estado autoritativo do servidor em vez
// de seguir com contadores próprios que divergem.
const CANAL_SYNC = 'modo-foco-sync'

export function useFocusSession() {
  const [session, setSession] = useState<FocusSession | null>(null)
  const [monthPoints, setMonthPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)
  const canalRef = useRef<BroadcastChannel | null>(null)

  const reload = useCallback(async () => {
    setError('')
    try {
      const res = await fetch('/api/admin/focus/sessions?active=true')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao verificar sessão')
      setSession(json.data ?? null)
      setMonthPoints(json.monthPoints ?? 0)
      return json.data as FocusSession | null
    } catch {
      // Falha de rede NUNCA encerra a sessão nem some com ela do estado —
      // só marca o erro e mantém o que já estava na tela pra retry.
      setError('Não foi possível verificar sua sessão do Modo Foco.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return
    const canal = new BroadcastChannel(CANAL_SYNC)
    canalRef.current = canal
    canal.onmessage = (ev) => { if (ev.data?.tipo === 'estado-mudou') reload() }
    return () => { canal.close(); canalRef.current = null }
  }, [reload])

  const avisarOutrasAbas = useCallback(() => {
    canalRef.current?.postMessage({ tipo: 'estado-mudou' })
  }, [])

  // O servidor monta a fila, calcula total_leads e grava o snapshot — o
  // cliente só manda os filtros. Se já existir uma sessão ativa (outra aba
  // criou primeiro), a RPC devolve aquela em vez de criar uma segunda.
  const start = useCallback(async (filtros: FocusQueueFilters) => {
    setStarting(true); setError('')
    try {
      const res = await fetch('/api/admin/focus/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filtros }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao iniciar sessão')
      setSession(json.data)
      avisarOutrasAbas()
      return json.data as FocusSession
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao iniciar sessão')
      return null
    } finally {
      setStarting(false)
    }
  }, [avisarOutrasAbas])

  // 'concluida' só é aceita pelo servidor quando não há mais item pendente
  // (409 caso contrário) — a tela não decide sozinha que o trabalho acabou.
  // 'abandonada' é pausar/sair, sem essa checagem.
  const finish = useCallback(async (status: 'concluida' | 'abandonada', sessionId?: string) => {
    const alvo = sessionId ?? session?.id
    if (!alvo) return null
    try {
      const res = await fetch('/api/admin/focus/sessions/' + alvo, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (res.status === 409) return { conflito: true, pendentes: json.pendentes as number }
      if (!res.ok) throw new Error(json.error || 'Falha ao encerrar sessão')
      setSession(json.data)
      avisarOutrasAbas()
      return { conflito: false, session: json.data as FocusSession }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao encerrar sessão')
      return null
    }
  }, [session, avisarOutrasAbas])

  // Substitui os contadores pelos valores AUTORITATIVOS que a própria
  // resposta da ação devolveu. Antes isso era um delta somado localmente
  // (`applyDelta`), que recontava depois de um alreadyProcessed e divergia
  // entre duas abas.
  const aplicarContadores = useCallback((contadores: FocusSession | { processed_leads: number; skipped_leads: number; earned_points: number; total_leads: number } | null | undefined) => {
    if (!contadores) return
    setSession((prev) => (prev ? { ...prev, ...contadores } : prev))
    avisarOutrasAbas()
  }, [avisarOutrasAbas])

  return { session, monthPoints, loading, error, starting, start, finish, reload, aplicarContadores, avisarOutrasAbas, setError }
}
