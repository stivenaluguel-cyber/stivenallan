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
    nome: 'Empreendimento Premium',
    slug: 'empreendimento-premium-criciuma-sc',
    construtora_slug: 'construtora-exemplo',
    construtora_nome: 'Construtora Exemplo',
    bairro: 'Centro',
    cidade: 'Criciúma',
    uf: 'SC',
    status: 'lancamento',
    dorms_min: 2,
    dorms_max: 3,
    area_min: 65,
    area_max: 95,
    preco_a_partir: 320000,
    thumb_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2',
    nome: 'Residencial Vitória',
    slug: 'residencial-vitoria-criciuma-sc',
    construtora_slug: 'rni',
    construtora_nome: 'Construtora RNI',
    bairro: 'Próspera',
    cidade: 'Criciúma',
    uf: 'SC',
    status: 'em_obras',
    dorms_min: 3,
    dorms_max: 3,
    area_min: 120,
    area_max: 160,
    preco_a_partir: 480000,
    thumb_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '3',
    nome: 'Grand Michel',
    slug: 'grand-michel-criciuma-sc',
    construtora_slug: 'sul-catarinense',
    construtora_nome: 'Construtora Sul',
    bairro: 'Michel',
    cidade: 'Criciúma',
    uf: 'SC',
    status: 'lancamento',
    dorms_min: 2,
    dorms_max: 4,
    area_min: 78,
    area_max: 180,
    preco_a_partir: 420000,
    thumb_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
  },
]

const STATUS_LABELS: Record<string, string> = {
  lancamento: 'Lançamento',
  em_obras: 'Em Obras',
  pronto: 'Pronto',
  vendido: 'Vendido',
}

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  lancamento: { background: C.accent, color: '#1a1305' },
  em_obras: { background: '#2563eb', color: '#fff' },
  pronto: { background: C.green, color: '#fff' },
  vendido: { background: '#4b5563', color: '#fff' },
}

async function getEmpreendimentos() {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    const { data, error } = await supabase
      .from('empreendimentos')
      .select(`
        id, nome, slug, bairro, cidade, uf, status,
        dorms_min, dorms_max, area_min, area_max,
        preco_a_partir, preco_min, thumb_url,
        construtoras ( nome, slug )
      `)
      .eq('destaque', true)
      .or('ativo.eq.true,publicado.eq.true')
      .order('created_at', { ascending: false })
      .limit(6)

    if (error || !data || data.length === 0) return null

    return data.map((emp: any) => ({
      id: emp.id,
      nome: emp.nome,
      slug: emp.slug,
      construtora_slug: emp.construtoras?.slug || 'construtora',
      construtora_nome: emp.construtoras?.nome || 'Construtora',
      bairro: emp.bairro || '',
      cidade: emp.cidade || 'Criciúma',
      uf: emp.uf || 'SC',
      status: emp.status || 'lancamento',
      dorms_min: emp.dorms_min,
      dorms_max: emp.dorms_max,
      area_min: emp.area_min,
      area_max: emp.area_max,
      preco_a_partir: emp.preco_a_partir || emp.preco_min,
      thumb_url: emp.thumb_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
    }))
  } catch {
    return null
  }
}

export default async function FeaturedProperties() {
  const dbProperties = await getEmpreendimentos()
  const properties = dbProperties || FALLBACK_PROPERTIES

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '28px',
    }}>
      {properties.map((emp) => (
        <Link
          key={emp.id}
          href={`/empreendimento/${emp.construtora_slug}/${emp.slug}`}
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
              src={emp.thumb_url}
              alt={emp.nome + ' em ' + emp.bairro + ', ' + emp.cidade + '/' + emp.uf}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {/* Status badge */}
            <span style={{
              position: 'absolute', top: '12px', left: '12px',
              fontSize: '11px', fontWeight: 700,
              padding: '4px 12px', borderRadius: '50px',
              ...(STATUS_STYLE[emp.status] || { background: '#4b5563', color: '#fff' }),
            }}>
              {STATUS_LABELS[emp.status] || emp.status}
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
              {emp.dorms_min && (
                <span>
                  {emp.dorms_min === emp.dorms_max ? emp.dorms_min : emp.dorms_min + '–' + emp.dorms_max} dorm.
                </span>
              )}
              {emp.area_min && (
                <span>
                  {emp.area_min === emp.area_max ? emp.area_min : emp.area_min + '–' + emp.area_max}m²
                </span>
              )}
            </div>

            {/* Price */}
            <div style={{
              color: C.accent2, fontWeight: 900,
              fontSize: '17px',
            }}>
              {emp.preco_a_partir
                ? 'A partir de R$ ' + emp.preco_a_partir.toLocaleString('pt-BR')
                : 'Sob consulta'}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
