import type { Metadata } from 'next'
import Image from 'next/image'
import { HeroImage } from '@/components/HeroImage'
import Link from 'next/link'
import GalleryWithLightbox from './gallery-lightbox'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import { SITE_URL } from '@/lib/site'

const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Aura%20Residence%20em%20Crici%C3%BAma.%20Pode%20me%20passar%20mais%20informa%C3%A7%C3%B5es%3F'
const SLUG = 'aura-residence-centro-criciuma-sc'
const NOME = 'Aura Residence'

// Renders oficiais da Eraldo Construções — pasta compartilhada "AURA RESIDENCE"
// (Drive) para fachadas, e o próprio site oficial (wp-content/uploads) para os
// interiores e plantas humanizadas. Todas as URLs confirmadas publicamente
// acessíveis (200, sem sessão) antes de usar aqui.
const HERO_IMG = 'https://lh3.googleusercontent.com/d/1L2HRoIQKbtlcNudne3TfP-eML4gDrRgB'
const BLUEHOUR_IMG = 'https://lh3.googleusercontent.com/d/1vsT7hcot_oAbg4FpTEAnbexORMrj-1-E'
const ERALDO_SITE = 'https://www.eraldoconstrucoes.com.br/wp-content/uploads'

export const metadata: Metadata = {
  title: 'Aura Residence | Centro Criciúma',
  description: 'Aura Residence, o lançamento no Centro de Criciúma/SC — 17 pavimentos, 44 unidades e área de lazer completa. Financiamento direto com a construtora, sem banco. Fale com Stiven Allan.',
  alternates: { canonical: SITE_URL + '/empreendimento/eraldo/aura-residence-centro-criciuma-sc' },
  openGraph: {
    title: 'Aura Residence | Criciúma | Stiven Allan',
    description: 'Lançamento no Centro de Criciúma. 17 pavimentos, 44 unidades. Financiamento direto Eraldo Construções.',
    url: SITE_URL + '/empreendimento/eraldo/aura-residence-centro-criciuma-sc',
    siteName: 'Stiven Allan — Imóveis',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: HERO_IMG, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aura Residence | Centro Criciúma | Stiven Allan',
    description: 'Lançamento no Centro de Criciúma. 17 pavimentos, 44 unidades. Financiamento direto.',
    images: [HERO_IMG],
  },
  robots: { index: true, follow: true },
}

const DIFERENCIAIS_GRUPOS = [
  {
    titulo: 'Segurança & Acesso',
    itens: [
      { ico: '🔐', title: 'Fechadura digital com biometria', desc: 'Segurança e praticidade na porta do apartamento.' },
      { ico: '🪪', title: 'Acesso facial e QR Code', desc: 'Reconhecimento facial e QR Code no hall de entrada.' },
      { ico: '🛗', title: '3 elevadores', desc: 'Circulação ágil, mesmo nos horários de pico.' },
      { ico: '🚗', title: 'Garage hall', desc: 'Recepção coberta para embarque e desembarque com conforto.' },
      { ico: '📹', title: 'Monitoramento eletrônico', desc: 'Áreas comuns com vigilância contínua.' },
    ],
  },
  {
    titulo: 'Conforto acústico & Tecnologia',
    itens: [
      { ico: '🪟', title: 'Persianas automatizadas', desc: 'Controle de luz e privacidade com um toque, direto na esquadria.' },
      { ico: '🧱', title: 'Paredes mais espessas entre apartamentos', desc: 'Mais privacidade acústica entre unidades vizinhas.' },
      { ico: '🔇', title: 'Contrapiso com atenuante de ruído', desc: 'Conforto sonoro no impacto entre andares.' },
      { ico: '🏊', title: 'Piscina com trocador de calor', desc: 'Pré-instalação pronta para climatização futura.' },
      { ico: '🍖', title: 'Churrasqueira a carvão com exaustor', desc: 'Sabor de verdade, sem fumaça dentro de casa.' },
    ],
  },
  {
    titulo: 'Sustentabilidade',
    itens: [
      { ico: '☀️', title: 'Energia fotovoltaica', desc: 'Geração própria de energia solar nas áreas comuns.' },
      { ico: '💧', title: 'Reúso de água da chuva', desc: 'Aproveitamento na limpeza das áreas comuns.' },
    ],
  },
  {
    titulo: 'Design & Acabamento',
    itens: [
      { ico: '🚪', title: 'Porta pivotante', desc: 'Entrada do apartamento com acabamento diferenciado.' },
      { ico: '🧱', title: 'Forro de gesso com bordas negativas', desc: 'Detalhe de acabamento premium no teto.' },
      { ico: '🏛', title: 'Fachada 100% pastilhada', desc: 'Acabamento nobre e durável em toda a fachada.' },
      { ico: '🏺', title: 'Porcelanato 80×80 nas áreas comuns', desc: 'Acabamento em grandes formatos.' },
      { ico: '🌂', title: 'Deck coberto', desc: 'Área externa protegida em qualquer estação do ano.' },
      { ico: '🗄', title: 'Depósito individual', desc: 'Espaço extra de armazenamento por apartamento.' },
    ],
  },
]

const FICHA_TECNICA = [
  'Espaço Delivery',
  'Carregamento para carros elétricos',
  'Acesso à garagem por reconhecimento de placa',
  'Máquina de gelo nas áreas de lazer',
  'Nicho e espera para ducha higiênica',
  'Pré-instalação para automação residencial',
  'Ar-condicionado com tubulação de cobre',
  'Pré-instalação de água e gás',
  'Cabeamento de internet em todos os quartos e living',
  'Tomadas com USB-C',
  '16 apartamentos com 3 vagas de garagem',
]

const LAZER = ['Piscina com prainha e deck', 'Salão de festas', '2 espaços gourmet', 'Wellness Center', 'Espaço Mulher', 'Brinquedoteca', 'Coworking', 'Pet Place', 'Playground']

const GALERIA = [
  { src: `${ERALDO_SITE}/2025/09/07_EXT03_TERRACO-PISCINA_HR-scaled.jpg`, alt: 'Aura Residence — terraço com piscina', label: 'Terraço piscina' },
  { src: `${ERALDO_SITE}/2025/10/07_EXT04_TERRACO-PET-PLACE_HR-2-scaled.jpg`, alt: 'Aura Residence — terraço pet place', label: 'Terraço pet place' },
  { src: `${ERALDO_SITE}/2025/10/07_INT01_HALL_HR-1-1536x864.jpg`, alt: 'Aura Residence — hall de entrada', label: 'Hall de entrada' },
  { src: `${ERALDO_SITE}/2025/09/07_INT02_SALAO-DE-FESTAS_HR-scaled.jpg`, alt: 'Aura Residence — salão de festas', label: 'Salão de festas' },
  { src: `${ERALDO_SITE}/2025/10/07_INT03_ESPACO-GOURMET_HR-2-scaled.jpg`, alt: 'Aura Residence — espaço gourmet', label: 'Espaço gourmet' },
  { src: `${ERALDO_SITE}/2025/10/07_INT04_ACADEMIA_HR-2-scaled.jpg`, alt: 'Aura Residence — wellness center', label: 'Wellness Center' },
  { src: `${ERALDO_SITE}/2025/10/07_INT05_COWORKING_HR-1-scaled.jpg`, alt: 'Aura Residence — coworking', label: 'Coworking' },
  { src: `${ERALDO_SITE}/2025/10/07_INT06_ESPACO-BELEZA_HR-2-scaled.jpg`, alt: 'Aura Residence — espaço mulher', label: 'Espaço Mulher' },
  { src: `${ERALDO_SITE}/2025/10/07_INT07_BRINQUEDOTECA_HR-2-scaled.jpg`, alt: 'Aura Residence — brinquedoteca', label: 'Brinquedoteca' },
  { src: `${ERALDO_SITE}/2025/10/07_INT08_LIVING-TIPO_HR-1-1536x864.jpg`, alt: 'Aura Residence — living do apartamento tipo', label: 'Living · Apto tipo' },
  { src: `${ERALDO_SITE}/2025/10/07_INT09_LIVING-COBERTURA_HR-2-scaled.jpg`, alt: 'Aura Residence — living da cobertura duplex', label: 'Living · Cobertura' },
]

// categoria: usada só pra agrupar a exibição (Apartamentos tipo / Coberturas duplex /
// Áreas comuns e garagens). Ficha técnica (m², dormitórios, suítes, vagas) ainda não
// chegou por unidade — os campos existem no tipo GalItem mas ficam de fora aqui até
// termos o dado real; o card só mostra o chip quando algum vier preenchido.
const PLANTAS = [
  { categoria: 'tipo', src: `${ERALDO_SITE}/2025/10/Aura-Planta-Humanizada_Tipo-Final-01-V01-scaled-e1764188009811.png`, alt: 'Aura Residence — planta apartamento tipo final 01', label: 'Tipo final 01' },
  { categoria: 'tipo', src: `${ERALDO_SITE}/2025/10/Aura-Planta-Humanizada_Tipo-Final-02-V01-2-scaled-e1764188411574.png`, alt: 'Aura Residence — planta apartamento tipo final 02', label: 'Tipo final 02' },
  { categoria: 'tipo', src: `${ERALDO_SITE}/2025/10/Aura-Planta-Humanizada_Tipo-Final-03-V01-3-scaled-e1764188707216.png`, alt: 'Aura Residence — planta apartamento tipo final 03', label: 'Tipo final 03' },
  { categoria: 'tipo', src: `${ERALDO_SITE}/2025/10/Aura-Planta-Humanizada_Tipo-Final-04-V01-1-scaled-e1764188763360.png`, alt: 'Aura Residence — planta apartamento tipo final 04', label: 'Tipo final 04' },
  { categoria: 'duplex', src: `${ERALDO_SITE}/2025/10/Aura-Planta-Humanizada_Duplex-Inf.-Final-01-V01-scaled-e1764188853963.png`, alt: 'Aura Residence — planta duplex inferior 01', label: 'Duplex inferior 01' },
  { categoria: 'duplex', src: `${ERALDO_SITE}/2025/10/Aura-Planta-Humanizada_Duplex-Sup.-Final-01-V01-scaled-e1764189176390.png`, alt: 'Aura Residence — planta duplex superior 01', label: 'Duplex superior 01' },
  { categoria: 'duplex', src: `${ERALDO_SITE}/2025/10/Aura-Planta-Humanizada_Duplex-Inf.-Final-02-V01-scaled-e1764189253552.png`, alt: 'Aura Residence — planta duplex inferior 02', label: 'Duplex inferior 02' },
  { categoria: 'duplex', src: `${ERALDO_SITE}/2025/10/Aura-Planta-Humanizada_Duplex-Sup.-Final-02-V01-scaled-e1764189320833.png`, alt: 'Aura Residence — planta duplex superior 02', label: 'Duplex superior 02' },
  { categoria: 'duplex', src: `${ERALDO_SITE}/2025/10/Aura-Planta-Humanizada_Duplex-Inf.-Final-03-V01-scaled-e1764189379115.png`, alt: 'Aura Residence — planta duplex inferior 03', label: 'Duplex inferior 03' },
  { categoria: 'duplex', src: `${ERALDO_SITE}/2025/10/Aura-Planta-Humanizada_Duplex-Sup.-Final-03-V01-scaled-e1764189420419.png`, alt: 'Aura Residence — planta duplex superior 03', label: 'Duplex superior 03' },
  { categoria: 'duplex', src: `${ERALDO_SITE}/2025/10/Aura-Planta-Humanizada_Duplex-Inf.-Final-04-V01-scaled-e1764189501135.png`, alt: 'Aura Residence — planta duplex inferior 04', label: 'Duplex inferior 04' },
  { categoria: 'duplex', src: `${ERALDO_SITE}/2025/10/Aura-Planta-Humanizada_Duplex-Sup.-Final-04-V01-2-scaled-e1764189733890.png`, alt: 'Aura Residence — planta duplex superior 04', label: 'Duplex superior 04' },
  { categoria: 'comum', src: `${ERALDO_SITE}/2025/11/Aura-Planta-Humanizada_Area-de-Lazer-Alt.-Academia-scaled.png`, alt: 'Aura Residence — planta do pavimento de lazer', label: 'Área de lazer' },
  { categoria: 'comum', src: `${ERALDO_SITE}/2025/10/Aura-Planta-Humanizada_Terreo-V02.png`, alt: 'Aura Residence — planta do térreo', label: 'Térreo' },
  { categoria: 'comum', src: `${ERALDO_SITE}/2025/10/Aura-Planta-Humanizada_Subsolo-01-V01.png`, alt: 'Aura Residence — planta do subsolo 1', label: 'Subsolo 1' },
  { categoria: 'comum', src: `${ERALDO_SITE}/2025/10/Aura-Planta-Humanizada_Subsolo-02-V02.png`, alt: 'Aura Residence — planta do subsolo 2', label: 'Subsolo 2' },
  { categoria: 'comum', src: `${ERALDO_SITE}/2025/10/Aura-Planta-Humanizada_Subsolo-03-V01.png`, alt: 'Aura Residence — planta do subsolo 3', label: 'Subsolo 3' },
]

const PLANTAS_GRUPOS = [
  { titulo: 'Apartamentos tipo', categoria: 'tipo' },
  { titulo: 'Coberturas duplex', categoria: 'duplex' },
  { titulo: 'Áreas comuns e garagens', categoria: 'comum' },
]

const FAQ = [
  { pergunta: 'Como funciona o financiamento direto do Aura Residence?', resposta: 'Parcelamento direto com a construtora: 20% de entrada, reforços anuais e o saldo em parcelas mensais corrigidas pelo CUB/SC, sem necessidade de aprovação bancária. Há também condição com desconto para pagamento à vista. Fale com Stiven para as condições atualizadas.' },
  { pergunta: 'Qual a previsão de entrega do Aura Residence?', resposta: 'Entrega prevista para abril de 2029, no Centro de Criciúma/SC.' },
  { pergunta: 'O Aura Residence já iniciou as obras?', resposta: 'É um lançamento — a obra está na fase inicial. Fale com Stiven para saber a etapa atual e as condições de lançamento, normalmente as mais vantajosas.' },
  { pergunta: 'Quantos pavimentos e apartamentos tem o Aura Residence?', resposta: '17 pavimentos, com 40 apartamentos tipo e 4 coberturas duplex — 4 unidades por andar.' },
  { pergunta: 'Quem é a construtora do Aura Residence?', resposta: 'Eraldo Construções, com atuação em Tubarão, Criciúma, Laguna, Imbituba e Balneário Rincão. Stiven Allan atende como corretor parceiro para este e outros lançamentos da Eraldo.' },
]

export default function AuraResidencePage() {
  const CSS = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #FAFAF8; color: #1A1814; font-family: var(--font-hanken), system-ui, sans-serif; }
    .ar-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: background .35s ease, box-shadow .35s ease; }
    @supports (animation-timeline: scroll()) {
      .ar-nav { animation: ar-nav-fill linear both; animation-timeline: scroll(); animation-range: 0px 80px; }
      @keyframes ar-nav-fill { to { background: rgba(250,250,248,0.96); backdrop-filter: blur(20px); box-shadow: 0 1px 0 rgba(26,24,20,0.10); } }
    }
    .ar-fade { opacity: 0; transform: translateY(24px); animation: arfade .9s ease forwards; }
    .ar-fade-1 { animation-delay: .1s; } .ar-fade-2 { animation-delay: .25s; } .ar-fade-3 { animation-delay: .4s; }
    @keyframes arfade { to { opacity: 1; transform: none; } }
    .ar-gcard img, .arp-gcard img { transition: transform .8s ease; }
    .ar-gcard:hover img, .arp-gcard:hover img { transform: scale(1.06); }
    .ar-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; font-family: var(--font-bricolage), system-ui, sans-serif; font-size: 11px; font-weight: 400; letter-spacing: 0.3em; text-transform: uppercase; text-decoration: none; border: 1px solid #9C5F2E; color: #9C5F2E; background: transparent; cursor: pointer; transition: all .25s ease; border-radius: 2px; }
    .ar-btn:hover { background: #9C5F2E; color: #fff; }
    .ar-btn--solid { background: #9C5F2E; color: #fff; }
    .ar-btn--solid:hover { background: #7A4A22; border-color: #7A4A22; }
    .ar-rule { width: 40px; height: 1px; background: #9C5F2E; border: none; display: block; }
    .ar-h2 { font-family: var(--font-bricolage), system-ui, sans-serif; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.1; }
    .ar-serif { font-family: var(--font-cormorant), Georgia, serif; font-style: italic; font-weight: 300; }
    .ar-diff-item { display: flex; align-items: flex-start; gap: 16px; padding: 18px 0; border-bottom: 1px solid rgba(26,24,20,0.10); }
    .ar-diff-icon { width: 36px; height: 36px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: rgba(156,95,46,0.08); border-radius: 50%; font-size: 16px; }
    .ar-wa-float { position: fixed; bottom: 28px; right: 28px; z-index: 999; width: 56px; height: 56px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(37,211,102,0.35); transition: transform .2s ease; }
    .ar-wa-float:hover { transform: scale(1.08); }
    @media (max-width: 768px) {
      .ar-step-grid { grid-template-columns: 1fr !important; }
      .ar-metrics-grid { grid-template-columns: repeat(2,1fr) !important; }
      .ar-diff-grid { grid-template-columns: 1fr !important; }
    }
  `
  return (
    <>
      <PropertySchema
        nome="Aura Residence"
        slug="aura-residence-centro-criciuma-sc"
        construtora_slug="eraldo"
        cidade="Criciúma"
        uf="SC"
        bairro="Centro"
        descricao="Lançamento no Centro de Criciúma/SC — 17 pavimentos, 40 apartamentos tipo e 4 coberturas duplex. Financiamento direto com a Eraldo Construções, sem banco."
        imagem={HERO_IMG}
        faq={FAQ}
      />
      <style>{`${CSS}`}</style>

      {/* NAV */}
      <nav className="ar-nav">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(18px,4vw,48px)', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: 15, textDecoration: 'none', color: '#FFFFFF', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            Stiven Allan
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link href="/empreendimentos" style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', textDecoration: 'none', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>Empreendimentos</Link>
            <a href={WPP} target="_blank" rel="noopener noreferrer" data-wpp="nav" data-wpp-emp={SLUG} data-wpp-nome={NOME} style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#D9A066', textDecoration: 'none', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>WhatsApp</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 600, overflow: 'hidden' }}>
        <HeroImage unoptimized src={HERO_IMG} alt="Aura Residence — fachada, Centro de Criciúma SC" fill priority style={{ objectFit: 'cover', objectPosition: 'center 40%' }} sizes="100vw" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.40) 55%, rgba(0,0,0,0.55) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 clamp(24px,6vw,80px)', paddingTop: 68 }}>
          <p className="ar-fade" style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(245,238,230,0.80)', marginBottom: 24, textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
            Eraldo Construções · Centro · Criciúma/SC
          </p>
          <h1 style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.13em', lineHeight: 1.08, fontSize: 'clamp(32px,6vw,76px)', color: '#FFFFFF', textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 2px 32px rgba(0,0,0,0.60)', maxWidth: 820 }} className="ar-fade ar-fade-1">
            O silêncio que nasce na serra, repousa aqui.
          </h1>
          <hr className="ar-rule ar-fade ar-fade-2" style={{ margin: '28px auto' }} />
          <p className="ar-serif ar-fade ar-fade-2" style={{ fontSize: 'clamp(16px,2.2vw,22px)', color: '#FFFFFF', maxWidth: 600, margin: '0 0 40px', lineHeight: 1.6, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            Aura Residence — lançamento no Centro de Criciúma, onde cada pôr do sol vira uma pintura na sua janela.
          </p>
          <div className="ar-fade ar-fade-3" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="ar-btn ar-btn--solid" data-wpp="hero" data-wpp-emp={SLUG} data-wpp-nome={NOME}>Falar com Stiven</a>
            <LeadCaptureButton slug={SLUG} construtora_slug="eraldo" propertyDisplayName={NOME} className="ar-btn" label="Baixar catálogo & plantas" />
          </div>
          <p className="ar-fade ar-fade-3" style={{ marginTop: 20, fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            Lançamento · Condições especiais de pré-lançamento
          </p>
        </div>
        <a href="#conceito" style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.55)', fontSize: 22, textDecoration: 'none' }}>↓</a>
      </section>

      {/* CONCEITO */}
      <section id="conceito" style={{ background: '#FAFAF8', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(48px,6vw,96px)', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#9C5F2E', display: 'block', marginBottom: 20 }}>O empreendimento</p>
            <h2 className="ar-h2" style={{ fontSize: 'clamp(26px,4vw,44px)', color: '#1A1814', marginBottom: 28 }}>A tranquilidade<br />da serra, no centro.</h2>
            <hr className="ar-rule" style={{ marginBottom: 28 }} />
            <p className="ar-serif" style={{ fontSize: 'clamp(17px,2vw,21px)', color: '#6B655B', lineHeight: 1.7, marginBottom: 24 }}>
              O Aura Residence nasce para trazer toda a tranquilidade da serra para o seu novo lar. Onde cada pôr do sol se torna uma pintura na sua janela. E tudo isso no centro da cidade, perto de tudo.
            </p>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 14, color: '#6B655B', lineHeight: 1.8, marginBottom: 32 }}>
              17 pavimentos na Av. Getúlio Vargas, com 40 apartamentos tipo e 4 coberturas duplex — apenas 4 unidades por andar, um pavimento inteiro de área de lazer e 4 pavimentos de garagem.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[{ ico: '🏗', label: 'Lançamento' }, { ico: '🏢', label: '17 pavimentos' }, { ico: '🏠', label: '44 unidades' }, { ico: '📅', label: 'Entrega abr/2029' }].map(({ ico, label }) => (
                <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(156,95,46,0.08)', color: '#9C5F2E', borderRadius: 2, padding: '7px 14px', fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 12, letterSpacing: '0.1em' }}>{ico} {label}</span>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 4, overflow: 'hidden' }}>
            <Image unoptimized src={BLUEHOUR_IMG} alt="Aura Residence — fachada ao entardecer" fill style={{ objectFit: 'cover' }} sizes="(min-width:768px) 50vw,100vw" />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,20,16,0.55), transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
              <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(245,238,230,0.70)', marginBottom: 4 }}>Status</p>
              <p style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif', fontWeight: 300, fontSize: 18, color: '#F5EEE6', letterSpacing: '0.08em' }}>Lançamento · Entrega 04/2029</p>
            </div>
          </div>
        </div>
      </section>

      {/* AS TORRES — NÚMEROS */}
      <section style={{ background: '#1A1410', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(217,160,102,0.80)', display: 'block', marginBottom: 16 }}>A torre</p>
            <h2 className="ar-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#F5EEE6', marginBottom: 16 }}>Números que encantam</h2>
            <hr className="ar-rule" style={{ margin: '0 auto 24px' }} />
          </div>
          <div className="ar-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'clamp(32px,4vw,56px)' }}>
            {[{ val: '17', label: 'Pavimentos' }, { val: '44', label: 'Unidades' }, { val: '4', label: 'Coberturas duplex' }, { val: '04/2029', label: 'Entrega prevista' }].map(({ val, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif', fontWeight: 300, fontSize: 'clamp(40px,6vw,64px)', color: 'rgba(245,238,230,0.90)', letterSpacing: '0.04em', lineHeight: 1 }}>{val}</p>
                <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(245,238,230,0.65)', marginTop: 4 }}>{label}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 24, borderTop: '1px solid rgba(245,238,230,0.10)', paddingTop: 48 }}>
            {[{ n: '4', label: 'Apartamentos por andar' }, { n: '4', label: 'Pavimentos de garagem' }, { n: '1', label: 'Pavimento de lazer' }, { n: '9', label: 'Espaços de lazer' }].map(({ n, label }) => (
              <div key={label} style={{ textAlign: 'center', padding: '24px 16px' }}>
                <p style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif', fontWeight: 300, fontSize: 'clamp(28px,4vw,48px)', color: '#D9A066', letterSpacing: '0.04em', lineHeight: 1 }}>{n}</p>
                <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,238,230,0.65)', marginTop: 8 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section id="diferenciais" style={{ background: '#FAFAF8', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#9C5F2E', display: 'block', marginBottom: 16 }}>Diferenciais</p>
            <h2 className="ar-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#1A1814' }}>O padrão que transforma</h2>
          </div>
          <div style={{ maxWidth: 900, margin: '0 auto 48px', display: 'flex', flexDirection: 'column', gap: 40 }}>
            {DIFERENCIAIS_GRUPOS.map(({ titulo, itens }) => (
              <div key={titulo}>
                <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9C5F2E', marginBottom: 8 }}>{titulo}</p>
                <div className="ar-diff-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0 48px' }}>
                  {itens.map(({ ico, title, desc }) => (
                    <div key={title} className="ar-diff-item">
                      <div className="ar-diff-icon">{ico}</div>
                      <div>
                        <p style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif', fontWeight: 400, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1A1814', marginBottom: 4 }}>{title}</p>
                        <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 14, color: '#6B655B', lineHeight: 1.6 }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ maxWidth: 900, margin: '0 auto', paddingTop: 32, borderTop: '1px solid rgba(26,24,20,0.10)' }}>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9C5F2E', marginBottom: 16, textAlign: 'center' }}>Também incluso</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {FICHA_TECNICA.map(item => (
                <span key={item} style={{ padding: '7px 14px', background: 'rgba(156,95,46,0.07)', borderRadius: 2, fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 12, letterSpacing: '0.06em', color: '#6B655B' }}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GALERIA (renders) */}
      <section id="galeria" style={{ background: '#FAFAF8', padding: '0 clamp(24px,6vw,80px) clamp(64px,8vw,120px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#9C5F2E', display: 'block', marginBottom: 16 }}>Perspectivas</p>
            <h2 className="ar-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#1A1814', marginBottom: 16 }}>Como o Aura vai nascer</h2>
            <p className="ar-serif" style={{ fontSize: 'clamp(15px,1.8vw,19px)', color: '#6B655B', maxWidth: 480, margin: '0 auto' }}>
              Imagens ilustrativas do projeto — o empreendimento está em fase de lançamento.
            </p>
          </div>
          <GalleryWithLightbox galeria={GALERIA} prefix="ar" gradient="linear-gradient(to top, rgba(26,20,16,0.55), transparent 50%)" badge="Imagem ilustrativa" />
        </div>
      </section>

      {/* PLANTAS */}
      <section id="plantas" style={{ background: '#F5EEE6', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#9C5F2E', display: 'block', marginBottom: 16 }}>Plantas</p>
            <h2 className="ar-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#1A1814', marginBottom: 16 }}>Escolha o seu layout</h2>
            <p className="ar-serif" style={{ fontSize: 'clamp(15px,1.8vw,19px)', color: '#6B655B', maxWidth: 560, margin: '0 auto' }}>
              4 apartamentos tipo, 4 coberturas duplex, área de lazer, térreo e 3 subsolos de garagem.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {PLANTAS_GRUPOS.map(({ titulo, categoria }) => {
              const itens = PLANTAS.filter(p => p.categoria === categoria)
              if (!itens.length) return null
              return (
                <div key={categoria}>
                  <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9C5F2E', marginBottom: 16 }}>{titulo}</p>
                  <GalleryWithLightbox
                    galeria={itens}
                    prefix="arp"
                    gradient="linear-gradient(to top, rgba(26,20,16,0.45), transparent 55%)"
                    badge="Planta humanizada"
                    trackPlantas={{ empreendimento: SLUG, content_name: NOME }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* LAZER */}
      <section id="lazer" style={{ background: '#1A1410', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(48px,6vw,96px)', alignItems: 'center' }}>
          <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 4, overflow: 'hidden', order: 2 }}>
            <Image unoptimized src={`${ERALDO_SITE}/2025/10/07_EXT05_TERRACO-PLAY-GROUND_HR-2-scaled.jpg`} alt="Aura Residence — terraço playground" fill style={{ objectFit: 'cover' }} sizes="(min-width:768px) 50vw,100vw" />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(217,160,102,0.80)', display: 'block', marginBottom: 16 }}>Lazer</p>
            <h2 className="ar-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#F5EEE6', marginBottom: 16 }}>Um pavimento inteiro para viver bem</h2>
            <p className="ar-serif" style={{ fontSize: 'clamp(15px,1.8vw,19px)', color: 'rgba(245,238,230,0.65)', marginBottom: 32, lineHeight: 1.65 }}>
              Áreas de lazer mobiliadas, decoradas e climatizadas — prontas para uso desde a entrega.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {LAZER.map(item => (
                <span key={item} style={{ padding: '7px 14px', background: 'rgba(156,95,46,0.18)', borderRadius: 2, fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D9A066' }}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section style={{ background: '#FAFAF8', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#9C5F2E', display: 'block', marginBottom: 16 }}>Localização</p>
            <h2 className="ar-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#1A1814', marginBottom: 12 }}>Centro de Criciúma</h2>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 15, color: '#6B655B', maxWidth: 420, margin: '0 auto' }}>
              Av. Getúlio Vargas — no centro da cidade, perto de tudo.
            </p>
          </div>
          <div style={{ borderRadius: 6, overflow: 'hidden', aspectRatio: '16/7' }}>
            <iframe
              src="https://www.google.com/maps?q=Av.+Get%C3%BAlio+Vargas,+Centro,+Crici%C3%BAma+-+SC,+88801-500&output=embed"
              title="Localização Aura Residence"
              style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
            {[{ label: 'Endereço', val: 'Av. Getúlio Vargas, Centro' }, { label: 'Bairro', val: 'Centro, Criciúma/SC' }, { label: 'Status', val: 'Lançamento · Entrega 04/2029' }, { label: 'Registro de incorporação', val: 'R.5/166.021 · 1º Ofício de Imóveis de Criciúma' }].map(({ label, val }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9C5F2E', marginBottom: 4 }}>{label}</p>
                <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 15, color: '#1A1814' }}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINANCIAMENTO DIRETO */}
      <section style={{ background: '#FAFAF8', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(26,24,20,0.10)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#9C5F2E', display: 'block', marginBottom: 16 }}>Como funciona</p>
            <h2 className="ar-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#1A1814', marginBottom: 16 }}>Financiamento direto</h2>
            <p className="ar-serif" style={{ fontSize: 'clamp(15px,1.8vw,19px)', color: '#6B655B', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Negociado diretamente com a Eraldo Construções, sem intermediação bancária. Condições sob consulta — fale com Stiven para a tabela de pagamento atualizada.
            </p>
          </div>
          <div className="ar-step-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'clamp(32px,4vw,56px)' }}>
            {[
              { n: '01', titulo: 'Escolha a sua unidade', desc: 'Conheça as plantas disponíveis e reserve a unidade ideal para o seu momento.' },
              { n: '02', titulo: 'Simulação personalizada', desc: 'Stiven estrutura as condições de pagamento com a construtora, de acordo com o seu perfil.' },
              { n: '03', titulo: 'Contrato direto', desc: 'Documentação simplificada, sem intermediários.' },
            ].map(({ n, titulo, desc }) => (
              <div key={n} style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif', fontSize: 36, fontWeight: 300, color: 'rgba(156,95,46,0.25)', lineHeight: 1, flexShrink: 0, width: 48 }}>{n}</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif', fontWeight: 400, fontSize: 14, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1A1814', marginBottom: 10 }}>{titulo}</p>
                  <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 14, color: '#6B655B', lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: '#1A1410', padding: 'clamp(80px,10vw,140px) clamp(24px,6vw,80px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(217,160,102,0.80)', display: 'block', marginBottom: 24 }}>Próximo passo</p>
          <h2 className="ar-serif" style={{ fontSize: 'clamp(32px,5vw,58px)', color: '#F5EEE6', fontStyle: 'italic', fontWeight: 300, lineHeight: 1.2, marginBottom: 24 }}>
            Garanta a sua unidade no lançamento.
          </h2>
          <hr className="ar-rule" style={{ margin: '0 auto 32px' }} />
          <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 'clamp(15px,1.8vw,18px)', color: 'rgba(245,238,230,0.65)', lineHeight: 1.7, marginBottom: 40 }}>
            O Aura Residence está em fase de lançamento — as melhores condições costumam valer só nesta etapa. Fale com Stiven para conhecer plantas, valores e condições de pagamento direto com a Eraldo Construções.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="ar-btn ar-btn--solid" data-wpp="cta_final" data-wpp-emp={SLUG} data-wpp-nome={NOME}>Falar com Stiven</a>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="ar-btn" style={{ borderColor: 'rgba(245,238,230,0.30)', color: '#F5EEE6' }} data-wpp="cta_final" data-wpp-emp={SLUG} data-wpp-nome={NOME}>Sob consulta · Financiamento direto</a>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer style={{ background: '#1A1410', borderTop: '1px solid rgba(245,238,230,0.08)', padding: 'clamp(32px,4vw,48px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: 14, color: '#F5EEE6' }}>Stiven Allan</p>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 12, color: 'rgba(245,238,230,0.65)', marginTop: 4 }}>CRECI 60.275 · Imóveis no Sul de Santa Catarina</p>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <Link href="/" style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,238,230,0.65)', textDecoration: 'none' }}>Início</Link>
            <Link href="/empreendimentos" style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,238,230,0.65)', textDecoration: 'none' }}>Empreendimentos</Link>
            <Link href="/politica-de-privacidade" style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,238,230,0.65)', textDecoration: 'none' }}>Privacidade</Link>
            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#D9A066', textDecoration: 'none' }}>WhatsApp</a>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '16px auto 0', paddingTop: 16, borderTop: '1px solid rgba(245,238,230,0.05)' }}>
          <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 11, color: 'rgba(245,238,230,0.30)', letterSpacing: '0.08em' }}>
            {new Date().getFullYear()} Stiven Allan · Aura Residence é um empreendimento da Eraldo Construções. Incorporação imobiliária R.5/166.021, 1º Ofício de Registro de Imóveis de Criciúma/SC. Imagens e plantas meramente ilustrativas.
          </p>
        </div>
      </footer>

      {/* WA FLOAT */}
      <a href={WPP} target="_blank" rel="noopener noreferrer" className="ar-wa-float" aria-label="Falar com Stiven pelo WhatsApp" data-wpp="float" data-wpp-emp={SLUG} data-wpp-nome={NOME}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      <PropertyFAQ items={FAQ} accent="#9C5F2E" />

      <RelatedProperties atualSlug="aura-residence-centro-criciuma-sc" cidade="Criciúma" nomeAtual="Aura Residence" propertyIdAtual={null} />
    </>
  )
}
