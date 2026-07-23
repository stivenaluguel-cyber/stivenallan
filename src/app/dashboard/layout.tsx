'use client';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { NotificationBell } from '@/lib/dashboard/notification-bell';

const D = {
  sidebar: '#131211', bronze: '#D24E22',
  onDark: '#F3F2EE', onDarkMuted: 'rgba(245,241,234,0.60)',
  lineDark: 'rgba(245,241,234,0.12)', activeBg: 'rgba(210,78,34,0.16)',
};

type NavItem = { href: string; label: string; icon: string };

const GRUPOS: { titulo: string; itens: NavItem[] }[] = [
  {
    titulo: 'PRINCIPAL',
    itens: [
      { href: '/dashboard/crm', label: 'CRM', icon: '🗂️' },
      { href: '/dashboard/clientes', label: 'Clientes', icon: '👥' },
      { href: '/dashboard/propostas', label: 'Propostas', icon: '📄' },
      { href: '/dashboard/agenda', label: 'Agenda', icon: '📅' },
    ],
  },
  {
    titulo: 'GESTÃO',
    itens: [
      { href: '/dashboard/financeiro', label: 'Financeiro', icon: '💰' },
      { href: '/dashboard/empreendimentos', label: 'Empreendimentos', icon: '🏢' },
      { href: '/dashboard/leads', label: 'Leads', icon: '🎯' },
      { href: '/dashboard/simulador', label: 'Simulador', icon: '🧮' },
      { href: '/dashboard/relatorios', label: 'Relatórios', icon: '📊' },
      { href: '/dashboard/automacoes', label: 'Automações', icon: '⚙️' },
      { href: '/dashboard/cron', label: 'Cron', icon: '⏱️' },
    ],
  },
  {
    titulo: 'GROWTH',
    itens: [
      { href: '/dashboard/instagram', label: 'Instagram', icon: '📸' },
    ],
  },
];

const PAGE_LABELS: Record<string, string> = {
  '/dashboard': 'Painel', '/dashboard/crm': 'CRM', '/dashboard/clientes': 'Clientes',
  '/dashboard/propostas': 'Propostas', '/dashboard/agenda': 'Agenda',
  '/dashboard/financeiro': 'Financeiro', '/dashboard/empreendimentos': 'Empreendimentos',
  '/dashboard/leads': 'Leads', '/dashboard/simulador': 'Simulador',
  '/dashboard/relatorios': 'Relatórios', '/dashboard/automacoes': 'Automações',
  '/dashboard/cron': 'Cron', '/dashboard/instagram': 'Instagram',
  '/dashboard/instagram/calendario': 'Calendário Instagram',
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
    if (typeof window !== 'undefined') { sessionStorage.clear(); router.push('/'); }
  };
  const handleNav = (href: string) => { setMenuOpen(false); router.push(href); };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const SidebarContent = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <button onClick={() => handleNav('/dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px' }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: D.bronze, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15, fontWeight: 800, flexShrink: 0 }}>SA</span>
          <span style={{ fontSize: 15, color: D.onDark, fontWeight: 700, whiteSpace: 'nowrap' }}>SA Imóveis</span>
        </button>
        <NotificationBell variant="dark" />
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
        {GRUPOS.map(grupo => (
          <div key={grupo.titulo}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: D.onDarkMuted, padding: '0 8px', marginBottom: 8 }}>{grupo.titulo}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {grupo.itens.map(item => {
                const active = isActive(item.href);
                return (
                  <button key={item.href} onClick={() => handleNav(item.href)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left',
                      padding: '9px 10px', borderRadius: 8, cursor: 'pointer',
                      background: active ? D.activeBg : 'transparent',
                      border: 'none', borderLeft: '3px solid ' + (active ? D.bronze : 'transparent'),
                      color: active ? D.onDark : D.onDarkMuted, fontSize: 14, fontWeight: active ? 700 : 500,
                    }}>
                    <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
                    <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <button onClick={handleLogout}
        style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left', padding: '9px 10px', borderRadius: 8, cursor: 'pointer', background: 'none', border: '1px solid ' + D.lineDark, color: D.onDarkMuted, fontSize: 14, fontWeight: 600, marginTop: 12 }}>
        <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>↩</span>
        <span>Sair</span>
      </button>
    </>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F3F2EE', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <aside className="sa-sidebar"
        style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 236, background: D.sidebar, borderRight: '1px solid ' + D.lineDark, padding: '20px 14px', display: 'flex', flexDirection: 'column', zIndex: 50 }}>
        {SidebarContent}
      </aside>

      <header className="sa-topbar"
        style={{ display: 'none', position: 'sticky', top: 0, zIndex: 40, background: D.sidebar, borderBottom: '1px solid ' + D.lineDark, padding: '0 14px', height: 54, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: D.bronze, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 800 }}>SA</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: D.onDark }}>{pageLabel}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <NotificationBell variant="dark" />
          <button onClick={() => setMenuOpen(v => !v)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: D.onDark }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
            </svg>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 60 }} onClick={() => setMenuOpen(false)}>
          <aside onClick={e => e.stopPropagation()}
            style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 250, background: D.sidebar, padding: '20px 14px', display: 'flex', flexDirection: 'column' }}>
            {SidebarContent}
          </aside>
        </div>
      )}

      <main className="sa-main" style={{ marginLeft: 236, minHeight: '100vh' }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 900px) {
          .sa-sidebar { display: none !important; }
          .sa-topbar { display: flex !important; }
          .sa-main { margin-left: 0 !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
