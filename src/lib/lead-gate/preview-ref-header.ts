// Diagnóstico exclusivo de Preview: prova qual projeto Supabase um deployment
// está usando, sem nunca expor a URL completa, a anon key ou a service role.
// O project ref já é informação pública (aparece em qualquer URL do site), mas
// mesmo assim só é exposto em Preview — nunca em Production. A checagem é por
// VERCEL_ENV (definida pela própria Vercel em runtime), não por NODE_ENV, que
// vale "production" também dentro de um build de Preview.
const SUPABASE_HOST_RE = /^https:\/\/([a-z0-9]+)\.supabase\.co(?:\/.*)?$/i

export const PREVIEW_SUPABASE_REF_HEADER = 'X-Preview-Supabase-Ref'

export function previewSupabaseRefHeaders(): Record<string, string> {
  if (process.env.VERCEL_ENV !== 'preview') return {}

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
  const match = SUPABASE_HOST_RE.exec(url)
  if (!match) return {}

  return { [PREVIEW_SUPABASE_REF_HEADER]: match[1] }
}
