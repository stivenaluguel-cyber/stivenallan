import { Building2, Instagram } from 'lucide-react'

/** Ícone do motivo por que o lead não tem WhatsApp real — ver motivoSemWhatsappReal em @/lib/leads/normalize. */
export function IconeOrigemMotivo({ origem, size = 12 }: { origem: 'instagram' | 'prospeccao'; size?: number }) {
  return origem === 'prospeccao' ? <Building2 size={size} aria-hidden /> : <Instagram size={size} aria-hidden />
}
