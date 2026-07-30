// O mesmo prédio existe em duas tabelas.
//
// `properties` é o que alimenta o site e a listagem do Dashboard. A migration
// que criou o espelho de vendas trouxe junto `empreendimentos`, e é a ela que
// `empreendimentos_unidades.empreendimento_id` aponta. O Pineto tem linha nas
// duas, com ids diferentes e o MESMO slug:
//
//   properties      d6a65efa-…  →  0 unidades
//   empreendimentos 0cf2d49f-…  → 54 unidades
//
// Resultado prático: a aba Disponibilidade do CRM lista os prédios de
// `properties`, pede as unidades por aquele id e recebe lista vazia — o Pineto
// aparecia com "0 disponíveis" mesmo tendo as 54 importadas.
//
// O slug é a única chave que vale nas duas. Unificar as tabelas é cirurgia de
// dados grande; traduzir o id na leitura resolve sem mexer em nada.

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Recebe um id de qualquer uma das duas tabelas e devolve o id que realmente
 * possui unidades.
 *
 * Devolve o próprio id quando ele já é o certo (caminho normal, uma consulta a
 * menos) ou quando não há correspondente — aí a consulta seguinte volta vazia,
 * que é a resposta honesta para um prédio sem unidades cadastradas.
 */
export async function resolverIdComUnidades(
  client: SupabaseClient,
  id: string,
): Promise<string> {
  const { count } = await client
    .from('empreendimentos_unidades')
    .select('id', { count: 'exact', head: true })
    .eq('empreendimento_id', id)

  if ((count ?? 0) > 0) return id

  // Sem unidades neste id: pode ser o gêmeo da outra tabela. Descobre o slug
  // onde ele existir e procura o irmão.
  const slug = await slugDoId(client, id)
  if (!slug) return id

  for (const tabela of ['empreendimentos', 'properties'] as const) {
    const { data } = await client.from(tabela).select('id').eq('slug', slug).maybeSingle()
    const candidato = data?.id as string | undefined
    if (!candidato || candidato === id) continue

    const { count: n } = await client
      .from('empreendimentos_unidades')
      .select('id', { count: 'exact', head: true })
      .eq('empreendimento_id', candidato)
    if ((n ?? 0) > 0) return candidato
  }

  return id
}

async function slugDoId(client: SupabaseClient, id: string): Promise<string | null> {
  for (const tabela of ['properties', 'empreendimentos'] as const) {
    const { data } = await client.from(tabela).select('slug').eq('id', id).maybeSingle()
    if (data?.slug) return data.slug as string
  }
  return null
}
