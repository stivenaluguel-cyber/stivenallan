import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

// Estado agregado por (lead, propriedade) — alimenta o drawer "Ver interesses"
// do Kanban. Diferente de /eventos (timeline crua): aqui cada linha já é o
// resumo atual de um empreendimento (contagem, marcos, primeira/última
// visita), sem precisar agregar lead_eventos no client.
export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const { data, error } = await sb()
    .from('lead_property_interests')
    .select(
      'property_id, property_slug, first_seen_at, last_seen_at, view_count, unlocked_at, whatsapp_clicked_at, catalog_downloaded_at, floorplan_viewed_at, gallery_viewed_at, availability_viewed_at, source, utm_source, utm_campaign, properties(nome)',
    )
    .eq('lead_id', id)
    .order('last_seen_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const interesses = (data ?? []).map((row: Record<string, unknown>) => {
    const propriedade = Array.isArray(row.properties) ? row.properties[0] : row.properties
    const { properties: _properties, ...resto } = row
    return { ...resto, property_nome: (propriedade as { nome?: string } | null)?.nome ?? row.property_slug }
  })

  return NextResponse.json({ interesses })
}
