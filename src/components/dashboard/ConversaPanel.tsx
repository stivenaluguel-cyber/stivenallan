'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

type Mensagem = {
  id: string
  direcao: 'entrada' | 'saida'
  mensagem: string
  processado_por_ia: boolean
  created_at: string
}

const D = {
  bronze: '#D24E22', muted: '#6B655B', line: 'rgba(26,24,21,0.08)',
  bubbleEntrada: '#F3F2EE', bubbleIA: '#D24E22', bubbleHumano: '#3b82f6',
}

export function ConversaPanel({ leadId }: { leadId: string }) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [pausado, setPausado] = useState(false)
  const [loading, setLoading] = useState(true)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const fimRef = useRef<HTMLDivElement>(null)

  const carregar = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/leads/' + leadId + '/mensagens')
      const data = await res.json()
      setMensagens(data.data ?? [])
      setPausado(!!data.atendimento_humano_ativo)
    } finally {
      setLoading(false)
    }
  }, [leadId])

  useEffect(() => { carregar() }, [carregar])
  useEffect(() => { fimRef.current?.scrollIntoView({ block: 'nearest' }) }, [mensagens])

  async function enviar() {
    if (!texto.trim() || enviando) return
    setEnviando(true); setErro('')
    try {
      const res = await fetch('/api/admin/leads/' + leadId + '/mensagens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: texto.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Falha ao enviar.'); return }
      setTexto('')
      await carregar()
    } catch {
      setErro('Falha ao conectar.')
    } finally {
      setEnviando(false)
    }
  }

  async function reativarIA() {
    await fetch('/api/admin/leads/' + leadId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ atendimento_humano_ativo: false }),
    })
    setPausado(false)
  }

  if (loading) return <p style={{ fontSize: 13, color: D.muted }}>Carregando conversa...</p>

  return (
    <div>
      {pausado && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 600 }}>🤖 Bot pausado — você está atendendo manualmente</span>
          <button onClick={reativarIA} style={{ background: 'none', border: 'none', color: D.bronze, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Reativar IA</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto', padding: '4px 2px', marginBottom: 10 }}>
        {mensagens.length === 0 ? (
          <p style={{ fontSize: 13, color: D.muted, margin: 0 }}>Nenhuma mensagem de WhatsApp registrada ainda.</p>
        ) : (
          mensagens.map((m) => {
            const isEntrada = m.direcao === 'entrada'
            const cor = isEntrada ? D.bubbleEntrada : (m.processado_por_ia ? D.bubbleIA : D.bubbleHumano)
            const textoCor = isEntrada ? '#161512' : '#fff'
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: isEntrada ? 'flex-start' : 'flex-end' }}>
                <div style={{ maxWidth: '78%', background: cor, color: textoCor, borderRadius: 12, padding: '8px 12px' }}>
                  {!isEntrada && (
                    <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {m.processado_por_ia ? 'IA' : 'Você'}
                    </div>
                  )}
                  <div style={{ fontSize: 13, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{m.mensagem}</div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>{new Date(m.created_at).toLocaleString('pt-BR')}</div>
                </div>
              </div>
            )
          })
        )}
        <div ref={fimRef} />
      </div>

      {erro && <p style={{ fontSize: 12, color: '#dc2626', margin: '0 0 8px' }}>{erro}</p>}

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') enviar() }}
          placeholder="Responder pelo WhatsApp..."
          style={{ flex: 1, border: '1.5px solid ' + D.line, borderRadius: 8, padding: '9px 11px', fontSize: 13, outline: 'none' }}
        />
        <button
          onClick={enviar}
          disabled={enviando || !texto.trim()}
          style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '0 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: (enviando || !texto.trim()) ? 0.5 : 1, whiteSpace: 'nowrap' }}
        >
          {enviando ? '...' : 'Enviar'}
        </button>
      </div>
    </div>
  )
}
