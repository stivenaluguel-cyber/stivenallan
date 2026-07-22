import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { logError, logInfo } from '@/lib/log'

export const dynamic = 'force-dynamic'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '364836344657445'
const SOURCE = 'api/meta-capi'

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

function hashFirstName(nome: string) {
  return sha256(nome.trim().toLowerCase().split(/\s+/)[0])
}

// Sobrenome (última palavra) quando o nome tem 2+ palavras — sobe o match
// quality sem nenhum dado extra do visitante. Sempre hasheado, nunca bruto.
function hashLastName(nome: string): string | null {
  const parts = nome.trim().toLowerCase().split(/\s+/)
  if (parts.length < 2) return null
  return sha256(parts[parts.length - 1])
}

// Defesa contra payload malformado/abusivo: só strings, com teto de tamanho.
function asString(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, max)
}

export async function POST(req: NextRequest) {
  try {
    const token = process.env.META_CAPI_TOKEN
    if (!token) {
      return NextResponse.json({ skipped: true }, { status: 200 })
    }

    const body = await req.json()
    const event_id = asString(body.event_id, 64)
    const nome = asString(body.nome, 200)
    const telefone = asString(body.telefone, 40)
    const email = asString(body.email, 254)
    const content_name = asString(body.content_name, 200)
    const fbclid = asString(body.fbclid, 500)
    const fbclid_ts = asString(body.fbclid_ts, 20)
    const url = asString(body.url, 1000)
    if (!event_id || !nome || !telefone) {
      return NextResponse.json({ error: 'Campos obrigatorios ausentes' }, { status: 400 })
    }

    const cookies = req.cookies
    const fbp = cookies.get('_fbp')?.value || null
    const fbcCookie = cookies.get('_fbc')?.value || null
    // fbclid_ts vem do sessionStorage do client (momento do click original).
    // Fallback Date.now() se ausente ou inválido — retro-compat + defesa.
    const clickTs = typeof fbclid_ts === 'string' ? parseInt(fbclid_ts, 10) : null
    const clickTsSafe = clickTs !== null && !Number.isNaN(clickTs) ? clickTs : Date.now()
    const fbc = fbcCookie || (fbclid ? `fb.1.${clickTsSafe}.${fbclid}` : null)

    // F-Match-Verify: classifica origem do _fbc pra você agregar match quality no log.
    //   cookie = Pixel plantou (melhor)
    //   synthesized_click_ts = sintetizado com timestamp do click original (bom)
    //   synthesized_now = sintetizado com timestamp do submit (aceitável — Meta docs
    //                     dizem que baixa um pouco o match quality)
    //   none = sem fbc (organic, sem ad Meta)
    const fbc_source: 'cookie' | 'synthesized_click_ts' | 'synthesized_now' | 'none' =
      fbcCookie ? 'cookie'
      : !fbclid ? 'none'
      : clickTs !== null && !Number.isNaN(clickTs) ? 'synthesized_click_ts'
      : 'synthesized_now'

    const userData: Record<string, unknown> = {
      ph: [hashPhone(telefone)],
      fn: [hashFirstName(nome)],
      client_user_agent: req.headers.get('user-agent') || undefined,
    }
    const ln = hashLastName(nome)
    if (ln) userData.ln = [ln]
    if (email) userData.em = [hashEmail(email)]
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    if (ip) userData.client_ip_address = ip
    if (fbp) userData.fbp = fbp
    if (fbc) userData.fbc = fbc

    // META_TEST_EVENT_CODE (env server, opcional): roteia os eventos pra aba
    // "Testar eventos" do Gerenciador de Eventos SEM poluir os dados reais.
    // Usar só durante validação; remover a env depois.
    const testEventCode = process.env.META_TEST_EVENT_CODE
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
      ...(testEventCode ? { test_event_code: testEventCode } : {}),
    }

    // F-Match-Verify: agregável no Vercel Log Viewer pra medir % de cada fbc_source.
    // Só booleanos + enum — zero PII no log.
    logInfo(SOURCE, 'capi payload built', {
      fbc_source,
      has_fbp: Boolean(fbp),
      has_email: Boolean(email),
      has_phone: Boolean(telefone),
      has_ip: Boolean(ip),
    })

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
      logError(SOURCE, 'graph api failed', new Error(`status=${res.status} body=${detail}`))
      return NextResponse.json({ error: 'CAPI falhou' }, { status: 502 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    logError(SOURCE, 'route exception', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
