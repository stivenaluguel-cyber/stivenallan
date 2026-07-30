'use client'
import { useCallback, useEffect, useState } from 'react'
import type { StatusUnidade, UnidadePublica } from '@/lib/unidades/espelho'
import { faixaDeEntrada, simular, type PlanoPagamento, type Simulacao } from '@/lib/unidades/simular'
import { parcelaDiretaComReforcos, prazosSugeridos, reforcoMaximo } from '@/lib/unidades/financiamento-direto'

type Resposta = {
  temEspelho: boolean
  empreendimento?: { nome: string; slug: string }
  exibirPreco: boolean
  precoMinimo: number | null
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
          {dados.resumo.disponiveis} de {dados.resumo.total} unidades disponíveis
          {dados.precoMinimo ? <> · a partir de <strong style={{ color: P.tinta }}>{brl(dados.precoMinimo)}</strong></> : null}.
          {' '}Escolha a unidade e eu te mando o valor e as condições de pagamento pelo WhatsApp.
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
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13, color: P.suave, margin: '18px 0 0' }}>
          Disponibilidade e valores sujeitos a confirmação com a construtora e à tabela vigente.
        </p>
      </div>

      {escolhida && (
        <ModalUnidade
          // Uma instância por unidade. Sem isto, trocar de unidade sem fechar o
          // modal reaproveitaria o estado da anterior — valor revelado, reserva
          // e entrada do slider apareceriam sob o título da unidade nova.
          key={escolhida.id}
          unidade={escolhida}
          empreendimento={dados.empreendimento?.nome ?? ''}
          onFechar={() => setEscolhida(null)}
          onConcluido={() => { setEscolhida(null); carregar() }}
        />
      )}
    </section>
  )
}


/**
 * Quem você é, lembrado no navegador.
 *
 * Sem isso, ver a segunda unidade exigia redigitar nome e telefone. No teste
 * de 29/07 a mesma pessoa virou TRÊS leads separados olhando três
 * apartamentos do mesmo prédio — e escreveu a reclamação no campo nome.
 *
 * Fica no localStorage porque é o dado da própria pessoa, no aparelho dela, e
 * porque precisa sobreviver a fechar a aba: comparar unidade é coisa de quem
 * volta no dia seguinte.
 */
const CHAVE_IDENTIDADE = 'sa-espelho-contato'

type Identidade = { nome: string; telefone: string; email?: string }

function lerIdentidade(): Identidade | null {
  if (typeof window === 'undefined') return null
  try {
    const cru = window.localStorage.getItem(CHAVE_IDENTIDADE)
    if (!cru) return null
    const v = JSON.parse(cru) as Identidade
    return v?.nome && v?.telefone ? v : null
  } catch {
    // localStorage bloqueado (aba anônima, cookies desligados): o formulário
    // aparece de novo. Degrada para o comportamento antigo, não quebra.
    return null
  }
}

function gravarIdentidade(v: Identidade): void {
  try { window.localStorage.setItem(CHAVE_IDENTIDADE, JSON.stringify(v)) } catch { /* idem */ }
}

function esquecerIdentidade(): void {
  try { window.localStorage.removeItem(CHAVE_IDENTIDADE) } catch { /* idem */ }
}

type Revelado = {
  valor: number | null
  plano: PlanoPagamento | null
  simulacao: Simulacao | null
}

function ModalUnidade({ unidade, empreendimento, onFechar, onConcluido }: {
  unidade: UnidadePublica
  empreendimento: string
  onFechar: () => void
  onConcluido: () => void
}) {
  const [intencao, setIntencao] = useState<'simular' | 'quero'>('simular')
  // Preenchido de saída quando a pessoa já se identificou em outra unidade.
  const [lembrado, setLembrado] = useState<Identidade | null>(null)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  // Preenchido só DEPOIS que a pessoa se identifica — o preço e o plano não
  // vêm no payload anônimo, chegam na resposta de /api/espelho/simular.
  const [revelado, setRevelado] = useState<Revelado | null>(null)
  const [reservado, setReservado] = useState(false)
  const [entrada, setEntrada] = useState<number | null>(null)
  // Prazo e reforço do parcelamento direto do SALDO — separado da entrada.
  const [prazoDireto, setPrazoDireto] = useState<number | null>(null)
  const [reforcoDireto, setReforcoDireto] = useState(0)
  const [reenviando, setReenviando] = useState(false)
  const [reenviado, setReenviado] = useState(false)

  useEffect(() => {
    const id = lerIdentidade()
    if (id) { setLembrado(id); setNome(id.nome); setTelefone(id.telefone); setEmail(id.email ?? '') }
  }, [])

  const rotulo = [unidade.bloco, unidade.unidade].filter(Boolean).join(' ')

  // Depois de revelado, o slider recalcula localmente com a mesma função pura
  // que o servidor usa.
  const sim = revelado?.plano && revelado.valor
    ? simular(revelado.valor, revelado.plano, entrada)
    : revelado?.simulacao ?? null
  const faixa = revelado?.plano ? faixaDeEntrada(revelado.plano) : null

  async function identificar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    try {
      // A simulação SEMPRE roda: é ela que devolve o preço. "Quero esta
      // unidade" faz a reserva por cima, depois de identificar.
      const res = await fetch('/api/espelho/simular', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unidade_id: unidade.id, nome, telefone, email: email || undefined }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Não foi possível concluir')

      // Só grava depois que o servidor aceitou: telefone recusado não vira
      // identidade lembrada.
      gravarIdentidade({ nome, telefone, email: email || undefined })
      setRevelado({ valor: json.valor ?? null, plano: json.plano ?? null, simulacao: json.simulacao ?? null })

      if (intencao === 'quero' && unidade.status === 'disponivel') {
        const r2 = await fetch('/api/espelho/reservar', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ unidade_id: unidade.id, nome, telefone }),
        })
        // Falhar a sinalização não apaga a simulação que já foi entregue.
        if (r2.ok) setReservado(true)
      }
      setErro('')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível concluir')
    } finally { setEnviando(false) }
  }

  // Reenvia só quando a pessoa PEDE — mexer no slider não pode encher o CRM de
  // simulação a cada arrasto.
  async function enviarAjuste() {
    if (!sim) return
    setReenviando(true)
    try {
      await fetch('/api/espelho/simular', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unidade_id: unidade.id, nome, telefone, email: email || undefined, entrada: sim.entrada }),
      })
      setReenviado(true)
    } finally { setReenviando(false) }
  }

  return (
    <div onClick={(ev) => { if (ev.target === ev.currentTarget) onFechar() }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 460, padding: 24, maxHeight: '92vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: P.tinta, margin: 0 }}>Unidade {rotulo}</h3>
            <p style={{ fontSize: 13.5, color: P.suave, margin: '5px 0 0' }}>
              {empreendimento} · {unidade.metragem}m²
              {unidade.dormitorios ? ` · ${unidade.dormitorios} quartos` : ''}
              {unidade.andar ? ` · ${unidade.andar}º andar` : ''}
            </p>
          </div>
          <button type="button" onClick={onFechar} aria-label="Fechar"
            style={{ background: 'none', border: 'none', fontSize: 24, lineHeight: 1, color: P.suave, cursor: 'pointer', minHeight: 40, minWidth: 40 }}>×</button>
        </div>

        {!revelado ? (
          <form onSubmit={identificar} style={{ marginTop: 16 }}>
            <div style={{ background: P.creme, border: '1px solid ' + P.linha, borderRadius: 11, padding: '14px 16px' }}>
              <p style={{ fontSize: 14.5, color: P.tinta, margin: 0, lineHeight: 1.55, fontWeight: 600 }}>
                Te mando agora o valor desta unidade e as condições de pagamento.
              </p>
              <p style={{ fontSize: 13, color: P.suave, margin: '7px 0 0', lineHeight: 1.5 }}>
                Entrada, parcelas e reforços — e você ainda pode simular com a entrada que tiver.
              </p>
            </div>

            {lembrado ? (
              // Já se identificou em outra unidade: um clique, não um cadastro.
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, border: '1px solid ' + P.linha, borderRadius: 11, padding: '12px 14px' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: P.tinta, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lembrado.nome}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 12.5, color: P.suave }}>{lembrado.telefone}</p>
                </div>
                <button type="button"
                  onClick={() => { esquecerIdentidade(); setLembrado(null); setNome(''); setTelefone(''); setEmail('') }}
                  style={{ background: 'none', border: 'none', padding: 0, color: P.suave, fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer', flexShrink: 0 }}>
                  não é você?
                </button>
              </div>
            ) : (
              <>
                <label style={{ ...rot, marginTop: 16 }}>
                  Seu nome
                  <input value={nome} onChange={(e) => setNome(e.target.value)} required autoComplete="name" style={inp} />
                </label>
                <label style={{ ...rot, marginTop: 12 }}>
                  WhatsApp com DDD
                  <input value={telefone} onChange={(e) => setTelefone(e.target.value)} required
                    inputMode="tel" autoComplete="tel" placeholder="(48) 99999-8888" style={inp} />
                </label>
                <label style={{ ...rot, marginTop: 12 }}>
                  E-mail <span style={{ fontWeight: 400, color: P.suave }}>(opcional)</span>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                    autoComplete="email" placeholder="voce@email.com" style={inp} />
                </label>
              </>
            )}

            {/* Honeypot: invisível ao humano, irresistível ao bot. */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} />

            {unidade.status === 'disponivel' && (
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginTop: 14, fontSize: 13.5, color: P.tinta, cursor: 'pointer' }}>
                <input type="checkbox" checked={intencao === 'quero'}
                  onChange={(e) => setIntencao(e.target.checked ? 'quero' : 'simular')}
                  style={{ marginTop: 3, accentColor: P.ouro, width: 17, height: 17 }} />
                <span>
                  Já quero esta unidade — sinalize para mim enquanto confirma
                  <span style={{ display: 'block', fontSize: 12, color: P.suave, marginTop: 2 }}>
                    Sem custo e sem compromisso.
                  </span>
                </span>
              </label>
            )}

            {erro && (
              <p role="alert" style={{ fontSize: 13.5, color: P.vermelho, background: P.vermelhoBg, padding: '9px 11px', borderRadius: 8, margin: '14px 0 0' }}>
                {erro}
              </p>
            )}

            <button type="submit" disabled={enviando}
              style={{ marginTop: 16, width: '100%', minHeight: 50, background: P.ouro, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15.5, fontWeight: 700, cursor: enviando ? 'wait' : 'pointer', opacity: enviando ? 0.7 : 1 }}>
              {enviando ? 'Enviando…' : lembrado ? 'Ver valor desta unidade' : 'Ver valor e condições'}
            </button>
          </form>
        ) : (
          <>
            {revelado.valor && (
              <div style={{ fontSize: 26, fontWeight: 700, color: P.tinta, marginTop: 14 }}>{brl(revelado.valor)}</div>
            )}

            {sim ? (
              <div style={{ marginTop: 14, background: P.creme, border: '1px solid ' + P.linha, borderRadius: 11, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.ouro, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Como fica o pagamento
                </div>

                <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '9px 14px', margin: '12px 0 0', fontSize: 14 }}>
                  <dt style={{ color: P.suave }}>Entrada</dt>
                  <dd style={{ margin: 0, fontWeight: 700, textAlign: 'right' }}>
                    {brl(sim.entrada)} <span style={{ color: P.suave, fontWeight: 400 }}>({sim.entradaPercentual}%)</span>
                  </dd>

                  {sim.parcelasQtd > 0 && (<>
                    <dt style={{ color: P.suave }}>{sim.parcelasQtd} parcelas de</dt>
                    <dd style={{ margin: 0, fontWeight: 700, textAlign: 'right' }}>{brl(sim.parcelaValor)}</dd>
                  </>)}

                  {sim.reforcosQtd > 0 && (<>
                    <dt style={{ color: P.suave }}>
                      {sim.reforcosQtd} reforços anuais
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

                {/* O saldo não é só problema do banco: a construtora parcela
                    direto. É o que o site anuncia — precisa estar na tela da
                    unidade, com o número que o cliente vai perguntar. */}
                {(() => {
                  const plano = revelado?.plano
                  const pol = plano?.financiamento_direto
                  const outras = (plano?.opcoes_pagamento ?? []).filter((o) => o.tipo !== 'direto')
                  const saldo = sim.saldoFinanciamento
                  if (!pol || !(saldo > 0)) return null

                  const prazos = prazosSugeridos(pol.meses)
                  if (prazos.length === 0) return null
                  const prazo = prazoDireto ?? prazos[prazos.length - 1]
                  const p = parcelaDiretaComReforcos(saldo, prazo, pol.jurosAoMes, reforcoDireto)
                  if (!p) return null
                  const tetoReforco = reforcoMaximo(saldo, prazo, pol.jurosAoMes)

                  return (
                    <div style={{ marginTop: 16, border: '1px solid ' + P.ouro + '55', borderRadius: 11, padding: '13px 15px', background: P.creme }}>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: P.tinta }}>
                        Parcele o saldo direto com a construtora
                      </p>
                      <p style={{ margin: '3px 0 11px', fontSize: 12.5, color: P.suave, lineHeight: 1.5 }}>
                        Sem banco e sem análise de crédito bancária. Até {pol.meses}x, juros de{' '}
                        {(pol.jurosAoMes * 100).toLocaleString('pt-BR')}% ao mês.
                      </p>

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 11 }}>
                        {prazos.map((n) => (
                          <button key={n} type="button" onClick={() => setPrazoDireto(n)}
                            style={{ padding: '6px 13px', borderRadius: 20, border: '1px solid ' + (n === prazo ? P.ouro : P.linha), background: n === prazo ? P.ouro : '#fff', color: n === prazo ? '#fff' : P.tinta, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', minHeight: 34 }}>
                            {n}x
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                        <span style={{ fontSize: 13, color: P.suave }}>{prazo} parcelas de</span>
                        <strong style={{ fontSize: 20, color: P.tinta }}>{brl(p.valor)}</strong>
                      </div>

                      {p.reforcosQtd > 0 && tetoReforco > 0 && (
                        <div style={{ marginTop: 11 }}>
                          <label htmlFor="reforco-direto" style={{ display: 'block', fontSize: 12.5, color: P.suave, marginBottom: 6, lineHeight: 1.45 }}>
                            Recebe 13º, bônus ou safra? Some um reforço por ano e a mensal cai.
                          </label>
                          <input id="reforco-direto" type="range" min={0} max={Math.min(tetoReforco, 100000)} step={1000}
                            value={reforcoDireto} onChange={(ev) => setReforcoDireto(Number(ev.target.value))}
                            style={{ width: '100%', accentColor: P.ouro, minHeight: 34 }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: P.suave }}>
                            <span>sem reforço</span>
                            {p.reforcoValor > 0 && (
                              <span>{p.reforcosQtd} reforços de <strong style={{ color: P.tinta }}>{brl(p.reforcoValor)}</strong></span>
                            )}
                          </div>
                          {p.reforcoValor > 0 && (
                            // O reforço alivia o mês, mas concentra dinheiro uma vez por
                            // ano: o total nominal sobe. Esconder isso seria vender alívio
                            // como economia.
                            <p style={{ margin: '7px 0 0', fontSize: 11.5, color: P.suave, lineHeight: 1.45 }}>
                              O reforço alivia a mensal, mas paga mais tarde no ano — o total sai{' '}
                              {brl(p.totalPago)}, contra {brl(parcelaDiretaComReforcos(saldo, prazo, pol.jurosAoMes, 0)!.totalPago)} sem reforço.
                            </p>
                          )}
                        </div>
                      )}

                      <p style={{ margin: '11px 0 0', fontSize: 11.5, color: P.suave, lineHeight: 1.45 }}>
                        Parcela e reforço em valor de hoje, ambos com juros de {(pol.jurosAoMes * 100).toLocaleString('pt-BR')}% ao mês.{pol.indice ? ` Os dois são corrigidos pelo ${pol.indice} ao longo do contrato.` : ''}
                      </p>

                      {outras.length > 0 && (
                        <p style={{ margin: '9px 0 0', paddingTop: 9, borderTop: '1px solid ' + P.linha, fontSize: 12, color: P.suave, lineHeight: 1.5 }}>
                          Também aceita: {outras.map((o) => o.descricao.toLowerCase()).join(' · ')}.
                        </p>
                      )}
                    </div>
                  )
                })()}

                {faixa && faixa.max > faixa.min && (
                  <div style={{ marginTop: 16 }}>
                    <label htmlFor="entrada-slider" style={{ display: 'block', fontSize: 13, color: P.suave, marginBottom: 7 }}>
                      Tem mais para dar de entrada? Arraste e veja a parcela cair.
                    </label>
                    <input id="entrada-slider" type="range"
                      min={faixa.min} max={faixa.max} step={faixa.passo}
                      value={entrada ?? faixa.min}
                      onChange={(ev) => { setEntrada(Number(ev.target.value)); setReenviado(false) }}
                      style={{ width: '100%', accentColor: P.ouro, minHeight: 34 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: P.suave }}>
                      <span>{brl(faixa.min)}</span>
                      {!sim.padraoDaTabela && (
                        <button type="button" onClick={() => { setEntrada(null); setReenviado(false) }}
                          style={{ background: 'none', border: 'none', color: P.ouro, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                          voltar à tabela
                        </button>
                      )}
                      <span>{brl(faixa.max)}</span>
                    </div>

                    {!sim.padraoDaTabela && (
                      <button type="button" onClick={enviarAjuste} disabled={reenviando || reenviado}
                        style={{ marginTop: 10, width: '100%', minHeight: 42, background: reenviado ? P.verdeBg : '#fff', color: reenviado ? P.verde : P.tinta, border: '1.5px solid ' + (reenviado ? 'transparent' : P.linha), borderRadius: 9, fontSize: 13.5, fontWeight: 600, cursor: reenviado ? 'default' : 'pointer' }}>
                        {reenviado ? '✓ Anotado — te mando esta' : reenviando ? 'Enviando…' : 'Quero receber esta simulação'}
                      </button>
                    )}
                  </div>
                )}

                <p style={{ fontSize: 11.5, color: P.suave, margin: '12px 0 0', lineHeight: 1.5 }}>
                  Corrigido pelo CUB/SC até a entrega. O saldo pode ser financiado ou parcelado
                  direto com a construtora. Sujeito a análise e à tabela vigente.
                </p>
              </div>
            ) : (
              <p style={{ fontSize: 14, color: P.suave, margin: '14px 0 0' }}>
                Recebi seu contato. Te mando as condições desta unidade pelo WhatsApp.
              </p>
            )}

            {/* Nada de "está separada por 48 horas": o estoque é da construtora
                e a exclusividade não é nossa para prometer. */}
            <div style={{ marginTop: 14, background: reservado ? P.verdeBg : P.creme, border: '1px solid ' + (reservado ? 'rgba(21,128,61,0.35)' : P.linha), borderRadius: 10, padding: '11px 13px' }}>
              <p style={{ fontSize: 13.5, color: P.tinta, margin: 0, lineHeight: 1.5 }}>
                {/* Quem manda a mensagem é o corretor, na mão. A tela não pode
                    dizer "já mandei" — ele é quem chama. */}
                {reservado
                  ? `Anotei seu interesse na ${rotulo}. Vou confirmar a disponibilidade com a construtora e te chamo no WhatsApp ainda hoje.`
                  : 'Recebi seu contato — te chamo no WhatsApp com estas condições.'}
              </p>
            </div>

            <button onClick={onConcluido}
              style={{ marginTop: 14, width: '100%', minHeight: 48, background: P.ouro, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Fechar
            </button>
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
