import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================
// SYSTEM PROMPT MASTER — Allan IA
// ============================================
const SYSTEM_PROMPT = `
Voce e Allan IA, o assistente digital exclusivo de Stiven Allan, corretor de imoveis CRECI/RS 60.275,
especializado em lancamentos e empreendimentos de construtoras em Criciuma/SC e regiao sul de Santa Catarina.

IDENTIDADE
Voce nao e um chatbot generico. Voce e um consultor imobiliario de alto nivel operando via WhatsApp.
Nunca se apresente como inteligencia artificial ou robo. Se perguntado, diga que e o assistente digital do Stiven.

TOM
- Profissional, caloroso e direto. Frases curtas. Max 4 paragrafos por mensagem.
- Nunca use listas com traco ou asterisco. Escreva em texto corrido.
- Maximo 1 emoji por mensagem. Nunca comece com 'Claro!', 'Otimo!', 'Perfeito!'.
- Nunca repita a pergunta do usuario antes de responder.

FLUXO DE QUALIFICACAO (1 pergunta por vez, natural como conversa real)
1. Recebeu mensagem > cumprimenta > pede o nome se nao souber
2. Pergunta: moradia propria ou investimento?
3. Pergunta: qual faixa de investimento considera? (pode ser aproximado)
4. Pergunta: tem prazo em mente ou ainda em fase de pesquisa?
5. Chama buscar_empreendimentos() > apresenta o mais compativel > propoe agendamento

ESCALADA PARA STIVEN — chame atualizar_lead(requer_atencao=true) quando:
- Lead pede desconto ou condicao especial
- Lead compara com concorrente ou ja tem proposta
- Lead diz 'estou quase decidindo' ou similar
- Lead pede para falar com o corretor
- Lead investe acima de R$ 2 milhoes
- Sentimento negativo persistente (2+ mensagens)
Mensagem padrao: 'Entendido. Esse ponto merece atencao direta do Stiven. Vou avisar ele agora e ele entra em contato em instantes. ok'

LEAD SCORE — atualize via atualizar_lead() a cada interacao significativa:
+10 respondeu nome | +10 perfil definido | +15 orcamento informado
+15 orcamento compativel com portfolio | +10 prazo definido | +20 prazo imediato
+15 interesse em empreendimento especifico | +25 aceitou agendamento
-10 sentimento negativo em 2+ mensagens | -15 desistiu ou ja comprou

RESTRICOES
- Nunca cite valores sem consultar buscar_empreendimentos()
- Nunca prometa desconto sem Stiven
- Nunca mencione concorrentes
- Max 2 mensagens seguidas sem aguardar resposta
- Nunca colete CPF, RG ou dados bancarios
- Dados do banco > sua memoria. Sempre.

CORRETOR
Nome: Stiven Allan | CRECI/RS 60.275 | WhatsApp: +55 48 99145-5522
Atendimento humano: Seg-Sab 8h-20h
` as string

// ============================================
// TOOL DEFINITIONS
// ============================================
const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'buscar_empreendimentos',
      description: 'Busca empreendimentos compativeis com o perfil do lead no banco de dados',
      parameters: {
        type: 'object',
        properties: {
          orcamento_max:   { type: 'number', description: 'Orcamento maximo em reais' },
          dormitorios_min: { type: 'number', description: 'Minimo de dormitorios' },
          cidade:          { type: 'string', description: 'Cidade de interesse' },
          status_obra:     { type: 'string', enum: ['lancamento','em_obras','pronto'] },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'atualizar_lead',
      description: 'Atualiza perfil, estagio e score do lead apos cada interacao relevante',
      parameters: {
        type: 'object',
        required: ['lead_id'],
        properties: {
          lead_id:        { type: 'string' },
          nome:           { type: 'string' },
          perfil:         { type: 'string', enum: ['investidor','moradia_propria','ambos','indefinido'] },
          orcamento_min:  { type: 'number' },
          orcamento_max:  { type: 'number' },
          prazo_compra:   { type: 'string' },
          estagio:        { type: 'string', enum: ['novo','qualificado','interessado','visita_agendada','proposta','negociacao','fechado','perdido','nurturing'] },
          lead_score:     { type: 'number', description: 'Score 0-100 calculado pelas regras definidas' },
          requer_atencao: { type: 'boolean' },
          motivacao:      { type: 'string', description: 'Resumo do contexto e motivacao do lead para uso interno' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'criar_agendamento',
      description: 'Registra visita ou reuniao confirmada pelo lead',
      parameters: {
        type: 'object',
        required: ['lead_id', 'empreendimento_id', 'data_hora'],
        properties: {
          lead_id:           { type: 'string' },
          empreendimento_id: { type: 'string' },
          data_hora:         { type: 'string', description: 'ISO 8601' },
          tipo:              { type: 'string', enum: ['visita','videochamada','reuniao'] },
          observacoes:       { type: 'string' },
        },
      },
    },
  },
]

// ============================================
// TOOL EXECUTOR
// ============================================
async function executarFerramenta(nome: string, args: Record<string, unknown>) {
  if (nome === 'buscar_empreendimentos') {
    let query = supabase
      .from('empreendimentos')
      .select('id, nome, slug, cidade, bairro, status_obra, preco_a_partir_de, landing_page_url, descricao_curta, tipologias(dormitorios, suites, area_privativa_m2, preco_a_partir_de), construtoras(nome), diferenciais_empreendimento(descricao)')
      .eq('status_venda', 'ativo')
      .limit(3)

    if (args.orcamento_max)   query = query.lte('preco_a_partir_de', args.orcamento_max)
    if (args.cidade)          query = query.ilike('cidade', `%${args.cidade}%`)
    if (args.status_obra)     query = query.eq('status_obra', args.status_obra)

    const { data, error } = await query
    if (error) return { erro: error.message }
    return data ?? []
  }

  if (nome === 'atualizar_lead') {
    const { lead_id, ...updates } = args
    const { error } = await supabase
      .from('leads')
      .update({ ...updates, ultimo_contato: new Date().toISOString() })
      .eq('id', lead_id)
    return error ? { erro: error.message } : { ok: true }
  }

  if (nome === 'criar_agendamento') {
    const { data, error } = await supabase
      .from('agendamentos')
      .insert(args)
      .select()
      .single()
    if (!error) {
      await supabase
        .from('leads')
        .update({ estagio: 'visita_agendada' })
        .eq('id', args.lead_id)
    }
    return error ? { erro: error.message } : data
  }

  return { erro: 'Ferramenta nao encontrada' }
}

// ============================================
// MAIN: PROCESSAR MENSAGEM
// ============================================
export async function processarMensagem(whatsapp: string, texto: string): Promise<string> {
  // 1. Upsert do lead
  const { data: lead } = await supabase
    .from('leads')
    .upsert({ whatsapp }, { onConflict: 'whatsapp' })
    .select()
    .single()

  if (!lead) throw new Error('Falha ao criar/buscar lead')

  // 2. Historico (ultimas 30 mensagens)
  const { data: historico } = await supabase
    .from('interacoes')
    .select('tipo, conteudo')
    .eq('lead_id', lead.id)
    .order('created_at', { ascending: false })
    .limit(30)

  const mensagensHistorico: OpenAI.Chat.ChatCompletionMessageParam[] = (historico ?? [])
    .reverse()
    .map(m => ({
      role: m.tipo === 'recebida' ? 'user' : 'assistant' as const,
      content: m.conteudo,
    }))

  // 3. Salvar mensagem recebida
  await supabase.from('interacoes').insert({
    lead_id: lead.id,
    tipo: 'recebida',
    canal: 'whatsapp',
    conteudo: texto,
  })

  // 4. Montar contexto completo
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    // contexto silencioso do lead para o agente
    {
      role: 'system',
      content: `CONTEXTO ATUAL DO LEAD (uso interno, nao cite isso):\n${JSON.stringify({
        id: lead.id,
        nome: lead.nome,
        perfil: lead.perfil,
        estagio: lead.estagio,
        lead_score: lead.lead_score,
        orcamento_max: lead.orcamento_max,
        prazo_compra: lead.prazo_compra,
      })}`,
    },
    ...mensagensHistorico,
    { role: 'user', content: texto },
  ]

  // 5. Loop de tool calls
  let resposta = ''
  const maxIteracoes = 5
  let iteracao = 0

  while (iteracao < maxIteracoes) {
    iteracao++
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools,
      tool_choice: 'auto',
      temperature: 0.7,
    })

    const choice = completion.choices[0]
    messages.push(choice.message)

    if (choice.finish_reason === 'stop') {
      resposta = choice.message.content ?? ''
      break
    }

    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
      for (const call of choice.message.tool_calls) {
        const args = JSON.parse(call.function.arguments)
        const resultado = await executarFerramenta(call.function.name, args)
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(resultado),
        })
      }
    }
  }

  if (!resposta) resposta = 'Desculpe, tive um problema tecnico. Tente novamente em instantes.'

  // 6. Salvar resposta
  await supabase.from('interacoes').insert({
    lead_id: lead.id,
    tipo: 'enviada_bot',
    canal: 'whatsapp',
    conteudo: resposta,
  })

  return resposta
}
