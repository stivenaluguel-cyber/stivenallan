import { createClient } from '@supabase/supabase-js'

// Resolve o id de `properties` a partir do slug, no servidor.
//
// Existe como helper compartilhado porque DOIS pontos precisam do mesmo id na
// mesma renderização: a página do empreendimento (que passa pros blocos
// GatedContent) e o RelatedProperties (formulário do rodapé). Sem isso seriam
// duas idas à rede por render da mesma página.
//
// Client anônimo direto, NÃO @/lib/supabase/server: aquele helper chama
// cookies() de next/headers, e cookies() em qualquer ponto da árvore de Server
// Component tira a rota inteira do cache estático. As 36 páginas de
// empreendimento são `revalidate = 3600` de propósito. Esta é uma leitura
// pública em `properties` (RLS permite SELECT anônimo), não precisa de sessão.
//
// `next: { revalidate }` é obrigatório, não otimização: fetch não cacheado
// dentro de Server Component tira a rota do prerender, e como o efeito depende
// de a chamada concluir, o resultado varia por LATÊNCIA. Medido antes desta
// correção: dois builds limpos do mesmo commit deram 8 e 28 páginas dinâmicas.
export async function getPropertyIdBySlug(slug: string): Promise<string | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false },
        global: {
          fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 3600 } }),
        },
      },
    )
    const { data } = await supabase.from('properties').select('id').eq('slug', slug).maybeSingle()
    return data?.id ?? null
  } catch {
    // Falha de rede não pode derrubar a página: sem id, o gate simplesmente
    // não monta e a página serve o conteúdo público, como antes da feature.
    return null
  }
}
