'use client'
import { useCallback, useEffect, useState } from 'react'
import type { FocusQueueFilters } from './focus-queue'

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
  proximaVisita: { id: string; titulo: string; inicio: string } | null
}

// A fila SEMPRE mostra items[0] como o lead atual: toda ação primária
// (pular/perdido/follow-up/visita) remove o lead processado da frente da
// fila via advancePast — isso evita qualquer contador de índice que possa
// dessincronizar, e garante que "pular todo mundo" termina naturalmente
// (a fila só encolhe, nunca dá loop).
export function useFocusQueue(filters: FocusQueueFilters) {
  const [items, setItems] = useState<FocusQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const filtersKey = JSON.stringify(filters)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams()
      if (filters.temperatura) params.set('temperatura', filters.temperatura)
      if (filters.estagioFunil) params.set('estagioFunil', filters.estagioFunil)
      if (filters.origem) params.set('origem', filters.origem)
      if (filters.apenasFollowupVencido) params.set('apenasFollowupVencido', 'true')
      if (typeof filters.semAcaoDias === 'number') params.set('semAcaoDias', String(filters.semAcaoDias))

      const res = await fetch('/api/admin/leads/foco?' + params.toString())
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar a fila do Modo Foco')
      setItems(json.data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar a fila')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey])

  useEffect(() => { load() }, [load])

  const advancePast = useCallback((leadId: string) => {
    setItems((prev) => prev.filter((it) => it.lead.id !== leadId))
  }, [])

  const updateLeadLocally = useCallback((leadId: string, patch: Partial<FocusQueueLeadFull>) => {
    setItems((prev) => prev.map((it) => (it.lead.id === leadId ? { ...it, lead: { ...it.lead, ...patch } } : it)))
  }, [])

  return {
    items,
    current: items[0] ?? null,
    remaining: items.length,
    loading,
    error,
    refetch: load,
    advancePast,
    updateLeadLocally,
  }
}
