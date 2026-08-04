// @vitest-environment happy-dom
//
// Único arquivo de teste do projeto que precisa de DOM real (o resto roda em
// 'node', ver vitest.config.ts) — foco/Tab/Escape só existem de verdade num
// documento com layout e árvore de foco, então testar isso com mocks de
// função não provaria nada. `happy-dom` foi escolhido por ser a única
// dependência nova necessária (sem puxar @testing-library/react junto).
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react'
import { useRef } from 'react'
import { useFocusTrapModal } from './useFocusTrapModal'

function Modal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  useFocusTrapModal(containerRef, { open, onClose })
  if (!open) return null
  return (
    <div ref={containerRef} role="dialog" aria-modal="true" aria-label="Teste" tabIndex={-1}>
      <button>Primeiro</button>
      <button>Meio</button>
      <button>Último</button>
    </div>
  )
}

function Harness({ initialOpen = false }: { initialOpen?: boolean }) {
  return (
    <div>
      <button id="opener">Abrir</button>
      <Modal open={initialOpen} onClose={() => {}} />
    </div>
  )
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  act(() => root?.unmount())
  container.remove()
  document.body.style.overflow = ''
})

function montar(jsx: React.ReactElement) {
  act(() => {
    root = createRoot(container)
    root.render(jsx)
  })
}

function tab(opts: { shift?: boolean } = {}) {
  const ev = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: !!opts.shift, bubbles: true, cancelable: true })
  act(() => window.dispatchEvent(ev))
  return ev
}

function escape() {
  const ev = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
  act(() => window.dispatchEvent(ev))
}

describe('useFocusTrapModal — abrir', () => {
  it('foca o container do diálogo ao abrir (fallback sem initialFocusRef)', () => {
    montar(<Harness />)
    const opener = document.getElementById('opener')!
    act(() => opener.focus())
    expect(document.activeElement).toBe(opener)

    function Wrapper() {
      const containerRef = useRef<HTMLDivElement>(null)
      useFocusTrapModal(containerRef, { open: true, onClose: () => {} })
      return (
        <div ref={containerRef} role="dialog" aria-modal="true" tabIndex={-1}>
          <button>A</button>
        </div>
      )
    }
    act(() => root.render(<Wrapper />))
    expect(document.activeElement?.getAttribute('role')).toBe('dialog')
  })

  it('bloqueia o scroll do body enquanto aberto', () => {
    function Wrapper() {
      const containerRef = useRef<HTMLDivElement>(null)
      useFocusTrapModal(containerRef, { open: true, onClose: () => {} })
      return <div ref={containerRef} role="dialog" tabIndex={-1} />
    }
    montar(<Wrapper />)
    expect(document.body.style.overflow).toBe('hidden')
  })
})

describe('useFocusTrapModal — Tab / Shift+Tab (focus trap)', () => {
  it('Tab no último elemento focável volta pro primeiro', () => {
    montar(<Modal open onClose={() => {}} />)
    const botoes = document.querySelectorAll('button')
    const ultimo = botoes[botoes.length - 1] as HTMLElement
    act(() => ultimo.focus())
    expect(document.activeElement).toBe(ultimo)

    const ev = tab()
    expect(document.activeElement).toBe(botoes[0])
    expect(ev.defaultPrevented).toBe(true)
  })

  it('Shift+Tab no primeiro elemento focável vai pro último', () => {
    montar(<Modal open onClose={() => {}} />)
    const botoes = document.querySelectorAll('button')
    const primeiro = botoes[0] as HTMLElement
    act(() => primeiro.focus())

    const ev = tab({ shift: true })
    expect(document.activeElement).toBe(botoes[botoes.length - 1])
    expect(ev.defaultPrevented).toBe(true)
  })

  it('Tab no meio do modal não é interceptado (deixa o navegador mover normalmente)', () => {
    montar(<Modal open onClose={() => {}} />)
    const botoes = document.querySelectorAll('button')
    act(() => (botoes[1] as HTMLElement).focus())
    const ev = tab()
    expect(ev.defaultPrevented).toBe(false)
  })
})

describe('useFocusTrapModal — Escape', () => {
  it('chama onClose', () => {
    const onClose = vi.fn()
    montar(<div><Modal open onClose={onClose} /></div>)
    escape()
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('useFocusTrapModal — restauração de foco ao fechar', () => {
  it('restaura o foco pro elemento que estava focado antes de abrir (document.activeElement)', () => {
    function Wrapper({ open }: { open: boolean }) {
      const containerRef = useRef<HTMLDivElement>(null)
      useFocusTrapModal(containerRef, { open, onClose: () => {} })
      return (
        <div>
          <button id="opener">Abrir</button>
          {open && (
            <div ref={containerRef} role="dialog" tabIndex={-1}>
              <button>Dentro</button>
            </div>
          )}
        </div>
      )
    }
    act(() => {
      root = createRoot(container)
      root.render(<Wrapper open={false} />)
    })
    const opener = document.getElementById('opener') as HTMLElement
    act(() => opener.focus())
    expect(document.activeElement).toBe(opener)

    act(() => root.render(<Wrapper open={true} />))
    expect(document.activeElement).not.toBe(opener) // foco foi pro dialog

    act(() => root.render(<Wrapper open={false} />))
    expect(document.activeElement).toBe(opener) // e voltou
  })

  it('prefere openerRef explícito sobre document.activeElement (achado P2-5)', () => {
    function Wrapper({ open }: { open: boolean }) {
      const containerRef = useRef<HTMLDivElement>(null)
      const openerRef = useRef<HTMLButtonElement>(null)
      useFocusTrapModal(containerRef, { open, onClose: () => {}, openerRef })
      return (
        <div>
          {/* botão que "clica" mas não recebe foco nativo (simula Safari) */}
          <button ref={openerRef} id="opener-real">Abrir</button>
          <button id="outro">Outro elemento que por acaso está focado</button>
          {open && <div ref={containerRef} role="dialog" tabIndex={-1}><button>Dentro</button></div>}
        </div>
      )
    }
    act(() => {
      root = createRoot(container)
      root.render(<Wrapper open={false} />)
    })
    // ninguém focado explicitamente (ou algo diferente do opener real) —
    // document.activeElement é <body> nesse ponto
    expect(document.activeElement).toBe(document.body)

    act(() => root.render(<Wrapper open={true} />))
    act(() => root.render(<Wrapper open={false} />))
    // mesmo sem ter sido document.activeElement antes, o openerRef explícito
    // deve receber o foco de volta
    expect(document.activeElement?.id).toBe('opener-real')
  })

  it('não força o foco pro <body> quando nada estava focado antes de abrir', () => {
    function Wrapper({ open }: { open: boolean }) {
      const containerRef = useRef<HTMLDivElement>(null)
      useFocusTrapModal(containerRef, { open, onClose: () => {} })
      return (
        <div>
          <button id="outro">Não é o opener</button>
          {open && <div ref={containerRef} role="dialog" tabIndex={-1}><button>Dentro</button></div>}
        </div>
      )
    }
    act(() => {
      root = createRoot(container)
      root.render(<Wrapper open={false} />)
    })
    expect(document.activeElement).toBe(document.body)
    act(() => root.render(<Wrapper open={true} />))
    act(() => root.render(<Wrapper open={false} />))
    // não deve ter chamado .focus() no <body> explicitamente — o browser cai
    // pro padrão dele (que também é <body>, mas por ausência de ação, não
    // por escolha do hook)
    expect(document.activeElement).toBe(document.body)
  })

  it('não quebra se o opener foi removido do DOM enquanto o modal estava aberto (checa isConnected)', () => {
    function Wrapper({ open, mostrarOpener }: { open: boolean; mostrarOpener: boolean }) {
      const containerRef = useRef<HTMLDivElement>(null)
      useFocusTrapModal(containerRef, { open, onClose: () => {} })
      return (
        <div>
          {mostrarOpener && <button id="opener">Abrir</button>}
          {open && <div ref={containerRef} role="dialog" tabIndex={-1}><button>Dentro</button></div>}
        </div>
      )
    }
    act(() => {
      root = createRoot(container)
      root.render(<Wrapper open={false} mostrarOpener={true} />)
    })
    const opener = document.getElementById('opener') as HTMLElement
    act(() => opener.focus())
    act(() => root.render(<Wrapper open={true} mostrarOpener={true} />))
    // opener some do DOM enquanto o modal está aberto
    act(() => root.render(<Wrapper open={true} mostrarOpener={false} />))
    expect(() => {
      act(() => root.render(<Wrapper open={false} mostrarOpener={false} />))
    }).not.toThrow()
  })

  it('restaura o overflow original do body (não sempre string vazia)', () => {
    document.body.style.overflow = 'scroll'
    function Wrapper({ open }: { open: boolean }) {
      const containerRef = useRef<HTMLDivElement>(null)
      useFocusTrapModal(containerRef, { open, onClose: () => {} })
      return open ? <div ref={containerRef} role="dialog" tabIndex={-1} /> : null
    }
    act(() => {
      root = createRoot(container)
      root.render(<Wrapper open={false} />)
    })
    act(() => root.render(<Wrapper open={true} />))
    expect(document.body.style.overflow).toBe('hidden')
    act(() => root.render(<Wrapper open={false} />))
    expect(document.body.style.overflow).toBe('scroll')
    document.body.style.overflow = ''
  })
})
