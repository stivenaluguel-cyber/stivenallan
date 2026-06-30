import GalleryWithLightbox from './gallery-lightbox';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata = {
  title: 'Bellante Residencial | Comerciário Criciúma SC | Stiven Allan',
  description: 'Bellante Residencial — 2 dormitórios (1 suíte), 62–66 m², no Comerciário em Criciúma/SC. Em obras. Financiamento direto Fontana sem análise de crédito. Consulte Stiven Allan CRECI 60.275.',
};

const ACENTO = '#2C4A7C';
const WA = 'https://wa.me/5548991642332?text=Ol%C3%A1+Stiven%2C+tenho+interesse+no+Bellante+Residencial.';

const GALERIA = [
  { src: 'https://estilofontana.com.br/images/empreendimento/slideshows/bellante-residencial-642b0899097e5.jpg?fm=webp', alt: 'Fachada' },
  { src: 'https://estilofontana.com.br/images/empreendimento/slideshows/bellante-residencial-642c5723dc23d.jpg?fm=webp', alt: 'Coworking' },
  { src: 'https://estilofontana.com.br/images/empreendimento/slideshows/bellante-residencial-65a58504d98ed.jpg?fm=webp', alt: 'Espaço Fitness' },
];

const DIFERENCIAIS = [
  { n: '01', t: '1 Suíte', d: 'Dormitório principal com banheiro privativo e acabamento premium.' },
  { n: '02', t: 'Pé Direito Duplo', d: 'Hall de entrada com pé direito duplo, ampliando a sensação de espaço.' },
  { n: '03', t: 'Rebaixo em Gesso', d: 'Teto rebaixado em gesso com iluminação planejada em todos os ambientes.' },
  { n: '04', t: 'Espera p/ Split', d: 'Infraestrutura completa para instalação de ar-condicionado split.' },
];

const LAZER = [
  'Bicicletário', 'Coworking', 'Salão de Festas', 'Espaço Fitness',
  'Sports Pub', 'Churrasqueira', '2 Elevadores',
];

export default function BellanteResidencial() {
  return (
    <main className="font-sans bg-white text-gray-900 antialiased">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-white font-semibold text-sm tracking-widest uppercase">Stiven Allan</Link>
          <div className="hidden md:flex gap-6 text-white/80 text-xs uppercase tracking-widest">
            <a href="#galeria" className="hover:text-white transition-colors">Galeria</a>
            <a href="#diferenciais" className="hover:text-white transition-colors">Diferenciais</a>
            <a href="#lazer" className="hover:text-white transition-colors">Lazer</a>
            <a href="#localizacao" className="hover:text-white transition-colors">Localização</a>
          </div>
          <a href={WA} target="_blank" rel="noopener" className="text-white text-xs font-semibold uppercase tracking-widest border border-white/60 px-4 py-2 hover:bg-white hover:text-gray-900 transition-colors">
            Tenho interesse
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative h-screen flex items-end pb-20 md:pb-32">
        <img src="https://estilofontana.com.br/images/empreendimento/slideshows/bellante-residencial-642b0899097e5.jpg?fm=webp" alt="Bellante Residencial — Fachada" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-white">
          <p className="text-xs uppercase tracking-[0.3em] mb-4 opacity-80">Comerciário · Criciúma / SC &nbsp;·&nbsp; Em obras</p>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-4">Bellante<br/>Residencial</h1>
          <p className="text-2xl md:text-3xl font-light italic mb-6" style={{fontFamily:'Georgia,serif'}}>"Feito para você."</p>
          <p className="text-base md:text-lg text-white/80 max-w-xl mb-8">No Bellante Residencial, a arquitetura é única e os motivos para viver nele são muitos. Um projeto moderno que acolhe e expressa a personalidade de seus moradores, em localização privilegiada de Criciúma.</p>
          <a href={WA} target="_blank" rel="noopener" className="inline-block text-white font-semibold uppercase tracking-widest text-sm px-8 py-4 transition-opacity hover:opacity-80" style={{background: ACENTO}}>
            Quero conhecer
          </a>
        </div>
      </section>

      {/* O RESIDENCIAL */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.3em] mb-6 opacity-50">O Residencial</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">Arquitetura única.<br/>Vida em Criciúma.</h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mb-8">O Bellante Residencial foi projetado para quem busca qualidade de vida em uma das localidades mais valorizadas de Criciúma. Seus 2 dormitórios — com suíte — e os 62 a 66 m² de área privativa oferecem conforto e praticidade para o seu dia a dia.</p>
          <blockquote className="text-2xl md:text-3xl font-light italic border-l-4 pl-6 text-gray-500" style={{borderColor: ACENTO, fontFamily:'Georgia,serif'}}>
            "Feito para você."
          </blockquote>
        </div>
      </section>

      {/* GALERIA */}
      <section id="galeria" className="py-24 bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.3em] mb-4 opacity-50">Galeria</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Conheça o Bellante</h2>
          <GalleryWithLightbox items={GALERIA} />
        </div>
      </section>

      {/* AS RESIDÊNCIAS */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.3em] mb-4 opacity-50">As Residências</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-12">2 dormitórios (1 suíte) · 62–66 m²</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[['2','Dormitórios'],['1','Suíte'],['62–66','m² privativos'],['Sob consulta','Preço']].map(([n,l]) => (
              <div key={l}>
                <p className="text-4xl md:text-5xl font-bold mb-2" style={{color: ACENTO === '#2C4A7C' ? '#6B8FC5' : ACENTO}}>{n}</p>
                <p className="text-sm text-white/60 uppercase tracking-widest">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section id="diferenciais" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.3em] mb-4 opacity-50">Diferenciais</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Detalhes que fazem a diferença</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {DIFERENCIAIS.map((d) => (
              <div key={d.n} className="border-t-2 pt-6" style={{borderColor: ACENTO}}>
                <p className="text-xs font-bold tracking-widest mb-4 opacity-40">{d.n}</p>
                <h3 className="text-lg font-bold mb-3">{d.t}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{d.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LAZER */}
      <section id="lazer" className="py-24 bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.3em] mb-4 opacity-50">Lazer & Áreas Comuns</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Vida além do apartamento</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {LAZER.map((item) => (
              <div key={item} className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background: '#6B8FC5'}} />
                <span className="text-sm text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section id="localizacao" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.3em] mb-4 opacity-50">Localização</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Comerciário, Criciúma/SC</h2>
          <p className="text-gray-500 mb-8">Rua Treze de Maio, 92 — Comerciário, Criciúma/SC</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <img src="https://estilofontana.com.br/images/2023/04/06/localizacao-bellante-642edb705c4c6.jpg?fm=webp" alt="Localização Bellante Residencial" className="w-full h-64 object-cover rounded-lg" />
            <iframe src="https://maps.google.com/maps?q=Rua+Treze+de+Maio+92,+Comerci%C3%A1rio,+Crici%C3%BAma,+SC&output=embed" width="100%" height="256" style={{border:0}} allowFullScreen loading="lazy" className="rounded-lg" />
          </div>
          <a href={WA} target="_blank" rel="noopener" className="inline-block text-white font-semibold uppercase tracking-widest text-sm px-8 py-4 transition-opacity hover:opacity-80" style={{background: ACENTO}}>
            Agendar visita
          </a>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section className="py-20 text-white" style={{background: ACENTO}}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Baixe o catálogo completo</h2>
          <p className="text-white/80 text-lg mb-8">Plantas, acabamentos e todos os detalhes do Bellante Residencial.</p>
          <a href="https://estilofontana.com.br/upload/empreendimento/catalogo/bellante-residencial-1681832793.pdf" target="_blank" rel="noopener" className="inline-block bg-white font-semibold uppercase tracking-widest text-sm px-10 py-4 hover:opacity-90 transition-opacity" style={{color: ACENTO}}>
            Baixar catálogo
          </a>
        </div>
      </section>

      {/* FINANCIAMENTO DIRETO */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] mb-4 opacity-50">Financiamento</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Financiamento Direto Fontana</h2>
          <p className="text-gray-500 mb-12 text-lg">Sem burocracia. Sem banco. Sob consulta.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[['01','Converse conosco','Entre em contato pelo WhatsApp e apresente seu interesse.'],['02','Condições sob medida','A Fontana analisa e oferece condições personalizadas para você.'],['03','Realize seu sonho','Assine, garanta sua unidade e comece a viver o Bellante.']].map(([n,t,d]) => (
              <div key={n} className="text-center">
                <p className="text-4xl font-bold mb-4" style={{color: ACENTO}}>{n}</p>
                <h3 className="text-lg font-bold mb-3">{t}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
          <a href={WA} target="_blank" rel="noopener" className="mt-12 inline-block text-white font-semibold uppercase tracking-widest text-sm px-10 py-4 transition-opacity hover:opacity-80" style={{background: ACENTO}}>
            Iniciar conversa
          </a>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative h-96 flex items-center justify-center text-center text-white">
        <img src="https://estilofontana.com.br/images/empreendimento/slideshows/bellante-residencial-642b0899097e5.jpg?fm=webp" alt="Bellante Residencial" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Feito para você.</h2>
          <a href={WA} target="_blank" rel="noopener" className="inline-block text-white font-semibold uppercase tracking-widest text-sm px-10 py-4 transition-opacity hover:opacity-80" style={{background: ACENTO}}>
            Quero meu Bellante
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="font-bold text-lg mb-2">Stiven Allan</p>
            <p className="text-white/60 text-sm">CRECI 60.275</p>
          </div>
          <div>
            <p className="font-bold mb-2">Bellante Residencial</p>
            <p className="text-white/60 text-sm">Rua Treze de Maio, 92<br/>Comerciário — Criciúma/SC<br/>2 dorms · 1 suíte · 62–66 m²</p>
          </div>
          <div>
            <a href={WA} target="_blank" rel="noopener" className="inline-block text-white font-semibold uppercase tracking-widest text-xs px-6 py-3 border border-white/30 hover:bg-white hover:text-gray-900 transition-colors">
              WhatsApp
            </a>
          </div>
        </div>
      </footer>

      {/* WhatsApp flutuante */}
      <a href={WA} target="_blank" rel="noopener" aria-label="WhatsApp" className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{background:'#25D366'}}>
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white"><path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.74 5.49 2.034 7.797L0 32l8.448-2.007A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.03 22.47c-.332.936-1.946 1.784-2.666 1.892-.68.103-1.539.146-2.48-.156-.571-.183-1.304-.427-2.239-.838-3.938-1.706-6.502-5.688-6.7-5.954-.196-.265-1.601-2.133-1.601-4.068s1.013-2.884 1.374-3.278c.36-.393.785-.491 1.047-.491.261 0 .523.002.752.014.241.012.564-.092.883.673.332.795 1.128 2.73 1.226 2.927.098.196.163.426.033.685-.131.261-.196.424-.392.653-.196.228-.413.51-.589.685-.196.196-.4.408-.172.8.229.393.017.393 1.043 1.732 1.026 1.34 1.866 1.765 2.26 1.961.392.196.621.164.852-.098.229-.261.979-1.143 1.24-1.535.26-.392.523-.327.883-.196.36.131 2.29 1.08 2.682 1.275.393.196.653.294.752.458.098.163.098.948-.234 1.883z"/></svg>
      </a>

    </main>
  );
}
