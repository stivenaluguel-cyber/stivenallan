'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { getFaixasInvestimento } from '@/lib/faixas-investimento'
import { getAttribution, trackLeadEvent, trackLeadFormStart, trackLeadFormView, sendLeadToCapi } from '@/lib/tracking'
import { useLeadAccessContext } from './LeadSessionProvider'
import {
  CAMPOS_LEAD_GATE_ORDEM,
  primeiroCampoInvalido,
  validarFormularioCompleto,
  type CampoLeadGate,
  type ValoresLeadGate,
} from './validation'

type Props = {
  propertyId: string
  propertySlug: string
  propertyName: string
  ctaPosition: 'early-inline' | 'section-bottom'
  previewCount: { fotos: number; plantas: number }
}

const HONEYPOT_FIELD = 'hp_url'

function contagemPreview(fotos: number, plantas: number): string {
  const partes: string[] = []
  if (fotos > 0) partes.push(`${fotos} ${fotos === 1 ? 'foto' : 'fotos'}`)
  if (plantas > 0) partes.push(`${plantas} ${plantas === 1 ? 'planta' : 'plantas'}`)
  if (partes.length === 0) return 'Materiais completos liberados após o cadastro'
  return `${partes.join(' e ')} liberadas após o cadastro`
}

export default function LeadUnlockForm({ propertyId, propertySlug, propertyName, ctaPosition, previewCount }: Props) {
  const ctx = useLeadAccessContext()
  const faixas = getFaixasInvestimento(propertySlug)
  const formId = useId()

  const [valores, setValores] = useState<ValoresLeadGate>({
    nome: '', whatsapp: '', email: '',
    faixaInvestimento: '', prazoCompra: '', entradaDisponivel: '',
    consentimento: false,
  })
  const [hp, setHp] = useState('')
  const [erros, setErros] = useState<Partial<Record<CampoLeadGate, string>>>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'enviando' | 'erro' | 'ok'>('idle')
  const startedRef = useRef(false)
  const fieldRefs = useRef<Partial<Record<CampoLeadGate, HTMLInputElement | HTMLSelectElement>>>({})

  useEffect(() => {
    trackLeadFormView({ property_slug: propertySlug, cta_position: ctaPosition })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function markStarted() {
    if (startedRef.current) return
    startedRef.current = true
    trackLeadFormStart({ property_slug: propertySlug, cta_position: ctaPosition })
  }

  function setValor<K extends CampoLeadGate>(campo: K, valor: ValoresLeadGate[K]) {
    setValores((v) => ({ ...v, [campo]: valor }))
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: undefined }))
  }

  function focarCampo(campo: CampoLeadGate) {
    fieldRefs.current[campo]?.focus()
  }

  async function enviar() {
    setStatus('enviando')
    setErroGeral(null)
    const clientEventId = crypto.randomUUID()
    const attribution = getAttribution()

    try {
      const res = await fetch('/api/lead-gate/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          nome: valores.nome,
          whatsapp: valores.whatsapp,
          email: valores.email,
          faixaInvestimento: valores.faixaInvestimento,
          prazoCompra: valores.prazoCompra,
          entradaDisponivel: valores.entradaDisponivel,
          consentimento: valores.consentimento,
          propertyId,
          propertySlug,
          source: typeof window !== 'undefined' ? window.location.pathname : null,
          utm_source: attribution.utm_source ?? null,
          utm_medium: attribution.utm_medium ?? null,
          utm_campaign: attribution.utm_campaign ?? null,
          utm_content: attribution.utm_content ?? null,
          utm_term: attribution.utm_term ?? null,
          gclid: attribution.gclid ?? null,
          fbclid: attribution.fbclid ?? null,
          clientEventId,
          [HONEYPOT_FIELD]: hp,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setStatus('erro')
        setErroGeral(typeof body.error === 'string' ? body.error : 'Não foi possível enviar. Tente novamente.')
        return
      }

      setStatus('ok')
      ctx.onUnlocked()

      const eventId = crypto.randomUUID()
      trackLeadEvent(
        propertyName,
        eventId,
        { email: valores.email as string, telefone: valores.whatsapp as string, nome: valores.nome as string },
        { empreendimento: propertySlug, position: ctaPosition },
      )
      sendLeadToCapi({
        event_id: eventId,
        nome: valores.nome as string,
        telefone: valores.whatsapp as string,
        email: valores.email as string,
        content_name: propertyName,
      })
    } catch {
      setStatus('erro')
      setErroGeral('Não foi possível enviar. Verifique sua conexão e tente novamente.')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'enviando') return // proteção contra clique duplo

    const errosEncontrados = validarFormularioCompleto(valores)
    if (Object.keys(errosEncontrados).length > 0) {
      setErros(errosEncontrados)
      const primeiro = primeiroCampoInvalido(valores)
      if (primeiro) focarCampo(primeiro)
      return
    }

    enviar()
  }

  if (status === 'ok') {
    return (
      <div role="status" style={{ textAlign: 'center', padding: '24px 0' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: '0 0 8px' }}>
          Informações liberadas para você
        </p>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
          Confira o material completo abaixo. Em breve o Stiven entra em contato pelo WhatsApp.
        </p>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', minHeight: 44, padding: '10px 12px', borderRadius: 8,
    border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 15,
    fontFamily: 'var(--font-body)', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4,
  }
  const erroStyle: React.CSSProperties = { fontSize: 12, color: '#B3261E', margin: '4px 0 0' }

  function campo(id: CampoLeadGate, label: string, node: React.ReactNode) {
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle} htmlFor={`${formId}-${id}`}>{label} *</label>
        {node}
        {erros[id] && (
          <p style={erroStyle} id={`${formId}-${id}-erro`}>{erros[id]}</p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Honeypot invisível — humano nunca vê, bot preenche → server responde 400. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
        <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      </div>

      <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: '0 0 8px', textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
        Receba plantas, disponibilidade e condições
      </p>
      <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 12px' }}>
        Preencha seu cadastro para liberar os materiais completos deste empreendimento e receber atendimento personalizado.
      </p>
      <p style={{ fontSize: 13, color: 'var(--bronze)', fontWeight: 600, margin: '0 0 20px' }}>
        {contagemPreview(previewCount.fotos, previewCount.plantas)}
      </p>

      <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 10px' }}>
        Seus dados
      </p>
      {campo('nome', 'Nome completo', (
        <input
          id={`${formId}-nome`}
          ref={(el) => { fieldRefs.current.nome = el ?? undefined }}
          type="text" style={inputStyle} value={valores.nome as string}
          onChange={(e) => setValor('nome', e.target.value)} onFocus={markStarted}
          // name + autoComplete: WCAG 1.3.5 (AA) exige o token de propósito em
          // campo que coleta dado do próprio usuário. Sem isso, quem depende de
          // preenchimento automático digita tudo à mão no teclado virtual.
          name="nome" autoComplete="name" required aria-required="true"
          aria-invalid={!!erros.nome} aria-describedby={erros.nome ? `${formId}-nome-erro` : undefined}
        />
      ))}
      {campo('whatsapp', 'WhatsApp', (
        <input
          id={`${formId}-whatsapp`}
          ref={(el) => { fieldRefs.current.whatsapp = el ?? undefined }}
          type="tel" style={inputStyle} value={valores.whatsapp as string}
          onChange={(e) => setValor('whatsapp', e.target.value)} onFocus={markStarted}
          name="whatsapp" autoComplete="tel-national" inputMode="tel" required aria-required="true"
          aria-invalid={!!erros.whatsapp} aria-describedby={erros.whatsapp ? `${formId}-whatsapp-erro` : undefined}
        />
      ))}
      {campo('email', 'E-mail', (
        <input
          id={`${formId}-email`}
          ref={(el) => { fieldRefs.current.email = el ?? undefined }}
          type="email" style={inputStyle} value={valores.email as string}
          onChange={(e) => setValor('email', e.target.value)} onFocus={markStarted}
          name="email" autoComplete="email" inputMode="email" required aria-required="true"
          aria-invalid={!!erros.email} aria-describedby={erros.email ? `${formId}-email-erro` : undefined}
        />
      ))}

      <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: '20px 0 10px' }}>
        Sobre a compra
      </p>
      {campo('faixaInvestimento', 'Faixa de investimento', (
        <select
          id={`${formId}-faixaInvestimento`}
          ref={(el) => { fieldRefs.current.faixaInvestimento = el ?? undefined }}
          style={inputStyle} value={valores.faixaInvestimento as string}
          onChange={(e) => setValor('faixaInvestimento', e.target.value)} onFocus={markStarted}
          // aria-describedby também nos selects: o helper campo() sempre
          // renderiza o <p> do erro, mas antes só os <input> apontavam pra ele.
          // O foco pós-submit vai pro primeiro campo inválido — se fosse um
          // select, o leitor de tela anunciava "inválido" sem dizer por quê.
          name="faixaInvestimento" required aria-required="true"
          aria-invalid={!!erros.faixaInvestimento}
          aria-describedby={erros.faixaInvestimento ? `${formId}-faixaInvestimento-erro` : undefined}
        >
          <option value="" disabled>Selecione</option>
          {faixas.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      ))}
      {campo('prazoCompra', 'Quando pretende comprar?', (
        <select
          id={`${formId}-prazoCompra`}
          ref={(el) => { fieldRefs.current.prazoCompra = el ?? undefined }}
          style={inputStyle} value={valores.prazoCompra as string}
          onChange={(e) => setValor('prazoCompra', e.target.value)} onFocus={markStarted}
          name="prazoCompra" required aria-required="true"
          aria-invalid={!!erros.prazoCompra}
          aria-describedby={erros.prazoCompra ? `${formId}-prazoCompra-erro` : undefined}
        >
          <option value="" disabled>Selecione</option>
          <option value="Imediato">Imediato</option>
          <option value="3 a 6 meses">3 a 6 meses</option>
          <option value="6 a 12 meses">6 a 12 meses</option>
          <option value="Apenas pesquisando">Apenas pesquisando</option>
        </select>
      ))}
      {campo('entradaDisponivel', 'Entrada disponível', (
        <select
          id={`${formId}-entradaDisponivel`}
          ref={(el) => { fieldRefs.current.entradaDisponivel = el ?? undefined }}
          style={inputStyle} value={valores.entradaDisponivel as string}
          onChange={(e) => setValor('entradaDisponivel', e.target.value)} onFocus={markStarted}
          name="entradaDisponivel" required aria-required="true"
          aria-invalid={!!erros.entradaDisponivel}
          aria-describedby={erros.entradaDisponivel ? `${formId}-entradaDisponivel-erro` : undefined}
        >
          <option value="" disabled>Selecione</option>
          <option value="Menos de 10%">Menos de 10% do valor</option>
          <option value="10% a 19%">10% a 19% do valor</option>
          <option value="20% a 29%">20% a 29% do valor</option>
          <option value="30% ou mais">30% ou mais do valor</option>
          <option value="Preciso calcular">Preciso calcular</option>
        </select>
      ))}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '18px 0' }}>
        <input
          id={`${formId}-consentimento`}
          ref={(el) => { fieldRefs.current.consentimento = el ?? undefined }}
          type="checkbox" checked={valores.consentimento as boolean}
          onChange={(e) => setValor('consentimento', e.target.checked)}
          // 24px é o mínimo de alvo de toque da WCAG 2.2 (2.5.8); os 20px
          // anteriores ficavam abaixo. O <label htmlFor> ao lado amplia a área
          // clicável, mas o próprio quadrado também precisa ser alcançável.
          style={{ width: 24, height: 24, minWidth: 24, marginTop: 2 }}
          aria-invalid={!!erros.consentimento}
          aria-describedby={erros.consentimento ? `${formId}-consentimento-erro` : undefined}
        />
        <label htmlFor={`${formId}-consentimento`} style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
          Ao enviar, você autoriza Stiven Allan a entrar em contato sobre os empreendimentos consultados por
          WhatsApp, telefone ou e-mail. Seu histórico de interesse poderá ser utilizado para personalizar o
          atendimento, conforme a{' '}
          <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bronze)', textDecoration: 'underline' }}>
            Política de Privacidade
          </a>.
        </label>
      </div>
      {/* id obrigatório: o consentimento não passa pelo helper campo(), então
          o <p> nascia sem id e o aria-describedby do checkbox não tinha alvo. */}
      {erros.consentimento && <p style={erroStyle} id={`${formId}-consentimento-erro`}>{erros.consentimento}</p>}

      <button
        type="submit"
        disabled={status === 'enviando'}
        style={{
          width: '100%', minHeight: 44, padding: '12px 16px', borderRadius: 8, border: 'none',
          background: 'var(--bronze)', color: '#fff', fontWeight: 700, fontSize: 15,
          fontFamily: 'var(--font-body)', cursor: status === 'enviando' ? 'default' : 'pointer',
          opacity: status === 'enviando' ? 0.7 : 1,
        }}
      >
        {status === 'enviando' ? 'Enviando…' : 'Liberar informações'}
      </button>

      <div role="alert" aria-live="polite" style={{ minHeight: 20, marginTop: 10 }}>
        {erroGeral && <p style={{ fontSize: 13, color: '#B3261E', margin: 0 }}>{erroGeral}</p>}
      </div>
    </form>
  )
}
