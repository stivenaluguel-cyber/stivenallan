'use client'
import { useState } from 'react'
import { TONS, type Sugestao } from '@/lib/dashboard/socio'

const D = {
  bronze: '#D24E22', ink: '#161512', muted: '#6B655B',
  line: 'rgba(26,24,21,0.08)', surface: '#FAFAF7',
}

const CORES_TOM: Record<string, string> = {
  direto: '#3b82f6',
  firme: '#D24E22',
  leve: '#22c55e',
}

/**
 * Segunda opinião na hora de responder o lead: manda a mensagem dele pro
 * "Sócio" e recebe três caminhos de resposta.
 *
 * `Usar` só preenche o campo de resposta do painel — quem envia é o corretor,
 * depois de ler. Nenhum botão daqui dispara WhatsApp.
 */
export function SocioResposta({ leadId, onUsar }: { leadId: string; onUsar: (texto: string) => void }) {
  const [aberto, setAberto] = useState(false)
  const [colada, setColada] = useState('')
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([])
  const [base, setBase] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [copiado, setCopiado] = useState<string | null>(null)

  async function gerar() {
    if (carregando) return
    setCarregando(true); setErro(''); setSugestoes([])
    try {
      const res = await fetch('/api/admin/leads/' + leadId + '/sugestoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: colada.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Falha ao gerar sugestões.'); return }
      setSugestoes(data.sugestoes ?? [])
      setBase(data.mensagem_base ?? '')
    } catch {
      setErro('Falha ao conectar.')
    } finally {
      setCarregando(false)
    }
  }

  async function copiar(texto: string, tom: string) {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(tom)
      setTimeout(() => setCopiado((atual) => (atual === tom ? null : atual)), 1800)
    } catch {
      setErro('O navegador bloqueou a cópia — selecione o texto e copie manualmente.')
    }
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        style={{
          background: 'none', border: '1.5px dashed ' + D.line, borderRadius: 8,
          padding: '9px 12px', fontSize: 12.5, fontWeight: 700, color: D.bronze,
          cursor: 'pointer', width: '100%', marginBottom: 8, minHeight: 44,
        }}
      >
        🤝 Pedir 3 respostas ao Sócio
      </button>
    )
  }

  return (
    <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 10, padding: 12, marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong style={{ fontSize: 12.5, color: D.ink }}>🤝 Sócio</strong>
        <button
          onClick={() => setAberto(false)}
          aria-label="Fechar o Sócio"
          style={{ background: 'none', border: 'none', color: D.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '6px 4px' }}
        >
          Fechar
        </button>
      </div>

      <textarea
        value={colada}
        onChange={(e) => setColada(e.target.value)}
        placeholder="Cole aqui o que o lead respondeu. Deixe vazio para usar a última mensagem dele já registrada acima."
        rows={2}
        style={{
          width: '100%', border: '1.5px solid ' + D.line, borderRadius: 8, padding: '8px 10px',
          fontSize: 12.5, outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: 8,
        }}
      />

      <button
        onClick={gerar}
        disabled={carregando}
        style={{
          background: D.bronze, color: '#fff', border: 'none', borderRadius: 8,
          padding: '10px 14px', fontSize: 12.5, fontWeight: 700, cursor: carregando ? 'default' : 'pointer',
          opacity: carregando ? 0.6 : 1, width: '100%', minHeight: 44,
        }}
      >
        {carregando ? 'Pensando...' : 'Gerar 3 respostas'}
      </button>

      {erro && <p role="alert" style={{ fontSize: 12, color: '#dc2626', margin: '8px 0 0' }}>{erro}</p>}

      {base && sugestoes.length > 0 && (
        <p style={{ fontSize: 11.5, color: D.muted, margin: '10px 0 0' }}>
          Respondendo a: <em>&ldquo;{base.slice(0, 120)}{base.length > 120 ? '…' : ''}&rdquo;</em>
        </p>
      )}

      {sugestoes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }} aria-live="polite">
          {sugestoes.map((s) => {
            const meta = TONS.find((t) => t.tom === s.tom)
            const cor = CORES_TOM[s.tom] ?? D.bronze
            return (
              <div key={s.tom} style={{ background: '#fff', border: '1px solid ' + D.line, borderLeft: '3px solid ' + cor, borderRadius: 8, padding: '9px 11px' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: cor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  {meta?.label ?? s.tom}
                  {meta && <span style={{ color: D.muted, fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}> · {meta.descricao}</span>}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: D.ink, whiteSpace: 'pre-wrap' }}>{s.texto}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => onUsar(s.texto)}
                    style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 6, padding: '7px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Usar
                  </button>
                  <button
                    onClick={() => copiar(s.texto, s.tom)}
                    style={{ background: 'none', color: D.muted, border: '1px solid ' + D.line, borderRadius: 6, padding: '7px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                  >
                    {copiado === s.tom ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            )
          })}
          <p style={{ fontSize: 11, color: D.muted, margin: 0 }}>
            Revise antes de enviar — o Sócio não confirma preço, unidade nem prazo.
          </p>
        </div>
      )}
    </div>
  )
}
