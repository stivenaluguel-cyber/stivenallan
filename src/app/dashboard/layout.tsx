'use client'
import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

const D = {
  sidebar: '#131211',
  bronze: '#D24E22',
  orange: '#FF6A3D',
  onDark: '#F3F2EE',
  onDarkMuted: 'rgba(245,241,234,0.65)',
  lineDark: 'rgba(245,241,234,0.14)',
}

const NAV_ITEMS = [
  { href: '/dashboard/crm', label: 'CRM' },
  { href: '/dashboard/clientes', label: 'Clientes' },
  { href: '/dashboard/propostas', label: 'Propostas' },
  { href: '/dashboard/agenda', label: 'Agenda' },
  { href: '/dashboard/financeiro', label: 'Financeiro' },
  { href: '/dashboard/empreendimentos', label: 'Empreendimentos' },
  { href: '/dashboard/leads', label: 'Leads' },
]

const PAGE_LABELS: Record<string, string> = {
  '/dashboard': 'Painel',
  '/dashboard/crm': 'CRM',
  '/dashboard/clientes': 'Clientes',
  '/dashboard/propostas': 'Propostas',
  '/dashboard/agenda': 'Agenda',
  '/dashboard/financeiro': 'Financeiro',
  '/dashboard/empreendimentos': 'Empreendimentos',
  '/dashboard/leads': 'Leads',
}

function Navbar() {
  const pathname = usePathname()
  const pageLabel = Object.entries(PAGE_LABELS)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => pathname.startsWith(path))?.[1] ?? 'Painel'

  return (
    <div style={{ background: D.sidebar, borderBottom: '1px solid ' + D.lineDark, position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 clamp(12px,3vw,32px)' }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, background: D.bronze, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#fff', fontFamily: "'Bricolage Grotesque',system-ui" }}>S</div>
            <div>
              <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontWeight: 800, fontSize: 13, color: D.onDark, letterSpacing: '-0.01em', lineHeight: 1.2 }}>Stiven Allan CRM</div>
              <div style={{ fontSize: 10, color: D.onDarkMuted, letterSpacing: '0.06em' }}>CRECI/RS 60.275</div>
            </div>
          </a>
          <nav style={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
            {NAV_ITEMS.map(({ href, label }) => {
              const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              return (
                <a key={href} href={href} style={{
                  color: isActive ? '#fff' : D.onDarkMuted,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 400,
                  padding: '6px 10px',
                  borderRadius: 2,
                  background: isActive ? D.bronze : 'transparent',
                  whiteSpace: 'nowrap',
                  minHeight: 32,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {label}
                </a>
              )
            })}
          </nav>
          <a href="/api/auth/logout" style={{ fontSize: 12, color: D.onDarkMuted, textDecoration: 'none', padding: '5px 10px', border: '1px solid ' + D.lineDark, borderRadius: 2, whiteSpace: 'nowrap', flexShrink: 0 }}>Sair</a>
        </div>
        <div style={{ paddingBottom: 6, fontSize: 11, color: D.onDarkMuted }}>
          <a href="/dashboard" style={{ color: D.onDarkMuted, textDecoration: 'none' }}>SA Imoveis</a>
          {pageLabel !== 'Painel' && <span> › <span style={{ color: D.orange }}>{pageLabel}</span></span>}
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
