'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calculator, Check, TrendingUp } from 'lucide-react'
import { palpiteInicial, projetar } from '@/lib/dashboard/projecao-meta'
import { competenciaDe } from '@/lib/dashboard/metas-mensais'

/**
 * Simulador de fechamento do mês.
 *
 * A barra de progresso da meta diz quanto já foi feito; não diz o que fazer
 * com o que sobrou. Aqui o corretor mexe nas três variáveis que controla —
 * ticket médio, quantidade de vendas e o percentual de comissão — e vê na
 * hora o VGV e a comissão que aquilo dá, contra a meta do mês.
 *
 * Os campos abrem preenchidos a partir da própria meta já cadastrada: abrir
 * zerado obrigaria a inventar três números antes de ver qualquer coisa.
 */

const D = {
  ink: '#161512', muted: '#6B655B', line: 'rgba(26,24,21,0.10)',
  bronze: '#D24E22', surface: '#FAFAF7', bg: '#F3F2EE', green: '#16a34a',
}

const fmt = (n: number) => 'R$ ' + Math.round(n).toLocaleString('pt-BR')

type Resposta = {
  metasMensais: { meta_vgv: number; meta_vendas: number; meta_propostas: number }
  mensal: { itens: { chave: string; feito: number; meta: number }[] }
}

export function ProjecaoMeta() {
  const [dados, setDados] = useState<Resposta | null>(null)
  // Nasce com o palpite sem meta: se a busca da meta falhar (ou ainda não
  // tiver voltado), a ferramenta continua utilizável em vez de abrir zerada,
  // com um slider em R$ 0 que não simula nada.
  const inicial = palpiteInicial(0, 0)
  const [ticket, setTicket] = useState(inicial.ticketMedio)
  const [volume, setVolume] = useState(inicial.volume)
  const [percentual, setPercentual] = useState(6)
  const [tocado, setTocado] = useState(false)

  const carregar = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/metas/historico?competencia=${competenciaDe(new Date()).slice(0, 7)}`)
      if (!res.ok) return
      setDados(await res.json())
    } catch { /* a projeção é acessório: falhar aqui não pode derrubar o painel */ }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const metaVgv = dados?.metasMensais.meta_vgv ?? 0
  const realizadoVgv = dados?.mensal.itens.find((i) => i.chave === 'vgv')?.feito ?? 0

  // Só semeia os campos uma vez; depois que o corretor mexe, o valor é dele.
  useEffect(() => {
    if (!dados || tocado) return
    const palpite = palpiteInicial(metaVgv, dados.metasMensais.meta_vendas)
    setTicket(palpite.ticketMedio)
    setVolume(palpite.volume)
  }, [dados, metaVgv, tocado])

  const p = useMemo(
    () => projetar({ ticketMedio: ticket, volume, percentualComissao: percentual, metaVgv, realizadoVgv }),
    [ticket, volume, percentual, metaVgv, realizadoVgv],
  )

  const mexer = <T,>(setter: (v: T) => void) => (v: T) => { setTocado(true); setter(v) }

  return (
    <section style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 16, marginBottom: 24 }}>
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <Calculator size={15} aria-hidden style={{ color: D.bronze, alignSelf: 'center' }} />
        <strong style={{ fontSize: 14, color: D.ink }}>Quanto falta fechar</strong>
      </header>
      <p style={{ fontSize: 12, color: D.muted, margin: '0 0 14px', lineHeight: 1.5 }}>
        {metaVgv > 0
          ? <>Meta do mês: <strong style={{ color: D.ink }}>{fmt(metaVgv)}</strong> · já realizado {fmt(realizadoVgv)}</>
          : 'Sem meta de VGV cadastrada — a simulação mostra o resultado bruto, sem comparativo.'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
        <Controle
          rotulo="Ticket médio" valor={fmt(ticket)}
          min={50_000} max={3_000_000} passo={10_000} atual={ticket}
          onChange={mexer(setTicket)}
        />
        <Controle
          rotulo="Vendas no mês" valor={String(volume)}
          min={0} max={20} passo={1} atual={volume}
          onChange={mexer(setVolume)}
        />
        <Controle
          rotulo="Comissão" valor={percentual.toLocaleString('pt-BR') + '%'}
          min={0} max={12} passo={0.5} atual={percentual}
          onChange={mexer(setPercentual)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginTop: 16 }}>
        <Saida rotulo="VGV simulado" valor={fmt(p.vgvProjetado)} />
        <Saida rotulo="Sua comissão" valor={fmt(p.comissaoProjetada)} destaque />
        {metaVgv > 0 && <Saida rotulo="Fecha o mês em" valor={p.percentualDaMeta + '% da meta'} />}
      </div>

      {metaVgv > 0 && (
        <p style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, lineHeight: 1.5,
          color: p.bate ? D.green : D.ink, margin: '12px 0 0', fontWeight: 600,
        }}>
          {p.bate ? <Check size={14} aria-hidden /> : <TrendingUp size={14} aria-hidden />}
          {p.bate
            ? 'Nesse cenário a meta do mês está batida.'
            : p.vendasFaltantes > 0
              ? `Faltam ${fmt(p.faltaVgv)} — ${p.vendasFaltantes} venda(s) de ${fmt(ticket)}.`
              : `Faltam ${fmt(p.faltaVgv)} para a meta.`}
        </p>
      )}
    </section>
  )
}

function Controle({ rotulo, valor, min, max, passo, atual, onChange }: {
  rotulo: string; valor: string; min: number; max: number; passo: number
  atual: number; onChange: (v: number) => void
}) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{rotulo}</span>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: D.ink }}>{valor}</span>
      </span>
      <input
        type="range" min={min} max={max} step={passo} value={Math.min(max, Math.max(min, atual))}
        onChange={(e) => onChange(Number(e.target.value))}
        // accentColor deixa o range com a cor da marca sem reimplementar o
        // controle — e o nativo é o que funciona bem no toque.
        style={{ width: '100%', accentColor: D.bronze, height: 28 }}
      />
    </label>
  )
}

function Saida({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div style={{ background: destaque ? 'rgba(210,78,34,0.08)' : D.bg, borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ fontSize: 10.5, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{rotulo}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: destaque ? D.bronze : D.ink, marginTop: 2 }}>{valor}</div>
    </div>
  )
}
