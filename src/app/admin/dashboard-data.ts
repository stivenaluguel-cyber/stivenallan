import { getSupabaseAdmin } from '@/lib/supabase'

// Extraído de page.tsx (Item 6A): Next.js valida em build-time que um
// page.tsx só exporta `default`/`metadata`/etc. — exports nomeados extras
// (necessários pra testar essas funções isoladamente) quebram essa
// checagem de tipos. Mesma lógica, só movida de arquivo.

export async function getDashboardStats() {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) return null

    // Item 6A: card "Em Destaque" removido — a query filtrava por
    // `empreendimentos.destaque`, coluna que nunca existiu no schema real
    // (confirmado no tipo oficial gerado, src/types/database.generated.ts).
    // Auditei `empreendimentos` E `properties` (a tabela unificada atual)
    // procurando um equivalente inequívoco (ativo/publicado/featured) —
    // nenhuma das duas tem esse conceito; `properties.ativo`/`oculto` são
    // sobre visibilidade, não destaque. Sem coluna real correspondente,
    // preferi remover a métrica a inventar um significado novo.
    const [
      { count: totalEmpreendimentos },
      { count: totalLeads },
      { count: leadsNovos },
    ] = await Promise.all([
      supabase.from('empreendimentos').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'novo'),
    ])

    return {
      totalEmpreendimentos: totalEmpreendimentos || 0,
      totalLeads: totalLeads || 0,
      leadsNovos: leadsNovos || 0,
    }
  } catch {
    return null
  }
}

export async function getRecentLeads() {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) return []

    // Item 6A: `telefone` corrigido pra `whatsapp` — `leads.telefone` nunca
    // existiu no schema real (confirmado no tipo oficial gerado); a coluna
    // real de contato do lead é `whatsapp`.
    const { data } = await supabase
      .from('leads')
      .select('id, nome, whatsapp, status, created_at, empreendimentos(nome)')
      .order('created_at', { ascending: false })
      .limit(5)

    return data || []
  } catch {
    return []
  }
}
