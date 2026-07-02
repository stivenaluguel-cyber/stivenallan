import { SITE_URL } from '@/lib/site'

type FaqItem = { pergunta: string; resposta: string }

type Props = {
  nome: string
  slug: string
  construtora_slug: string
  cidade: string
  uf: string
  bairro?: string
  descricao: string
  imagem?: string
  faq?: FaqItem[]
}

export function PropertySchema({ nome, slug, construtora_slug, cidade, uf, bairro, descricao, imagem, faq }: Props) {
  const url = `${SITE_URL}/empreendimento/${construtora_slug}/${slug}`
  const schemas: object[] = [
    {
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
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Empreendimentos', item: `${SITE_URL}/empreendimentos` },
        { '@type': 'ListItem', position: 3, name: nome, item: url },
      ],
    },
  ]

  if (faq && faq.length) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.pergunta,
        acceptedAnswer: { '@type': 'Answer', text: f.resposta },
      })),
    })
  }

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
    </>
  )
}
