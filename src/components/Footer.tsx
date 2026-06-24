import Link from 'next/link'
import { MessageCircle, Phone, MapPin, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0d0e10] border-t border-[#2c3035] pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="font-extrabold text-2xl tracking-widest block mb-4">
              STIVEN<span className="text-[#c9a24b]">ALLAN</span>
            </Link>
            <p className="text-[#a7adb4] text-xs">CRECI/RS 60.275</p>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase text-[#c9a24b] mb-5">Lançamentos</h3>
            <ul className="space-y-3 text-sm text-[#a7adb4]">
              <li><Link href="/lancamentos/criciuma-sc" className="hover:text-[#c9a24b] transition-colors">Criciúma/SC</Link></li>
              <li><Link href="/lancamentos/icara-sc" className="hover:text-[#c9a24b] transition-colors">Içara/SC</Link></li>
              <li><Link href="/lancamentos/nova-veneza-sc" className="hover:text-[#c9a24b] transition-colors">Nova Veneza/SC</Link></li>
              <li><Link href="/lancamentos/forquilhinha-sc" className="hover:text-[#c9a24b] transition-colors">Forquilhinha/SC</Link></li>
              <li><Link href="/lancamentos/cocal-do-sul-sc" className="hover:text-[#c9a24b] transition-colors">Cocal do Sul/SC</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase text-[#c9a24b] mb-5">Contato</h3>
            <ul className="space-y-3 text-sm text-[#a7adb4]">
              <li><a href="https://wa.me/5548991642332" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#c9a24b]"><MessageCircle className="w-4 h-4 text-[#1f9d55]" />(48) 99164-2332</a></li>
              <li><a href="tel:+5548991642332" className="flex items-center gap-2 hover:text-[#c9a24b]"><Phone className="w-4 h-4" />Ligar agora</a></li>
              <li><a href="https://www.instagram.com/stivenallan" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#c9a24b]"><Instagram className="w-4 h-4" />@stivenallan</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#2c3035] pt-8 flex justify-between">
          <p className="text-[#a7adb4] text-xs">© {new Date().getFullYear()} Stiven Allan. CRECI/RS 60.275.</p>
        </div>
      </div>
    </footer>
  )
}
