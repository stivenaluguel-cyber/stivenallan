'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { UploadCloud, RefreshCw, CheckCircle2 } from 'lucide-react'

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512', bronze: '#D24E22',
  muted: '#6B655B', line: 'rgba(26,24,21,0.08)', green: '#22c55e', red: '#ef4444',
}

type Posicao = 'centro' | 'inferior-direita' | 'inferior-esquerda'

type ConfigMarcaDagua = {
  posicao: Posicao
  opacidade: number
  larguraRelativa: number
  logoUrl: string | null
}

const POSICOES: { chave: Posicao; label: string }[] = [
  { chave: 'inferior-direita', label: 'Inferior direita' },
  { chave: 'inferior-esquerda', label: 'Inferior esquerda' },
  { chave: 'centro', label: 'Centro' },
]

export default function PreferenciasPage() {
  const [config, setConfig] = useState<ConfigMarcaDagua | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [novaLogo, setNovaLogo] = useState<File | null>(null)
  const [posicao, setPosicao] = useState<Posicao>('inferior-direita')
  const [opacidadePct, setOpacidadePct] = useState(60)
  const [larguraPct, setLarguraPct] = useState(25)

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewCarregando, setPreviewCarregando] = useState(false)
  const [erroLogo, setErroLogo] = useState('')

  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  const [regenerando, setRegenerando] = useState(false)
  const [progresso, setProgresso] = useState<{ processados: number; total: number } | null>(null)
  const [erroRegenerar, setErroRegenerar] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const objectUrlAnterior = useRef<string | null>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch('/api/admin/preferencias/marca-dagua')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar preferências')
      setConfig(json)
      setPosicao(json.posicao)
      setOpacidadePct(Math.round(json.opacidade * 100))
      setLarguraPct(Math.round(json.larguraRelativa * 100))
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar preferências')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const gerarPreview = useCallback(async () => {
    if (!novaLogo && !config?.logoUrl) return
    setPreviewCarregando(true)
    setErroLogo('')
    try {
      const form = new FormData()
      if (novaLogo) form.set('logo', novaLogo)
      form.set('posicao', posicao)
      form.set('opacidade', String(opacidadePct / 100))
      form.set('larguraRelativa', String(larguraPct / 100))

      const res = await fetch('/api/admin/preferencias/marca-dagua/preview', { method: 'POST', body: form })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || 'Falha ao gerar prévia')
      }
      const blob = await res.blob()
      if (objectUrlAnterior.current) URL.revokeObjectURL(objectUrlAnterior.current)
      const url = URL.createObjectURL(blob)
      objectUrlAnterior.current = url
      setPreviewUrl(url)
    } catch (e) {
      setErroLogo(e instanceof Error ? e.message : 'Falha ao gerar prévia')
    } finally {
      setPreviewCarregando(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [novaLogo, posicao, opacidadePct, larguraPct, config?.logoUrl])

  // Debounce: gera prévia 400ms depois do último ajuste de slider/logo, não
  // a cada pixel arrastado.
  useEffect(() => {
    const t = setTimeout(() => { gerarPreview() }, 400)
    return () => clearTimeout(t)
  }, [gerarPreview])

  function onEscolherArquivo(file: File | null) {
    setErroLogo('')
    setSalvo(false)
    if (!file) { setNovaLogo(null); return }
    if (file.type !== 'image/png') {
      setErroLogo('A logo precisa ser um PNG com fundo transparente — um JPEG tem fundo sólido, que cobriria a foto.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setErroLogo('Arquivo muito grande — máximo de 2MB.')
      return
    }
    setNovaLogo(file)
  }

  async function salvar() {
    setSalvando(true)
    setErroLogo('')
    try {
      const form = new FormData()
      if (novaLogo) form.set('logo', novaLogo)
      form.set('posicao', posicao)
      form.set('opacidade', String(opacidadePct / 100))
      form.set('larguraRelativa', String(larguraPct / 100))

      const res = await fetch('/api/admin/preferencias/marca-dagua', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao salvar')
      setConfig(json)
      setNovaLogo(null)
      setSalvo(true)
      setTimeout(() => setSalvo(false), 3000)
    } catch (e) {
      setErroLogo(e instanceof Error ? e.message : 'Falha ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  async function regenerar() {
    setRegenerando(true)
    setErroRegenerar('')
    setProgresso({ processados: 0, total: 0 })
    try {
      let offset = 0
      let concluido = false
      while (!concluido) {
        const res = await fetch('/api/admin/preferencias/marca-dagua/regenerar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offset, tamanhoLote: 5 }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Falha ao regenerar')
        setProgresso({ processados: json.processados, total: json.total })
        concluido = json.concluido
        offset = json.proximoOffset
        if (json.total === 0) break
      }
    } catch (e) {
      setErroRegenerar(e instanceof Error ? e.message : 'Falha ao regenerar')
    } finally {
      setRegenerando(false)
    }
  }

  const mostrarPreview = previewUrl && !erroLogo

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(20px,2.5vw,36px) clamp(16px,3vw,32px)' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.4rem,3vw,1.8rem)', fontWeight: 800, margin: 0 }}>
            Preferências
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: D.muted }}>Configurações da sua operação.</p>
        </div>

        {carregando && <div style={{ height: 400, borderRadius: 12, background: D.surface, border: '1px solid ' + D.line }} />}

        {!carregando && erro && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#991B1B' }}>{erro}</p>
            <button onClick={carregar} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', minHeight: 44 }}>
              Tentar de novo
            </button>
          </div>
        )}

        {!carregando && !erro && config && (
          <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '20px 22px' }}>
            <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 17, fontWeight: 800, margin: '0 0 4px' }}>
              Marca d&apos;água nas fotos
            </h2>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: D.muted, lineHeight: 1.5 }}>
              Envie sua logo (PNG com fundo transparente) pra aplicar automaticamente sobre as fotos dos imóveis no momento do upload. O arquivo original nunca é alterado.
            </p>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 auto' }}>
                <label
                  htmlFor="logo-input"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8,
                    width: 160, height: 160, borderRadius: 10, cursor: 'pointer',
                    border: '2px dashed ' + D.line,
                    backgroundImage: 'repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%)',
                    backgroundSize: '16px 16px',
                    backgroundColor: '#fff',
                    overflow: 'hidden',
                  }}
                >
                  {novaLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={URL.createObjectURL(novaLogo)} alt="Nova logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : config.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={config.logoUrl} alt="Logo atual" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <>
                      <UploadCloud size={26} color={D.muted} />
                      <span style={{ fontSize: 11, color: D.muted, textAlign: 'center', padding: '0 8px' }}>Enviar logo (PNG)</span>
                    </>
                  )}
                </label>
                <input
                  ref={fileInputRef}
                  id="logo-input"
                  type="file"
                  accept="image/png"
                  onChange={(e) => onEscolherArquivo(e.target.files?.[0] ?? null)}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ marginTop: 8, width: 160, background: '#fff', border: '1px solid ' + D.line, borderRadius: 8, padding: '8px 10px', fontSize: 12, fontWeight: 700, color: D.ink, cursor: 'pointer', minHeight: 40 }}
                >
                  {config.logoUrl || novaLogo ? 'Trocar logo' : 'Escolher arquivo'}
                </button>
                {erroLogo && <p style={{ margin: '8px 0 0', fontSize: 11.5, color: D.red, maxWidth: 160, lineHeight: 1.4 }}>{erroLogo}</p>}
              </div>

              <div style={{ flex: '1 1 280px', minWidth: 0 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: D.muted, marginBottom: 8 }}>Posição</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  {POSICOES.map((p) => (
                    <button
                      key={p.chave}
                      onClick={() => { setPosicao(p.chave); setSalvo(false) }}
                      style={{
                        padding: '7px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', minHeight: 38,
                        border: '1px solid ' + (posicao === p.chave ? D.bronze : D.line),
                        background: posicao === p.chave ? D.bronze : '#fff',
                        color: posicao === p.chave ? '#fff' : D.ink,
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: D.muted, marginBottom: 6 }}>
                  Opacidade — {opacidadePct}%
                </label>
                <input
                  type="range" min={5} max={100} value={opacidadePct}
                  onChange={(e) => { setOpacidadePct(Number(e.target.value)); setSalvo(false) }}
                  style={{ width: '100%', marginBottom: 16 }}
                />

                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: D.muted, marginBottom: 6 }}>
                  Largura da logo — {larguraPct}% da foto
                </label>
                <input
                  type="range" min={5} max={50} value={larguraPct}
                  onChange={(e) => { setLarguraPct(Number(e.target.value)); setSalvo(false) }}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: D.muted, marginBottom: 8 }}>Prévia</div>
              <div style={{ background: '#000', borderRadius: 10, overflow: 'hidden', aspectRatio: '16/10', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {mostrarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Prévia da marca d'água" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: previewCarregando ? 0.5 : 1, transition: 'opacity .15s' }} />
                ) : (
                  <span style={{ color: '#888', fontSize: 13 }}>{novaLogo || config.logoUrl ? 'Gerando prévia...' : 'Envie uma logo pra ver a prévia'}</span>
                )}
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={salvar}
                disabled={salvando}
                style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 20px', fontSize: 13.5, fontWeight: 700, cursor: salvando ? 'default' : 'pointer', minHeight: 44, opacity: salvando ? 0.6 : 1 }}
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              {salvo && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: D.green, fontSize: 13, fontWeight: 600 }}>
                  <CheckCircle2 size={16} /> Salvo
                </span>
              )}
            </div>

            {config.logoUrl && (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid ' + D.line }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px' }}>Reprocessar fotos existentes</h3>
                <p style={{ margin: '0 0 12px', fontSize: 12.5, color: D.muted, lineHeight: 1.5 }}>
                  Trocou a logo ou ajustou posição/opacidade? Reaplique a marca em todas as fotos já enviadas, a partir dos originais.
                </p>
                <button
                  onClick={regenerar}
                  disabled={regenerando}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid ' + D.line, borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 700, color: D.ink, cursor: regenerando ? 'default' : 'pointer', minHeight: 44, opacity: regenerando ? 0.7 : 1 }}
                >
                  <RefreshCw size={15} className={regenerando ? 'girando' : ''} />
                  {regenerando ? 'Reprocessando...' : 'Reaplicar marca d\'água nas fotos existentes'}
                </button>

                {progresso && (
                  <div style={{ marginTop: 12 }}>
                    <div role="progressbar" aria-valuenow={progresso.total > 0 ? Math.round((progresso.processados / progresso.total) * 100) : 0} aria-valuemin={0} aria-valuemax={100}
                      style={{ height: 8, borderRadius: 999, background: D.line, overflow: 'hidden' }}>
                      <div style={{
                        width: progresso.total > 0 ? `${Math.round((progresso.processados / progresso.total) * 100)}%` : '0%',
                        height: '100%', background: D.bronze, transition: 'width .2s ease',
                      }} />
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: D.muted }}>
                      {progresso.total === 0 ? 'Nenhuma foto pra reprocessar ainda.' : `${progresso.processados} de ${progresso.total} fotos`}
                    </p>
                  </div>
                )}
                {erroRegenerar && <p style={{ margin: '8px 0 0', fontSize: 12.5, color: D.red }}>{erroRegenerar}</p>}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .girando { animation: marca-dagua-spin 1s linear infinite; }
        @keyframes marca-dagua-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
