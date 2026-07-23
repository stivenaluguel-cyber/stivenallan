import { NextRequest, NextResponse } from 'next/server'
import { sendMetaCapiEvent } from '@/lib/meta-capi'
import { ESTAGIO_META_EVENT } from '@/lib/dashboard/estagios'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const SOURCE = 'api/meta-capi'

// Endpoint público (chamado direto do browser em FormContato.tsx e
// LeadCaptureModal.tsx) — por isso event_name é validado contra uma lista
// fechada, em vez de repassado como veio no body. Sem isso, qualquer
// requisição externa poderia injetar eventos arbitrários no Pixel.
const ALLOWED_EVENT_NAMES = new Set<string>(['Lead', ...Object.values(ESTAGIO_META_EVENT)])

// Defesa contra payload malformado/abusivo: só strings, com teto de tamanho.
function asString(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, max)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const event_id = asString(body.event_id, 64)
    const nome = asString(body.nome, 200)
    const telefone = asString(body.telefone, 40)
    const email = asString(body.email, 254)
    const content_name = asString(body.content_name, 200)
    const fbclid = asString(body.fbclid, 500)
    const fbclid_ts = asString(body.fbclid_ts, 20)
    const url = asString(body.url, 1000)
    const event_name = asString(body.event_name, 60)
    if (!event_id || !nome || !telefone) {
      return NextResponse.json({ error: 'Campos obrigatorios ausentes' }, { status: 400 })
    }
    if (event_name && !ALLOWED_EVENT_NAMES.has(event_name)) {
      return NextResponse.json({ error: 'event_name invalido' }, { status: 400 })
    }

    const cookies = req.cookies
    const fbp = cookies.get('_fbp')?.value || null
    const fbcCookie = cookies.get('_fbc')?.value || null
    // fbclid_ts vem do sessionStorage do client (momento do click original).
    const clickTs = typeof fbclid_ts === 'string' ? parseInt(fbclid_ts, 10) : null
    const clickTsSafe = clickTs !== null && !Number.isNaN(clickTs) ? clickTs : null
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null

    const result = await sendMetaCapiEvent({
      eventName: event_name || 'Lead',
      eventId: event_id,
      nome,
      telefone,
      email,
      contentName: content_name,
      url,
      fbclid,
      fbclidTs: clickTsSafe,
      fbp,
      fbcCookie,
      clientIp: ip,
      userAgent: req.headers.get('user-agent') || null,
    })

    if (result.ok) return NextResponse.json({ success: true }, { status: 200 })
    if ('skipped' in result) return NextResponse.json({ skipped: true }, { status: 200 })
    return NextResponse.json({ error: result.error }, { status: 502 })
  } catch (err) {
    logError(SOURCE, 'route exception', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
