import Image from 'next/image'
import { HeroImage } from '@/components/HeroImage'
import Link from 'next/link'
import GalleryWithLightbox from './GalleryLightbox'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import type { Empreendimento, StatusEmpreendimento } from '@/data/eraldo/types'

const WPP_NUMERO = '5548991642332'
function wppLink(nome: string) {
  return `https://wa.me/${WPP_NUMERO}?text=${encodeURIComponent(`Olá Stiven, tenho interesse no ${nome}. Pode me passar mais informações?`)}`
}

// Copy estrutural que muda por status — não é dado comercial, é só rótulo de
// navegação/processo. Todo o conteúdo narrativo (headlines, descrições, condições
// reais) vem do arquivo de dados de cada empreendimento, nunca daqui.
const PASSOS_POR_STATUS: Record<StatusEmpreendimento, { n: string; titulo: string; desc: string }[]> = {
  lancamento: [
    { n: '01', titulo: 'Escolha a sua unidade', desc: 'Conheça as plantas disponíveis e reserve a unidade ideal para o seu momento.' },
    { n: '02', titulo: 'Simulação personalizada', desc: 'Stiven estrutura as condições de pagamento com a construtora, de acordo com o seu perfil.' },
    { n: '03', titulo: 'Contrato direto', desc: 'Documentação simplificada, sem intermediários.' },
  ],
  em_construcao: [
    { n: '01', titulo: 'Escolha a sua unidade', desc: 'Conheça as plantas disponíveis e reserve a unidade ideal para o seu momento.' },
    { n: '02', titulo: 'Simulação personalizada', desc: 'Stiven estrutura as condições de pagamento com a construtora, de acordo com o seu perfil.' },
    { n: '03', titulo: 'Contrato direto', desc: 'Documentação simplificada, sem intermediários.' },
  ],
  entregue: [
    { n: '01', titulo: 'Conheça as unidades disponíveis', desc: 'Veja quais unidades ainda estão disponíveis e agende uma visita ao imóvel pronto.' },
    { n: '02', titulo: 'Simulação personalizada', desc: 'Stiven estrutura as condições de pagamento de acordo com o seu perfil.' },
    { n: '03', titulo: 'Contrato direto', desc: 'Documentação simplificada, sem intermediários.' },
  ],
}

function ctaFinalBotaoSecundario(status: StatusEmpreendimento) {
  return status === 'entregue' ? 'Agendar visita' : 'Sob consulta · Financiamento direto'
}

export default function EmpreendimentoTemplate({ data }: { data: Empreendimento }) {
  const WPP = wppLink(data.nome)
  const passos = PASSOS_POR_STATUS[data.status]

  const CSS = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #FAFAF8; color: #1A1814; font-family: var(--font-hanken), system-ui, sans-serif; }
    .ec-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: background .35s ease, box-shadow .35s ease; }
    @supports (animation-timeline: scroll()) {
      .ec-nav { animation: ec-nav-fill linear both; animation-timeline: scroll(); animation-range: 0px 80px; }
      @keyframes ec-nav-fill { to { background: rgba(250,250,248,0.96); backdrop-filter: blur(20px); box-shadow: 0 1px 0 rgba(26,24,20,0.10); } }
    }
    .ec-fade { opacity: 0; transform: translateY(24px); animation: ecfade .9s ease forwards; }
    .ec-fade-1 { animation-delay: .1s; } .ec-fade-2 { animation-delay: .25s; } .ec-fade-3 { animation-delay: .4s; }
    @keyframes ecfade { to { opacity: 1; transform: none; } }
    .ec-gcard img, .ecp-gcard img { transition: transform .8s ease; }
    .ec-gcard:hover img, .ecp-gcard:hover img { transform: scale(1.06); }
    .ec-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; font-family: var(--font-bricolage), system-ui, sans-serif; font-size: 11px; font-weight: 400; letter-spacing: 0.3em; text-transform: uppercase; text-decoration: none; border: 1px solid #9C5F2E; color: #9C5F2E; background: transparent; cursor: pointer; transition: all .25s ease; border-radius: 2px; }
    .ec-btn:hover { background: #9C5F2E; color: #fff; }
    .ec-btn--solid { background: #9C5F2E; color: #fff; }
    .ec-btn--solid:hover { background: #7A4A22; border-color: #7A4A22; }
    .ec-rule { width: 40px; height: 1px; background: #9C5F2E; border: none; display: block; }
    .ec-h2 { font-family: var(--font-bricolage), system-ui, sans-serif; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.1; }
    .ec-serif { font-family: var(--font-cormorant), Georgia, serif; font-style: italic; font-weight: 300; }
    .ec-diff-item { display: flex; align-items: flex-start; gap: 16px; padding: 18px 0; border-bottom: 1px solid rgba(26,24,20,0.10); }
    .ec-diff-icon { width: 36px; height: 36px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: rgba(156,95,46,0.08); border-radius: 50%; font-size: 16px; }
    .ec-wa-float { position: fixed; bottom: 28px; right: 28px; z-index: 999; width: 56px; height: 56px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(37,211,102,0.35); transition: transform .2s ease; }
    .ec-wa-float:hover { transform: scale(1.08); }
    @media (max-width: 768px) {
      .ec-step-grid { grid-template-columns: 1fr !important; }
      .ec-metrics-grid { grid-template-columns: repeat(2,1fr) !important; }
      .ec-diff-grid { grid-template-columns: 1fr !important; }
    }
  `

  return (
    <>
      <PropertySchema
        nome={data.nome}
        slug={data.slug}
        construtora_slug="eraldo"
        cidade={data.cidade}
        uf={data.uf}
        bairro={data.bairro}
        descricao={data.conceitoTextoDestaque}
        imagem={data.heroImg}
        faq={data.faq}
      />
      <style>{`${CSS}`}</style>

      {/* NAV */}
      <nav className="ec-nav">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(18px,4vw,48px)', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: 15, textDecoration: 'none', color: '#FFFFFF', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            Stiven Allan
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link href="/empreendimentos" style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', textDecoration: 'none', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>Empreendimentos</Link>
            <a href={WPP} target="_blank" rel="noopener noreferrer" data-wpp="nav" data-wpp-emp={data.slug} data-wpp-nome={data.nome} style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#D9A066', textDecoration: 'none', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>WhatsApp</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 600, overflow: 'hidden' }}>
        <HeroImage unoptimized src={data.heroImg} alt={data.heroImgAlt} fill priority style={{ objectFit: 'cover', objectPosition: 'center 40%' }} sizes="100vw" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.40) 55%, rgba(0,0,0,0.55) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 clamp(24px,6vw,80px)', paddingTop: 68 }}>
          <p className="ec-fade" style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(245,238,230,0.80)', marginBottom: 24, textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
            {data.eyebrow}
          </p>
          <h1 style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.13em', lineHeight: 1.08, fontSize: 'clamp(32px,6vw,76px)', color: '#FFFFFF', textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 2px 32px rgba(0,0,0,0.60)', maxWidth: 820 }} className="ec-fade ec-fade-1">
            {data.heroTitulo}
          </h1>
          <hr className="ec-rule ec-fade ec-fade-2" style={{ margin: '28px auto' }} />
          <p className="ec-serif ec-fade ec-fade-2" style={{ fontSize: 'clamp(16px,2.2vw,22px)', color: '#FFFFFF', maxWidth: 600, margin: '0 0 40px', lineHeight: 1.6, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {data.heroSubtitulo}
          </p>
          <div className="ec-fade ec-fade-3" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="ec-btn ec-btn--solid" data-wpp="hero" data-wpp-emp={data.slug} data-wpp-nome={data.nome}>Falar com Stiven</a>
            <LeadCaptureButton slug={data.slug} construtora_slug="eraldo" propertyDisplayName={data.nome} className="ec-btn" label="Baixar catálogo & plantas" />
          </div>
          <p className="ec-fade ec-fade-3" style={{ marginTop: 20, fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            {data.conceitoStatusLabel}
          </p>
        </div>
        <a href="#conceito" style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.55)', fontSize: 22, textDecoration: 'none' }}>↓</a>
      </section>

      {/* CONCEITO */}
      <section id="conceito" style={{ background: '#FAFAF8', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(48px,6vw,96px)', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#9C5F2E', display: 'block', marginBottom: 20 }}>O empreendimento</p>
            <h2 className="ec-h2" style={{ fontSize: 'clamp(26px,4vw,44px)', color: '#1A1814', marginBottom: 28 }}>
              {data.conceitoTitulo.map((linha, i) => <span key={i}>{linha}{i < data.conceitoTitulo.length - 1 && <br />}</span>)}
            </h2>
            <hr className="ec-rule" style={{ marginBottom: 28 }} />
            <p className="ec-serif" style={{ fontSize: 'clamp(17px,2vw,21px)', color: '#6B655B', lineHeight: 1.7, marginBottom: 24 }}>
              {data.conceitoTextoDestaque}
            </p>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 14, color: '#6B655B', lineHeight: 1.8, marginBottom: 32 }}>
              {data.conceitoTexto}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {data.conceitoChips.map(({ ico, label }) => (
                <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(156,95,46,0.08)', color: '#9C5F2E', borderRadius: 2, padding: '7px 14px', fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 12, letterSpacing: '0.1em' }}>{ico} {label}</span>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 4, overflow: 'hidden' }}>
            <Image unoptimized src={data.conceitoImg} alt={data.conceitoImgAlt} fill style={{ objectFit: 'cover' }} sizes="(min-width:768px) 50vw,100vw" />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,20,16,0.55), transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
              <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(245,238,230,0.70)', marginBottom: 4 }}>Status</p>
              <p style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif', fontWeight: 300, fontSize: 18, color: '#F5EEE6', letterSpacing: '0.08em' }}>{data.conceitoStatusLabel}</p>
            </div>
          </div>
        </div>
      </section>

      {/* NÚMEROS */}
      <section style={{ background: '#1A1410', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(217,160,102,0.80)', display: 'block', marginBottom: 16 }}>A torre</p>
            <h2 className="ec-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#F5EEE6', marginBottom: 16 }}>Números que encantam</h2>
            <hr className="ec-rule" style={{ margin: '0 auto 24px' }} />
          </div>
          <div className="ec-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'clamp(32px,4vw,56px)' }}>
            {data.metricas.map(({ val, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif', fontWeight: 300, fontSize: 'clamp(40px,6vw,64px)', color: 'rgba(245,238,230,0.90)', letterSpacing: '0.04em', lineHeight: 1 }}>{val}</p>
                <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(245,238,230,0.65)', marginTop: 4 }}>{label}</p>
              </div>
            ))}
          </div>
          {data.metricasExtras.length > 0 && (
            <div style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 24, borderTop: '1px solid rgba(245,238,230,0.10)', paddingTop: 48 }}>
              {data.metricasExtras.map(({ n, label }) => (
                <div key={label} style={{ textAlign: 'center', padding: '24px 16px' }}>
                  <p style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif', fontWeight: 300, fontSize: 'clamp(28px,4vw,48px)', color: '#D9A066', letterSpacing: '0.04em', lineHeight: 1 }}>{n}</p>
                  <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,238,230,0.65)', marginTop: 8 }}>{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section id="diferenciais" style={{ background: '#FAFAF8', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#9C5F2E', display: 'block', marginBottom: 16 }}>Diferenciais</p>
            <h2 className="ec-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#1A1814' }}>O padrão que transforma</h2>
          </div>
          <div style={{ maxWidth: 900, margin: '0 auto 48px', display: 'flex', flexDirection: 'column', gap: 40 }}>
            {data.diferenciaisGrupos.map(({ titulo, itens }) => (
              <div key={titulo}>
                <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9C5F2E', marginBottom: 8 }}>{titulo}</p>
                <div className="ec-diff-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0 48px' }}>
                  {itens.map(({ ico, title, desc }) => (
                    <div key={title} className="ec-diff-item">
                      <div className="ec-diff-icon">{ico}</div>
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
          {data.fichaTecnicaExtra.length > 0 && (
            <div style={{ maxWidth: 900, margin: '0 auto', paddingTop: 32, borderTop: '1px solid rgba(26,24,20,0.10)' }}>
              <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9C5F2E', marginBottom: 16, textAlign: 'center' }}>Também incluso</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                {data.fichaTecnicaExtra.map(item => (
                  <span key={item} style={{ padding: '7px 14px', background: 'rgba(156,95,46,0.07)', borderRadius: 2, fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 12, letterSpacing: '0.06em', color: '#6B655B' }}>{item}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* GALERIA */}
      <section id="galeria" style={{ background: '#FAFAF8', padding: '0 clamp(24px,6vw,80px) clamp(64px,8vw,120px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#9C5F2E', display: 'block', marginBottom: 16 }}>Perspectivas</p>
            <h2 className="ec-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#1A1814', marginBottom: 16 }}>{data.galeriaTitulo}</h2>
            <p className="ec-serif" style={{ fontSize: 'clamp(15px,1.8vw,19px)', color: '#6B655B', maxWidth: 480, margin: '0 auto' }}>
              {data.galeriaTexto}
            </p>
          </div>
          <GalleryWithLightbox galeria={data.galeria} prefix="ec" gradient="linear-gradient(to top, rgba(26,20,16,0.55), transparent 50%)" badge="Imagem ilustrativa" />
        </div>
      </section>

      {/* PLANTAS — só renderiza se houver material oficial */}
      {data.plantas.length > 0 && (
        <section id="plantas" style={{ background: '#F5EEE6', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#9C5F2E', display: 'block', marginBottom: 16 }}>Plantas</p>
              <h2 className="ec-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#1A1814', marginBottom: 16 }}>{data.plantasTitulo}</h2>
              <p className="ec-serif" style={{ fontSize: 'clamp(15px,1.8vw,19px)', color: '#6B655B', maxWidth: 560, margin: '0 auto' }}>
                {data.plantasTexto}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
              {data.plantasGrupos.map(({ titulo, categoria }) => {
                const itens = data.plantas.filter(p => p.categoria === categoria)
                if (!itens.length) return null
                return (
                  <div key={categoria}>
                    <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9C5F2E', marginBottom: 16 }}>{titulo}</p>
                    <GalleryWithLightbox
                      galeria={itens}
                      prefix="ecp"
                      gradient="linear-gradient(to top, rgba(26,20,16,0.45), transparent 55%)"
                      badge="Planta humanizada"
                      trackPlantas={{ empreendimento: data.slug, content_name: data.nome }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* LAZER */}
      <section id="lazer" style={{ background: '#1A1410', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(48px,6vw,96px)', alignItems: 'center' }}>
          <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 4, overflow: 'hidden', order: 2 }}>
            <Image unoptimized src={data.lazerImg} alt={data.lazerImgAlt} fill style={{ objectFit: 'cover' }} sizes="(min-width:768px) 50vw,100vw" />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(217,160,102,0.80)', display: 'block', marginBottom: 16 }}>Lazer</p>
            <h2 className="ec-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#F5EEE6', marginBottom: 16 }}>{data.lazerTitulo}</h2>
            <p className="ec-serif" style={{ fontSize: 'clamp(15px,1.8vw,19px)', color: 'rgba(245,238,230,0.65)', marginBottom: 32, lineHeight: 1.65 }}>
              {data.lazerTexto}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {data.lazer.map(item => (
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
            <h2 className="ec-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#1A1814', marginBottom: 12 }}>{data.localizacaoTitulo}</h2>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 15, color: '#6B655B', maxWidth: 420, margin: '0 auto' }}>
              {data.localizacaoTexto}
            </p>
          </div>
          <div style={{ borderRadius: 6, overflow: 'hidden', aspectRatio: '16/7' }}>
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(data.mapsQuery)}&output=embed`}
              title={`Localização ${data.nome}`}
              style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
            {[
              data.endereco ? { label: 'Endereço', val: data.endereco } : null,
              { label: 'Bairro', val: `${data.bairro ? data.bairro + ', ' : ''}${data.cidade}/${data.uf}` },
              { label: 'Status', val: data.conceitoStatusLabel },
              data.registroIncorporacao ? { label: 'Registro de incorporação', val: data.registroIncorporacao } : null,
            ].filter((x): x is { label: string; val: string } => x !== null).map(({ label, val }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9C5F2E', marginBottom: 4 }}>{label}</p>
                <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 15, color: '#1A1814' }}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINANCIAMENTO / CONDIÇÕES */}
      <section style={{ background: '#FAFAF8', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(26,24,20,0.10)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#9C5F2E', display: 'block', marginBottom: 16 }}>Como funciona</p>
            <h2 className="ec-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#1A1814', marginBottom: 16 }}>Financiamento direto</h2>
            {data.politicaComercial ? (
              <>
                <p className="ec-serif" style={{ fontSize: 'clamp(15px,1.8vw,19px)', color: '#6B655B', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
                  Negociado diretamente com a Eraldo Construções, sem intermediação bancária.
                </p>
                <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
                  {data.politicaComercial.condicoes.map(({ titulo, texto }) => (
                    <div key={titulo} style={{ background: 'rgba(156,95,46,0.06)', borderRadius: 4, padding: '16px 20px' }}>
                      <p style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9C5F2E', marginBottom: 6 }}>{titulo}</p>
                      <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 14, color: '#6B655B', lineHeight: 1.6 }}>{texto}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 12, color: '#8a8378', marginTop: 20, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
                  {data.politicaComercial.correcaoCub && data.politicaComercial.cubValor
                    ? `CUB/SC ${data.politicaComercial.cubReferencia}: R$ ${data.politicaComercial.cubValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. `
                    : ''}
                  Condições conforme tabela vigente{data.fontes.tabelaVigencia ? ` de ${new Date(data.fontes.tabelaVigencia + 'T00:00:00').toLocaleDateString('pt-BR')}` : ''}. Fale com Stiven para a tabela atualizada.
                  {data.politicaComercial.observacao ? ` ${data.politicaComercial.observacao}` : ''}
                </p>
              </>
            ) : (
              <p className="ec-serif" style={{ fontSize: 'clamp(15px,1.8vw,19px)', color: '#6B655B', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
                Negociado diretamente com a Eraldo Construções, sem intermediação bancária. Condições sob consulta — fale com Stiven para a tabela de pagamento atualizada.
              </p>
            )}
          </div>
          <div className="ec-step-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'clamp(32px,4vw,56px)' }}>
            {passos.map(({ n, titulo, desc }) => (
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
          <h2 className="ec-serif" style={{ fontSize: 'clamp(32px,5vw,58px)', color: '#F5EEE6', fontStyle: 'italic', fontWeight: 300, lineHeight: 1.2, marginBottom: 24 }}>
            {data.ctaFinalTitulo}
          </h2>
          <hr className="ec-rule" style={{ margin: '0 auto 32px' }} />
          <p style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 'clamp(15px,1.8vw,18px)', color: 'rgba(245,238,230,0.65)', lineHeight: 1.7, marginBottom: 40 }}>
            {data.ctaFinalTexto}
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="ec-btn ec-btn--solid" data-wpp="cta_final" data-wpp-emp={data.slug} data-wpp-nome={data.nome}>Falar com Stiven</a>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="ec-btn" style={{ borderColor: 'rgba(245,238,230,0.30)', color: '#F5EEE6' }} data-wpp="cta_final" data-wpp-emp={data.slug} data-wpp-nome={data.nome}>{ctaFinalBotaoSecundario(data.status)}</a>
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
            {new Date().getFullYear()} Stiven Allan · {data.nome} é um empreendimento da Eraldo Construções.
            {data.registroIncorporacao ? ` Incorporação imobiliária ${data.registroIncorporacao}.` : ''} Imagens e plantas meramente ilustrativas.
          </p>
        </div>
      </footer>

      {/* WA FLOAT */}
      <a href={WPP} target="_blank" rel="noopener noreferrer" className="ec-wa-float" aria-label={`Falar com Stiven pelo WhatsApp sobre o ${data.nome}`} data-wpp="float" data-wpp-emp={data.slug} data-wpp-nome={data.nome}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      <PropertyFAQ items={data.faq} accent="#9C5F2E" />

      <RelatedProperties atualSlug={data.slug} cidade={data.cidade} nomeAtual={data.nome} propertyIdAtual={null} />
    </>
  )
}
