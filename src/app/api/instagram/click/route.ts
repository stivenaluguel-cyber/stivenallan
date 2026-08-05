import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { registrarClique } from '@/lib/instagram/comment-automations'
import { logError } from '@/lib/log'

// Redirect de tracking pros botões de link da DM (CTR = cliques / DMs entregues).
// Instagram não dispara webhook de clique em botão — cada URL é reescrita
// pra passar por aqui antes do destino real. O destino vem na própria URL
// (d=), então o redirect nunca quebra mesmo se o log de clique falhar.
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const automacaoId = searchParams.get('a')
  const buttonIndex = Number(searchParams.get('i') ?? '0')
  const commenterId = searchParams.get('u') ?? ''
  const dest = searchParams.get('d') ?? ''

  const destino = /^https?:\/\//i.test(dest) ? dest : 'https://www.instagram.com'

  if (automacaoId) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    registrarClique(supabase, automacaoId, buttonIndex, commenterId).catch((err) => logError('instagram/click', 'falha ao registrar clique', err))
  }

  return NextResponse.redirect(destino, { status: 302 })
}
