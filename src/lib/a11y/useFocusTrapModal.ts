'use client'

import { useEffect, useRef, type RefObject } from 'react'

const SELETOR_FOCAVEL =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

type Options = {
  /** Controla se o modal está aberto — o hook só age enquanto `open` é true. */
  open: boolean
  /** Chamado quando o usuário pede pra fechar (Escape). */
  onClose: () => void
  /** Ref do elemento que abriu o modal (ex.: o botão de gatilho), se o
   * chamador já rastreia — preferido sobre `document.activeElement` pra
   * restaurar o foco ao fechar (achado P2-5: `document.activeElement` nunca
   * é null/false num documento carregado — sem fallback explícito, navegadores
   * que não focam botões no clique nativo, como o Safari histórico, perdiam a
   * posição de foco ao fechar). */
  openerRef?: RefObject<HTMLElement | null>
  /** Foco inicial ao abrir. Se ausente, foca o próprio container (que precisa
   * de `tabIndex={-1}` pra ser focável). */
  initialFocusRef?: RefObject<HTMLElement | null>
}

/**
 * Focus trap + Escape + scroll-lock + restauração de foco pra diálogos
 * modais (`role="dialog" aria-modal="true"`). Extraído do padrão já usado em
 * LeadCaptureModal (confirmado correto em revisão independente) pra reuso em
 * qualquer lightbox/modal do site sem duplicar a lógica — e corrige, na
 * extração, o único gap real que a revisão achou (P2-5, ver `openerRef` acima).
 *
 * Uso:
 *   const containerRef = useRef<HTMLDivElement>(null)
 *   useFocusTrapModal(containerRef, { open, onClose: () => setOpen(false) })
 *   ...
 *   {open && <div ref={containerRef} role="dialog" aria-modal="true" tabIndex={-1}>...</div>}
 */
export function useFocusTrapModal(
  containerRef: RefObject<HTMLElement | null>,
  { open, onClose, openerRef, initialFocusRef }: Options
) {
  const openerCapturadoRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    // Captura o elemento pro qual devolver o foco ao fechar. Prioridade:
    // 1) openerRef explícito do chamador, se ainda estiver no DOM;
    // 2) document.activeElement, mas só se for um elemento real (não <body>,
    //    que é o valor padrão quando nada está focado — devolver foco pro
    //    body não move o foco a lugar nenhum de útil, então tratamos como
    //    "não tem opener" em vez de forçar isso).
    const explicito = openerRef?.current
    const doDocumento = document.activeElement as HTMLElement | null
    openerCapturadoRef.current =
      explicito && explicito.isConnected
        ? explicito
        : doDocumento && doDocumento !== document.body && doDocumento.isConnected
          ? doDocumento
          : null

    const alvoInicial = initialFocusRef?.current || containerRef.current
    alvoInicial?.focus()

    const overflowOriginal = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !containerRef.current) return
      const focaveis = containerRef.current.querySelectorAll<HTMLElement>(SELETOR_FOCAVEL)
      if (focaveis.length === 0) {
        // nada focável dentro do modal — não deixa o Tab escapar pro resto da página
        e.preventDefault()
        return
      }
      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primeiro.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflowOriginal
      const devolverPara = openerCapturadoRef.current
      if (devolverPara && devolverPara.isConnected) devolverPara.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
}
