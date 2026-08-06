'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

type FotoImovel = {
  id: string
  urls: { original: string; processada: string | null }
}

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 12, padding: 24,
  boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 20,
}
const h2: React.CSSProperties = {
  fontSize: 15, fontWeight: 700, marginBottom: 16, marginTop: 0, color: '#D24E22',
  paddingBottom: 8, borderBottom: '2px solid #FFF3EC',
}

/**
 * Upload de fotos de verdade (arquivo → Supabase Storage), diferente do
 * campo de URL colada de "Imagem Principal" acima. A marca d'água (se
 * configurada em Preferências) é aplicada automaticamente no upload — o
 * original sobe sem alteração, a miniatura aqui mostra a versão processada
 * quando existir.
 */
export function FotosImovel({ propertyId }: { propertyId: string }) {
  const [fotos, setFotos] = useState<FotoImovel[]>([])
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [excluindo, setExcluindo] = useState<string | null>(null)
  const [removendoMarca, setRemovendoMarca] = useState<string | null>(null)
  const [erro, setErro] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch(`/api/admin/empreendimentos/${propertyId}/fotos`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar fotos')
      setFotos(json.data)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar fotos')
    } finally {
      setCarregando(false)
    }
  }, [propertyId])

  useEffect(() => { carregar() }, [carregar])

  async function enviarArquivos(arquivos: FileList | null) {
    if (!arquivos || arquivos.length === 0) return
    setEnviando(true)
    setErro('')
    try {
      const form = new FormData()
      Array.from(arquivos).forEach((f) => form.append('fotos', f))
      const res = await fetch(`/api/admin/empreendimentos/${propertyId}/fotos`, { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao enviar fotos')
      await carregar()
      if (json.erros?.length) setErro(json.erros.join(' · '))
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao enviar fotos')
    } finally {
      setEnviando(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function excluir(fotoId: string) {
    if (!confirm('Excluir esta foto? O arquivo é apagado definitivamente.')) return
    setExcluindo(fotoId)
    setErro('')
    try {
      const res = await fetch(`/api/admin/empreendimentos/${propertyId}/fotos?fotoId=${fotoId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Falha ao excluir')
      setFotos((atual) => atual.filter((f) => f.id !== fotoId))
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao excluir')
    } finally {
      setExcluindo(null)
    }
  }

  async function removerMarca(fotoId: string) {
    if (!confirm('Remover a marca d’água desta foto? A foto continua no ar, só sem a marca.')) return
    setRemovendoMarca(fotoId)
    setErro('')
    try {
      const res = await fetch(`/api/admin/empreendimentos/${propertyId}/fotos?fotoId=${fotoId}`, { method: 'PATCH' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao remover a marca d’água')
      setFotos((atual) => atual.map((f) => (f.id === fotoId ? json.data : f)))
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao remover a marca d’água')
    } finally {
      setRemovendoMarca(null)
    }
  }

  return (
    <div style={card}>
      <h2 style={h2}>📸 Fotos do Imóvel</h2>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px', lineHeight: 1.5 }}>
        Upload de verdade (não é URL colada) — a marca d&apos;água configurada em{' '}
        <a href="/dashboard/preferencias" style={{ color: '#D24E22', fontWeight: 600 }}>Preferências</a>{' '}
        é aplicada automaticamente. O arquivo original fica guardado sem alteração.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => enviarArquivos(e.target.files)}
        disabled={enviando}
        style={{ marginBottom: 16, fontSize: 13 }}
      />
      {enviando && <p style={{ fontSize: 12.5, color: '#6b7280' }}>Enviando e processando...</p>}
      {erro && <p style={{ fontSize: 12.5, color: '#DC2626', margin: '0 0 12px' }}>{erro}</p>}

      {carregando ? (
        <p style={{ fontSize: 13, color: '#6b7280' }}>Carregando...</p>
      ) : fotos.length === 0 ? (
        <p style={{ fontSize: 13, color: '#6b7280' }}>Nenhuma foto enviada ainda.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
          {fotos.map((f) => (
            <div key={f.id} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb', aspectRatio: '4/3', position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.urls.processada ?? f.urls.original}
                alt="Foto do imóvel"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {!f.urls.processada && (
                <span style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 9.5, padding: '2px 6px', borderRadius: 4 }}>
                  sem marca
                </span>
              )}
              {f.urls.processada && (
                <button
                  type="button"
                  onClick={() => removerMarca(f.id)}
                  disabled={removendoMarca === f.id}
                  title="Remover marca d'água desta foto (a foto continua, só sem a marca)"
                  style={{
                    position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.6)', color: '#fff',
                    border: 'none', fontSize: 9.5, padding: '2px 6px', borderRadius: 4,
                    cursor: removendoMarca === f.id ? 'default' : 'pointer', opacity: removendoMarca === f.id ? 0.6 : 1,
                  }}
                >
                  {removendoMarca === f.id ? 'removendo…' : 'remover marca'}
                </button>
              )}
              <button
                type="button"
                onClick={() => excluir(f.id)}
                disabled={excluindo === f.id}
                title="Excluir foto"
                style={{
                  position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', cursor: excluindo === f.id ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, lineHeight: 1,
                  opacity: excluindo === f.id ? 0.5 : 1,
                }}
              >
                {excluindo === f.id ? '…' : '✕'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
