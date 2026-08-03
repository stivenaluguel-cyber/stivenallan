'use client'
import { useCallback, useEffect, useState } from 'react'
import { FileText, AlertTriangle } from 'lucide-react'
import { BotaoImprimir } from '@/components/dashboard/BotaoImprimir'

/**
 * Extrato anual de comissões para a declaração.
 *
 * Regime de caixa: o que conta é o mês em que o dinheiro entrou. Por isso só
 * aparecem comissões com status "recebida", alocadas pela data de
 * recebimento — uma venda de dezembro paga em fevereiro é receita de
 * fevereiro do ano seguinte.
 *
 * Nada aqui é cálculo de imposto: é o levantamento do que entrou, no formato
 * que o contador (ou o carnê-leão) pede. A tela evita insinuar o contrário.
 */

const D = {
  ink: '#161512', muted: '#6B655B', line: 'rgba(26,24,21,0.10)',
  bronze: '#D24E22', surface: '#FAFAF7', bg: '#F3F2EE', alerta: '#B45309',
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

type Extrato = {
  ano: number
  meses: { mes: number; label: string; total: number; minhaParte: number; quantidade: number }[]
  total: number
  minhaParteTotal: number
  quantidade: number
  semDataRecebimento: { quantidade: number; total: number }
  temRepasse: boolean
  anosDisponiveis: number[]
  identificouCorretor: boolean
}

export function ExtratoAnual({ recarregarQuando }: { recarregarQuando?: number } = {}) {
  const [ano, setAno] = useState(() => new Date().getFullYear())
  const [dados, setDados] = useState<Extrato | null>(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch(`/api/admin/comissoes/extrato?ano=${ano}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar o extrato')
      setDados(json); setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar o extrato')
    } finally { setCarregando(false) }
  }, [ano])

  // recarregarQuando muda toda vez que a tela de comissões grava algo (nova
  // venda, status alterado) — sem isto, o extrato ficava mostrando o mês
  // antigo até o próximo F5, mesmo com o resto da tela já atualizado.
  useEffect(() => { carregar() }, [carregar, recarregarQuando])

  // Mostrar a coluna "sua parte" sem saber quem é o corretor repetiria o
  // bruto duas vezes e faria o repasse parecer receita própria.
  const mostrarParte = !!dados?.temRepasse && !!dados?.identificouCorretor
  const anos = dados?.anosDisponiveis.length ? dados.anosDisponiveis : [ano]

  return (
    <section id="extrato-anual" style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 16, marginTop: 20 }}>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, color: D.ink }}>
            <FileText size={15} aria-hidden style={{ color: D.bronze }} /> Extrato anual (IR)
          </strong>
          <p style={{ fontSize: 12, color: D.muted, margin: '4px 0 0', lineHeight: 1.5, maxWidth: 560 }}>
            Comissões efetivamente recebidas, pelo mês em que o dinheiro entrou. É o
            levantamento que o contador pede — não é cálculo de imposto.
          </p>
        </div>
        <div className="sem-impressao" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: D.muted, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Ano
            <select value={ano} onChange={(e) => setAno(Number(e.target.value))}
              style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid ' + D.line, background: '#fff', color: D.ink, fontSize: 13, minHeight: 40 }}>
              {anos.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <BotaoImprimir alvo="extrato-anual" rotulo="Salvar PDF" />
        </div>
      </header>

      {erro && <p role="alert" style={{ fontSize: 12.5, color: '#DC2626', margin: '0 0 10px' }}>{erro}</p>}
      {carregando && !dados && <p style={{ fontSize: 13, color: D.muted, margin: 0 }}>Carregando…</p>}

      {dados && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: mostrarParte ? 420 : 320 }}>
              <thead>
                <tr style={{ background: D.ink, color: '#F3F2EE' }}>
                  <th style={th}>Mês</th>
                  <th style={{ ...th, textAlign: 'right' }}>Recebimentos</th>
                  <th style={{ ...th, textAlign: 'right' }}>Total</th>
                  {mostrarParte && <th style={{ ...th, textAlign: 'right' }}>Sua parte</th>}
                </tr>
              </thead>
              <tbody>
                {dados.meses.map((m, i) => (
                  <tr key={m.mes} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(210,78,34,0.05)' }}>
                    <td style={td}>{m.label}</td>
                    <td style={{ ...td, textAlign: 'right', color: m.quantidade ? D.ink : D.muted }}>{m.quantidade}</td>
                    <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: m.total ? D.ink : D.muted }}>
                      {fmt(m.total)}
                    </td>
                    {mostrarParte && (
                      <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: m.minhaParte ? D.ink : D.muted }}>
                        {fmt(m.minhaParte)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: D.bg, fontWeight: 800 }}>
                  <td style={td}>Total {dados.ano}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{dados.quantidade}</td>
                  <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(dados.total)}</td>
                  {mostrarParte && <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(dados.minhaParteTotal)}</td>}
                </tr>
              </tfoot>
            </table>
          </div>

          {mostrarParte && (
            <p style={{ fontSize: 11, color: D.muted, margin: '10px 0 0', lineHeight: 1.5 }}>
              "Sua parte" desconta o que foi repassado aos outros envolvidos do negócio. O
              repasse passou pela conta mas não é receita sua.
            </p>
          )}

          {dados.temRepasse && !dados.identificouCorretor && (
            <p style={{ fontSize: 11, color: D.alerta, margin: '10px 0 0', lineHeight: 1.5, display: 'flex', gap: 6 }}>
              <AlertTriangle size={12} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />
              Existem vendas com divisão entre envolvidos, mas nenhum corretor cadastrado está
              vinculado ao seu login — os valores acima são o bruto do negócio, sem descontar
              repasses.
            </p>
          )}

          {dados.semDataRecebimento.quantidade > 0 && (
            <p style={{ fontSize: 11, color: D.alerta, margin: '10px 0 0', lineHeight: 1.5, display: 'flex', gap: 6 }}>
              <AlertTriangle size={12} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />
              {dados.semDataRecebimento.quantidade} comissão(ões) marcada(s) como recebida(s) sem data
              de recebimento ({fmt(dados.semDataRecebimento.total)}) ficaram fora de todos os meses —
              chutar a competência num documento fiscal seria pior do que deixar de fora. Preencha a
              data para elas entrarem.
            </p>
          )}
        </>
      )}
    </section>
  )
}

const th: React.CSSProperties = {
  padding: '10px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.06em', textAlign: 'left',
}
const td: React.CSSProperties = { padding: '9px 12px', borderBottom: '1px solid ' + D.line }
