'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Users, X } from 'lucide-react'
import { STATUS_COMISSAO, calcularDivisao, type StatusComissao } from '@/lib/comissoes/calcular'
import { normalizarParticipantes, ROTULO_PAPEL } from '@/lib/comissoes/participantes'
import { ParcelasComissao } from '@/components/dashboard/ParcelasComissao'
import { ExtratoAnual } from '@/components/dashboard/ExtratoAnual'
import { DivisaoEnvolvidos, linhasParaPayload, type LinhaEnvolvido } from '@/components/dashboard/DivisaoEnvolvidos'

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', sidebar: '#131211', ink: '#161512',
  bronze: '#D24E22', muted: '#6B655B', line: 'rgba(26,24,21,0.08)',
  green: '#16a34a', amber: '#f59e0b', blue: '#3b82f6', red: '#ef4444',
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const STATUS_INFO: Record<StatusComissao, { label: string; cor: string; bg: string }> = {
  prevista: { label: 'Prevista', cor: '#92400E', bg: '#FEF3C7' },
  confirmada: { label: 'Confirmada', cor: '#1E40AF', bg: '#DBEAFE' },
  recebida: { label: 'Recebida', cor: '#166534', bg: '#DCFCE7' },
  cancelada: { label: 'Cancelada', cor: '#6B7280', bg: '#F3F4F6' },
}

type Corretor = { id: string; nome: string; percentual_padrao: number }
type Comissao = {
  id: string; valor_venda: number; valor_comissao: number; percentual_total: number
  percentual_captador: number; status: StatusComissao; data_venda: string | null
  data_recebimento: string | null; observacoes: string | null
  leads?: { nome: string | null; whatsapp: string } | null
  empreendimentos?: { nome: string } | null
  captador?: { id: string; nome: string } | null
  vendedor?: { id: string; nome: string } | null
  participantes?: {
    id: string; corretor_id: string | null; nome: string | null
    papel: string; percentual: number
    corretor?: { id: string; nome: string } | null
  }[] | null
}
type Resumo = { previsto: number; confirmado: number; recebido: number; totalVendas: number; quantidade: number }

export default function ComissoesPage() {
  const [comissoes, setComissoes] = useState<Comissao[]>([])
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const [corretores, setCorretores] = useState<Corretor[]>([])
  const [filtroStatus, setFiltroStatus] = useState<string>('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [modalCorretor, setModalCorretor] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true); setErro('')
    try {
      const params = filtroStatus ? '?status=' + filtroStatus : ''
      const [c, k] = await Promise.all([
        fetch('/api/admin/comissoes' + params).then((r) => r.json()),
        fetch('/api/admin/corretores').then((r) => r.json()),
      ])
      if (c.error) throw new Error(c.error)
      setComissoes(c.data ?? []); setResumo(c.resumo ?? null); setCorretores(k.data ?? [])
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar comissões')
    } finally { setCarregando(false) }
  }, [filtroStatus])

  useEffect(() => { carregar() }, [carregar])

  async function mudarStatus(id: string, status: StatusComissao) {
    try {
      const res = await fetch('/api/admin/comissoes', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      await carregar()
    } catch (e) { setErro(e instanceof Error ? e.message : 'Falha ao atualizar') }
  }

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(20px,2.5vw,36px) clamp(16px,3vw,32px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, margin: 0 }}>Comissões</h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: D.muted }}>Vendas da rede e a divisão da comissão entre os envolvidos.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setModalCorretor(true)} style={btnSec}><Users size={15} /> Corretores</button>
            <button onClick={() => setModalAberto(true)} style={btnPri}><Plus size={15} /> Registrar venda</button>
          </div>
        </div>

        {resumo && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { l: 'Recebido', v: resumo.recebido, c: D.green },
              { l: 'Confirmado', v: resumo.confirmado, c: D.blue },
              { l: 'Previsto', v: resumo.previsto, c: D.amber },
              { l: 'Total em vendas', v: resumo.totalVendas, c: D.ink },
            ].map((k) => (
              <div key={k.l} style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{k.l}</div>
                <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 20, fontWeight: 800, color: k.c }}>{fmt(k.v)}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {['', ...STATUS_COMISSAO].map((s) => (
            <button key={s || 'todos'} onClick={() => setFiltroStatus(s)}
              style={{ ...btnSec, background: filtroStatus === s ? D.bronze : '#fff', color: filtroStatus === s ? '#fff' : D.ink, borderColor: filtroStatus === s ? D.bronze : D.line }}>
              {s ? STATUS_INFO[s as StatusComissao].label : 'Todas'}
            </button>
          ))}
        </div>

        {erro && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#991B1B', fontSize: 13 }}>{erro}</div>
        )}

        {carregando ? (
          <div style={{ height: 200, borderRadius: 12, background: D.surface, border: '1px solid ' + D.line }} />
        ) : comissoes.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: D.muted, margin: '0 0 18px' }}>Nenhuma comissão registrada ainda.</p>
            <button onClick={() => setModalAberto(true)} style={btnPri}><Plus size={15} /> Registrar a primeira venda</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {comissoes.map((c) => {
              const info = STATUS_INFO[c.status]
              const valorCap = c.valor_comissao * (c.percentual_captador / 100)
              const temDivisao = (c.participantes?.length ?? 0) > 0
              return (
                <div key={c.id} style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 12, padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                    <div>
                      <strong style={{ fontSize: 15 }}>{c.empreendimentos?.nome ?? 'Imóvel não informado'}</strong>
                      <div style={{ fontSize: 13, color: D.muted, marginTop: 2 }}>
                        {c.leads?.nome ?? 'Cliente não vinculado'}
                        {c.data_venda && ' · ' + new Date(c.data_venda + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <span style={{ background: info.bg, color: info.cor, borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 700, height: 'fit-content' }}>{info.label}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10, fontSize: 13 }}>
                    <div><span style={lbl}>Venda</span>{fmt(Number(c.valor_venda))}</div>
                    <div><span style={lbl}>Comissão ({c.percentual_total}%)</span><strong>{fmt(Number(c.valor_comissao))}</strong></div>
                    {/* Com divisão detalhada, mostrar também o par
                        captador/vendedor diria duas verdades diferentes sobre
                        o mesmo dinheiro. A detalhada ganha. */}
                    {!temDivisao && c.captador && <div><span style={lbl}>Captador · {c.percentual_captador}%</span>{c.captador.nome} — {fmt(valorCap)}</div>}
                    {!temDivisao && c.vendedor && <div><span style={lbl}>Vendedor · {100 - c.percentual_captador}%</span>{c.vendedor.nome} — {fmt(Number(c.valor_comissao) - valorCap)}</div>}
                    {temDivisao && c.participantes!.map((p) => (
                      <div key={p.id}>
                        <span style={lbl}>{ROTULO_PAPEL[p.papel] ?? p.papel} · {Number(p.percentual)}%</span>
                        {p.corretor?.nome ?? p.nome ?? '—'} — {fmt(Number(c.valor_comissao) * (Number(p.percentual) / 100))}
                      </div>
                    ))}
                  </div>

                  {c.status !== 'cancelada' && c.status !== 'recebida' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                      {c.status === 'prevista' && <button onClick={() => mudarStatus(c.id, 'confirmada')} style={btnSec}>Confirmar</button>}
                      <button onClick={() => mudarStatus(c.id, 'recebida')} style={{ ...btnSec, borderColor: D.green, color: D.green }}>Marcar recebida</button>
                      <button onClick={() => mudarStatus(c.id, 'cancelada')} style={{ ...btnSec, color: D.red, borderColor: D.line }}>Cancelar</button>
                    </div>
                  )}

                  {/* Comissão de financiamento direto raramente cai de uma vez:
                      acompanha o recebimento da incorporadora. */}
                  {c.status !== 'cancelada' && (
                    <details style={{ marginTop: 12, borderTop: '1px solid ' + D.line, paddingTop: 10 }}>
                      <summary style={{ cursor: 'pointer', fontSize: 12.5, fontWeight: 700, color: D.ink, minHeight: 32, display: 'flex', alignItems: 'center' }}>
                        Plano de recebimento
                      </summary>
                      <div style={{ marginTop: 10 }}>
                        <ParcelasComissao
                          comissaoId={c.id}
                          valorComissao={Number(c.valor_comissao)}
                          dataVenda={c.data_venda}
                          onMudou={carregar}
                        />
                      </div>
                    </details>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <ExtratoAnual />
      </div>

      {modalAberto && <ModalVenda corretores={corretores} onFechar={() => setModalAberto(false)} onSalvo={() => { setModalAberto(false); carregar() }} />}
      {modalCorretor && <ModalCorretor onFechar={() => setModalCorretor(false)} onSalvo={() => { setModalCorretor(false); carregar() }} />}
    </div>
  )
}

const btnPri: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#D24E22', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', minHeight: 44 }
const btnSec: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid rgba(26,24,21,0.08)', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#161512', cursor: 'pointer', minHeight: 44 }
const lbl: React.CSSProperties = { display: 'block', fontSize: 10.5, color: '#6B655B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }
const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(26,24,21,0.08)', fontSize: 14, boxSizing: 'border-box', minHeight: 44, color: '#161512' }

function Shell({ titulo, onFechar, children }: { titulo: string; onFechar: () => void; children: React.ReactNode }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={titulo}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}
      onClick={onFechar}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 22, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <strong style={{ fontSize: 17, fontFamily: "'Bricolage Grotesque',system-ui" }}>{titulo}</strong>
          <button onClick={onFechar} aria-label="Fechar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B655B', padding: 8, minHeight: 44, minWidth: 44 }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ModalVenda({ corretores, onFechar, onSalvo }: { corretores: Corretor[]; onFechar: () => void; onSalvo: () => void }) {
  const [valorVenda, setValorVenda] = useState('')
  const [percentualTotal, setPercentualTotal] = useState('6')
  const [captador, setCaptador] = useState('')
  const [vendedor, setVendedor] = useState('')
  const [percCaptador, setPercCaptador] = useState('50')
  const [dataVenda, setDataVenda] = useState(new Date().toISOString().slice(0, 10))
  const [envolvidos, setEnvolvidos] = useState<LinhaEnvolvido[]>([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // Prévia da divisão enquanto o corretor digita — mesma função que o
  // servidor usa, então o que aparece aqui é o que será gravado.
  const previa = useMemo(() => {
    const v = Number(valorVenda.replace(/\./g, '').replace(',', '.')) || 0
    if (v <= 0) return null
    return calcularDivisao({
      valorVenda: v, percentualTotal: Number(percentualTotal) || 0,
      percentualCaptador: Number(percCaptador), temCaptador: !!captador, temVendedor: !!vendedor,
    })
  }, [valorVenda, percentualTotal, percCaptador, captador, vendedor])

  // Divisão inválida trava o salvar: a API recusa de qualquer forma, e deixar
  // o botão ativo só entregaria o erro depois de esperar o round-trip.
  //
  // Guarda a MENSAGEM, não um booleano: com booleano, digitar "abc" na fatia
  // apagava o botão sem dizer por quê — a soma acima de 100% avisa sozinha na
  // caixa de divisão, mas percentual ilegível não tinha aviso nenhum.
  const erroDivisao = useMemo(() => {
    const r = normalizarParticipantes(linhasParaPayload(envolvidos))
    return r.ok ? '' : r.erro
  }, [envolvidos])

  async function salvar() {
    setSalvando(true); setErro('')
    try {
      const res = await fetch('/api/admin/comissoes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor_venda: valorVenda.replace(/\./g, '').replace(',', '.'),
          percentual_total: Number(percentualTotal),
          corretor_captador_id: captador || null,
          corretor_vendedor_id: vendedor || null,
          percentual_captador: Number(percCaptador),
          data_venda: dataVenda,
          participantes: linhasParaPayload(envolvidos),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      onSalvo()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao registrar venda')
    } finally { setSalvando(false) }
  }

  return (
    <Shell titulo="Registrar venda" onFechar={onFechar}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label><span style={lbl}>Valor da venda</span>
          <input value={valorVenda} onChange={(e) => setValorVenda(e.target.value)} placeholder="500.000,00" style={inp} /></label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label><span style={lbl}>Comissão total (%)</span>
            <input type="number" step="0.1" value={percentualTotal} onChange={(e) => setPercentualTotal(e.target.value)} style={inp} /></label>
          <label><span style={lbl}>Data da venda</span>
            <input type="date" value={dataVenda} onChange={(e) => setDataVenda(e.target.value)} style={inp} /></label>
        </div>
        <label><span style={lbl}>Corretor captador</span>
          <select value={captador} onChange={(e) => setCaptador(e.target.value)} style={inp}>
            <option value="">Nenhum</option>
            {corretores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select></label>
        <label><span style={lbl}>Corretor vendedor</span>
          <select value={vendedor} onChange={(e) => setVendedor(e.target.value)} style={inp}>
            <option value="">Nenhum</option>
            {corretores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select></label>
        {captador && vendedor && (
          <label><span style={lbl}>Fatia do captador (%)</span>
            <input type="number" min={0} max={100} value={percCaptador} onChange={(e) => setPercCaptador(e.target.value)} style={inp} /></label>
        )}

        {previa && (
          <div style={{ background: '#F3F2EE', borderRadius: 10, padding: '12px 14px', fontSize: 13 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Comissão: {fmt(previa.valorComissao)}</div>
            {captador && <div>Captador ({previa.percentualCaptador}%): {fmt(previa.valorCaptador)}</div>}
            {vendedor && <div>Vendedor ({previa.percentualVendedor}%): {fmt(previa.valorVendedor)}</div>}
          </div>
        )}

        <DivisaoEnvolvidos
          linhas={envolvidos}
          onChange={setEnvolvidos}
          valorComissao={previa?.valorComissao ?? 0}
          corretores={corretores}
        />

        {(erro || erroDivisao) && <p style={{ color: '#DC2626', fontSize: 13, margin: 0 }}>{erro || erroDivisao}</p>}
        <button onClick={salvar} disabled={salvando || !previa || !!erroDivisao} style={{ ...btnPri, justifyContent: 'center', opacity: salvando || !previa || erroDivisao ? 0.6 : 1 }}>
          {salvando ? 'Salvando...' : 'Registrar venda'}
        </button>
      </div>
    </Shell>
  )
}

function ModalCorretor({ onFechar, onSalvo }: { onFechar: () => void; onSalvo: () => void }) {
  const [nome, setNome] = useState('')
  const [creci, setCreci] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function salvar() {
    setSalvando(true); setErro('')
    try {
      const res = await fetch('/api/admin/corretores', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, creci, whatsapp }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      onSalvo()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao cadastrar corretor')
    } finally { setSalvando(false) }
  }

  return (
    <Shell titulo="Novo corretor parceiro" onFechar={onFechar}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 12.5, color: '#6B655B', margin: 0 }}>
          O parceiro pode receber comissão sem ter login no painel.
        </p>
        <label><span style={lbl}>Nome</span><input value={nome} onChange={(e) => setNome(e.target.value)} style={inp} /></label>
        <label><span style={lbl}>CRECI</span><input value={creci} onChange={(e) => setCreci(e.target.value)} style={inp} /></label>
        <label><span style={lbl}>WhatsApp</span><input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={inp} /></label>
        {erro && <p style={{ color: '#DC2626', fontSize: 13, margin: 0 }}>{erro}</p>}
        <button onClick={salvar} disabled={salvando || !nome.trim()} style={{ ...btnPri, justifyContent: 'center', opacity: salvando || !nome.trim() ? 0.6 : 1 }}>
          {salvando ? 'Salvando...' : 'Cadastrar'}
        </button>
      </div>
    </Shell>
  )
}
