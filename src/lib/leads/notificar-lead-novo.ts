import type { SupabaseClient } from '@supabase/supabase-js'
import webpush from 'web-push'
import { logError, logWarn } from '@/lib/log'

const SOURCE = 'notificar-lead-novo'

export type LeadNovoInfo = {
  id: string
  nome: string | null
  origem: string | null
}

const ORIGEM_LABEL: Record<string, string> = {
  'Meta Ads': 'Meta Ads',
  'Google Ads': 'Google Ads',
  'Instagram DM': 'Instagram (DM)',
  Site: 'site',
  whatsapp: 'WhatsApp',
}

function configurarWebPush(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return false
  // mailto genérico exigido pelo protocolo VAPID (contato do "remetente" das
  // notificações) — não é enviado a lugar nenhum, só viaja no JWT do push.
  webpush.setVapidDetails('mailto:contato@stivenallan.com.br', publicKey, privateKey)
  return true
}

// Best-effort dos dois lados (bell in-app + push real) — nunca lança
// exceção pro chamador. Um lead já foi salvo com sucesso quando isso é
// chamado; falha em notificar não pode derrubar a resposta da rota.
export async function notificarLeadNovo(
  supabase: SupabaseClient,
  lead: LeadNovoInfo,
  opcoes?: {
    /**
     * Janela em minutos para não repetir notificação do MESMO lead.
     *
     * O espelho chama isto até três vezes em segundos — pedir a simulação,
     * marcar "já quero" e reenviar com a entrada ajustada são três requisições
     * separadas. No teste de 29/07 o corretor recebeu "Novo lead: teste 4444"
     * três vezes seguidas. Sem a janela, a notificação vira ruído e ele para
     * de olhar justamente o canal que deveria acordá-lo.
     */
    naoRepetirPorMinutos?: number
    tituloCustom?: string
    corpoCustom?: string
  },
): Promise<void> {
  try {
    const { data: admin } = await supabase.from('admin_users').select('id').limit(1).maybeSingle()

    const nome = lead.nome?.trim() || 'Lead sem nome'
    const origemLabel = (lead.origem && ORIGEM_LABEL[lead.origem]) || lead.origem || 'origem desconhecida'
    const titulo = opcoes?.tituloCustom ?? `Novo lead: ${nome}`
    const corpo = opcoes?.corpoCustom ?? `Chegou pelo ${origemLabel}.`

    const janela = opcoes?.naoRepetirPorMinutos
    if (janela && janela > 0) {
      const desde = new Date(Date.now() - janela * 60_000).toISOString()
      const { data: recente } = await supabase
        .from('crm_notificacoes')
        .select('id')
        .eq('tipo', 'lead_novo')
        // O título entra na chave, não só o lead. Repetir "Novo lead: teste" é
        // ruído; "Quer a unidade 1204" e "Quer a unidade 1505" são dois fatos
        // diferentes — e agora que o visitante é lembrado entre unidades, a
        // mesma pessoa percorre várias na mesma sessão.
        .eq('titulo', titulo)
        .contains('metadata', { leadId: lead.id })
        .gte('created_at', desde)
        .limit(1)
      if (recente && recente.length > 0) return
    }
    const link = `/dashboard/crm?lead=${lead.id}`

    await supabase.from('crm_notificacoes').insert({
      admin_id: admin?.id ?? null,
      tipo: 'lead_novo',
      titulo,
      corpo,
      lida: false,
      link,
      metadata: { leadId: lead.id, origem: lead.origem },
    })

    if (!configurarWebPush()) return

    const { data: subs } = await supabase.from('crm_push_subscriptions').select('id, endpoint, p256dh, auth')
    if (!subs || subs.length === 0) return

    const payload = JSON.stringify({ title: titulo, body: corpo, url: link })

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
          )
        } catch (err) {
          const statusCode = (err as { statusCode?: number })?.statusCode
          if (statusCode === 404 || statusCode === 410) {
            // Assinatura expirada/revogada (app desinstalado, permissão
            // revogada) — o próprio serviço de push confirma que não
            // adianta tentar de novo; remove pra não acumular lixo.
            await supabase.from('crm_push_subscriptions').delete().eq('id', sub.id)
          } else {
            logWarn(SOURCE, 'falha ao enviar push', { subId: sub.id, statusCode })
          }
        }
      }),
    )
  } catch (err) {
    logError(SOURCE, 'falha ao notificar lead novo', err, { leadId: lead.id })
  }
}
