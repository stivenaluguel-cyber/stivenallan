import Link from 'next/link'
import Image from 'next/image'
import { getSupabaseClient } from '@/lib/supabase'

const C = {
  card: '#18191d',
  border: '#2c3035',
  accent: '#c9a24b',
  accent2: '#e2c275',
  muted: '#a7adb4',
  text: '#f4f4f4',
  green: '#1f9d55',
  bg: '#121315',
}

const FALLBACK_PROPERTIES = [
  {
    id: '1',
    nome: 'Monte Leone Residencial',
    slug: 'monte-leone-centro-criciuma-sc',
    construtora_slug: 'fontana',
    construtora_nome: 'Construtora Fontana',
    bairro: 'Centro',
    cidade: 'Criciuma',
    uf: 'SC',
    status_obra: 'lancamento',
    area_privativa_min: 230,
    area_privativa_max: 253,
    preco_a_partir_de: 800000,
    imagem_capa_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=90',
    tag: 'EXCLUSIVO',
  },
  {
    id: '2',
    nome: 'Lavis Residencial',
    slug: 'lavis-centro-criciuma-sc',
    construtora_slug: 'fontana',
    construtora_nome: 'Construtora Fontana',
    bairro: 'Centro',
    cidade: 'Criciuma',
    uf: 'SC',
    status_obra: 'lancamento',
    area_privativa_min: 65,
    area_privativa_max: 95,
    preco_a_partir_de: 320000,
    imagem_capa_url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=90',
    tag: '',
  },
  {
    id: '3',
    nome: 'Pineto Residencial',
    slug: 'pineto-centro-criciuma-sc',
    construtora_slug: 'fontana',
    construtora_nome: 'Construtora Fontana',
    bairro: 'Centro',
    cidade: 'Criciuma',
    uf: 'SC',
    status_obra: 'lancamento',
    area_privativa_min: 75,
    area_privativa_max: 76,
    preco_a_partir_de: 619250,
    imagem_capa_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=90',
    tag: 'OPORTUNIDADE',
  },
]

const STATUS_LABELS: Record<string, string> = {
  lancamento: 'Lançamento',
  em_obras: 'Em Obras',
  pronto: 'Pronto',
}

async function getEmpreendimentos() {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return null
    const { data, error } = await supabase
      .from('empreendimentos')
      .select('id, nome, slug, bairro, cidade, uf, status_obra, status_venda, area_privativa_min, area_privativa_max, preco_a_partir_de, imagem_capa_url, construtora')
      .eq('status_venda', 'ativo')
      .order('created_at', { ascending: false })
      .limit(6)
    if (error || !data || data.length === 0) return null
    return data.map((emp: any) => ({
      id: emp.id,
      nome: emp.nome,
      slug: emp.slug,
      construtora_slug: emp.construtora ? emp.construtora.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '') : 'construtora',
      construtora_nome: emp.construtora || 'Construtora',
      bairro: emp.bairro || '',
      cidade: emp.cidade || 'Criciuma',
      uf: emp.uf || 'SC',
      status_obra: emp.status_obra || 'lancamento',
      area_privativa_min: emp.area_privativa_min,
      area_privativa_max: emp.area_privativa_max,
      preco_a_partir_de: emp.preco_a_partir_de,
      imagem_capa_url: emp.imagem_capa_url || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=90',
      tag: '',
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
          gap: 32px;
        }
        @media (max-width: 960px) {
          .feat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 580px) {
          .feat-grid { grid-template-columns: 1fr; }
        }
        .feat-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          background: #18191d;
          border: 1px solid #2c3035;
          text-decoration: none;
          display: block;
          transition: transform 0.35s cubic-bezier(.22,.68,0,1.2), border-color 0.3s, box-shadow 0.35s;
        }
        .feat-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(201,162,75,0.08) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
          z-index: 1;
          pointer-events: none;
        }
        .feat-card:hover {
          transform: translateY(-8px) scale(1.01);
          border-color: #c9a24b;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,162,75,0.2);
        }
        .feat-card:hover::before {
          opacity: 1;
        }
        .feat-thumb-img {
          transition: transform 0.6s ease !important;
        }
        .feat-card:hover .feat-thumb-img {
          transform: scale(1.07) !important;
        }
        .feat-price {
          font-size: 20px;
          font-weight: 900;
          background: linear-gradient(90deg, #c9a24b, #e2c275);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }
        .feat-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #c9a24b;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity 0.3s, transform 0.3s;
          white-space: nowrap;
        }
        .feat-card:hover .feat-cta {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>

      <div className="feat-grid">
        {properties.map((emp: any) => (
          <Link
            key={emp.id}
            href={`/empreendimento/${emp.construtora_slug}/${emp.slug}`}
            className="feat-card"
          >
            <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
              <Image
                src={emp.imagem_capa_url}
                alt={emp.nome + ' - ' + emp.bairro + ', ' + emp.cidade + '/' + emp.uf}
                fill
                className="feat-thumb-img"
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 580px) 100vw, (max-width: 960px) 50vw, 33vw"
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%)',
                zIndex: 1,
              }} />
              <div style={{
                position: 'absolute', top: '16px', left: '16px', zIndex: 2,
                background: 'rgba(10,10,12,0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(201,162,75,0.5)',
                borderRadius: '50px',
                padding: '5px 16px',
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '2px',
                color: '#c9a24b',
                textTransform: 'uppercase',
              }}>
                {STATUS_LABELS[emp.status_obra] || 'Lançamento'}
              </div>
              {emp.tag && (
                <div style={{
                  position: 'absolute', top: '16px', right: '16px', zIndex: 2,
                  background: 'linear-gradient(135deg, #c9a24b, #e2c275)',
                  borderRadius: '50px',
                  padding: '5px 14px',
                  fontSize: '9px',
                  fontWeight: 800,
                  letterSpacing: '2px',
                  color: '#1a1305',
                }}>
                  {emp.tag}
                </div>
              )}
            </div>

            <div style={{ padding: '24px 26px', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '4px', height: '4px', background: '#c9a24b', borderRadius: '50%' }} />
                <p style={{ color: '#c9a24b', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {emp.construtora_nome}
                </p>
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '6px', color: '#f4f4f4', lineHeight: 1.2, letterSpacing: '-0.3px' }}>
                {emp.nome}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '22px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a7adb4" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <p style={{ color: '#a7adb4', fontSize: '12px', fontWeight: 500 }}>
                  {emp.bairro ? emp.bairro + ', ' : ''}{emp.cidade}/{emp.uf}
                </p>
              </div>
              <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(201,162,75,0.3), transparent)', marginBottom: '20px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  {emp.area_privativa_min && (
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '9px', color: '#a7adb4', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
Área privativa
                      </span>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#f4f4f4', marginTop: '2px' }}>
                        {emp.area_privativa_min === emp.area_privativa_max
                          ? emp.area_privativa_min + 'm²'
                          : emp.area_privativa_min + '–' + emp.area_privativa_max + 'm²'}
                      </p>
                    </div>
                  )}
                  <div>
                    <span style={{ fontSize: '9px', color: '#a7adb4', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
A partir de
                    </span>
                    <p className="feat-price">
                      {emp.preco_a_partir_de
                        ? 'R$ ' + emp.preco_a_partir_de.toLocaleString('pt-BR')
                        : 'Consulte'}
                    </p>
                  </div>
                </div>
                <span className="feat-cta">
                  Ver
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
