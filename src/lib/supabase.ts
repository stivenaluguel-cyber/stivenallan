import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.generated'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Build-safe: só instancia se as envs estiverem disponíveis. Tipado como
// `| null` de verdade (sem cast pra fingir não-nulo) — nenhum arquivo do
// projeto importa este `supabase` diretamente hoje (confirmado por busca em
// todo o src/), então não há consumidor pra quebrar com essa honestidade.
export const supabase: SupabaseClient<Database> | null = (supabaseUrl && supabaseAnonKey)
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null

export function getSupabaseClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient<Database>(url, key)
}

// Admin client (server-side only - uses service_role key)
export function getSupabaseAdmin(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export type { Database }

// Helper type for empreendimento with construtora joined — tipo de domínio
// (join manual), não pertence ao arquivo de tipos gerados do banco.
export type EmpreendimentoComConstrutora = Database['public']['Tables']['empreendimentos']['Row'] & {
  construtoras: Database['public']['Tables']['construtoras']['Row'] | null
}
