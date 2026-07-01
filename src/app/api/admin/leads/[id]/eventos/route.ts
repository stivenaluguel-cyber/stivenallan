import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function auth() {
  const s = await cookies(); const t = s.get('dashboard_token')?.value; if (!t) return false
  try { await jwtVerify(t, new TextEncoder().encode(process.env.JWT_SECRET!)); return true } catch { return false }
}

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { data, error } = await sb()
    .from('lead_eventos')
    .select('tipo, slug, created_at')
    .eq('lead_id', id)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ eventos: data ?? [] })
}
