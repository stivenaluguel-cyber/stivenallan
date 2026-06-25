import Link from 'next/link'
import Image from 'next/image'
import { getSupabaseClient } from '@/lib/supabase'

const C = {
  card: '#202327',
  border: '#2c3035',
  accent: '#c9a24b',
  accent2: '#e2c275',
  muted: '#a7adb4',
  text: '#f4f4f4',
  green: '#1f9d55',
}

const FALLBACK_PROPERTIES = [
  {
    id: '1',
    nome: 'Monte Leone Residencial',
    slug: 'monte-leone-centro-criciuma-sc',
    construtora_slug: 'fontana',
    construtora_nome: 'Construtora Fontana',
    bairro: 'Centro',
    cidade: 'Criciúma',
    uf: 'SC',
    status_obra: 'lancamento',
    status_venda: 'ativo',
    area_privativa_min: 230,
    area_privativa_max: 253,
    preco_a_partir_de: 800000,
    imagem_capa_url: 'https://lh3.googleusercontent.com/d/1qTxY-6kI1MiToh9HKPQ7Gy4B3E17VOEs=w800',
  },
  {
    id: '2',
    nome: 'Lavis Residencial',
    slug: 'lavis-centro-criciuma-sc',
    construtora_slug: 'fontana',
    construtora_nome: 'Construtora Fontana',
    bairro: 'Centro',
    cidade: 'Criciúma',
    uf: 'SC',
    status_obra: 'lancamento',
    status_venda: 'ativo',
    area_privativa_min: 65,
    area_privativa_max: 95,
    preco_a_partir_de: 320000,
    imagem_capa_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '3',
    nome: 'Pineto Residencial',
    slug: 'pineto-centro-criciuma-sc',
    construtora_slug: 'fontana',
    construtora_nome: 'Construtora Fontana',
    bairro: 'Centro',
    cidade: 'Criciúma',
    uf: 'SC',
    status_obra: 'lancamento',
    status_venda: 'ativo',
    area_privativa_min: 65,
    area_privativa_max: 110,
    preco_a_partir_de: 350000,
    imagem_capa_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
  },
]

const STATUS_LABELS: Record<string, string> = {
  lancamento: 'Lançamento',
  em_obras: 'Em Obras',
  pronto: 'Pronto para Morar',
  pausado: 'Pausado',
}

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  lancamento: { background: '#c9a24b', color: '#1a1305' },
  em_obras: { background: '#2563eb', color: '#fff' },
  pronto: { background: '#1f9d55', color: '#fff' },
  pausado: { background: '#4b5563', color: '#fff' },
}

async function getEmpreendimentos() {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    const { data, error } = await supabase
      .from('empreendimentos')
      .select(`
        id, nome, slug, bairro, cidade, uf,
        status_obra, status_venda,
        area_privativa_min, area_privativa_max,
        preco_a_partir_de, imagem_capa_url, construtora
      `)
      .eq('status_venda', 'ativo')
      .order('created_at', { ascending: false })
      .limit(6)

    if (error || !data || data.length === 0) return null

    return data.map((emp: any) => ({
      id: emp.id,
      nome: emp.nome,
      slug: emp.slug,
      construtora_slug: emp.construtora
        ? emp.construtora.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        : 'construtora',
      construtora_nome: emp.construtora || 'Construtora',
      bairro: emp.bairro || '',
      cidade: emp.cidade || 'Criciúma',
      uf: emp.uf || 'SC',
      status_obra: emp.status_obra || 'lancamento',
      status_venda: emp.status_venda || 'ativo',
      area_privativa_min: emp.area_privativa_min,
      area_privativa_max: emp.area_privativa_max,
      preco_a_partir_de: emp.preco_a_partir_de,
      imagem_capa_url: emp.imagem_capa_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
    }))
  } catch {
    return null
  }
}

export default async function FeaturedProperties() {
  const dbProperties = await getEmpreendimentos()
  const properties = dbProperties || FALLBACK_PROPERTIES

  return (
    <>
      <style>{`
        .feat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }
        @media (max-width: 900px) {
          .feat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .feat-grid { grid-template-columns: 1fr; }
        }
        .feat-card:hover {
          transform: translateY(-4px);
          border-color: #c9a24b !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }
      `}</style>
      <div className="feat-grid">
        {properties.map((emp) => (
          <Link
            key={emp.id}
            href={`/empreendimento/${emp.construtora_slug}/${emp.slug}`}
            className="feat-card"
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: '20px',
              overflow: 'hidden',
              textDecoration: 'none',
              display: 'block',
              transition: 'transform 0.25s, border-color 0.25s, box-shadow 0.25s',
            }}
          >
            {/* Thumb */}
            <div style={{ position: 'relative', height: '210px', overflow: 'hidden' }}>
              <Image
                src={emp.imagem_capa_url}
                alt={emp.nome + ' em ' + emp.bairro + ', ' + emp.cidade + '/' + emp.uf}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
              />
              <span style={{
                position: 'absolute', top: '12px', left: '12px',
                fontSize: '11px', fontWeight: 700,
                padding: '4px 12px', borderRadius: '50px',
                ...(STATUS_STYLE[emp.status_obra] || { background: '#4b5563', color: '#fff' }),
              }}>
                {STATUS_LABELS[emp.status_obra] || emp.status_obra}
              </span>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
              <p style={{ color: C.muted, fontSize: '11px', marginBottom: '6px', fontWeight: 600 }}>
                {emp.construtora_nome}
              </p>
              <h3 style={{
                fontWeight: 800, fontSize: '17px',
                marginBottom: '6px', color: C.text,
                lineHeight: 1.3,
              }}>
                {emp.nome}
              </h3>
              <p style={{ color: C.muted, fontSize: '13px', marginBottom: '16px' }}>
                {emp.bairro ? emp.bairro + ', ' : ''}{emp.cidade}
              </p>

              {/* Specs */}
              <div style={{
                display: 'flex', gap: '16px',
                fontSize: '12px', color: C.muted,
                borderTop: `1px solid ${C.border}`,
                paddingTop: '16px', marginBottom: '16px',
              }}>
                {emp.area_privativa_min && (
                  <span>
                    {emp.area_privativa_min === emp.area_privativa_max
                      ? emp.area_privativa_min
                      : emp.area_privativa_min + '–' + emp.area_privativa_max}m²
                  </span>
                )}
              </div>

              {/* Price */}
              <div style={{
                color: C.accent2, fontWeight: 900,
                fontSize: '17px',
              }}>
                {emp.preco_a_partir_de
                  ? 'A partir de R$ ' + emp.preco_a_partir_de.toLocaleString('pt-BR')
                  : 'Sob consulta'}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
