'use client'
import { useCallback, useEffect, useState } from 'react'
import { Check, CalendarClock } from 'lucide-react'
import { D, fmt } from '@/components/dashboard/focus/tokens'
import type { Parcela, ResumoParcelas } from '@/lib/comissoes/parcelas'

/**
 * Plano de recebimento de uma comissão.
 *
 * No financiamento direto a comissão acompanha o recebimento da
 * incorporadora: sai por etapa, não de uma vez. Sem isso não dá para
 * responder "quanto eu tenho a receber nos próximos 90 dias", que é a única
 * pergunta financeira que o corretor autônomo faz todo mês.
 */
export function ParcelasComissao({ comissaoId, valorComissao, dataVenda, onMudou }: {
  comissaoId: string
  valorComissao: number
  dataVenda?: string | null
  onMudou?: () => void
}) {
  const [parcelas, setParcelas] = useState<Parcela[]>([])
  const [resumo, setResumo] = useState<ResumoParcelas | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [quantidade, setQuantidade] = useState(3)
  const [primeiraData, setPrimeiraData] = useState(dataVenda || new Date().toISOString().slice(0, 10))
  const [gerando, setGerando] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch(`/api/admin/comissoes/${comissaoId}/parcelas`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar parcelas')
      setParcelas(json.data ?? []); setResumo(json.resumo ?? null); setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar parcelas')
    } finally { setCarregando(false) }
  }, [comissaoId])

  useEffect(() => { carregar() }, [carregar])

  async function gerar() {
    setGerando(true)
    try {
      const res = await fetch(`/api/admin/comissoes/${comissaoId}/parcelas`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidade, primeiraData, intervaloMeses: 1 }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao gerar parcelas')
      setParcelas(json.data ?? []); setResumo(json.resumo ?? null); setErro('')
      onMudou?.()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao gerar parcelas')
    } finally { setGerando(false) }
  }

  async function baixar(parcela: Parcela) {
    const proximoStatus = parcela.status === 'recebida' ? 'prevista' : 'recebida'
    try {
      const res = await fetch(`/api/admin/comissoes/${comissaoId}/parcelas`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parcelaId: parcela.id, status: proximoStatus }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao atualizar')
      setParcelas(json.data ?? []); setResumo(json.resumo ?? null); setErro('')
      onMudou?.()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao atualizar')
    }
  }

  const hoje = new Date().toISOString().slice(0, 10)

  return (
    <div>
      {erro && <p role="alert" style={{ fontSize: 12, color: D.red, background: 'rgba(239,68,68,0.08)', padding: '8px 10px', borderRadius: 8, margin: '0 0 10px' }}>{erro}</p>}

      {resumo && resumo.quantidade > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 12 }}>
          <Mini rotulo="Recebido" valor={fmt(resumo.recebido)} cor={D.green} nota={`${resumo.percentualRecebido}%`} />
          <Mini rotulo="A receber" valor={fmt(resumo.aReceber)} cor={D.ink} nota={`${resumo.quantidade - resumo.quantidadeRecebidas} parcela(s)`} />
          <Mini rotulo="Próximos 90 dias" valor={fmt(resumo.proximos90Dias)} cor={D.bronze} nota="expectativa de caixa" />
          {resumo.vencido > 0 && (
            <Mini rotulo="Vencido" valor={fmt(resumo.vencido)} cor={D.red} nota={`${resumo.quantidadeVencidas} parcela(s)`} />
          )}
        </div>
      )}

      {carregando ? (
        <p style={{ fontSize: 12, color: D.muted }}>Carregando…</p>
      ) : parcelas.length === 0 ? (
        <div style={{ background: D.bg, border: '1px solid ' + D.line, borderRadius: 10, padding: 12 }}>
          <p style={{ fontSize: 12.5, color: D.ink, margin: '0 0 10px' }}>
            Sem plano de recebimento. Comissão de {fmt(valorComissao)}.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <label style={rotuloCss}>
              Parcelas
              <input type="number" min={1} max={240} value={quantidade}
                onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value) || 1))} style={{ ...campo, width: 78 }} />
            </label>
            <label style={rotuloCss}>
              Primeira em
              <input type="date" value={primeiraData} onChange={(e) => setPrimeiraData(e.target.value)} style={campo} />
            </label>
            <button onClick={gerar} disabled={gerando}
              style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', minHeight: 40 }}>
              {gerando ? 'Gerando…' : 'Gerar plano'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: D.muted, margin: '8px 0 0' }}>
            A divisão é feita em centavos e o resto vai na última parcela — a soma fecha exatamente com a comissão.
          </p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
          {parcelas.map((p) => {
            const vencida = p.status === 'prevista' && p.data_prevista < hoje
            return (
              <li key={p.id ?? p.numero} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#fff', borderRadius: 8, padding: '9px 11px',
                border: '1px solid ' + (vencida ? 'rgba(239,68,68,0.35)' : D.line),
                opacity: p.status === 'cancelada' ? 0.5 : 1,
              }}>
                <button onClick={() => baixar(p)}
                  aria-label={p.status === 'recebida' ? `Desfazer baixa da parcela ${p.numero}` : `Dar baixa na parcela ${p.numero}`}
                  style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: p.status === 'recebida' ? D.green : '#fff',
                    border: '1px solid ' + (p.status === 'recebida' ? D.green : D.line),
                    color: p.status === 'recebida' ? '#fff' : 'transparent',
                  }}>
                  <Check size={15} aria-hidden />
                </button>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: D.ink }}>
                    {p.descricao || `Parcela ${p.numero}`}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: vencida ? '#b91c1c' : D.muted }}>
                    <CalendarClock size={11} aria-hidden />
                    {new Date(p.data_prevista + 'T12:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    {vencida && ' · vencida'}
                    {p.data_pagamento && ` · paga em ${new Date(p.data_pagamento + 'T12:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`}
                  </span>
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: p.status === 'recebida' ? D.green : D.ink, whiteSpace: 'nowrap' }}>
                  {fmt(p.valor)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function Mini({ rotulo, valor, cor, nota }: { rotulo: string; valor: string; cor: string; nota: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 9, padding: '8px 10px' }}>
      <div style={{ fontSize: 10, color: D.muted, fontWeight: 600 }}>{rotulo}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: cor, lineHeight: 1.25 }}>{valor}</div>
      <div style={{ fontSize: 10, color: D.muted }}>{nota}</div>
    </div>
  )
}

const rotuloCss: React.CSSProperties = { display: 'grid', gap: 3, fontSize: 11, color: D.muted, fontWeight: 600 }
const campo: React.CSSProperties = {
  border: '1px solid ' + D.line, borderRadius: 8, padding: '8px 10px',
  fontSize: 12.5, color: D.ink, background: '#fff', minHeight: 38,
}
