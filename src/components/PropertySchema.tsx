import { SITE_URL } from '@/lib/site'
import type { ApartmentComplex, BreadcrumbList, FAQPage, WithContext } from 'schema-dts'

type FaqItem = { pergunta: string; resposta: string }

type Props = {
  schema?: object | null
  nome?: string
  slug?: string
  construtora_slug?: string
  cidade?: string
  uf?: string
  bairro?: string
  endereco?: string
  descricao?: string
  imagem?: string
  faq?: FaqItem[]
  dormitorios?: string | null
  suites?: string | null
  metragem?: string | null
  vagas?: string | null
  lazer?: string[] | null
  diferenciais?: string[] | null
}

/** "97" | "97 m²" | "97 a 126" -> 97. Só o primeiro número serve como mínimo. */
function primeiroNumero(valor?: string | null): number | null {
  if (!valor) return null
  const m = String(valor).replace(',', '.').match(/\d+(\.\d+)?/)
  if (!m) return null
  const n = Number(m[0])
  return Number.isFinite(n) ? n : null
}

export function PropertySchema({ schema, nome, slug, construtora_slug, cidade, uf, bairro, endereco, descricao, imagem, faq, dormitorios, suites, metragem, vagas, lazer, diferenciais }: Props) {
  // Modo direto: schema object passado diretamente
  if (schema) {
    const s = schema as Record<string, unknown>
    if (Array.isArray(s)) {
      return (
        <>
          {s.map((item: object, i: number) => (
            <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />
          ))}
        </>
      )
    }
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
  }

  // Modo props: gera schema ApartmentComplex + Breadcrumb + FAQPage
  const url = `${SITE_URL}/empreendimento/${construtora_slug}/${slug}`

  // Amenidades: lazer + diferenciais viram amenityFeature. É o que permite a um
  // buscador/IA responder "tem piscina?" citando esta página.
  const amenidades = [...(lazer ?? []), ...(diferenciais ?? [])]
    .map((a) => (typeof a === 'string' ? a.trim() : ''))
    .filter(Boolean)

  const quartos = primeiroNumero(dormitorios)
  const area = primeiroNumero(metragem)
  const banheiros = primeiroNumero(suites)

  const apartmentComplex: WithContext<ApartmentComplex> = {
    '@context': 'https://schema.org',
    '@type': 'ApartmentComplex',
    name: nome,
    url,
    description: descricao,
    ...(imagem ? { image: imagem } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: cidade,
      addressRegion: uf,
      // streetAddress recebia o BAIRRO quando não havia endereço — o campo
      // correto do bairro é addressNeighborhood.
      ...(endereco ? { streetAddress: endereco } : {}),
      ...(bairro ? { addressNeighborhood: bairro } : {}),
      addressCountry: 'BR',
    },
    // Só declara o que existe: um campo vazio no schema vale menos que ausente.
    ...(quartos !== null ? { numberOfRooms: quartos } : {}),
    ...(banheiros !== null ? { numberOfBathroomsTotal: banheiros } : {}),
    ...(area !== null ? { floorSize: { '@type': 'QuantitativeValue' as const, value: area, unitCode: 'MTK' } } : {}),
    ...(amenidades.length > 0 || vagas
      ? {
          amenityFeature: [
            ...amenidades.map((a) => ({ '@type': 'LocationFeatureSpecification' as const, name: a, value: true })),
            ...(vagas ? [{ '@type': 'LocationFeatureSpecification' as const, name: `${vagas} vaga(s) de garagem`, value: true }] : []),
          ],
        }
      : {}),
  }
  // Nota: não declaramos `provider`/`broker` aqui. ApartmentComplex herda de
  // Place, e o schema.org não define essas propriedades nesse ramo — o
  // schema-dts recusa, e emitir propriedade inválida vale menos que não emitir.
  // A ligação com o corretor é feita pelo RealEstateAgent com @id fixo no
  // layout raiz, presente em todas as páginas.

  const breadcrumb: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Empreendimentos', item: `${SITE_URL}/empreendimentos` },
      { '@type': 'ListItem', position: 3, name: nome, item: url },
    ],
  }

  const schemas: WithContext<ApartmentComplex | BreadcrumbList | FAQPage>[] = [apartmentComplex, breadcrumb]

  if (faq && faq.length) {
    const faqPage: WithContext<FAQPage> = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.pergunta,
        acceptedAnswer: { '@type': 'Answer', text: f.resposta },
      })),
    }
    schemas.push(faqPage)
  }

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
    </>
  )
}

export default PropertySchema
