'use client'
import { useState, useMemo } from 'react'
import { imoveis } from '@/data/imoveis'
import { simular, planos, tabelaCorbetta, construtoras } from '@/data/financiamento'
import type { CorrecaoB, OpcoesParcela } from '@/data/financiamento'

// ─── helpers ────────────────────────────────────────────────────────────────
const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512',
  bronze: '#D24E22', muted: '#6B655B', line: 'rgba(26,24,21,0.08)',
  green: '#25D366', amber: '#B45309', amberBg: '#FEF3C7',
}

function fmtBRL(v: number) {
  return 'R$\u00a0' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function maskBRL(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  const num = parseInt(digits, 10) / 100
  return 'R$\u00a0' + num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Simulador Bancário (preservado) ────────────────────────────────────────
interface BankForm {
  valor_imovel: number; entrada: number; fgts: number
  parcelas_qtd: number; reforcos_qtd: number; reforcos_valor: number
  chaves_pct: number; prazo_obra_meses: number; indice: string
  taxa_juros_am: number; cenario_repasse: boolean
}
const TAXAS: Record<string, number> = { incc: 0.5, igpm: 0.4, ipca: 0.35, sem: 0 }
function cor(v: number, m: number, t: number) { return t > 0 ? v * Math.pow(1 + t / 100, m) : v }
const defBank: BankForm = {
  valor_imovel: 300000, entrada: 60000, fgts: 0, parcelas_qtd: 36,
  reforcos_qtd: 3, reforcos_valor: 15000, chaves_pct: 20,
  prazo_obra_meses: 36, indice: 'incc', taxa_juros_am: 0, cenario_repasse: false,
}

// ─── Imóveis com plano ───────────────────────────────────────────────────────
const imoveisAtivos = imoveis
  .filter(i => i.ativo && planos[i.slug])
  .sort((a, b) => a.nome.localeCompare(b.nome))

// ─── Componente principal ────────────────────────────────────────────────────
export default function SimuladorPage() {

  // ── Estado Simulador Direto ──────────────────────────────────────────────
  const [slug, setSlug] = useState(imoveisAtivos[0]?.slug ?? '')
  const [valorRaw, setValorRaw] = useState('R$\u00a0500.000,00')
  const [correcaoB, setCorrecaoB] = useState<CorrecaoB>('igpm')
  const [showOpcoes, setShowOpcoes] = useState(false)
  const [opcEntrada, setOpcEntrada] = useState('')
  const [opcMensais, setOpcMensais] = useState('')
  const [opcReforcos, setOpcReforcos] = useState('')
  const [copiado, setCopiado] = useState(false)

  // ── Estado Tabela Corbetta ───────────────────────────────────────────────
  const [corbEntradaRaw, setCorbEntradaRaw] = useState('')
  const [corbMensalRaw, setCorbMensalRaw] = useState('')
  const [corbReforcoRaw, setCorbReforcoRaw] = useState('')
  const [corbConstrutora, setCorbConstrutora] = useState<keyof typeof construtoras>('fontana')
  const [corbLinhaAtiva, setCorbLinhaAtiva] = useState<{ prazo: number; modo: string } | null>(null)

  // ── Estado Simulador Bancário ────────────────────────────────────────────
  const [showBank, setShowBank] = useState(false)
  const [bf, setBf] = useState<BankForm>(defBank)
  const [showCronograma, setShowCronograma] = useState(false)
  const sbf = <K extends keyof BankForm>(k: K, v: BankForm[K]) => setBf(p => ({ ...p, [k]: v }))

  // ── Cálculo direto ───────────────────────────────────────────────────────
  const valorImovel = useMemo(() => {
    const digits = valorRaw.replace(/\D/g, '')
    if (!digits) return 0
    return parseInt(digits, 10) / 100
  }, [valorRaw])

  const opcoes = useMemo<OpcoesParcela>(() => {
    const o: OpcoesParcela = {}
    if (opcEntrada) o.entradaPct = parseFloat(opcEntrada) / 100
    if (opcMensais) o.mensais = parseInt(opcMensais, 10)
    if (opcReforcos) o.reforcos = parseInt(opcReforcos, 10)
    return o
  }, [opcEntrada, opcMensais, opcReforcos])

  const sim = useMemo(() => {
    if (!slug || valorImovel <= 0) return null
    return simular(slug, valorImovel, opcoes, correcaoB)
  }, [slug, valorImovel, opcoes, correcaoB])

  const imovelSelecionado = useMemo(
    () => imoveisAtivos.find(i => i.slug === slug) ?? null,
    [slug]
  )

  // ── Cálculo Corbetta ─────────────────────────────────────────────────────
  const corbEntrada = useMemo(() => {
    const digits = corbEntradaRaw.replace(/\D/g, '')
    if (!digits) return 0
    return parseInt(digits, 10) / 100
  }, [corbEntradaRaw])

  const corbMensal = useMemo(() => {
    const digits = corbMensalRaw.replace(/\D/g, '')
    if (!digits) return 0
    return parseInt(digits, 10) / 100
  }, [corbMensalRaw])

  const corbReforco = useMemo(() => {
    const digits = corbReforcoRaw.replace(/\D/g, '')
    if (!digits) return 0
    return parseInt(digits, 10) / 100
  }, [corbReforcoRaw])

  const corbSaldo = useMemo(() => {
    if (valorImovel <= 0) return 0
    return Math.max(0, valorImovel - corbEntrada)
  }, [valorImovel, corbEntrada])

  const corbTaxa = useMemo(() => construtoras[corbConstrutora].taxaMensal, [corbConstrutora])

  const corbTabela = useMemo(() => {
    if (corbSaldo <= 0) return []
    return tabelaCorbetta(corbSaldo, corbTaxa, corbMensal, corbReforco)
  }, [corbSaldo, corbTaxa, corbMensal, corbReforco])

  // ── Cálculo bancário ─────────────────────────────────────────────────────
  const bCalc = useMemo(() => {
    const taxa = bf.taxa_juros_am > 0 ? bf.taxa_juros_am : TAXAS[bf.indice]
    const chaves = bf.valor_imovel * (bf.chaves_pct / 100)
    const tot_ref = bf.reforcos_qtd * bf.reforcos_valor
    const parc_total = Math.max(0, bf.valor_imovel - bf.entrada - tot_ref - chaves)
    const parcela = bf.parcelas_qtd > 0 ? parc_total / bf.parcelas_qtd : 0
    const nominal = bf.entrada + tot_ref + parc_total + chaves
    const fator = bf.parcelas_qtd > 0 ? Math.pow(1 + taxa / 100, bf.parcelas_qtd / 2) : 1
    const corrTotal = bf.entrada + bf.reforcos_qtd * cor(bf.reforcos_valor, 12, taxa) + parc_total * fator + cor(chaves, bf.prazo_obra_meses, taxa)
    return { chaves, tot_ref, parc_total, parcela, nominal, corr: corrTotal, taxa }
  }, [bf])

  // ── Aviso de prazo reduzido ──────────────────────────────────────────────
  const avisoPrazo = useMemo(() => {
    if (!sim) return null
    return sim.avisos.find(a => a.startsWith('Prazo reduzido') || a.startsWith('Reforços anuais reduzidos')) ?? null
  }, [sim])

  const avisosRodape = useMemo(() => {
    if (!sim) return []
    return sim.avisos.filter(a => !a.startsWith('Prazo reduzido') && !a.startsWith('Reforços anuais reduzidos'))
  }, [sim])

  // ── Copiar proposta ──────────────────────────────────────────────────────
  async function copiarProposta(condicaoCorb?: { prazo: number; modo: string; mensal: number; reforco: number }) {
    if (!imovelSelecionado) return
    const nome = imovelSelecionado.nome
    const linhas: string[] = ['📋 *Simulação — ' + nome + '*', 'Valor do imóvel: ' + fmtBRL(valorImovel), '']

    if (condicaoCorb) {
      // Proposta da tabela Corbetta
      linhas.push('🏗️ *Condição SPC-JS (' + construtoras[corbConstrutora].nome + ')*')
      linhas.push('• Entrada / Ato: ' + fmtBRL(corbEntrada))
      linhas.push('• Saldo a financiar: ' + fmtBRL(corbSaldo))
      linhas.push('• Prazo: ' + condicaoCorb.prazo + ' meses')
      if (condicaoCorb.mensal > 0) linhas.push('• Parcela mensal: ' + fmtBRL(condicaoCorb.mensal))
      if (condicaoCorb.reforco > 0) linhas.push('• Reforço anual: ' + fmtBRL(condicaoCorb.reforco))
    } else if (sim) {
      const { parcelaA, parcelaB, valorAVista, descontoAVista } = sim
      linhas.push('🏗️ *Parcela A — durante a obra*')
      linhas.push('• Entrada: ' + fmtBRL(parcelaA.entrada) + ' (' + Math.round((parcelaA.entrada / valorImovel) * 100) + '%)')
      if (parcelaA.qtdMensais > 0) linhas.push('• ' + parcelaA.qtdMensais + 'x mensais de ' + fmtBRL(parcelaA.valorMensal))
      if (parcelaA.qtdReforcos > 0) linhas.push('• ' + parcelaA.qtdReforcos + ' reforço(s) anual(is) de ' + fmtBRL(parcelaA.valorReforco))
      if (parcelaB) {
        linhas.push('')
        linhas.push('🏠 *Parcela B — pós-chaves (' + parcelaB.correcaoLabel + ')*')
        linhas.push('• Saldo: ' + fmtBRL(parcelaB.saldoDevedor))
        linhas.push('• SPC-JS: ' + parcelaB.meses + 'x de ' + fmtBRL(parcelaB.spcMensal ?? parcelaB.parcelaMensal))
        linhas.push('• Price: ' + parcelaB.meses + 'x de ' + fmtBRL(parcelaB.parcelaMensal))
        linhas.push('• SAC: 1ª ' + fmtBRL(parcelaB.parcelaSAC1) + ' → última ' + fmtBRL(parcelaB.parcelaSACn))
      }
      linhas.push('')
      linhas.push('💰 *À vista*')
      linhas.push('• ' + fmtBRL(valorAVista) + ' (economia de ' + fmtBRL(descontoAVista) + ')')
    }

    linhas.push('')
    linhas.push('_Valores estimados, sujeitos à tabela vigente. Corrigidos pelo CUB/Sinduscon-SC._')
    await navigator.clipboard.writeText(linhas.join('\n'))
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  // ── Estilos compartilhados ───────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 16, padding: 24,
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)', marginBottom: 20,
  }
  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1.5px solid ' + D.line, fontSize: 14, background: '#fff',
    color: D.ink, outline: 'none', boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700, color: D.muted,
    marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em',
  }
  const sectionTitle: React.CSSProperties = {
    fontSize: 13, fontWeight: 700, color: D.bronze,
    textTransform: 'uppercase', letterSpacing: '0.07em',
    margin: '0 0 16px', paddingBottom: 10, borderBottom: '2px solid #FFF3EC',
  }

  return (
    <div style={{ minHeight: '100vh', background: D.bg, fontFamily: 'system-ui, sans-serif', padding: '28px 20px 64px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* ── Título ──────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: D.ink, margin: '0 0 4px' }}>
            Simulador de Financiamento Direto
          </h1>
          <p style={{ fontSize: 13, color: D.muted, margin: 0 }}>
            Parcelas com a construtora — sem banco, sem burocracia.
          </p>
        </div>

        {/* ── Card de Controles ────────────────────────────────────────── */}
        <div style={card}>
          <p style={sectionTitle}>Configurar simulação</p>

          {/* Empreendimento */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Empreendimento</label>
            <select value={slug} onChange={e => setSlug(e.target.value)} style={inp}>
              {imoveisAtivos.map(i => (
                <option key={i.slug} value={i.slug}>{i.nome} — {i.cidade}/{i.uf}</option>
              ))}
            </select>
          </div>

          {/* Valor do imóvel */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Valor do imóvel</label>
            <input style={inp} type="text" inputMode="numeric"
              value={valorRaw} onChange={e => setValorRaw(maskBRL(e.target.value))}
              placeholder="R$ 0,00" />
          </div>

          {/* Correção Parcela B */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Correção Parcela B (pós-chaves)</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['igpm', 'cub'] as CorrecaoB[]).map(op => (
                <button key={op} onClick={() => setCorrecaoB(op)} style={{
                  flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', border: '2px solid',
                  borderColor: correcaoB === op ? D.bronze : D.line,
                  background: correcaoB === op ? D.bronze : '#fff',
                  color: correcaoB === op ? '#fff' : D.muted,
                  transition: 'all .15s',
                }}>
                  {op === 'igpm' ? 'IGPM + 0,75% a.m.' : 'CUB/SC'}
                </button>
              ))}
            </div>
          </div>

          {/* Personalizar condição — colapsável */}
          <button onClick={() => setShowOpcoes(v => !v)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: D.bronze, fontSize: 13, fontWeight: 700, padding: 0,
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12,
          }}>
            {showOpcoes ? '▲' : '▼'} Personalizar condição (opcional)
          </button>

          {showOpcoes && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, padding: '16px', background: D.bg, borderRadius: 12, marginBottom: 8 }}>
              <div>
                <label style={lbl}>Entrada %</label>
                <input style={inp} type="number" min={0} max={100} step={1}
                  value={opcEntrada} onChange={e => setOpcEntrada(e.target.value)}
                  placeholder={planos[slug] ? Math.round(planos[slug].entradaPct * 100) + ' (padrão)' : ''} />
              </div>
              <div>
                <label style={lbl}>Qtd. mensais</label>
                <input style={inp} type="number" min={0} max={240} step={1}
                  value={opcMensais} onChange={e => setOpcMensais(e.target.value)}
                  placeholder={planos[slug] ? planos[slug].mensais + ' (padrão)' : ''} />
              </div>
              <div>
                <label style={lbl}>Qtd. reforços</label>
                <input style={inp} type="number" min={0} max={12} step={1}
                  value={opcReforcos} onChange={e => setOpcReforcos(e.target.value)}
                  placeholder={planos[slug] ? planos[slug].reforcos + ' (padrão)' : ''} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <button onClick={() => { setOpcEntrada(''); setOpcMensais(''); setOpcReforcos('') }}
                  style={{ fontSize: 12, color: D.muted, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Limpar — usar plano padrão
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sem plano cadastrado ─────────────────────────────────────── */}
        {slug && !planos[slug] && (
          <div style={{ ...card, borderLeft: '4px solid #f59e0b', background: '#FFFBEB' }}>
            <p style={{ margin: 0, fontSize: 14, color: '#92400e' }}>
              ⚠️ Plano de financiamento não cadastrado para este empreendimento.
            </p>
          </div>
        )}

        {/* ── Aviso prazo reduzido ─────────────────────────────────────── */}
        {avisoPrazo && (
          <div style={{ background: D.amberBg, border: '1px solid #FCD34D', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span style={{ fontSize: 13, color: D.amber, fontWeight: 600 }}>{avisoPrazo}</span>
          </div>
        )}

        {sim && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

            {/* ── Card 1 — PARCELA A ────────────────────────────────────── */}
            <div style={{ ...card, marginBottom: 0, borderTop: '3px solid ' + D.bronze }}>
              <p style={{ ...sectionTitle, marginBottom: 14 }}>🏗️ Parcela A — até as chaves</p>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: D.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Entrada</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: D.ink }}>{fmtBRL(sim.parcelaA.entrada)}</div>
                <div style={{ fontSize: 12, color: D.muted }}>{Math.round((sim.parcelaA.entrada / valorImovel) * 100)}% do valor total</div>
              </div>
              {sim.parcelaA.qtdMensais > 0 && (
                <div style={{ background: D.bg, borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: D.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Parcelas mensais</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: D.bronze }}>
                    {fmtBRL(sim.parcelaA.valorMensal)}
                    <span style={{ fontSize: 13, fontWeight: 400, color: D.muted }}> / mês</span>
                  </div>
                  <div style={{ fontSize: 12, color: D.muted, marginTop: 2 }}>{sim.parcelaA.qtdMensais} parcelas mensais</div>
                </div>
              )}
              {sim.parcelaA.qtdReforcos > 0 && (
                <div style={{ background: D.bg, borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 11, color: D.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Reforços anuais</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#8b5cf6' }}>{fmtBRL(sim.parcelaA.valorReforco)}</div>
                      <div style={{ fontSize: 12, color: D.muted, marginTop: 2 }}>{sim.parcelaA.qtdReforcos} reforço(s) ao ano</div>
                    </div>
                    <span style={{ fontSize: 11, background: '#ede9fe', color: '#6d28d9', borderRadius: 999, padding: '3px 8px', fontWeight: 700, whiteSpace: 'nowrap', marginTop: 2 }}>
                      reforço = 5× a mensal
                    </span>
                  </div>
                </div>
              )}
              {sim.parcelaA.qtdMensais === 0 && sim.parcelaA.qtdReforcos === 0 && (
                <div style={{ fontSize: 13, color: D.muted, padding: '8px 0' }}>Imóvel pronto — sem parcelas durante a obra.</div>
              )}
            </div>

            {/* ── Card 3 — À VISTA ─────────────────────────────────────── */}
            <div style={{ ...card, marginBottom: 0, borderTop: '3px solid #22c55e', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <p style={{ ...sectionTitle, marginBottom: 14, color: '#16a34a' }}>💰 À vista</p>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: D.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Valor com desconto</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#15803d' }}>{fmtBRL(sim.valorAVista)}</div>
              </div>
              <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Economia</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#15803d' }}>{fmtBRL(sim.descontoAVista)}</div>
                <div style={{ fontSize: 12, color: '#16a34a', marginTop: 2 }}>{Math.round((sim.descontoAVista / valorImovel) * 100)}% de desconto</div>
              </div>
              <button onClick={() => copiarProposta()} style={{
                marginTop: 16, width: '100%', padding: '12px', borderRadius: 10,
                border: 'none', background: copiado ? '#16a34a' : D.bronze,
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                transition: 'background .2s',
              }}>
                {copiado ? '✅ Copiado!' : '📋 Copiar proposta'}
              </button>
            </div>
          </div>
        )}

        {/* ── Card 2 — PARCELA B ───────────────────────────────────────── */}
        {sim?.parcelaB && (
          <div style={{ ...card, borderTop: '3px solid #3b82f6' }}>
            <p style={{ ...sectionTitle, color: '#1d4ed8' }}>🏠 Parcela B — pós-chaves</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: D.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Saldo devedor</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: D.ink }}>{fmtBRL(sim.parcelaB.saldoDevedor)}</div>
                <div style={{ fontSize: 12, color: D.muted, marginTop: 2 }}>{sim.parcelaB.meses} meses</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: D.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Correção</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1d4ed8' }}>{sim.parcelaB.correcaoLabel}</div>
                <div style={{ fontSize: 11, color: D.muted, marginTop: 2 }}>taxa mensal de referência</div>
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: D.bg }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sistema</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>1ª parcela</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Última parcela</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prazo</th>
                </tr>
              </thead>
              <tbody>
                {sim.parcelaB.spcMensal != null && (
                  <tr style={{ borderTop: '1px solid ' + D.line, background: '#FFF3EC' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: D.bronze }}>SPC-JS (juros simples) ★</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: D.bronze }}>{fmtBRL(sim.parcelaB.spcMensal)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: D.bronze }}>{fmtBRL(sim.parcelaB.spcMensal)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: D.muted }}>{sim.parcelaB.meses} meses</td>
                  </tr>
                )}
                <tr style={{ borderTop: '1px solid ' + D.line }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: D.ink }}>Price (juros compostos)</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#1d4ed8' }}>{fmtBRL(sim.parcelaB.parcelaMensal)}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: D.muted }}>{fmtBRL(sim.parcelaB.parcelaMensal)}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: D.muted }}>{sim.parcelaB.meses} meses</td>
                </tr>
                <tr style={{ borderTop: '1px solid ' + D.line, background: D.bg }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: D.ink }}>SAC (decrescente)</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#1d4ed8' }}>{fmtBRL(sim.parcelaB.parcelaSAC1)}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: D.muted }}>{fmtBRL(sim.parcelaB.parcelaSACn)}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: D.muted }}>{sim.parcelaB.meses} meses</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ── Rodapé de avisos ─────────────────────────────────────────── */}
        {avisosRodape.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            {avisosRodape.map((a, i) => (
              <p key={i} style={{ margin: '0 0 4px', fontSize: 12, color: D.muted, lineHeight: 1.5 }}>* {a}</p>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TABELA DE PRAZOS — ESTILO CORBETTA (SPC-JS)
        ═══════════════════════════════════════════════════════════════ */}
        <div style={{ ...card, borderTop: '3px solid ' + D.bronze }}>
          <p style={{ ...sectionTitle }}>📊 Tabela de Prazos — SPC-JS (estilo Corbetta)</p>

          {/* Controles Corbetta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={lbl}>Entrada / Ato (R$)</label>
              <input style={inp} type="text" inputMode="numeric"
                value={corbEntradaRaw} onChange={e => setCorbEntradaRaw(maskBRL(e.target.value))}
                placeholder="R$ 0,00" />
            </div>
            <div>
              <label style={lbl}>Mensal desejada (R$)</label>
              <input style={inp} type="text" inputMode="numeric"
                value={corbMensalRaw} onChange={e => setCorbMensalRaw(maskBRL(e.target.value))}
                placeholder="Opcional" />
            </div>
            <div>
              <label style={lbl}>Reforço anual desejado (R$)</label>
              <input style={inp} type="text" inputMode="numeric"
                value={corbReforcoRaw} onChange={e => setCorbReforcoRaw(maskBRL(e.target.value))}
                placeholder="Opcional" />
            </div>
            <div>
              <label style={lbl}>Construtora</label>
              <select style={inp} value={corbConstrutora} onChange={e => setCorbConstrutora(e.target.value as keyof typeof construtoras)}>
                {(Object.keys(construtoras) as Array<keyof typeof construtoras>).map(k => (
                  <option key={k} value={k}>{construtoras[k].nome} — {(construtoras[k].taxaMensal * 100).toFixed(4)}% a.m.</option>
                ))}
              </select>
            </div>
          </div>

          {corbSaldo > 0 && (
            <div style={{ fontSize: 13, color: D.muted, marginBottom: 12 }}>
              Saldo a financiar: <strong style={{ color: D.ink }}>{fmtBRL(corbSaldo)}</strong>
              {' '}| Taxa: <strong style={{ color: D.ink }}>{(corbTaxa * 100).toFixed(4)}% a.m.</strong>
            </div>
          )}

          {/* Tabela */}
          {corbTabela.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
                <thead>
                  <tr style={{ background: D.bronze, color: '#fff' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>Prazo</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>Sem Reforço</th>
                    {corbMensal > 0 && <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>Mensal Pré<br/><span style={{ fontSize: 10, fontWeight: 400, opacity: 0.85 }}>reforço necessário</span></th>}
                    {corbReforco > 0 && <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>Reforço Pré<br/><span style={{ fontSize: 10, fontWeight: 400, opacity: 0.85 }}>mensal necessária</span></th>}
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>Máximo<br/><span style={{ fontSize: 10, fontWeight: 400, opacity: 0.85 }}>mensal + reforço 5×</span></th>
                  </tr>
                </thead>
                <tbody>
                  {corbTabela.map((row, idx) => {
                    const isActive = corbLinhaAtiva?.prazo === row.prazoMeses
                    const zebra = idx % 2 === 0 ? '#fff' : D.bg
                    return (
                      <tr key={row.prazoMeses} style={{ background: isActive ? '#FFF3EC' : zebra, cursor: 'pointer', transition: 'background .1s' }}
                        onClick={() => setCorbLinhaAtiva(isActive ? null : { prazo: row.prazoMeses, modo: 'sem_reforco' })}>
                        <td style={{ padding: '9px 12px', fontWeight: 700, color: D.ink, whiteSpace: 'nowrap', borderBottom: '1px solid ' + D.line }}>
                          {row.prazoMeses} meses
                          {isActive && <span style={{ marginLeft: 6, fontSize: 10, background: D.bronze, color: '#fff', borderRadius: 4, padding: '1px 5px' }}>✓</span>}
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', borderBottom: '1px solid ' + D.line }}>
                          <div style={{ fontWeight: 700, color: D.ink }}>{fmtBRL(row.semReforco.mensal)}/mês</div>
                          <div style={{ fontSize: 11, color: D.muted }}>Total: {fmtBRL(row.semReforco.totalPago)}</div>
                        </td>
                        {corbMensal > 0 && (
                          <td style={{ padding: '9px 12px', textAlign: 'right', borderBottom: '1px solid ' + D.line }}>
                            {row.mensalFixa ? (
                              row.mensalFixa.reforcoAnual < 0 ? (
                                <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>mensal já cobre</div>
                              ) : (
                                <>
                                  <div style={{ fontWeight: 700, color: D.ink }}>{fmtBRL(row.mensalFixa.mensal)}/mês</div>
                                  <div style={{ fontSize: 11, color: D.bronze }}>+ {fmtBRL(row.mensalFixa.reforcoAnual)}/ano</div>
                                </>
                              )
                            ) : '—'}
                          </td>
                        )}
                        {corbReforco > 0 && (
                          <td style={{ padding: '9px 12px', textAlign: 'right', borderBottom: '1px solid ' + D.line }}>
                            {row.reforcoFixo ? (
                              <>
                                <div style={{ fontWeight: 700, color: D.ink }}>{fmtBRL(row.reforcoFixo.mensal)}/mês</div>
                                <div style={{ fontSize: 11, color: '#8b5cf6' }}>+ {fmtBRL(row.reforcoFixo.reforcoAnual)}/ano</div>
                              </>
                            ) : '—'}
                          </td>
                        )}
                        <td style={{ padding: '9px 12px', textAlign: 'right', borderBottom: '1px solid ' + D.line }}>
                          <div style={{ fontWeight: 700, color: D.ink }}>{fmtBRL(row.maximo.mensal)}/mês</div>
                          {row.maximo.qtdReforcos > 0 && (
                            <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                              <span style={{ color: '#8b5cf6' }}>+ {fmtBRL(row.maximo.reforcoAnual)}/ano</span>
                              <span style={{ fontSize: 10, background: '#ede9fe', color: '#6d28d9', borderRadius: 4, padding: '1px 4px', fontWeight: 700 }}>5×</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: D.muted, fontSize: 14 }}>
              Informe o valor do imóvel acima para gerar a tabela de prazos.
            </div>
          )}

          {/* Linha selecionada — copiar proposta */}
          {corbLinhaAtiva && corbTabela.length > 0 && (() => {
            const row = corbTabela.find(r => r.prazoMeses === corbLinhaAtiva.prazo)
            if (!row) return null
            const sr = row.semReforco
            return (
              <div style={{ marginTop: 16, padding: '14px 16px', background: '#FFF3EC', borderRadius: 12, border: '1px solid #F9C4B1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, color: D.ink, fontSize: 14 }}>
                    Condição selecionada: {corbLinhaAtiva.prazo} meses — {fmtBRL(sr.mensal)}/mês
                  </div>
                  <div style={{ fontSize: 12, color: D.muted, marginTop: 2 }}>
                    Total pago: {fmtBRL(sr.totalPago)} | Juros embutidos: {fmtBRL(sr.jurosEmbutidos)}
                  </div>
                </div>
                <button onClick={() => copiarProposta({ prazo: corbLinhaAtiva.prazo, modo: 'sem_reforco', mensal: sr.mensal, reforco: sr.reforcoAnual })}
                  style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: D.bronze, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                  {copiado ? '✅ Copiado!' : '📋 Copiar proposta'}
                </button>
              </div>
            )
          })()}

          {/* Rodapé informativo */}
          <p style={{ margin: '16px 0 0', fontSize: 11, color: D.muted, lineHeight: 1.6 }}>
            Cálculo pelo sistema de parcelas constantes a juros simples (SPC-JS), idêntico às planilhas das construtoras.
            VP = valor / (1 + i·t), somatório discreto exato. Parcelas corrigidas pelo índice contratual
            (CUB/SC, IGPM ou INCC conforme empreendimento). Clique em uma linha para selecionar e copiar a proposta.
          </p>
        </div>

        {/* ── Seção: Financiamento Bancário (preservado) ───────────────── */}
        <div style={{ ...card, borderTop: '3px solid #6b7280' }}>
          <button onClick={() => setShowBank(v => !v)} style={{
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0,
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>🏦 Financiamento Bancário (simulação auxiliar)</span>
            <span style={{ fontSize: 18, color: D.muted }}>{showBank ? '▲' : '▼'}</span>
          </button>

          {showBank && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 12, color: D.muted, marginBottom: 16, marginTop: 0 }}>
                Simulação paramétrica avulsa — parcelas + reforços + chaves com correção por índice. Não integrado ao plano Fontana.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>Valor do Imóvel (R$)</label><input style={inp} type="number" value={bf.valor_imovel} onChange={e => sbf('valor_imovel', +e.target.value)} step={10000} /></div>
                <div><label style={lbl}>Entrada (R$)</label><input style={inp} type="number" value={bf.entrada} onChange={e => sbf('entrada', +e.target.value)} /></div>
                <div><label style={lbl}>FGTS (R$)</label><input style={inp} type="number" value={bf.fgts} onChange={e => sbf('fgts', +e.target.value)} /></div>
                <div><label style={lbl}>Parcela Chaves (%)</label><input style={inp} type="number" value={bf.chaves_pct} onChange={e => sbf('chaves_pct', +e.target.value)} min={0} max={50} step={5} /></div>
                <div><label style={lbl}>Qtd. Parcelas</label><input style={inp} type="number" value={bf.parcelas_qtd} onChange={e => sbf('parcelas_qtd', +e.target.value)} min={1} max={240} /></div>
                <div><label style={lbl}>Parcela Mensal</label><input style={{ ...inp, background: D.bg, fontWeight: 700 }} value={bCalc.parcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} readOnly /></div>
                <div><label style={lbl}>Reforços (qtd)</label><input style={inp} type="number" value={bf.reforcos_qtd} onChange={e => sbf('reforcos_qtd', +e.target.value)} min={0} max={10} /></div>
                <div><label style={lbl}>Valor/Reforço (R$)</label><input style={inp} type="number" value={bf.reforcos_valor} onChange={e => sbf('reforcos_valor', +e.target.value)} step={5000} /></div>
                <div><label style={lbl}>Índice</label><select style={inp} value={bf.indice} onChange={e => sbf('indice', e.target.value)}><option value="incc">INCC</option><option value="igpm">IGP-M</option><option value="ipca">IPCA</option><option value="sem">Sem correção</option></select></div>
                <div><label style={lbl}>Juros a.m. (%)</label><input style={inp} type="number" value={bf.taxa_juros_am} onChange={e => sbf('taxa_juros_am', +e.target.value)} min={0} max={5} step={0.1} /></div>
                <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Prazo Obra (meses)</label><input style={inp} type="number" value={bf.prazo_obra_meses} onChange={e => sbf('prazo_obra_meses', +e.target.value)} min={1} max={120} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, padding: '16px', background: '#1a1a2e', borderRadius: 12, color: '#fff' }}>
                {[
                  { l: 'Entrada', v: bf.entrada, c: '#D24E22' },
                  { l: 'Total Parcelas', v: bCalc.parc_total, c: '#3b82f6' },
                  { l: 'Total Reforços', v: bCalc.tot_ref, c: '#8b5cf6' },
                  { l: 'Parcela Chaves', v: bCalc.chaves, c: '#f59e0b' },
                  { l: 'Total Nominal', v: bCalc.nominal, c: '#fff' },
                  { l: 'Estimativa Corrigida', v: bCalc.corr, c: '#f59e0b' },
                ].map(it => (
                  <div key={it.l}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>{it.l}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: it.c }}>{it.v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowCronograma(v => !v)} style={{ marginTop: 14, padding: '9px 16px', borderRadius: 8, border: '1px solid ' + D.line, background: '#fff', color: D.ink, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                {showCronograma ? '▲ Ocultar' : '▼ Ver'} Cronograma
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
