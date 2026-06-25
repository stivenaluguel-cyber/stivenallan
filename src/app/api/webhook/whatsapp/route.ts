import { NextRequest, NextResponse } from 'next/server'
import { processarMensagem } from '@/lib/agent'
import { enviarMensagem, enviarAlertaEscalada } from '@/lib/evolution'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Debug: logar todos os headers para identificar o que a Evolution envia
    const allHeaders: Record<string, string> = {}
    req.headers.forEach((value, key) => { allHeaders[key] = value })
    console.log('[webhook] headers:', JSON.stringify(allHeaders).substring(0, 200))

    const body = await req.json()
    console.log('[webhook] event:', body.event, '| instance:', body.instance)

    // Filtrar apenas mensagens recebidas de usuarios reais
    if (body.event !== 'messages.upsert') {
      return NextResponse.json({ ok: true, ignorado: true })
    }

    const msg = body.data?.message
    const from = body.data?.key?.remoteJid

    if (!msg || !from) return NextResponse.json({ ok: true })
    if (body.data?.key?.fromMe) return NextResponse.json({ ok: true })
    if (from.includes('@g.us')) return NextResponse.json({ ok: true })
    if (from === 'status@broadcast') return NextResponse.json({ ok: true })

    const texto =
      msg.conversation ||
      msg.extendedTextMessage?.text ||
      msg.buttonsResponseMessage?.selectedButtonId ||
      msg.listResponseMessage?.singleSelectReply?.selectedRowId ||
      ''

    if (!texto.trim()) return NextResponse.json({ ok: true })

    const whatsapp = from.replace('@s.whatsapp.net', '')
    console.log('[webhook] processando:', whatsapp, '|', texto.substring(0, 80))

    processarEResponder(whatsapp, texto).catch(console.error)

    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error('[webhook/whatsapp]', err)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}

async function processarEResponder(whatsapp: string, texto: string) {
  try {
    const resposta = await processarMensagem(whatsapp, texto)
    await enviarMensagem(whatsapp, resposta)

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: lead } = await supabase
      .from('leads')
      .select('nome, requer_atencao, lead_score')
      .eq('whatsapp', whatsapp)
      .single()

    if (lead?.requer_atencao) {
      await enviarAlertaEscalada(whatsapp, lead.nome, lead.lead_score)
      await supabase
        .from('leads')
        .update({ requer_atencao: false })
        .eq('whatsapp', whatsapp)
    }

  } catch (err) {
    console.error('[processarEResponder]', whatsapp, err)
  }
}
