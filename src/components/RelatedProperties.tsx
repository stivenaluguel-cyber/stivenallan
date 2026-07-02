import Link from 'next/link'
import { imoveis } from '@/data/imoveis'

type Props = { atualSlug: string; cidade: string }

export function RelatedProperties({ atualSlug, cidade }: Props) {
  const ativos = imoveis.filter((i) => i.ativo === true && i.slug !== atualSlug)
  const mesmaCidade = ativos.filter((i) => i.cidade === cidade)
  const outras = ativos.filter((i) => i.cidade !== cidade)
  const selecionados = [...mesmaCidade, ...outras].slice(0, 3)

  if (!selecionados.length) return null

  return (
    <section style={{ maxWidth: '1080px', margin: '0 auto', padding: '48px 20px 64px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '32px', color: '#18181b' }}>
        Você também pode gostar
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
        }}
      >
        {selecionados.map((imovel) => (
          <Link
            key={imovel.slug}
            href={`/empreendimento/${imovel.construtora_slug}/${imovel.slug}`}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e4e4e7', background: '#fff' }}
          >
            {imovel.img && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imovel.img}
                alt={`Fachada do ${imovel.nome}`}
                style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
              />
            )}
            <div style={{ padding: '16px 18px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px', color: '#18181b' }}>{imovel.nome}</h3>
              <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
                {imovel.cidade}/{imovel.uf}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default RelatedProperties
