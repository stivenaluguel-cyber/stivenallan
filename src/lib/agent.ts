import OpenAI from 'openai'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization - evita erro de build quando env vars nao estao presentes
let _openai: OpenAI | null = null
let _supabase: SupabaseClient<any, any, any> | null = null

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    })
  }
  return _openai
}

function getSupabase(): SupabaseClient<any, any, any> {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _supabase
}

// ============================================
// SYSTEM PROMPT MASTER - Allan IA
// ============================================
const SYSTEM_PROMPT = `Voce e Allan IA, o assistente digital exclusivo de Stiven Allan, corretor de imoveis CRECI 60.275,
especializado em lancamentos e empreendimentos de construtoras em Criciuma/SC e regiao sul de Santa Catarina.

IDENTIDADE
Voce nao e um chatbot generico. Voce e um consultor imobiliario de alto nivel operando via WhatsApp.
Se perguntado, diga que e o assistente digital do Stiven.

TONALIDADE
- Profissional mas acessivel. Nunca robotico.
- Max 4 paragrafos por mensagem.
- Nunca bullet points no WhatsApp.
- Max 1 emoji por mensagem.
- Nunca comece com "Claro!", "Otimo!", "Perfeito!"
- Nunca cite valores sem consultar buscar_empreendimentos().

FLUXO DE QUALIFICACAO
Faca max 1 pergunta por mensagem. Ordem recomendada:
1. Nome
2. O que busca (tipo de imovel, quartos)
3. Orcamento aproximado
4. Prazo para compra
5. Cidade/bairro de preferencia
6. Forma de pagamento (financiamento/a vista)

REGRAS CRITICAS
- Dados do banco > memoria do agente. Sempre.
- Nunca prometa desconto sem Stiven.
- Max 2 mensagens seguidas sem aguardar resposta.
- Nunca mencione outros corretores ou imobiliarias.
- Foco 100% em lancamentos de construtoras (nao imoveis de terceiros).
- Ao qualificar lead, sempre registrar no CRM via atualizar_lead().
- Empreendimentos disponiveis: Monte Leone, Lavis, Pineto, Hub Smart Home (todos Fontana em Criciuma).
`

// ============================================
// TOOLS DEFINITION
// ============================================
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'buscar_empreendimentos',
      description: 'Busca empreendimentos disponiveis no banco. Use sempre antes de citar precos ou disponibilidade.',
      parameters: {
        type: 'object',
        properties: {
          cidade: { type: 'string', description: 'Cidade (ex: Criciuma)' },
          suites_min: { type: 'number', description: 'Numero minimo de suites' },
          preco_max: { type: 'number', description: 'Preco maximo em reais' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'atualizar_lead',
      description: 'Atualiza ou cria lead no CRM com dados coletados na conversa.',
      parameters: {
        type: 'object',
        properties: {
          whatsapp: { type: 'string', description: 'Numero WhatsApp do lead' },
          nome: { type: 'string' },
          perfil: { type: 'string', enum: ['investidor', 'morar', 'nao_identificado'] },
          orcamento_min: { type: 'number' },
          orcamento_max: { type: 'number' },
          prazo_compra: { type: 'string', enum: ['imediato', '3_meses', '6_meses', '1_ano', 'sem_prazo'] },
          estagio_funil: { type: 'string', enum: ['novo', 'qualificando', 'interessado', 'visita_agendada', 'proposta', 'fechado', 'perdido'] },
          empreendimento_interesse: { type: 'string' },
          lead_score: { type: 'number', minimum: 0, maximum: 100 },
          observacoes_ia: { type: 'string' },
        },
        required: ['whatsapp'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'agendar_visita',
      description: 'Agenda visita ao decorado de um empreendimento.',
      parameters: {
        type: 'object',
        properties: {
          lead_whatsapp: { type: 'string' },
          empreendimento_slug: { type: 'string' },
          data_preferencia: { type: 'string', description: 'Data preferida no formato YYYY-MM-DD' },
          horario_preferencia: { type: 'string', description: 'Horario preferido (ex: 14:00)' },
        },
        required: ['lead_whatsapp', 'empreendimento_slug'],
      },
    },
  },
]

// ============================================
// TOOL EXECUTORS
// ============================================
async function executarTool(nome: string, args: Record<string, unknown>, whatsapp: string): Promise<string> {
  const supabase = getSupabase()

  if (nome === 'buscar_empreendimentos') {
    let query = supabase
      .from('empreendimentos')
      .select('nome, slug, cidade, bairro, preco_a_partir_de, preco_ate, area_privativa_min, area_privativa_max, status_venda, descricao_curta')
      .eq('status_venda', 'ativo')

    if (args.cidade) query = query.ilike('cidade', `%${args.cidade}%`)
    if (args.preco_max) query = query.lte('preco_a_partir_de', args.preco_max)

    const { data } = await query.limit(5)
    if (!data || data.length === 0) return 'Nenhum empreendimento encontrado com esses filtros.'

    return data.map(e =>
      `${e.nome} | ${e.cidade}/${e.bairro} | R$ ${e.preco_a_partir_de?.toLocaleString('pt-BR')} a R$ ${e.preco_ate?.toLocaleString('pt-BR')} | ${e.area_privativa_min}-${e.area_privativa_max}m2 | Status: ${e.status_venda}`
    ).join('\n')
  }

  if (nome === 'atualizar_lead') {
    const leadData = {
      whatsapp,
      ...args,
      ultimo_contato: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .eq('whatsapp', whatsapp)
      .single()

    if (existing) {
      await supabase.from('leads').update(leadData).eq('whatsapp', whatsapp)
      return 'Lead atualizado no CRM.'
    } else {
      await supabase.from('leads').insert({ ...leadData, created_at: new Date().toISOString() })
      return 'Lead criado no CRM.'
    }
  }

  if (nome === 'agendar_visita') {
    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('whatsapp', args.lead_whatsapp)
      .single()

    if (!lead) return 'Lead nao encontrado. Registre o lead primeiro.'

    await supabase.from('agendamentos').insert({
      lead_id: lead.id,
      empreendimento_slug: args.empreendimento_slug,
      data_preferencia: args.data_preferencia,
      horario_preferencia: args.horario_preferencia,
      status: 'pendente',
      created_at: new Date().toISOString(),
    })

    await supabase.from('leads').update({
      estagio_funil: 'visita_agendada',
      updated_at: new Date().toISOString(),
    }).eq('whatsapp', whatsapp)

    return 'Visita agendada com sucesso. Stiven sera notificado.'
  }

  return 'Tool nao reconhecida.'
}

// ============================================
// AGENT MAIN FUNCTION
// ============================================
export interface MensagemChat {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function processarMensagem(
  whatsapp: string,
  mensagem: string,
  historico: MensagemChat[] = []
): Promise<string> {
  const openai = getOpenAI()

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...historico.map(m => ({ role: m.role, content: m.content } as OpenAI.Chat.Completions.ChatCompletionMessageParam)),
    { role: 'user', content: mensagem },
  ]

  let resposta = ''
  let iteracoes = 0

  while (iteracoes < 5) {
    iteracoes++

    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      tools,
      tool_choice: 'auto',
      max_tokens: 800,
      temperature: 0.7,
    })

    const choice = response.choices[0]

    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
      messages.push(choice.message)

      for (const toolCall of choice.message.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments)
        const resultado = await executarTool(toolCall.function.name, args, whatsapp)

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: resultado,
        })
      }
      continue
    }

    resposta = choice.message.content || 'Desculpe, nao consegui processar sua mensagem.'
    break
  }

  return resposta
}
