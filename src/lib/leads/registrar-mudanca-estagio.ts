import { after } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { sendMetaCapiEvent } from '@/lib/meta-capi'
import { sendGoogleAdsConversion } from '@/lib/google-ads-conversion'
import { ESTAGIO_META_EVENT } from '@/lib/dashboard/estagios'
import { logError } from '@/lib/log'

// Extraido de src/app/api/admin/leads/[id]/route.ts para ser reaproveitado
// por qualquer fluxo que mude estagio_funil (Kanban do CRM, Modo Foco, etc.)
// sem duplicar o disparo de conversao pro Meta CAPI / Google Ads.
//
// Loga a transicao no historico do lead (relatorio de conversao por etapa)
// e dispara o evento correspondente pro Meta CAPI e pro Google Ads (offline
// click conversion) — todo avanco real de estagio vira sinal de otimizacao
// pros dois Gerenciadores de Anuncios, nao so o Lead inicial do formulario.
// Os disparos rodam dentro de after() (Next.js): a resposta nao espera por
// eles (uma falha — token ausente, API fora do ar, lead sem gclid/fbclid —
// nunca trava o corretor), mas o runtime da Vercel mantem a funcao viva ate
// completarem. Sem after(), uma promise disparada e nao aguardada podia ser
// congelada assim que a resposta HTTP saia.
export async function registrarMudancaEstagio(
  client: SupabaseClient<any, any, any>,
  id: string,
  estagioDe: string,
  estagioPara: string,
) {
  await client.from('leads_interacoes').insert({
    lead_id: id,
    tipo: 'status_change',
    descricao: 'Movido de ' + estagioDe + ' para ' + estagioPara,
    estagio_de: estagioDe,
    estagio_para: estagioPara,
  })

  const eventName = ESTAGIO_META_EVENT[estagioPara as keyof typeof ESTAGIO_META_EVENT]
  if (!eventName) return
  const { data: lead } = await client.from('leads').select('nome, whatsapp, email, fbclid, gclid').eq('id', id).single()
  if (!lead?.nome || !lead?.whatsapp) return

  after(async () => {
    const result = await sendMetaCapiEvent({
      eventName,
      eventId: randomUUID(),
      nome: lead.nome,
      telefone: lead.whatsapp,
      email: lead.email,
      fbclid: lead.fbclid,
    })
    if (!result.ok && !('skipped' in result)) logError('registrarMudancaEstagio', 'capi falhou', new Error(result.error))
  })

  after(async () => {
    const result = await sendGoogleAdsConversion({
      estagioFunil: estagioPara,
      gclid: lead.gclid ?? '',
      conversionDateTime: new Date(),
    })
    if (!result.ok && !('skipped' in result)) logError('registrarMudancaEstagio', 'google ads conversion falhou', new Error(result.error))
  })
}
