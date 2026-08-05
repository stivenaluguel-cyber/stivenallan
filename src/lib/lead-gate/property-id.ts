import { createClient } from '@supabase/supabase-js'
import { logError, logWarn } from '@/lib/log'

const SOURCE = 'lib/lead-gate/property-id'

// Resolve o id de `properties` a partir do slug, no servidor.
//
// UMA consulta para TODOS os slugs, não uma por página. O build prerenderiza
// 28 hotsites que chamam isto; com uma query por slug eram 28 idas à rede em
// série, e o tempo delas empurrava páginas para além do limite de geração
// estática do Next — o resultado passava a variar por LATÊNCIA. Medido em
// builds limpos do mesmo commit: 31, 24 e 25 páginas estáticas. Buscando o
// mapa inteiro de uma vez, a URL é sempre a mesma, o Data Cache do Next
// deduplica entre as páginas e sobra 1 requisição por build.
//
// Client anônimo direto, NÃO @/lib/supabase/server: aquele helper chama
// cookies() de next/headers, e cookies() em qualquer ponto da árvore de Server
// Component tira a rota inteira do cache estático. Esta é uma leitura pública
// em `properties` (RLS permite SELECT anônimo), não precisa de sessão.
//
// `force-cache` e NÃO `next: { revalidate }`. A diferença não é cosmética: em
// patch-fetch.js o revalidate do FETCH rebaixa o revalidate do SEGMENTO
// (`if (finalRevalidate < revalidateStore.revalidate)`). Só 7 dos 28 hotsites
// declaram `export const revalidate`; os outros 21 eram estáticos puros e
// passariam a ISR de 1h sem ninguém ter pedido. Medido: 35 páginas apareceram
// com "1h" no build quando só 7 deveriam. Com `force-cache` cada página
// mantém a política que ela mesma declarou.
async function carregarMapaSlugParaId(): Promise<Map<string, string>> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // autoRefreshToken: sem isto o GoTrue liga um setInterval de 30s por
      // client criado.
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: 'force-cache', next: { tags: ['properties'] } }),
      },
    },
  )
  const { data, error } = await supabase.from('properties').select('id,slug')
  if (error) {
    logWarn(SOURCE, 'falha ao carregar mapa slug->id', { code: error.code })
    return new Map()
  }
  return new Map((data ?? []).map((p: { id: string; slug: string }) => [p.slug, p.id]))
}

export async function getPropertyIdBySlug(slug: string): Promise<string | null> {
  try {
    const mapa = await carregarMapaSlugParaId()
    return mapa.get(slug) ?? null
  } catch (err) {
    // Não relança: derrubar a página inteira por causa disso seria pior. Mas
    // TAMBÉM não é silencioso — quem consome precisa saber que o gate vai
    // degradar, e numa página ISR esse degrade fica cacheado (ver o
    // tratamento de `gateFalhou` na página do piloto, que fecha o conteúdo em
    // vez de publicá-lo).
    logError(SOURCE, 'excecao ao resolver property_id por slug', err, { slug })
    return null
  }
}
