import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { calcularScoreOperacao, type AgregadosScoreOperacao, type ResultadoScoreOperacao } from '@/lib/score/operacao'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const CACHE_TTL_MS = 60_000
let cache: { resultado: ResultadoScoreOperacao; expiraEm: number } | null = null

/**
 * Todos os agregados vêm de UMA RPC (score_operacao_agregados, ver
 * supabase/migrations/20260806004844_score_operacao_agregados_v2.sql) — um
 * round-trip só ao banco, sem N+1. O resultado calculado fica em memória
 * por 60s: é dado que muda devagar (follow-ups da semana, leads por
 * empreendimento) e não vale recalcular a cada refresh do dashboard.
 */
export async function GET() {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (cache && cache.expiraEm > Date.now()) {
    return NextResponse.json(cache.resultado)
  }

  const { data, error } = await sb().rpc('score_operacao_agregados')
  if (error) {
    return NextResponse.json({ error: 'Falha ao carregar o score de operação' }, { status: 500 })
  }

  const resultado = calcularScoreOperacao(data as AgregadosScoreOperacao)
  cache = { resultado, expiraEm: Date.now() + CACHE_TTL_MS }

  return NextResponse.json(resultado)
}
