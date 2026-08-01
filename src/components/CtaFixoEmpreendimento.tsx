'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { trackFormOpen } from '@/lib/tracking'

// Âncora única do formulário de contato nas páginas de empreendimento. O
// componente não inventa destino: se o id não existir na página, ele some —
// botão que não leva a lugar nenhum queima o clique do tráfego pago.
export const ANCORA_CONTATO = 'contato'

// Espaço reservado à direita para o botão flutuante de WhatsApp (56px + respiro).
// Sem isso a barra passa por cima dele e o canal manual, que hoje é o único que
// converte, fica inalcançável no mobile.
export const RESERVA_WHATSAPP_PX = 88

// Fração da altura da viewport a partir da qual o CTA entra. Abaixo disso o
// visitante ainda está na primeira dobra e o botão só poluiria a hero.
export const FRACAO_DOBRA = 0.8

// Primeiro campo preenchível do formulário — o honeypot é [tabindex="-1"] e
// precisa ficar de fora, senão o foco cai num input que o humano não vê.
const SELETOR_PRIMEIRO_CAMPO =
  'input:not([type="hidden"]):not([tabindex="-1"]), select, textarea'

export function passouDaDobra(scrollY: number, alturaViewport: number): boolean {
  if (alturaViewport <= 0) return false
  return scrollY > alturaViewport * FRACAO_DOBRA
}

export function deveMostrarCta(estado: {
  temAncora: boolean
  passouDobra: boolean
  formVisivel: boolean
}): boolean {
  return estado.temAncora && estado.passouDobra && !estado.formVisivel
}

// Parâmetros do funil no mesmo formato que o FormContato usa em trackFormStart /
// trackFormSubmit — assim form_open, form_start e form_submit ficam comparáveis
// por empreendimento no GA4 sem inventar dimensão nova.
export function paramsFunilCta(dados: { nome: string; slug?: string | null }) {
  return {
    empreendimento: dados.slug || dados.nome,
    content_name: dados.nome,
    form_type: 'contact_form' as const,
  }
}

type ElementoFocavel = { focus?: (opcoes?: { preventScroll?: boolean }) => void }

type SecaoContato = {
  scrollIntoView: (opcoes: { behavior: ScrollBehavior; block: ScrollLogicalPosition }) => void
  querySelector: (seletor: string) => ElementoFocavel | null
}

type DocumentoComAncora = { getElementById: (id: string) => SecaoContato | null }

export function focarPrimeiroCampo(secao: SecaoContato | null): boolean {
  const campo = secao?.querySelector(SELETOR_PRIMEIRO_CAMPO)
  if (!campo?.focus) return false
  // preventScroll: o scrollIntoView suave já está em curso; focar sem essa flag
  // teleporta a página pro campo e mata a animação no meio.
  campo.focus({ preventScroll: true })
  return true
}

// Fábrica separada do componente porque o ambiente de teste do repo é `node`
// (sem jsdom): assim o clique inteiro — evento, rolagem e foco — é verificável
// passando um documento fake.
export function criarHandlerCta(config: {
  nome: string
  slug?: string | null
  doc: DocumentoComAncora
  reduzirMovimento?: boolean
  agendarFoco?: (acao: () => void) => void
}): () => void {
  const agendar = config.agendarFoco ?? ((acao: () => void) => acao())
  return () => {
    const secao = config.doc.getElementById(ANCORA_CONTATO)
    if (!secao) return
    trackFormOpen(paramsFunilCta({ nome: config.nome, slug: config.slug }))
    secao.scrollIntoView({
      behavior: config.reduzirMovimento ? 'auto' : 'smooth',
      block: 'start',
    })
    agendar(() => focarPrimeiroCampo(secao))
  }
}

type Props = {
  nome: string
  slug?: string | null
}

export default function CtaFixoEmpreendimento({ nome, slug }: Props) {
  const [temAncora, setTemAncora] = useState(false)
  const [passouDobra, setPassouDobra] = useState(false)
  const [formVisivel, setFormVisivel] = useState(false)
  const [reduzirMovimento, setReduzirMovimento] = useState(false)
  const tickRef = useRef(false)

  useEffect(() => {
    const secao = document.getElementById(ANCORA_CONTATO)
    if (!secao) return
    setTemAncora(true)

    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    setReduzirMovimento(Boolean(mq?.matches))

    // Enquanto o próprio formulário está na tela o CTA vira ruído redundante.
    const io = new IntersectionObserver((entradas) => setFormVisivel(entradas[0].isIntersecting), {
      rootMargin: '0px 0px -10% 0px',
    })
    io.observe(secao)

    // Throttle por rAF: o listener de scroll roda em toda rolagem e sem isso
    // dispara um setState por frame de evento em página de 10k px.
    const aoRolar = () => {
      if (tickRef.current) return
      tickRef.current = true
      window.requestAnimationFrame(() => {
        tickRef.current = false
        setPassouDobra(passouDaDobra(window.scrollY, window.innerHeight))
      })
    }
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', aoRolar)
    }
  }, [])

  const aoClicar = useCallback(() => {
    criarHandlerCta({
      nome,
      slug,
      doc: document,
      reduzirMovimento,
      // Foco depois da rolagem suave: focar antes faz o navegador cancelar a
      // animação. Com movimento reduzido a rolagem é instantânea.
      agendarFoco: (acao) => window.setTimeout(acao, reduzirMovimento ? 0 : 500),
    })()
  }, [nome, slug, reduzirMovimento])

  if (!temAncora) return null

  const visivel = deveMostrarCta({ temAncora, passouDobra, formVisivel })

  return (
    <div
      aria-hidden={!visivel}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 55,
        padding: '12px 16px',
        // A coluna da direita fica livre para o WhatsApp flutuante.
        paddingRight: `${RESERVA_WHATSAPP_PX}px`,
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        // Sem fundo próprio: qualquer faixa opaca aqui cobriria o botão do
        // WhatsApp mesmo com o padding reservado.
        pointerEvents: 'none',
        opacity: visivel ? 1 : 0,
        transform: visivel ? 'translateY(0)' : 'translateY(12px)',
        transition: reduzirMovimento ? 'none' : 'opacity 0.25s ease, transform 0.25s ease',
      }}
    >
      <button
        type="button"
        onClick={aoClicar}
        tabIndex={visivel ? 0 : -1}
        style={{
          pointerEvents: visivel ? 'auto' : 'none',
          width: '100%',
          maxWidth: 420,
          border: 'none',
          borderRadius: 12,
          padding: '15px 18px',
          background: '#1a1a1a',
          color: '#f5f1ea',
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 8px 28px rgba(0,0,0,0.28)',
        }}
      >
        Receba plantas e condições
      </button>
    </div>
  )
}
