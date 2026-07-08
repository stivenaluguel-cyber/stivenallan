import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '364836344657445'

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function hashEmail(email: string) {
  return sha256(email.trim().toLowerCase())
}

function hashPhone(phone: string) {
  let digits = phone.replace(/\D/g, '')
  if (digits.length === 10 || digits.length === 11) digits = '55' + digits
  return sha256(digits)
}

function hashName(nome: string) {
  return sha256(nome.trim().toLowerCase().split(/\s+/)[0])
}

export async function POST(req: NextRequest) {
  try {
    const token = process.env.META_CAPI_TOKEN
    if (!token) {
      return NextResponse.json({ skipped: true }, { status: 200 })
    }

    const body = await req.json()
    const { event_id, nome, telefone, email, content_name, fbclid, url } = body
    if (!event_id || !nome || !telefone) {
      return NextResponse.json({ error: 'Campos obrigatorios ausentes' }, { status: 400 })
    }

    const cookies = req.cookies
    const fbp = cookies.get('_fbp')?.value || null
    const fbcCookie = cookies.get('_fbc')?.value || null
    const fbc = fbcCookie || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : null)

    const userData: Record<string, unknown> = {
      ph: [hashPhone(telefone)],
      fn: [hashName(nome)],
      client_user_agent: req.headers.get('user-agent') || undefined,
    }
    if (email) userData.em = [hashEmail(email)]
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    if (ip) userData.client_ip_address = ip
    if (fbp) userData.fbp = fbp
    if (fbc) userData.fbc = fbc

    const payload = {
      data: [
        {
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          event_id,
          action_source: 'website',
          event_source_url: url || undefined,
          user_data: userData,
          custom_data: content_name ? { content_name } : undefined,
        },
      ],
    }

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )

    if (!res.ok) {
      const detail = await res.text()
      console.error('Meta CAPI error:', detail)
      return NextResponse.json({ error: 'CAPI falhou' }, { status: 502 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Route error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
