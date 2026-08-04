import type { SupabaseClient } from '@supabase/supabase-js'
import { enviarMensagem, enviarAlertaEscalada } from '@/lib/evolution'
import { podeEnviarAutomatico, automacaoProativaAtiva } from '@/lib/leads/whatsapp-envio-limite'
import { logError, logWarn } from '@/lib/log'

export type GatilhoTipo = 'estagio_parado_dias' | 'score_acima' | 'sem_resposta_dias'
export type AcaoTipo = 'mover_estagio' | 'notificar_stiven' | 'enviar_whatsapp'

export type RegraAutomacao = {
  id: string
  nome: string
  ativo: boolean
  gatilho_tipo: GatilhoTipo
  gatilho_params: Record<string, unknown>
  filtro_estagio: string[] | null
  acao_tipo: AcaoTipo
  acao_params: Record<string, unknown>
}

// Campos pré-computados pelo caller (a rota do cron, que tem acesso ao
// banco) — mantém esta função pura e testável sem Supabase, no mesmo
// espírito de lead-timeline.ts. null significa "não sei calcular isso pra
// esse lead" e nunca casa com gatilhos que dependem do dado ausente.
export type LeadParaRegra = {
  id: string
  estagio_funil: string
  lead_score: number | null
  diasNoEstagioAtual: number | null
  diasSemResposta: number | null
}

export function leadCasaNaRegra(lead: LeadParaRegra, regra: RegraAutomacao): boolean {
  if (regra.filtro_estagio && regra.filtro_estagio.length > 0 && !regra.filtro_estagio.includes(lead.estagio_funil)) {
    return false
  }

  switch (regra.gatilho_tipo) {
    case 'estagio_parado_dias': {
      const minimo = Number(regra.gatilho_params.dias)
      if (!Number.isFinite(minimo) || lead.diasNoEstagioAtual == null) return false
      return lead.diasNoEstagioAtual >= minimo
    }
    case 'score_acima': {
      const minimo = Number(regra.gatilho_params.score)
      if (!Number.isFinite(minimo) || lead.lead_score == null) return false
      return lead.lead_score >= minimo
    }
    case 'sem_resposta_dias': {
      const minimo = Number(regra.gatilho_params.dias)
      if (!Number.isFinite(minimo) || lead.diasSemResposta == null) return false
      return lead.diasSemResposta >= minimo
    }
    default:
      return false
  }
}

export type ContextoAcao = {
  leadId: string
  whatsapp: string
  nome: string | null
  leadScore: number | null
}

// Impuro (banco + Evolution API) — a lógica de decisão fica em
// leadCasaNaRegra, testável isolada. Cada ramo já respeita o opt-out (via
// podeEnviarAutomatico, que é chamado ANTES do envio) e o jitter/teto diário
// do item 4, porque passa pelas mesmas funções de src/lib/evolution.ts e
// src/lib/leads/whatsapp-envio-limite.ts usadas no webhook e no follow-up.
export async function executarAcao(
  supabase: SupabaseClient,
  ctx: ContextoAcao,
  regra: RegraAutomacao,
): Promise<boolean> {
  switch (regra.acao_tipo) {
    case 'mover_estagio': {
      const novoEstagio = String(regra.acao_params.estagio_funil ?? '').trim()
      if (!novoEstagio) {
        logWarn('automacao-regras', 'mover_estagio sem estagio_funil configurado', { regraId: regra.id })
        return false
      }
      const { error } = await supabase
        .from('leads')
        .update({ estagio_funil: novoEstagio, updated_at: new Date().toISOString() })
        .eq('id', ctx.leadId)
      if (error) {
        logError('automacao-regras', 'falha ao mover estagio', error, { regraId: regra.id, leadId: ctx.leadId })
        return false
      }
      await supabase.from('leads_interacoes').insert({
        lead_id: ctx.leadId,
        tipo: 'status_change',
        descricao: `Movido automaticamente pela regra "${regra.nome}"`,
        estagio_para: novoEstagio,
      })
      return true
    }

    case 'notificar_stiven': {
      await enviarAlertaEscalada(ctx.whatsapp, ctx.nome, ctx.leadScore ?? 0)
      return true
    }

    case 'enviar_whatsapp': {
      // Mesmo interruptor mestre da cadência de follow-up — uma regra pode
      // nascer ativa=true sem que a automação proativa como um todo esteja
      // autorizada. mover_estagio e notificar_stiven não passam por aqui:
      // não mandam mensagem pra lead, então não são cobertos por este freio.
      if (!automacaoProativaAtiva()) {
        logWarn('automacao-regras', 'automação proativa desativada (FOLLOWUP_AUTOMATICO_ATIVO), pulando enviar_whatsapp', { regraId: regra.id })
        return false
      }
      const template = String(regra.acao_params.mensagem ?? '').trim()
      if (!template) {
        logWarn('automacao-regras', 'enviar_whatsapp sem mensagem configurada', { regraId: regra.id })
        return false
      }
      if (!(await podeEnviarAutomatico(supabase, ctx.leadId))) {
        logWarn('automacao-regras', 'teto diário atingido, pulando envio da regra', { regraId: regra.id, leadId: ctx.leadId })
        return false
      }
      const mensagem = template.replace(/{nome}/g, (ctx.nome ?? 'tudo bem').split(' ')[0])
      const enviado = await enviarMensagem(ctx.whatsapp, mensagem)
      if (enviado) {
        await supabase.from('interacoes').insert({
          lead_id: ctx.leadId,
          canal: 'whatsapp',
          direcao: 'saida',
          mensagem,
          processado_por_ia: false,
          intencao_detectada: 'regra_automatica:' + regra.nome,
        })
      }
      return enviado
    }

    default:
      return false
  }
}
