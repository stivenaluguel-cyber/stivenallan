import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

// Lazy initialization - evita erro de build quando env vars nao estao presentes
let _openai: OpenAI | null = null
let _supabase: ReturnType<typeof createClient> | null = null

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _openai
}

function getSupabase(): ReturnType<typeof createClient> {
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

ESCALADA PARA STIVEN - chame atualizar_lead(requer_atencao=true) quando:
- Lead pede desconto ou condicao especial
- Lead compara com concorrente ou ja tem proposta
- Lead diz 'estou quase decidindo' ou similar
- Lead pede para falar com o corretor
- Lead investe acima de R$ 2 milhoes
- Sentimento negativo persistente (2+ mensagens)

LEAD SCORE - atualize via atualizar_lead() a cada interacao significativa:
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
`
// ============================================
// TOOL DEFINITIONS
// ============================================
const tools: OpenAI.Chat.ChatCompletionTool[] = [
  { type: 'function', function: { name: 'buscar_empreendimentos', description: 'Busca empreendimentos compativeis com o perfil do lead no banco', parameters: { type: 'object', properties: { orcamento_max: { type: 'number' }, dormitorios_min: { type: 'number' }, cidade: { type: 'string' }, status_obra: { type: 'string', enum: ['lancamento','em_obras','pronto'] } } } } },
  { type: 'function', function: { name: 'atualizar_lead', description: 'Atualiza perfil, estagio e score do lead', parameters: { type: 'object', required: ['lead_id'], properties: { lead_id: { type: 'string' }, nome: { type: 'string' }, perfil: { type: 'string', enum: ['investidor','moradia_propria','ambos','indefinido'] }, orcamento_min: { type: 'number' }, orcamento_max: { type: 'number' }, prazo_compra: { type: 'string' }, estagio: { type: 'string', enum: ['novo','qualificado','interessado','visita_agendada','proposta','negociacao','fechado','perdido','nurturing'] }, lead_score: { type: 'number' }, requer_atencao: { type: 'boolean' }, motivacao: { type: 'string' } } } } },
  { type: 'function', function: { name: 'criar_agendamento', description: 'Registra visita ou reuniao confirmada', parameters: { type: 'object', required: ['lead_id','empreendimento_id','data_hora'], properties: { lead_id: { type: 'string' }, empreendimento_id: { type: 'string' }, data_hora: { type: 'string' }, tipo: { type: 'string', enum: ['visita','videochamada','reuniao'] }, observacoes: { type: 'string' } } } } },
]
// ============================================
// TOOL EXECUTOR
// ============================================
async function executarFerramenta(nome: string, args: Record<string, unknown>) {
  const supabase = getSupabase()
  if (nome === 'buscar_empreendimentos') {
    let query = supabase.from('empreendimentos').select('id, nome, slug, cidade, bairro, status_obra, preco_a_partir_de, landing_page_url, descricao_curta, tipologias(dormitorios, suites, area_privativa_m2, preco_a_partir_de), construtoras(nome), diferenciais_empreendimento(descricao)').eq('status_venda', 'ativo').limit(3) as any
    if (args.orcamento_max) query = query.lte('preco_a_partir_de', args.orcamento_max)
    if (args.cidade) query = query.ilike('cidade', '%' + args.cidade + '%')
    if (args.status_obra) query = query.eq('status_obra', args.status_obra)
    const { data, error } = await query
    if (error) return { erro: error.message }
    return data ?? []
  }
  if (nome === 'atualizar_lead') {
    const { lead_id, ...updates } = args
    const { error } = await supabase.from('leads').update({ ...updates, ultimo_contato: new Date().toISOString() }).eq('id', lead_id)
    return error ? { erro: error.message } : { ok: true }
  }
  if (nome === 'criar_agendamento') {
    const { data, error } = await supabase.from('agendamentos').insert(args).select().single() as any
    if (!error) await supabase.from('leads').update({ estagio: 'visita_agendada' }).eq('id', args.lead_id)
    return error ? { erro: (error as any).message } : data
  }
  return { erro: 'Ferramenta nao encontrada' }
}
// ============================================
// MAIN: PROCESSAR MENSAGEM
// ============================================
export async function processarMensagem(whatsapp: string, texto: string): Promise<string> {
  const openai = getOpenAI()
  const supabase = getSupabase()

  const { data: lead } = await supabase
    .from('leads')
    .upsert({ whatsapp }, { onConflict: 'whatsapp' })
    .select()
    .single() as any

  if (!lead) throw new Error('Falha ao criar/buscar lead')

  const { data: historico } = await supabase
    .from('interacoes')
    .select('direcao, mensagem')
    .eq('lead_id', lead.id)
    .order('created_at', { ascending: false })
    .limit(30) as any

  const mensagensHistorico: OpenAI.Chat.ChatCompletionMessageParam[] = ((historico ?? []) as any[])
    .reverse()
    .map((m: any) => ({
      role: m.direcao === 'entrada' ? 'user' : 'assistant' as const,
      content: m.mensagem,
    }))

  await supabase.from('interacoes').insert({ lead_id: lead.id, canal: 'whatsapp', direcao: 'entrada', mensagem: texto, processado_por_ia: true })

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: 'CONTEXTO DO LEAD:\n' + JSON.stringify({ id: lead.id, nome: lead.nome, perfil: lead.perfil, estagio: lead.estagio, lead_score: lead.lead_score, orcamento_max: lead.orcamento_max }) },
    ...mensagensHistorico,
    { role: 'user', content: texto },
  ]

  let resposta = ''
  for (let i = 0; i < 5; i++) {
    const completion = await openai.chat.completions.create({ model: 'gpt-4o', messages, tools, tool_choice: 'auto', temperature: 0.7 })
    const choice = completion.choices[0]
    messages.push(choice.message)
    if (choice.finish_reason === 'stop') { resposta = choice.message.content ?? ''; break }
    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
      for (const call of choice.message.tool_calls) {
        const resultado = await executarFerramenta(call.function.name, JSON.parse(call.function.arguments))
        messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(resultado) })
      }
    }
  }

  if (!resposta) resposta = 'Desculpe, tive um problema tecnico. Tente novamente em instantes.'

  await supabase.from('interacoes').insert({ lead_id: lead.id, canal: 'whatsapp', direcao: 'saida', mensagem: resposta, processado_por_ia: true })

  return resposta
}
