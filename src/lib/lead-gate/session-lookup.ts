import type { SupabaseClient } from '@supabase/supabase-js'
import { hashSessionToken } from './session'

export type SessionLookupResult =
  | { status: 'valid'; sessionId: string; leadId: string; lastSeenAt: string }
  | { status: 'invalid' }

// Único lugar que lê lead_access_sessions por token — usado por
// /api/lead-access/status e /api/lead-track, nunca duplicado. `leadId` sai
// daqui mas NUNCA deve ser repassado ao client (só usado server-side pra
// resolver a próxima chamada de banco).
export async function lookupSessionByToken(
  supabase: SupabaseClient,
  token: string,
): Promise<SessionLookupResult> {
  const tokenHash = hashSessionToken(token)
  const { data, error } = await supabase
    .from('lead_access_sessions')
    .select('id, lead_id, expires_at, revoked_at, last_seen_at')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (error || !data) return { status: 'invalid' }
  if (data.revoked_at) return { status: 'invalid' }
  if (new Date(data.expires_at).getTime() < Date.now()) return { status: 'invalid' }

  return { status: 'valid', sessionId: data.id, leadId: data.lead_id, lastSeenAt: data.last_seen_at }
}

const LAST_SEEN_THROTTLE_MS = 60 * 60 * 1000 // 1h — evita um UPDATE a cada poll de status

export async function touchSessionLastSeen(
  supabase: SupabaseClient,
  sessionId: string,
  lastSeenAt: string,
): Promise<void> {
  if (Date.now() - new Date(lastSeenAt).getTime() < LAST_SEEN_THROTTLE_MS) return
  await supabase.from('lead_access_sessions').update({ last_seen_at: new Date().toISOString() }).eq('id', sessionId)
}
