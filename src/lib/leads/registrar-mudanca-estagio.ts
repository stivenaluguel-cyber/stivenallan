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
// Loga a transicao no historico do lead (relatorio de conversao por etapa),
// converte o lead em cliente (crm_clientes) quando chega em "fechado", e
// dispara o evento correspondente pro Meta CAPI e pro Google Ads (offline
// click conversion) — todo avanco real de estagio vira sinal de otimizacao
// pros dois Gerenciadores de Anuncios, nao so o Lead inicial do formulario.
// Os disparos rodam dentro de after() (Next.js): a resposta nao espera por
// eles (uma falha — token ausente, API fora do ar, lead sem gclid/fbclid —
// nunca trava o corretor), mas o runtime da Vercel mantem a funcao viva ate
// completarem. Sem after(), uma promise disparada e nao aguardada podia ser
// congelada assim que a resposta HTTP saia. A conversao em cliente roda
// SINCRONA (nao dentro de after()) — e um dado de negocio, nao telemetria de
// anuncio, entao nao deve ser "best effort e pode sumir silenciosamente".
// leads.anotacoes tem DOIS formatos convivendo: um array JSON
// [{ data, texto, clientEventId }] (mais recente primeiro) e texto puro
// (legado). Sem tratar isso, o JSON cru ia parar dentro do campo de notas do
// cliente — visto em producao no primeiro teste real da conversao.
// Mesma leitura defensiva de parseUltimaNota em FocusLeadCard.tsx.
export function formatarAnotacoes(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return raw.trim() // texto puro (legado)
  }
  if (!Array.isArray(parsed)) return raw.trim()

  const linhas = parsed
    .map((n) => {
      const texto = typeof (n as { texto?: unknown })?.texto === 'string' ? (n as { texto: string }).texto.trim() : ''
      if (!texto) return null
      const dataRaw = (n as { data?: unknown })?.data
      const data = typeof dataRaw === 'string' && dataRaw ? new Date(dataRaw) : null
      const dataLabel = data && !Number.isNaN(data.getTime()) ? data.toLocaleDateString('pt-BR') + ': ' : ''
      return dataLabel + texto
    })
    .filter((l): l is string => Boolean(l))

  return linhas.length > 0 ? linhas.join('\n') : null
}

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
  const { data: lead } = await client
    .from('leads')
    .select('nome, whatsapp, email, fbclid, gclid, origem, orcamento_max, anotacoes, empreendimentos(nome)')
    .eq('id', id)
    .single()
  if (!lead?.nome || !lead?.whatsapp) return

  if (estagioPara === 'fechado') {
    const empNome = (lead as { empreendimentos?: { nome?: string } | null }).empreendimentos?.nome
    const notas = [
      `Convertido automaticamente do lead em ${new Date().toLocaleDateString('pt-BR')}${empNome ? ' — interesse em ' + empNome : ''}.`,
      formatarAnotacoes(lead.anotacoes),
    ].filter(Boolean).join('\n\n')

    const { error: clienteError } = await client.from('crm_clientes').upsert(
      {
        lead_id: id,
        nome: lead.nome,
        telefone: lead.whatsapp,
        email: lead.email || null,
        origem: lead.origem || 'outros',
        busca_valor_max: lead.orcamento_max || null,
        notas,
      },
      { onConflict: 'lead_id' },
    )
    if (clienteError) logError('registrarMudancaEstagio', 'falha ao converter lead em cliente', clienteError)
  }

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
