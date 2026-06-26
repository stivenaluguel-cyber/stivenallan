'use client'
import { useState } from 'react'
import { c, font, radius, brl } from '@/lib/theme'

type Props = {
  valorInicial?: number
  valorMin?: number
  valorMax?: number
  hrefReserva?: string
}

function Linha({ cor, label, valor }: { cor: string; label: string; valor: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(245,241,234,0.78)' }}>
        <span style={{ width: 10, height: 10, borderRadius: 2, background: cor, flexShrink: 0 }} />
        {label}
      </span>
      <strong>{valor}</strong>
    </div>
  )
}

export default function Simulador({
  valorInicial = 850000,
  valorMin = 450000,
  valorMax = 2200000,
  hrefReserva = '#reserva',
}: Props) {
  const [valor, setValor] = useState(valorInicial)
  const [entradaPct, setEntradaPct] = useState(20)
  const [prazo, setPrazo] = useState(120)
  const [reforcoOn, setReforcoOn] = useState(true)
  const [reforcoValor, setReforcoValor] = useState(15000)

  const entrada = (valor * entradaPct) / 100
  const saldo = Math.max(0, valor - entrada)
  const numRef = reforcoOn ? Math.max(0, Math.floor(prazo / 12)) : 0
  const totalRef = Math.min(saldo, numRef * reforcoValor)
  const saldoParc = Math.max(0, saldo - totalRef)
  const parcela = prazo > 0 ? saldoParc / prazo : 0
  const pct = (x: number) => (valor > 0 ? ((x / valor) * 100) : 0).toFixed(1) + '%'

  const sliderStyle: React.CSSProperties = { width: '100%', marginTop: 12, height: 4, accentColor: c.bronze }
  const rowLabel: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }
  const valFmt: React.CSSProperties = { fontFamily: font.display, fontSize: 22, fontWeight: 600, color: c.ink }

  return (
    <section id="simulador" style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(48px,7vw,90px) clamp(20px,5vw,56px)', scrollMarginTop: 90 }}>
      <div style={{ textAlign: 'center', maxWidth: '56ch', margin: '0 auto' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: c.bronze }}>Simulador</span>
        <h2 style={{ fontFamily: font.display, fontWeight: 700, fontSize: 'clamp(28px,4vw,46px)', lineHeight: 1.1, margin: '14px 0 0', letterSpacing: '-0.025em', color: c.ink }}>
          Monte seu plano em 30 segundos.
        </h2>
        <p style={{ fontSize: 16, color: c.muted, margin: '14px 0 0', lineHeight: 1.6 }}>
          Ajuste e veja entrada, parcela mensal e reforços na hora. Valores ilustrativos.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(24px,3vw,40px)', marginTop: 'clamp(32px,4vw,48px)', alignItems: 'start' }}>
        {/* controles */}
        <div style={{ background: c.surface, border: `1px solid ${c.line}`, borderRadius: radius.lg, padding: 'clamp(24px,3vw,34px)', display: 'grid', gap: 26 }}>
          <div>
            <div style={rowLabel}>
              <label style={{ fontSize: 14, fontWeight: 600, color: c.ink }}>Valor da unidade</label>
              <span style={valFmt}>{brl(valor)}</span>
            </div>
            <input type="range" min={valorMin} max={valorMax} step={10000} value={valor} onChange={(e) => setValor(+e.target.value)} style={sliderStyle} />
          </div>
          <div>
            <div style={rowLabel}>
              <label style={{ fontSize: 14, fontWeight: 600, color: c.ink }}>Entrada</label>
              <span style={valFmt}>{entradaPct}% <span style={{ fontSize: 14, color: c.muted, fontFamily: font.body, fontWeight: 500 }}>· {brl(entrada)}</span></span>
            </div>
            <input type="range" min={5} max={40} step={1} value={entradaPct} onChange={(e) => setEntradaPct(+e.target.value)} style={sliderStyle} />
          </div>
          <div>
            <div style={rowLabel}>
              <label style={{ fontSize: 14, fontWeight: 600, color: c.ink }}>Prazo das parcelas</label>
              <span style={valFmt}>{prazo} meses</span>
            </div>
            <input type="range" min={60} max={200} step={12} value={prazo} onChange={(e) => setPrazo(+e.target.value)} style={sliderStyle} />
          </div>
          <div style={{ borderTop: `1px solid ${c.line}`, paddingTop: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.ink }}>Reforços anuais (balões)</div>
                <div style={{ fontSize: 12.5, color: c.muted, marginTop: 2 }}>Pagamentos extras que reduzem a mensal</div>
              </div>
              <button type="button" onClick={() => setReforcoOn((v) => !v)} style={{ cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: c.bronze, border: `1px solid ${c.bronze}`, borderRadius: 20, padding: '7px 14px', background: 'transparent' }}>
                {reforcoOn ? 'ATIVADO' : 'ATIVAR'}
              </button>
            </div>
            {reforcoOn && (
              <div style={{ marginTop: 18 }}>
                <div style={rowLabel}>
                  <label style={{ fontSize: 13, color: c.muted }}>Valor de cada reforço</label>
                  <span style={{ fontFamily: font.display, fontSize: 18, fontWeight: 600, color: c.ink }}>{brl(reforcoValor)}</span>
                </div>
                <input type="range" min={0} max={60000} step={2500} value={reforcoValor} onChange={(e) => setReforcoValor(+e.target.value)} style={{ ...sliderStyle, marginTop: 10 }} />
              </div>
            )}
          </div>
        </div>

        {/* resultado */}
        <div style={{ background: c.charcoal, color: c.onDark, borderRadius: radius.lg, padding: 'clamp(24px,3vw,34px)' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.04em', color: c.onDarkMuted }}>Sua parcela mensal estimada</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
            <span style={{ fontFamily: font.display, fontSize: 'clamp(48px,7vw,68px)', fontWeight: 600, color: c.orange, lineHeight: 1 }}>{brl(parcela)}</span>
          </div>
          <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', marginTop: 24, background: 'rgba(245,241,234,0.1)' }}>
            <div style={{ width: pct(entrada), background: c.orange, minWidth: entrada > 0 ? 4 : 0 }} />
            <div style={{ width: pct(totalRef), background: '#8a6f49', minWidth: totalRef > 0 ? 4 : 0 }} />
            <div style={{ width: pct(saldoParc), background: '#5c5446', minWidth: saldoParc > 0 ? 4 : 0 }} />
          </div>
          <div style={{ display: 'grid', gap: 14, marginTop: 24 }}>
            <Linha cor={c.orange} label={`Entrada (${entradaPct}%)`} valor={brl(entrada)} />
            <Linha cor="#8a6f49" label={`${numRef} reforços anuais`} valor={brl(totalRef)} />
            <Linha cor="#5c5446" label={`Saldo em ${prazo} meses`} valor={`${brl(parcela)}/mês`} />
          </div>
          <a href={hrefReserva} style={{ textDecoration: 'none', display: 'block', textAlign: 'center', background: c.orange, color: c.charcoal, fontWeight: 700, fontSize: 15, padding: 15, borderRadius: radius.sm, marginTop: 26, letterSpacing: '0.02em' }}>
            Quero estas condições
          </a>
          <p style={{ fontSize: 11.5, color: c.onDarkMuted, textAlign: 'center', margin: '14px 0 0', lineHeight: 1.5, opacity: 0.5 }}>
            Simulação ilustrativa, sem juros bancários. Sujeita a disponibilidade e análise.
          </p>
        </div>
      </div>
    </section>
  )
}
