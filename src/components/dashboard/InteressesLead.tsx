'use client'
import { useCallback, useEffect, useState } from 'react'
import { Check, Image as ImageIcon, MessageCircle, Ruler } from 'lucide-react'

// Histórico de empreendimentos consultados pelo lead (cadastro único) — estado
// agregado, não a timeline crua (essa continua na seção "Linha do tempo",
// alimentada por lead_eventos). Mesma receita de EnvolvidosLead/AnexosLead:
// componente próprio, busca sua própria API por leadId.

const D = {
  ink: '#161512', muted: '#6B655B', line: 'rgba(26,24,21,0.12)',
  bronze: '#D24E22', bg: '#F3F2EE', verde: '#25d366',
}

type Interesse = {
  property_id: string
  property_slug: string
  property_nome: string
  first_seen_at: string
  last_seen_at: string
  view_count: number
  unlocked_at: string | null
  whatsapp_clicked_at: string | null
  catalog_downloaded_at: string | null
  floorplan_viewed_at: string | null
  gallery_viewed_at: string | null
  availability_viewed_at: string | null
  source: string | null
  utm_source: string | null
  utm_campaign: string | null
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function ehHoje(iso: string): boolean {
  const d = new Date(iso)
  const agora = new Date()
  return d.toDateString() === agora.toDateString()
}

const marco: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: D.muted,
}

export function InteressesLead({ leadId }: { leadId: string }) {
  const [lista, setLista] = useState<Interesse[]>([])
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/interesses`)
      const json = await res.json()
      if (res.ok) setLista(json.interesses ?? [])
    } catch {
      // silencioso: a ficha do lead não pode quebrar por isto
    } finally {
      setCarregando(false)
    }
  }, [leadId])

  useEffect(() => { carregar() }, [carregar])

  if (carregando) return null

  if (lista.length === 0) {
    return (
      <p style={{ fontSize: 13, color: D.muted, margin: 0 }}>
        Ainda não consultou nenhum empreendimento pelo cadastro único.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {lista.map((i) => (
        <div key={i.property_id} style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: D.ink }}>{i.property_nome}</span>
            <span style={{ fontSize: 11, color: D.muted, background: D.bg, borderRadius: 999, padding: '2px 8px', whiteSpace: 'nowrap' }}>
              {i.view_count} {i.view_count === 1 ? 'visita' : 'visitas'}
            </span>
          </div>
          <div style={{ fontSize: 11, color: D.muted, marginTop: 2 }}>
            1ª visita: {formatarData(i.first_seen_at)} · {ehHoje(i.last_seen_at) ? 'liberado hoje' : `última: ${formatarData(i.last_seen_at)}`}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
            {i.gallery_viewed_at && <span style={marco}><Check size={12} color={D.verde} aria-hidden /> Galeria</span>}
            {i.floorplan_viewed_at && <span style={marco}><Ruler size={12} color={D.verde} aria-hidden /> Plantas</span>}
            {i.availability_viewed_at && <span style={marco}><Check size={12} color={D.verde} aria-hidden /> Disponibilidade</span>}
            {i.catalog_downloaded_at && <span style={marco}><ImageIcon size={12} color={D.verde} aria-hidden /> Catálogo baixado</span>}
            {i.whatsapp_clicked_at && <span style={marco}><MessageCircle size={12} color={D.verde} aria-hidden /> WhatsApp clicado</span>}
          </div>
          {(i.utm_source || i.utm_campaign) && (
            <div style={{ fontSize: 10.5, color: D.muted, marginTop: 6 }}>
              origem: {[i.utm_source, i.utm_campaign].filter(Boolean).join(' / ')}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default InteressesLead
