import type { Metadata } from 'next'
import Image from 'next/image'
import FormContato from '@/app/empreendimento/[construtora]/[slug]/FormContato'

// LP avulsa de um imóvel de terceiro (administração), fora do portfólio Fontana.
// Só existe pra tráfego direto/anúncio — sem link em nenhum menu ou listagem, noindex.

export const metadata: Metadata = {
  title: 'Casa em Guaíba Park — condições direto com o corretor',
  description: 'Casa de alto padrão em construção no Guaíba Park, Guaíba/RS. 3 dormitórios (1 suíte), piscina, espaço gourmet, 312m² de terreno. Receba condições.',
  robots: { index: false, follow: false },
}

const DIFERENCIAIS = [
  '3 dormitórios, sendo 1 suíte',
  'Sala de estar com lareira',
  'Espaço gourmet integrado com churrasqueira',
  'Piscina',
  'Garagem coberta para 2 veículos lado a lado',
  'Espera para ar-condicionado',
  'Infraestrutura para aquecimento de água',
  'Paisagismo e acabamentos de alto padrão',
  'Terreno de esquina, totalmente cercado e murado',
]

export default function CasaGuaibaParkPage() {
  return (
    <main style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', background: '#faf7f1', color: '#1a1a1a', minHeight: '100svh' }}>
      <section style={{ position: 'relative', minHeight: '52svh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: '#111', overflow: 'hidden' }}>
        <Image
          unoptimized
          src="/images/casa-guaiba-park/hero-render.jpg"
          alt="Visualização ilustrativa da casa no Guaíba Park, Guaíba/RS"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', opacity: 0.85 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 60%)' }} />
        <div style={{ position: 'relative', padding: '48px 20px 12px', maxWidth: 640, margin: '0 auto', width: '100%' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#e2c275', margin: '0 0 10px' }}>
            Em construção · imagem ilustrativa
          </p>
          <h1 style={{ fontSize: 'clamp(28px,7vw,44px)', lineHeight: 1.08, color: '#fff', margin: 0, fontWeight: 700 }}>
            Casa de alto padrão no Guaíba Park
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', margin: '10px 0 0' }}>Guaíba/RS</p>
        </div>
        <p style={{ position: 'relative', fontSize: 11, color: 'rgba(255,255,255,0.55)', padding: '0 20px 16px', maxWidth: 640, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          Imagem meramente ilustrativa, gerada a partir do projeto e da obra real — não representa o acabamento final.
        </p>
      </section>

      <section style={{ maxWidth: 640, margin: '0 auto', padding: '28px 20px 8px' }}>
        <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 20px' }}>
          Casa de alto padrão à venda, perfeita para quem busca conforto, sofisticação e excelente localização.
          Terreno de 312m², com 124,80m² de área privativa.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
          {DIFERENCIAIS.map((d) => (
            <li key={d} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15, lineHeight: 1.5 }}>
              <span aria-hidden="true" style={{ color: '#2a7d4f', fontWeight: 700 }}>✓</span>
              {d}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ maxWidth: 640, margin: '0 auto', padding: '20px 20px 8px' }}>
        <div style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 14, overflow: 'hidden' }}>
          <Image
            unoptimized
            src="/images/casa-guaiba-park/obra-atual.jpg"
            alt="Obra da casa no Guaíba Park em andamento"
            fill
            sizes="640px"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <p style={{ fontSize: 12, color: '#71717a', textAlign: 'center', marginTop: 8 }}>
          Acompanhe a evolução real da obra — fotos atualizadas.
        </p>
      </section>

      <section style={{ maxWidth: 640, margin: '0 auto', padding: '16px 20px 8px' }}>
        <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0 }}>
          Localizada em frente a uma praça com opções de lazer, quadra esportiva e academia ao ar livre, próxima ao
          Stock Center, Havan, McDonald&apos;s e com fácil acesso à BR e ao centro da cidade.
        </p>
      </section>

      <section style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 48px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e7e0d2', borderRadius: 14, padding: '22px 18px' }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, margin: '0 0 6px', textAlign: 'center' }}>Receba as condições no WhatsApp</h2>
          <p style={{ fontSize: 13, color: '#71717a', textAlign: 'center', margin: '0 0 18px' }}>
            Fotos atualizadas da obra, vídeo e condições da casa no Guaíba Park — resposta rápida, sem compromisso.
          </p>
          <FormContato empreendimento="Casa Guaíba Park (Guaíba/RS)" propertySlug="casa-guaiba-park" />
        </div>
        <p style={{ fontSize: 12, color: '#a1a1aa', textAlign: 'center', marginTop: 24 }}>
          Stiven Allan · Corretor CRECI 60.275 · Atendimento exclusivo
        </p>
      </section>
    </main>
  )
}
