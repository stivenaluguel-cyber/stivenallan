'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/#empreendimentos', label: 'Empreendimentos' },
    { href: '/lancamentos/criciuma-sc', label: 'Lançamentos' },
    { href: '/#sobre', label: 'Sobre' },
    { href: '/#contato', label: 'Contato' },
  ]

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#121315] shadow-lg shadow-black/50' : 'bg-gradient-to-b from-[rgba(18,19,21,0.85)] to-transparent'}`}>
      <div className="container mx-auto px-6">
        <nav className="flex items-center justify-between py-5">
          <Link href="/" className="font-extrabold text-xl tracking-widest">
            STIVEN<span className="text-[#c9a24b]">ALLAN</span>
            <small className="block text-[10px] tracking-[4px] text-[#a7adb4] font-normal">CORRETOR DE IMÓVEIS</small>
          </Link>
          <ul className="hidden md:flex gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <li key={link.href}><Link href={link.href} className="hover:text-[#c9a24b] transition-colors">{link.label}</Link></li>
            ))}
          </ul>
          <a href="https://wa.me/5548991642332" target="_blank" rel="noopener noreferrer" className="hidden md:inline-block bg-[#1f9d55] text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#17854a] transition-colors">WhatsApp</a>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2" aria-label="Menu">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>
        {menuOpen && (
          <div className="md:hidden bg-[#1a1c1f] border-t border-[#2c3035] py-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block py-3 px-4 text-sm hover:text-[#c9a24b] transition-colors">{link.label}</Link>
            ))}
            <a href="https://wa.me/5548991642332" target="_blank" rel="noopener noreferrer" className="block mt-3 mx-4 bg-[#1f9d55] text-white text-sm font-bold px-5 py-3 rounded-full text-center">Falar no WhatsApp</a>
          </div>
        )}
      </div>
    </header>
  )
}
