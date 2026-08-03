'use client'
import { useMemo } from 'react'
import { Plus, Trash2, AlertTriangle } from 'lucide-react'
import {
  dividirComissao,
  PAPEIS_COMISSAO,
  type ParticipanteNormalizado,
} from '@/lib/comissoes/participantes'

/**
 * Quem fica com quanto da comissão.
 *
 * A divisão captador × vendedor cobre a venda de dois corretores e mais nada.
 * Aqui cada envolvido tem papel e percentual próprios — vendedor, captador,
 * gerente, imobiliária, parceiro de co-corretagem — e o valor em reais sai
 * calculado na hora, pela mesma função que o servidor usa para gravar.
 *
 * O aviso de soma é assimétrico de propósito: acima de 100% é erro (estaria
 * prometendo mais comissão do que existe) e trava o salvar; abaixo de 100% é
 * só um lembrete, porque deixar uma fatia sem dono até decidir é situação
 * real.
 */

export type LinhaEnvolvido = {
  /** Chave estável de renderização — a lista é reordenável por remoção. */
  uid: string
  corretor_id: string
  nome: string
  papel: string
  percentual: string
}

const D = {
  ink: '#161512', muted: '#6B655B', line: 'rgba(26,24,21,0.12)',
  bronze: '#D24E22', bg: '#F3F2EE', alerta: '#B45309', erro: '#DC2626',
}

const fmt = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const rotulo: React.CSSProperties = {
  display: 'block', fontSize: 10, color: D.muted, textTransform: 'uppercase',
  letterSpacing: '0.06em', marginBottom: 3,
}
const campo: React.CSSProperties = {
  width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid ' + D.line,
  background: '#fff', color: D.ink, fontSize: 13, minHeight: 40,
}

export function linhaVazia(uid: string): LinhaEnvolvido {
  return { uid, corretor_id: '', nome: '', papel: 'vendedor', percentual: '' }
}

/** Converte as linhas da tela no formato que a API espera, descartando as em branco. */
export function linhasParaPayload(linhas: LinhaEnvolvido[]) {
  return linhas
    .filter((l) => (l.corretor_id || l.nome.trim()) && l.percentual.trim())
    .map((l) => ({
      corretor_id: l.corretor_id || null,
      nome: l.corretor_id ? null : l.nome.trim(),
      papel: l.papel,
      percentual: l.percentual,
    }))
}

export function DivisaoEnvolvidos({
  linhas, onChange, valorComissao, corretores,
}: {
  linhas: LinhaEnvolvido[]
  onChange: (linhas: LinhaEnvolvido[]) => void
  valorComissao: number
  corretores: { id: string; nome: string }[]
}) {
  const previa = useMemo(() => {
    const normalizadas: ParticipanteNormalizado[] = linhasParaPayload(linhas).map((l) => ({
      corretor_id: l.corretor_id,
      nome: l.nome,
      papel: l.papel as ParticipanteNormalizado['papel'],
      percentual: Number(String(l.percentual).replace(',', '.')) || 0,
      observacoes: null,
    }))
    return dividirComissao(valorComissao, normalizadas)
  }, [linhas, valorComissao])

  const alterar = (uid: string, campo: Partial<LinhaEnvolvido>) =>
    onChange(linhas.map((l) => (l.uid === uid ? { ...l, ...campo } : l)))

  const remover = (uid: string) => onChange(linhas.filter((l) => l.uid !== uid))

  const adicionar = () =>
    onChange([...linhas, linhaVazia('e' + Date.now() + Math.random().toString(36).slice(2, 6))])

  return (
    <div style={{ border: '1px solid ' + D.line, borderRadius: 10, padding: 12, background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
        <strong style={{ fontSize: 13, color: D.ink }}>Divisão entre envolvidos</strong>
        <span style={{ fontSize: 11, color: D.muted }}>opcional</span>
      </div>
      <p style={{ fontSize: 11, color: D.muted, margin: '0 0 10px', lineHeight: 1.5 }}>
        Para negócios com mais de dois envolvidos. Se preencher, é esta divisão que vale no
        relatório por corretor — a fatia captador/vendedor acima vira só referência.
      </p>

      {linhas.length === 0 && (
        <p style={{ fontSize: 12, color: D.muted, margin: '0 0 10px' }}>
          Nenhum envolvido detalhado.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {linhas.map((l) => {
          const item = previa.itens.find(
            (i) => (i.corretor_id ?? '') === l.corretor_id && (i.nome ?? '') === (l.corretor_id ? '' : l.nome.trim()),
          )
          return (
            <div key={l.uid} style={{ background: D.bg, borderRadius: 8, padding: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <label>
                  <span style={rotulo}>Papel</span>
                  <select value={l.papel} onChange={(e) => alterar(l.uid, { papel: e.target.value })} style={campo}>
                    {PAPEIS_COMISSAO.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </label>
                <label>
                  <span style={rotulo}>Fatia (%)</span>
                  <input inputMode="decimal" value={l.percentual} placeholder="60"
                    onChange={(e) => alterar(l.uid, { percentual: e.target.value })} style={campo} />
                </label>
              </div>
              <label style={{ display: 'block', marginTop: 8 }}>
                <span style={rotulo}>Corretor cadastrado</span>
                <select value={l.corretor_id} onChange={(e) => alterar(l.uid, { corretor_id: e.target.value })} style={campo}>
                  <option value="">— não cadastrado —</option>
                  {corretores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </label>
              {/* Nome livre só aparece quando não há corretor escolhido: a
                  imobiliária da ponta e o parceiro de uma venda só nunca vão
                  virar cadastro, mas precisam aparecer na divisão. */}
              {!l.corretor_id && (
                <label style={{ display: 'block', marginTop: 8 }}>
                  <span style={rotulo}>Nome</span>
                  <input value={l.nome} placeholder="Imobiliária Fulano"
                    onChange={(e) => alterar(l.uid, { nome: e.target.value })} style={campo} />
                </label>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: D.ink }}>
                  {item ? fmt(item.valor) : '—'}
                </span>
                <button type="button" onClick={() => remover(l.uid)} aria-label="Remover envolvido"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid ' + D.line, borderRadius: 8, padding: '7px 10px', fontSize: 12, color: D.muted, cursor: 'pointer', minHeight: 36 }}>
                  <Trash2 size={13} aria-hidden /> Remover
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <button type="button" onClick={adicionar}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, background: 'none', border: '1px dashed ' + D.line, borderRadius: 8, padding: '9px 12px', fontSize: 12.5, fontWeight: 700, color: D.bronze, cursor: 'pointer', minHeight: 40, width: '100%', justifyContent: 'center' }}>
        <Plus size={14} aria-hidden /> Adicionar envolvido
      </button>

      {linhas.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 12, color: previa.excedeu ? D.erro : D.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
          {previa.excedeu && <AlertTriangle size={13} aria-hidden />}
          {previa.excedeu
            ? `A soma é ${previa.somaPercentual}% — acima de 100%. Ajuste antes de salvar.`
            : `Somado: ${previa.somaPercentual}%`}
          {!previa.excedeu && previa.sobraPercentual > 0 && (
            <span style={{ color: D.alerta, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={12} aria-hidden />
              sobram {previa.sobraPercentual}% ({fmt(previa.valorNaoAtribuido)}) sem dono
            </span>
          )}
        </div>
      )}
    </div>
  )
}
