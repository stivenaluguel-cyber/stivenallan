import Link from 'next/link'
import Image from 'next/image'
import { MapPin, MessageCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WppFloat from '@/components/WppFloat'
import FeaturedProperties from '@/components/FeaturedProperties'

export const metadata = {
  title: 'Stiven Allan — Corretor de Imóveis em Criciúma e Região | SC',
  description: 'Lançamentos e empreendimentos de construtoras em Criciúma, Içara, Nova Veneza, Forquilhinha e Cocal do Sul/SC. CRECI/RS 60.275.',
  alternates: { canonical: 'https://stivenallan.com.br' },
}

const BAIRROS = ['Centro','Próspera','Michel','Pio Corrêa','Comerciário','Santa Luzia','Universitário','Içara','Nova Veneza','Forquilhinha','Cocal do Sul']

const CIDADES = [
  { nome: 'Criciúma', slug: 'criciuma-sc', uf: 'SC' },
  { nome: 'Içara', slug: 'icara-sc', uf: 'SC' },
  { nome: 'Nova Veneza', slug: 'nova-veneza-sc', uf: 'SC' },
  { nome: 'Forquilhinha', slug: 'forquilhinha-sc', uf: 'SC' },
  { nome: 'Cocal do Sul', slug: 'cocal-do-sul-sc', uf: 'SC' },
]

export default function HomePage() {
  return (
    <>
      <Header />

      {/* HERO — LCP: next/image com priority para PageSpeed 100 */}
      <section className="relative flex items-center justify-center min-h-screen overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80"
          alt="Lançamentos imobiliários em Criciúma SC"
          fill
          priority
          quality={85}
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,11,13,0.70)] to-[rgba(10,11,13,0.85)]" />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <p className="text-[#c9a24b] text-sm font-semibold tracking-[4px] uppercase mb-4">CRECI/RS 60.275</p>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            Lançamentos e Empreendimentos<br />
            <span className="text-[#e2c275]">em Criciúma e Região</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Das melhores construtoras do sul catarinense. Atendimento premium do primeiro contato até a entrega das chaves.
          </p>
          <div className="bg-[rgba(26,28,31,0.92)] backdrop-blur-sm border border-[#2c3035] rounded-2xl p-6 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
            <select className="bg-[#121315] border border-[#2c3035] text-[#f4f4f4] p-3 rounded-xl text-sm w-full">
              <option>Tipo de Imóvel</option>
              <option>Apartamento</option>
              <option>Casa</option>
              <option>Cobertura</option>
            </select>
            <select className="bg-[#121315] border border-[#2c3035] text-[#f4f4f4] p-3 rounded-xl text-sm w-full">
              <option>Cidade</option>
              <option>Criciúma</option>
              <option>Içara</option>
              <option>Nova Veneza</option>
              <option>Forquilhinha</option>
            </select>
            <select className="bg-[#121315] border border-[#2c3035] text-[#f4f4f4] p-3 rounded-xl text-sm w-full">
              <option>Dorm.</option>
              <option>1+</option>
              <option>2+</option>
              <option>3+</option>
              <option>4+</option>
            </select>
            <Link href="/lancamentos/criciuma-sc" className="bg-[#1f9d55] text-white font-bold p-3 rounded-xl text-sm text-center hover:bg-[#17854a] transition-colors">
              Buscar Imóveis
            </Link>
          </div>
        </div>
      </section>

      <section id="empreendimentos" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-3">
            Empreendimentos em <span className="text-[#c9a24b]">Destaque</span>
          </h2>
          <p className="text-center text-[#a7adb4] mb-12 text-lg">Lançamentos selecionados em Criciúma e região</p>
          <FeaturedProperties />
          <div className="text-center mt-12">
            <Link href="/lancamentos/criciuma-sc" className="inline-block border border-[#c9a24b] text-[#c9a24b] hover:bg-[#c9a24b] hover:text-[#1a1305] font-bold px-8 py-4 rounded-full transition-all duration-200">
              Ver todos os lançamentos em Criciúma →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#1a1c1f]">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-3">
            Onde eu <span className="text-[#c9a24b]">atuo</span>
          </h2>
          <p className="text-center text-[#a7adb4] mb-10">Criciúma e cidades vizinhas do Sul Catarinense</p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {BAIRROS.map((b) => (
              <span key={b} className="bg-[#202327] border border-[#2c3035] text-[#a7adb4] px-5 py-2.5 rounded-full text-sm hover:bg-[#c9a24b] hover:text-[#1a1305] hover:border-[#c9a24b] transition-all cursor-pointer">
                {b}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {CIDADES.map((c) => (
              <Link key={c.slug} href={'/lancamentos/' + c.slug} className="bg-[#202327] border border-[#2c3035] rounded-xl p-4 text-center hover:border-[#c9a24b] transition-all group">
                <MapPin className="w-6 h-6 text-[#c9a24b] mx-auto mb-2" />
                <p className="font-semibold text-sm">{c.nome}</p>
                <p className="text-[#a7adb4] text-xs">{c.uf}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="sobre" className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            {/* next/image no lugar de background-image inline */}
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"
                alt="Stiven Allan, corretor de imóveis em Criciúma SC"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <p className="text-[#c9a24b] text-sm font-semibold tracking-widest uppercase mb-3">Sobre mim</p>
              <h2 className="text-3xl font-extrabold mb-5">
                Olá, eu sou o <span className="text-[#c9a24b]">Stiven Allan</span>
              </h2>
              <p className="text-[#a7adb4] mb-4">
                Corretor de imóveis com atuação em Criciúma e região do extremo sul catarinense. Especializado nos principais lançamentos e construtoras da região.
              </p>
              <p className="text-[#a7adb4] mb-8">
                Seja para morar ou investir, oferece curadoria premium e acompanhamento do primeiro contato até a entrega das chaves.
              </p>
              <div className="flex gap-8 mb-8">
                <div><b className="text-3xl text-[#e2c275] block">+50</b><small className="text-[#a7adb4]">Empreendimentos</small></div>
                <div><b className="text-3xl text-[#e2c275] block">5★</b><small className="text-[#a7adb4]">Atendimento</small></div>
                <div><b className="text-3xl text-[#e2c275] block">SC</b><small className="text-[#a7adb4]">Criciúma e região</small></div>
              </div>
              <a
                href="https://wa.me/5548991642332"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#1f9d55] text-white font-bold px-8 py-4 rounded-full hover:bg-[#17854a] transition-colors"
              >
                <MessageCircle className="w-5 h-5" />Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="contato" className="py-20 bg-[#1a1c1f]">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-[#1a1c1f] to-[#2a2419] border border-[#2c3035] rounded-2xl p-12">
            <h2 className="text-3xl font-extrabold mb-4">Vamos encontrar seu imóvel ideal?</h2>
            <p className="text-[#a7adb4] mb-8">Fale comigo agora pelo WhatsApp. Resposta rápida e sem compromisso.</p>
            <a
              href="https://wa.me/5548991642332?text=Ol%C3%A1+Stiven!+Vi+seu+site+e+quero+saber+mais."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1f9d55] text-white font-bold text-lg px-10 py-4 rounded-full hover:bg-[#17854a] transition-all"
            >
              <MessageCircle className="w-6 h-6" />Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <WppFloat />
    </>
  )
}
