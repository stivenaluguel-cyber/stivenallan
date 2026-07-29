'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Flame, Target, TrendingUp } from 'lucide-react'
import { D, fmt } from '@/components/dashboard/focus/tokens'
import type { Calendario, DiaCalendario, MetasMensais, ProgressoMensal, StatusDia } from '@/lib/dashboard/metas-mensais'

type Resposta = {
  competencia: string
  calendario: Calendario
  metasMensais: MetasMensais
  mensal: ProgressoMensal
  configuradoMensal: boolean
}

const SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

// Cinza para fim de semana em branco, não vermelho: corretor autônomo também
// descansa, e pintar todo sábado de vermelho tornaria o calendário inútil.
const CORES: Record<StatusDia, { fundo: string; texto: string; borda: string }> = {
  completo: { fundo: 'rgba(34,197,94,0.16)', texto: D.ink, borda: D.green },
  parcial: { fundo: 'rgba(245,158,11,0.14)', texto: D.ink, borda: D.amber },
  zerado: { fundo: 'rgba(239,68,68,0.10)', texto: D.muted, borda: 'rgba(239,68,68,0.35)' },
  fim_de_semana: { fundo: 'transparent', texto: 'rgba(107,101,91,0.45)', borda: 'transparent' },
  futuro: { fundo: 'transparent', texto: 'rgba(107,101,91,0.30)', borda: 'transparent' },
}

const LEGENDA: { status: StatusDia; label: string }[] = [
  { status: 'completo', label: 'Meta batida' },
  { status: 'parcial', label: 'Parcial' },
  { status: 'zerado', label: 'Sem atividade' },
  { status: 'fim_de_semana', label: 'Fim de semana' },
]

function mesLegivel(competencia: string): string {
  const [ano, mes] = competencia.split('-')
  const nome = new Date(Date.UTC(Number(ano), Number(mes) - 1, 1))
    .toLocaleDateString('pt-BR', { month: 'long', timeZone: 'UTC' })
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} de ${ano}`
}

function deslocarMes(competencia: string, delta: number): string {
  const [ano, mes] = competencia.split('-').map(Number)
  const total = ano * 12 + (mes - 1) + delta
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
}

export function CalendarioMetas() {
  const [competencia, setCompetencia] = useState<string>(() => new Date().toISOString().slice(0, 7))
  const [dados, setDados] = useState<Resposta | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [selecionado, setSelecionado] = useState<DiaCalendario | null>(null)
  const [editandoMeta, setEditandoMeta] = useState(false)

  const carregar = useCallback(async (comp: string) => {
    setCarregando(true)
    try {
      const res = await fetch(`/api/admin/metas/historico?competencia=${comp}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar o histórico')
      setDados(json); setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar o histórico')
    } finally { setCarregando(false) }
  }, [])

  useEffect(() => { carregar(competencia) }, [carregar, competencia])

  // Célula em branco antes do dia 1 para o mês começar no dia da semana certo.
  const celulasVazias = useMemo(
    () => Array.from({ length: dados?.calendario.offsetInicial ?? 0 }, (_, i) => i),
    [dados?.calendario.offsetInicial],
  )

  const hojeComp = new Date().toISOString().slice(0, 7)

  return (
    <section style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 14, padding: 18 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: D.ink, margin: 0 }}>Histórico de metas</h2>
          <p style={{ fontSize: 12, color: D.muted, margin: '3px 0 0' }}>
            Os dias já encerrados ficam congelados com a meta que valia neles.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => setCompetencia(deslocarMes(competencia, -1))} aria-label="Mês anterior"
            style={botaoNav}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: D.ink, minWidth: 132, textAlign: 'center' }}>
            {mesLegivel(competencia + '-01')}
          </span>
          <button onClick={() => setCompetencia(deslocarMes(competencia, 1))} aria-label="Próximo mês"
            disabled={competencia >= hojeComp}
            style={{ ...botaoNav, opacity: competencia >= hojeComp ? 0.35 : 1, cursor: competencia >= hojeComp ? 'not-allowed' : 'pointer' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      {erro && (
        <p role="alert" style={{ fontSize: 12, color: D.red, background: 'rgba(239,68,68,0.08)', padding: '8px 10px', borderRadius: 8, margin: '0 0 12px' }}>
          {erro}
        </p>
      )}

      {carregando && !dados && <p style={{ fontSize: 13, color: D.muted }}>Carregando…</p>}

      {dados && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
            <Indicador icone={<Target size={14} />} rotulo="Dias batidos"
              valor={`${dados.calendario.diasBatidos}/${dados.calendario.diasAvaliados}`}
              nota={`${dados.calendario.percentualDoMes}% dos dias úteis`} />
            <Indicador icone={<Flame size={14} />} rotulo="Sequência atual"
              valor={`${dados.calendario.sequenciaAtual}`}
              nota={`Melhor do mês: ${dados.calendario.melhorSequencia}`}
              destaque={dados.calendario.sequenciaAtual >= 3} />
            {dados.metasMensais.meta_vgv > 0 && (
              <Indicador icone={<TrendingUp size={14} />} rotulo="VGV do mês"
                valor={`${dados.mensal.itens.find((i) => i.chave === 'vgv')?.percentual ?? 0}%`}
                nota={dados.mensal.noRitmo ? 'No ritmo' : `Faltam ${fmt(dados.mensal.vgvPorDiaUtil)}/dia útil`}
                destaque={dados.mensal.noRitmo} />
            )}
          </div>

          <div role="grid" aria-label={'Calendário de ' + mesLegivel(competencia + '-01')}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {SEMANA.map((d, i) => (
              <div key={i} aria-hidden style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: D.muted, padding: '2px 0 6px' }}>
                {d}
              </div>
            ))}
            {celulasVazias.map((i) => <div key={'v' + i} />)}
            {dados.calendario.dias.map((dia) => (
              <CelulaDia key={dia.data} dia={dia} onSelecionar={setSelecionado} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 14 }}>
            {LEGENDA.map((l) => (
              <span key={l.status} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: D.muted }}>
                <span aria-hidden style={{
                  width: 11, height: 11, borderRadius: 3,
                  background: CORES[l.status].fundo,
                  border: '1px solid ' + (CORES[l.status].borda === 'transparent' ? D.line : CORES[l.status].borda),
                }} />
                {l.label}
              </span>
            ))}
          </div>

          {selecionado && <DetalheDia dia={selecionado} onFechar={() => setSelecionado(null)} />}

          <MetaMensal
            metas={dados.metasMensais}
            progresso={dados.mensal}
            competencia={competencia}
            aberta={editandoMeta}
            onAbrir={() => setEditandoMeta(true)}
            onFechar={() => setEditandoMeta(false)}
            onSalvo={() => { setEditandoMeta(false); carregar(competencia) }}
          />
        </>
      )}
    </section>
  )
}

const botaoNav: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 32, height: 32, borderRadius: 8, border: '1px solid ' + D.line,
  background: '#fff', color: D.ink, cursor: 'pointer',
}

function Indicador({ icone, rotulo, valor, nota, destaque }: {
  icone: React.ReactNode; rotulo: string; valor: string; nota: string; destaque?: boolean
}) {
  return (
    <div style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 10, padding: '10px 12px' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: D.muted, fontWeight: 600 }}>
        {icone}{rotulo}
      </span>
      <div style={{ fontSize: 20, fontWeight: 800, color: destaque ? D.green : D.ink, lineHeight: 1.15, marginTop: 2 }}>
        {valor}
      </div>
      <div style={{ fontSize: 11, color: D.muted }}>{nota}</div>
    </div>
  )
}

function CelulaDia({ dia, onSelecionar }: { dia: DiaCalendario; onSelecionar: (d: DiaCalendario) => void }) {
  const cor = CORES[dia.status]
  const clicavel = dia.status !== 'futuro'

  const descricao = dia.status === 'futuro'
    ? `Dia ${dia.dia}, ainda não chegou`
    : `Dia ${dia.dia}: ${dia.cumpridas} de ${dia.total} metas, ${dia.percentual}%`

  return (
    <button
      type="button"
      onClick={() => clicavel && onSelecionar(dia)}
      disabled={!clicavel}
      aria-label={descricao}
      title={descricao}
      style={{
        // 44px é o alvo mínimo de toque; abaixo disso o calendário fica
        // impossível de usar no celular, que é onde ele será aberto.
        minHeight: 44,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 2, padding: '6px 2px', borderRadius: 8,
        background: cor.fundo,
        border: '1px solid ' + (cor.borda === 'transparent' ? 'transparent' : cor.borda),
        color: cor.texto,
        cursor: clicavel ? 'pointer' : 'default',
        font: 'inherit',
      }}>
      <span style={{ fontSize: 13, fontWeight: dia.status === 'completo' ? 800 : 600 }}>{dia.dia}</span>
      {dia.status !== 'futuro' && dia.status !== 'fim_de_semana' && (
        <span aria-hidden style={{ fontSize: 9, color: D.muted }}>{dia.percentual}%</span>
      )}
    </button>
  )
}

const ROTULOS: Record<string, string> = {
  novos_contatos: 'Novos contatos',
  followups: 'Follow-ups',
  visitas: 'Visitas',
  conteudos: 'Conteúdo',
  reunioes: 'Reuniões',
}

function DetalheDia({ dia, onFechar }: { dia: DiaCalendario; onFechar: () => void }) {
  const itens = Object.entries(dia.detalhe)
  return (
    <div style={{ marginTop: 14, background: '#fff', border: '1px solid ' + D.line, borderRadius: 10, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <strong style={{ fontSize: 13, color: D.ink }}>
          {new Date(dia.data + 'T12:00:00Z').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', timeZone: 'UTC' })}
        </strong>
        <button onClick={onFechar} style={{ background: 'none', border: 'none', color: D.muted, cursor: 'pointer', fontSize: 12, minHeight: 32 }}>
          Fechar
        </button>
      </div>

      {itens.length === 0
        ? <p style={{ fontSize: 12, color: D.muted, margin: '8px 0 0' }}>Nenhuma meta configurada para este dia.</p>
        : (
          <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'grid', gap: 7 }}>
            {itens.map(([chave, v]) => (
              <li key={chave} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12 }}>
                <span style={{ flex: 1, color: D.ink }}>{ROTULOS[chave] ?? chave}</span>
                <span style={{ width: 120, height: 6, borderRadius: 3, background: D.line, overflow: 'hidden' }}>
                  <span style={{
                    display: 'block', height: '100%',
                    width: Math.min(100, Math.round((v.feito / Math.max(1, v.meta)) * 100)) + '%',
                    background: v.feito >= v.meta ? D.green : D.amber,
                  }} />
                </span>
                <span style={{ width: 52, textAlign: 'right', color: v.feito >= v.meta ? D.green : D.muted, fontWeight: 600 }}>
                  {v.feito}/{v.meta}
                </span>
              </li>
            ))}
          </ul>
        )}

      {dia.selado && (
        <p style={{ fontSize: 11, color: D.muted, margin: '10px 0 0' }}>
          Dia encerrado — congelado com a meta que valia nesta data.
        </p>
      )}
    </div>
  )
}

function MetaMensal({ metas, progresso, competencia, aberta, onAbrir, onFechar, onSalvo }: {
  metas: MetasMensais
  progresso: ProgressoMensal
  competencia: string
  aberta: boolean
  onAbrir: () => void
  onFechar: () => void
  onSalvo: () => void
}) {
  const [vgv, setVgv] = useState(String(metas.meta_vgv || ''))
  const [vendas, setVendas] = useState(String(metas.meta_vendas || ''))
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    setVgv(String(metas.meta_vgv || ''))
    setVendas(String(metas.meta_vendas || ''))
  }, [metas.meta_vgv, metas.meta_vendas])

  async function salvar() {
    setSalvando(true)
    try {
      const res = await fetch('/api/admin/metas/historico', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competencia, meta_vgv: vgv, meta_vendas: vendas }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Falha ao salvar')
      setErro(''); onSalvo()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao salvar')
    } finally { setSalvando(false) }
  }

  return (
    <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid ' + D.line }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <strong style={{ fontSize: 13, color: D.ink }}>Meta do mês</strong>
        <button onClick={aberta ? onFechar : onAbrir}
          style={{ background: 'none', border: '1px solid ' + D.line, borderRadius: 8, padding: '6px 10px', fontSize: 12, color: D.ink, cursor: 'pointer', minHeight: 34 }}>
          {aberta ? 'Cancelar' : 'Definir'}
        </button>
      </div>

      {aberta ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label style={{ fontSize: 11, color: D.muted, display: 'grid', gap: 3 }}>
            VGV (R$)
            <input value={vgv} onChange={(e) => setVgv(e.target.value)} inputMode="decimal" placeholder="1.500.000"
              style={campo} />
          </label>
          <label style={{ fontSize: 11, color: D.muted, display: 'grid', gap: 3 }}>
            Vendas
            <input value={vendas} onChange={(e) => setVendas(e.target.value)} inputMode="numeric" placeholder="3"
              style={{ ...campo, width: 90 }} />
          </label>
          <button onClick={salvar} disabled={salvando}
            style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 40 }}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
          {erro && <span role="alert" style={{ fontSize: 12, color: D.red }}>{erro}</span>}
        </div>
      ) : progresso.itens.length === 0 ? (
        <p style={{ fontSize: 12, color: D.muted, margin: 0 }}>
          Nenhuma meta de resultado definida para este mês.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 9 }}>
          {progresso.itens.map((i) => (
            <div key={i.chave} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
              <span style={{ width: 62, color: D.ink, fontWeight: 600 }}>{i.label}</span>
              <span style={{ flex: 1, height: 8, borderRadius: 4, background: D.line, overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: i.percentual + '%', background: i.cumprida ? D.green : D.bronze }} />
              </span>
              <span style={{ color: D.muted, whiteSpace: 'nowrap' }}>
                {i.formato === 'moeda' ? `${fmt(i.feito)} / ${fmt(i.meta)}` : `${i.feito} / ${i.meta}`}
              </span>
            </div>
          ))}
          <p style={{ fontSize: 11, color: progresso.noRitmo ? D.green : D.amber, margin: 0 }}>
            {progresso.noRitmo
              ? 'No ritmo para fechar o mês.'
              : `Faltam ${fmt(progresso.vgvFaltante)} em ${progresso.diasUteisRestantes} dias úteis — ${fmt(progresso.vgvPorDiaUtil)} por dia.`}
          </p>
        </div>
      )}
    </div>
  )
}

const campo: React.CSSProperties = {
  border: '1px solid ' + D.line, borderRadius: 8, padding: '9px 10px',
  fontSize: 13, color: D.ink, background: '#fff', width: 140, minHeight: 40,
}
