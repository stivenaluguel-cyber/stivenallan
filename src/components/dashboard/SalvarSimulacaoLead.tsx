'use client'
import { useEffect, useRef, useState } from 'react'
import { Check, Save, X } from 'lucide-react'

const D = {
  bronze: '#D24E22', ink: '#161512', muted: '#6B655B',
  line: 'rgba(26,24,21,0.08)', green: '#16a34a', bg: '#F3F2EE',
}

export type DadosSimulacao = {
  empreendimento_slug?: string | null
  empreendimento_nome?: string | null
  valor_imovel: number
  entrada?: number | null
  parcelas_qtd?: number | null
  parcelas_valor?: number | null
  reforcos_qtd?: number | null
  reforcos_valor?: number | null
  chaves_valor?: number | null
  correcao?: string | null
  detalhes?: Record<string, unknown>
}

type Lead = { id: string; nome: string | null; whatsapp: string }

// Salva o cenário no histórico do lead. Sem isto, o corretor mostra a
// parcela ao cliente e, no follow-up seguinte, não tem como retomar o que
// foi apresentado.
export function SalvarSimulacaoLead({ dados }: { dados: DadosSimulacao }) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState<string | null>(null)
  const [erro, setErro] = useState('')
  // Um id por intenção de salvar: retry de rede não duplica a simulação no
  // histórico. Reseta quando o corretor escolhe outro lead.
  const eventIdRef = useRef<string>('')

  useEffect(() => {
    if (!aberto) return
    setCarregando(true)
    fetch('/api/admin/leads?limit=200')
      .then((r) => r.json())
      .then((j) => setLeads(Array.isArray(j.data) ? j.data : []))
      .catch(() => setErro('Não foi possível carregar os leads'))
      .finally(() => setCarregando(false))
  }, [aberto])

  const filtrados = leads
    .filter((l) => {
      const t = busca.trim().toLowerCase()
      if (!t) return true
      return (l.nome ?? '').toLowerCase().includes(t) || l.whatsapp.includes(t)
    })
    .slice(0, 30)

  async function salvar(lead: Lead) {
    if (!eventIdRef.current) eventIdRef.current = crypto.randomUUID()
    setSalvando(true); setErro('')
    try {
      const res = await fetch('/api/admin/simulacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dados, lead_id: lead.id, clientEventId: eventIdRef.current }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao salvar simulação')
      setSalvo(lead.nome || lead.whatsapp)
      eventIdRef.current = ''
      setTimeout(() => { setAberto(false); setSalvo(null) }, 1800)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao salvar simulação')
    } finally {
      setSalvando(false)
    }
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        disabled={!dados.valor_imovel}
        style={{
          padding: '12px 20px', borderRadius: 10, border: '1.5px solid ' + D.line,
          background: '#fff', color: D.ink, fontWeight: 700, fontSize: 14,
          cursor: dados.valor_imovel ? 'pointer' : 'not-allowed', minHeight: 44,
          display: 'inline-flex', alignItems: 'center', gap: 7, opacity: dados.valor_imovel ? 1 : 0.5,
        }}
      >
        <Save size={15} /> Salvar para um lead
      </button>
    )
  }

  return (
    <div style={{ border: '1.5px solid ' + D.line, borderRadius: 12, padding: 16, background: '#fff', minWidth: 280 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <strong style={{ fontSize: 14, color: D.ink }}>Salvar simulação para…</strong>
        <button onClick={() => setAberto(false)} aria-label="Fechar"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: D.muted, padding: 8, minHeight: 44, minWidth: 44 }}>
          <X size={16} />
        </button>
      </div>

      {salvo ? (
        <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 8, color: D.green, fontWeight: 700, fontSize: 14, padding: '10px 0' }}>
          <Check size={17} /> Salvo no histórico de {salvo}
        </div>
      ) : (
        <>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou WhatsApp"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid ' + D.line, fontSize: 14, marginBottom: 10, boxSizing: 'border-box', minHeight: 44, color: D.ink }}
          />
          {erro && <p style={{ color: '#DC2626', fontSize: 12.5, margin: '0 0 8px' }}>{erro}</p>}
          <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {carregando && <span style={{ fontSize: 13, color: D.muted }}>Carregando leads…</span>}
            {!carregando && filtrados.length === 0 && <span style={{ fontSize: 13, color: D.muted }}>Nenhum lead encontrado.</span>}
            {filtrados.map((l) => (
              <button
                key={l.id}
                onClick={() => salvar(l)}
                disabled={salvando}
                style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: '1px solid ' + D.line, background: D.bg, cursor: salvando ? 'default' : 'pointer', fontSize: 13.5, color: D.ink, minHeight: 44, opacity: salvando ? 0.6 : 1 }}
              >
                <strong>{l.nome || 'Sem nome'}</strong>
                <span style={{ color: D.muted, marginLeft: 6, fontSize: 12 }}>{l.whatsapp}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
