'use client'
import { useCallback, useEffect, useState } from 'react'
import { validarCompetencia, validarValor, validarNumero } from '@/lib/notas-fiscais/validacao'

type NotaComUrl = { id: string; competencia: string; numero: string; valor: number; url: string | null }
type MesRegua = { competencia: string; notas: NotaComUrl[]; pendente: boolean }
type Resumo = { totalAnoCorrente: number; mesesPendentes: number }
type Resposta = { regua: MesRegua[]; resumo: Resumo; contaNova: boolean }

const fmtMoeda = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })

function labelCompetencia(competencia: string): string {
  const rotulo = new Date(competencia + 'T12:00:00Z').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  return rotulo.charAt(0).toUpperCase() + rotulo.slice(1)
}

export function NotasFiscais() {
  const [dados, setDados] = useState<Resposta | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [formAberto, setFormAberto] = useState(false)
  const [competencia, setCompetencia] = useState('')
  const [numero, setNumero] = useState('')
  const [valor, setValor] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [erroForm, setErroForm] = useState('')
  const [salvando, setSalvando] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch('/api/admin/notas-fiscais')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar notas fiscais')
      setDados(json)
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar notas fiscais')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  function validarForm(): string | null {
    const vc = validarCompetencia(competencia)
    if (!vc.ok) return vc.erro
    const vn = validarNumero(numero)
    if (!vn.ok) return vn.erro
    const vv = validarValor(Number(valor))
    if (!vv.ok) return vv.erro
    if (!arquivo) return 'Selecione o PDF da nota.'
    if (arquivo.type !== 'application/pdf') return 'Envie um arquivo PDF.'
    if (arquivo.size > 10 * 1024 * 1024) return 'Arquivo muito grande — máximo de 10MB.'
    return null
  }

  async function salvar() {
    const erroValidacao = validarForm()
    if (erroValidacao) { setErroForm(erroValidacao); return }

    setSalvando(true)
    setErroForm('')
    try {
      const form = new FormData()
      form.set('competencia', competencia)
      form.set('numero', numero)
      form.set('valor', valor)
      form.set('arquivo', arquivo as File)

      const res = await fetch('/api/admin/notas-fiscais', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao salvar')

      setCompetencia(''); setNumero(''); setValor(''); setArquivo(null)
      setFormAberto(false)
      await carregar()
    } catch (e) {
      setErroForm(e instanceof Error ? e.message : 'Falha ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return <div style={{ height: 220, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, marginBottom: '1.5rem' }} />
  }

  if (erro) {
    return (
      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#991B1B' }}>{erro}</p>
        <button onClick={carregar} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          Tentar de novo
        </button>
      </div>
    )
  }

  if (!dados) return null

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', borderTop: '3px solid #D24E22' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: dados.contaNova ? 8 : 16 }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>Notas Fiscais</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Controle mensal — meses sem nota ficam visíveis como pendentes.</p>
        </div>
        <button
          onClick={() => setFormAberto((v) => !v)}
          style={{ background: '#D24E22', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', minHeight: 40 }}
        >
          {formAberto ? 'Cancelar' : '+ Registrar nota'}
        </button>
      </div>

      {formAberto && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem', marginBottom: 16, display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', alignItems: 'end' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
            Competência
            <input type="month" value={competencia} onChange={(e) => setCompetencia(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 7, border: '1.5px solid #e5e7eb', fontSize: 13.5 }} />
          </label>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
            Número
            <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="NF-001"
              style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 7, border: '1.5px solid #e5e7eb', fontSize: 13.5, boxSizing: 'border-box' }} />
          </label>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
            Valor (R$)
            <input type="number" min={0.01} step={0.01} value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00"
              style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 7, border: '1.5px solid #e5e7eb', fontSize: 13.5, boxSizing: 'border-box' }} />
          </label>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
            PDF da nota
            <input type="file" accept="application/pdf" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
              style={{ display: 'block', width: '100%', marginTop: 4, fontSize: 12.5 }} />
          </label>
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={salvar} disabled={salvando}
              style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 700, fontSize: 13.5, cursor: salvando ? 'default' : 'pointer', opacity: salvando ? 0.6 : 1 }}>
              {salvando ? 'Salvando...' : 'Salvar nota'}
            </button>
            {erroForm && <span style={{ fontSize: 12.5, color: '#DC2626' }}>{erroForm}</span>}
          </div>
        </div>
      )}

      {dados.contaNova ? (
        <div style={{ background: '#f9fafb', borderRadius: 8, padding: '1rem', fontSize: 13.5, color: '#4b5563', lineHeight: 1.6 }}>
          Nenhuma nota fiscal registrada ainda. Assim que a primeira for cadastrada, este bloco passa a mostrar
          todos os meses desde então até o mês corrente — inclusive os meses sem nota emitida, marcados como pendentes.
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.75rem', marginBottom: 16 }}>
            <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Emitido este ano</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534' }}>{fmtMoeda(dados.resumo.totalAnoCorrente)}</div>
            </div>
            <div style={{ background: dados.resumo.mesesPendentes > 0 ? '#FEF3C7' : '#f0fdf4', borderRadius: 8, padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: dados.resumo.mesesPendentes > 0 ? '#92400E' : '#166534', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Meses pendentes
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: dados.resumo.mesesPendentes > 0 ? '#92400E' : '#166534' }}>
                {dados.resumo.mesesPendentes}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {dados.regua.map((mes) => (
              <div key={mes.competencia}>
                {mes.pendente ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 14px' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#92400E' }}>{labelCompetencia(mes.competencia)}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pendente</span>
                  </div>
                ) : (
                  mes.notas.map((nota) => (
                    <div key={nota.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', marginBottom: 4 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', minWidth: 140 }}>{labelCompetencia(mes.competencia)}</span>
                      <span style={{ fontSize: 12.5, color: '#6b7280', flex: 1 }}>Nº {nota.numero}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{fmtMoeda(nota.valor)}</span>
                      {nota.url ? (
                        <a href={nota.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: '#D24E22', fontWeight: 700, textDecoration: 'none' }}>
                          Ver PDF
                        </a>
                      ) : (
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>Link indisponível</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
