'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Arrastar card do Kanban com o dedo.
 *
 * O arrastar-e-soltar do CRM é HTML5 (draggable/onDrop), que nenhum navegador
 * móvel implementa — no celular o único jeito de mover um card era o botão
 * "Mover etapa". O botão continua (é o caminho acessível e o único viável com
 * a coluna de destino fora da tela), mas quem trabalha no celular espera
 * arrastar, e arrastar é mais rápido para a coluna vizinha.
 *
 * Três decisões que não são estéticas:
 *
 * 1. Só entra em ação com o dedo (pointerType != 'mouse'). No desktop o
 *    HTML5 nativo já funciona e é melhor — duplicar o gesto criaria dois
 *    caminhos concorrentes para o mesmo evento.
 *
 * 2. O arraste começa por toque LONGO. Iniciar no primeiro movimento
 *    sequestraria a rolagem: a lista de cards rola na vertical e as colunas
 *    rolam na horizontal, então qualquer deslize viraria arraste acidental.
 *    Se o dedo se mexer antes do tempo, o gesto é rolagem e desistimos.
 *
 * 3. A rolagem é bloqueada por um listener de `touchmove` não-passivo.
 *    `preventDefault` no pointermove não segura o scroll no Safari do iPhone,
 *    e `touch-action: none` aplicado depois que o gesto começou chega tarde —
 *    o navegador já decidiu que aquilo era rolagem.
 */

const LIMIAR_MOVIMENTO = 10 // px de tolerância antes do toque virar rolagem
const ESPERA_TOQUE_LONGO = 280 // ms segurando até o card descolar
const MARGEM_AUTOSCROLL = 56 // px da borda onde as colunas começam a correr
const PASSO_AUTOSCROLL = 14 // px por passo
// O laço é setInterval e não requestAnimationFrame de propósito: rAF é
// suspenso ou throttled em vários contextos (aba em segundo plano, WebView
// embutida, painel de preview) e o auto-scroll morreria em silêncio, deixando
// a coluna fora da tela inalcançável. O laço só existe durante o arraste.
const INTERVALO_AUTOSCROLL = 16 // ms
const CARENCIA_CLIQUE = 350 // ms ignorando o clique que o navegador emite após soltar

export type Ponto = { x: number; y: number }

/**
 * O dedo se mexeu demais antes do card descolar? Então era rolagem.
 *
 * Separado do hook para poder ser testado sem DOM: é a decisão que define se
 * o gesto vira arraste ou continua sendo scroll, e errar nela deixa a lista
 * impossível de rolar.
 */
export function virouRolagem(origem: Ponto, atual: Ponto): boolean {
  return Math.abs(atual.x - origem.x) > LIMIAR_MOVIMENTO
    || Math.abs(atual.y - origem.y) > LIMIAR_MOVIMENTO
}

/**
 * Quanto as colunas devem correr neste quadro, com o dedo em `x`.
 *
 * Sem isto, arrastar para uma coluna fora da tela seria impossível no
 * celular: cabem duas colunas na largura de um iPhone e o dedo não pode
 * rolar e arrastar ao mesmo tempo.
 */
export function passoAutoscroll(x: number, borda: { left: number; right: number }): number {
  if (x < borda.left + MARGEM_AUTOSCROLL) return -PASSO_AUTOSCROLL
  if (x > borda.right - MARGEM_AUTOSCROLL) return PASSO_AUTOSCROLL
  return 0
}

type Gesto = {
  leadId: string | null
  origem: Ponto | null
  ultimo: Ponto | null
  timer: ReturnType<typeof setTimeout> | null
  laco: ReturnType<typeof setInterval> | null
  arrastando: boolean
}

const gestoVazio = (): Gesto => ({
  leadId: null, origem: null, ultimo: null, timer: null, laco: null, arrastando: false,
})

export function useKanbanTouchDrag({
  onSoltar,
  scrollerRef,
}: {
  onSoltar: (leadId: string, estagio: string) => void
  scrollerRef: { current: HTMLDivElement | null }
}) {
  // `gestoId` existe só para acordar o efeito que instala os listeners; o
  // estado real do gesto mora no ref, porque os handlers de ponteiro leem
  // valores a cada quadro e não podem depender de re-render.
  const [gestoId, setGestoId] = useState<string | null>(null)
  const [leadArrastado, setLeadArrastado] = useState<string | null>(null)
  const [colunaAlvo, setColunaAlvo] = useState<string | null>(null)
  const [ponto, setPonto] = useState<Ponto | null>(null)

  const gesto = useRef<Gesto>(gestoVazio())
  const colunaAlvoRef = useRef<string | null>(null)
  const bloqueioClique = useRef(0)
  // `onSoltar` vem como função solta do componente pai, recriada a cada
  // render — e o arraste re-renderiza a cada quadro para mover o fantasma.
  // Se ela entrasse nas dependências do efeito, os listeners seriam
  // desmontados no primeiro movimento do dedo e o arraste morria ali.
  const onSoltarRef = useRef(onSoltar)

  colunaAlvoRef.current = colunaAlvo
  onSoltarRef.current = onSoltar

  const iniciarToque = useCallback((leadId: string, e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return
    gesto.current = { ...gestoVazio(), leadId, origem: { x: e.clientX, y: e.clientY } }
    gesto.current.ultimo = gesto.current.origem
    setGestoId(leadId + ':' + e.pointerId)
  }, [])

  /**
   * O navegador dispara um `click` sintético no card quando o dedo levanta.
   * Sem esta carência, soltar o card na coluna nova também abriria o lead.
   */
  const deveIgnorarClique = useCallback(() => Date.now() < bloqueioClique.current, [])

  useEffect(() => {
    if (!gestoId) return
    const s = gesto.current

    const encerrar = () => setGestoId(null)

    const correrColunas = () => {
      const sc = scrollerRef.current
      const p = s.ultimo
      if (sc && p && s.arrastando) {
        sc.scrollLeft += passoAutoscroll(p.x, sc.getBoundingClientRect())
      }
    }

    const aoMover = (e: PointerEvent) => {
      const p = { x: e.clientX, y: e.clientY }
      s.ultimo = p

      if (!s.arrastando) {
        // Mexeu antes da hora: o dedo está rolando a tela, não pegando o card.
        if (virouRolagem(s.origem ?? p, p)) encerrar()
        return
      }

      setPonto(p)
      // O fantasma que segue o dedo tem pointer-events:none, senão
      // elementFromPoint devolveria sempre ele e nunca a coluna embaixo.
      const alvo = document.elementFromPoint(p.x, p.y) as HTMLElement | null
      const coluna = alvo?.closest('[data-coluna]') as HTMLElement | null
      setColunaAlvo(coluna?.dataset.coluna ?? null)
    }

    const aoSoltar = () => {
      if (s.arrastando) {
        bloqueioClique.current = Date.now() + CARENCIA_CLIQUE
        const destino = colunaAlvoRef.current
        if (s.leadId && destino) onSoltarRef.current(s.leadId, destino)
      }
      encerrar()
    }

    const bloquearRolagem = (e: TouchEvent) => { if (s.arrastando) e.preventDefault() }

    s.timer = setTimeout(() => {
      s.arrastando = true
      setLeadArrastado(s.leadId)
      setPonto(s.ultimo ?? s.origem)
      // Vibração curta é o sinal de que o card descolou — sem ela o corretor
      // não sabe se já pode mover. Nem todo navegador tem, daí o opcional.
      navigator.vibrate?.(12)
      s.laco = setInterval(correrColunas, INTERVALO_AUTOSCROLL)
    }, ESPERA_TOQUE_LONGO)

    document.addEventListener('pointermove', aoMover)
    document.addEventListener('pointerup', aoSoltar)
    document.addEventListener('pointercancel', encerrar)
    document.addEventListener('touchmove', bloquearRolagem, { passive: false })

    return () => {
      if (s.timer) clearTimeout(s.timer)
      if (s.laco) clearInterval(s.laco)
      document.removeEventListener('pointermove', aoMover)
      document.removeEventListener('pointerup', aoSoltar)
      document.removeEventListener('pointercancel', encerrar)
      document.removeEventListener('touchmove', bloquearRolagem)
      gesto.current = gestoVazio()
      setLeadArrastado(null)
      setColunaAlvo(null)
      setPonto(null)
    }
  }, [gestoId, scrollerRef])

  return { leadArrastado, colunaAlvo, ponto, iniciarToque, deveIgnorarClique }
}
