import { logError, logInfo } from '@/lib/log'

const SOURCE = 'lib/prospeccao/google-places'
const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText'

// FieldMask controla o que a Google cobra (cada grupo de campo é um SKU de
// preço diferente). Contact Data (telefone/site) é o grupo mais caro dos
// três usados aqui — se for adicionar campo novo, confirmar o SKU antes,
// não só "porque é útil".
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.rating',
  'places.userRatingCount',
  'places.types',
  'places.businessStatus',
].join(',')

export type PlaceCandidato = {
  placeId: string
  nome: string
  endereco: string | null
  telefone: string | null
  site: string | null
  rating: number | null
  ratingCount: number | null
  tipos: string[]
}

export type BuscarPlacesResultado =
  | { ok: true; candidatos: PlaceCandidato[] }
  | { ok: false; skipped: true }
  | { ok: false; skipped: false; error: string }

type PlaceApiResponse = {
  places?: Array<{
    id?: string
    displayName?: { text?: string }
    formattedAddress?: string
    nationalPhoneNumber?: string
    websiteUri?: string
    rating?: number
    userRatingCount?: number
    types?: string[]
    businessStatus?: string
  }>
}

function mapPlace(p: NonNullable<PlaceApiResponse['places']>[number]): PlaceCandidato | null {
  if (!p.id || !p.displayName?.text) return null
  // OPERATIONAL é o default quando o campo vem ausente — a maioria dos
  // resultados não traz `businessStatus` explícito.
  if (p.businessStatus && p.businessStatus !== 'OPERATIONAL') return null
  return {
    placeId: p.id,
    nome: p.displayName.text,
    endereco: p.formattedAddress ?? null,
    telefone: p.nationalPhoneNumber ?? null,
    site: p.websiteUri ?? null,
    rating: typeof p.rating === 'number' ? p.rating : null,
    ratingCount: typeof p.userRatingCount === 'number' ? p.userRatingCount : null,
    tipos: Array.isArray(p.types) ? p.types : [],
  }
}

/**
 * Busca empresas por texto livre (Places API New — Text Search).
 *
 * `maxResultCount` é limitado a 20 pela própria API por página; não pagina
 * automaticamente (nextPageToken exige um intervalo de alguns segundos entre
 * chamadas pra ficar disponível) — quem precisa de mais de 20 resultados
 * chama de novo com uma query de texto diferente, não com paginação.
 */
export async function buscarPlaces(query: string, maxResultCount = 20): Promise<BuscarPlacesResultado> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return { ok: false, skipped: true }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'pt-BR',
        regionCode: 'BR',
        maxResultCount: Math.min(Math.max(maxResultCount, 1), 20),
      }),
    })

    if (!res.ok) {
      const corpo = await res.text().catch(() => '')
      logError(SOURCE, 'Places API respondeu erro', corpo, { status: res.status, query })
      return { ok: false, skipped: false, error: 'Google Places recusou a busca (status ' + res.status + ')' }
    }

    const data = (await res.json()) as PlaceApiResponse
    const candidatos = (data.places ?? []).map(mapPlace).filter((p): p is PlaceCandidato => p !== null)
    logInfo(SOURCE, 'busca concluída', { query, encontrados: candidatos.length })
    return { ok: true, candidatos }
  } catch (err) {
    logError(SOURCE, 'falha ao chamar Places API', err, { query })
    return { ok: false, skipped: false, error: 'Falha de rede ao consultar o Google Places' }
  }
}

/**
 * Roda várias queries e devolve os candidatos combinados, sem duplicar
 * `placeId` entre elas (a mesma empresa aparece com frequência em queries
 * vizinhas, ex: "transportadoras" e "logística" na mesma cidade).
 *
 * Segue mesmo depois de uma query individual falhar — uma query ruim não
 * derruba a busca inteira. Só devolve erro/skipped se NENHUMA rendeu nada.
 */
export async function buscarPlacesMultiplas(
  queries: string[],
  maxResultCountPorQuery = 20,
): Promise<BuscarPlacesResultado> {
  if (!process.env.GOOGLE_PLACES_API_KEY) return { ok: false, skipped: true }

  const resultados = await Promise.all(queries.map((q) => buscarPlaces(q, maxResultCountPorQuery)))

  const vistos = new Set<string>()
  const candidatos: PlaceCandidato[] = []
  for (const r of resultados) {
    if (!r.ok) continue
    for (const c of r.candidatos) {
      if (vistos.has(c.placeId)) continue
      vistos.add(c.placeId)
      candidatos.push(c)
    }
  }

  if (candidatos.length > 0) return { ok: true, candidatos }

  const algumErro = resultados.find((r): r is Extract<BuscarPlacesResultado, { ok: false; skipped: false }> => !r.ok && !r.skipped)
  if (algumErro) return algumErro
  return { ok: true, candidatos: [] }
}
