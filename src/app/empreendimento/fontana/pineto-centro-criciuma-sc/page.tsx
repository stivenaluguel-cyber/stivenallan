import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { c, font, brl, ui } from '@/lib/theme'
import Simulador from '@/components/Simulador'
import { CUB_SC, cubLabel, CUB_NOTA } from '@/lib/cub'

const WPP = 'https://api.whatsapp.com/send?phone=5548991642332&text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Pineto%20Residencial'

// Ultima revisao da tabela de unidades (edite ao atualizar).
const TABELA_ATUALIZADA = 'junho/2026'
// Link do catalogo/tabela em PDF (Drive). Deixe '' para ocultar o botao.
const CATALOGO_PDF = 'https://drive.google.com/file/d/1NvzrWE4HAz8UnI9NaTqKeEpaEgmTv5wr/view'
// Tabela de unidades - facil de atualizar mensalmente.
const UNIDADES: { apto: string; area: string; valor: string; tag?: string }[] = [
  { apto: 'Apto 104', area: '76,25 m²', valor: 'R$ 650.212,50', tag: 'menor valor' },
  { apto: 'Apto 102', area: '76,34 m²', valor: 'R$ 693.560,00' },
  { apto: 'Apto 1505', area: '75,72 m²', valor: 'R$ 817.410,00' },
]
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Pineto Residencial — apartamentos no Centro de Criciúma com financiamento direto',
  description: 'Pineto Residencial: apartamentos de 2 dormitórios (1 suíte), 75–76 m², no Centro de Criciúma/SC. Na planta, entrega em 2029, a partir de R$ 619 mil com financiamento direto com a construtora (sem banco). Lançamento Fontana. Consultor Stiven Allan CRECI/RS 60.275.',
  keywords: ['Pineto Residencial', 'apartamento Criciúma', 'lançamento Fontana', 'coworking apartamento Criciúma', 'Stiven Allan corretor SC'],
  alternates: { canonical: `${SITE_URL}/empreendimento/fontana/pineto-centro-criciuma-sc` },
  openGraph: {
    title: 'Pineto Residencial — Lifestyle Completo no Centro de Criciúma/SC',
    description: 'Apartamentos de 2 dormitórios (1 suíte), 75–76 m², no Centro de Criciúma/SC. Na planta, entrega 2029. A partir de R$ 619 mil com financiamento direto com a construtora.',
    url: `${SITE_URL}/empreendimento/fontana/pineto-centro-criciuma-sc`,
    images: [{ url: 'https://lh3.googleusercontent.com/d/1WoeVn8nWbU-Zbr-NGK9fT-quhSH_OFas', width: 1200, height: 630 }],
    type: 'website',
    locale: 'pt_BR',
  },
}

const GALERIA = [
  { id: '1WoeVn8nWbU-Zbr-NGK9fT-quhSH_OFas', alt: 'Pineto Residencial — fachada frontal Centro Criciúma', label: 'Fachada' },
  { id: '1pAWa8inPVV_XM0-CDKNC6M8T6YO5wNGv', alt: 'Pineto — perspectiva angular', label: 'Perspectiva' },
  { id: '1KmOmEQuPraRJUfmW8FBoK-6_WyQ8fFK_', alt: 'Pineto — acesso principal', label: 'Acesso Principal' },
  { id: '1lzQM-x4vIGkMBbwuGrqwIiTZ8RqgdolJ', alt: 'Pineto — hall de entrada sofisticado', label: 'Hall de Entrada' },
  { id: '1PwMdWzuLF7hXM9SkEVNtv90kvjdPR3dt', alt: 'Pineto — living integrado', label: 'Living' },
  { id: '1HKmiz9MsLrg3xrW2WknSq3YdLLlsv921', alt: 'Pineto — suíte master', label: 'Suíte' },
  { id: '1mt3O1a0jWgMHBXK8CCIRjMOQPBrdIqRS', alt: 'Pineto — coworking integrado', label: 'Coworking' },
  { id: '1UY_UxkyWI1gN8dMqW_7UJVl2uMBHsAMP', alt: 'Pineto — espaço yoga e meditação', label: 'Espaço Yoga' },
  { id: '1osvUbZHc8XJP0gZP2Oxbn1PZK1V3fgVW', alt: 'Pineto — academia fitness', label: 'Academia' },
  { id: '1Mg6ipBSqIecSJ9nWmlQtClUwFVzvsm9R', alt: 'Pineto — playground área kids', label: 'Playground' },
  { id: '1ISCgwxJn2DIBQAhUb3bl1dfcOf-34hzC', alt: 'Pineto — salão de festas gourmet', label: 'Salão de Festas' },
]

const DIFERENCIAIS = [
  { icon: '💻', titulo: 'Coworking', desc: 'Espaço de trabalho compartilhado integrado ao empreendimento — trabalhe de casa sem abrir mão do profissionalismo' },
  { icon: '🧘', titulo: 'Espaço Yoga', desc: 'Área exclusiva para yoga e meditação, um diferencial único em Criciúma' },
  { icon: '🏋️', titulo: 'Academia Completa', desc: 'Fitness center equipado para manter a rotina de exercícios no próprio condomínio' },
  { icon: '🏊', titulo: 'Piscina', desc: 'Área aquática para lazer e relaxamento nos momentos de descanso' },
  { icon: '🛝', titulo: 'Playground', desc: 'Espaço kids planejado com segurança e diversão para as crianças' },
  { icon: '🎉', titulo: 'Salão Gourmet', desc: 'Espaço de festas sofisticado com cozinha integrada para seus momentos especiais' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'RealEstateListing',
      name: 'Pineto Residencial',
      description: 'Lançamento na planta no Centro de Criciúma/SC: apartamentos de 2 dormitórios (1 suíte), 75 a 76 m², com financiamento direto com a construtora. Entrega em 30/11/2029. Incorporação OBF Construções Ltda — Construtora Fontana.',
      url: `${SITE_URL}/empreendimento/fontana/pineto-centro-criciuma-sc`,
      image: 'https://lh3.googleusercontent.com/d/1WoeVn8nWbU-Zbr-NGK9fT-quhSH_OFas',
      offers: { '@type': 'Offer', priceCurrency: 'BRL', price: '619250', availability: 'https://schema.org/InStock' },
      address: { '@type': 'PostalAddress', streetAddress: 'Rua Itajaí, Centro', addressLocality: 'Criciúma', addressRegion: 'SC', postalCode: '88801-000', addressCountry: 'BR' },
      floorSize: { '@type': 'QuantitativeValue', minValue: 75, maxValue: 76, unitCode: 'MTK' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Lançamentos Criciúma', item: `${SITE_URL}/lancamentos/criciuma-sc` },
        { '@type': 'ListItem', position: 3, name: 'Pineto Residencial', item: `${SITE_URL}/empreendimento/fontana/pineto-centro-criciuma-sc` },
      ],
    },
  ],
}

export default function PinetoPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      {/* Hover CSS para cards de diferenciais */}
      <style>{'.diff-card:hover { transform: translateY(-2px); border-left-color: #FF6A3D !important; box-shadow: 0 4px 16px rgba(210,78,34,0.12); } .diff-card { transition: transform .2s, border-color .2s, box-shadow .2s; }'}</style>

      {/* NAV / BREADCRUMB */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: c.paper, borderBottom: `1px solid ${c.line}`, padding: '0 clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: c.muted }}>
            <Link href="/" style={{ color: c.muted, textDecoration: 'none' }}>Início</Link>
            <span>/</span>
            <Link href="/lancamentos/criciuma-sc" style={{ color: c.muted, textDecoration: 'none' }}>Lançamentos</Link>
            <span>/</span>
            <span style={{ color: c.ink, fontWeight: 600 }}>Pineto Residencial</span>
          </nav>
          <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ ...ui.btnConvert, fontSize: 13, padding: '10px 20px', minHeight: 44 }}>Reservar</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', height: 'clamp(480px,70vh,680px)', overflow: 'hidden', background: c.charcoal }}>
        <Image
          src={`https://lh3.googleusercontent.com/d/${GALERIA[0].id}`}
          alt="Pineto Residencial — fachada Centro Criciúma SC"
          fill priority
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
          sizes="100vw"
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(19,18,17,0.25) 0%, rgba(19,18,17,0.78) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'clamp(24px,5vw,56px)' }}>
          <div style={{ maxWidth: 700 }}>
            <span style={{ ...ui.eyebrow, display: 'inline-block', marginBottom: 14, color: c.orange }}>LANÇAMENTO · NA PLANTA · ENTREGA 2029 · FONTANA</span>
            <h1 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 'clamp(2.2rem,6vw,4rem)', lineHeight: 1.05, letterSpacing: '-0.025em', color: c.onDark, margin: '0 0 16px' }}>
              Pineto Residencial
            </h1>
            <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: c.onDarkMuted, marginBottom: 32, maxWidth: 520, lineHeight: 1.65 }}>
              Aqui a sua originalidade é o segredo para viver bem — no centro de todos os seus novos planos. Apartamentos de 2 dormitórios com suíte, 75 a 76 m², na Rua Itajaí, coração de Criciúma. Lançamento na planta com entrega em 2029 e financiamento direto com a construtora, sem depender de banco.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ ...ui.btnConvert, minHeight: 48, display: 'inline-flex', alignItems: 'center', boxShadow: '0 8px 28px rgba(255,106,61,0.35)' }}>
                Tenho interesse
              </a>
              <a href="#galeria" style={{ ...ui.btnSecondary, color: c.onDark, borderColor: 'rgba(245,241,234,0.3)', minHeight: 48, display: 'inline-flex', alignItems: 'center' }}>
                Ver galeria
              </a>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 24, left: 'clamp(16px,5vw,40px)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Centro · Rua Itajaí', '2 dorms + suíte', '75–76 m²', 'Financiamento direto'].map(t => (
            <span key={t} style={{ background: 'rgba(19,18,17,0.65)', border: `1px solid ${c.bronze}66`, borderRadius: 40, padding: '5px 14px', fontSize: 12, fontWeight: 600, color: c.onDark, backdropFilter: 'blur(8px)' }}>{t}</span>
          ))}
        </div>
      </section>

      {/* NÚMEROS */}
      <section style={{ background: c.surface, borderBottom: `1px solid ${c.line}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(28px,4vw,40px) clamp(16px,4vw,40px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 24 }}>
          {[
            { v: 'R$ 619.250', l: 'A partir de' },
            { v: '75–76 m²', l: 'Área privativa' },
            { v: '2 dorms + suíte', l: 'Tipologia' },
            { v: '56 unidades', l: 'Edifício 15+ andares' },
            { v: 'Entrega 2029', l: 'Na planta · 30/11/2029' },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: font.display, fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 800, color: c.bronze, letterSpacing: '-0.02em' }}>{v}</div>
              <div style={{ fontSize: 12, color: c.muted, marginTop: 4, letterSpacing: '0.04em' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* OPORTUNIDADE / URGÊNCIA */}
      <section style={{ background: c.ink, padding: 'clamp(40px,6vw,72px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <span style={{ ...ui.eyebrow, color: c.orange }}>POR QUE AGORA</span>
          <h2 style={{ ...ui.h2, color: c.onDark, maxWidth: 720 }}>Na planta é onde o seu dinheiro rende mais</h2>
          <p style={{ color: c.onDarkMuted, fontSize: 'clamp(1rem,1.6vw,1.15rem)', maxWidth: 720, lineHeight: 1.6, margin: '0 0 32px' }}>
            Comprar na fase de lançamento significa o melhor preço por m², condições de pagamento que cabem no seu planejamento e a valorização natural até a entrega das chaves. Quem entra primeiro, escolhe melhor — e paga menos.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
            {[
              { k: 'Melhor preço da tabela', d: 'Valores de lançamento, antes do reajuste das próximas etapas de vendas.' },
              { k: 'Entrada parcelada', d: 'Plano direto com a construtora, sem depender de aprovação bancária para começar.' },
              { k: 'Valorização até a entrega', d: 'Imóveis no Centro de Criciúma tendem a valorizar enquanto você ainda está pagando.' },
              { k: 'Escolha a melhor unidade', d: 'Andar, posição solar e planta: as melhores unidades saem primeiro.' },
            ].map(({ k, d }) => (
              <div key={k} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${c.lineDark}`, borderRadius: 4, padding: '20px 18px' }}>
                <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: '1.05rem', color: c.orange, marginBottom: 8 }}>{k}</div>
                <div style={{ fontSize: 14, color: c.onDarkMuted, lineHeight: 1.55 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERIA */}
      <section id="galeria" style={{ padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,40px)', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <span style={{ ...ui.eyebrow, display: 'block', marginBottom: 12 }}>GALERIA</span>
          <h2 style={{ ...ui.h2, color: c.ink }}>Um novo padrão para Criciúma</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 8, marginBottom: 8 }}>
          <div style={{ borderRadius: 4, overflow: 'hidden', position: 'relative', height: 'clamp(260px,38vw,460px)' }}>
            <Image src={`https://lh3.googleusercontent.com/d/${GALERIA[0].id}`} alt={GALERIA[0].alt} fill style={{ objectFit: 'cover' }} sizes="60vw" />
            <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(19,18,17,0.72)', borderRadius: 2, padding: '4px 12px', fontSize: 12, color: c.onDark, fontWeight: 600 }}>{GALERIA[0].label}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {GALERIA.slice(1, 3).map(img => (
              <div key={img.id} style={{ borderRadius: 4, overflow: 'hidden', position: 'relative', flex: 1 }}>
                <Image src={`https://lh3.googleusercontent.com/d/${img.id}`} alt={img.alt} fill style={{ objectFit: 'cover' }} sizes="30vw" />
                <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(19,18,17,0.72)', borderRadius: 2, padding: '3px 10px', fontSize: 11, color: c.onDark, fontWeight: 600 }}>{img.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
          {GALERIA.slice(3).map(img => (
            <div key={img.id} style={{ borderRadius: 4, overflow: 'hidden', position: 'relative', height: 180 }}>
              <Image src={`https://lh3.googleusercontent.com/d/${img.id}`} alt={img.alt} fill style={{ objectFit: 'cover' }} sizes="260px" />
              <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(19,18,17,0.72)', borderRadius: 2, padding: '3px 10px', fontSize: 11, color: c.onDark, fontWeight: 600 }}>{img.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: 'clamp(8px,2vw,24px) clamp(16px,4vw,40px) clamp(40px,6vw,64px)', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <span style={{ ...ui.eyebrow, display: 'block', marginBottom: 12 }}>VÍDEO</span>
          <h2 style={{ ...ui.h2, color: c.ink }}>Conheça o Pineto em movimento</h2>
        </div>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 4, overflow: 'hidden', background: '#000' }}>
          <iframe
            src="https://drive.google.com/file/d/1cNbxAoNKNQwoSo6bzCGYAl9_C1_gELOG/preview"
            title="Vídeo Pineto Residencial"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            loading="lazy"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section style={{ background: c.surface, padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,40px)', borderTop: `1px solid ${c.line}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ ...ui.eyebrow, display: 'block', marginBottom: 12 }}>DIFERENCIAIS</span>
            <h2 style={{ ...ui.h2, color: c.ink }}>O que só o Pineto tem</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {DIFERENCIAIS.map(d => (
              <div key={d.titulo} className="diff-card" style={{ ...ui.card, padding: '22px 24px', display: 'flex', gap: 16, alignItems: 'flex-start', borderLeft: `3px solid ${c.bronze}` }}>
                <span style={{ fontSize: 26, flexShrink: 0, marginTop: 2 }}>{d.icon}</span>
                <div>
                  <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 15, color: c.ink, marginBottom: 6 }}>{d.titulo}</div>
                  <div style={{ fontSize: 13, color: c.muted, lineHeight: 1.6 }}>{d.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COWORKING DESTAQUE */}
      <section style={{ padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,40px)', background: c.paper }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(32px,5vw,64px)', alignItems: 'center' }}>
          <div style={{ borderRadius: 4, overflow: 'hidden', position: 'relative', height: 'clamp(260px,35vw,400px)', border: `1px solid ${c.line}` }}>
            <Image src={`https://lh3.googleusercontent.com/d/${GALERIA[6].id}`} alt="Pineto — coworking integrado" fill style={{ objectFit: 'cover' }} sizes="50vw" />
          </div>
          <div>
            <span style={{ background: `${c.bronze}18`, border: `1px solid ${c.bronze}40`, borderRadius: 40, padding: '5px 14px', fontSize: 11, fontWeight: 700, color: c.bronze, display: 'inline-block', marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Exclusivo no Pineto
            </span>
            <h2 style={{ ...ui.h2, color: c.ink }}>Coworking integrado ao seu lar</h2>
            <p style={{ fontSize: 15, color: c.muted, lineHeight: 1.8, marginTop: 20, marginBottom: 16 }}>
              O Pineto é o único empreendimento residencial em Criciúma com coworking profissional integrado. Trabalhe com produtividade, sem deslocamento, com toda a infraestrutura que você precisa a passos do seu apartamento.
            </p>
            <p style={{ fontSize: 15, color: c.muted, lineHeight: 1.8 }}>
              Ideal para profissionais remotos, empreendedores e quem valoriza equilíbrio entre vida profissional e pessoal.
            </p>
          </div>
        </div>
      </section>

      {/* YOGA DESTAQUE */}
      <section style={{ background: c.charcoal, padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(32px,5vw,64px)', alignItems: 'center' }}>
            <div>
              <span style={{ ...ui.eyebrow, display: 'block', marginBottom: 16, color: c.orange }}>BEM-ESTAR</span>
              <h2 style={{ ...ui.h2, color: c.onDark }}>Espaço Yoga e Meditação</h2>
              <p style={{ fontSize: 15, color: c.onDarkMuted, lineHeight: 1.8, marginTop: 20 }}>
                Um espaço dedicado ao equilíbrio mental e físico, projetado para a prática de yoga, meditação e alongamento. Mais um diferencial que coloca o Pineto em uma categoria única no mercado imobiliário de Criciúma.
              </p>
            </div>
            <div style={{ borderRadius: 4, overflow: 'hidden', position: 'relative', height: 'clamp(240px,30vw,360px)' }}>
              <Image src={`https://lh3.googleusercontent.com/d/${GALERIA[7].id}`} alt="Pineto — espaço yoga meditação" fill style={{ objectFit: 'cover' }} sizes="50vw" />
            </div>
          </div>
        </div>
      </section>

      {/* PARA QUEM É */}
      <section style={{ background: c.paper, padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,40px)', borderTop: `1px solid ${c.line}` }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <span style={{ ...ui.eyebrow, color: c.bronze }}>FEITO PARA O SEU MOMENTO</span>
          <h2 style={{ ...ui.h2, color: c.ink, maxWidth: 720 }}>O Pineto foi pensado para quem vive intensamente</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 20, marginTop: 32 }}>
            {[
              { icon: '👩‍💻', t: 'Profissional remoto', d: 'Trabalha de casa com o coworking a um elevador de distância. Produtividade sem perder o conforto de morar bem.' },
              { icon: '💑', t: 'Casal que está começando', d: 'O primeiro apartamento dos sonhos, em localização nobre, com financiamento que cabe no orçamento de quem está construindo a vida.' },
              { icon: '📈', t: 'Investidor inteligente', d: 'Imóvel no Centro de Criciúma, na planta, com alto potencial de valorização e demanda garantida de locação.' },
              { icon: '🧘', t: 'Quem busca qualidade de vida', d: 'Yoga, academia e piscina no próprio prédio. Bem-estar deixa de ser meta e vira rotina.' },
            ].map(({ icon, t, d }) => (
              <div key={t} style={{ ...ui.card, padding: '24px 22px' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: '1.15rem', color: c.ink, marginBottom: 8 }}>{t}</div>
                <div style={{ fontSize: 14.5, color: c.muted, lineHeight: 1.6 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONDIÇÕES DE NEGOCIAÇÃO — protagonista */}
      <section style={{ background: c.ink, padding: 'clamp(48px,7vw,84px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <span style={{ ...ui.eyebrow, color: c.orange }}>FINANCIAMENTO DIRETO COM A CONSTRUTORA</span>
          <h2 style={{ ...ui.h2, color: c.onDark, maxWidth: 760 }}>Compre sem depender de banco</h2>
          <p style={{ color: c.onDarkMuted, fontSize: 'clamp(1rem,1.6vw,1.15rem)', maxWidth: 720, lineHeight: 1.6, margin: '0 0 36px' }}>
            Na Fontana você negocia direto com a incorporadora: entrada parcelada, reforços anuais e parcela mensal que cabem no seu planejamento — sem fila de banco e sem análise demorada.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 28 }}>
            {[
              { n: '1x', l: 'Entrada' },
              { n: '4x', l: 'Reforços anuais' },
              { n: '41x', l: 'Parcelas mensais' },
            ].map(({ n, l }) => (
              <div key={l} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${c.lineDark}`, borderRadius: 4, padding: '22px 18px', textAlign: 'center' }}>
                <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: '2.4rem', color: c.orange, lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 13.5, color: c.onDarkMuted, marginTop: 8 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
            {[
              { t: 'À vista com 5% OFF', d: 'Desconto de 5% para pagamento à vista do valor da unidade.' },
              { t: 'Parcelamento estendido', d: 'Opção em até 240x, corrigidas por IGPM + 0,75% a.m.' },
              { t: 'Correção na obra: CUB/SC', d: 'Durante a construção, parcelas e reforços seguem o CUB/SC. Após a obra: IGPM + 0,75% a.m.' },
              { t: 'Vencimento flexível', d: 'Escolha o melhor dia: 10, 15, 20, 25 ou 27.' },
            ].map(({ t, d }) => (
              <div key={t} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${c.lineDark}`, borderRadius: 4, padding: '20px 18px' }}>
                <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: '1.05rem', color: c.onDark, marginBottom: 8 }}>{t}</div>
                <div style={{ fontSize: 13.5, color: c.onDarkMuted, lineHeight: 1.55 }}>{d}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28, background: c.paper, borderRadius: 6, padding: 'clamp(20px,3vw,28px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 18, borderLeft: `4px solid ${c.orange}` }}>
            <div>
              <div style={{ ...ui.eyebrow, color: c.bronze, marginBottom: 6 }}>ÍNDICE DE CORREÇÃO · CUB/SC</div>
              <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: c.ink, lineHeight: 1 }}>{cubLabel(CUB_SC)} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: c.muted }}>/ m²</span></div>
              <div style={{ fontSize: 13.5, color: c.muted, marginTop: 6 }}>Vigência {CUB_SC.vigencia} · fonte {CUB_SC.fonte}. {CUB_NOTA}</div>
            </div>
            <a href={CUB_SC.fonteUrl} target="_blank" rel="noopener noreferrer" style={{ ...ui.btnSecondary, whiteSpace: 'nowrap' }}>Ver no {CUB_SC.fonte}</a>
          </div>
        </div>
      </section>

      {/* TABELA DE UNIDADES */}
      <section style={{ background: c.surface, padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,40px)', borderTop: `1px solid ${c.line}` }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <span style={{ ...ui.eyebrow, color: c.bronze }}>TABELA DE UNIDADES</span>
          <h2 style={{ ...ui.h2, color: c.ink, maxWidth: 720 }}>Disponibilidade e valores</h2>
          <p style={{ color: c.muted, fontSize: '1.05rem', maxWidth: 700, lineHeight: 1.6, margin: '0 0 28px' }}>
            Faixa de R$ 619.250,00 a R$ 832.891,25. Unidades de 2 dormitórios (1 suíte). Valores sujeitos a alteração e disponibilidade — consulte a tabela atualizada.
          </p>
          <div style={{ overflowX: 'auto', border: `1px solid ${c.line}`, borderRadius: 6 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 460 }}>
              <thead>
                <tr style={{ background: c.ink }}>
                  <th style={{ textAlign: 'left', padding: '14px 18px', color: c.onDark, fontFamily: font.display, fontWeight: 700 }}>Apto</th>
                  <th style={{ textAlign: 'left', padding: '14px 18px', color: c.onDark, fontFamily: font.display, fontWeight: 700 }}>Área privativa</th>
                  <th style={{ textAlign: 'right', padding: '14px 18px', color: c.onDark, fontFamily: font.display, fontWeight: 700 }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {UNIDADES.map((u, i) => (
                  <tr key={u.apto} style={{ background: i % 2 ? c.paper : c.surface, borderTop: `1px solid ${c.line}` }}>
                    <td style={{ padding: '13px 18px', color: c.ink, fontWeight: 600 }}>
                      {u.apto}{u.tag && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: c.orange, border: `1px solid ${c.orange}`, borderRadius: 40, padding: '2px 8px' }}>{u.tag}</span>}
                    </td>
                    <td style={{ padding: '13px 18px', color: c.muted }}>{u.area}</td>
                    <td style={{ padding: '13px 18px', color: c.ink, fontWeight: 700, textAlign: 'right' }}>{u.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18, alignItems: 'center' }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ ...ui.btnSecondary }}>Ver tabela completa (56 unidades)</a>
            {CATALOGO_PDF && (
              <a href={CATALOGO_PDF} target="_blank" rel="noopener noreferrer" style={{ ...ui.btnPrimary }}>Baixar catálogo / tabela (PDF)</a>
            )}
            <span style={{ fontSize: 12.5, color: c.muted }}>Tabela atualizada mensalmente. Última atualização: {TABELA_ATUALIZADA}.</span>
          </div>
        </div>
      </section>

      {/* SIMULADOR */}
      <div style={{ background: c.surface, borderTop: `1px solid ${c.line}` }}>
        <Simulador
          valorInicial={619250}
          valorMin={619250}
          valorMax={832891}
          hrefReserva={WPP}
        />
      </div>

      {/* LOCALIZAÇÃO */}
      <section style={{ padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,40px)', background: c.paper, borderTop: `1px solid ${c.line}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <span style={{ ...ui.eyebrow, display: 'block', marginBottom: 12 }}>LOCALIZAÇÃO</span>
          <h2 style={{ ...ui.h2, color: c.ink }}>Centro de Criciúma — tudo a sua porta</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 32 }}>
            {['Shopping Della', 'Hospital São José', 'Universidades UNESC e SATC', 'Gastronomia e bares', 'Comércio e bancos', 'Terminal de ônibus'].map(item => (
              <div key={item} style={{ ...ui.card, padding: '14px 18px', display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 6, height: 6, background: c.bronze, borderRadius: '50%', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: c.ink }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FICHA TECNICA */}
      <section style={{ background: c.paper, padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,40px)', borderTop: `1px solid ${c.line}` }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <span style={{ ...ui.eyebrow, color: c.bronze }}>FICHA TÉCNICA</span>
          <h2 style={{ ...ui.h2, color: c.ink }}>Informações do empreendimento</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 0, marginTop: 28, border: `1px solid ${c.line}`, borderRadius: 6, overflow: 'hidden' }}>
            {[
              { k: 'Empreendimento', v: 'Pineto Residencial' },
              { k: 'Construtora / vendas', v: 'Fontana' },
              { k: 'Incorporadora', v: 'OBF Construções Ltda' },
              { k: 'Endereço', v: 'Rua Itajaí, Centro — Criciúma/SC' },
              { k: 'Tipologia', v: '2 dormitórios (1 suíte)' },
              { k: 'Área privativa', v: '75 a 76 m²' },
              { k: 'Edifício', v: '15+ andares · 56 unidades · 2 elevadores' },
              { k: 'Fase da obra', v: 'Na planta' },
              { k: 'Previsão de entrega', v: '30/11/2029' },
              { k: 'Faixa de preço', v: 'R$ 619.250,00 a R$ 832.891,25' },
              { k: 'Matrícula', v: 'R-7-160.123 — 1º Ofício R.I. Criciúma/SC' },
            ].map(({ k, v }) => (
              <div key={k} style={{ padding: '16px 20px', borderTop: `1px solid ${c.line}`, borderRight: `1px solid ${c.line}` }}>
                <div style={{ fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', color: c.bronze, marginBottom: 5 }}>{k}</div>
                <div style={{ fontSize: 15, color: c.ink, fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: c.muted, marginTop: 14 }}>Imagens ilustrativas. Informações e valores sujeitos a alteração sem aviso prévio.</p>
        </div>
      </section>

      {/* PROVA SOCIAL / AUTORIDADE */}
      <section style={{ background: c.paper, padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,40px)', borderTop: `1px solid ${c.line}` }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <span style={{ ...ui.eyebrow, color: c.bronze }}>CONFIANÇA</span>
          <h2 style={{ ...ui.h2, color: c.ink, maxWidth: 720 }}>Você não está sozinho nessa decisão</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginTop: 28 }}>
            {[
              { v: 'Fontana', l: 'Construtora consolidada em Criciúma' },
              { v: 'CRECI/RS 60.275', l: 'Consultor registrado e regularizado' },
              { v: 'Financiamento', l: 'Direto com a construtora, sem burocracia bancária' },
              { v: 'Atendimento 1:1', l: 'Acompanhamento do interesse à entrega das chaves' },
            ].map(({ v, l }) => (
              <div key={l} style={{ textAlign: 'center', padding: '24px 16px', borderRight: `1px solid ${c.line}` }}>
                <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: '1.4rem', color: c.orange, marginBottom: 8 }}>{v}</div>
                <div style={{ fontSize: 13.5, color: c.muted, lineHeight: 1.5 }}>{l}</div>
              </div>
            ))}
          </div>
          <blockquote style={{ margin: '40px auto 0', maxWidth: 760, textAlign: 'center', fontFamily: font.display, fontWeight: 600, fontSize: 'clamp(1.2rem,2.4vw,1.6rem)', lineHeight: 1.45, color: c.ink }}>
            "Meu trabalho é simples: te mostrar a unidade certa, com as melhores condições, e cuidar de cada detalhe até a chave na sua mão."
            <footer style={{ fontFamily: font.body, fontWeight: 500, fontSize: 14, color: c.bronze, marginTop: 14 }}>— Stiven Allan, seu consultor Fontana</footer>
          </blockquote>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: c.surface, padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,40px)', borderTop: `1px solid ${c.line}` }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <span style={{ ...ui.eyebrow, color: c.bronze }}>DÚVIDAS FREQUENTES</span>
          <h2 style={{ ...ui.h2, color: c.ink }}>Tudo o que você precisa saber antes de decidir</h2>
          <div style={{ marginTop: 28 }}>
            {[
              { q: 'Quando o Pineto fica pronto?', a: 'O Pineto está na planta, com entrega prevista para 30/11/2029. Comprar agora garante o melhor preço de tabela, a escolha das melhores unidades e prazo para se organizar financeiramente até as chaves.' },
              { q: 'Consigo financiar direto com a construtora?', a: 'Sim. A Fontana financia direto: entrada + 4 reforços anuais + 41 parcelas mensais (ou em até 240x corrigidas por IGPM + 0,75% a.m.), sem depender de banco. Há 5% de desconto à vista. Durante a obra a correção é pelo CUB/SC. O consultor monta o plano ideal para você.' },
              { q: 'Quais as opções de planta e metragem?', a: 'São apartamentos de 2 dormitórios, sendo 1 suíte, com área privativa de 75 a 76 m². A disponibilidade e os valores (de R$ 619.250 a R$ 832.891) mudam conforme as vendas — vale consultar a tabela atualizada.' },
              { q: 'O coworking e a academia têm custo extra?', a: 'A infraestrutura de lazer (coworking, espaço yoga, academia, piscina, playground e salão gourmet) faz parte do condomínio e é de uso de todos os moradores.' },
              { q: 'Como faço para garantir a minha unidade?', a: 'Basta falar com o consultor pelo WhatsApp. Ele verifica a disponibilidade em tempo real, apresenta as condições e conduz a reserva de forma segura.' },
            ].map(({ q, a }) => (
              <details key={q} style={{ borderBottom: `1px solid ${c.line}`, padding: '18px 0' }}>
                <summary style={{ cursor: 'pointer', fontFamily: font.display, fontWeight: 700, fontSize: '1.08rem', color: c.ink, listStyle: 'none' }}>{q}</summary>
                <p style={{ margin: '12px 0 0', fontSize: 15, color: c.muted, lineHeight: 1.65 }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA CONSULTOR */}
      <section style={{ background: c.charcoal, padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ ...ui.eyebrow, display: 'block', marginBottom: 16, color: c.orange }}>CONSULTOR EXCLUSIVO</span>
          <h2 style={{ ...ui.h2, color: c.onDark }}>Stiven Allan — CRECI/RS 60.275</h2>
          <p style={{ fontSize: 15, color: c.onDarkMuted, lineHeight: 1.7, margin: '20px 0 32px' }}>
            Especialista em lançamentos Fontana em Criciúma. Atendimento personalizado, análise de investimento e acompanhamento completo do processo de compra.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer"
              style={{ background: '#25d366', color: '#fff', borderRadius: 2, padding: '15px 28px', fontWeight: 700, fontSize: 15, textDecoration: 'none', minHeight: 48, display: 'inline-flex', alignItems: 'center' }}>
              Chamar no WhatsApp
            </a>
            <a href="tel:+5548991642332"
              style={{ ...ui.btnSecondary, color: c.onDark, borderColor: c.lineDark, minHeight: 48, display: 'inline-flex', alignItems: 'center' }}>
              (48) 99164-2332
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER MÍNIMO */}
      <footer style={{ background: c.charcoal, borderTop: `1px solid ${c.lineDark}`, padding: 'clamp(24px,3vw,32px) clamp(16px,4vw,40px)', textAlign: 'center', color: c.onDarkMuted, fontSize: 13 }}>
        <p style={{ margin: 0 }}>
          Pineto Residencial · Fontana Construtora · Centro, Criciúma/SC<br />
          Consultor: Stiven Allan · CRECI/RS 60.275 · (48) 99164-2332
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'rgba(245,241,234,0.35)' }}>
          As imagens são ilustrativas. Informações sujeitas a alterações sem aviso prévio.
        </p>
      </footer>

      {/* CTA STICKY MOBILE */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 80, background: c.paper, borderTop: `1px solid ${c.line}`, padding: '12px 16px', display: 'flex', gap: 8 }}>
        <a href={WPP} target="_blank" rel="noopener noreferrer"
          style={{ ...ui.btnConvert, flex: 1, textAlign: 'center', minHeight: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
          Tenho interesse — WhatsApp
        </a>
      </div>
    </>
  )
}
