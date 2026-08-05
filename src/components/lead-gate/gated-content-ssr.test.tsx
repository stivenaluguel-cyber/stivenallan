import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import GatedContent from './GatedContent'
import LeadAccessGate from './LeadAccessGate'
import { LeadSessionProvider } from './LeadSessionProvider'

// As 36 páginas de empreendimento são ISR (`export const revalidate = 3600`):
// o HTML é gerado UMA vez e servido igual para todo visitante, com ou sem
// cadastro. Logo, tudo que aparecer nesta string está público — um `curl` ou
// "ver código-fonte" alcança sem cookie nenhum.
//
// Este arquivo existe para travar exatamente essa regressão: antes, o status
// default do contexto era 'unlocked', então o SSR entrava no ramo liberado e
// escrevia o conteúdo protegido no HTML estático.

vi.mock('@/lib/tracking', () => ({
  trackGatedContentView: vi.fn(),
  trackContentUnlocked: vi.fn(),
  trackPropertyInterestRecorded: vi.fn(),
}))

const PROP = {
  propertyId: '11111111-1111-1111-1111-111111111111',
  propertySlug: 'parco-savello-santa-barbara-criciuma-sc',
}

const SEGREDO = 'PLANTA-CONFIDENCIAL-3-DORMITORIOS'
const TEASER = '7 plantas liberadas apos o cadastro'

function renderSSR(ui: React.ReactElement) {
  return renderToStaticMarkup(<LeadSessionProvider>{ui}</LeadSessionProvider>)
}

describe('SSR do lead gate — o HTML estático nunca pode conter conteúdo protegido', () => {
  it('GatedContent com gate ligado renderiza o teaser, nunca os children', () => {
    const html = renderSSR(
      <GatedContent
        {...PROP}
        gateEnabled
        historyEnabled
        ctaPosition="galeria"
        teaser={<p>{TEASER}</p>}
      >
        <p>{SEGREDO}</p>
      </GatedContent>,
    )
    expect(html).not.toContain(SEGREDO)
    expect(html).toContain(TEASER)
  })

  it('com o gate DESLIGADO o conteúdo sai normalmente (35 páginas fora do piloto)', () => {
    const html = renderSSR(
      <GatedContent
        {...PROP}
        gateEnabled={false}
        historyEnabled={false}
        ctaPosition="galeria"
        teaser={<p>{TEASER}</p>}
      >
        <p>{SEGREDO}</p>
      </GatedContent>,
    )
    expect(html).toContain(SEGREDO)
  })

  it('o formulário não é renderizado no SSR — quem já tem sessão não vê flash', () => {
    // 'loading' no servidor: não dá pra saber se há cookie válido sem sair do
    // cache estático. O gate só decide depois da hidratação.
    const html = renderSSR(
      <LeadAccessGate
        {...PROP}
        propertyName="Parco Savello Residencial"
        gateEnabled
        variant="section-bottom"
        previewCount={{ fotos: 9, plantas: 7 }}
      />,
    )
    expect(html).toBe('')
  })

  it('o painel early-inline também fica fora do HTML estático', () => {
    const html = renderSSR(
      <LeadAccessGate
        {...PROP}
        propertyName="Parco Savello Residencial"
        gateEnabled
        variant="early-inline"
        previewCount={{ fotos: 9, plantas: 7 }}
      />,
    )
    expect(html).toBe('')
  })
})
