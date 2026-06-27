'use client';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard/crm', label: 'CRM' },
  { href: '/dashboard/clientes', label: 'Clientes' },
  { href: '/dashboard/propostas', label: 'Propostas' },
  { href: '/dashboard/agenda', label: 'Agenda' },
  { href: '/dashboard/financeiro', label: 'Financeiro' },
  { href: '/dashboard/empreendimentos', label: 'Empreendimentos' },
  { href: '/dashboard/leads', label: 'Leads' },
  { href: '/dashboard/simulador', label: 'Simulador' },
];

const PAGE_LABELS: Record<string, string> = {
  '/dashboard': 'Painel',
  '/dashboard/crm': 'CRM',
  '/dashboard/clientes': 'Clientes',
  '/dashboard/propostas': 'Propostas',
  '/dashboard/agenda': 'Agenda',
  '/dashboard/financeiro': 'Financeiro',
  '/dashboard/empreendimentos': 'Empreendimentos',
  '/dashboard/leads': 'Leads',
  '/dashboard/simulador': 'Simulador',
};

function getLabel(pathname: string) {
  const exact = PAGE_LABELS[pathname];
  if (exact) return exact;
  const found = Object.entries(PAGE_LABELS).find(([k]) => pathname.startsWith(k + '/'));
  return found ? found[1] : 'Dashboard';
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const pageLabel = getLabel(pathname);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      router.push('/');
    }
  };

  const handleNav = (href: string) => {
    setMenuOpen(false);
    router.push(href);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <nav style={{
        background: '#fff',
        borderBottom: '1.5px solid #e5e7eb',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '0 16px',
          height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <button
              onClick={() => handleNav('/dashboard')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
            >
              <span style={{ width: 30, height: 30, borderRadius: 8, background: '#D24E22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>SA</span>
              <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 500, whiteSpace: 'nowrap' }}>SA Imóveis</span>
            </button>
            <span style={{ color: '#d1d5db', fontSize: 16 }}>›</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pageLabel}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="sa-desktop-nav">
            {NAV_ITEMS.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <button
                  key={item.href}
                  onClick={() => handleNav(item.href)}
                  style={{
                    background: isActive ? '#FFF3EC' : 'none', border: 'none', borderRadius: 6,
                    padding: '6px 10px', fontSize: 13, fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#D24E22' : '#374151', cursor: 'pointer', whiteSpace: 'nowrap',
                    borderBottom: isActive ? '2px solid #D24E22' : '2px solid transparent',
                  }}
                >{item.label}</button>
              );
            })}
            <button
              onClick={handleLogout}
              style={{ background: 'none', border: '1.5px solid #e5e7eb', borderRadius: 6, padding: '6px 10px', fontSize: 13, fontWeight: 500, color: '#6b7280', cursor: 'pointer', marginLeft: 4 }}
            >Sair</button>
          </div>

          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            className="sa-hamburger"
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#374151' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div style={{ position: 'fixed', top: 56, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 49 }} onClick={() => setMenuOpen(false)}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#fff', padding: '8px 0 16px', borderBottom: '1.5px solid #e5e7eb', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
              {NAV_ITEMS.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <button key={item.href} onClick={() => handleNav(item.href)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '13px 20px', background: isActive ? '#FFF3EC' : 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: isActive ? 700 : 400, color: isActive ? '#D24E22' : '#111827', borderLeft: isActive ? '3px solid #D24E22' : '3px solid transparent' }}>{item.label}</button>
                );
              })}
              <div style={{ borderTop: '1px solid #e5e7eb', margin: '8px 0' }} />
              <button onClick={handleLogout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '13px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#DC2626', fontWeight: 500 }}>Sair</button>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 767px) {
          .sa-desktop-nav { display: none !important; }
          .sa-hamburger { display: flex !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <main style={{ maxWidth: 1280, margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
