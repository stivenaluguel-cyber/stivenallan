import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { calcularTiers, type ItemPortfolio, type ResultadoPortfolioTiers } from '@/lib/portfolio/tiers'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const CACHE_TTL_MS = 60_000
let cache: { resultado: ResultadoPortfolioTiers; expiraEm: number } | null = null

/**
 * GET — distribuição do portfólio publicado por faixa de preço. Todo o
 * agregado vem de UMA RPC (portfolio_precos_referencia, ver
 * supabase/migrations/20260806110000_portfolio_precos_referencia.sql) —
 * mesmo padrão do Score/Meta Diária, um round-trip só. Cache de 60s: é
 * dado que muda devagar (preço de tabela e status ativo não mudam a cada
 * minuto).
 */
export async function GET() {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (cache && cache.expiraEm > Date.now()) {
    return NextResponse.json(cache.resultado)
  }

  const { data, error } = await sb().rpc('portfolio_precos_referencia')
  if (error) {
    return NextResponse.json({ error: 'Falha ao carregar a distribuição do portfólio' }, { status: 500 })
  }

  const resultado = calcularTiers((data as ItemPortfolio[]) ?? [])
  cache = { resultado, expiraEm: Date.now() + CACHE_TTL_MS }

  return NextResponse.json(resultado)
}
