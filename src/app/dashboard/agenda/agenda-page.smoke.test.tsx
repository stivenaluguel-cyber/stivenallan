import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

// Mesmo padrão de src/app/dashboard/prospeccao/prospeccao-paginas.smoke.test.tsx:
// sem jsdom no projeto, renderToStaticMarkup é um render único e síncrono
// (useEffect nunca dispara, fetch fica pendurado de propósito), então só
// cobre o estado inicial de carregamento — ainda assim é o risco real de
// publicar (import/montagem quebrando a página inteira). Item 10B adicionou
// o campo `properties` ao tipo Evento e um novo ícone Lucide (Building2); o
// objetivo deste teste é garantir que isso não quebrou a montagem da página.
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
})

afterEach(() => vi.restoreAllMocks())

describe('AgendaPage monta sem quebrar (Item 10B: campo properties no tipo Evento)', () => {
  it('renderiza o estado inicial de carregamento', async () => {
    const { default: AgendaPage } = await import('./page')
    const html = renderToStaticMarkup(<AgendaPage />)
    expect(html).toContain('Agenda')
    expect(html).toContain('Carregando')
  })
})
