'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Download, FileText, Trash2, Upload } from 'lucide-react'
import { D } from '@/components/dashboard/focus/tokens'
import { formatarTamanho, labelDoTipo, TIPOS_ANEXO, type ChecklistAnalise } from '@/lib/anexos/tipos'

type Anexo = {
  id: string
  tipo: string
  nome_arquivo: string
  mime_type: string | null
  tamanho_bytes: number | null
  created_at: string
  url: string | null
}

/**
 * Documentos do lead.
 *
 * Num CRM comum isso é conveniência. No financiamento direto é a análise de
 * crédito em si — quem aprova é o corretor, não o banco. Por isso o painel
 * abre com o CHECKLIST do que falta, e não com a lista de arquivos: a
 * pergunta que se faz dez vezes por dia é "posso mandar para aprovação?".
 */
export function AnexosLead({ leadId, onMudou }: { leadId: string; onMudou?: () => void }) {
  const [anexos, setAnexos] = useState<Anexo[]>([])
  const [checklist, setChecklist] = useState<ChecklistAnalise | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [tipo, setTipo] = useState<string>('documento_identidade')
  const inputRef = useRef<HTMLInputElement>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch(`/api/admin/anexos?leadId=${leadId}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar documentos')
      setAnexos(json.data ?? [])
      setChecklist(json.checklist ?? null)
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar documentos')
    } finally { setCarregando(false) }
  }, [leadId])

  useEffect(() => { carregar() }, [carregar])

  async function enviar(files: FileList | null) {
    if (!files || files.length === 0) return
    setEnviando(true)
    try {
      const form = new FormData()
      form.append('leadId', leadId)
      form.append('tipo', tipo)
      for (const f of Array.from(files)) form.append('files', f)

      const res = await fetch('/api/admin/anexos', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao enviar')
      // Erro parcial: alguns arquivos subiram e outros não. Mostrar só o
      // sucesso esconderia do corretor que faltou documento.
      setErro(json.erros ? json.erros.join(' · ') : '')
      await carregar()
      onMudou?.()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao enviar')
    } finally {
      setEnviando(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function excluir(id: string, nome: string) {
    if (!confirm(`Excluir "${nome}"? O arquivo é apagado definitivamente.`)) return
    try {
      const res = await fetch(`/api/admin/anexos?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Falha ao excluir')
      await carregar()
      onMudou?.()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao excluir')
    }
  }

  return (
    <div>
      {checklist && (
        <div style={{
          background: checklist.completo ? 'rgba(34,197,94,0.10)' : D.bg,
          border: '1px solid ' + (checklist.completo ? 'rgba(34,197,94,0.35)' : D.line),
          borderRadius: 10, padding: '10px 12px', marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <strong style={{ fontSize: 12, color: D.ink }}>Análise de crédito</strong>
            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: checklist.completo ? D.green : D.muted }}>
              {checklist.entregues}/{checklist.total}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {checklist.itens.map((i) => (
              <span key={i.chave} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 10.5, padding: '3px 8px', borderRadius: 999,
                background: i.entregue ? 'rgba(34,197,94,0.16)' : '#fff',
                color: i.entregue ? '#15803d' : D.muted,
                border: '1px solid ' + (i.entregue ? 'transparent' : D.line),
                textDecoration: 'none',
              }}>
                {i.entregue && <Check size={11} aria-hidden />}
                {i.label}
              </span>
            ))}
          </div>
          {checklist.completo && (
            <p style={{ margin: '7px 0 0', fontSize: 11.5, color: '#15803d', fontWeight: 600 }}>
              Documentação completa — dá para mandar para aprovação.
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Tipo de documento"
          style={{ border: '1px solid ' + D.line, borderRadius: 8, padding: '9px 10px', fontSize: 12.5, background: '#fff', color: D.ink, minHeight: 40 }}>
          {TIPOS_ANEXO.map((t) => <option key={t.chave} value={t.chave}>{t.label}</option>)}
        </select>

        <input ref={inputRef} type="file" multiple onChange={(e) => enviar(e.target.files)}
          accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx"
          style={{ display: 'none' }} id={'anexo-' + leadId} />
        <label htmlFor={'anexo-' + leadId}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, background: D.bronze, color: '#fff',
            borderRadius: 8, padding: '9px 14px', fontSize: 12.5, fontWeight: 700,
            cursor: enviando ? 'wait' : 'pointer', minHeight: 40, opacity: enviando ? 0.6 : 1,
          }}>
          <Upload size={14} aria-hidden />
          {enviando ? 'Enviando…' : 'Enviar documento'}
        </label>
      </div>

      {erro && (
        <p role="alert" style={{ fontSize: 12, color: D.red, background: 'rgba(239,68,68,0.08)', padding: '8px 10px', borderRadius: 8, margin: '0 0 10px' }}>
          {erro}
        </p>
      )}

      {carregando ? (
        <p style={{ fontSize: 12, color: D.muted }}>Carregando…</p>
      ) : anexos.length === 0 ? (
        <p style={{ fontSize: 12, color: D.muted, margin: 0 }}>Nenhum documento enviado ainda.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
          {anexos.map((a) => (
            <li key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: '1px solid ' + D.line, borderRadius: 8, padding: '8px 10px' }}>
              <FileText size={15} color={D.muted} aria-hidden />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: D.ink, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.nome_arquivo}
                </div>
                <div style={{ fontSize: 10.5, color: D.muted }}>
                  {labelDoTipo(a.tipo)} · {formatarTamanho(a.tamanho_bytes)} · {new Date(a.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
              {/* O link é assinado e vale poucos minutos: documento pessoal de
                  comprador não pode ficar atrás de URL pública permanente. */}
              {a.url && (
                <a href={a.url} target="_blank" rel="noopener noreferrer" aria-label={'Abrir ' + a.nome_arquivo}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, color: D.ink, border: '1px solid ' + D.line }}>
                  <Download size={14} aria-hidden />
                </a>
              )}
              <button onClick={() => excluir(a.id, a.nome_arquivo)} aria-label={'Excluir ' + a.nome_arquivo}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, background: 'none', border: '1px solid ' + D.line, color: D.red, cursor: 'pointer' }}>
                <Trash2 size={14} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
