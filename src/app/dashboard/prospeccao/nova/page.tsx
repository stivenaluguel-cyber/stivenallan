'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512', bronze: '#D24E22',
  muted: '#6B655B', line: 'rgba(26,24,21,0.08)', green: '#22c55e',
}

type Icp = { alvo: string; abordagem: string; estrategia: string; criterios: string[]; queries_busca: string[] }
type Campanha = Icp & { id: string; nome: string }

const QUANTIDADES = [10, 20, 30, 50]

const campoStyle: React.CSSProperties = {
  width: '100%', border: '1.5px solid ' + D.line, borderRadius: 8, padding: '10px 12px',
  fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 700, color: D.ink, marginBottom: 6 }
const ajudaStyle: React.CSSProperties = { fontSize: 11.5, color: D.muted, margin: '4px 0 8px' }

export default function NovaProspeccaoPage() {
  const router = useRouter()

  const [produto, setProduto] = useState('')
  const [publico, setPublico] = useState('')
  const [problema, setProblema] = useState('')
  const [localizacao, setLocalizacao] = useState('')
  const [exemplos, setExemplos] = useState('')

  const [analisando, setAnalisando] = useState(false)
  const [erro, setErro] = useState('')
  const [campanha, setCampanha] = useState<Campanha | null>(null)
  const [quantidade, setQuantidade] = useState(20)
  const [garimpando, setGarimpando] = useState(false)

  async function analisar() {
    if (!produto.trim() || analisando) return
    setAnalisando(true); setErro('')
    try {
      const res = await fetch('/api/admin/prospeccao/campanhas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produto: produto.trim(),
          publico: publico.trim() || undefined,
          problema: problema.trim() || undefined,
          localizacao: localizacao.trim() || undefined,
          exemplos: exemplos.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Falha ao analisar com a IA.'); return }
      setCampanha(data.campanha)
    } catch {
      setErro('Falha ao conectar.')
    } finally {
      setAnalisando(false)
    }
  }

  async function garimpar() {
    if (!campanha || garimpando) return
    setGarimpando(true); setErro('')
    try {
      const res = await fetch('/api/admin/prospeccao/campanhas/' + campanha.id + '/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidade }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Falha ao garimpar.'); return }
      router.push('/dashboard/prospeccao/' + campanha.id)
    } catch {
      setErro('Falha ao conectar.')
    } finally {
      setGarimpando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: D.bg, padding: '24px 20px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <button
          onClick={() => (campanha ? setCampanha(null) : router.push('/dashboard/prospeccao'))}
          style={{ background: 'none', border: 'none', color: D.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '4px 0', marginBottom: 8 }}
        >
          ← Voltar
        </button>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: D.ink }}>Nova campanha de prospecção</h1>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: D.muted }}>
          Conte o que você vende — a IA monta o perfil de cliente ideal e as buscas no Google Maps.
        </p>

        {erro && (
          <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
            {erro}
          </div>
        )}

        {!campanha ? (
          <div style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>O que você faz ou vende? *</label>
              <textarea value={produto} onChange={(e) => setProduto(e.target.value)} rows={2} placeholder="Ex: Apartamento na planta como investimento, com financiamento direto da construtora." style={campoStyle} />
            </div>
            <div>
              <label style={labelStyle}>Quem costuma fechar negócio com você?</label>
              <p style={ajudaStyle}>Opcional — a IA infere a partir do produto se deixar em branco.</p>
              <input value={publico} onChange={(e) => setPublico(e.target.value)} placeholder="Ex: Donos de empresas de médio porte." style={campoStyle} />
            </div>
            <div>
              <label style={labelStyle}>Qual problema você resolve pra esse cliente?</label>
              <p style={ajudaStyle}>Opcional.</p>
              <input value={problema} onChange={(e) => setProblema(e.target.value)} placeholder="Ex: Proteger capital em ativo real, sem depender de banco." style={campoStyle} />
            </div>
            <div>
              <label style={labelStyle}>Onde buscar?</label>
              <p style={ajudaStyle}>Cidade, estado ou região. Deixe em branco pra buscar no Brasil inteiro.</p>
              <input value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} placeholder="Ex: Criciúma, SC" style={campoStyle} />
            </div>
            <div>
              <label style={labelStyle}>Clientes que já fecharam com você</label>
              <p style={ajudaStyle}>Opcional — 1 ou 2 exemplos ajudam a IA a calibrar o perfil.</p>
              <input value={exemplos} onChange={(e) => setExemplos(e.target.value)} placeholder="Ex: Empresa X, Empresa Y" style={campoStyle} />
            </div>
            <button
              onClick={analisar}
              disabled={!produto.trim() || analisando}
              style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 20px', fontWeight: 700, fontSize: 14, cursor: (!produto.trim() || analisando) ? 'default' : 'pointer', opacity: (!produto.trim() || analisando) ? 0.5 : 1 }}
            >
              {analisando ? 'Analisando com IA...' : 'Analisar com IA'}
            </button>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: D.bronze, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vamos garimpar</span>
              <h2 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 800, color: D.ink }}>{campanha.nome}</h2>
            </div>

            <CampoResumo titulo="Alvo" texto={campanha.alvo} />
            <CampoResumo titulo="Abordagem" texto={campanha.abordagem} />
            <CampoResumo titulo="Estratégia" texto={campanha.estrategia} />

            {campanha.criterios.length > 0 && (
              <div>
                <span style={labelStyle}>Critérios</span>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: D.ink, lineHeight: 1.7 }}>
                  {campanha.criterios.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}

            <div>
              <span style={labelStyle}>Buscas que vão rodar no Google Maps</span>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: D.muted, lineHeight: 1.7 }}>
                {campanha.queries_busca.map((q, i) => <li key={i}>{q}</li>)}
              </ul>
            </div>

            <div>
              <span style={labelStyle}>Quantos leads agora?</span>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                {QUANTIDADES.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuantidade(q)}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      border: '1.5px solid ' + (quantidade === q ? D.green : D.line),
                      background: quantidade === q ? D.green + '18' : '#fff',
                      color: quantidade === q ? D.green : D.ink,
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={garimpar}
              disabled={garimpando}
              style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 20px', fontWeight: 700, fontSize: 14, cursor: garimpando ? 'default' : 'pointer', opacity: garimpando ? 0.6 : 1 }}
            >
              {garimpando ? 'Garimpando...' : 'Garimpar ' + quantidade + ' leads'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function CampoResumo({ titulo, texto }: { titulo: string; texto: string }) {
  if (!texto) return null
  return (
    <div>
      <span style={labelStyle}>{titulo}</span>
      <p style={{ margin: 0, fontSize: 13.5, color: D.ink, lineHeight: 1.5 }}>{texto}</p>
    </div>
  )
}
