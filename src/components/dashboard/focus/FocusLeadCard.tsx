'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Building2, CalendarDays, CircleAlert, Lightbulb, MessageCircle, PenLine, Repeat, Wallet } from 'lucide-react'
import { D, fmt, tempInfo } from './tokens'
import { LeadAttentionBadges } from './LeadAttentionBadge'
import { ESTAGIOS_FUNIL } from '@/lib/dashboard/estagios'
import { motivoSemWhatsappReal, temWhatsappReal } from '@/lib/leads/normalize'
import { formatSaoPauloDateTime } from '@/lib/dashboard/timezone-sp'
import type { FocusQueueItem } from '@/lib/dashboard/use-focus-queue'

const LIMITE_NOTA = 140

function UltimaNota({ texto }: { texto: string }) {
  const [expandida, setExpandida] = useState(false)
  const longa = texto.length > LIMITE_NOTA
  return (
    <div style={{ fontSize: 12.5, color: D.muted, fontStyle: 'italic' }}>
      &ldquo;{longa && !expandida ? texto.slice(0, LIMITE_NOTA) + '…' : texto}&rdquo;
      {longa && (
        <button
          onClick={() => setExpandida((v) => !v)}
          style={{ background: 'none', border: 'none', color: D.bronze, fontWeight: 700, fontSize: 12, cursor: 'pointer', marginLeft: 6, padding: '6px 2px', fontStyle: 'normal' }}
        >
          {expandida ? 'Ver menos' : 'Ver mais'}
        </button>
      )}
    </div>
  )
}

function iniciais(nome?: string | null, whatsapp?: string) {
  if (nome && nome.trim()) {
    const partes = nome.trim().split(/\s+/)
    return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase()
  }
  return (whatsapp ?? '?').slice(-2)
}

function parseUltimaNota(anotacoesRaw?: string | null): string | null {
  if (!anotacoesRaw) return null
  try {
    const j = JSON.parse(anotacoesRaw)
    if (Array.isArray(j) && j.length > 0) return j[0].texto ?? null
  } catch {
    return anotacoesRaw.trim() || null
  }
  return null
}

function diasNoFunil(createdAt: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000))
}

type Props = {
  item: FocusQueueItem
  contatoPendenteConfirmacao: boolean
  processando: boolean
  tituloRef?: React.RefObject<HTMLHeadingElement | null>
  onAbrirWhatsApp: () => void
  onConfirmarContato: () => void
  onAdicionarNota: (texto: string) => void
  onMoverEtapa: (novoEstagio: string) => void
}

export function FocusLeadCard({ item, contatoPendenteConfirmacao, processando, tituloRef, onAbrirWhatsApp, onConfirmarContato, onAdicionarNota, onMoverEtapa }: Props) {
  const { lead } = item
  const t = tempInfo(lead.temperatura)
  const est = ESTAGIOS_FUNIL.find((e) => e.key === lead.estagio_funil)
  const [notaAberta, setNotaAberta] = useState(false)
  const [nota, setNota] = useState('')
  const [movendoEtapa, setMovendoEtapa] = useState(false)
  const ultimaNota = parseUltimaNota(lead.anotacoes)

  // Fire-and-forget: a mutação real e a pontuação acontecem no page.tsx via
  // useFocusActionRunner (que já trata erro/retry/estado de "processando"
  // de forma centralizada); o card só limpa o campo otimisticamente.
  function salvarNota() {
    if (!nota.trim() || processando) return
    onAdicionarNota(nota.trim())
    setNota('')
    setNotaAberta(false)
  }

  return (
    <div style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid ' + D.line }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <span style={{ width: 48, height: 48, borderRadius: '50%', background: t.cor + '1c', color: t.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
            {iniciais(lead.nome, lead.whatsapp)}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {/* tabIndex -1 + ref: o foco vai pra cá quando o card troca,
                  pra quem usa teclado/leitor de tela perceber a mudança. */}
              <h2 ref={tituloRef} tabIndex={-1} style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 18, fontWeight: 800, color: D.ink, margin: 0, outline: 'none' }}>
                {lead.nome || '+' + lead.whatsapp}
              </h2>
              <span title={t.label} style={{ fontSize: 12, fontWeight: 700, color: t.cor, display: 'inline-flex', alignItems: 'center', gap: 3 }}>{t.emoji} {t.label}</span>
            </div>
            <div style={{ fontSize: 12.5, color: D.muted, marginTop: 2 }}>
              {est?.label ?? lead.estagio_funil} · {lead.origem ?? 'origem desconhecida'}
              {lead.empreendimentos?.cidade ? ' · ' + lead.empreendimentos.cidade : ''}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <LeadAttentionBadges item={item} />
        </div>

        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 8 }}>
          <div style={{ background: item.prioridade.level === 'urgent' ? '#FFF7ED' : '#F7F7F5', border: '1px solid ' + (item.prioridade.level === 'urgent' ? '#FED7AA' : D.line), borderRadius: 10, padding: '10px 11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: item.prioridade.level === 'urgent' ? '#C2410C' : D.muted, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <CircleAlert size={12} /> Por que está aqui
            </div>
            <div style={{ color: D.ink, fontSize: 13, fontWeight: 750, marginTop: 4 }}>{item.prioridade.title}</div>
            <div style={{ color: D.muted, fontSize: 12, marginTop: 2, lineHeight: 1.35 }}>{item.prioridade.detail}</div>
          </div>
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '10px 11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#15803D', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Lightbulb size={12} /> Próxima melhor ação
            </div>
            <div style={{ color: D.ink, fontSize: 13, fontWeight: 750, marginTop: 4 }}>{item.recomendacao.title}</div>
            <div style={{ color: D.muted, fontSize: 12, marginTop: 2, lineHeight: 1.35 }}>{item.recomendacao.detail}</div>
          </div>
        </div>

        {/* Compromisso vencido com a data exata — não só "há um compromisso
            atrasado". Só aparece quando existe de fato um vencido. */}
        {item.compromissoVencido && (
          <div style={{ marginTop: 10, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '9px 11px', fontSize: 12.5, color: '#991B1B' }}>
            <strong>{item.compromissoVencido.titulo}</strong> estava marcado para{' '}
            {formatSaoPauloDateTime(item.compromissoVencido.inicio)} e continua pendente.
          </div>
        )}
      </div>

      <div style={{ padding: '16px 22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, borderBottom: '1px solid ' + D.line }}>
        {lead.empreendimentos?.nome || lead.property_name ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Building2 size={15} color={D.muted} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 10, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Empreendimento</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: D.ink }}>{lead.empreendimentos?.nome ?? lead.property_name}</div>
            </div>
          </div>
        ) : null}
        {typeof lead.orcamento_max === 'number' && lead.orcamento_max > 0 && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Wallet size={15} color={D.muted} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 10, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Orçamento</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: D.ink }}>{fmt(lead.orcamento_max)}</div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <CalendarDays size={15} color={D.muted} style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 10, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Último contato</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: D.ink }}>
              {lead.ultimo_contato
                ? `há ${item.diasSemContato ?? 0} ${item.diasSemContato === 1 ? 'dia' : 'dias'}`
                : 'nunca contatado'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <CalendarDays size={15} color={D.muted} style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 10, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>No funil há</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: D.ink }}>{diasNoFunil(lead.created_at)} dias</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ flex: 1, height: 5, borderRadius: 999, background: D.line, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: Math.min(100, lead.lead_score ?? 0) + '%', background: (lead.lead_score ?? 0) >= 60 ? D.green : (lead.lead_score ?? 0) >= 30 ? D.amber : D.muted }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: D.ink }}>{lead.lead_score ?? 0}</span>
          </div>
        </div>
      </div>

      {(item.proximoEvento || ultimaNota) && (
        <div style={{ padding: '14px 22px', borderBottom: '1px solid ' + D.line, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {item.proximoEvento && (
            <div style={{ fontSize: 12.5, color: D.ink }}>
              <strong>Próxima ação:</strong> {item.proximoEvento.titulo} — {formatSaoPauloDateTime(item.proximoEvento.inicio)}
            </div>
          )}
          {ultimaNota && <UltimaNota texto={ultimaNota} />}
        </div>
      )}

      <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {temWhatsappReal(lead.whatsapp) ? (
            <button
              onClick={onAbrirWhatsApp}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#25D366', color: '#fff', border: item.recomendacao.action === 'whatsapp' ? '2px solid #15803D' : 'none', borderRadius: 8, padding: '9px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', minHeight: 44, boxShadow: item.recomendacao.action === 'whatsapp' ? '0 0 0 2px rgba(34,197,94,0.16)' : 'none' }}
            >
              <MessageCircle size={14} /> {item.recomendacao.action === 'whatsapp' ? 'WhatsApp · recomendado' : 'WhatsApp'}
            </button>
          ) : (
            <span
              title={
                motivoSemWhatsappReal(lead.whatsapp)?.label === 'Prospecção'
                  ? 'Lead promovido da Prospecção — telefone encontrado não é celular. Confirme um número de verdade e edite o lead.'
                  : 'Lead veio de DM do Instagram — ainda sem telefone. Responda por lá e edite o lead quando conseguir o número.'
              }
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: D.bg, color: D.muted, border: '1px solid ' + D.line, borderRadius: 8, padding: '9px 14px', fontSize: 12.5, fontWeight: 700, minHeight: 44 }}
            >
              <MessageCircle size={14} /> Só {motivoSemWhatsappReal(lead.whatsapp)?.label} (sem telefone)
            </span>
          )}
          <button
            onClick={() => setNotaAberta((v) => !v)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: D.bg, color: D.ink, border: '1px solid ' + D.line, borderRadius: 8, padding: '9px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', minHeight: 44 }}
          >
            <PenLine size={14} /> Anotação
          </button>
          <button
            onClick={() => setMovendoEtapa((v) => !v)}
            disabled={processando}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: D.bg, color: D.ink, border: '1px solid ' + D.line, borderRadius: 8, padding: '9px 14px', fontSize: 12.5, fontWeight: 700, cursor: processando ? 'default' : 'pointer', minHeight: 44, opacity: processando ? 0.6 : 1 }}
          >
            <Repeat size={14} /> Mover etapa
          </button>
          <Link
            href={'/dashboard/crm?lead=' + lead.id}
            target="_blank"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: D.bronze, border: '1px solid ' + D.line, borderRadius: 8, padding: '9px 14px', fontSize: 12.5, fontWeight: 700, textDecoration: 'none', minHeight: 44 }}
          >
            Detalhes completos <ArrowUpRight size={14} />
          </Link>
        </div>

        {contatoPendenteConfirmacao && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '8px 12px' }}>
            <span style={{ fontSize: 12.5, color: '#1D4ED8', flex: 1 }}>Conversa aberta no WhatsApp. O contato foi realizado?</span>
            <button onClick={onConfirmarContato} disabled={processando} style={{ background: '#1D4ED8', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: processando ? 'default' : 'pointer', minHeight: 44, opacity: processando ? 0.6 : 1 }}>
              Contato realizado
            </button>
          </div>
        )}

        {notaAberta && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              autoFocus
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') salvarNota() }}
              placeholder="Anotação rápida sobre este lead..."
              aria-label="Nova anotação"
              style={{ flex: 1, border: '1.5px solid ' + D.line, borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none' }}
            />
            <button onClick={salvarNota} disabled={processando || !nota.trim()} style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '0 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', opacity: processando || !nota.trim() ? 0.5 : 1 }}>
              Salvar
            </button>
          </div>
        )}

        {movendoEtapa && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ESTAGIOS_FUNIL.filter((e) => e.key !== lead.estagio_funil).map((e) => (
              <button
                key={e.key}
                disabled={processando}
                onClick={() => { onMoverEtapa(e.key); setMovendoEtapa(false) }}
                style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 999, border: '1px solid ' + e.cor, background: e.cor + '14', color: e.cor, cursor: processando ? 'default' : 'pointer', opacity: processando ? 0.6 : 1 }}
              >
                {e.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
