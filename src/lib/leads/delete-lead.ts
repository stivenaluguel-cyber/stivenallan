import type { SupabaseClient } from '@supabase/supabase-js'

// Apaga um lead e seus registros filhos (lead_eventos, leads_interacoes).
// Sem depender de ON DELETE CASCADE — essas tabelas foram criadas ad-hoc,
// não há garantia de cascade nas migrations versionadas.
export async function deleteLeadCascade(
  supabase: SupabaseClient<any, any, any>,
  leadId: string,
): Promise<{ error: { message: string } | null }> {
  await supabase.from('lead_eventos').delete().eq('lead_id', leadId)
  await supabase.from('leads_interacoes').delete().eq('lead_id', leadId)
  const { error } = await supabase.from('leads').delete().eq('id', leadId)
  return { error }
}
