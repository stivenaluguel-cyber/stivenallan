import type { Metadata } from 'next'
import Image from 'next/image'
import { HeroImage } from '@/components/HeroImage'
import GalleryWithLightbox from './gallery-lightbox'
import FormContato from '@/app/empreendimento/[construtora]/[slug]/FormContato'

// LP avulsa de um imóvel de terceiro (administração), fora do portfólio Fontana.
// Só existe pra tráfego direto/anúncio — sem link em nenhum menu ou listagem, noindex.
// Padrão visual "hotsite premium" (mesmo sistema do Parco Savello): Bricolage Grotesque
// (display), Cormorant Garamond itálico (destaques), Hanken Grotesk (corpo).

export const metadata: Metadata = {
  title: 'Casa no Guaíba Park — R$ 990.000',
  description: 'Casa de alto padrão em construção no Guaíba Park, Guaíba/RS. 312m² de terreno, 124,80m² privativos, 3 dormitórios (1 suíte), piscina, espaço gourmet. R$ 990.000.',
  robots: { index: false, follow: false },
}

const t = {
  bg: '#FAFAF8',
  ink: '#1A2417',
  gold: '#8A6D3B',
  goldDark: '#6B5228',
  muted: '#5B6459',
  line: 'rgba(26,36,23,0.12)',
  dark: '#12140F',
  onDark: '#F3EFE6',
  onDarkMuted: 'rgba(243,239,230,0.66)',
  display: "'Bricolage Grotesque', system-ui, sans-serif",
  serif: "'Cormorant Garamond', Georgia, serif",
  body: "'Hanken Grotesk', system-ui, sans-serif",
}

const IMG_BASE = '/images/casa-guaiba-park'

const GALERIA = [
  { src: `${IMG_BASE}/hero-render.jpg`, alt: 'Visualização ilustrativa da casa no Guaíba Park', label: 'Projeto (ilustrativo)' },
  { src: `${IMG_BASE}/obra-atual.jpg`, alt: 'Obra da casa no Guaíba Park, vista aérea', label: 'Obra · Vista Aérea' },
  { src: `${IMG_BASE}/obra-04.jpg`, alt: 'Obra da casa no Guaíba Park, estrutura do telhado', label: 'Obra · Estrutura' },
  { src: `${IMG_BASE}/obra-05.jpg`, alt: 'Obra da casa no Guaíba Park, andamento', label: 'Obra · Andamento' },
  { src: `${IMG_BASE}/obra-02.jpg`, alt: 'Obra da casa no Guaíba Park, terreno de esquina', label: 'Terreno de Esquina' },
  { src: `${IMG_BASE}/obra-03-entorno.jpg`, alt: 'Entorno do Guaíba Park', label: 'Entorno do Condomínio' },
  { src: `${IMG_BASE}/obra-aerea.jpg`, alt: 'Fase inicial da obra no Guaíba Park', label: 'Início da Obra' },
]

const STATS = [
  { n: '312', l: 'm² de terreno' },
  { n: '124,80', l: 'm² privativos' },
  { n: '3', l: 'dormitórios' },
  { n: '2', l: 'vagas de garagem' },
]

const DIFERENCIAIS: string[] = [
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
    <main style={{ background: t.bg, color: t.ink, fontFamily: t.body, overflowX: 'hidden' }}>
      <style>{`
        html { scroll-behavior: smooth; }
        .cg-eyebrow { font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase; color: ${t.gold}; font-family: ${t.body}; font-weight: 500; }
        .cg-h1 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.1em; line-height: 1.06; text-shadow: 0 2px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4); font-size: clamp(34px,7.5vw,80px); margin: 0; }
        .cg-h2 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.1; font-size: clamp(24px,4vw,42px); margin: 0; }
        .cg-onimg { text-shadow: 0 1px 16px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5); }
        .cg-serif { font-family: ${t.serif}; font-style: italic; font-weight: 500; }
        .cg-rule { width: 56px; height: 1px; background: ${t.gold}; border: 0; }
        .cg-cta { display: inline-block; font-family: ${t.body}; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: ${t.onDark}; border: 1px solid rgba(243,239,230,0.55); padding: 16px 34px; text-decoration: none; transition: background .35s ease, color .35s ease; cursor: pointer; }
        .cg-cta:hover { background: ${t.onDark}; color: ${t.ink}; }
        .cg-fade { opacity: 0; transform: translateY(20px); animation: cgfade .9s ease forwards; }
        @keyframes cgfade { to { opacity: 1; transform: none; } }
        .cg-gcard { position: relative; overflow: hidden; cursor: zoom-in; }
        .cg-gcard img { transition: transform .8s ease; }
        .cg-gcard:hover img { transform: scale(1.06); }
        .cg-gcard:focus { outline: 2px solid ${t.gold}; outline-offset: 2px; }
        .cg-stat { text-align: center; }
        .cg-badge { display: inline-block; background: rgba(138,109,59,0.14); color: ${t.goldDark}; font-family: ${t.body}; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; padding: 8px 18px; border-radius: 999px; border: 1px solid rgba(138,109,59,0.3); }
      `}</style>

      {/* HERO */}
      <section id="top" style={{ position: 'relative', minHeight: '92svh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: t.dark, overflow: 'hidden' }}>
        <HeroImage
          src={`${IMG_BASE}/hero-render.jpg`}
          alt="Visualização ilustrativa da casa no Guaíba Park, Guaíba/RS"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', opacity: 0.82 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(18,20,15,0.94) 0%, rgba(18,20,15,0.25) 55%, rgba(18,20,15,0.45) 100%)' }} />
        <div className="cg-fade" style={{ position: 'relative', padding: '0 20px 64px', maxWidth: 760, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <p className="cg-eyebrow cg-onimg" style={{ marginBottom: 14 }}>Em construção · Guaíba Park, Guaíba/RS</p>
          <h1 className="cg-h1 cg-onimg" style={{ color: '#fff' }}>Esta linda casa<br />pode ser sua</h1>
          <p className="cg-serif cg-onimg" style={{ color: t.onDark, fontSize: 'clamp(19px,2.6vw,28px)', marginTop: 18, marginBottom: 28 }}>
            Elegância, funcionalidade e qualidade de vida em cada detalhe.
          </p>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="cg-badge" style={{ background: 'rgba(243,239,230,0.14)', color: '#fff', borderColor: 'rgba(243,239,230,0.4)' }}>R$ 990.000,00</span>
            <a href="#contato" className="cg-cta">Quero receber as condições</a>
          </div>
        </div>
      </section>

      {/* INTRO + STATS */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(48px,8vw,88px) 20px 0' }}>
        <div className="cg-fade" style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto' }}>
          <hr className="cg-rule" style={{ margin: '0 auto 20px' }} />
          <p className="cg-eyebrow">Sobre o imóvel</p>
          <p className="cg-serif" style={{ fontSize: 'clamp(22px,3vw,32px)', lineHeight: 1.4, color: t.ink, margin: '14px 0 0' }}>
            Casa de alto padrão à venda, perfeita para quem busca conforto, sofisticação e excelente localização.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 24, marginTop: 56 }}>
          {STATS.map((s) => (
            <div key={s.l} className="cg-stat">
              <div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 'clamp(32px,5vw,52px)', letterSpacing: '0.02em', lineHeight: 1, color: t.gold }}>{s.n}</div>
              <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.muted, marginTop: 10 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* GALERIA */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(56px,8vw,96px) 20px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p className="cg-eyebrow">Galeria</p>
          <h2 className="cg-h2" style={{ marginTop: 8 }}>Projeto & Obra</h2>
          <p style={{ fontSize: 13, color: t.muted, marginTop: 14, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            A primeira imagem é uma visualização ilustrativa gerada a partir da obra real — as demais são fotos atuais, sem edição.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 4 }}>
          <GalleryWithLightbox galeria={GALERIA} prefix="cg" gradient="rgba(18,20,15,0.75)" />
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(56px,8vw,96px) 20px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p className="cg-eyebrow">Diferenciais</p>
          <h2 className="cg-h2" style={{ marginTop: 8 }}>Cada detalhe pensado</h2>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14 }}>
          {DIFERENCIAIS.map((d) => (
            <li key={d} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 16, lineHeight: 1.5, borderBottom: `1px solid ${t.line}`, paddingBottom: 14 }}>
              <span aria-hidden="true" style={{ color: t.gold, fontWeight: 700 }}>✓</span>
              {d}
            </li>
          ))}
        </ul>
      </section>

      {/* LOCALIZAÇÃO */}
      <section style={{ background: t.dark, color: t.onDark, marginTop: 'clamp(56px,8vw,96px)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(56px,9vw,110px) 20px' }}>
          <p className="cg-eyebrow" style={{ textAlign: 'center' }}>Localização</p>
          <h2 className="cg-h2" style={{ textAlign: 'center', color: '#fff', marginTop: 8 }}>Ouça menos o barulho da cidade</h2>
          <p className="cg-serif" style={{ textAlign: 'center', fontSize: 'clamp(19px,2.6vw,26px)', color: t.onDark, margin: '28px 0 0', lineHeight: 1.5 }}>
            Em frente a uma praça com opções de lazer, quadra esportiva e academia ao ar livre.
          </p>
          <p style={{ textAlign: 'center', color: t.onDarkMuted, fontSize: 15, marginTop: 20, lineHeight: 1.6 }}>
            Próxima ao Stock Center, Havan e McDonald&apos;s, com fácil acesso à BR e ao centro da cidade — em Guaíba/RS.
          </p>
        </div>
      </section>

      {/* PREÇO + CONTATO */}
      <section id="contato" style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(56px,9vw,96px) 20px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <p className="cg-eyebrow">Valor</p>
          <div className="cg-serif" style={{ fontSize: 'clamp(40px,7vw,64px)', color: t.ink, marginTop: 10 }}>R$ 990.000,00</div>
          <p style={{ fontSize: 13, color: t.muted, marginTop: 6 }}>Condições e forma de pagamento a combinar direto com o corretor.</p>
        </div>
        <div style={{ background: '#ffffff', border: `1px solid ${t.line}`, borderRadius: 14, padding: '26px 20px' }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, margin: '0 0 6px', textAlign: 'center', fontFamily: t.display }}>Receba as condições no WhatsApp</h2>
          <p style={{ fontSize: 13, color: t.muted, textAlign: 'center', margin: '0 0 18px' }}>
            Fotos atualizadas da obra, vídeo e condições da casa no Guaíba Park — resposta rápida, sem compromisso.
          </p>
          <FormContato empreendimento="Casa Guaíba Park (Guaíba/RS) — R$ 990.000" propertySlug="casa-guaiba-park" />
        </div>
        <p style={{ fontSize: 12, color: '#a1a1aa', textAlign: 'center', marginTop: 24 }}>
          Stiven Allan · Corretor CRECI 60.275 · Atendimento exclusivo
        </p>
      </section>
    </main>
  )
}
