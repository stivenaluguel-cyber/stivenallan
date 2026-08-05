'use client'
import { useLeadAccess } from '@/hooks/useLeadAccess'
import { useLeadAccessContext } from './LeadSessionProvider'
import { usePropertyInterest } from '@/hooks/usePropertyInterest'
import { trackWhatsappClick } from '@/lib/tracking'

type Props = {
  propertyId: string
  propertySlug: string
  propertyName: string
  gateEnabled: boolean
  historyEnabled: boolean
  whatsappNumber: string
  message: string
  position: string
  className?: string
  children: React.ReactNode
}

// CTA de WhatsApp "contextualizado" pra usar DENTRO de conteúdo já liberado
// (ex.: ao lado da ficha técnica completa). Só abre o wa.me de verdade depois
// de confirmado unlocked=true; se por algum motivo renderizar ainda locked
// (ex.: sessão expirou entre o load e o clique), redireciona pro formulário
// em vez de abrir WhatsApp como se o cadastro tivesse funcionado.
export default function WhatsAppAfterLead({
  propertyId, propertySlug, propertyName, gateEnabled, historyEnabled, whatsappNumber, message, position, className, children,
}: Props) {
  const access = useLeadAccess(propertyId, propertySlug, gateEnabled)
  const ctx = useLeadAccessContext()
  const { recordEvent } = usePropertyInterest(propertyId, propertySlug, historyEnabled)

  const unlocked = !gateEnabled || access.status === 'unlocked'
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

  function handleClick(e: React.MouseEvent) {
    if (!unlocked) {
      e.preventDefault()
      ctx.requestUnlock()
      return
    }
    trackWhatsappClick({ content_name: propertyName, empreendimento: propertySlug, position })
    recordEvent('whatsapp_click')
    // link real segue o clique normalmente — não precisa preventDefault aqui
  }

  return (
    <a href={unlocked ? href : undefined} target="_blank" rel="noopener noreferrer" onClick={handleClick} className={className}>
      {children}
    </a>
  )
}
