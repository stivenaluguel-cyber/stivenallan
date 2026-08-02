'use client'
import { useCallback, useEffect, useState } from 'react'
import { ArrowLeftRight, ExternalLink } from 'lucide-react'
import { ROTULO_COBERTURA, ROTULO_SITUACAO, type Cobertura, type SituacaoPermuta } from '@/lib/unidades/permutas'

/**
 * Onde o imóvel que o cliente dá na troca cabe.
 *
 * Os dois lados já existiam separados: a tabela de preços diz quando uma
 * condição não aceita permuta, e o lead agora registra o imóvel oferecido.
 * Juntar era memória do corretor, olhando PDF por PDF.
 */

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512', muted: '#6B655B',
  line: 'rgba(26,24,21,0.10)', bronze: '#D24E22', verde: '#16a34a', alerta: '#B45309',
}

const fmt = (n: number | null) => (n === null ? '—' : 'R$ ' + Math.round(n).toLocaleString('pt-BR'))

const CORES_COBERTURA: Record<Cobertura, { fundo: string; texto: string }> = {
  cobre_entrada: { fundo: 'rgba(22,163,74,0.12)', texto: '#15803d' },
  cobre_parte: { fundo: 'rgba(245,158,11,0.16)', texto: '#B45309' },
  sem_entrada_conhecida: { fundo: 'rgba(26,24,21,0.06)', texto: '#6B655B' },
}

type Combinacao = {
  unidadeId: string; identificador: string; empreendimento: string
  valorTabela: number | null; entrada: number | null
  cobertura: Cobertura; percentualDaEntrada: number | null
  excedente: number; situacao: SituacaoPermuta
}

type Item = {
  lead: {
    id: string; nome: string | null; whatsapp: string; estagio_funil: string | null
    permuta_descricao: string | null; permuta_valor: number
  }
  total: number
  combinacoes: Combinacao[]
}

export default function PermutasPage() {
  const [itens, setItens] = useState<Item[]>([])
  const [unidadesConsideradas, setUnidades] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch('/api/admin/permutas')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar')
      setItens(json.itens ?? [])
      setUnidades(json.unidadesConsideradas ?? 0)
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar')
    } finally { setCarregando(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(20px,2.5vw,36px) clamp(16px,3vw,32px)' }}>
        <header style={{ marginBottom: 20 }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 800, margin: 0 }}>
            <ArrowLeftRight size={22} aria-hidden style={{ color: D.bronze }} /> Permutas
          </h1>
          <p style={{ fontSize: 13.5, color: D.muted, margin: '6px 0 0', lineHeight: 1.5, maxWidth: 680 }}>
            Clientes que ofereceram imóvel na troca, cruzados com as unidades disponíveis cujas
            condições não excluem permuta. Cruzando {unidadesConsideradas} unidades.
          </p>
        </header>

        {erro && <p role="alert" style={{ fontSize: 13, color: '#DC2626' }}>{erro}</p>}
        {carregando && <p style={{ fontSize: 13, color: D.muted }}>Carregando…</p>}

        {!carregando && itens.length === 0 && !erro && (
          <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 28, textAlign: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Nenhum cliente com permuta registrada</p>
            <p style={{ fontSize: 13, color: D.muted, margin: '6px 0 0', lineHeight: 1.5 }}>
              O imóvel oferecido na troca é preenchido na ficha do lead, no CRM. Assim que houver um,
              o cruzamento aparece aqui.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {itens.map(({ lead, total, combinacoes }) => (
            <section key={lead.id} style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 16 }}>
              <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <div>
                  <a href={'/dashboard/crm?lead=' + lead.id}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 15, fontWeight: 800, color: D.ink, textDecoration: 'none' }}>
                    {lead.nome || '+' + lead.whatsapp}
                    <ExternalLink size={13} aria-hidden style={{ color: D.muted }} />
                  </a>
                  {lead.permuta_descricao && (
                    <p style={{ fontSize: 12.5, color: D.muted, margin: '3px 0 0' }}>{lead.permuta_descricao}</p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10.5, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Imóvel na troca</div>
                  <div style={{ fontSize: 19, fontWeight: 800, color: D.bronze }}>{fmt(lead.permuta_valor)}</div>
                </div>
              </header>

              {combinacoes.length === 0 ? (
                <p style={{ fontSize: 13, color: D.muted, margin: 0 }}>
                  Nenhuma unidade disponível aceita permuta neste momento.
                </p>
              ) : (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
                      <thead>
                        <tr style={{ background: D.ink, color: '#F3F2EE' }}>
                          <th style={th}>Unidade</th>
                          <th style={{ ...th, textAlign: 'right' }}>Tabela</th>
                          <th style={{ ...th, textAlign: 'right' }}>Entrada</th>
                          <th style={th}>A permuta</th>
                          <th style={th}>Tabela diz</th>
                        </tr>
                      </thead>
                      <tbody>
                        {combinacoes.map((c, i) => {
                          const cor = CORES_COBERTURA[c.cobertura]
                          return (
                            <tr key={c.unidadeId} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(210,78,34,0.04)' }}>
                              <td style={td}>
                                <strong>{c.empreendimento}</strong>
                                <span style={{ color: D.muted }}> · {c.identificador}</span>
                              </td>
                              <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(c.valorTabela)}</td>
                              <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(c.entrada)}</td>
                              <td style={td}>
                                <span style={{ display: 'inline-block', background: cor.fundo, color: cor.texto, borderRadius: 999, padding: '3px 9px', fontSize: 11.5, fontWeight: 700 }}>
                                  {ROTULO_COBERTURA[c.cobertura]}
                                  {c.percentualDaEntrada !== null && ` · ${c.percentualDaEntrada}%`}
                                </span>
                                {c.excedente > 0 && (
                                  <span style={{ display: 'block', fontSize: 11, color: D.muted, marginTop: 3 }}>
                                    sobram {fmt(c.excedente)} para abater das parcelas
                                  </span>
                                )}
                              </td>
                              <td style={{ ...td, fontSize: 11.5, color: c.situacao === 'alguma_exclui' ? D.alerta : D.muted }}>
                                {ROTULO_SITUACAO[c.situacao]}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {total > combinacoes.length && (
                    <p style={{ fontSize: 11.5, color: D.muted, margin: '10px 0 0' }}>
                      Mostrando as {combinacoes.length} melhores de {total} unidades compatíveis.
                    </p>
                  )}
                </>
              )}

              {/* A tabela nunca escreve "aceita permuta" — ela só avisa quando
                  alguma condição exclui. Sem este aviso, "Tabela não menciona
                  permuta" seria lido como confirmação. */}
              <p style={{ fontSize: 11, color: D.muted, margin: '10px 0 0', lineHeight: 1.5 }}>
                A tabela de preços só declara quando uma condição <strong>não</strong> aceita permuta.
                Ausência de menção não é confirmação — quem fecha permuta é a construtora.
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

const th: React.CSSProperties = {
  padding: '9px 12px', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.06em', textAlign: 'left',
}
const td: React.CSSProperties = { padding: '9px 12px', borderBottom: '1px solid ' + D.line, verticalAlign: 'top' }
