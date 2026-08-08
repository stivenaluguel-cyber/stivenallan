import OpenAI from 'openai'
import { createHash } from 'crypto'
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

// crm_agenda.inicio é timestamptz — precisa de um instante UTC inequívoco,
// não um horário civil solto. A operação é toda em Santa Catarina
// (America/Sao_Paulo), que desde 2019 é UTC-03:00 fixo o ano inteiro (Brasil
// aboliu horário de verão) — então "somar 3 horas" é seguro e correto pra
// qualquer data deste sistema, sem precisar de biblioteca de timezone.
//
// A validação de calendário acontece ANTES de qualquer deslocamento de
// fuso: Date.UTC "rola" datas/horas inválidas (31 de fevereiro vira 3 de
// março; hora 24 vira meia-noite do dia seguinte) em vez de rejeitar — o
// round-trip abaixo (comparar os componentes UTC de volta contra o que foi
// pedido) é o jeito padrão de detectar isso sem depender de biblioteca
// externa de datas. Fazer essa checagem só com os componentes civis (sem o
// +3h) evita falso-negativo em horários como 23:30, que legitimamente viram
// o dia seguinte em UTC.
export function paraInstanteUtcAgendamento(dataPreferencia: unknown, horarioPreferencia: unknown): number | undefined {
  if (typeof dataPreferencia !== 'string' || !DATA_REGEX.test(dataPreferencia)) return undefined
  if (typeof horarioPreferencia !== 'string' || !HORA_REGEX.test(horarioPreferencia)) return undefined

  const [ano, mes, dia] = dataPreferencia.split('-').map(Number)
  const [hora, minuto] = horarioPreferencia.split(':').map(Number)

  const civilMs = Date.UTC(ano, mes - 1, dia, hora, minuto, 0, 0)
  const civil = new Date(civilMs)
  const calendarioValido =
    civil.getUTCFullYear() === ano &&
    civil.getUTCMonth() === mes - 1 &&
    civil.getUTCDate() === dia &&
    civil.getUTCHours() === hora &&
    civil.getUTCMinutes() === minuto
  if (!calendarioValido) return undefined

  return civilMs + 3 * 60 * 60 * 1000
}

// Só grava se o instante calculado for estritamente futuro no momento da
// chamada — Date.now() é lido aqui (não recebido por parâmetro) de
// propósito, pros testes usarem fake timers/system time do Vitest, igual a
// outros pontos do projeto que dependem de "agora".
export function paraDataHoraAgendamento(dataPreferencia: unknown, horarioPreferencia: unknown): string | undefined {
  const instanteMs = paraInstanteUtcAgendamento(dataPreferencia, horarioPreferencia)
  if (instanteMs === undefined) return undefined
  if (instanteMs <= Date.now()) return undefined
  return new Date(instanteMs).toISOString()
}

const TITULO_MAX = 200 // crm_agenda.titulo é varchar(200) — auditado via SQL antes de escrever isto.

function construirTituloVisita(propertyNome: string | null): string {
  const nome = propertyNome && propertyNome.trim() ? propertyNome.trim() : 'empreendimento'
  const titulo = `Visita · ${nome}`
  return titulo.length > TITULO_MAX ? titulo.slice(0, TITULO_MAX) : titulo
}

function construirLocalVisita(propriedade: { endereco: string | null; bairro: string | null; cidade: string | null }): string | null {
  if (propriedade.endereco && propriedade.endereco.trim()) return propriedade.endereco.trim()
  const partes = [propriedade.bairro, propriedade.cidade].filter((p): p is string => !!p && p.trim().length > 0)
  return partes.length > 0 ? partes.join(', ') : null
}

// Namespace fixo e arbitrário (só precisa ser estável entre execuções) pra
// gerar client_event_id determinístico via UUID v5 (RFC 4122) — SHA-1 de
// namespace+nome, nunca Math.random()/Date.now()/randomUUID(), que mudariam
// a cada retry e quebrariam a idempotência. A MESMA tripla
// lead+property+inicio sempre produz o MESMO UUID; mudar qualquer um dos
// três produz outro.
const AGENDA_IA_UUID_NAMESPACE = '2f3f5d2e-6d0f-5f2a-8f7a-1b6c9a2e7d4c'

export function gerarClientEventIdAgendaIA(leadId: string, propertyId: string, inicioUtcIso: string): string {
  const nome = `allan-agenda:v1:${leadId}:${propertyId}:${inicioUtcIso}`
  const namespaceBytes = Buffer.from(AGENDA_IA_UUID_NAMESPACE.replace(/-/g, ''), 'hex')
  const hash = createHash('sha1').update(Buffer.concat([namespaceBytes, Buffer.from(nome, 'utf8')])).digest()
  const bytes = Buffer.from(hash.subarray(0, 16))
  bytes[6] = (bytes[6] & 0x0f) | 0x50
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = bytes.toString('hex')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
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

    const inicioIso = paraDataHoraAgendamento(args.data_preferencia, args.horario_preferencia)
    if (!inicioIso) {
      return 'Não foi possível agendar: peça ao cliente uma data (AAAA-MM-DD) e um horário (HH:MM) válidos e futuros antes de confirmar a visita.'
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

    const { data: propriedade, error: propriedadeError } = await supabase
      .from('properties')
      .select('id, nome, slug, endereco, bairro, cidade')
      .eq('slug', empreendimentoSlug)
      .eq('ativo', true)
      .eq('oculto', false)
      .maybeSingle()

    if (propriedadeError) {
      logError('agent.agendar_visita', 'falha ao consultar empreendimento', propriedadeError)
      return 'Não foi possível confirmar o empreendimento agora. Não informe ao cliente que a visita foi agendada.'
    }
    if (!propriedade) return 'Empreendimento não encontrado ou indisponível. Confirme o nome antes de agendar.'

    // Idempotência determinística: a mesma intenção (lead+property+inicio)
    // sempre calcula o mesmo client_event_id, então um retry (webhook
    // repetido, timeout de rede) consulta e encontra o registro já criado
    // em vez de duplicar. Índice real: crm_agenda_client_event_id_unique
    // (UNIQUE parcial, WHERE client_event_id IS NOT NULL — auditado via
    // pg_indexes no Item 10A).
    const clientEventId = gerarClientEventIdAgendaIA(lead.id, propriedade.id, inicioIso)

    const { data: existente, error: existenteError } = await supabase
      .from('crm_agenda')
      .select('id, status, property_id, lead_id, inicio')
      .eq('client_event_id', clientEventId)
      .maybeSingle()

    if (existenteError) {
      logError('agent.agendar_visita', 'falha ao consultar idempotência da agenda', existenteError)
      return 'Não foi possível confirmar o agendamento agora. Não confirme a visita ao cliente.'
    }

    type AgendaEncontrada = { id: string; status: string | null; property_id: string | null; lead_id: string | null; inicio: string }
    let agenda: AgendaEncontrada | null = null

    if (existente) {
      // Retry idempotente de verdade só quando o evento ainda está ativo.
      // Se já foi cancelado/concluído/não-compareceu, reaproveitar a MESMA
      // linha pra uma "nova" visita seria mentir sobre o que realmente
      // aconteceu — melhor escalar do que criar essa ambiguidade.
      if (existente.status === 'agendado') {
        agenda = existente
      } else {
        return 'Já existe um registro anterior para esta visita que não está mais ativo. Escale ao Stiven antes de confirmar um novo agendamento.'
      }
    } else {
      const { data: inserida, error: insertError } = await supabase
        .from('crm_agenda')
        .insert({
          lead_id: lead.id,
          property_id: propriedade.id,
          client_event_id: clientEventId,
          titulo: construirTituloVisita(propriedade.nome),
          inicio: inicioIso,
          tipo: 'visita',
          status: 'agendado',
          local: construirLocalVisita(propriedade),
          descricao: 'Visita agendada pela Allan IA.',
          lembrete_min: 30,
        })
        .select('id, status, property_id, lead_id, inicio')
        .single()

      if (insertError) {
        if (insertError.code === '23505') {
          // Corrida real entre duas execuções simultâneas: o pré-check acima
          // não pegou porque as duas passaram por ele antes de qualquer
          // inserir. Recupera a linha que a outra execução acabou de criar —
          // nunca duplica, nunca finge que a corrida não aconteceu.
          const { data: recuperada, error: recuperadaError } = await supabase
            .from('crm_agenda')
            .select('id, status, property_id, lead_id, inicio')
            .eq('client_event_id', clientEventId)
            .maybeSingle()

          if (recuperadaError || !recuperada) {
            logError('agent.agendar_visita', 'corrida 23505 sem recuperacao da linha', recuperadaError ?? insertError)
            return 'Não foi possível confirmar o agendamento agora. Não confirme a visita ao cliente.'
          }
          agenda = recuperada
        } else {
          logError('agent.agendar_visita', 'falha ao inserir agenda', insertError)
          return 'Não foi possível registrar o agendamento agora. Não confirme a visita ao cliente.'
        }
      } else {
        agenda = inserida
      }
    }

    if (!agenda) {
      return 'Não foi possível registrar o agendamento agora. Não confirme a visita ao cliente.'
    }

    const estagioAntes = lead.estagio_funil
    // Handoff humano: atendimento_humano_ativo=true é o mesmo campo que o
    // painel usa quando o corretor assume a conversa manualmente (ver
    // src/app/api/webhook/whatsapp/route.ts) — setá-lo aqui faz o bot ficar
    // calado a partir de agora, exatamente a regra de negócio deste item
    // (IA conduz até agendar; depois disso, Stiven assume). Uma única
    // chamada .update() com os dois campos é atômica no Postgres — não
    // precisa de transação improvisada. .eq('id', lead.id) em vez de
    // whatsapp porque o lead já foi resolvido acima — mais preciso.
    const { error: updateError } = await supabase.from('leads').update({
      estagio_funil: 'visita_agendada',
      atendimento_humano_ativo: true,
      updated_at: new Date().toISOString(),
    }).eq('id', lead.id)

    if (updateError) {
      logError('agent.agendar_visita', 'falha ao atualizar estágio após agendamento', updateError)
      return 'A visita foi registrada, mas a sincronização do estágio falhou. Não repita o agendamento; avise que o atendimento será escalado ao Stiven manualmente.'
    }

    if (estagioAntes !== 'visita_agendada') {
      await registrarMudancaEstagio(supabase, lead.id, estagioAntes ?? 'primeiro_contato', 'visita_agendada')
    }

    return 'Visita registrada na agenda. O atendimento será direcionado ao Stiven.'
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
