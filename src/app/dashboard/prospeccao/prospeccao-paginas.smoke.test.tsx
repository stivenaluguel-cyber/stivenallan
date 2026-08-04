import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

// Sem jsdom no projeto (mesma decisão do smoke test do Sócio). Páginas do App
// Router usam useRouter/useParams, que só existem dentro da árvore do Next —
// fora dela estouram sem esse mock. renderToStaticMarkup é um render único e
// síncrono: useEffect nunca dispara, então só o estado inicial (loading) é
// alcançável aqui — ainda assim cobre o risco real de publicar, que é um erro
// de import/montagem quebrando a página inteira.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useParams: () => ({ id: 'campanha-1' }),
}))

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
})
afterEach(() => vi.restoreAllMocks())

describe('páginas de Prospecção montam sem quebrar', () => {
  it('lista de campanhas', async () => {
    const { default: ProspeccaoPage } = await import('./page')
    const html = renderToStaticMarkup(<ProspeccaoPage />)
    expect(html).toContain('Prospecção')
    expect(html).toContain('Carregando')
  })

  it('formulário de nova campanha', async () => {
    const { default: NovaProspeccaoPage } = await import('./nova/page')
    const html = renderToStaticMarkup(<NovaProspeccaoPage />)
    expect(html).toContain('Nova campanha de prospecção')
    expect(html).toContain('Analisar com IA')
  })

  it('detalhe da campanha', async () => {
    const { default: ProspeccaoDetalhePage } = await import('./[id]/page')
    const html = renderToStaticMarkup(<ProspeccaoDetalhePage />)
    expect(html).toContain('Carregando')
  })
})
