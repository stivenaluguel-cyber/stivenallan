import { NextRequest, NextResponse } from 'next/server'
import { processarMensagem, type MensagemChat } from '@/lib/agent'
import { enviarMensagem, enviarAlertaEscalada } from '@/lib/evolution'
import { detectarPalavraChaveOptOut, MENSAGEM_CONFIRMACAO_OPTOUT } from '@/lib/leads/whatsapp-optout'
import { podeEnviarAutomatico } from '@/lib/leads/whatsapp-envio-limite'
import { classificarSentimento } from '@/lib/leads/sentimento'
import { autenticarWebhookEvolution } from '@/lib/leads/evolution-webhook-auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // Autenticação ANTES de qualquer leitura/alteração de lead — sem isso,
  // qualquer um que descubra a URL do webhook (previews da Vercel postam a
  // própria URL em comentário público de PR) conseguiria gerar leads falsos,
  // acionar a IA e disparar respostas em nome do corretor. Vale em TODO
  // ambiente, inclusive preview/development — não existe bypass por VERCEL_ENV
  // aqui de propósito, a autenticação é a mesma em qualquer lugar.
  const autenticado = autenticarWebhookEvolution({
    secretConfigurado: process.env.EVOLUTION_WEBHOOK_SECRET,
    authorizationHeader: req.headers.get('authorization'),
  })
  if (!autenticado) {
    // Nunca logar o header recebido nem o segredo esperado — só o fato de
    // ter sido rejeitado.
    console.warn('[webhook/whatsapp] autenticacao rejeitada')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    console.log('[webhook] event:', body.event, '| instance:', body.instance)

    // Filtrar apenas mensagens recebidas de usuarios reais
    if (body.event !== 'messages.upsert') {
      return NextResponse.json({ ok: true, ignorado: true })
    }

    const msg = body.data?.message
    const from = body.data?.key?.remoteJid
    const mid = body.data?.key?.id

    if (!msg || !from) return NextResponse.json({ ok: true })
    // Sem id estável não dá pra deduplicar reentrega — mais seguro ignorar
    // do que processar um evento que não conseguimos proteger contra retry.
    if (typeof mid !== 'string' || !mid) return NextResponse.json({ ok: true })
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

    processarEResponder(whatsapp, texto, mid).catch(console.error)

    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error('[webhook/whatsapp]', err)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}

async function processarEResponder(whatsapp: string, texto: string, mid: string) {
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
    // campo do lead é tocado quando ele já existe. É o único passo que
    // acontece ANTES da reserva do mid logo abaixo — necessário só porque
    // interacoes.lead_id precisa de um valor, e é seguro porque é puramente
    // idempotente (onConflict), não manda mensagem, não chama IA, não muda
    // estágio: não é um "efeito" de negócio, é resolver quem é o remetente.
    const { data: lead, error: upsertErr } = await supabase
      .from('leads')
      .upsert({ whatsapp }, { onConflict: 'whatsapp' })
      .select('id, nome, requer_atencao, lead_score, atendimento_humano_ativo, origem, created_at')
      .single()

    if (upsertErr || !lead) {
      console.error('[processarEResponder] falha ao resolver lead', whatsapp, upsertErr)
      return
    }

    // RESERVA do mid — o único portão que decide quem processa este evento.
    // Nenhum efeito (notificar lead novo, chamar IA, enviar WhatsApp, mudar
    // estágio, consumir teto diário, rodar automação) roda antes desta
    // linha. De propósito NÃO existe um SELECT antes desta tentativa:
    // "consultar → agir → inserir" tem uma janela de corrida real — duas
    // reentregas concorrentes podem passar no SELECT antes de qualquer uma
    // inserir. "Tentar inserir e ver o que volta" não tem essa janela: o
    // unique index (interacoes_mid_key, migração 20260731090000, mesmo
    // mecanismo do Instagram) é quem decide atomicamente, no banco, sem
    // depender de timing da aplicação.
    const { data: interacaoEntrada, error: reservaErr } = await supabase
      .from('interacoes')
      .insert({
        lead_id: lead.id,
        canal: 'whatsapp',
        direcao: 'entrada',
        mensagem: texto,
        mid,
      })
      .select('id')
      .single()

    if (reservaErr) {
      if (reservaErr.code === '23505') {
        // Perdeu a corrida pra outra invocação concorrente da mesma
        // reentrega (ou é uma reentrega horas depois de outra já
        // processada) — a linha do vencedor nunca é apagada nem sobrescrita
        // por este caminho, então o mid não volta a ficar disponível pra
        // reprocessamento acidental.
        console.log('[processarEResponder] evento duplicado (mid ja reservado), ignorando')
        return
      }
      // Falha não relacionada a duplicata (erro transitório de rede/DB) —
      // sem conseguir reservar o mid não dá pra garantir que não vai
      // duplicar em cima de um retry, então não segue pros efeitos.
      console.error('[processarEResponder] falha ao reservar mid', whatsapp, reservaErr)
      return
    }

    // A partir daqui, SOMENTE quem venceu a corrida pela reserva continua.

    // Lead que acabou de nascer neste upsert dispara a notificação — era a
    // única porta de entrada que não avisava ninguém: quem mandava mensagem
    // direto no WhatsApp ficava invisível até o corretor abrir o painel.
    // O upsert não diz se inseriu ou achou; created_at recém-carimbado diz.
    // Best-effort e fora do caminho da resposta: falha em notificar não pode
    // atrasar nem derrubar o atendimento da mensagem.
    const idadeMs = Date.now() - new Date(lead.created_at).getTime()
    if (Number.isFinite(idadeMs) && idadeMs >= 0 && idadeMs < 90_000) {
      const { notificarLeadNovo } = await import('@/lib/leads/notificar-lead-novo')
      notificarLeadNovo(supabase, { id: lead.id, nome: lead.nome, origem: lead.origem ?? 'whatsapp' })
        .catch((e) => console.error('[processarEResponder] notificacao falhou', e))
    }

    // Histórico ANTES de logar a mensagem atual (evita ter que filtrar a
    // própria mensagem de volta do resultado da query). A mensagem atual já
    // foi gravada acima (reserva do mid) — esta query só busca o que veio
    // antes dela.
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

    // Opt-out por palavra-chave (PARAR/STOP/SAIR/...) — verificado antes de
    // qualquer resposta automática. Uma única confirmação FIXA (não gerada
    // pela IA) e para por aqui: nenhuma automação futura manda mensagem pra
    // esse lead até ele escrever de novo por conta própria.
    if (detectarPalavraChaveOptOut(texto)) {
      await supabase
        .from('leads')
        .update({ whatsapp_optout_at: new Date().toISOString(), whatsapp_optout_motivo: 'pedido_via_whatsapp' })
        .eq('id', lead.id)

      const enviouConfirmacao = await enviarMensagem(whatsapp, MENSAGEM_CONFIRMACAO_OPTOUT)
      if (enviouConfirmacao) {
        await supabase.from('interacoes').insert({
          lead_id: lead.id,
          canal: 'whatsapp',
          direcao: 'saida',
          mensagem: MENSAGEM_CONFIRMACAO_OPTOUT,
          processado_por_ia: false,
          intencao_detectada: 'optout_confirmado',
        })
      }
      return
    }

    if (lead.atendimento_humano_ativo) {
      // Corretor assumiu a conversa manualmente pelo painel — bot fica calado.
      return
    }

    // Sentimento roda em paralelo com a geração da resposta — chamada extra
    // pequena e barata (sem tools), nunca atrasa o caminho principal e cai
    // em 'neutro' se falhar (ver classificarSentimento).
    const [resposta, sentimento] = await Promise.all([
      processarMensagem(whatsapp, texto, historico),
      classificarSentimento(texto),
    ])

    if (interacaoEntrada?.id) {
      await supabase.from('interacoes').update({ sentimento }).eq('id', interacaoEntrada.id)
    }

    // Reaproveita o mecanismo de escalada que já existe pra requer_atencao —
    // sentimento negativo/urgente também precisa acordar o Stiven, não só
    // score alto. Persiste already aqui (não só no flag local) pra não se
    // perder se algo falhar antes do bloco de alerta lá embaixo.
    const precisaEscalarPorSentimento = sentimento === 'negativo' || sentimento === 'urgente'
    if (precisaEscalarPorSentimento && !lead.requer_atencao) {
      await supabase.from('leads').update({ requer_atencao: true }).eq('id', lead.id)
    }

    // Reconfere fresh: o corretor pode ter assumido a conversa nos segundos
    // entre o início do processamento e a resposta do LLM. Não elimina a
    // corrida por completo, mas encolhe a janela.
    const { data: leadFresh } = await supabase
      .from('leads')
      .select('atendimento_humano_ativo')
      .eq('id', lead.id)
      .single()

    if (leadFresh?.atendimento_humano_ativo) return

    // Teto diário de mensagens automáticas por lead — protege contra bug de
    // loop/reenvio. A mensagem da IA já foi gerada e continua visível pro
    // corretor no painel (foi logada como 'entrada' a pergunta do lead);
    // só o envio automático fica em espera até o corretor assumir.
    if (!(await podeEnviarAutomatico(supabase, lead.id))) {
      console.warn('[processarEResponder] limite diário de envio automático atingido', whatsapp)
      return
    }

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

    if (lead.requer_atencao || precisaEscalarPorSentimento) {
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
