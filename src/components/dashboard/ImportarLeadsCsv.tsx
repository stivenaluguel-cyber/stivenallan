'use client'
import { useRef, useState } from 'react'
import { AlertTriangle, FileSpreadsheet, Upload } from 'lucide-react'
import { D } from '@/components/dashboard/focus/tokens'

type Plano = {
  simulado?: boolean
  importados?: number
  total: number
  novos: number
  jaExistentes: number
  duplicadasNoArquivo: number
  rejeitadas: { linha: number; motivo: string; conteudo: string }[]
  colunasReconhecidas: Record<string, string>
  colunasIgnoradas: string[]
  amostra: { nome: string | null; whatsapp: string; email: string | null }[]
}

/**
 * Importar leads de planilha.
 *
 * A prévia não é opcional: importar planilha é irreversível na prática, e o
 * corretor precisa ver quantos são novos, quantos já existem e quais linhas
 * foram rejeitadas ANTES de confirmar. Por isso o fluxo é sempre em dois
 * passos — simular e só então gravar.
 */
export function ImportarLeadsCsv({ onImportado }: { onImportado?: () => void }) {
  const [aberto, setAberto] = useState(false)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [plano, setPlano] = useState<Plano | null>(null)
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState('')
  const [concluido, setConcluido] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function limpar() {
    setArquivo(null); setPlano(null); setErro(''); setConcluido(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function enviar(file: File, simular: boolean) {
    setProcessando(true)
    try {
      const form = new FormData()
      form.append('file', file)
      if (simular) form.append('simular', 'true')
      const res = await fetch('/api/admin/leads/importar', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao processar a planilha')
      setErro('')
      if (simular) setPlano(json)
      else { setConcluido(json.importados ?? 0); setPlano(json); onImportado?.() }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao processar a planilha')
    } finally { setProcessando(false) }
  }

  function selecionar(f: File | null) {
    if (!f) return
    setArquivo(f); setConcluido(null)
    enviar(f, true)
  }

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 14px', borderRadius: 8, border: '1px solid ' + D.line, background: '#fff', color: D.ink, fontWeight: 600, fontSize: 13, cursor: 'pointer', minHeight: 42 }}>
        <FileSpreadsheet size={15} aria-hidden /> Importar planilha
      </button>
    )
  }

  return (
    <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <div>
          <strong style={{ fontSize: 14, color: D.ink }}>Importar leads de planilha</strong>
          <p style={{ fontSize: 12, color: D.muted, margin: '3px 0 0' }}>
            CSV com uma coluna de telefone. Aceita &quot;telefone&quot;, &quot;whatsapp&quot;, &quot;celular&quot; ou &quot;contato&quot;.
          </p>
        </div>
        <button onClick={() => { setAberto(false); limpar() }} aria-label="Fechar importação"
          style={{ background: 'none', border: 'none', color: D.muted, cursor: 'pointer', fontSize: 13, minHeight: 34 }}>
          Fechar
        </button>
      </div>

      <input ref={inputRef} id="csv-leads" type="file" accept=".csv,text/csv"
        onChange={(e) => selecionar(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
      <label htmlFor="csv-leads"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 14px', borderRadius: 8, background: '#fff', border: '1px dashed ' + D.line, color: D.ink, fontWeight: 600, fontSize: 13, cursor: 'pointer', minHeight: 42 }}>
        <Upload size={15} aria-hidden />
        {arquivo ? arquivo.name : 'Escolher arquivo CSV'}
      </label>

      {erro && (
        <p role="alert" style={{ fontSize: 12, color: D.red, background: 'rgba(239,68,68,0.08)', padding: '8px 10px', borderRadius: 8, margin: '10px 0 0' }}>
          {erro}
        </p>
      )}

      {processando && <p style={{ fontSize: 12, color: D.muted, margin: '10px 0 0' }}>Processando…</p>}

      {plano && concluido === null && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 10 }}>
            <Numero valor={plano.novos} rotulo="serão importados" cor={D.green} />
            <Numero valor={plano.jaExistentes} rotulo="já estão na base" cor={D.muted} />
            <Numero valor={plano.duplicadasNoArquivo} rotulo="repetidos no arquivo" cor={D.muted} />
            <Numero valor={plano.rejeitadas.length} rotulo="linhas rejeitadas" cor={plano.rejeitadas.length ? D.red : D.muted} />
          </div>

          {/* Quem já está na base não é sobrescrito: uma planilha antiga
              apagaria estágio, anotações e histórico do lead atual. */}
          {plano.jaExistentes > 0 && (
            <p style={{ fontSize: 11.5, color: D.muted, margin: '0 0 10px' }}>
              Os que já existem são pulados — a planilha não sobrescreve o histórico de quem já está no CRM.
            </p>
          )}

          {plano.colunasIgnoradas.length > 0 && (
            <p style={{ fontSize: 11.5, color: D.muted, margin: '0 0 10px' }}>
              Colunas não reconhecidas (não serão importadas): {plano.colunasIgnoradas.join(', ')}
            </p>
          )}

          {plano.rejeitadas.length > 0 && (
            <details style={{ marginBottom: 10 }}>
              <summary style={{ cursor: 'pointer', fontSize: 12, color: D.red, fontWeight: 600, minHeight: 30, display: 'flex', alignItems: 'center', gap: 5 }}>
                <AlertTriangle size={13} aria-hidden /> Ver as {plano.rejeitadas.length} linhas rejeitadas
              </summary>
              <ul style={{ listStyle: 'none', padding: 0, margin: '7px 0 0', display: 'grid', gap: 4, maxHeight: 160, overflowY: 'auto' }}>
                {plano.rejeitadas.map((r) => (
                  <li key={r.linha} style={{ fontSize: 11.5, color: D.muted, background: '#fff', border: '1px solid ' + D.line, borderRadius: 6, padding: '6px 8px' }}>
                    <strong style={{ color: D.ink }}>Linha {r.linha}</strong> — {r.motivo}
                  </li>
                ))}
              </ul>
            </details>
          )}

          {plano.amostra.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: D.muted }}>PRIMEIROS A ENTRAR</span>
              <ul style={{ listStyle: 'none', padding: 0, margin: '5px 0 0', display: 'grid', gap: 3 }}>
                {plano.amostra.map((a, i) => (
                  <li key={i} style={{ fontSize: 12, color: D.ink }}>{a.nome || '(sem nome)'} — {a.whatsapp}</li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={() => arquivo && enviar(arquivo, false)} disabled={processando || plano.novos === 0}
            style={{ background: plano.novos === 0 ? D.line : D.bronze, color: plano.novos === 0 ? D.muted : '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: plano.novos === 0 ? 'not-allowed' : 'pointer', minHeight: 42 }}>
            {plano.novos === 0 ? 'Nada novo para importar' : `Importar ${plano.novos} lead(s)`}
          </button>
        </div>
      )}

      {concluido !== null && (
        <div style={{ marginTop: 12, background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: 8, padding: '10px 12px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#15803d', margin: 0 }}>
            {concluido} lead(s) importado(s), já com score calculado.
          </p>
          <button onClick={limpar} style={{ background: 'none', border: 'none', color: D.bronze, fontWeight: 600, fontSize: 12.5, cursor: 'pointer', padding: '6px 0 0', minHeight: 32 }}>
            Importar outra planilha
          </button>
        </div>
      )}
    </div>
  )
}

function Numero({ valor, rotulo, cor }: { valor: number; rotulo: string; cor: string }) {
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: cor, lineHeight: 1.1 }}>{valor}</div>
      <div style={{ fontSize: 11, color: D.muted }}>{rotulo}</div>
    </div>
  )
}
