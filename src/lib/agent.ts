import OpenAI from 'openai'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { buscarConhecimentoRelevante, montarBlocoContexto } from '@/lib/leads/base-conhecimento'
import { registrarMudancaEstagio } from '@/lib/leads/registrar-mudanca-estagio'
import { ESTAGIOS_FUNIL } from '@/lib/dashboard/estagios'
import { logError } from '@/lib/log'
import type { Database } from '@/types/database.generated'

// Lazy initialization - evita erro de build quando env vars nao estao presentes
let _openai: OpenAI | null = null
let _supabase: SupabaseClient<Database> | null = null

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    })
  }
  return _openai
}

function getSupabase(): SupabaseClient<Database> {
  if (!_supabase) {
    _supabase = createClient<Database>(
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
`

// ============================================
// VOCABULARIO VALIDADO EM RUNTIME
// ============================================
// Fonte unica dos estagios: o JSON Schema entregue ao modelo é só uma
// sugestao — o modelo ainda pode inventar uma string fora do enum, entao
// tanto o schema quanto a validacao de runtime abaixo leem de
// ESTAGIOS_FUNIL (src/lib/dashboard/estagios.ts), a mesma fonte usada pelo
// Kanban do CRM. Isso é o que existe pra evitar a reincidencia do bug
// historico documentado no comentario daquele arquivo: o enum desta tool
// ficou fora de sincronia por anos sem ninguém notar.
const ESTAGIO_FUNIL_VALORES = ESTAGIOS_FUNIL.map(e => e.key)
const PERFIL_VALORES = ['investidor', 'morar', 'nao_identificado'] as const
const PRAZO_COMPRA_VALORES = ['imediato', '3_meses', '6_meses', '1_ano', 'sem_prazo'] as const

type PerfilLead = (typeof PERFIL_VALORES)[number]
type PrazoCompra = (typeof PRAZO_COMPRA_VALORES)[number]
type EstagioFunil = (typeof ESTAGIO_FUNIL_VALORES)[number]

function paraStringNaoVazia(valor: unknown): string | undefined {
  return typeof valor === 'string' && valor.trim() ? valor.trim() : undefined
}

function paraNumeroNaoNegativo(valor: unknown): number | undefined {
  return typeof valor === 'number' && Number.isFinite(valor) && valor >= 0 ? valor : undefined
}

function paraEnum<T extends string>(valor: unknown, valoresValidos: readonly T[]): T | undefined {
  if (typeof valor !== 'string') return undefined
  return valoresValidos.some(v => v === valor) ? (valor as T) : undefined
}

// properties.suites é texto livre no schema real, não um número — auditado
// diretamente em produção (distinct suites: "1", "2", "3", null, hoje), mas
// o formato de faixa ("1 a 2", "1/2" etc.) é um padrão comum de anúncio
// imobiliário que o schema permite e pode aparecer. Extrai o maior número
// presente no texto (o teto de suítes que o anúncio garante oferecer);
// undefined = "não dá pra determinar", nunca tratado como zero.
export function maximoSuitesTexto(valor: string | null): number | undefined {
  if (!valor) return undefined
  const numeros = valor.match(/\d+/g)
  if (!numeros || numeros.length === 0) return undefined
  const maximo = Math.max(...numeros.map(Number))
  return Number.isFinite(maximo) ? maximo : undefined
}

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/
const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

// data_hora em `agendamentos` e um unico timestamp obrigatorio — nao existe
// coluna separada de data/horario no schema real (ver PASSO 12 do relatorio
// desta tarefa). Sem os dois validos, nao ha valor honesto pra gravar.
function paraDataHora(dataPreferencia: unknown, horarioPreferencia: unknown): string | undefined {
  if (typeof dataPreferencia !== 'string' || !DATA_REGEX.test(dataPreferencia)) return undefined
  if (typeof horarioPreferencia !== 'string' || !HORA_REGEX.test(horarioPreferencia)) return undefined
  const iso = `${dataPreferencia}T${horarioPreferencia}:00`
  return Number.isNaN(new Date(iso).getTime()) ? undefined : iso
}

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
      // whatsapp NAO faz parte dos argumentos: a tool roda dentro de uma
      // conversa cujo numero canonico ja e conhecido pelo executor (mesmo
      // que o modelo tente informar outro, ele e sempre ignorado — ver
      // executarTool). Deixar o campo fora do schema evita que o modelo
      // tente preenche-lo.
      name: 'atualizar_lead',
      description: 'Atualiza ou cria lead no CRM com dados coletados na conversa. O WhatsApp do lead ja e conhecido pela conversa atual.',
      parameters: {
        type: 'object',
        properties: {
          nome: { type: 'string' },
          perfil: { type: 'string', enum: [...PERFIL_VALORES] },
          orcamento_min: { type: 'number' },
          orcamento_max: { type: 'number' },
          prazo_compra: { type: 'string', enum: [...PRAZO_COMPRA_VALORES] },
          estagio_funil: { type: 'string', description: 'Mesmo vocabulario das colunas do Kanban do CRM.', enum: ESTAGIO_FUNIL_VALORES },
          observacoes_ia: { type: 'string' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      // lead_whatsapp tambem foi removido pelo mesmo motivo do whatsapp em
      // atualizar_lead — a busca do lead usa exclusivamente o WhatsApp
      // canonico do executor.
      name: 'agendar_visita',
      description: 'Agenda visita ao decorado de um empreendimento. O WhatsApp do lead ja e conhecido pela conversa atual.',
      parameters: {
        type: 'object',
        properties: {
          empreendimento_slug: { type: 'string' },
          data_preferencia: { type: 'string', description: 'Data preferida no formato YYYY-MM-DD' },
          horario_preferencia: { type: 'string', description: 'Horario preferido no formato HH:MM (ex: 14:00)' },
        },
        required: ['empreendimento_slug'],
      },
    },
  },
]

// ============================================
// TOOL EXECUTORS
// ============================================
export async function executarTool(nome: string, args: Record<string, unknown>, whatsapp: string): Promise<string> {
  const supabase = getSupabase()

  if (nome === 'buscar_empreendimentos') {
    // properties é a tabela unificada em uso hoje (36 empreendimentos ativos,
    // auditado via SQL); a antiga 'empreendimentos' é legado com ~5 linhas
    // congeladas — nunca mais atualizada desde a migração
    // 0001_properties_unified.sql.
    let query = supabase
      .from('properties')
      .select('nome, slug, cidade, bairro, preco, exibir_preco, dormitorios, suites, metragem, status, descricao_curta')
      .eq('ativo', true)
      .eq('oculto', false)

    const cidade = paraStringNaoVazia(args.cidade)
    if (cidade !== undefined) query = query.ilike('cidade', `%${cidade}%`)
    const precoMax = paraNumeroNaoNegativo(args.preco_max)
    if (precoMax !== undefined) query = query.lte('preco', precoMax)
    const suitesMin = paraNumeroNaoNegativo(args.suites_min)
    const precisaFiltrarSuites = suitesMin !== undefined && suitesMin > 0

    // `suites` é armazenado como texto no schema real — um .gte() no banco
    // compararia como string ("10" < "2" lexicograficamente) e devolveria
    // resultado errado, além de não reconhecer faixas ("1 a 2"). Quando o
    // filtro de suítes está ativo, busca TODOS os candidatos que os filtros
    // do banco conseguem aplicar corretamente (ativo/oculto/cidade/preco) —
    // sem limit intermediário — e filtra suítes em memória antes de cortar
    // pros 5 finais. A base ativa tem 36 imóveis hoje (auditado em produção
    // via SQL), então buscar tudo é seguro; sem filtro de suítes, mantém o
    // limit(5) original direto no banco (não precisa buscar mais do que vai
    // usar).
    const { data, error } = await (precisaFiltrarSuites ? query : query.limit(5))

    if (error) {
      logError('agent.buscar_empreendimentos', 'falha ao consultar properties', error)
      return 'Não foi possível consultar os empreendimentos agora. Não informe disponibilidade ou preço sem nova consulta.'
    }

    let resultados = data ?? []
    if (precisaFiltrarSuites) {
      resultados = resultados.filter(e => {
        const maximo = maximoSuitesTexto(e.suites)
        return maximo !== undefined && maximo >= suitesMin
      })
    }
    resultados = resultados.slice(0, 5)

    if (resultados.length === 0) return 'Nenhum empreendimento encontrado com esses filtros.'

    return resultados.map(e => {
      const precoTxt = e.exibir_preco && e.preco ? `R$ ${Number(e.preco).toLocaleString('pt-BR')}` : 'Sob consulta'
      return `${e.nome} | ${e.cidade}/${e.bairro} | ${precoTxt} | ${e.dormitorios ?? '?'} dorm, ${e.suites ?? '?'} suites, ${e.metragem ?? '?'}m2 | Status: ${e.status ?? 'disponivel'}`
    }).join('\n')
  }

  if (nome === 'atualizar_lead') {
    // Whitelist explícita — nunca espalhar ...args no banco. lead_score NÃO
    // entra: já existe motor de score (src/lib/leads/score.ts) que recalcula
    // esse valor; deixar o modelo escrever nele direto criaria um número que
    // o próximo recálculo apaga sem avisar, ou pior, um número inventado que
    // nunca é recalculado se o motor não rodar pra esse lead.
    const update: Database['public']['Tables']['leads']['Update'] = {
      ultimo_contato: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const novoNome = paraStringNaoVazia(args.nome)
    if (novoNome !== undefined) update.nome = novoNome
    const perfil = paraEnum<PerfilLead>(args.perfil, PERFIL_VALORES)
    if (perfil !== undefined) update.perfil = perfil
    const orcamentoMin = paraNumeroNaoNegativo(args.orcamento_min)
    if (orcamentoMin !== undefined) update.orcamento_min = orcamentoMin
    const orcamentoMax = paraNumeroNaoNegativo(args.orcamento_max)
    if (orcamentoMax !== undefined) update.orcamento_max = orcamentoMax
    const prazoCompra = paraEnum<PrazoCompra>(args.prazo_compra, PRAZO_COMPRA_VALORES)
    if (prazoCompra !== undefined) update.prazo_compra = prazoCompra
    const estagioFunil = paraEnum<EstagioFunil>(args.estagio_funil, ESTAGIO_FUNIL_VALORES)
    if (estagioFunil !== undefined) update.estagio_funil = estagioFunil
    // empreendimento_interesse (FK pra `empreendimentos`, tabela legada —
    // não `properties`) foi removido da whitelist de propósito: não existe
    // hoje uma fonte legítima pra IA produzir um valor válido desse FK (o
    // slug que ela conhece via buscar_empreendimentos() vem de `properties`,
    // uma tabela sem ligação com `empreendimentos`). Mantê-lo exposto
    // arriscava uma FK violation que, dependendo do modo do Supabase,
    // poderia derrubar o UPDATE inteiro — inclusive os campos legítimos
    // coletados na mesma chamada. Resolver o vínculo real entre leads e
    // properties é item arquitetural separado; nenhum mapping foi inventado
    // aqui.
    const observacoesIa = paraStringNaoVazia(args.observacoes_ia)
    if (observacoesIa !== undefined) update.observacoes_ia = observacoesIa

    // .maybeSingle() (não .single()) distingue "0 linhas" (lead novo, sem
    // erro) de erro real de banco — .single() devolve o mesmo PGRST116 pros
    // dois casos, o que fazia erro de SELECT virar tentativa de INSERT às
    // cegas.
    const { data: existing, error: selectError } = await supabase
      .from('leads')
      .select('id')
      .eq('whatsapp', whatsapp)
      .maybeSingle()

    if (selectError) {
      logError('agent.atualizar_lead', 'falha ao consultar lead existente', selectError)
      return 'Não foi possível confirmar o cadastro do lead agora. Não informe ao cliente que os dados foram salvos.'
    }

    if (existing) {
      const { error: updateError } = await supabase.from('leads').update(update).eq('whatsapp', whatsapp)
      if (updateError) {
        logError('agent.atualizar_lead', 'falha ao atualizar lead', updateError)
        return 'Não foi possível salvar as informações agora. Não confirme ao cliente que os dados foram atualizados.'
      }
      return 'Lead atualizado no CRM.'
    }

    const { error: insertError } = await supabase.from('leads').insert({
      whatsapp,
      ...update,
      created_at: new Date().toISOString(),
    })
    if (insertError) {
      logError('agent.atualizar_lead', 'falha ao criar lead', insertError)
      return 'Não foi possível registrar o lead agora. Não confirme ao cliente que o cadastro foi criado.'
    }
    return 'Lead criado no CRM.'
  }

  if (nome === 'agendar_visita') {
    const empreendimentoSlug = paraStringNaoVazia(args.empreendimento_slug)
    if (!empreendimentoSlug) {
      return 'Não foi possível agendar: informe o empreendimento antes de confirmar a visita.'
    }

    const dataHora = paraDataHora(args.data_preferencia, args.horario_preferencia)
    if (!dataHora) {
      return 'Não foi possível agendar: peça ao cliente uma data (AAAA-MM-DD) e um horário (HH:MM) válidos antes de confirmar a visita.'
    }

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, estagio_funil')
      .eq('whatsapp', whatsapp)
      .maybeSingle()

    if (leadError) {
      logError('agent.agendar_visita', 'falha ao consultar lead', leadError)
      return 'Não foi possível confirmar o cadastro do lead agora. Não informe ao cliente que a visita foi agendada.'
    }
    if (!lead) return 'Lead não encontrado. Registre o lead primeiro.'

    // Sem FK real entre `agendamentos.empreendimento_id` (tabela legada
    // `empreendimentos`) e `properties` (ver comentário no insert abaixo),
    // então validar existência/disponibilidade aqui é a única garantia
    // possível de que o slug corresponde a um empreendimento real e ativo.
    const { data: propriedade, error: propriedadeError } = await supabase
      .from('properties')
      .select('id, nome')
      .eq('slug', empreendimentoSlug)
      .eq('ativo', true)
      .eq('oculto', false)
      .maybeSingle()

    if (propriedadeError) {
      logError('agent.agendar_visita', 'falha ao consultar empreendimento', propriedadeError)
      return 'Não foi possível confirmar o empreendimento agora. Não informe ao cliente que a visita foi agendada.'
    }
    if (!propriedade) return 'Empreendimento não encontrado ou indisponível. Confirme o nome antes de agendar.'

    // agendamentos.empreendimento_id referencia a tabela LEGADA
    // `empreendimentos` (Relationships no schema oficial), não `properties`
    // — as duas tabelas não têm coluna de ligação entre si, então não há
    // como popular esse FK a partir de um properties.slug sem risco de
    // gravar um valor inválido. O nome do empreendimento vai em
    // `observacoes` (texto livre), que é onde o corretor de fato vê a
    // informação hoje.
    const { error: insertError } = await supabase.from('agendamentos').insert({
      lead_id: lead.id,
      data_hora: dataHora,
      status: 'pendente',
      tipo: 'visita',
      observacoes: `Visita solicitada: ${propriedade.nome ?? empreendimentoSlug}`,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      logError('agent.agendar_visita', 'falha ao inserir agendamento', insertError)
      return 'Não foi possível registrar o agendamento agora. Não confirme a visita ao cliente.'
    }

    const estagioAntes = lead.estagio_funil
    // Handoff humano: atendimento_humano_ativo=true é o mesmo campo que o
    // painel usa quando o corretor assume a conversa manualmente (ver
    // src/app/api/webhook/whatsapp/route.ts) — setá-lo aqui faz o bot ficar
    // calado a partir de agora, exatamente a regra de negócio deste item
    // (IA conduz até agendar; depois disso, Stiven assume). Uma única
    // chamada .update() com os dois campos é atômica no Postgres — não
    // precisa de transação improvisada.
    const { error: updateError } = await supabase.from('leads').update({
      estagio_funil: 'visita_agendada',
      atendimento_humano_ativo: true,
      updated_at: new Date().toISOString(),
    }).eq('whatsapp', whatsapp)

    if (updateError) {
      logError('agent.agendar_visita', 'falha ao atualizar estágio após agendamento', updateError)
      return 'A visita foi registrada, mas a sincronização do estágio falhou. Não repita o agendamento; avise que o atendimento será escalado ao Stiven manualmente.'
    }

    if (estagioAntes !== 'visita_agendada') {
      await registrarMudancaEstagio(supabase, lead.id, estagioAntes ?? 'primeiro_contato', 'visita_agendada')
    }

    return 'Visita agendada com sucesso. O atendimento será direcionado ao Stiven.'
  }

  return 'Tool não reconhecida.'
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

  // Contexto de atendimentos anteriores (loop de auto-aprendizado, item 2) —
  // só acrescenta ao prompt base, nunca substitui. Falha de busca já
  // devolve [] internamente (ver base-conhecimento.ts), então isso nunca
  // atrasa nem derruba a resposta principal.
  const conhecimentoRelevante = await buscarConhecimentoRelevante(getSupabase(), mensagem)
  const systemPromptFinal = SYSTEM_PROMPT + montarBlocoContexto(conhecimentoRelevante)

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPromptFinal },
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
