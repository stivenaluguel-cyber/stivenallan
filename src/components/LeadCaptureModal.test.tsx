// @vitest-environment happy-dom
//
// Cobre especificamente o achado P2-5: a versão antiga usava
// `document.activeElement || openerRef.current`, e como document.activeElement
// nunca é nulo (cai pro <body> por padrão), o fallback pro botão nunca era
// alcançado. Este teste reproduz exatamente o navegador problemático — clique
// que não move o foco nativamente — e confirma que o refactor sobre
// useFocusTrapModal (que prioriza openerRef de verdade) resolve isso.
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react'
import { LeadCaptureModal } from './LeadCaptureModal'

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
  localStorage.clear()
})

function escape() {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
  })
}

describe('LeadCaptureModal — acessibilidade (P2-5)', () => {
  it('abre com role dialog, aria-modal e nome acessível', () => {
    act(() => {
      root = createRoot(container)
      root.render(<LeadCaptureModal propertyId="p1" propertyName="Empreendimento Teste" bookPdfUrl={null} />)
    })
    const trigger = container.querySelector('button') as HTMLButtonElement
    act(() => trigger.click())

    const dialog = container.querySelector('[role="dialog"]') as HTMLElement
    expect(dialog).toBeTruthy()
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-labelledby')).toBe('lcm-title')
  })

  it('restaura o foco no botão que abriu mesmo quando o clique não focou nativamente (cenário Safari)', () => {
    act(() => {
      root = createRoot(container)
      root.render(<LeadCaptureModal propertyId="p1" propertyName="Empreendimento Teste" bookPdfUrl={null} />)
    })
    const trigger = container.querySelector('button') as HTMLButtonElement
    act(() => trigger.click())

    // Simula o navegador que não move o foco pro botão no clique — sem o
    // openerRef explícito, document.activeElement seria <body> aqui, e a
    // versão antiga do componente restauraria o foco pro lugar errado.
    act(() => (document.activeElement as HTMLElement | null)?.blur())
    expect(document.activeElement).toBe(document.body)

    escape()

    expect(document.activeElement).toBe(trigger)
  })

  it('Escape fecha o modal e libera o scroll do body', () => {
    act(() => {
      root = createRoot(container)
      root.render(<LeadCaptureModal propertyId="p1" propertyName="Empreendimento Teste" bookPdfUrl={null} />)
    })
    const trigger = container.querySelector('button') as HTMLButtonElement
    act(() => trigger.click())
    expect(document.body.style.overflow).toBe('hidden')

    escape()

    expect(container.querySelector('[role="dialog"]')).toBeNull()
    expect(document.body.style.overflow).toBe('')
  })
})
