/**
 * src/app/empreendimentos/[slug]/page.tsx
 *
 * Rota legada — redireciona permanentemente (308) para a rota canônica:
 *   /empreendimento/[construtora]/[slug]
 *
 * Busca o campo `construtora` no Supabase para montar o slug correto.
 * Se não encontrar o empreendimento, retorna 404.
 */

import { redirect, notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

/** Converte nome da construtora para slug (mesma lógica da rota canônica) */
function toSlug(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
}

function getSupabase() {
    return createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
}

export default async function EmpreendimentosLegacyPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const sb = getSupabase()
    const { data: emp } = await sb
      .from('empreendimentos')
      .select('slug, construtora')
      .eq('slug', slug)
      .single()

  if (!emp?.construtora) notFound()

  const construtoraSlug = toSlug(emp.construtora)
    redirect(`/empreendimento/${construtoraSlug}/${emp.slug}`)
}
