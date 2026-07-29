'use client'
import { useCallback, useEffect, useState } from 'react'
import type { StatusUnidade, UnidadePublica } from '@/lib/unidades/espelho'

type Resposta = {
  temEspelho: boolean
  empreendimento?: { nome: string; slug: string }
  exibirPreco: boolean
  resumo: { total: number; disponiveis: number; reservadas: number; vendidas: number; percentualVendido: number } | null
  unidades: UnidadePublica[]
}

// Paleta da página pública (dourado/creme), não a do dashboard.
const P = {
  ouro: '#8a6d3b', creme: '#FBF8F3', linha: '#E8DFD0', tinta: '#2B2620', suave: '#8a8178',
  verde: '#15803d', verdeBg: 'rgba(21,128,61,0.10)',
  ambar: '#b45309', ambarBg: 'rgba(180,83,9,0.10)',
  vermelho: '#9f1239', vermelhoBg: 'rgba(159,18,57,0.08)',
}

const ESTILO: Record<StatusUnidade, { bg: string; cor: string; borda: string; label: string }> = {
  disponivel: { bg: P.verdeBg, cor: P.verde, borda: 'rgba(21,128,61,0.35)', label: 'Disponível' },
  reservada: { bg: P.ambarBg, cor: P.ambar, borda: 'rgba(180,83,9,0.35)', label: 'Reservada' },
  vendida: { bg: P.vermelhoBg, cor: P.vermelho, borda: 'rgba(159,18,57,0.25)', label: 'Vendida' },
}

const brl = (n: number) => 'R$ ' + Math.round(n).toLocaleString('pt-BR')

/**
 * Espelho de vendas na página pública.
 *
 * É o diferencial que nenhum concorrente da região oferece: o comprador vê a
 * disponibilidade real ANTES de falar com alguém, e reserva a unidade ali
 * mesmo. Some inteiro quando o empreendimento não tem unidades cadastradas —
 * a maioria dos imóveis não tem, e uma seção vazia sugeriria estoque zerado.
 */
export function EspelhoPublico({ slug }: { slug: string }) {
  const [dados, setDados] = useState<Resposta | null>(null)
  const [escolhida, setEscolhida] = useState<UnidadePublica | null>(null)

  const carregar = useCallback(async () => {
    try {
      const res = await fetch(`/api/espelho/${slug}`, { cache: 'no-store' })
      if (!res.ok) return
      setDados(await res.json())
    } catch {
      // Silencioso de propósito: é uma seção OPCIONAL da página. Um erro aqui
      // não pode poluir a página de venda com aviso técnico.
    }
  }, [slug])

  useEffect(() => { carregar() }, [carregar])

  if (!dados?.temEspelho || !dados.resumo) return null

  // Agrupa por andar no cliente (o payload público já vem com `andar`).
  const porAndar = new Map<number | null, UnidadePublica[]>()
  for (const u of dados.unidades) {
    const k = u.andar
    if (!porAndar.has(k)) porAndar.set(k, [])
    porAndar.get(k)!.push(u)
  }
  const andares = [...porAndar.entries()]
    .sort(([a], [b]) => (b ?? -1) - (a ?? -1))
    .map(([andar, us]) => ({ andar, us: us.sort((x, y) => x.unidade.localeCompare(y.unidade, 'pt-BR', { numeric: true })) }))

  return (
    <section id="espelho" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 48px' }}>
      <div style={{ borderTop: '1px solid ' + P.linha, paddingTop: 32 }}>
        <h2 style={{ fontSize: 'clamp(1.3rem,3vw,1.7rem)', color: P.tinta, margin: 0, fontWeight: 700 }}>
          Disponibilidade das unidades
        </h2>
        <p style={{ fontSize: 15, color: P.suave, margin: '8px 0 0', maxWidth: '62ch', lineHeight: 1.55 }}>
          {dados.resumo.disponiveis} de {dados.resumo.total} unidades disponíveis agora. Você pode reservar
          pelo site e garantir a unidade por 48 horas, sem compromisso e sem pagar nada.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '18px 0 22px' }}>
          {(['disponivel', 'reservada', 'vendida'] as StatusUnidade[]).map((k) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: P.suave }}>
              <span aria-hidden style={{ width: 12, height: 12, borderRadius: 3, background: ESTILO[k].bg, border: '1px solid ' + ESTILO[k].borda }} />
              {ESTILO[k].label}
            </span>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {andares.map(({ andar, us }) => (
            <div key={String(andar)} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ width: 62, flexShrink: 0, fontSize: 13, fontWeight: 700, color: P.suave, paddingTop: 14, textAlign: 'right' }}>
                {andar === null ? 'Térreo' : `${andar}º`}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, flex: 1 }}>
                {us.map((u) => {
                  const e = ESTILO[u.status]
                  const livre = u.status === 'disponivel'
                  return (
                    <button
                      key={u.id}
                      onClick={() => livre && setEscolhida(u)}
                      disabled={!livre}
                      aria-label={`Unidade ${u.unidade}, ${u.metragem} metros quadrados, ${e.label}`}
                      style={{
                        minWidth: 104, minHeight: 66, borderRadius: 10, padding: '8px 10px',
                        background: e.bg, border: '1px solid ' + e.borda, color: e.cor,
                        cursor: livre ? 'pointer' : 'not-allowed', opacity: livre ? 1 : 0.62,
                        textAlign: 'left', font: 'inherit',
                      }}>
                      <div style={{ fontSize: 15, fontWeight: 800 }}>{u.unidade}</div>
                      <div style={{ fontSize: 11 }}>{u.metragem}m²{u.dormitorios ? ` · ${u.dormitorios} qtos` : ''}</div>
                      {u.preco?.valor && <div style={{ fontSize: 11, fontWeight: 700, marginTop: 1 }}>{brl(u.preco.valor)}</div>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13, color: P.suave, margin: '18px 0 0' }}>
          Valores e disponibilidade sujeitos a confirmação com a construtora.
          {!dados.exibirPreco && ' Preços sob consulta.'}
        </p>
      </div>

      {escolhida && (
        <ModalReserva
          unidade={escolhida}
          empreendimento={dados.empreendimento?.nome ?? ''}
          onFechar={() => setEscolhida(null)}
          onReservado={() => { setEscolhida(null); carregar() }}
        />
      )}
    </section>
  )
}

function ModalReserva({ unidade, empreendimento, onFechar, onReservado }: {
  unidade: UnidadePublica
  empreendimento: string
  onFechar: () => void
  onReservado: () => void
}) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [pronto, setPronto] = useState<{ unidade: string; horas: number } | null>(null)

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    try {
      const res = await fetch('/api/espelho/reservar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unidade_id: unidade.id, nome, telefone }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Não foi possível reservar')
      setPronto({ unidade: json.unidade, horas: json.horas })
      setErro('')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível reservar')
    } finally { setEnviando(false) }
  }

  const rotulo = [unidade.bloco, unidade.unidade].filter(Boolean).join(' ')

  return (
    <div onClick={(ev) => { if (ev.target === ev.currentTarget) onFechar() }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 420, padding: 24 }}>
        {pronto ? (
          <>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: P.tinta, margin: 0 }}>
              Unidade {pronto.unidade} reservada
            </h3>
            <p style={{ fontSize: 15, color: P.suave, margin: '10px 0 0', lineHeight: 1.55 }}>
              Está separada para você por {pronto.horas} horas. Vou entrar em contato pelo WhatsApp
              para apresentar as condições de pagamento.
            </p>
            <button onClick={onReservado}
              style={{ marginTop: 20, width: '100%', minHeight: 48, background: P.ouro, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Fechar
            </button>
          </>
        ) : (
          <form onSubmit={enviar}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: P.tinta, margin: 0 }}>Reservar {rotulo}</h3>
                <p style={{ fontSize: 13.5, color: P.suave, margin: '5px 0 0' }}>
                  {empreendimento} · {unidade.metragem}m²
                  {unidade.preco?.valor ? ` · ${brl(unidade.preco.valor)}` : ''}
                </p>
              </div>
              <button type="button" onClick={onFechar} aria-label="Fechar"
                style={{ background: 'none', border: 'none', fontSize: 24, lineHeight: 1, color: P.suave, cursor: 'pointer', minHeight: 40, minWidth: 40 }}>×</button>
            </div>

            <p style={{ fontSize: 13.5, color: P.suave, margin: '14px 0 16px', lineHeight: 1.5 }}>
              Reserva sem custo e sem compromisso, válida por 48 horas.
            </p>

            <label style={rot}>
              Seu nome
              <input value={nome} onChange={(e) => setNome(e.target.value)} required autoComplete="name" style={inp} />
            </label>
            <label style={{ ...rot, marginTop: 12 }}>
              WhatsApp com DDD
              <input value={telefone} onChange={(e) => setTelefone(e.target.value)} required
                inputMode="tel" autoComplete="tel" placeholder="(48) 99999-8888" style={inp} />
            </label>

            {/* Honeypot: campo invisível ao humano, irresistível ao bot.
                Mesmo mecanismo do formulário de contato do site. */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} />

            {erro && (
              <p role="alert" style={{ fontSize: 13.5, color: P.vermelho, background: P.vermelhoBg, padding: '9px 11px', borderRadius: 8, margin: '14px 0 0' }}>
                {erro}
              </p>
            )}

            <button type="submit" disabled={enviando}
              style={{ marginTop: 18, width: '100%', minHeight: 50, background: P.ouro, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15.5, fontWeight: 700, cursor: enviando ? 'wait' : 'pointer', opacity: enviando ? 0.7 : 1 }}>
              {enviando ? 'Reservando…' : 'Reservar por 48 horas'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const rot: React.CSSProperties = { display: 'grid', gap: 5, fontSize: 13, fontWeight: 600, color: P.tinta }
const inp: React.CSSProperties = {
  border: '1.5px solid ' + P.linha, borderRadius: 9, padding: '12px 13px',
  fontSize: 16, color: P.tinta, background: P.creme, minHeight: 48, width: '100%',
  boxSizing: 'border-box', fontFamily: 'inherit',
}
