import Image from 'next/image'
import PropertySchema from '@/components/PropertySchema'
import PropertyFAQ from '@/components/PropertyFAQ'
import RelatedProperties from '@/components/RelatedProperties'
import { LeadCaptureModal } from '@/components/LeadCaptureModal'

const WPP = 'https://wa.me/5548991642332'

const t = {
  bg: '#FAFAF8', ink: '#1A1814', champagne: '#B89B5E', chamDark: '#8A7240',
  muted: '#6B655B', dark: '#141210', onDark: '#F5F1EA',
  display: "'Bricolage Grotesque', system-ui, sans-serif",
  serif: "'Instrument Serif', Georgia, serif",
  body: "'Hanken Grotesk', system-ui, sans-serif",
}

export type PropertyData = {
  nome: string
  slug: string
  construtora_slug: string
  construtora?: string
  cidade?: string
  uf?: string
  bairro?: string
  endereco?: string
  descricao?: string
  descricao_curta?: string
  frase?: string
  cover_image_url?: string
  galeria?: string[]
  plantas?: string[]
  video_url?: string
  cor_acento?: string
  dormitorios?: string
  metragem?: string
  vagas?: string
  suites?: string
  diferenciais?: string[]
  lazer?: string[]
  faq?: { pergunta: string; resposta: string }[]
  previsao_entrega?: string
  status?: string
  mapa_embed?: string
  book_pdf_url?: string
  schema?: unknown
}

function ytId(url?: string) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/)
  return m ? m[1] : null
}

export default function PropertyPageTemplate({ data, relacionados }: { data: PropertyData; relacionados?: boolean }) {
  const acento = data.cor_acento || t.champagne
  const local = [data.bairro, data.cidade, data.uf].filter(Boolean).join(', ')
  const hero = data.cover_image_url || (data.galeria && data.galeria[0])
  const wppNome = WPP + '?text=' + encodeURIComponent('Olá Stiven! Tenho interesse no ' + data.nome + '.')
  const yt = ytId(data.video_url)
  const specs = [
    data.dormitorios && { label: 'Dormitórios', v: data.dormitorios },
    data.suites && { label: 'Suítes', v: data.suites },
    data.metragem && { label: 'Metragem', v: data.metragem },
    data.vagas && { label: 'Vagas', v: data.vagas },
  ].filter(Boolean) as { label: string; v: string }[]

  return (
    <main style={{ fontFamily: t.body, color: t.ink, background: t.bg }}>
      <PropertySchema
        schema={data.schema}
        nome={data.nome}
        slug={data.slug}
        construtora_slug={data.construtora_slug}
        cidade={data.cidade}
        uf={data.uf}
        bairro={data.bairro}
        descricao={data.descricao_curta || data.descricao}
        imagem={hero}
        faq={data.faq}
      />

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '86svh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden', background: t.dark }}>
        {hero && <Image src={hero} alt={data.nome} fill priority sizes="100vw" style={{ objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.30) 45%, rgba(0,0,0,0.15) 100%)' }} />
        <div style={{ position: 'relative', width: '100%', maxWidth: 1200, margin: '0 auto', padding: 'calc(68px + 6vh) clamp(20px,5vw,48px) clamp(48px,8vh,80px)' }}>
          {data.status && <p style={{ fontFamily: t.body, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: acento, marginBottom: 16 }}>{data.status}</p>}
          <h1 style={{ fontFamily: t.display, fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 1.05, fontSize: 'clamp(34px,5.4vw,76px)', color: '#FFFFFF', margin: 0, maxWidth: '18ch' }}>{data.nome}</h1>
          {local && <p style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 'clamp(16px,2vw,24px)', color: t.onDark, marginTop: 16 }}>{local}</p>}
          <a href={wppNome} target="_blank" rel="noopener" style={{ display: 'inline-block', marginTop: 28, padding: '14px 34px', background: acento, color: t.dark, fontFamily: t.body, fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', textDecoration: 'none' }}>Falar no WhatsApp</a>
          <div style={{ marginTop: 12 }}>
            <LeadCaptureModal propertyId={data.id} propertyName={data.nome} />
          </div>
        </div>
      </section>

      {/* CONCEITO */}
      {(data.frase || data.descricao) && (
        <section style={{ padding: 'clamp(72px,12vh,120px) clamp(20px,5vw,48px)' }}>
          <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
            {data.frase && <p style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 'clamp(24px,3.4vw,42px)', lineHeight: 1.25, color: t.ink, margin: 0 }}>{data.frase}</p>}
            {data.descricao && <p style={{ fontFamily: t.body, fontSize: 'clamp(15px,1.6vw,18px)', lineHeight: 1.7, color: t.muted, marginTop: 28 }}>{data.descricao}</p>}
          </div>
        </section>
      )}

      {/* VIDEO */}
      {yt && (
        <section style={{ padding: '0 clamp(20px,5vw,48px) clamp(72px,12vh,120px)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', aspectRatio: '16 / 9', background: t.dark }}>
            <iframe src={'https://www.youtube.com/embed/' + yt} title={data.nome} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} />
          </div>
        </section>
      )}

      {/* GALERIA */}
      {data.galeria && data.galeria.length > 0 && (
        <section style={{ padding: '0 clamp(20px,5vw,48px) clamp(72px,12vh,120px)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(10px,1.5vw,18px)' }}>
              {data.galeria.map((src, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', background: '#EEE' }}>
                  <Image src={src} alt={data.nome + ' — foto ' + (i + 1)} fill sizes="(max-width:768px)100vw,33vw" style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RESIDENCIAS / SPECS */}
      {specs.length > 0 && (
        <section style={{ background: t.dark, color: t.onDark, padding: 'clamp(72px,12vh,120px) clamp(20px,5vw,48px)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <p style={{ fontFamily: t.body, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: acento, textAlign: 'center', marginBottom: 12 }}>As residências</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 'clamp(20px,3vw,40px)', marginTop: 40 }}>
              {specs.map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: t.display, fontWeight: 300, fontSize: 'clamp(28px,3.4vw,44px)', color: '#FFFFFF', margin: 0 }}>{s.v}</p>
                  <p style={{ fontFamily: t.body, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: acento, marginTop: 8 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DIFERENCIAIS */}
      {data.diferenciais && data.diferenciais.length > 0 && (
        <section style={{ padding: 'clamp(72px,12vh,120px) clamp(20px,5vw,48px)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <h2 style={{ fontFamily: t.display, fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 'clamp(24px,3.4vw,40px)', textAlign: 'center', marginBottom: 48 }}>Diferenciais</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 'clamp(16px,2.5vw,28px)' }}>
              {data.diferenciais.map((d, i) => (
                <div key={i} style={{ padding: '20px 0', borderTop: '1px solid rgba(26,24,20,0.12)', fontFamily: t.body, fontSize: 15, color: t.ink }}>{d}</div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LAZER */}
      {data.lazer && data.lazer.length > 0 && (
        <section style={{ background: t.bg, padding: '0 clamp(20px,5vw,48px) clamp(72px,12vh,120px)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <h2 style={{ fontFamily: t.display, fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 'clamp(24px,3.4vw,40px)', textAlign: 'center', marginBottom: 48 }}>Lazer</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              {data.lazer.map((l, i) => (
                <span key={i} style={{ padding: '10px 20px', border: '1px solid rgba(26,24,20,0.15)', fontFamily: t.body, fontSize: 13, letterSpacing: '0.04em', color: t.muted }}>{l}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LOCALIZACAO */}
      {(data.endereco || local || data.mapa_embed) && (
        <section style={{ padding: 'clamp(72px,12vh,120px) clamp(20px,5vw,48px)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: t.display, fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 'clamp(24px,3.4vw,40px)', marginBottom: 16 }}>Localização</h2>
            {(data.endereco || local) && <p style={{ fontFamily: t.body, fontSize: 16, color: t.muted, marginBottom: 32 }}>{data.endereco || local}</p>}
            {data.mapa_embed && (
              <div style={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden' }}>
                <iframe src={data.mapa_embed} title={'Mapa ' + data.nome} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* FINANCIAMENTO 3 PASSOS */}
      <section style={{ background: t.dark, color: t.onDark, padding: 'clamp(72px,12vh,120px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontFamily: t.display, fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 'clamp(24px,3.4vw,40px)', textAlign: 'center', color: '#FFFFFF', marginBottom: 48 }}>Financiamento direto em 3 passos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'clamp(20px,3vw,40px)' }}>
            {[
              { n: '01', tit: 'Entrada de 20%', txt: 'Você garante a unidade com entrada de 20% no ato do contrato, sem aprovação bancária.' },
              { n: '02', tit: 'Parcelas na obra', txt: 'Até 72 parcelas mensais corrigidas pelo CUB/SC, com até 6 reforços anuais durante a construção.' },
              { n: '03', tit: 'Saldo pós-chaves', txt: 'Na entrega, o saldo pode ser financiado direto com a construtora ou por financiamento bancário.' },
            ].map((p) => (
              <div key={p.n}>
                <p style={{ fontFamily: t.display, fontWeight: 300, fontSize: 40, color: acento, margin: 0 }}>{p.n}</p>
                <p style={{ fontFamily: t.body, fontSize: 16, color: '#FFFFFF', margin: '12px 0 8px', letterSpacing: '0.04em' }}>{p.tit}</p>
                <p style={{ fontFamily: t.body, fontSize: 14, lineHeight: 1.6, color: 'rgba(245,241,234,0.75)', margin: 0 }}>{p.txt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {data.faq && data.faq.length > 0 && (
        <section style={{ padding: 'clamp(72px,12vh,120px) clamp(20px,5vw,48px)' }}>
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            <h2 style={{ fontFamily: t.display, fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 'clamp(24px,3.4vw,40px)', textAlign: 'center', marginBottom: 40 }}>Perguntas frequentes</h2>
            <PropertyFAQ items={data.faq} accent={acento} />
          </div>
        </section>
      )}

      {/* RELACIONADOS */}
      {relacionados !== false && data.cidade && (
        <section style={{ padding: '0 clamp(20px,5vw,48px) clamp(72px,12vh,120px)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <RelatedProperties atualSlug={data.slug} cidade={data.cidade} />
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      <section style={{ background: t.dark, color: t.onDark, padding: 'clamp(80px,14vh,140px) clamp(20px,5vw,48px)', textAlign: 'center' }}>
        <h2 style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 'clamp(28px,4.5vw,52px)', color: '#FFFFFF', margin: 0, maxWidth: '16ch', marginLeft: 'auto', marginRight: 'auto' }}>Vamos realizar o seu próximo endereço?</h2>
        <a href={wppNome} target="_blank" rel="noopener" style={{ display: 'inline-block', marginTop: 32, padding: '16px 40px', background: acento, color: t.dark, fontFamily: t.body, fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', textDecoration: 'none' }}>Falar no WhatsApp</a>
        <p style={{ fontFamily: t.body, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,241,234,0.6)', marginTop: 40 }}>Atendimento exclusivo com Stiven Allan · CRECI 60.275</p>
      </section>
    </main>
  )
}
