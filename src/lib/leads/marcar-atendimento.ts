import type { SupabaseClient } from '@supabase/supabase-js'
import { logError } from '@/lib/log'

const SOURCE = 'lib/leads/marcar-atendimento'

/**
 * Carimba o primeiro atendimento do lead.
 *
 * `leads.primeiro_atendimento_em` existia no schema desde sempre e NADA no
 * sistema escrevia nela. Enquanto isso não foi ligado, o selo de SLA no card
 * nunca conseguia sair de "vencido" — porque a única coisa que o faz parar é
 * esta coluna.
 *
 * O `is('primeiro_atendimento_em', null)` no filtro é o que torna a chamada
 * idempotente: a marca é do PRIMEIRO atendimento, então a segunda nota do dia
 * não pode empurrar o carimbo para frente e fazer um lead atendido em 5
 * minutos parecer atendido em 5 horas.
 *
 * Nunca lança: é registro de apoio, e derrubar o salvamento de uma anotação
 * por causa dele seria pior do que perder o carimbo.
 */
export async function marcarPrimeiroAtendimento(
  client: SupabaseClient,
  leadId: string | null | undefined,
  quando: Date = new Date(),
): Promise<void> {
  if (!leadId) return
  try {
    const { error } = await client
      .from('leads')
      .update({ primeiro_atendimento_em: quando.toISOString() })
      .eq('id', leadId)
      .is('primeiro_atendimento_em', null)

    if (error) logError(SOURCE, 'falha ao marcar primeiro atendimento', error, { leadId })
  } catch (e) {
    logError(SOURCE, 'falha ao marcar primeiro atendimento', e, { leadId })
  }
}
