import type { SupabaseClient } from '@supabase/supabase-js'
import { calcularScore, detalheParaPersistir, type LeadParaScore, type SinaisLead } from './score'
import { logError } from '@/lib/log'

const SOURCE = 'lib/leads/score-server'

// Campos que o motor de score lê. Selecionar `*` traria anotações e
// observações de IA que não entram no cálculo e só engordam a resposta.
const CAMPOS_SCORE =
  'id, nome, email, perfil, orcamento_min, orcamento_max, entrada_disponivel, faixa_investimento, ' +
  'prazo_compra, cidade_interesse, origem, ultimo_contato, created_at'

// Lote generoso mas finito: a RPC de sinais faz seis agregações por chamada e
// `= any(array)` com dez mil ids deixa de usar índice.
const TAMANHO_LOTE = 200

export type ScoreAplicado = {
  lead_id: string
  score: number
  classificacao: string
}

/**
 * Recalcula e persiste o score de um conjunto de leads.
 *
 * Devolve o que foi aplicado. Nunca lança: score é informação de apoio, e
 * derrubar o salvamento de uma anotação porque a agregação falhou seria pior
 * do que ficar com o score velho por algumas horas.
 */
export async function recalcularScores(
  client: SupabaseClient,
  leadIds: string[],
  agora: Date = new Date(),
): Promise<ScoreAplicado[]> {
  const ids = [...new Set(leadIds.filter((id) => typeof id === 'string' && id))]
  if (ids.length === 0) return []

  const aplicados: ScoreAplicado[] = []

  for (let i = 0; i < ids.length; i += TAMANHO_LOTE) {
    const lote = ids.slice(i, i + TAMANHO_LOTE)
    try {
      const [{ data: leads, error: erroLeads }, { data: sinaisBruto, error: erroSinais }] = await Promise.all([
        client.from('leads').select(CAMPOS_SCORE).in('id', lote),
        client.rpc('sinais_lead_score', { p_lead_ids: lote }),
      ])

      if (erroLeads) throw erroLeads
      if (erroSinais) throw erroSinais

      const sinais = (sinaisBruto ?? {}) as Record<string, SinaisLead>

      for (const lead of (leads ?? []) as unknown as (LeadParaScore & { id: string })[]) {
        const r = calcularScore(lead, sinais[lead.id], agora)
        const { error } = await client
          .from('leads')
          .update({
            lead_score: r.score,
            lead_score_detalhe: detalheParaPersistir(r),
            lead_score_atualizado_em: r.calculadoEm,
          })
          .eq('id', lead.id)

        // Um lead que falhou não pode abortar o lote inteiro.
        if (error) {
          logError(SOURCE, 'falha ao gravar score do lead', error, { leadId: lead.id })
          continue
        }
        aplicados.push({ lead_id: lead.id, score: r.score, classificacao: r.classificacao })
      }
    } catch (e) {
      logError(SOURCE, 'falha ao recalcular lote de scores', e, { tamanho: lote.length })
    }
  }

  return aplicados
}

/**
 * Atalho para um lead só. Usado nos pontos de mutação (anexo enviado,
 * simulação salva, proposta criada, etapa movida) para o score refletir a
 * ação imediatamente, sem esperar o recálculo diário.
 */
export async function recalcularScoreLead(
  client: SupabaseClient,
  leadId: string | null | undefined,
  agora: Date = new Date(),
): Promise<ScoreAplicado | null> {
  if (!leadId) return null
  const [r] = await recalcularScores(client, [leadId], agora)
  return r ?? null
}

/**
 * Recálculo da base ativa. Chamado pelo cron diário: sem isso o componente de
 * timing nunca decai — um lead contatado em março continuaria "quente" para
 * sempre, porque nada mais aconteceria com ele para disparar um recálculo.
 */
export async function recalcularBaseAtiva(
  client: SupabaseClient,
  agora: Date = new Date(),
): Promise<{ processados: number }> {
  const { data, error } = await client
    .from('leads')
    .select('id')
    // Lead encerrado não volta para a fila; recalcular custa e não muda nada.
    // Valores conferidos contra leads_estagio_funil_check.
    .not('estagio_funil', 'in', '("fechado","perdido")')
    .limit(5000)

  if (error) {
    logError(SOURCE, 'falha ao listar leads para recálculo diário', error)
    return { processados: 0 }
  }

  const ids = (data ?? []).map((l) => l.id as string)
  const aplicados = await recalcularScores(client, ids, agora)
  return { processados: aplicados.length }
}
