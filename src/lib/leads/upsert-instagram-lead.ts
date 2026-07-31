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

// Idempotência do webhook: a Meta reenvia a mesma entrega em timeout/resposta
// não-2xx. `mid` (message id) é único por mensagem — se já existe uma linha
// em `interacoes` com esse `mid`, essa chamada é uma redelivery e não deve
// gerar card nem histórico duplicado. Checar ANTES de resolveOrCreateInstagramLead
// evita também uma chamada desnecessária à Graph API (buscarNomeInstagram)
// a cada reenvio.
export async function mensagemInstagramJaProcessada(supabase: SupabaseClient, mid: string): Promise<boolean> {
  const { data } = await supabase.from('interacoes').select('id').eq('mid', mid).maybeSingle()
  return !!data
}

export type RegistroInteracaoResultado = 'inserida' | 'duplicada'

// Grava a mensagem no histórico de conversa (exibido no Kanban via
// /api/admin/leads/[id]/timeline). O índice único parcial em `interacoes.mid`
// (migração 20260731090000) é quem garante a idempotência de fato — o
// check-then-insert acima só evita trabalho redundante no caminho feliz;
// numa corrida entre duas invocações concorrentes da mesma redelivery, é o
// 23505 aqui que realmente impede a duplicata.
export async function registrarInteracaoInstagram(
  supabase: SupabaseClient,
  params: { leadId: string; mid: string | null; texto: string },
): Promise<RegistroInteracaoResultado> {
  const { error } = await supabase.from('interacoes').insert({
    lead_id: params.leadId,
    canal: 'instagram',
    direcao: 'entrada',
    mensagem: params.texto,
    mid: params.mid,
  })
  if (!error) return 'inserida'
  if (error.code === '23505') return 'duplicada'
  throw error
}
