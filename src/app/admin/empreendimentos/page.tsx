import { getSupabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

async function getEmpreendimentos() {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) return []

    const { data } = await supabase
      .from('empreendimentos')
      .select(`
        id, nome, slug, cidade, uf, status, destaque, ativo, publicado, created_at,
        construtoras ( nome, slug )
      `)
      .order('created_at', { ascending: false })

    return data || []
  } catch {
    return []
  }
}

const STATUS_COLORS: Record<string, string> = {
  lancamento: 'bg-[#c9a24b]/10 text-[#c9a24b]',
  em_obras: 'bg-blue-500/10 text-blue-400',
  pronto: 'bg-green-500/10 text-green-400',
  vendido: 'bg-gray-500/10 text-gray-400',
}

const STATUS_LABELS: Record<string, string> = {
  lancamento: 'Lançamento',
  em_obras: 'Em Obras',
  pronto: 'Pronto',
  vendido: 'Vendido',
}

export default async function EmpreendimentosPage() {
  const empreendimentos = await getEmpreendimentos()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold">Empreendimentos</h1>
          <p className="text-[#a7adb4] mt-1">{empreendimentos.length} empreendimentos cadastrados</p>
        </div>
        <Link
          href="/admin/empreendimentos/novo"
          className="bg-[#c9a24b] text-[#1a1305] font-bold px-5 py-2.5 rounded-xl hover:bg-[#e2c275] transition-colors"
        >
          + Novo Empreendimento
        </Link>
      </div>

      {/* Table */}
      {empreendimentos.length === 0 ? (
        <div className="bg-[#202327] border border-[#2c3035] rounded-2xl p-16 text-center">
          <p className="text-5xl mb-4">🏢</p>
          <h2 className="text-xl font-bold mb-2">Nenhum empreendimento ainda</h2>
          <p className="text-[#a7adb4] mb-6">Comece adicionando o primeiro empreendimento da carteira.</p>
          <Link
            href="/admin/empreendimentos/novo"
            className="inline-block bg-[#c9a24b] text-[#1a1305] font-bold px-6 py-3 rounded-xl hover:bg-[#e2c275] transition-colors"
          >
            Adicionar Empreendimento
          </Link>
        </div>
      ) : (
        <div className="bg-[#202327] border border-[#2c3035] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2c3035]">
                <th className="text-left px-6 py-3 text-[#a7adb4] text-sm font-medium">Nome</th>
                <th className="text-left px-6 py-3 text-[#a7adb4] text-sm font-medium hidden md:table-cell">Construtora</th>
                <th className="text-left px-6 py-3 text-[#a7adb4] text-sm font-medium hidden lg:table-cell">Cidade</th>
                <th className="text-left px-6 py-3 text-[#a7adb4] text-sm font-medium">Status</th>
                <th className="text-left px-6 py-3 text-[#a7adb4] text-sm font-medium">Destaque</th>
                <th className="text-right px-6 py-3 text-[#a7adb4] text-sm font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2c3035]">
              {empreendimentos.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-[#1a1c1f] transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{emp.nome}</p>
                      <p className="text-[#a7adb4] text-xs mt-0.5">{emp.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-[#a7adb4] text-sm">{emp.construtoras?.nome || '—'}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-[#a7adb4] text-sm">{emp.cidade || '—'}/{emp.uf}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_COLORS[emp.status] || 'bg-gray-700/10 text-gray-400'}`}>
                      {STATUS_LABELS[emp.status] || emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs ${emp.destaque ? 'text-[#c9a24b]' : 'text-[#4a5058]'}`}>
                      {emp.destaque ? '⭐ Sim' : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/empreendimento/${emp.construtoras?.slug || 'construtora'}/${emp.slug}`}
                        target="_blank"
                        className="text-xs text-[#a7adb4] hover:text-[#f4f4f4] px-2 py-1 rounded hover:bg-[#2c3035] transition-colors"
                      >
                        👁 Ver
                      </Link>
                      <Link
                        href={`/admin/empreendimentos/${emp.id}/editar`}
                        className="text-xs text-[#c9a24b] hover:text-[#e2c275] px-2 py-1 rounded hover:bg-[#c9a24b]/10 transition-colors"
                      >
                        ✏️ Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
