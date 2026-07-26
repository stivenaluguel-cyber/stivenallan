'use client'
import { useCallback, useRef, useState } from 'react'
import { INITIAL_RUNNER_STATE, applyFailure, applySuccess, beginRetryKey, type RunnerState } from './focus-action-runner'
import { clearDurableEventId, getOrCreateDurableEventId } from './focus-durable-event-id'

// Shim fino de React em cima do núcleo puro em focus-action-runner.ts +
// focus-durable-event-id.ts. `run(key, fn)` sempre resolve o
// client_event_id da AÇÃO identificada por `key` — que é o mesmo id de uma
// tentativa anterior ainda pendente (falhou e a página pode até ter
// recarregado no meio) ou um id novo se não há nada pendente pra essa key.
// `retry()` reenvia a MESMA última tentativa que falhou. processandoRef
// (não só o state) evita que um duplo-clique dispare duas execuções antes
// do re-render desabilitar o botão.
export function useFocusActionRunner() {
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState('')
  const processandoRef = useRef(false)
  const stateRef = useRef<RunnerState>(INITIAL_RUNNER_STATE)
  const lastFnRef = useRef<((clientEventId: string) => Promise<void>) | null>(null)

  const executar = useCallback(async (key: string, clientEventId: string, fn: (id: string) => Promise<void>) => {
    processandoRef.current = true
    setProcessando(true)
    setErro('')
    lastFnRef.current = fn
    try {
      await fn(clientEventId)
      stateRef.current = applySuccess()
      clearDurableEventId(key)
    } catch (e) {
      stateRef.current = applyFailure(key)
      setErro(e instanceof Error ? e.message : 'Erro ao processar ação')
      throw e
    } finally {
      processandoRef.current = false
      setProcessando(false)
    }
  }, [])

  // `key` deve identificar a INTENÇÃO do usuário de forma estável (ex.:
  // "followup:{leadId}") — não um valor aleatório por clique. É essa
  // estabilidade que permite recuperar o client_event_id certo depois de
  // um reload no meio de uma tentativa que falhou.
  const run = useCallback((key: string, fn: (clientEventId: string) => Promise<void>): Promise<void> => {
    if (processandoRef.current) return Promise.resolve()
    const clientEventId = getOrCreateDurableEventId(key, () => crypto.randomUUID())
    return executar(key, clientEventId, fn)
  }, [executar])

  const retry = useCallback((): Promise<void> => {
    if (processandoRef.current) return Promise.resolve()
    const key = beginRetryKey(stateRef.current)
    if (!key || !lastFnRef.current) return Promise.resolve()
    const clientEventId = getOrCreateDurableEventId(key, () => crypto.randomUUID())
    return executar(key, clientEventId, lastFnRef.current)
  }, [executar])

  return { processando, erro, setErro, run, retry, temFalhaPendente: !!stateRef.current.lastFailedKey }
}
