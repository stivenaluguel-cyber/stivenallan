'use client'
import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, Check, Minus, Plus, Settings2, X } from 'lucide-react'
import { D } from '@/components/dashboard/focus/tokens'
import type { ProgressoDia, MetasDiarias as Metas } from '@/lib/dashboard/metas-diarias'

type Resposta = { data: string; metas: Metas; progresso: ProgressoDia; mensagem: string | null; configurado: boolean }

// tipo no banco === chave, exceto estes dois legados — mesmo mapeamento de
// src/app/api/admin/metas/route.ts (CHAVE_PARA_TIPO).
const CHAVE_PARA_TIPO: Record<string, string> = { conteudos: 'conteudo', reunioes: 'reuniao_presencial' }

export function MetasDiarias() {
  const [dados, setDados] = useState<Resposta | null>(null)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState<string | null>(null)
  const [configAberta, setConfigAberta] = useState(false)
  // "Editar outro dia": nem toda atividade acontece dentro do sistema, e uma
  // reunião de sexta lembrada no domingo precisa cair na sexta. O backend já
  // aceitava a data; faltava a tela oferecer. Lançar em dia passado invalida
  // o selo do calendário, que é reselado com o número novo.
  const [outroDia, setOutroDia] = useState('')

  const carregar = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/metas')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar metas')
      setDados(json); setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar metas')
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // Todas as 5 atividades aceitam registro manual agora — nas 3 automáticas
  // (novos_contatos/followups/visitas) é um COMPLEMENTO somado por cima do
  // que o sistema já mede sozinho, não uma substituição: por isso o valor
  // enviado é sempre baseado em `manual`, nunca em `feito` (que já inclui a
  // parte automática).
  async function registrar(chave: string, novoValorManual: number) {
    const tipo = CHAVE_PARA_TIPO[chave] ?? chave
    setSalvando(chave)
    try {
      const res = await fetch('/api/admin/metas', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, quantidade: Math.max(0, novoValorManual), ...(outroDia ? { data: outroDia } : {}) }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Falha ao registrar')
      await carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao registrar')
    } finally { setSalvando(null) }
  }

  async function salvarMetas(novas: Metas) {
    setSalvando('config')
    try {
      const res = await fetch('/api/admin/metas', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(novas),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Falha ao salvar metas')
      setConfigAberta(false)
      await carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao salvar metas')
    } finally { setSalvando(null) }
  }

  if (erro) {
    return (
      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ color: '#991B1B', fontSize: 13 }}>{erro}</span>
        <button onClick={carregar} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', minHeight: 44 }}>Tentar de novo</button>
      </div>
    )
  }

  if (!dados) {
    return <div style={{ height: 96, borderRadius: 12, background: D.surface, border: '1px solid ' + D.line, marginBottom: 20 }} />
  }

  const { progresso, mensagem, metas } = dados
  if (progresso.total === 0 && !configAberta) {
    return (
      <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13.5, color: D.muted }}>Acompanhamento de rotina diária desligado.</span>
        <button onClick={() => setConfigAberta(true)} style={btnSecundario}>Configurar metas</button>
      </div>
    )
  }

  return (
    <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase', color: D.muted, marginBottom: 3 }}>Rotina de hoje</div>
          <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 18, fontWeight: 800, color: progresso.diaCompleto ? D.green : D.ink }}>
            {progresso.cumpridas} de {progresso.total} cumpridas
            {progresso.diaCompleto && <Check size={17} style={{ marginLeft: 6, verticalAlign: -3 }} />}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: D.muted }}>
            <CalendarDays size={14} aria-hidden />
            <span>Lançar em</span>
            <input
              type="date"
              value={outroDia}
              max={dados.data}
              onChange={(e) => setOutroDia(e.target.value)}
              aria-label="Lançar atividade em outro dia"
              style={{ border: '1px solid ' + D.line, borderRadius: 8, padding: '7px 9px', fontSize: 12, color: D.ink, background: '#fff', minHeight: 38 }}
            />
          </label>
          {outroDia && (
            <button onClick={() => setOutroDia('')} style={{ ...btnSecundario, padding: '7px 10px' }}>Hoje</button>
          )}
          <button onClick={() => setConfigAberta((v) => !v)} aria-label="Configurar metas" style={{ ...btnSecundario, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Settings2 size={14} /> Metas
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
        {progresso.itens.map((item) => (
          <div key={item.chave} style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6, marginBottom: 7 }}>
              <span style={{ fontSize: 12, color: D.muted, lineHeight: 1.25 }}>{item.label}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: item.cumprida ? D.green : D.ink, whiteSpace: 'nowrap' }}>
                {item.feito}/{item.meta}
              </span>
            </div>
            <div role="progressbar" aria-valuenow={item.percentual} aria-valuemin={0} aria-valuemax={100} aria-label={item.label}
                 style={{ height: 6, borderRadius: 999, background: D.line, overflow: 'hidden' }}>
              <div style={{ width: item.percentual + '%', height: '100%', background: item.cumprida ? D.green : D.bronze, transition: 'width .25s ease' }} />
            </div>
            <div style={{ marginTop: 8 }}>
            {item.origem === 'automatica' && (
              <div style={{ fontSize: 10, color: D.muted, marginBottom: 5 }}>
                Conta sozinho — o registro aqui é um complemento
              </div>
            )}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => registrar(item.chave, item.manual + 1)}
                disabled={salvando === item.chave}
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: D.bg, border: '1px solid ' + D.line, borderRadius: 7, padding: '7px 10px', fontSize: 12, fontWeight: 700, color: D.ink, cursor: salvando === item.chave ? 'default' : 'pointer', minHeight: 44, opacity: salvando === item.chave ? 0.6 : 1 }}
              >
                <Plus size={13} /> Registrar
              </button>
              {item.manual > 0 && (
                <button
                  onClick={() => registrar(item.chave, item.manual - 1)}
                  disabled={salvando === item.chave}
                  title="Remover um registro manual (clique errado, cancelado, etc.)"
                  aria-label="Remover um registro manual"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, background: '#fff', border: '1px solid ' + D.line, borderRadius: 7, color: D.muted, cursor: salvando === item.chave ? 'default' : 'pointer', minHeight: 44, opacity: salvando === item.chave ? 0.6 : 1 }}
                >
                  <Minus size={13} />
                </button>
              )}
            </div>
            </div>
          </div>
        ))}
      </div>

      {mensagem && (
        <div role="status" style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: progresso.diaCompleto ? '#047857' : '#92400E', background: progresso.diaCompleto ? '#ECFDF5' : '#FFFBEB', border: '1px solid ' + (progresso.diaCompleto ? '#A7F3D0' : '#FDE68A'), borderRadius: 8, padding: '9px 12px' }}>
          {mensagem}
        </div>
      )}

      {configAberta && <ConfigMetas metas={metas} salvando={salvando === 'config'} onSalvar={salvarMetas} onFechar={() => setConfigAberta(false)} />}
    </div>
  )
}

const btnSecundario: React.CSSProperties = {
  background: '#fff', border: '1px solid ' + D.line, borderRadius: 8, padding: '8px 13px',
  fontSize: 12.5, fontWeight: 700, color: D.ink, cursor: 'pointer', minHeight: 44,
}

const CAMPOS: { chave: keyof Metas; label: string }[] = [
  { chave: 'novos_contatos', label: 'Novos contatos' },
  { chave: 'followups', label: 'Follow-ups' },
  { chave: 'visitas', label: 'Visitas a imóveis' },
  { chave: 'conteudos', label: 'Conteúdo publicado' },
  { chave: 'reunioes', label: 'Reunião presencial' },
]

function ConfigMetas({ metas, salvando, onSalvar, onFechar }: { metas: Metas; salvando: boolean; onSalvar: (m: Metas) => void; onFechar: () => void }) {
  const [local, setLocal] = useState<Metas>(metas)

  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid ' + D.line }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <strong style={{ fontSize: 13.5, color: D.ink }}>Metas diárias</strong>
        <button onClick={onFechar} aria-label="Fechar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: D.muted, padding: 8, minHeight: 44, minWidth: 44 }}><X size={16} /></button>
      </div>
      <p style={{ fontSize: 12, color: D.muted, margin: '0 0 12px' }}>Deixe em 0 para não acompanhar aquela atividade.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10 }}>
        {CAMPOS.map(({ chave, label }) => (
          <label key={chave} style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, color: D.muted }}>
            {label}
            <input
              type="number" min={0} value={local[chave]}
              onChange={(e) => setLocal((p) => ({ ...p, [chave]: Math.max(0, Number(e.target.value) || 0) }))}
              style={{ padding: '9px 10px', borderRadius: 7, border: '1px solid ' + D.line, fontSize: 13.5, minHeight: 44, color: D.ink }}
            />
          </label>
        ))}
      </div>
      <button onClick={() => onSalvar(local)} disabled={salvando}
        style={{ marginTop: 12, background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: salvando ? 'default' : 'pointer', minHeight: 44, opacity: salvando ? 0.6 : 1 }}>
        {salvando ? 'Salvando...' : 'Salvar metas'}
      </button>
    </div>
  )
}
