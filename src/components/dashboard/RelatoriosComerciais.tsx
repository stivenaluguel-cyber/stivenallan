'use client'
import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Clock, TrendingUp, Wallet } from 'lucide-react'
import { D, fmt } from '@/components/dashboard/focus/tokens'
import { BotaoImprimir } from '@/components/dashboard/BotaoImprimir'

type PorOrigem = { origem: string; leads: number; vendas: number; vgv: number; conversao: number }

type Resposta = {
  periodo: { de: string; ate: string }
  vendas: {
    vgv_total: number; vendas: number; ticket_medio: number
    entradas_total: number; recebido: number; a_receber: number
    leads_periodo: number; conversao_geral: number
    vendas_coorte: number; vgv_coorte: number
    por_origem: PorOrigem[]
    funil: { estagio: string; leads: number }[]
  } | null
  leadsParados: {
    lead_id: string; nome: string | null; whatsapp: string
    estagio_funil: string | null; origem: string | null
    lead_score: number; dias_parado: number
  }[]
  diasParado: number
  tempoMedio: {
    lead_id: string; nome: string | null; estagio_funil: string | null
    movimentacoes: number; media_horas: number | null
  }[]
  comissoes: {
    total: number; recebido: number; aReceber: number; vencido: number
    proximos90Dias: number; quantidadeVencidas: number; percentualRecebido: number
  }
  motivosPerda: {
    total: number
    perdidosNoFunil: number
    porMotivo: { motivo: string; label: string; total: number; pct: number; detalhes: string[] }[]
  }
}

const hoje = () => new Date().toISOString().slice(0, 10)
const inicioDoMes = () => hoje().slice(0, 7) + '-01'

export function RelatoriosComerciais() {
  const [de, setDe] = useState(inicioDoMes)
  const [ate, setAte] = useState(hoje)
  const [diasParado, setDiasParado] = useState(3)
  const [dados, setDados] = useState<Resposta | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch(`/api/admin/relatorios?de=${de}&ate=${ate}&diasParado=${diasParado}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar relatórios')
      setDados(json); setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar relatórios')
    } finally { setCarregando(false) }
  }, [de, ate, diasParado])

  useEffect(() => { carregar() }, [carregar])

  const v = dados?.vendas

  return (
    <section id="desempenho-comercial" style={{ marginTop: 28 }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end', marginBottom: 14 }}>
        <div style={{ marginRight: 'auto' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: D.ink, margin: 0 }}>Desempenho comercial</h2>
          <p style={{ fontSize: 12, color: D.muted, margin: '3px 0 0' }}>
            VGV, conversão por origem e o que está parado.
          </p>
          {/* O período fica no papel: um PDF de relatório sem dizer de quando
              ele é vira número solto na mesa de quem recebe. */}
          {dados && (
            <p style={{ fontSize: 12, color: D.muted, margin: '3px 0 0' }}>
              Período: {new Date(dados.periodo.de + 'T12:00:00').toLocaleDateString('pt-BR')} a{' '}
              {new Date(dados.periodo.ate + 'T12:00:00').toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
        <label className="sem-impressao" style={rotulo}>De<input type="date" value={de} max={ate} onChange={(e) => setDe(e.target.value)} style={campo} /></label>
        <label className="sem-impressao" style={rotulo}>Até<input type="date" value={ate} min={de} max={hoje()} onChange={(e) => setAte(e.target.value)} style={campo} /></label>
        <span className="sem-impressao"><BotaoImprimir alvo="desempenho-comercial" /></span>
      </header>

      {erro && <p role="alert" style={alerta}>{erro}</p>}
      {carregando && !dados && <p style={{ fontSize: 13, color: D.muted }}>Carregando…</p>}

      {v && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 18 }}>
          <Cartao icone={<TrendingUp size={14} />} rotulo="VGV do período" valor={fmt(v.vgv_total)} nota={`${v.vendas} venda(s)`} />
          <Cartao icone={<TrendingUp size={14} />} rotulo="Ticket médio" valor={fmt(v.ticket_medio)} nota="por venda" />
          {/* Conversão é de COORTE: dos leads captados no período, quantos
              viraram venda — em qualquer data. Com ciclo longo (capta em
              março, fecha em julho), exigir que a venda caísse no mesmo mês
              daria ~0% para sempre. */}
          <Cartao icone={<TrendingUp size={14} />} rotulo="Conversão da safra" valor={`${v.conversao_geral}%`}
            nota={`${v.vendas_coorte} de ${v.leads_periodo} leads captados`} />
          <Cartao icone={<Wallet size={14} />} rotulo="A receber (90 dias)" valor={fmt(dados!.comissoes.proximos90Dias)}
            nota={dados!.comissoes.quantidadeVencidas > 0 ? `${dados!.comissoes.quantidadeVencidas} parcela(s) vencida(s)` : 'em dia'}
            alerta={dados!.comissoes.quantidadeVencidas > 0} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        {v && v.por_origem.length > 0 && (
          <Bloco titulo="Conversão por origem" subtitulo="Dos leads captados no período — venda contada em qualquer data">
            <table style={tabela}>
              <thead>
                <tr>
                  <th style={th}>Origem</th><th style={thNum}>Leads</th>
                  <th style={thNum}>Vendas</th><th style={thNum}>Conv.</th><th style={thNum}>VGV</th>
                </tr>
              </thead>
              <tbody>
                {[...v.por_origem].sort((a, b) => b.vgv - a.vgv || b.leads - a.leads).map((o) => (
                  <tr key={o.origem}>
                    <td style={td}>{o.origem}</td>
                    <td style={tdNum}>{o.leads}</td>
                    <td style={tdNum}>{o.vendas}</td>
                    <td style={{ ...tdNum, color: o.conversao > 0 ? D.green : D.muted, fontWeight: 700 }}>{o.conversao}%</td>
                    <td style={tdNum}>{o.vgv > 0 ? fmt(o.vgv) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Bloco>
        )}

        <Bloco
          titulo="Leads parados"
          subtitulo="Sem nenhuma movimentação registrada"
          acao={
            <select value={diasParado} onChange={(e) => setDiasParado(Number(e.target.value))} aria-label="Dias parado"
              style={{ ...campo, minWidth: 110 }}>
              {[3, 7, 15, 30].map((d) => <option key={d} value={d}>{d}+ dias</option>)}
            </select>
          }>
          {(dados?.leadsParados.length ?? 0) === 0 ? (
            <p style={vazio}>Nenhum lead parado há mais de {diasParado} dias.</p>
          ) : (
            <ul style={lista}>
              {dados!.leadsParados.slice(0, 12).map((l) => (
                <li key={l.lead_id} style={item}>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: D.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {l.nome || l.whatsapp}
                    </span>
                    <span style={{ fontSize: 10.5, color: D.muted }}>{l.estagio_funil ?? '—'} · score {l.lead_score}</span>
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap',
                    background: l.dias_parado >= 15 ? 'rgba(239,68,68,0.14)' : 'rgba(245,158,11,0.16)',
                    color: l.dias_parado >= 15 ? '#b91c1c' : '#b45309',
                  }}>
                    {l.dias_parado}d
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Bloco>

        <Bloco
          titulo="Motivos de perda"
          subtitulo={
            (dados?.motivosPerda.total ?? 0) === 0
              ? 'Nenhuma perda registrada no período'
              : `${dados!.motivosPerda.total} perda(s) no período — por que o negócio não fechou`
          }
        >
          {(dados?.motivosPerda.porMotivo.length ?? 0) === 0 ? (
            <p style={vazio}>
              Sem perdas registradas no período. O motivo é gravado quando um lead é marcado
              como perdido pelo Modo Foco.
            </p>
          ) : (
            <>
              <ul style={lista}>
                {dados!.motivosPerda.porMotivo.map((m) => (
                  <li key={m.motivo} style={{ ...item, display: 'block' }}>
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: D.ink }}>
                        {m.label}
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: D.ink, whiteSpace: 'nowrap' }}>
                        {m.total}
                      </span>
                      <span style={{ fontSize: 11, color: D.muted, whiteSpace: 'nowrap', minWidth: 42, textAlign: 'right' }}>
                        {m.pct}%
                      </span>
                    </span>
                    {/* Barra proporcional: a lista ordenada já diz quem é o
                        maior, a barra diz por quanto. */}
                    <span style={{ display: 'block', height: 4, borderRadius: 999, background: D.line, overflow: 'hidden', marginTop: 5 }}>
                      <span style={{ display: 'block', height: '100%', width: Math.max(2, m.pct) + '%', background: D.bronze, borderRadius: 999 }} />
                    </span>
                    {m.detalhes.length > 0 && (
                      <span style={{ display: 'block', fontSize: 10.5, color: D.muted, marginTop: 5, lineHeight: 1.5 }}>
                        {m.detalhes.join(' · ')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {/* Quantas perdas existem no funil sem motivo nenhum. Sem este
                  aviso o relatório passaria a impressão de cobrir tudo, quando
                  cobre só o que passou pelo Modo Foco. */}
              <p style={{ fontSize: 10.5, color: D.muted, margin: '10px 0 0', lineHeight: 1.5 }}>
                {dados!.motivosPerda.perdidosNoFunil} lead(s) estão hoje na etapa "perdido" no total.
                Quem foi marcado como perdido direto no CRM, fora do Modo Foco, entra nessa conta
                mas não tem motivo registrado aqui.
              </p>
            </>
          )}
        </Bloco>

        <Bloco titulo="Tempo entre movimentações" subtitulo="Quanto você demora para dar o próximo passo">
          {(dados?.tempoMedio.length ?? 0) === 0 ? (
            <p style={vazio}>Sem movimentações suficientes no período.</p>
          ) : (
            <ul style={lista}>
              {dados!.tempoMedio.slice(0, 12).map((t) => (
                <li key={t.lead_id} style={item}>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: D.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.nome || '—'}
                    </span>
                    <span style={{ fontSize: 10.5, color: D.muted }}>{t.movimentacoes} movimentações</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: D.muted, whiteSpace: 'nowrap' }}>
                    <Clock size={12} aria-hidden />
                    {t.media_horas === null ? '—' : `${t.media_horas}h`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Bloco>
      </div>
    </section>
  )
}

function Cartao({ icone, rotulo, valor, nota, alerta }: {
  icone: React.ReactNode; rotulo: string; valor: string; nota: string; alerta?: boolean
}) {
  return (
    <div style={{ background: '#fff', border: '1px solid ' + (alerta ? 'rgba(239,68,68,0.35)' : D.line), borderRadius: 10, padding: '11px 13px' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: D.muted, fontWeight: 600 }}>
        {icone}{rotulo}
      </span>
      <div style={{ fontSize: 19, fontWeight: 800, color: alerta ? '#b91c1c' : D.ink, lineHeight: 1.2, marginTop: 3 }}>{valor}</div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: D.muted }}>
        {alerta && <AlertTriangle size={11} aria-hidden />}{nota}
      </div>
    </div>
  )
}

function Bloco({ titulo, subtitulo, acao, children }: {
  titulo: string; subtitulo: string; acao?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 13, color: D.ink }}>{titulo}</strong>
          <p style={{ fontSize: 11, color: D.muted, margin: '2px 0 0' }}>{subtitulo}</p>
        </div>
        {acao}
      </div>
      {children}
    </div>
  )
}

const rotulo: React.CSSProperties = { display: 'grid', gap: 3, fontSize: 11, color: D.muted, fontWeight: 600 }
const campo: React.CSSProperties = {
  border: '1px solid ' + D.line, borderRadius: 8, padding: '8px 10px',
  fontSize: 12.5, color: D.ink, background: '#fff', minHeight: 38,
}
const alerta: React.CSSProperties = {
  fontSize: 12, color: D.red, background: 'rgba(239,68,68,0.08)',
  padding: '8px 10px', borderRadius: 8, margin: '0 0 12px',
}
const tabela: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12 }
const th: React.CSSProperties = { textAlign: 'left', color: D.muted, fontWeight: 600, fontSize: 10.5, padding: '0 0 6px' }
const thNum: React.CSSProperties = { ...th, textAlign: 'right' }
const td: React.CSSProperties = { padding: '7px 0', borderTop: '1px solid ' + D.line, color: D.ink }
const tdNum: React.CSSProperties = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }
const lista: React.CSSProperties = { listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }
const item: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 9, background: '#fff',
  border: '1px solid ' + D.line, borderRadius: 8, padding: '8px 10px',
}
const vazio: React.CSSProperties = { fontSize: 12, color: D.muted, margin: 0 }
