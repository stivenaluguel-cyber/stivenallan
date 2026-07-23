import { NextRequest, NextResponse } from 'next/server'
import { processarMensagem, type MensagemChat } from '@/lib/agent'
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
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Resolve-ou-cria o lead atomicamente (unique index em leads.whatsapp,
    // migração 0010). Antes só nascia lead quando a IA decidia chamar
    // atualizar_lead() — agora toda mensagem recebida garante um lead_id,
    // mesmo que seja só um "oi" de numero desconhecido, pra nada se perder
    // da caixa de entrada. O upsert só grava a coluna whatsapp; nenhum outro
    // campo do lead é tocado quando ele já existe.
    const { data: lead, error: upsertErr } = await supabase
      .from('leads')
      .upsert({ whatsapp }, { onConflict: 'whatsapp' })
      .select('id, nome, requer_atencao, lead_score, atendimento_humano_ativo')
      .single()

    if (upsertErr || !lead) {
      console.error('[processarEResponder] falha ao resolver lead', whatsapp, upsertErr)
      return
    }

    // Histórico ANTES de logar a mensagem atual (evita ter que filtrar a
    // própria mensagem de volta do resultado da query).
    const { data: historicoRows } = await supabase
      .from('interacoes')
      .select('direcao, mensagem, created_at')
      .eq('lead_id', lead.id)
      .eq('canal', 'whatsapp')
      .order('created_at', { ascending: false })
      .limit(20)

    const historico: MensagemChat[] = (historicoRows ?? [])
      .slice()
      .reverse()
      .map((m) => ({ role: m.direcao === 'entrada' ? ('user' as const) : ('assistant' as const), content: m.mensagem }))

    // Loga a mensagem recebida sempre — mesmo se o bot estiver pausado, o
    // corretor precisa ver isso na caixa de entrada do painel.
    await supabase.from('interacoes').insert({
      lead_id: lead.id,
      canal: 'whatsapp',
      direcao: 'entrada',
      mensagem: texto,
    })

    if (lead.atendimento_humano_ativo) {
      // Corretor assumiu a conversa manualmente pelo painel — bot fica calado.
      return
    }

    const resposta = await processarMensagem(whatsapp, texto, historico)

    // Reconfere fresh: o corretor pode ter assumido a conversa nos segundos
    // entre o início do processamento e a resposta do LLM. Não elimina a
    // corrida por completo, mas encolhe a janela.
    const { data: leadFresh } = await supabase
      .from('leads')
      .select('atendimento_humano_ativo')
      .eq('id', lead.id)
      .single()

    if (leadFresh?.atendimento_humano_ativo) return

    const enviado = await enviarMensagem(whatsapp, resposta)

    // Só loga como "saída" o que realmente foi entregue (mesmo gate que o
    // cron de follow-up já usa) — evita bolha fantasma na caixa de entrada.
    if (enviado) {
      await supabase.from('interacoes').insert({
        lead_id: lead.id,
        canal: 'whatsapp',
        direcao: 'saida',
        mensagem: resposta,
        processado_por_ia: true,
      })
    }

    if (lead.requer_atencao) {
      await enviarAlertaEscalada(whatsapp, lead.nome, lead.lead_score)
      await supabase
        .from('leads')
        .update({ requer_atencao: false })
        .eq('id', lead.id)
    }

  } catch (err) {
    console.error('[processarEResponder]', whatsapp, err)
  }
}
