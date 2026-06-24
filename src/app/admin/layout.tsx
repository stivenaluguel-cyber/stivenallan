'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/empreendimentos', label: 'Empreendimentos', icon: '🏢' },
  { href: '/admin/crm', label: 'CRM / Leads', icon: '👥' },
]

function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.auth.signOut()
      // Limpar cookie
      document.cookie = 'sb-access-token=; path=/; max-age=0'
      router.push('/admin/login')
    } catch {
      router.push('/admin/login')
    }
  }

  return (
    <aside className="w-64 bg-[#1a1c1f] border-r border-[#2c3035] flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#2c3035]">
        <Link href="/" className="block">
          <span className="font-extrabold text-[#f4f4f4] tracking-tight">STIVENALLAN</span>
          <span className="block text-xs text-[#a7adb4] mt-0.5">Painel Admin</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#c9a24b]/10 text-[#c9a24b] border border-[#c9a24b]/20'
                  : 'text-[#a7adb4] hover:text-[#f4f4f4] hover:bg-[#202327]'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[#2c3035]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#a7adb4] hover:text-[#f4f4f4] hover:bg-[#202327] transition-colors mb-1"
        >
          <span>🌐</span>
          Ver site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#a7adb4] hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <span>🚪</span>
          Sair
        </button>
      </div>
    </aside>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#121315] text-[#f4f4f4]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
