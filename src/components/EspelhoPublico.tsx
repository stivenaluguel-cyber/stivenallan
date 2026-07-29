'use client'
import { useCallback, useEffect, useState } from 'react'
import type { StatusUnidade, UnidadePublica } from '@/lib/unidades/espelho'
import { faixaDeEntrada, simular } from '@/lib/unidades/simular'

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
                  // Vendida não abre. Reservada abre: a reserva dura 48h e pode
                  // cair, e o cliente ainda pode pedir a simulação para ficar
                  // na fila daquela unidade.
                  const abre = u.status !== 'vendida'
                  return (
                    <button
                      key={u.id}
                      onClick={() => abre && setEscolhida(u)}
                      disabled={!abre}
                      aria-label={`Unidade ${u.unidade}, ${u.metragem} metros quadrados, ${e.label}`}
                      style={{
                        minWidth: 104, minHeight: 66, borderRadius: 10, padding: '8px 10px',
                        background: e.bg, border: '1px solid ' + e.borda, color: e.cor,
                        cursor: abre ? 'pointer' : 'not-allowed', opacity: abre ? 1 : 0.62,
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
        <ModalUnidade
          unidade={escolhida}
          empreendimento={dados.empreendimento?.nome ?? ''}
          onFechar={() => setEscolhida(null)}
          onConcluido={() => { setEscolhida(null); carregar() }}
        />
      )}
    </section>
  )
}

function ModalUnidade({ unidade, empreendimento, onFechar, onConcluido }: {
  unidade: UnidadePublica
  empreendimento: string
  onFechar: () => void
  onConcluido: () => void
}) {
  const plano = unidade.plano
  const total = unidade.preco?.valor ?? 0
  const faixa = plano ? faixaDeEntrada(plano) : null

  const [entrada, setEntrada] = useState<number | null>(null)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [acao, setAcao] = useState<'simular' | 'reservar' | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [pronto, setPronto] = useState<{ tipo: 'simular' | 'reservar'; unidade: string; horas?: number } | null>(null)

  // Simula localmente enquanto o cliente arrasta — a mesma função pura que o
  // servidor usa, então o número na tela é o número que fica gravado.
  const sim = plano && total > 0 ? simular(total, plano, entrada) : null

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!acao) return
    setEnviando(true)
    try {
      const rota = acao === 'reservar' ? '/api/espelho/reservar' : '/api/espelho/simular'
      const res = await fetch(rota, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unidade_id: unidade.id, nome, telefone, entrada: entrada ?? undefined }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Não foi possível concluir')
      setPronto({ tipo: acao, unidade: json.unidade, horas: json.horas })
      setErro('')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível concluir')
    } finally { setEnviando(false) }
  }

  const rotulo = [unidade.bloco, unidade.unidade].filter(Boolean).join(' ')

  return (
    <div onClick={(ev) => { if (ev.target === ev.currentTarget) onFechar() }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 460, padding: 24, maxHeight: '92vh', overflowY: 'auto' }}>

        {pronto ? (
          <>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: P.tinta, margin: 0 }}>
              {pronto.tipo === 'reservar' ? `Unidade ${pronto.unidade} reservada` : 'Simulação enviada'}
            </h3>
            <p style={{ fontSize: 15, color: P.suave, margin: '10px 0 0', lineHeight: 1.55 }}>
              {pronto.tipo === 'reservar'
                ? `Está separada para você por ${pronto.horas} horas. Vou entrar em contato pelo WhatsApp para apresentar as condições.`
                : `Vou te mandar a simulação da unidade ${pronto.unidade} pelo WhatsApp, com as condições completas.`}
            </p>
            <button onClick={onConcluido}
              style={{ marginTop: 20, width: '100%', minHeight: 48, background: P.ouro, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Fechar
            </button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: P.tinta, margin: 0 }}>Unidade {rotulo}</h3>
                <p style={{ fontSize: 13.5, color: P.suave, margin: '5px 0 0' }}>
                  {empreendimento} · {unidade.metragem}m²
                  {unidade.dormitorios ? ` · ${unidade.dormitorios} quartos` : ''}
                </p>
              </div>
              <button type="button" onClick={onFechar} aria-label="Fechar"
                style={{ background: 'none', border: 'none', fontSize: 24, lineHeight: 1, color: P.suave, cursor: 'pointer', minHeight: 40, minWidth: 40 }}>×</button>
            </div>

            {unidade.preco?.valor && (
              <div style={{ fontSize: 26, fontWeight: 700, color: P.tinta, marginTop: 14 }}>
                {brl(unidade.preco.valor)}
                {unidade.preco.promocional && unidade.preco.de && (
                  <span style={{ fontSize: 15, color: P.suave, fontWeight: 400, marginLeft: 8, textDecoration: 'line-through' }}>
                    {brl(unidade.preco.de)}
                  </span>
                )}
              </div>
            )}

            {sim ? (
              <div style={{ marginTop: 16, background: P.creme, border: '1px solid ' + P.linha, borderRadius: 11, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.ouro, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Como fica o pagamento
                </div>

                <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '9px 14px', margin: '12px 0 0', fontSize: 14 }}>
                  <dt style={{ color: P.suave }}>Entrada</dt>
                  <dd style={{ margin: 0, fontWeight: 700, textAlign: 'right' }}>
                    {brl(sim.entrada)} <span style={{ color: P.suave, fontWeight: 400 }}>({sim.entradaPercentual}%)</span>
                  </dd>

                  <dt style={{ color: P.suave }}>{sim.parcelasQtd} parcelas de</dt>
                  <dd style={{ margin: 0, fontWeight: 700, textAlign: 'right' }}>{brl(sim.parcelaValor)}</dd>

                  {sim.reforcosQtd > 0 && (<>
                    <dt style={{ color: P.suave }}>
                      {sim.reforcosQtd} reforços anuais
                      {/* O múltiplo fica visível: é o teto contratual (5x a
                          parcela) e é o que o cliente confere com o corretor. */}
                      <span style={{ display: 'block', fontSize: 11.5, opacity: 0.85 }}>
                        equivale a {sim.reforcoEmParcelas.toLocaleString('pt-BR')} parcelas
                      </span>
                    </dt>
                    <dd style={{ margin: 0, fontWeight: 700, textAlign: 'right' }}>{brl(sim.reforcoValor)}</dd>
                  </>)}

                  <dt style={{ color: P.suave, borderTop: '1px solid ' + P.linha, paddingTop: 9 }}>Até as chaves</dt>
                  <dd style={{ margin: 0, fontWeight: 700, textAlign: 'right', borderTop: '1px solid ' + P.linha, paddingTop: 9 }}>
                    {brl(sim.ateAsChaves)} <span style={{ color: P.suave, fontWeight: 400 }}>({sim.ateAsChavesPercentual}%)</span>
                  </dd>

                  <dt style={{ color: P.suave }}>Saldo na entrega</dt>
                  <dd style={{ margin: 0, fontWeight: 700, textAlign: 'right' }}>{brl(sim.saldoFinanciamento)}</dd>
                </dl>

                {faixa && faixa.max > faixa.min && (
                  <div style={{ marginTop: 16 }}>
                    <label htmlFor="entrada-slider" style={{ display: 'block', fontSize: 13, color: P.suave, marginBottom: 7 }}>
                      Tem mais para dar de entrada? Arraste e veja a parcela cair.
                    </label>
                    <input
                      id="entrada-slider"
                      type="range"
                      min={faixa.min}
                      max={faixa.max}
                      step={faixa.passo}
                      value={entrada ?? faixa.min}
                      onChange={(ev) => setEntrada(Number(ev.target.value))}
                      style={{ width: '100%', accentColor: P.ouro, minHeight: 34 }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: P.suave }}>
                      <span>{brl(faixa.min)}</span>
                      {!sim.padraoDaTabela && (
                        <button type="button" onClick={() => setEntrada(null)}
                          style={{ background: 'none', border: 'none', color: P.ouro, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                          voltar à tabela
                        </button>
                      )}
                      <span>{brl(faixa.max)}</span>
                    </div>
                  </div>
                )}

                <p style={{ fontSize: 11.5, color: P.suave, margin: '12px 0 0', lineHeight: 1.5 }}>
                  Corrigido pelo CUB/SC até a entrega. O saldo pode ser financiado ou parcelado
                  direto com a construtora. Sujeito a análise e à tabela vigente.
                </p>
              </div>
            ) : (
              <p style={{ fontSize: 14, color: P.suave, margin: '14px 0 0' }}>
                Peça a simulação e eu te mando as condições de pagamento desta unidade.
              </p>
            )}

            {!acao ? (
              <div style={{ display: 'grid', gap: 9, marginTop: 18 }}>
                {/* O degrau de baixo vem primeiro: pedir a simulação é o passo
                    natural de quem acabou de ver o preço. Reservar é o
                    compromisso maior e fica em segundo plano visual. */}
                <button onClick={() => setAcao('simular')}
                  style={{ minHeight: 50, background: P.ouro, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15.5, fontWeight: 700, cursor: 'pointer' }}>
                  Receber esta simulação no WhatsApp
                </button>
                {unidade.status === 'disponivel' && (
                  <button onClick={() => setAcao('reservar')}
                    style={{ minHeight: 48, background: '#fff', color: P.tinta, border: '1.5px solid ' + P.linha, borderRadius: 10, fontSize: 14.5, fontWeight: 600, cursor: 'pointer' }}>
                    Quero reservar por 48 horas
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={enviar} style={{ marginTop: 18 }}>
                <p style={{ fontSize: 13.5, color: P.suave, margin: '0 0 14px', lineHeight: 1.5 }}>
                  {acao === 'reservar'
                    ? 'Reserva sem custo e sem compromisso, válida por 48 horas.'
                    : 'Só preciso de dois dados para te mandar a simulação.'}
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

                {/* Honeypot: invisível ao humano, irresistível ao bot. */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                  style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} />

                {erro && (
                  <p role="alert" style={{ fontSize: 13.5, color: P.vermelho, background: P.vermelhoBg, padding: '9px 11px', borderRadius: 8, margin: '14px 0 0' }}>
                    {erro}
                  </p>
                )}

                <button type="submit" disabled={enviando}
                  style={{ marginTop: 16, width: '100%', minHeight: 50, background: P.ouro, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15.5, fontWeight: 700, cursor: enviando ? 'wait' : 'pointer', opacity: enviando ? 0.7 : 1 }}>
                  {enviando ? 'Enviando…' : acao === 'reservar' ? 'Reservar por 48 horas' : 'Receber a simulação'}
                </button>
                <button type="button" onClick={() => { setAcao(null); setErro('') }}
                  style={{ marginTop: 8, width: '100%', minHeight: 40, background: 'none', border: 'none', color: P.suave, fontSize: 13.5, cursor: 'pointer' }}>
                  Voltar
                </button>
              </form>
            )}
          </>
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
