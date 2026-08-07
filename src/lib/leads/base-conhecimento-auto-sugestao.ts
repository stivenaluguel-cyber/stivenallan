import type { SupabaseClient } from '@supabase/supabase-js'
import { getOpenAI } from '@/lib/agent'
import { logError, logWarn, tipoDeErro } from '@/lib/log'

// Estágios que sinalizam "essa conversa deu certo" — só delas vale a pena
// tirar um par pergunta/resposta reutilizável. Roda dentro do cron diário
// de follow-up (reaproveitando a cadência já existente, sem novo slot de
// cron no Vercel Hobby).
const ESTAGIOS_GATILHO = ['visita_agendada', 'fechado']
const LIMITE_LEADS_POR_RUN = 10
const SOURCE = 'base-conhecimento-auto-sugestao'

type MudancaEstagio = { lead_id: string | null; created_at: string }
type InteracaoWhatsapp = { direcao: string; mensagem: string }

async function gerarParConhecimento(interacoes: InteracaoWhatsapp[]): Promise<{ pergunta: string; resposta: string } | null> {
  const transcricao = interacoes
    .map((i) => (i.direcao === 'entrada' ? 'Lead: ' : 'Atendimento: ') + i.mensagem)
    .join('\n')
    .slice(0, 6000)

  try {
    const openai = getOpenAI()
    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'A partir da conversa de WhatsApp abaixo, que terminou bem (visita agendada ou negocio fechado), ' +
            'extraia UM par pergunta/resposta genérico e reutilizável pra ajudar a IA a responder situacoes ' +
            'parecidas no futuro (sem nomes proprios, enderecos ou dados pessoais do lead). ' +
            'Responda em JSON estrito no formato {"pergunta": "...", "resposta": "..."}. ' +
            'Se nao houver nada reutilizavel e genérico o bastante, responda {"pergunta": "", "resposta": ""}.',
        },
        { role: 'user', content: transcricao },
      ],
      max_tokens: 300,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const bruto = response.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(bruto) as { pergunta?: unknown; resposta?: unknown }
    const pergunta = typeof parsed.pergunta === 'string' ? parsed.pergunta.trim() : ''
    const resposta = typeof parsed.resposta === 'string' ? parsed.resposta.trim() : ''
    if (!pergunta || !resposta) return null

    return { pergunta: pergunta.slice(0, 500), resposta: resposta.slice(0, 2000) }
  } catch (err) {
    // `transcricao` (mensagens reais do lead) vai no corpo da chamada pro
    // LLM externo — mesmo cuidado de sentimento.ts: erro de API externa
    // pode ecoar um trecho do conteúdo enviado. Só o tipo do erro é seguro.
    logError(SOURCE, 'gerarParConhecimento falhou, pulando esse lead', undefined, {
      errorTipo: tipoDeErro(err),
      transcricaoLength: transcricao.length,
    })
    return null
  }
}

// Impuro por design (LLM + banco) — chamado 1x/dia pelo cron. Cada lead só
// gera no máximo UMA sugestão (checado por lead_id_origem); se o corretor
// rejeitar/apagar, ela não reaparece sozinha no próximo dia porque o lead
// não muda de estagio_funil de novo.
export async function sugerirConhecimentoDeConversasResolvidas(
  supabase: SupabaseClient,
): Promise<{ avaliados: number; sugeridos: number }> {
  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: mudancas, error } = await supabase
    .from('leads_interacoes')
    .select('lead_id, created_at')
    .eq('tipo', 'status_change')
    .in('estagio_para', ESTAGIOS_GATILHO)
    .gte('created_at', desde)
    .limit(LIMITE_LEADS_POR_RUN)

  if (error) {
    logWarn(SOURCE, 'leads_interacoes indisponível, pulando auto-sugestão', { db_message: error.message })
    return { avaliados: 0, sugeridos: 0 }
  }
  if (!mudancas || mudancas.length === 0) return { avaliados: 0, sugeridos: 0 }

  let avaliados = 0
  let sugeridos = 0
  const leadIdsProcessados = new Set<string>()

  for (const mudanca of mudancas as MudancaEstagio[]) {
    if (!mudanca.lead_id || leadIdsProcessados.has(mudanca.lead_id)) continue
    leadIdsProcessados.add(mudanca.lead_id)
    avaliados++

    const { count } = await supabase
      .from('base_conhecimento')
      .select('id', { count: 'exact', head: true })
      .eq('lead_id_origem', mudanca.lead_id)
    if ((count ?? 0) > 0) continue // já tem sugestão desse lead — não duplica

    const { data: interacoes } = await supabase
      .from('interacoes')
      .select('direcao, mensagem')
      .eq('lead_id', mudanca.lead_id)
      .eq('canal', 'whatsapp')
      .order('created_at', { ascending: true })
      .limit(30)

    if (!interacoes || interacoes.length < 2) continue

    const par = await gerarParConhecimento(interacoes as InteracaoWhatsapp[])
    if (!par) continue

    const { error: insErr } = await supabase.from('base_conhecimento').insert({
      pergunta: par.pergunta,
      resposta: par.resposta,
      origem: 'ia_sugerida',
      aprovado: false, // gate humano — nunca influencia respostas reais sem revisão
      ativo: true,
      lead_id_origem: mudanca.lead_id,
    })
    if (!insErr) sugeridos++
  }

  return { avaliados, sugeridos }
}
