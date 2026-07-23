import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { sendMetaCapiEvent } from '@/lib/meta-capi'
import { ESTAGIO_META_EVENT } from '@/lib/dashboard/estagios'
import { logError } from '@/lib/log'

// Extraído de src/app/api/admin/leads/[id]/route.ts pra ser reutilizável por
// QUALQUER ponto do código que mude estagio_funil de um lead (Kanban PUT/PATCH,
// e agora também /api/admin/propostas) — antes só o Kanban registrava a
// transição em leads_interacoes e disparava o Meta CAPI; propostas mudava o
// estágio direto via update() solto, sem histórico e sem sinal pro Gerenciador
// de Anúncios.
//
// Loga a transição no histórico do lead (relatório de conversão por etapa) e
// dispara o evento correspondente pro Meta CAPI — todo avanço real de estágio
// vira sinal de otimização pro Gerenciador de Anúncios, não só o Lead inicial
// do formulário. Fire-and-forget: uma falha no CAPI (ex: token ausente, Graph
// API fora do ar) nunca deve impedir a mudança de estágio de completar.
export async function registrarMudancaEstagio(
  id: string,
  estagioDe: string,
  estagioPara: string,
  supabase: SupabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!),
): Promise<void> {
  await supabase.from('leads_interacoes').insert({
    lead_id: id,
    tipo: 'status_change',
    descricao: 'Movido de ' + estagioDe + ' para ' + estagioPara,
    estagio_de: estagioDe,
    estagio_para: estagioPara,
  })

  const eventName = ESTAGIO_META_EVENT[estagioPara as keyof typeof ESTAGIO_META_EVENT]
  if (!eventName) return
  const { data: lead } = await supabase.from('leads').select('nome, whatsapp, email, fbclid').eq('id', id).single()
  if (!lead?.nome || !lead?.whatsapp) return
  sendMetaCapiEvent({
    eventName,
    eventId: randomUUID(),
    nome: lead.nome,
    telefone: lead.whatsapp,
    email: lead.email,
    fbclid: lead.fbclid,
  }).then((result) => {
    if (!result.ok && !('skipped' in result)) logError('leads/registrarMudancaEstagio', 'capi falhou', new Error(result.error))
  }).catch((err) => logError('leads/registrarMudancaEstagio', 'capi exception', err))
}
