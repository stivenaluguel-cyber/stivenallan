'use client'
import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Crosshair } from 'lucide-react'
import { ConversaPanel } from '@/components/dashboard/ConversaPanel'
import { ESTAGIOS_FUNIL as ESTAGIOS } from '@/lib/dashboard/estagios'
import { useKanbanTouchDrag } from '@/lib/dashboard/use-kanban-touch-drag'
import { isEligibleForFocusQueue } from '@/lib/dashboard/focus-queue'
import { temWhatsappReal } from '@/lib/leads/normalize'
import { PainelScore, type DetalheScore } from '@/components/dashboard/PainelScore'
import { AnexosLead } from '@/components/dashboard/AnexosLead'
import { EnvolvidosLead } from '@/components/dashboard/EnvolvidosLead'
import { CORES_SLA, statusSla } from '@/lib/leads/sla'
import type { TimelineItem, TimelineKind } from '@/lib/dashboard/lead-timeline'
import {
  faixaDeEntrada, planoDoJson, REFORCO_MAXIMO_EM_PARCELAS, simular,
  type PlanoPagamento,
} from '@/lib/unidades/simular'
import { montarMensagemSimulacao } from '@/lib/unidades/mensagem-espelho'
import { precoDaUnidade } from '@/lib/unidades/espelho'

const CORES_TIMELINE: Partial<Record<TimelineKind | 'evento', string>> = {
  anotacao: '#D24E22',
  mudanca_etapa: '#7C3AED',
  proposta: '#0891B2',
  mensagem: '#16A34A',
  compromisso: '#2563EB',
  acao_foco: '#64748B',
  contato: '#16A34A',
  perdido: '#DC2626',
  evento: '#94A3B8',
}

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', sidebar: '#131211', ink: '#161512',
  bronze: '#D24E22', orange: '#FF6A3D', muted: '#6B655B',
  line: 'rgba(26,24,21,0.08)', lineDark: 'rgba(245,241,234,0.14)',
  green: '#22c55e', red: '#ef4444', blue: '#3b82f6',
  onDark: '#F3F2EE', onDarkMuted: 'rgba(245,241,234,0.65)',
}
const fmt = (n: number) => 'R$\u00a0' + Math.round(n).toLocaleString('pt-BR')

/**
 * CUB com os centavos.
 *
 * `fmt` arredonda para o real inteiro, o que serve para VGV e pipeline mas
 * mente no CUB: R$ 3.121,62/m² virava "R$ 3.122". Não é detalhe estético — o
 * CUB multiplica a quantidade de CUBs de cada unidade (o Pineto vai de 210 a
 * 264), então 38 centavos de erro viram até R$ 100 de diferença no valor do
 * apartamento. É um índice publicado, tem que aparecer como o Sinduscon publica.
 */
const fmtCub = (n: number) =>
  'R$\u00a0' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })


type Lead = {
  id: string; nome?: string; whatsapp: string; estagio_funil: string
  lead_score?: number; requer_atencao?: boolean; origem?: string
  orcamento_max?: number | null; perfil?: string; email?: string | null
  permuta_descricao?: string | null; permuta_valor?: number | null
  temperatura?: number; anotacoes?: string | null; created_at?: string
  empreendimentos?: { nome?: string; cidade?: string } | null
  property_name?: string | null; visitas?: number; downloads?: number
  // Campos comerciais que já existiam em `leads` e nunca apareciam na tela.
  // No financiamento direto a entrada é o que decide a venda.
  entrada_disponivel?: string | null; faixa_investimento?: string | null
  prazo_compra?: string | null; cidade_interesse?: string | null
  primeiro_atendimento_em?: string | null
  lead_score_detalhe?: DetalheScore | null
}
type Unidade = { id: string; unidade: string; bloco?: string; metragem: number; dormitorios?: number; disponivel: boolean; valor_tabela?: number; valor_promocional?: number; condicoes_negociacao?: string; plano_pagamento?: unknown }
type Emp = { id: string; nome: string; status_venda: string; status_obra?: string }
type Cub = { id: string; mes_referencia: string; valor_m2: number; variacao_mensal?: number; fonte?: string }
type Evento = { tipo: string; slug?: string; descricao?: string; created_at: string }


const TEMPERATURAS = [
  { v: 3, label: 'Quente', cor: '#ef4444', emoji: '🔥' },
  { v: 2, label: 'Morno', cor: '#f59e0b', emoji: '🌤️' },
  { v: 1, label: 'Frio', cor: '#3b82f6', emoji: '❄️' },
]
const tempInfo = (t?: number) => TEMPERATURAS.find(x => x.v === t) ?? TEMPERATURAS[2]

function WidgetCub({ cub, onSaved }: { cub: Cub | null; onSaved: () => void }) {
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  async function atualizarCub() {
    setSaving(true); setStatus('')
    try {
      const res = await fetch('/api/cub', { cache: 'no-store' })
      if (!res.ok) throw new Error('Falha ao consultar SINDUSCON (' + res.status + ')')
      const data = await res.json()
      await fetch('/api/admin/cub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mes_referencia: (data.competencia ?? new Date().toISOString().slice(0, 7)) + '-01',
          valor_m2: Number(data.valor_m2),
          variacao_mensal: null,
        }),
      })
      const label = data.competencia_label ?? data.usar_em_label ?? ''
      const labelCap = label.charAt(0).toUpperCase() + label.slice(1)
      setStatus(data.online ? 'Atualizado pelo SINDUSCON — ' + labelCap : 'SINDUSCON indisponível — valor de referência aplicado (' + labelCap + ')')
      onSaved()
    } catch {
      setStatus('Não foi possível atualizar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const fmtC = fmtCub

  return (
    <div style={{ background: D.sidebar, border: '1px solid ' + D.lineDark, borderRadius: 12, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: D.onDarkMuted, marginBottom: 4 }}>CUB/SC VIGENTE · SINDUSCON-SC</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, color: D.bronze }}>
            {cub ? fmtC(cub.valor_m2) + '/m²' : 'Sem CUB cadastrado'}
          </span>
          {cub?.variacao_mensal && (
            <span style={{ fontSize: 13, color: cub.variacao_mensal > 0 ? D.green : D.red, fontWeight: 600 }}>
              {cub.variacao_mensal > 0 ? '+' : ''}{cub.variacao_mensal.toFixed(2)}% mês
            </span>
          )}
        </div>
        {cub && (
          <span style={{ fontSize: 12, color: D.onDarkMuted }}>
            {new Date(cub.mes_referencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
        )}
        {status && <p style={{ margin: '6px 0 0', fontSize: 12, color: D.onDarkMuted, fontStyle: 'italic' }}>{status}</p>}
      </div>
      <button onClick={atualizarCub} disabled={saving}
        style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 2, padding: '9px 20px', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Atualizando...' : 'Atualizar CUB'}
      </button>
    </div>
  )
}

/**
 * Simulador Direto — o mesmo motor do site.
 *
 * A versão anterior era uma calculadora genérica: dividia o valor inteiro do
 * imóvel pelo prazo, tratava o balão como um slider solto de até R$ 100 mil e
 * não conhecia nem o teto contratual do reforço (5× a parcela) nem a divisão
 * 30% até as chaves / 70% financiado na entrega. Ou seja, produzia condições
 * que a construtora não assina — e diferentes das que o cliente vê na página
 * do empreendimento.
 *
 * Agora chama `simular()` de @/lib/unidades/simular, o mesmo que roda no
 * espelho público. O número que ele passa por telefone é o número que o
 * cliente viu na tela.
 */
function SimuladorFluxo({ cub, emps }: { cub: Cub | null; emps: Emp[] }) {
  const [modo, setModo] = useState<'unidade' | 'manual'>('unidade')
  const [empId, setEmpId] = useState<string>('')
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [carregando, setCarregando] = useState(false)
  const [unidadeId, setUnidadeId] = useState<string>('')
  const [entrada, setEntrada] = useState<number | null>(null)

  // Manual: para os empreendimentos que ainda não têm tabela importada.
  const [mValor, setMValor] = useState(400000)
  const [mChaves, setMChaves] = useState(30)
  const [mParcelas, setMParcelas] = useState(40)
  const [mReforcos, setMReforcos] = useState(4)
  const [mRazao, setMRazao] = useState(3.75)
  const [mEntradaPct, setMEntradaPct] = useState(8)

  useEffect(() => {
    if (!empId) { setUnidades([]); return }
    setCarregando(true)
    fetch('/api/admin/unidades?empreendimento_id=' + empId)
      .then(r => r.json())
      .then(d => setUnidades((d.data ?? []) as Unidade[]))
      .finally(() => setCarregando(false))
  }, [empId])

  useEffect(() => { setUnidadeId(''); setEntrada(null) }, [empId])
  useEffect(() => { setEntrada(null) }, [unidadeId])

  const comTabela = unidades.filter(u => planoDoJson(u.plano_pagamento) !== null)
  const unidade = comTabela.find(u => u.id === unidadeId) ?? null

  // Uma origem de verdade para os dois modos: monta o plano e simula.
  let plano: PlanoPagamento | null = null
  let valorTotal = 0
  if (modo === 'unidade' && unidade) {
    plano = planoDoJson(unidade.plano_pagamento)
    valorTotal = precoDaUnidade({
      valor_tabela: unidade.valor_tabela ?? null,
      valor_promocional: unidade.valor_promocional ?? null,
    }).valor ?? 0
  } else if (modo === 'manual') {
    valorTotal = mValor
    const ateChaves = mValor * (mChaves / 100)
    const entradaBase = mValor * (mEntradaPct / 100)
    const divisor = mParcelas + mReforcos * mRazao
    const parcela = divisor > 0 ? Math.max(0, ateChaves - entradaBase) / divisor : 0
    plano = {
      entrada: entradaBase,
      parcelas_qtd: mParcelas,
      parcela_valor: parcela,
      reforcos_qtd: mReforcos,
      reforco_valor: parcela * mRazao,
      saldo_financiamento: mValor - ateChaves,
    }
  }

  const faixa = plano ? faixaDeEntrada(plano) : null
  const sim = plano && valorTotal > 0 ? simular(valorTotal, plano, entrada) : null

  const rotuloUnidade = unidade ? [unidade.bloco, unidade.unidade].filter(Boolean).join(' ') : ''
  const empNome = emps.find(e => e.id === empId)?.nome ?? ''

  const textoWhats = sim
    ? montarMensagemSimulacao({
        nomeCliente: '',
        empreendimento: modo === 'unidade' ? empNome : 'empreendimento',
        unidade: rotuloUnidade || '—',
        metragem: Number(unidade?.metragem ?? 0),
        dormitorios: unidade?.dormitorios ?? null,
        andar: null,
        simulacao: sim,
        demonstrouInteresse: false,
      })
    : ''

  const Linha = ({ l, v, forte }: { l: string; v: string; forte?: boolean }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
      <span style={{ color: D.onDarkMuted }}>{l}</span>
      <strong style={{ color: forte ? D.orange : D.onDark, whiteSpace: 'nowrap' }}>{v}</strong>
    </div>
  )

  return (
    <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 3 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid ' + D.line, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontWeight: 700, fontSize: 14, color: D.ink }}>
          Simulador Direto
          <span style={{ marginLeft: 8, fontWeight: 500, fontSize: 12, color: D.muted }}>mesma conta do site</span>
        </span>
        {cub && <span style={{ fontSize: 11, color: D.muted }}>CUB: {fmtCub(cub.valor_m2)}/m²</span>}
      </div>

      <div style={{ padding: '12px 20px 0', display: 'flex', gap: 8 }}>
        {([['unidade', 'Unidade real'], ['manual', 'Manual']] as const).map(([k, label]) => (
          <button key={k} onClick={() => { setModo(k); setEntrada(null) }}
            style={{ padding: '7px 16px', borderRadius: 2, border: '1px solid ' + (modo === k ? D.bronze : D.line), background: modo === k ? D.bronze : 'transparent', color: modo === k ? '#fff' : D.ink, fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 36 }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          {modo === 'unidade' ? (
            <>
              <label style={{ display: 'grid', gap: 5, fontSize: 13, color: D.muted }}>
                Empreendimento
                <select value={empId} onChange={e => setEmpId(e.target.value)}
                  style={{ padding: '9px 10px', borderRadius: 3, border: '1px solid ' + D.line, background: '#fff', color: D.ink, fontSize: 14, minHeight: 40 }}>
                  <option value="">Selecione…</option>
                  {emps.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
              </label>

              {empId && (
                <label style={{ display: 'grid', gap: 5, fontSize: 13, color: D.muted }}>
                  Unidade
                  <select value={unidadeId} onChange={e => setUnidadeId(e.target.value)} disabled={carregando || comTabela.length === 0}
                    style={{ padding: '9px 10px', borderRadius: 3, border: '1px solid ' + D.line, background: '#fff', color: D.ink, fontSize: 14, minHeight: 40 }}>
                    <option value="">{carregando ? 'Carregando…' : comTabela.length === 0 ? 'Sem tabela importada' : 'Selecione…'}</option>
                    {comTabela.map(u => (
                      <option key={u.id} value={u.id}>
                        {[u.bloco, u.unidade].filter(Boolean).join(' ')} · {u.metragem}m²{u.dormitorios ? ` · ${u.dormitorios} quartos` : ''}{u.disponivel ? '' : ' · indisponível'}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {empId && !carregando && comTabela.length === 0 && (
                <p style={{ margin: 0, fontSize: 13, color: D.muted, lineHeight: 1.5, background: '#fff', border: '1px solid ' + D.line, borderRadius: 3, padding: '12px 14px' }}>
                  Este empreendimento ainda não tem tabela de preços importada. Importe em{' '}
                  <a href="/dashboard/espelho" style={{ color: D.bronze, fontWeight: 600 }}>Espelho de vendas</a>{' '}
                  ou use o modo <strong>Manual</strong> — que segue as mesmas regras de contrato.
                </p>
              )}
            </>
          ) : (
            <>
              {[
                { label: 'Valor do imóvel', value: mValor, set: setMValor, min: 100000, max: 3000000, step: 5000, fmtv: (v: number) => fmt(v) },
                { label: 'Entrada da tabela', value: mEntradaPct, set: setMEntradaPct, min: 0, max: 30, step: 1, fmtv: (v: number) => v + '%' },
                { label: 'Até as chaves', value: mChaves, set: setMChaves, min: 10, max: 100, step: 1, fmtv: (v: number) => v + '%' },
                { label: 'Parcelas mensais', value: mParcelas, set: setMParcelas, min: 12, max: 120, step: 1, fmtv: (v: number) => v + 'x' },
                { label: 'Reforços anuais', value: mReforcos, set: setMReforcos, min: 0, max: 10, step: 1, fmtv: (v: number) => String(v) },
                { label: 'Reforço em parcelas', value: mRazao, set: setMRazao, min: 0, max: REFORCO_MAXIMO_EM_PARCELAS, step: 0.25, fmtv: (v: number) => v.toFixed(2) + '×' },
              ].map(({ label, value, set, min, max, step, fmtv }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: D.muted }}>{label}</span>
                    <strong style={{ color: D.ink }}>{fmtv(value)}</strong>
                  </div>
                  <input type="range" min={min} max={max} step={step} value={value}
                    onChange={e => { set(Number(e.target.value)); setEntrada(null) }}
                    style={{ width: '100%', accentColor: D.bronze, height: 4 }} />
                </div>
              ))}
              <p style={{ margin: 0, fontSize: 12, color: D.muted, lineHeight: 1.5 }}>
                O reforço para em {REFORCO_MAXIMO_EM_PARCELAS}× a parcela: é o teto do contrato da Fontana.
              </p>
            </>
          )}

          {sim && faixa && faixa.max > faixa.min && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: D.muted }}>Entrada do cliente</span>
                <strong style={{ color: D.ink }}>{fmt(sim.entrada)} · {sim.entradaPercentual}%</strong>
              </div>
              <input type="range" min={faixa.min} max={faixa.max} step={faixa.passo}
                value={entrada ?? sim.entrada} onChange={e => setEntrada(Number(e.target.value))}
                style={{ width: '100%', accentColor: D.bronze, height: 4 }} />
              {!sim.padraoDaTabela && (
                <button onClick={() => setEntrada(null)}
                  style={{ marginTop: 6, background: 'none', border: 'none', padding: 0, color: D.bronze, fontSize: 12, textDecoration: 'underline', cursor: 'pointer' }}>
                  voltar à entrada da tabela
                </button>
              )}
            </div>
          )}
        </div>

        <div style={{ background: D.sidebar, borderRadius: 3, padding: 20, color: D.onDark }}>
          {!sim ? (
            <p style={{ margin: 0, fontSize: 13, color: D.onDarkMuted, lineHeight: 1.6 }}>
              Escolha uma unidade para ver as condições exatas — as mesmas que o cliente vê na página do empreendimento.
            </p>
          ) : (
            <>
              <div style={{ fontSize: 11, color: D.onDarkMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{sim.parcelasQtd > 0 ? 'Parcela mensal' : 'Entrada única'}</div>
              <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800, color: D.orange, margin: '6px 0 4px', letterSpacing: '-0.025em' }}>
                {sim.parcelasQtd > 0 ? `${sim.parcelasQtd}x ${fmt(sim.parcelaValor)}` : fmt(sim.entrada)}
              </div>
              <div style={{ fontSize: 12, color: D.onDarkMuted, marginBottom: 16 }}>
                sobre {fmt(sim.valorTotal)}{rotuloUnidade ? ` · unidade ${rotuloUnidade}` : ''}
              </div>

              <div style={{ display: 'grid', gap: 9 }}>
                <Linha l="Entrada" v={`${fmt(sim.entrada)} · ${sim.entradaPercentual}%`} forte />
                {sim.reforcosQtd > 0 && (
                  <Linha l={`${sim.reforcosQtd} reforços anuais`} v={`${fmt(sim.reforcoValor)} · ${sim.reforcoEmParcelas.toFixed(2)}× a parcela`} />
                )}
                {sim.pagamentoNasChaves > 0 && (
                  <Linha l="Na entrega das chaves" v={fmt(sim.pagamentoNasChaves)} />
                )}
                <Linha l={`Até as chaves (${sim.ateAsChavesPercentual}%)`} v={fmt(sim.ateAsChaves)} />
                <Linha l="Saldo financiado na entrega" v={fmt(sim.saldoFinanciamento)} />
              </div>

              <p style={{ margin: '16px 0 0', fontSize: 11.5, color: D.onDarkMuted, lineHeight: 1.5 }}>
                Corrigido pelo CUB/SC até a entrega. Sujeito à tabela vigente e à análise da construtora.
              </p>

              <a href={'https://wa.me/?text=' + encodeURIComponent(textoWhats)} target="_blank" rel="noopener noreferrer"
                style={{ marginTop: 18, background: '#25d366', color: '#fff', borderRadius: 2, padding: '11px', textAlign: 'center', textDecoration: 'none', fontWeight: 700, fontSize: 14, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Abrir no WhatsApp com o texto pronto
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function TabelaUnidades({ emp, cub }: { emp: Emp; cub: Cub | null }) {
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todas' | 'disponiveis'>('disponiveis')

  useEffect(() => {
    fetch('/api/admin/unidades?empreendimento_id=' + emp.id)
      .then(r => r.json()).then(d => { setUnidades(d.data ?? []); setLoading(false) })
  }, [emp.id])

  const lista = filtro === 'disponiveis' ? unidades.filter(u => u.disponivel) : unidades
  const disponiveis = unidades.filter(u => u.disponivel).length

  async function toggleDisp(u: Unidade) {
    await fetch('/api/admin/unidades', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, disponivel: !u.disponivel }) })
    setUnidades(prev => prev.map(x => x.id === u.id ? { ...x, disponivel: !x.disponivel } : x))
  }

  const msg = (u: Unidade) => encodeURIComponent('Olá! Tenho interesse na Unidade ' + u.unidade + ' do ' + emp.nome + ' — ' + u.metragem + 'm², R$' + (u.valor_tabela?.toLocaleString('pt-BR') ?? '?'))
  const wppUrl = (u: Unidade) => 'https://api.whatsapp.com/send?phone=5548991642332&text=' + msg(u)

  return (
    <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 3 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid ' + D.line, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <span style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontWeight: 700, fontSize: 14, color: D.ink }}>{emp.nome}</span>
          <span style={{ marginLeft: 10, fontSize: 12, color: D.green, fontWeight: 600 }}>{disponiveis} disponíveis</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {(['todas', 'disponiveis'] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{ padding: '6px 14px', borderRadius: 2, border: '1px solid ' + (filtro === f ? D.bronze : D.line), background: filtro === f ? D.bronze : 'transparent', color: filtro === f ? '#fff' : D.ink, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {f === 'todas' ? 'Todas' : 'Disponíveis'}
            </button>
          ))}
        </div>
      </div>
      {loading ? <div style={{ padding: 32, textAlign: 'center', color: D.muted }}>Carregando...</div> : lista.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: D.muted }}>Nenhuma unidade{filtro === 'disponiveis' ? ' disponível' : ''}</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ background: D.bg }}>
              {['Unidade', 'Metragem', 'Dorms', 'Valor Tabela', 'Promoção', 'Condições', 'Status', 'Ação'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '0.06em', color: D.muted, fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid ' + D.line }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {lista.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: '1px solid ' + D.line, background: i % 2 === 0 ? D.surface : D.bg }}>
                  <td style={{ padding: '10px 16px', fontWeight: 700, color: D.ink }}>{u.bloco ? u.bloco + ' · ' : ''}{u.unidade}</td>
                  <td style={{ padding: '10px 16px', color: D.ink }}>{u.metragem}m²</td>
                  <td style={{ padding: '10px 16px', color: D.ink }}>{u.dormitorios ?? '—'}</td>
                  <td style={{ padding: '10px 16px', color: D.ink, fontWeight: 600 }}>{u.valor_tabela ? fmt(u.valor_tabela) : '—'}</td>
                  <td style={{ padding: '10px 16px', color: D.green, fontWeight: 600 }}>{u.valor_promocional ? fmt(u.valor_promocional) : '—'}</td>
                  <td style={{ padding: '10px 16px', color: D.muted, maxWidth: 200, fontSize: 12 }}>{u.condicoes_negociacao ?? '—'}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <button onClick={() => toggleDisp(u)} style={{ background: u.disponivel ? '#22c55e22' : '#ef444422', color: u.disponivel ? D.green : D.red, border: '1px solid ' + (u.disponivel ? D.green : D.red) + '44', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', minHeight: 28 }}>
                      {u.disponivel ? 'Disponível' : 'Vendida'}
                    </button>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <a href={wppUrl(u)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#25d366', color: '#fff', borderRadius: 2, padding: '6px 12px', fontSize: 12, textDecoration: 'none', fontWeight: 700, minHeight: 32, whiteSpace: 'nowrap' }}>
                      WhatsApp
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function LeadCard({ lead, onDragStart, onSelect, onMover, onToqueInicio, ignorarClique }: { lead: Lead; onDragStart: (id: string) => void; onSelect: (lead: Lead) => void; onMover: (id: string, estagio: string) => void; onToqueInicio: (id: string, e: React.PointerEvent) => void; ignorarClique: () => boolean }) {
  const t = tempInfo(lead.temperatura)
  const score = lead.lead_score ?? 0
  const diasDesde = lead.created_at ? Math.floor((Date.now() - new Date(lead.created_at).getTime()) / 86400000) : 0
  const esfriando = diasDesde > 14 && lead.estagio_funil !== 'fechado' && score < 40
  const [moverAberto, setMoverAberto] = useState(false)

  // Cronômetro do primeiro atendimento. Lead de tráfego pago que não é
  // respondido nos primeiros minutos já mandou mensagem para outros três
  // corretores. Só aparece enquanto ainda faz diferença: depois de atendido,
  // o selo some em vez de virar alarme permanente.
  const sla = statusSla(lead)
  const mostrarSla = sla.estado !== 'atendido' && sla.texto !== ''

  return (
    <div draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart(lead.id) }}
      // Segurar em cima de um botão do card (WhatsApp, Abrir, Mover etapa)
      // não pode virar arraste — o toque longo ali é só demora em apertar.
      onPointerDown={(e) => { if ((e.target as HTMLElement).closest('button,a')) return; onToqueInicio(lead.id, e) }}
      onClick={() => { if (ignorarClique()) return; onSelect(lead) }}
      style={{ background: '#fff', borderRadius: 8, padding: '10px 11px', marginBottom: 8, border: '1px solid ' + D.line, borderLeft: '4px solid ' + t.cor, cursor: 'grab', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: D.ink, lineHeight: 1.25 }}>{lead.nome || '+' + lead.whatsapp}</span>
        <span title={t.label} style={{ fontSize: 11, fontWeight: 700, color: t.cor, whiteSpace: 'nowrap' }}>{t.emoji}</span>
      </div>
      {lead.empreendimentos?.nome && <div style={{ fontSize: 11, color: D.muted, marginTop: 3 }}>{lead.empreendimentos.nome}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>
        {lead.origem && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: D.bg, color: D.muted }}>{lead.origem}</span>}
        {typeof lead.orcamento_max === 'number' && lead.orcamento_max > 0 && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: D.bg, color: D.muted }}>{fmt(lead.orcamento_max)}</span>}
        {esfriando && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: '#EFF6FF', color: '#1D4ED8', fontWeight: 700 }}>❄ esfriando</span>}
        {lead.requer_atencao && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: 'rgba(210,78,34,0.12)', color: D.bronze, fontWeight: 700 }}>★ atenção</span>}
        {/* Entrada é o campo que mais decide venda no financiamento direto:
            sem entrada não há contrato, por mais quente que o lead pareça. */}
        {lead.entrada_disponivel && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: 'rgba(34,197,94,0.14)', color: '#15803d', fontWeight: 700 }}>entrada {lead.entrada_disponivel}</span>}
        {lead.prazo_compra && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: D.bg, color: D.muted }}>{lead.prazo_compra}</span>}
      </div>

      {mostrarSla && (
        <div style={{ marginTop: 7 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: CORES_SLA[sla.estado].fundo, color: CORES_SLA[sla.estado].texto }}>
            ⏱ {sla.texto}
          </span>
        </div>
      )}
      <div style={{ marginTop: 9 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: D.muted, marginBottom: 3 }}>
          <span>Score</span><span style={{ fontWeight: 700, color: score >= 60 ? D.green : score >= 30 ? '#f59e0b' : D.muted }}>{score}pts</span>
        </div>
        <div style={{ height: 4, borderRadius: 999, background: D.line, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: Math.min(100, score) + '%', background: score >= 60 ? D.green : score >= 30 ? '#f59e0b' : D.muted, borderRadius: 999 }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 5, marginTop: 9 }}>
        {temWhatsappReal(lead.whatsapp) ? (
          <a href={'https://wa.me/55' + (lead.whatsapp || '').replace(/\D/g, '')} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
            style={{ flex: 1, background: '#25d366', color: '#fff', borderRadius: 6, padding: '5px 0', fontSize: 11, textAlign: 'center', textDecoration: 'none', fontWeight: 700, minHeight: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>WhatsApp</a>
        ) : (
          <span title="Lead veio do Instagram — ainda sem telefone" style={{ flex: 1, background: D.line, color: D.muted, borderRadius: 6, padding: '5px 0', fontSize: 11, textAlign: 'center', fontWeight: 700, minHeight: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📷 Instagram</span>
        )}
        <button onClick={(e) => { e.stopPropagation(); onSelect(lead) }} style={{ flex: 1, background: D.bg, color: D.ink, border: '1px solid ' + D.line, borderRadius: 6, padding: '5px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer', minHeight: 26 }}>Abrir</button>
      </div>

      {/* Arrastar-e-soltar é HTML5 (draggable/onDrop) e NÃO dispara em toque —
          nenhum navegador móvel implementa. Sem este botão, mover um card era
          simplesmente impossível no celular. Ele também ajuda no desktop:
          as colunas ficam num scroll horizontal, então arrastar para uma
          coluna fora da tela dependia de mira e paciência. */}
      <div style={{ marginTop: 7 }}>
        <button
          onClick={(e) => { e.stopPropagation(); setMoverAberto((v) => !v) }}
          aria-expanded={moverAberto}
          aria-label={'Mover ' + (lead.nome || lead.whatsapp) + ' para outra etapa'}
          style={{ width: '100%', background: moverAberto ? D.bronze : '#fff', color: moverAberto ? '#fff' : D.muted, border: '1px solid ' + (moverAberto ? D.bronze : D.line), borderRadius: 6, padding: '7px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer', minHeight: 44 }}
        >
          {moverAberto ? 'Cancelar' : '⇄ Mover etapa'}
        </button>

        {moverAberto && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
            {ESTAGIOS.filter((e) => e.key !== lead.estagio_funil).map((e) => (
              <button
                key={e.key}
                onClick={(ev) => { ev.stopPropagation(); onMover(lead.id, e.key); setMoverAberto(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', background: D.bg, border: '1px solid ' + D.line, borderLeft: '3px solid ' + e.cor, borderRadius: 6, padding: '9px 10px', fontSize: 11.5, fontWeight: 700, color: D.ink, cursor: 'pointer', minHeight: 44, textAlign: 'left' }}
              >
                <span style={{ width: 7, height: 7, borderRadius: 999, background: e.cor, flexShrink: 0 }} />
                {e.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Kanban({ leads, dragId, onDragStart, onDrop, onSelect, onMover }: { leads: Lead[]; dragId: string | null; onDragStart: (id: string) => void; onDrop: (estagio: string) => void; onSelect: (lead: Lead) => void; onMover: (id: string, estagio: string) => void }) {
  const [hoverCol, setHoverCol] = useState<string | null>(null)
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const toque = useKanbanTouchDrag({ onSoltar: onMover, scrollerRef })
  // A coluna acesa vem do mouse (HTML5) ou do dedo (toque) — quem estiver
  // ativo. Os dois gestos nunca acontecem ao mesmo tempo.
  const colunaAcesa = toque.colunaAlvo ?? hoverCol
  const leadFantasma = toque.leadArrastado ? leads.find(l => l.id === toque.leadArrastado) ?? null : null
  const etapaAlvo = toque.colunaAlvo ? ESTAGIOS.find(e => e.key === toque.colunaAlvo) : null

  return (
    <>
    <div ref={scrollerRef} style={{ overflowX: 'auto', paddingBottom: 12 }}>
      <div style={{ display: 'flex', gap: 12, minWidth: 'max-content', alignItems: 'flex-start' }}>
        {ESTAGIOS.map(col => {
          const colLeads = leads.filter(l => l.estagio_funil === col.key)
          // VGV da etapa: a contagem sozinha não diz se o funil está gordo ou
          // magro — dez leads de R$ 200 mil valem menos que dois de R$ 1,5 mi.
          const vgvCol = colLeads.reduce((s, l) => s + (l.orcamento_max ?? 0), 0)
          const isHover = colunaAcesa === col.key
          return (
            // data-coluna é como o arraste por toque descobre onde o dedo
            // está: elementFromPoint devolve o elemento embaixo e ele sobe
            // até achar a coluna.
            <div key={col.key} data-coluna={col.key} onDragOver={(e) => { e.preventDefault(); setHoverCol(col.key) }} onDragLeave={() => setHoverCol(h => h === col.key ? null : h)} onDrop={() => { onDrop(col.key); setHoverCol(null) }}
              style={{ width: 250, flexShrink: 0, background: D.surface, border: '1px solid ' + (isHover ? col.cor : D.line), borderRadius: 12, padding: 10, boxShadow: isHover ? '0 0 0 2px ' + col.cor + '55' : 'none', transition: 'box-shadow .12s, border-color .12s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: '2px solid ' + col.cor }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, background: col.cor }} />
                <span style={{ fontWeight: 700, fontSize: 12, color: D.ink }}>{col.label}</span>
                <span style={{ marginLeft: 'auto', background: col.cor, color: '#fff', borderRadius: 999, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{colLeads.length}</span>
              </div>
              {vgvCol > 0 && (
                // "~" e o title deixam claro que é potencial declarado, não
                // valor de negócio: a soma vem do orçamento máximo que o LEAD
                // informou, não do imóvel em negociação.
                <div title="Soma dos orçamentos declarados pelos leads desta etapa"
                  style={{ fontSize: 11, color: D.muted, marginTop: -4, marginBottom: 8, fontWeight: 600 }}>~{fmt(vgvCol)} potencial</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 560, overflowY: 'auto' }}>
                {colLeads.length === 0 ? (
                  // Antes dizia "Arraste leads para cá" — instrução impossível
                  // de seguir no celular, onde arrastar não funciona.
                  <div style={{ color: D.muted, fontSize: 12, textAlign: 'center', padding: '20px 0' }}>{isHover ? 'Solte aqui' : 'Nenhum lead nesta etapa'}</div>
                ) : colLeads.map(lead => (
                  <div key={lead.id} style={{ opacity: dragId === lead.id || toque.leadArrastado === lead.id ? 0.4 : 1 }}>
                    <LeadCard lead={lead} onDragStart={onDragStart} onSelect={onSelect} onMover={onMover}
                      onToqueInicio={toque.iniciarToque} ignorarClique={toque.deveIgnorarClique} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>

    {/* O card que segue o dedo. `pointerEvents: none` é obrigatório: sem
        isso elementFromPoint devolveria sempre o fantasma e nunca a coluna
        embaixo dele, e nenhum destino seria detectado. */}
    {leadFantasma && toque.ponto && (
      <div aria-hidden style={{
        position: 'fixed', left: toque.ponto.x, top: toque.ponto.y,
        transform: 'translate(-50%,-50%) rotate(-2deg)', pointerEvents: 'none', zIndex: 80,
        background: '#fff', border: '1px solid ' + D.line,
        borderLeft: '4px solid ' + (etapaAlvo?.cor ?? D.bronze), borderRadius: 8,
        padding: '10px 12px', boxShadow: '0 12px 28px rgba(0,0,0,0.20)', maxWidth: 220,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: D.ink, lineHeight: 1.25 }}>
          {leadFantasma.nome || '+' + leadFantasma.whatsapp}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: etapaAlvo ? etapaAlvo.cor : D.muted, marginTop: 3 }}>
          {etapaAlvo ? '→ ' + etapaAlvo.label : 'Arraste até uma coluna'}
        </div>
      </div>
    )}
    </>
  )
}


/**
 * Abre a conversa do WhatsApp com a simulação do espelho já digitada.
 *
 * Só aparece quando o lead TEM simulação registrada — a maioria não tem, e um
 * botão morto em todo card seria ruído. O disparo continua manual: quem
 * confere e aperta enviar é o corretor.
 */
function BotaoSimulacaoPronta({ leadId }: { leadId: string }) {
  const [estado, setEstado] = useState<'carregando' | 'tem' | 'nao'>('carregando')
  const [url, setUrl] = useState('')
  const [unidade, setUnidade] = useState('')

  useEffect(() => {
    let vivo = true
    fetch('/api/admin/leads/' + leadId + '/whatsapp-simulacao')
      .then(async (r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!vivo) return
        if (j?.url) { setUrl(j.url); setUnidade(j.unidade ?? ''); setEstado('tem') }
        else setEstado('nao')
      })
      .catch(() => { if (vivo) setEstado('nao') })
    return () => { vivo = false }
  }, [leadId])

  if (estado !== 'tem') return null

  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      style={{ display: 'block', marginTop: 18, background: D.bronze, color: '#fff', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>
      Enviar a simulação {unidade ? 'da unidade ' + unidade : ''} — texto pronto
    </a>
  )
}

function LeadModal({ lead, onClose, onUpdated, onDeleted }: { lead: Lead; onClose: () => void; onUpdated: (l: Lead) => void; onDeleted: (id: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [novaNota, setNovaNota] = useState('')
  const [temp, setTemp] = useState<number>(lead.temperatura ?? 1)
  const [form, setForm] = useState({
    nome: lead.nome ?? '', whatsapp: lead.whatsapp ?? '', email: lead.email ?? '',
    origem: lead.origem ?? 'Site', orcamento_max: lead.orcamento_max != null ? String(lead.orcamento_max) : '',
    // Os três campos que mais pesam no score de financiamento direto e que
    // até agora só podiam ser preenchidos por webhook.
    entrada_disponivel: lead.entrada_disponivel ?? '',
    prazo_compra: lead.prazo_compra ?? '',
    cidade_interesse: lead.cidade_interesse ?? '',
    // O imóvel dado na troca. Alimenta o cruzamento em /dashboard/permutas —
    // sem valor, o lead não entra no cruzamento.
    permuta_descricao: lead.permuta_descricao ?? '',
    permuta_valor: lead.permuta_valor != null ? String(lead.permuta_valor) : '',
  })

  const [timelineUnificada, setTimelineUnificada] = useState<TimelineItem[]>([])

  // Timeline vinda do servidor, combinando TODAS as fontes (anotações novas e
  // legadas, mudanças de etapa, propostas, mensagens de qualquer canal,
  // compromissos e ações do Modo Foco). Antes esta tela juntava só as
  // anotações do JSON com lead_eventos, e tudo o mais ficava invisível.
  const carregarTimeline = useCallback(() => {
    fetch('/api/admin/leads/' + lead.id + '/timeline')
      .then(r => r.json()).then(d => setTimelineUnificada(d.data ?? [])).catch(() => setTimelineUnificada([]))
  }, [lead.id])

  useEffect(() => {
    carregarTimeline()
    fetch('/api/admin/leads/' + lead.id + '/eventos').then(r => r.json()).then(d => setEventos(d.eventos ?? [])).catch(() => setEventos([]))
  }, [lead.id, carregarTimeline])

  // Rastreamento de navegação no site (lead_eventos) segue numa fonte
  // separada — não é histórico de atendimento, é comportamento no site.
  const timeline = [
    ...timelineUnificada.map(t => ({ kind: t.kind, data: t.data, texto: t.descricao ? t.titulo + ' — ' + t.descricao : t.titulo, origem: t.origem })),
    ...eventos.map(e => ({ kind: 'evento' as const, data: e.created_at, origem: 'Site', texto: e.descricao || (e.tipo === 'download' ? 'Baixou catálogo' : e.tipo === 'visita' ? 'Visitou página' : (e.slug || e.tipo || '').replace(/-/g, ' ')) })),
  ].sort((a, b) => (b.data || '').localeCompare(a.data || ''))

  async function salvarTemp(v: number) {
    setTemp(v)
    await fetch('/api/admin/leads/' + lead.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ temperatura: v }) })
    onUpdated({ ...lead, temperatura: v })
  }

  // Insere UMA linha nova em vez de reescrever o array inteiro de anotações.
  // O fluxo antigo (montar [nova, ...notas] a partir de um estado que foi
  // carregado quando o modal abriu, e mandar tudo de volta num PATCH)
  // apagava silenciosamente qualquer nota criada nesse meio-tempo em outra
  // aba, no Modo Foco ou por outra pessoa.
  async function adicionarNota() {
    if (!novaNota.trim()) return
    setSaving(true)
    const res = await fetch('/api/admin/leads/' + lead.id + '/anotacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto: novaNota.trim(), clientEventId: crypto.randomUUID() }),
    })
    setSaving(false)
    if (res.ok) { setNovaNota(''); carregarTimeline() }
  }

  async function salvarEdicao() {
    setSaving(true)
    const payload = {
      nome: form.nome, whatsapp: form.whatsapp, email: form.email || null, origem: form.origem,
      orcamento_max: form.orcamento_max ? Number(form.orcamento_max) : null,
      entrada_disponivel: form.entrada_disponivel || null,
      prazo_compra: form.prazo_compra || null,
      cidade_interesse: form.cidade_interesse || null,
      permuta_descricao: form.permuta_descricao || null,
      permuta_valor: form.permuta_valor ? Number(form.permuta_valor) : null,
    }
    const res = await fetch('/api/admin/leads/' + lead.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false)
    if (res.ok) {
      // A rota devolve o lead já com o score recalculado — qualificar o lead
      // e continuar vendo o número velho seria confuso justamente no momento
      // em que ele mais muda.
      const json = await res.json().catch(() => null)
      onUpdated({ ...lead, ...payload, ...(json?.data ?? {}) })
      setEditing(false)
    }
  }

  async function excluir() {
    await fetch('/api/admin/leads/' + lead.id, { method: 'DELETE' })
    onDeleted(lead.id)
  }

  const est = ESTAGIOS.find(e => e.key === lead.estagio_funil)
  const t = tempInfo(temp)
  const inputCss = { width: '100%', border: '1.5px solid #e4e4e7', borderRadius: 8, padding: '9px 11px', fontSize: 14, color: '#18181b', background: '#fff', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' }
  const labelCss = { display: 'block', fontSize: 11, fontWeight: 700, color: '#52525b', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 5, marginTop: 14 }

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose() }} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: 16 }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 560, maxHeight: '88vh', overflowY: 'auto', background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ background: est?.cor ?? D.bronze, padding: '18px 22px', borderRadius: '16px 16px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div>
              <h2 style={{ color: '#fff', fontSize: 19, fontWeight: 800, margin: 0 }}>{lead.nome || '+' + lead.whatsapp}</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, margin: '4px 0 0' }}>{est?.label ?? lead.estagio_funil} · {lead.origem ?? 'origem desconhecida'}</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => { setEditing(true); setConfirmDelete(false) }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Editar</button>
              <button onClick={() => { setConfirmDelete(true); setEditing(false) }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#FCA5A5', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Excluir</button>
              <button onClick={onClose} aria-label="Fechar" style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
          </div>
        </div>

        <div style={{ padding: 22 }}>
          {confirmDelete && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <p style={{ margin: '0 0 10px', fontSize: 14, color: '#991B1B', fontWeight: 600 }}>Excluir este lead permanentemente? Essa ação não pode ser desfeita.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={excluir} style={{ flex: 1, background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Sim, excluir</button>
                <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              </div>
            </div>
          )}

          <label style={labelCss}>Qualificação</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {TEMPERATURAS.map(x => (
              <button key={x.v} onClick={() => salvarTemp(x.v)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1.5px solid ' + (temp === x.v ? x.cor : D.line), background: temp === x.v ? x.cor + '18' : '#fff', color: temp === x.v ? x.cor : D.muted, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {x.emoji} {x.label}
              </button>
            ))}
          </div>

          {editing ? (
            <div style={{ marginTop: 6 }}>
              <label style={labelCss}>Nome</label>
              <input style={inputCss} value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
              <label style={labelCss}>WhatsApp</label>
              <input style={inputCss} value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} />
              <label style={labelCss}>E-mail</label>
              <input style={inputCss} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              <label style={labelCss}>Origem</label>
              <select style={inputCss} value={form.origem} onChange={e => setForm(p => ({ ...p, origem: e.target.value }))}>
                {['Site', 'Instagram', 'Indicacao', 'Portal', 'Anuncio', 'Evento', 'Whatsapp', 'Outro'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <label style={labelCss}>Orçamento máx (R$)</label>
              <input type="number" style={inputCss} value={form.orcamento_max} onChange={e => setForm(p => ({ ...p, orcamento_max: e.target.value }))} />
              <label style={labelCss}>Entrada disponível</label>
              <input style={inputCss} placeholder="Ex.: R$ 60.000 ou FGTS + 30 mil" value={form.entrada_disponivel} onChange={e => setForm(p => ({ ...p, entrada_disponivel: e.target.value }))} />
              <label style={labelCss}>Prazo de compra</label>
              <select style={inputCss} value={form.prazo_compra} onChange={e => setForm(p => ({ ...p, prazo_compra: e.target.value }))}>
                <option value="">Não informado</option>
                {['Imediato', 'Até 3 meses', 'Até 6 meses', 'Até 1 ano', 'Sem pressa'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <label style={labelCss}>Cidade de interesse</label>
              <input style={inputCss} value={form.cidade_interesse} onChange={e => setForm(p => ({ ...p, cidade_interesse: e.target.value }))} />
              <label style={labelCss}>Imóvel na troca (permuta)</label>
              <input style={inputCss} placeholder="Ex.: apto 2 dorm. no Michel, quitado"
                value={form.permuta_descricao} onChange={e => setForm(p => ({ ...p, permuta_descricao: e.target.value }))} />
              <label style={labelCss}>Valor estimado da permuta (R$)</label>
              <input type="number" style={inputCss} placeholder="280000"
                value={form.permuta_valor} onChange={e => setForm(p => ({ ...p, permuta_valor: e.target.value }))} />
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={salvarEdicao} disabled={saving} style={{ flex: 1, background: D.bronze, color: '#fff', border: 'none', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'Salvando...' : 'Salvar alterações'}</button>
                <button onClick={() => setEditing(false)} style={{ flex: 1, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
              <tbody>
                {[
                  ['WhatsApp', temWhatsappReal(lead.whatsapp)
                    ? <a key="w" href={'https://wa.me/55' + (lead.whatsapp || '').replace(/\D/g, '')} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none' }}>{lead.whatsapp} ↗</a>
                    : <span key="w" style={{ color: '#8a8a85' }}>Só Instagram — sem telefone ainda</span>],
                  ['E-mail', lead.email ? <a key="e" href={'mailto:' + lead.email} style={{ color: D.bronze, textDecoration: 'none' }}>{lead.email}</a> : '—'],
                  ['Empreendimento', lead.empreendimentos?.nome ?? lead.property_name ?? '—'],
                  ['Orçamento', lead.orcamento_max ? fmt(lead.orcamento_max) : '—'],
                  ['Entrada disponível', lead.entrada_disponivel || '—'],
                  ['Prazo de compra', lead.prazo_compra || '—'],
                  ['Cidade de interesse', lead.cidade_interesse || '—'],
                  ['Recebido em', lead.created_at ? new Date(lead.created_at).toLocaleString('pt-BR') : '—'],
                ].map(([k, v], i) => (
                  <tr key={i}>
                    <td style={{ color: '#8a8a85', padding: '8px 0', borderBottom: '1px solid #F3F2EE', fontSize: 13, width: '38%' }}>{k}</td>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #F3F2EE', fontSize: 14, fontWeight: 600 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* O número do score já aparecia em quatro telas sem dizer de onde
              vinha. Aqui ele abre a conta e, principalmente, diz qual é a
              próxima ação. */}
          <label style={labelCss}>Score</label>
          <PainelScore score={lead.lead_score ?? 0} detalhe={lead.lead_score_detalhe} compacto />

          <label style={labelCss}>Documentos</label>
          <AnexosLead leadId={lead.id} onMudou={carregarTimeline} />

          <label style={labelCss}>Envolvidos no negócio</label>
          <EnvolvidosLead leadId={lead.id} />

          <label style={labelCss}>Linha do tempo</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input value={novaNota} onChange={e => setNovaNota(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') adicionarNota() }} placeholder="Adicionar anotação..." style={{ ...inputCss, marginTop: 0 }} />
            <button onClick={adicionarNota} disabled={saving || !novaNota.trim()} style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '0 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: (saving || !novaNota.trim()) ? 0.5 : 1, whiteSpace: 'nowrap' }}>
              {saving ? '...' : 'Salvar'}
            </button>
          </div>
          {timeline.length === 0 ? (
            <p style={{ fontSize: 13, color: '#8a8a85', margin: 0 }}>Nenhuma atividade ainda. Adicione a primeira anotação acima.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxHeight: 240, overflowY: 'auto', borderLeft: '2px solid ' + D.line, paddingLeft: 14, marginLeft: 4 }}>
              {timeline.map((item, i) => (
                <div key={i} style={{ position: 'relative', paddingBottom: 14 }}>
                  <span style={{ position: 'absolute', left: -21, top: 3, width: 10, height: 10, borderRadius: '50%', background: CORES_TIMELINE[item.kind] ?? D.blue, border: '2px solid #fff' }} />
                  <div style={{ fontSize: 13, color: D.ink, lineHeight: 1.4 }}>{item.texto}</div>
                  <div style={{ fontSize: 11, color: '#8a8a85', marginTop: 2 }}>
                    {item.origem} · {item.data ? new Date(item.data).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 'sem data'}
                  </div>
                </div>
              ))}
            </div>
          )}

          <label style={labelCss}>Conversa WhatsApp</label>
          <ConversaPanel leadId={lead.id} />

          {temWhatsappReal(lead.whatsapp) ? (
            <>
              {/* Lead que simulou no espelho: abre a conversa com a simulação
                  já digitada. O envio segue sendo manual — o que sai daqui é
                  conversa comercial dele, não notificação de sistema —, mas
                  sem redigitar entrada, parcela e reforço a cada lead. */}
              <BotaoSimulacaoPronta leadId={lead.id} />
              <a href={'https://wa.me/55' + (lead.whatsapp || '').replace(/\D/g, '')} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: 10, background: '#25D366', color: '#fff', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>
                Abrir no WhatsApp (app)
              </a>
            </>
          ) : (
            <div style={{ display: 'block', marginTop: 18, background: '#F3F2EE', color: '#8a8a85', borderRadius: 10, padding: 12, fontSize: 13, textAlign: 'center' }}>
              📷 Lead veio do Instagram — edite acima quando conseguir o telefone
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type Tab = 'funil' | 'disponibilidade' | 'simulador' | 'clientes'

export default function CrmPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F3F2EE' }} />}>
      <CrmPageInner />
    </Suspense>
  )
}

function CrmPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [leads, setLeads] = useState<Lead[]>([])
  const [emps, setEmps] = useState<Emp[]>([])
  const [cub, setCub] = useState<Cub | null>(null)
  const [empSel, setEmpSel] = useState<Emp | null>(null)
  const [tab, setTab] = useState<Tab>('funil')
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [dragId, setDragId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Lead | null>(null)

  const load = useCallback(async () => {
    const [lRes, eRes, cRes] = await Promise.all([
      fetch('/api/admin/leads').then(r => r.json()),
      fetch('/api/admin/empreendimentos').then(r => r.json()),
      fetch('/api/admin/cub').then(r => r.json()),
    ])
    setLeads(Array.isArray(lRes) ? lRes : (lRes.data ?? []))
    const empList = eRes.data ?? []
    setEmps(empList)
    setEmpSel(prev => prev ?? (empList.length > 0 ? empList[0] : null))
    setCub(cRes.vigente ?? null)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // O Next.js App Router reaproveita a árvore de componentes já montada ao
  // voltar de outra rota (ex.: Modo Foco → CRM pelo botão "voltar" ou pelo
  // link "Detalhes completos"), então o useEffect acima não roda de novo —
  // o Kanban ficava mostrando o `leads` capturado na primeira visita, sem a
  // anotação/etapa/etc. feita no meio do caminho. Refazer o load() sempre
  // que a aba volta a ficar visível cobre esse caso (e qualquer outro lugar
  // do dashboard que também tenha mudado um lead) sem precisar de um cache
  // ou de passar dado entre rotas.
  useEffect(() => {
    function onVisivel() {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', onVisivel)
    window.addEventListener('focus', onVisivel)
    return () => {
      document.removeEventListener('visibilitychange', onVisivel)
      window.removeEventListener('focus', onVisivel)
    }
  }, [load])

  // Deep link do Modo Foco (link "Detalhes completos" do card) — abre
  // direto o modal do lead sem precisar caçar ele no Kanban.
  useEffect(() => {
    const leadId = searchParams.get('lead')
    if (!leadId || leads.length === 0) return
    const lead = leads.find(l => l.id === leadId)
    if (lead) setSelected(lead)
  }, [searchParams, leads])

  const focoCount = leads.filter(isEligibleForFocusQueue).length

  async function moverLead(id: string, estagio: string) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, estagio_funil: estagio } : l))
    try {
      await fetch('/api/admin/leads/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estagio_funil: estagio }) })
    } catch { load() }
  }

  function onDrop(estagio: string) {
    if (dragId) { moverLead(dragId, estagio); setDragId(null) }
  }

  const termo = busca.trim().toLowerCase()
  const leadsFiltrados = termo ? leads.filter(l => (l.nome || '').toLowerCase().includes(termo) || (l.whatsapp || '').includes(termo)) : leads

  const TABS: { key: Tab; label: string }[] = [
    { key: 'funil', label: 'Funil de Leads' },
    { key: 'disponibilidade', label: 'Disponibilidade' },
    { key: 'simulador', label: 'Simulador Direto' },
    { key: 'clientes', label: 'Clientes' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: 'clamp(16px,2vw,28px) clamp(16px,3vw,32px)' }}>
        <div style={{ marginBottom: 20 }}>
          <WidgetCub cub={cub} onSaved={load} />
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto', borderBottom: '1px solid ' + D.line }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '10px 20px', border: 'none', background: 'transparent', fontSize: 14, fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? D.bronze : D.muted, borderBottom: '2px solid ' + (tab === t.key ? D.bronze : 'transparent'), cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 44 }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 48, color: D.muted }}>Carregando...</div>}

        {!loading && tab === 'funil' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 18 }}>
              {[
                { l: 'Total Leads', v: leads.length, cor: D.blue },
                { l: 'Novos', v: leads.filter(l => l.estagio_funil === 'primeiro_contato').length, cor: '#6b7280' },
                { l: 'Em Negociação', v: leads.filter(l => l.estagio_funil === 'negociacao').length, cor: D.bronze },
                { l: 'Fechados', v: leads.filter(l => l.estagio_funil === 'fechado').length, cor: D.green },
                { l: 'Quentes', v: leads.filter(l => l.temperatura === 3).length, cor: D.red },
              ].map(({ l, v, cor }) => (
                <div key={l} style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 10, padding: '14px 16px', borderTop: '3px solid ' + cor }}>
                  <div style={{ fontSize: 10, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{l}</div>
                  <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 24, fontWeight: 800, color: cor }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, alignItems: 'center' }}>
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar nome ou WhatsApp..." style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid ' + D.line, background: '#fff', color: D.ink, fontSize: 14, outline: 'none', minWidth: 260 }} />
              <button
                onClick={() => router.push('/dashboard/crm/foco')}
                disabled={focoCount === 0}
                style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, background: focoCount === 0 ? D.line : D.bronze, color: focoCount === 0 ? D.muted : '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 14, cursor: focoCount === 0 ? 'default' : 'pointer', minHeight: 44 }}
              >
                <Crosshair size={16} /> Modo Foco · {focoCount} lead{focoCount === 1 ? '' : 's'}
              </button>
            </div>

            <Kanban leads={leadsFiltrados} dragId={dragId} onDragStart={setDragId} onDrop={onDrop} onSelect={setSelected} onMover={moverLead} />
          </div>
        )}

        {!loading && tab === 'disponibilidade' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {emps.map(e => (
                <button key={e.id} onClick={() => setEmpSel(e)} style={{ padding: '8px 16px', borderRadius: 2, border: '1px solid ' + (empSel?.id === e.id ? D.bronze : D.line), background: empSel?.id === e.id ? D.bronze : 'transparent', color: empSel?.id === e.id ? '#fff' : D.ink, fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 40 }}>
                  {e.nome}
                </button>
              ))}
            </div>
            {empSel && <TabelaUnidades emp={empSel} cub={cub} />}
          </div>
        )}

        {!loading && tab === 'simulador' && <SimuladorFluxo cub={cub} emps={emps} />}

        {!loading && tab === 'clientes' && (
          <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 10, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 18, fontWeight: 700, margin: 0, color: D.ink }}>Módulo de Clientes</h2>
              <a href="/dashboard/clientes" style={{ background: D.bronze, color: '#fff', borderRadius: 2, padding: '9px 20px', textDecoration: 'none', fontWeight: 700, fontSize: 13, minHeight: 40, display: 'inline-flex', alignItems: 'center' }}>Acessar completo</a>
            </div>
            <p style={{ color: D.muted, fontSize: 14, margin: 0 }}>Gerencie clientes, proprietários e parceiros. Acesse o módulo completo para CRUD, busca avançada e histórico de interações.</p>
          </div>
        )}
      </div>

      {selected && (
        <LeadModal lead={selected} onClose={() => setSelected(null)} onUpdated={(l) => { setLeads(prev => prev.map(x => x.id === l.id ? l : x)); setSelected(l) }} onDeleted={(id) => { setLeads(prev => prev.filter(x => x.id !== id)); setSelected(null) }} />
      )}
    </div>
  )
}
