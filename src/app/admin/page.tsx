import { getSupabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

async function getDashboardStats() {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) return null

    const [
      { count: totalEmpreendimentos },
      { count: totalLeads },
      { count: leadsNovos },
      { count: empreendimentosDestaque },
    ] = await Promise.all([
      supabase.from('empreendimentos').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'novo'),
      supabase.from('empreendimentos').select('*', { count: 'exact', head: true }).eq('destaque', true),
    ])

    return {
      totalEmpreendimentos: totalEmpreendimentos || 0,
      totalLeads: totalLeads || 0,
      leadsNovos: leadsNovos || 0,
      empreendimentosDestaque: empreendimentosDestaque || 0,
    }
  } catch {
    return null
  }
}

async function getRecentLeads() {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) return []

    const { data } = await supabase
      .from('leads')
      .select('id, nome, telefone, status, created_at, empreendimentos(nome)')
      .order('created_at', { ascending: false })
      .limit(5)

    return data || []
  } catch {
    return []
  }
}

const STATUS_BADGE: Record<string, string> = {
  novo: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  contato: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  qualificado: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  proposta: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  fechado: 'bg-green-500/10 text-green-400 border border-green-500/20',
  perdido: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

export default async function AdminDashboard() {
  const [stats, recentLeads] = await Promise.all([
    getDashboardStats(),
    getRecentLeads(),
  ])

  const cards = [
    {
      label: 'Empreendimentos',
      value: stats?.totalEmpreendimentos ?? '—',
      icon: '🏢',
      href: '/admin/empreendimentos',
      color: 'text-[#c9a24b]',
    },
    {
      label: 'Total de Leads',
      value: stats?.totalLeads ?? '—',
      icon: '👥',
      href: '/admin/crm',
      color: 'text-blue-400',
    },
    {
      label: 'Leads Novos',
      value: stats?.leadsNovos ?? '—',
      icon: '🔔',
      href: '/admin/crm?status=novo',
      color: 'text-yellow-400',
    },
    {
      label: 'Em Destaque',
      value: stats?.empreendimentosDestaque ?? '—',
      icon: '⭐',
      href: '/admin/empreendimentos?destaque=true',
      color: 'text-[#c9a24b]',
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold">Dashboard</h1>
        <p className="text-[#a7adb4] mt-1">Bem-vindo, Stiven! Aqui está um resumo do seu negócio.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-[#202327] border border-[#2c3035] rounded-2xl p-5 hover:border-[#c9a24b]/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className={`text-3xl font-extrabold ${card.color}`}>{card.value}</span>
            </div>
            <p className="text-[#a7adb4] text-sm">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Leads */}
      <div className="bg-[#202327] border border-[#2c3035] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2c3035]">
          <h2 className="font-bold">Leads Recentes</h2>
          <Link href="/admin/crm" className="text-[#c9a24b] text-sm hover:underline">
            Ver todos →
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="px-6 py-10 text-center text-[#a7adb4]">
            <p className="text-4xl mb-3">📭</p>
            <p>Nenhum lead ainda. Compartilhe o site!</p>
          </div>
        ) : (
          <div className="divide-y divide-[#2c3035]">
            {recentLeads.map((lead: any) => (
              <div key={lead.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{lead.nome}</p>
                  <p className="text-[#a7adb4] text-sm">{lead.telefone}</p>
                  {lead.empreendimentos && (
                    <p className="text-[#a7adb4] text-xs mt-0.5">📍 {(lead.empreendimentos as any).nome}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_BADGE[lead.status] || 'bg-gray-700'}`}>
                    {lead.status}
                  </span>
                  <span className="text-[#a7adb4] text-xs">
                    {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Link
          href="/admin/empreendimentos/novo"
          className="bg-[#c9a24b] text-[#1a1305] font-bold py-4 rounded-2xl text-center hover:bg-[#e2c275] transition-colors"
        >
          + Novo Empreendimento
        </Link>
        <Link
          href="/admin/crm"
          className="bg-[#202327] border border-[#2c3035] font-bold py-4 rounded-2xl text-center hover:border-[#c9a24b] transition-colors"
        >
          📋 Ver Todos os Leads
        </Link>
      </div>
    </div>
  )
}
