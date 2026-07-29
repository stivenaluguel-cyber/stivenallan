import type { SupabaseClient } from '@supabase/supabase-js'
import { logError } from '@/lib/log'

const SOURCE = 'lib/unidades/lead-do-espelho'

export type OrigemEspelho = 'reserva' | 'simulacao'

export type ResultadoLead =
  | { ok: true; leadId: string; nasceuAgora: boolean }
  | { ok: false; erro: string }

/**
 * Resolve-ou-cria o lead que veio do espelho de vendas, com o interesse
 * carimbado no card.
 *
 * Extraído porque a reserva e a simulação precisam exatamente do mesmo
 * comportamento — e porque o primeiro corte deixava um buraco: o lead nascia,
 * mas SEM o empreendimento e a unidade nos campos que o Kanban desenha. O
 * corretor via "Roberto Lima, origem espelho" e tinha que abrir a timeline
 * para descobrir qual apartamento a pessoa queria.
 *
 * Regra que não muda: o upsert grava só `whatsapp`. Nome, origem e interesse
 * preenchem apenas o que está VAZIO — um formulário do site não apaga a
 * qualificação que o corretor já apurou na conversa.
 */
export async function resolverLeadDoEspelho(
  client: SupabaseClient,
  dados: {
    whatsapp: string
    nome: string
    email?: string | null
    empreendimentoId?: string | null
    empreendimentoNome: string
    unidadeRotulo: string
    origem: OrigemEspelho
  },
): Promise<ResultadoLead> {
  const { data: lead, error } = await client
    .from('leads')
    .upsert({ whatsapp: dados.whatsapp }, { onConflict: 'whatsapp' })
    .select('id, nome, origem, created_at, empreendimento_interesse, property_name, estagio_funil')
    .single()

  if (error || !lead) {
    logError(SOURCE, 'falha ao resolver lead', error, { origem: dados.origem })
    return { ok: false, erro: 'Não foi possível registrar seu contato' }
  }

  const nasceuAgora = Date.now() - new Date(lead.created_at as string).getTime() < 90_000
  const completar: Record<string, unknown> = {}

  if (!lead.nome && dados.nome) completar.nome = dados.nome
  if (dados.email) completar.email = dados.email

  // `whatsapp` é o default do sistema e não diz nada sobre intenção — pode
  // ser sobrescrito pela origem real. Qualquer outra origem já apurada fica.
  if (!lead.origem || lead.origem === 'whatsapp') completar.origem = 'espelho'

  // O que faltava para o card do Kanban fazer sentido sozinho.
  if (!lead.empreendimento_interesse && dados.empreendimentoId) {
    completar.empreendimento_interesse = dados.empreendimentoId
  }
  if (!lead.property_name) {
    completar.property_name = `${dados.empreendimentoNome} · unidade ${dados.unidadeRotulo}`
  }

  // Quem simula ou reserva demonstrou interesse concreto — mais que
  // "primeiro_contato". Só promove lead que ainda está no início; não
  // rebaixa nem atropela quem já avançou no funil.
  if (!lead.estagio_funil || lead.estagio_funil === 'primeiro_contato') {
    completar.estagio_funil = 'interessado'
  }

  if (Object.keys(completar).length > 0) {
    const { error: erroUpdate } = await client.from('leads').update(completar).eq('id', lead.id)
    // Falhar aqui não invalida o lead: ele existe e o corretor vai vê-lo.
    if (erroUpdate) logError(SOURCE, 'falha ao completar lead', erroUpdate, { leadId: lead.id })
  }

  return { ok: true, leadId: lead.id as string, nasceuAgora }
}
