import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  ANCORA_CONTATO,
  criarHandlerCta,
  deveMostrarCta,
  focarPrimeiroCampo,
  paramsFunilCta,
  passouDaDobra,
} from './CtaFixoEmpreendimento'
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from '@/lib/consent'

const CONSENTIMENTO_TOTAL = JSON.stringify({
  version: CONSENT_VERSION,
  updatedAt: '2026-01-01T00:00:00.000Z',
  categories: { analytics: true, marketing: true },
})

// Stub mínimo de browser (o ambiente de teste do repo é `node`, sem jsdom) —
// mesmo padrão de src/lib/tracking.test.ts.
function montarBrowser(gtag?: ReturnType<typeof vi.fn>) {
  const local: Record<string, string> = { [CONSENT_STORAGE_KEY]: CONSENTIMENTO_TOTAL }
  vi.stubGlobal('window', {
    location: { search: '', href: 'https://stivenallan.com.br/x', hostname: 'stivenallan.com.br' },
    localStorage: {
      getItem: (k: string) => (k in local ? local[k] : null),
      setItem: (k: string, v: string) => {
        local[k] = v
      },
    },
    gtag,
  })
  vi.stubGlobal('document', { title: 'Página Teste', cookie: '' })
}

type Chamada = { behavior: string; block: string }

// Documento fake com a seção do formulário e um input focável.
function docComAncora() {
  const rolagens: Chamada[] = []
  const focos: { preventScroll?: boolean }[] = []
  const secao = {
    scrollIntoView: (o: Chamada) => {
      rolagens.push(o)
    },
    querySelector: () => ({
      focus: (o?: { preventScroll?: boolean }) => {
        focos.push(o ?? {})
      },
    }),
  }
  return {
    rolagens,
    focos,
    doc: { getElementById: (id: string) => (id === ANCORA_CONTATO ? secao : null) },
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('passouDaDobra', () => {
  it('não aparece dentro da primeira dobra', () => {
    expect(passouDaDobra(0, 844)).toBe(false)
    expect(passouDaDobra(600, 844)).toBe(false)
  })

  it('aparece depois de 80% da altura da viewport', () => {
    expect(passouDaDobra(700, 844)).toBe(true)
    expect(passouDaDobra(5000, 844)).toBe(true)
  })

  it('viewport zerada (SSR/medida indisponível) não liga o CTA', () => {
    expect(passouDaDobra(1000, 0)).toBe(false)
  })
})

describe('deveMostrarCta', () => {
  it('mostra depois da dobra quando o formulário está fora da tela', () => {
    expect(deveMostrarCta({ temAncora: true, passouDobra: true, formVisivel: false })).toBe(true)
  })

  it('esconde quando o próprio formulário já está visível', () => {
    expect(deveMostrarCta({ temAncora: true, passouDobra: true, formVisivel: true })).toBe(false)
  })

  it('nunca mostra sem âncora na página', () => {
    expect(deveMostrarCta({ temAncora: false, passouDobra: true, formVisivel: false })).toBe(false)
  })
})

describe('paramsFunilCta', () => {
  it('usa o slug como empreendimento e o nome como content_name', () => {
    expect(paramsFunilCta({ nome: 'Parco Savello Residencial', slug: 'parco-savello-santa-barbara-criciuma-sc' })).toEqual({
      empreendimento: 'parco-savello-santa-barbara-criciuma-sc',
      content_name: 'Parco Savello Residencial',
      form_type: 'contact_form',
    })
  })

  it('cai no nome quando o slug não veio', () => {
    expect(paramsFunilCta({ nome: 'Pineto Residencial' }).empreendimento).toBe('Pineto Residencial')
  })
})

describe('focarPrimeiroCampo', () => {
  it('foca sem rolar de novo, pra não cancelar a animação em curso', () => {
    const { doc, focos } = docComAncora()
    expect(focarPrimeiroCampo(doc.getElementById(ANCORA_CONTATO))).toBe(true)
    expect(focos).toEqual([{ preventScroll: true }])
  })

  it('seção ausente não quebra', () => {
    expect(focarPrimeiroCampo(null)).toBe(false)
  })
})

describe('criarHandlerCta', () => {
  it('dispara form_open no GA4, rola até a âncora e foca o primeiro campo', () => {
    const gtag = vi.fn()
    montarBrowser(gtag)
    const { doc, rolagens, focos } = docComAncora()

    criarHandlerCta({ nome: 'Parco Savello Residencial', slug: 'parco-savello-santa-barbara-criciuma-sc', doc })()

    expect(gtag).toHaveBeenCalledWith('event', 'form_open', {
      empreendimento: 'parco-savello-santa-barbara-criciuma-sc',
      content_name: 'Parco Savello Residencial',
      form_type: 'contact_form',
    })
    expect(rolagens).toEqual([{ behavior: 'smooth', block: 'start' }])
    expect(focos).toHaveLength(1)
  })

  it('respeita prefers-reduced-motion na rolagem', () => {
    const gtag = vi.fn()
    montarBrowser(gtag)
    const { doc, rolagens } = docComAncora()

    criarHandlerCta({ nome: 'Pineto Residencial', doc, reduzirMovimento: true })()

    expect(rolagens).toEqual([{ behavior: 'auto', block: 'start' }])
  })

  it('sem âncora não rola nem emite evento', () => {
    const gtag = vi.fn()
    montarBrowser(gtag)
    const doc = { getElementById: () => null }

    criarHandlerCta({ nome: 'Pineto Residencial', doc })()

    expect(gtag).not.toHaveBeenCalled()
  })

  it('sem consentimento de analytics o clique não emite nada', () => {
    const gtag = vi.fn()
    vi.stubGlobal('window', { location: { search: '', href: 'https://x/', hostname: 'x' }, localStorage: { getItem: () => null, setItem: () => {} }, gtag })
    vi.stubGlobal('document', { title: 'x', cookie: '' })
    const { doc, rolagens } = docComAncora()

    criarHandlerCta({ nome: 'Pineto Residencial', doc })()

    expect(gtag).not.toHaveBeenCalled()
    // A rolagem é do usuário, não do rastreamento — continua acontecendo.
    expect(rolagens).toHaveLength(1)
  })
})
