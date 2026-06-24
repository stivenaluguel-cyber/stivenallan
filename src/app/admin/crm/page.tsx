import { getSupabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

async function getLeads(status?: string) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) return []

    let query = supabase
      .from('leads')
      .select(`
        id, nome, telefone, email, mensagem, status, origem, created_at, updated_at,
        empreendimentos ( nome, slug )
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data } = await query.limit(50)
    return data || []
  } catch {
    return []
  }
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os Leads' },
  { value: 'novo', label: '🔔 Novos' },
  { value: 'contato', label: '📞 Em Contato' },
  { value: 'qualificado', label: '✅ Qualificados' },
  { value: 'proposta', label: '📄 Com Proposta' },
  { value: 'fechado', label: '🎉 Fechados' },
  { value: 'perdido', label: '❌ Perdidos' },
]

const STATUS_BADGE: Record<string, string> = {
  novo: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  contato: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  qualificado: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  proposta: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  fechado: 'bg-green-500/10 text-green-400 border border-green-500/20',
  perdido: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

type SearchParams = { status?: string }

export default async function CrmPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { status } = await searchParams
  const leads = await getLeads(status)

  function whatsappLink(telefone: string, nome: string) {
    const phone = telefone.replace(/\D/g, '')
    const msg = encodeURIComponent(`Olá ${nome}! Sou o Stiven Allan, corretor de imóveis. Vi que você tem interesse em empreendimentos na nossa região. Posso te ajudar?`)
    return `https://wa.me/55${phone}?text=${msg}`
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">CRM — Leads</h1>
          <p className="text-[#a7adb4] mt-1">{leads.length} lead{leads.length !== 1 ? 's' : ''} encontrado{leads.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filtros de Status */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/admin/crm${opt.value ? `?status=${opt.value}` : ''}`}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              (status || '') === opt.value
                ? 'bg-[#c9a24b] text-[#1a1305] border-[#c9a24b]'
                : 'border-[#2c3035] text-[#a7adb4] hover:border-[#c9a24b]/50 hover:text-[#f4f4f4]'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Lista de Leads */}
      {leads.length === 0 ? (
        <div className="bg-[#202327] border border-[#2c3035] rounded-2xl p-16 text-center">
          <p className="text-5xl mb-4">📭</p>
          <h2 className="text-xl font-bold mb-2">Nenhum lead encontrado</h2>
          <p className="text-[#a7adb4]">
            {status ? `Não há leads com status "${status}" ainda.` : 'Os leads aparecerão aqui quando clientes preencherem o formulário do site.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead: any) => (
            <div
              key={lead.id}
              className="bg-[#202327] border border-[#2c3035] rounded-2xl p-5 hover:border-[#c9a24b]/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Info principal */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg">{lead.nome}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[lead.status] || 'bg-gray-700/10 text-gray-400'}`}>
                      {lead.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#a7adb4] mb-3">
                    <span>📱 {lead.telefone}</span>
                    {lead.email && <span>✉️ {lead.email}</span>}
                    {lead.empreendimentos && <span>🏢 {(lead.empreendimentos as any).nome}</span>}
                    <span>🗓 {new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {lead.mensagem && (
                    <p className="text-sm text-[#a7adb4] bg-[#1a1c1f] rounded-lg px-3 py-2 italic">
                      "{lead.mensagem}"
                    </p>
                  )}
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-2 shrink-0">
                  <a
                    href={whatsappLink(lead.telefone, lead.nome)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-[#1f9d55] text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-[#17854a] transition-colors"
                  >
                    <span>💬</span> WhatsApp
                  </a>
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      className="flex items-center gap-1.5 bg-[#202327] border border-[#2c3035] text-[#a7adb4] text-xs font-bold px-3 py-2 rounded-xl hover:border-[#c9a24b] hover:text-[#f4f4f4] transition-colors"
                    >
                      <span>✉️</span> E-mail
                    </a>
                  )}
                  <a
                    href={`tel:${lead.telefone.replace(/\D/g, '')}`}
                    className="flex items-center gap-1.5 bg-[#202327] border border-[#2c3035] text-[#a7adb4] text-xs font-bold px-3 py-2 rounded-xl hover:border-[#c9a24b] hover:text-[#f4f4f4] transition-colors"
                  >
                    <span>📞</span> Ligar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
