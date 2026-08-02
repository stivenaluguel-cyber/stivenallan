'use client'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Building2, CircleDollarSign, Clock, Lock, Unlock } from 'lucide-react'
import { D, fmt } from '@/components/dashboard/focus/tokens'
import {
  precoDaUnidade,
  statusDaUnidade,
  type BlocoAgrupado,
  type ResumoEspelho,
  type StatusUnidade,
  type UnidadeEspelho,
} from '@/lib/unidades/espelho'

type Emp = { id: string; nome: string; slug: string; unidades: number }

type Vendida = {
  id: string; empreendimento: string; bloco: string | null; unidade: string
  metragem: number; dormitorios: number | null
  valor_tabela: number | null; vendida_em: string | null
}
type Relatorio = { vendidas: Vendida[]; total: number; valorTotal: number }

type Resposta = {
  grade: BlocoAgrupado[]
  resumo: ResumoEspelho
  cub_vigente: number | null
  cub_competencia: string | null
  nomesReserva: Record<string, string>
}

// Mesmas cores do calendário de metas: verde = livre, âmbar = em andamento,
// vermelho = fechado. O corretor já leu essa paleta em outra tela.
const CORES: Record<StatusUnidade, { fundo: string; borda: string; texto: string; label: string }> = {
  disponivel: { fundo: 'rgba(34,197,94,0.14)', borda: '#22c55e', texto: '#15803d', label: 'Disponível' },
  reservada: { fundo: 'rgba(245,158,11,0.16)', borda: '#f59e0b', texto: '#b45309', label: 'Reservada' },
  vendida: { fundo: 'rgba(239,68,68,0.12)', borda: 'rgba(239,68,68,0.4)', texto: '#b91c1c', label: 'Vendida' },
}

export default function EspelhoPage() {
  return (
    <Suspense fallback={null}>
      <EspelhoConteudo />
    </Suspense>
  )
}

function EspelhoConteudo() {
  // ?emp=<slug> chega da listagem de Empreendimentos, para abrir direto no
  // prédio certo em vez de cair sempre no primeiro com unidades.
  const slugAlvo = useSearchParams().get('emp')
  const [emps, setEmps] = useState<Emp[]>([])
  const [empId, setEmpId] = useState<string>('')
  const [dados, setDados] = useState<Resposta | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [aberta, setAberta] = useState<UnidadeEspelho | null>(null)
  // Relatório de vendas: consolidado de TODOS os empreendimentos, não só do
  // selecionado. A página pública deixou de mostrar a unidade vendida — este é
  // o lugar onde o corretor acompanha o giro do estoque.
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null)
  const [verVendidas, setVerVendidas] = useState(false)

  const carregarRelatorio = useCallback(() => {
    fetch('/api/admin/espelho?vendidas=1')
      .then((r) => r.json())
      .then((j) => setRelatorio(j?.vendidas ? j : { vendidas: [], total: 0, valorTotal: 0 }))
      .catch(() => setRelatorio({ vendidas: [], total: 0, valorTotal: 0 }))
  }, [])

  useEffect(() => { carregarRelatorio() }, [carregarRelatorio])

  useEffect(() => {
    fetch('/api/admin/espelho')
      .then((r) => r.json())
      .then((j) => {
        const lista: Emp[] = j.empreendimentos ?? []
        const alvo = slugAlvo ? lista.find((e) => e.slug === slugAlvo) : null
        setEmps(lista)
        // Abre no que veio pela URL; senão, no primeiro que TEM unidade —
        // cair num espelho vazio faria a tela parecer quebrada.
        setEmpId((alvo ?? lista.find((e) => e.unidades > 0) ?? lista[0])?.id ?? '')
      })
      .catch(() => setErro('Falha ao carregar empreendimentos'))
  }, [slugAlvo])

  const carregar = useCallback(async (id: string) => {
    if (!id) { setCarregando(false); return }
    setCarregando(true)
    try {
      const res = await fetch(`/api/admin/espelho?empreendimento_id=${id}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar espelho')
      setDados(json); setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar espelho')
    } finally { setCarregando(false) }
  }, [])

  useEffect(() => { carregar(empId) }, [carregar, empId])

  async function agir(unidade: UnidadeEspelho, acao: string, extra?: Record<string, unknown>) {
    try {
      const res = await fetch('/api/admin/espelho', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unidade_id: unidade.id, acao, ...extra }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha na ação')
      setAberta(null)
      await carregar(empId)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha na ação')
    }
  }

  const agora = new Date()
  const empAtual = emps.find((e) => e.id === empId)

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', marginBottom: 18 }}>
        <div style={{ marginRight: 'auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: D.ink, margin: 0 }}>Espelho de vendas</h1>
          <p style={{ fontSize: 13, color: D.muted, margin: '4px 0 0' }}>
            A grade de unidades por andar. Reserva do site expira sozinha em 48h.
          </p>
        </div>
        <label style={{ display: 'grid', gap: 3, fontSize: 11, color: D.muted, fontWeight: 600 }}>
          Empreendimento
          <select value={empId} onChange={(e) => setEmpId(e.target.value)}
            style={{ border: '1px solid ' + D.line, borderRadius: 8, padding: '9px 11px', fontSize: 13, background: '#fff', color: D.ink, minHeight: 42, minWidth: 240 }}>
            {emps.map((e) => (
              <option key={e.id} value={e.id}>{e.nome} ({e.unidades})</option>
            ))}
          </select>
        </label>
      </header>

      {erro && (
        <p role="alert" style={{ fontSize: 13, color: D.red, background: 'rgba(239,68,68,0.08)', padding: '10px 12px', borderRadius: 8, marginBottom: 14 }}>
          {erro}
        </p>
      )}

      {carregando && !dados && <p style={{ fontSize: 13, color: D.muted }}>Carregando…</p>}

      {dados && dados.resumo.total === 0 && (
        <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 28, textAlign: 'center' }}>
          <Building2 size={28} color={D.muted} style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: D.ink, margin: 0 }}>
            {empAtual?.nome ?? 'Este empreendimento'} ainda não tem unidades cadastradas.
          </p>
          <p style={{ fontSize: 12.5, color: D.muted, margin: '6px 0 0' }}>
            O espelho aparece aqui e na página pública do imóvel assim que as unidades entrarem.
          </p>
        </div>
      )}

      {dados && dados.resumo.total > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 18 }}>
            <Card rotulo="Total" valor={String(dados.resumo.total)} nota="unidades" />
            <Card rotulo="Disponíveis" valor={String(dados.resumo.disponiveis)} nota="livres agora" cor="#15803d" />
            <Card rotulo="Reservadas" valor={String(dados.resumo.reservadas)} nota="prazo vigente" cor="#b45309" />
            <Card rotulo="Vendidas" valor={String(dados.resumo.vendidas)} nota={`${dados.resumo.percentualVendido}% do total`} cor="#b91c1c" />
            {dados.cub_vigente && (
              <Card rotulo="CUB vigente" valor={fmt(dados.cub_vigente)} nota={`/m² · ${String(dados.cub_competencia ?? '').slice(0, 7)}`} />
            )}
          </div>

          {dados.grade.map((bloco) => (
            <section key={bloco.bloco ?? 'unico'} style={{ marginBottom: 22 }}>
              {bloco.bloco && (
                <h2 style={{ fontSize: 14, fontWeight: 700, color: D.ink, margin: '0 0 10px' }}>Bloco {bloco.bloco}</h2>
              )}
              <div style={{ display: 'grid', gap: 8 }}>
                {bloco.andares.map((andar) => (
                  <div key={String(andar.andar)} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ width: 56, flexShrink: 0, fontSize: 11, fontWeight: 700, color: D.muted, paddingTop: 12, textAlign: 'right' }}>
                      {andar.andar === null ? 'Térreo' : `${andar.andar}º`}
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 1 }}>
                      {andar.unidades.map((u) => {
                        const st = statusDaUnidade(u, agora)
                        const c = CORES[st]
                        const p = precoDaUnidade(u)
                        return (
                          <button key={u.id} onClick={() => setAberta(u)}
                            aria-label={`Unidade ${u.unidade}, ${c.label}`}
                            style={{
                              minWidth: 96, minHeight: 62, borderRadius: 9, cursor: 'pointer',
                              background: c.fundo, border: '1px solid ' + c.borda, color: c.texto,
                              padding: '7px 9px', textAlign: 'left', font: 'inherit',
                            }}>
                            <div style={{ fontSize: 14, fontWeight: 800 }}>{u.unidade}</div>
                            <div style={{ fontSize: 10, opacity: 0.85 }}>{Number(u.metragem)}m²{u.dormitorios ? ` · ${u.dormitorios}q` : ''}</div>
                            {p.valor && <div style={{ fontSize: 10, fontWeight: 700, marginTop: 1 }}>{fmt(p.valor)}</div>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 4 }}>
            {(Object.keys(CORES) as StatusUnidade[]).map((k) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: D.muted }}>
                <span aria-hidden style={{ width: 11, height: 11, borderRadius: 3, background: CORES[k].fundo, border: '1px solid ' + CORES[k].borda }} />
                {CORES[k].label}
              </span>
            ))}
          </div>
        </>
      )}

      {/* RELATÓRIO DE VENDAS — todos os empreendimentos, não só o aberto. */}
      {relatorio && relatorio.total > 0 && (
        <section style={{ marginTop: 26, background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 16 }}>
          <button
            onClick={() => setVerVendidas((v) => !v)}
            aria-expanded={verVendidas}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit', textAlign: 'left' }}>
            <CircleDollarSign size={16} color="#b91c1c" aria-hidden />
            <span style={{ fontSize: 14, fontWeight: 700, color: D.ink }}>
              Relatório de vendas — {relatorio.total} {relatorio.total === 1 ? 'unidade' : 'unidades'}
            </span>
            <span style={{ fontSize: 12.5, color: D.muted }}>
              {fmt(relatorio.valorTotal)} em tabela · {verVendidas ? 'ocultar' : 'ver'}
            </span>
          </button>

          {verVendidas && (
            <div style={{ overflowX: 'auto', marginTop: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: D.muted }}>
                    <th style={{ padding: '6px 8px', fontWeight: 600 }}>Empreendimento</th>
                    <th style={{ padding: '6px 8px', fontWeight: 600 }}>Unidade</th>
                    <th style={{ padding: '6px 8px', fontWeight: 600 }}>m²</th>
                    <th style={{ padding: '6px 8px', fontWeight: 600, textAlign: 'right' }}>Preço em tabela</th>
                    <th style={{ padding: '6px 8px', fontWeight: 600 }}>Baixada em</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorio.vendidas.map((v) => (
                    <tr key={v.id} style={{ borderTop: '1px solid ' + D.line }}>
                      <td style={{ padding: '7px 8px', color: D.ink }}>{v.empreendimento}</td>
                      <td style={{ padding: '7px 8px', color: D.ink, fontWeight: 700 }}>
                        {v.bloco ? `${v.bloco} · ` : ''}{v.unidade}
                      </td>
                      <td style={{ padding: '7px 8px', color: D.muted }}>
                        {v.metragem}{v.dormitorios ? ` · ${v.dormitorios} qtos` : ''}
                      </td>
                      <td style={{ padding: '7px 8px', color: D.ink, textAlign: 'right' }}>
                        {v.valor_tabela === null ? '—' : fmt(v.valor_tabela)}
                      </td>
                      <td style={{ padding: '7px 8px', color: D.muted }}>
                        {/* Nulo nas baixadas antes desta coluna existir — dizer
                            "sem data" é mais honesto que inventar uma. */}
                        {v.vendida_em ? new Date(v.vendida_em).toLocaleDateString('pt-BR') : 'sem data'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {aberta && (
        <PainelUnidade
          unidade={aberta}
          nomeReserva={aberta.lead_id_reserva ? dados?.nomesReserva[aberta.lead_id_reserva] : undefined}
          agora={agora}
          onFechar={() => setAberta(null)}
          onAgir={(u, acao, extra) => { agir(u, acao, extra); carregarRelatorio() }}
        />
      )}
    </div>
  )
}

function Card({ rotulo, valor, nota, cor }: { rotulo: string; valor: string; nota: string; cor?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 10, padding: '11px 13px' }}>
      <div style={{ fontSize: 11, color: D.muted, fontWeight: 600 }}>{rotulo}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: cor ?? D.ink, lineHeight: 1.15 }}>{valor}</div>
      <div style={{ fontSize: 11, color: D.muted }}>{nota}</div>
    </div>
  )
}

function PainelUnidade({ unidade, nomeReserva, agora, onFechar, onAgir }: {
  unidade: UnidadeEspelho
  nomeReserva?: string
  agora: Date
  onFechar: () => void
  onAgir: (u: UnidadeEspelho, acao: string, extra?: Record<string, unknown>) => void
}) {
  const st = statusDaUnidade(unidade, agora)
  const p = precoDaUnidade(unidade)
  const rotulo = [unidade.bloco, unidade.unidade].filter(Boolean).join(' ')

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onFechar() }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 420, padding: 20, maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: D.ink, margin: 0 }}>Unidade {rotulo}</h2>
            <span style={{ fontSize: 11, fontWeight: 700, color: CORES[st].texto, background: CORES[st].fundo, padding: '3px 9px', borderRadius: 999, display: 'inline-block', marginTop: 5 }}>
              {CORES[st].label}
            </span>
          </div>
          <button onClick={onFechar} aria-label="Fechar"
            style={{ background: 'none', border: 'none', fontSize: 22, lineHeight: 1, color: D.muted, cursor: 'pointer', minHeight: 40, minWidth: 40 }}>×</button>
        </div>

        <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '7px 12px', fontSize: 13, margin: '0 0 16px' }}>
          <dt style={{ color: D.muted }}>Metragem</dt><dd style={{ margin: 0, fontWeight: 600 }}>{Number(unidade.metragem)}m²</dd>
          <dt style={{ color: D.muted }}>Dormitórios</dt><dd style={{ margin: 0, fontWeight: 600 }}>{unidade.dormitorios ?? '—'}{unidade.suites ? ` (${unidade.suites} suíte)` : ''}</dd>
          {p.valor && <><dt style={{ color: D.muted }}>Valor</dt><dd style={{ margin: 0, fontWeight: 700 }}>{fmt(p.valor)}{p.promocional && p.de && <span style={{ color: D.muted, fontWeight: 400, marginLeft: 6, textDecoration: 'line-through' }}>{fmt(p.de)}</span>}</dd></>}
          {unidade.valor_entrada_min && <><dt style={{ color: D.muted }}>Entrada mín.</dt><dd style={{ margin: 0, fontWeight: 600 }}>{fmt(Number(unidade.valor_entrada_min))}</dd></>}
          {unidade.cub_fator && <><dt style={{ color: D.muted }}>Fator CUB</dt><dd style={{ margin: 0, fontWeight: 600 }}>{Number(unidade.cub_fator)}× CUB</dd></>}
          {unidade.orientacao && <><dt style={{ color: D.muted }}>Orientação</dt><dd style={{ margin: 0 }}>{unidade.orientacao}</dd></>}
        </dl>

        {st === 'reservada' && (
          <div style={{ background: CORES.reservada.fundo, border: '1px solid ' + CORES.reservada.borda, borderRadius: 9, padding: '10px 12px', marginBottom: 14 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: CORES.reservada.texto }}>
              <Clock size={13} aria-hidden /> Reserva vigente
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12.5, color: D.ink }}>
              {nomeReserva ?? 'Lead sem nome'} — até {new Date(unidade.reservado_ate!).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
            </p>
            {unidade.lead_id_reserva && (
              <a href={`/dashboard/crm?lead=${unidade.lead_id_reserva}`}
                style={{ fontSize: 12, color: D.bronze, fontWeight: 600, textDecoration: 'none' }}>
                Abrir o lead no CRM →
              </a>
            )}
          </div>
        )}

        {unidade.condicoes_negociacao && (
          <div style={{ background: D.bg, borderRadius: 9, padding: '10px 12px', marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: D.muted, letterSpacing: '0.06em' }}>CONDIÇÕES (INTERNO)</div>
            <p style={{ margin: '3px 0 0', fontSize: 12.5, color: D.ink }}>{unidade.condicoes_negociacao}</p>
          </div>
        )}

        <div style={{ display: 'grid', gap: 7 }}>
          {st === 'reservada' && (
            <button onClick={() => onAgir(unidade, 'liberar')} style={botao(D.line, D.ink)}>
              <Unlock size={14} aria-hidden /> Liberar reserva
            </button>
          )}
          {st !== 'vendida' && (
            <button onClick={() => onAgir(unidade, 'vender')} style={botao('#b91c1c', '#fff', '#b91c1c')}>
              <CircleDollarSign size={14} aria-hidden /> Marcar como vendida
            </button>
          )}
          {st === 'vendida' && (
            <button onClick={() => onAgir(unidade, 'disponibilizar')} style={botao(D.line, D.ink)}>
              <Lock size={14} aria-hidden /> Voltar para disponível
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function botao(borda: string, cor: string, fundo = '#fff'): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    border: '1px solid ' + borda, background: fundo, color: cor,
    borderRadius: 9, padding: '11px 14px', fontSize: 13, fontWeight: 700,
    cursor: 'pointer', minHeight: 44, width: '100%',
  }
}
