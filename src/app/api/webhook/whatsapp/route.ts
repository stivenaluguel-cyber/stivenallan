import { NextRequest, NextResponse } from 'next/server'
import { processarMensagem } from '@/lib/agent'
import { enviarMensagem, enviarAlertaEscalada } from '@/lib/evolution'

// Segredo para validar que o POST vem da Evolution API
const WEBHOOK_SECRET = process.env.EVOLUTION_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  try {
    // 1. Validar segredo
    const secret = req.headers.get('apikey')
    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 })
    }

    const body = await req.json()

    // 2. Filtrar apenas mensagens recebidas de usuarios reais
    // Evolution API envia evento 'messages.upsert'
    if (body.event !== 'messages.upsert') {
      return NextResponse.json({ ok: true, ignorado: true })
    }

    const msg = body.data?.message
    const from = body.data?.key?.remoteJid

    // Ignorar mensagens do proprio bot, grupos e status
    if (!msg || !from) return NextResponse.json({ ok: true })
    if (body.data?.key?.fromMe) return NextResponse.json({ ok: true })
    if (from.includes('@g.us')) return NextResponse.json({ ok: true })  // grupo
    if (from === 'status@broadcast') return NextResponse.json({ ok: true })

    // 3. Extrair texto (suporte a texto simples e botoes)
    const texto =
      msg.conversation ||
      msg.extendedTextMessage?.text ||
      msg.buttonsResponseMessage?.selectedButtonId ||
      msg.listResponseMessage?.singleSelectReply?.selectedRowId ||
      ''

    if (!texto.trim()) return NextResponse.json({ ok: true })

    // 4. Normalizar numero (remover @s.whatsapp.net)
    const whatsapp = from.replace('@s.whatsapp.net', '')

    // 5. Processar com o agente (async — nao bloqueia o webhook)
    // Retornar 200 imediatamente para a Evolution API nao reenviar
    processarEResponder(whatsapp, texto).catch(console.error)

    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error('[webhook/whatsapp]', err)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}

async function processarEResponder(whatsapp: string, texto: string) {
  try {
    // Processar com o agente
    const resposta = await processarMensagem(whatsapp, texto)

    // Enviar resposta via Evolution API
    await enviarMensagem(whatsapp, resposta)

    // Verificar se precisa de alerta de escalada
    // (o agente ja atualiza requer_atencao no banco via tool call)
    // Aqui consultamos o banco para disparar notificacao se necessario
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
      // Resetar flag para nao reenviar multiplos alertas
      await supabase
        .from('leads')
        .update({ requer_atencao: false })
        .eq('whatsapp', whatsapp)
    }

  } catch (err) {
    console.error('[processarEResponder]', whatsapp, err)
  }
}
