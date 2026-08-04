import type { SupabaseClient } from '@supabase/supabase-js'

// Teto diário de mensagens automáticas de saída por lead. Hoje o webhook
// (resposta da IA) e o cron de follow-up mandam sem nenhum limite — um bug
// de loop ou uma falha de idempotência já bastaria pra estourar o número
// de mensagens/dia e arriscar banimento da instância Evolution. Isso NÃO
// se aplica a envio manual pelo painel (Stiven sempre pode responder).
export const LIMITE_DIARIO_PADRAO = 8

// Conta a partir de interacoes (fonte de verdade já usada pelo cron de
// follow-up), não de um contador em memória/Redis — precisa refletir o
// histórico real mesmo entre cold starts e múltiplas instâncias.
export async function podeEnviarAutomatico(
  supabase: SupabaseClient,
  leadId: string,
  limite: number = LIMITE_DIARIO_PADRAO,
): Promise<boolean> {
  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { count, error } = await supabase
    .from('interacoes')
    .select('id', { count: 'exact', head: true })
    .eq('lead_id', leadId)
    .eq('canal', 'whatsapp')
    .eq('direcao', 'saida')
    .gte('created_at', desde)

  // Erro na contagem não pode travar o atendimento — falha aberta (permite o
  // envio) e deixa o problema visível no log, em vez de silenciar leads reais.
  if (error) return true

  return (count ?? 0) < limite
}

// Interruptor mestre da automação PROATIVA (cadência de follow-up +
// enviar_whatsapp do motor de regras) — decisão de negócio, não de infra.
// EVOLUTION_API_URL/_KEY/_INSTANCE também são exigidos pelo bot que responde
// mensagem recebida (reativo, sempre aceito e nunca contestado), então a
// ausência deles não serve pra desligar só a automação proativa sem também
// apagar o atendimento. Default OFF de propósito — nasce esperando
// autorização comercial explícita, não "ligada até alguém desligar". Só a
// string exata 'true' liga; qualquer outro valor (incluindo ausente/typo)
// conta como desligado — fail-closed.
export function automacaoProativaAtiva(): boolean {
  return process.env.FOLLOWUP_AUTOMATICO_ATIVO === 'true'
}
