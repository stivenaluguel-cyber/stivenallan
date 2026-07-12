import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildIcsCalendar, type IcsEvent } from '@/lib/dashboard/ics'
import { verifyIcsToken } from '@/lib/dashboard/ics-token'
import { TIPO_LABEL, LINHA_LABEL, STATUS_LABEL } from '@/lib/dashboard/instagram-metas'
import { logError, logWarn } from '@/lib/log'

export const dynamic = 'force-dynamic'

const SOURCE = 'api/instagram/calendario.ics'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.com.br'

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token')
  if (!verifyIcsToken(token)) {
    logWarn(SOURCE, 'token inválido ou ausente')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = sb()
  if (!supabase) return NextResponse.json({ error: 'Serviço indisponível' }, { status: 503 })

  const { data, error } = await supabase
    .from('ig_content_calendar')
    .select('id, data, tipo, linha, titulo, status, observacoes')
    .not('data', 'is', null)
    .order('data', { ascending: true })

  if (error) {
    logError(SOURCE, 'falha ao buscar calendário', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const events: IcsEvent[] = (data ?? []).map((row) => ({
    id: row.id,
    data: row.data as string,
    titulo: `[${TIPO_LABEL[row.tipo] ?? row.tipo}] ${row.titulo}`,
    descricao: [
      `Linha: ${LINHA_LABEL[row.linha] ?? row.linha}`,
      `Status: ${STATUS_LABEL[row.status] ?? row.status}`,
      row.observacoes ? `Obs: ${row.observacoes}` : null,
    ]
      .filter(Boolean)
      .join('\n'),
    url: `${SITE_URL}/dashboard/instagram/calendario`,
  }))

  const ics = buildIcsCalendar(events, new Date())

  return new NextResponse(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'public, max-age=900',
    },
  })
}
