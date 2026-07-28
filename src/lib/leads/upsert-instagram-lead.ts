import type { SupabaseClient } from '@supabase/supabase-js'
import { IG_WHATSAPP_PLACEHOLDER_PREFIX } from './normalize'

export type InstagramLeadResult =
  | { status: 'created'; id: string }
  | { status: 'existing'; id: string }
  | { status: 'skipped'; motivo: string }

// Resolve-ou-cria o lead pelo IGSID (sender.id da conversa) — sem telefone
// real disponível, usa `ig:<igsid>` como placeholder em `whatsapp` (coluna
// NOT NULL + UNIQUE) só pra dar um identificador estável e evitar duplicar
// lead a cada mensagem nova da mesma conversa. `temWhatsappReal()` em
// normalize.ts é o jeito correto de checar, em qualquer tela, se esse valor
// é um telefone de verdade antes de montar um link de WhatsApp.
export async function resolveOrCreateInstagramLead(
  supabase: SupabaseClient,
  params: { igsid: string; nomeSugerido?: string | null },
): Promise<InstagramLeadResult> {
  const whatsappPlaceholder = IG_WHATSAPP_PLACEHOLDER_PREFIX + params.igsid

  const { data, error } = await supabase
    .from('leads')
    .insert({
      whatsapp: whatsappPlaceholder,
      nome: params.nomeSugerido ?? null,
      origem: 'Instagram DM',
      source: 'instagram_dm',
      estagio_funil: 'primeiro_contato',
      status: 'novo',
      requer_atencao: false,
    })
    .select('id')
    .single()

  if (!error) return { status: 'created', id: data!.id }

  if (error.code === '23505') {
    const { data: existente } = await supabase.from('leads').select('id').eq('whatsapp', whatsappPlaceholder).maybeSingle()
    if (existente) return { status: 'existing', id: existente.id }
  }

  return { status: 'skipped', motivo: error.message }
}
