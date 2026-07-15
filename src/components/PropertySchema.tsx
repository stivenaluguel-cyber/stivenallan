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
  descricao?: string
  imagem?: string
  faq?: FaqItem[]
}

export function PropertySchema({ schema, nome, slug, construtora_slug, cidade, uf, bairro, descricao, imagem, faq }: Props) {
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
      ...(bairro ? { streetAddress: bairro } : {}),
      addressCountry: 'BR',
    },
  }

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
