'use client'
import { useCallback, useEffect, useState } from 'react'

export type FocusSession = {
  id: string
  admin_id: string
  status: 'ativa' | 'concluida' | 'abandonada'
  filtros: Record<string, unknown>
  total_leads: number
  processed_leads: number
  skipped_leads: number
  earned_points: number
  started_at: string
  finished_at: string | null
}

// Retoma uma sessão 'ativa' existente (persistência entre reloads — o
// requisito de "atualizar a página não apaga o progresso") ou cria uma nova
// quando o Modo Foco é aberto pela primeira vez. Os contadores da sessão
// (processed_leads/skipped_leads/earned_points) nunca são escritos por este
// hook — eles só mudam no servidor, via /api/admin/focus/events.
export function useFocusSession() {
  const [session, setSession] = useState<FocusSession | null>(null)
  const [monthPoints, setMonthPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(() => {
    let cancelado = false
    setLoading(true); setError('')
    fetch('/api/admin/focus/sessions?active=true')
      .then((r) => r.json())
      .then((j) => { if (!cancelado) { setSession(j.data ?? null); setMonthPoints(j.monthPoints ?? 0) } })
      .catch(() => { if (!cancelado) setError('Não foi possível verificar sua sessão do Modo Foco.') })
      .finally(() => { if (!cancelado) setLoading(false) })
    return () => { cancelado = true }
  }, [])

  useEffect(() => reload(), [reload])

  const start = useCallback(async (totalLeads: number, filtros: Record<string, unknown>) => {
    const res = await fetch('/api/admin/focus/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totalLeads, filtros }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error || 'Falha ao iniciar sessão'); return null }
    setSession(json.data)
    return json.data as FocusSession
  }, [])

  const finish = useCallback(async (status: 'concluida' | 'abandonada') => {
    if (!session) return null
    const res = await fetch('/api/admin/focus/sessions/' + session.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error || 'Falha ao encerrar sessão'); return null }
    setSession(json.data)
    return json.data as FocusSession
  }, [session])

  // Aplicado localmente pra refletir pontos/contadores na hora, sem esperar
  // um novo GET — a fonte de verdade continua sendo o servidor (o valor vem
  // sempre da resposta de /api/admin/focus/events, nunca de um cálculo aqui).
  const applyDelta = useCallback((delta: { points?: number; processed?: boolean; skipped?: boolean }) => {
    setSession((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        earned_points: prev.earned_points + (delta.points ?? 0),
        processed_leads: prev.processed_leads + (delta.processed ? 1 : 0),
        skipped_leads: prev.skipped_leads + (delta.skipped ? 1 : 0),
      }
    })
    if (delta.points) setMonthPoints((p) => p + delta.points!)
  }, [])

  return { session, monthPoints, loading, error, start, finish, applyDelta, reload }
}
