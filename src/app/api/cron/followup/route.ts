import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { enviarFollowUp, enviarAlertaEscalada, verificarInstancia } from '@/lib/evolution'
import { logError, logInfo, logWarn } from '@/lib/log'
import { finishCronRun, startCronRun, type CronRunFinal } from '@/lib/cron/tracker'
import { podeEnviarAutomatico, automacaoProativaAtiva } from '@/lib/leads/whatsapp-envio-limite'
import { leadCasaNaRegra, executarAcao, type RegraAutomacao, type LeadParaRegra } from '@/lib/automacoes/regras'
import { sugerirConhecimentoDeConversasResolvidas } from '@/lib/leads/base-conhecimento-auto-sugestao'

export const dynamic = 'force-dynamic'

// Cron de follow-up por WhatsApp (Evolution API). Igual ao email-followup:
// guards operacionais (Evolution) ficam DENTRO do try pra que dias pulados
// por env ausente apareçam no histórico como status='skipped'.

const SOURCE = 'followup'
const CRON_NAME = 'followup'

// Mensagens de follow-up por estagio_funil e dias de espera entre passos.
// Fonte de verdade agora é o banco (automacao_whatsapp_mensagens /
// automacao_whatsapp_intervalos, editável em /dashboard/automacoes) — estes
// dois const abaixo viraram só o FALLBACK, usado se a leitura do banco falhar
// ou vier vazia (nunca deixar o cron mudo por um erro transitório ou um
// oops na tela de edição).
const MENSAGENS_FOLLOWUP_FALLBACK: Record<string, string[]> = {
  primeiro_contato: [
    'Oi {nome}! Aqui é o Stiven 😊 Recebi seu interesse no {empreendimento}. Já separei as plantas e as condições direto com a construtora — prefere que eu envie por aqui, ou marcamos 10 minutinhos para eu te mostrar o que cabe no seu plano?',
    'Oi {nome}! Uma informação importante sobre o {empreendimento}: quando a obra avança de fase, a tabela sobe. Se fizer sentido, te passo as condições de hoje, sem compromisso.',
    '{nome}, prometo que é minha última mensagem 😄 Se o momento não é agora, tudo bem. Quer que eu te avise quando houver novidade de obra ou condição especial no {empreendimento}? É só responder AVISA.',
  ],
  qualificado: [
    'Oi {nome}! Com base no seu perfil, tenho condicoes especiais para {empreendimento}. Podemos conversar hoje?',
    'Ola {nome}! Queria compartilhar uma novidade sobre {empreendimento} que pode te interessar muito.',
  ],
  interessado: [
    '{nome}, que tal agendarmos uma visita ao {empreendimento}? Tenho horarios disponiveis essa semana.',
    'Oi {nome}! Ainda pensando em {empreendimento}? Posso tirar qualquer duvida por aqui.',
  ],
  proposta_enviada: [
    '{nome}, voce teve chance de analisar a proposta do {empreendimento}? Fico a disposicao para tirar qualquer duvida.',
    'Oi {nome}! Queria saber se surgiu alguma duvida sobre a proposta. Posso agendar uma visita se preferir.',
  ],
  visita_agendada: [
    'Ola {nome}! Confirmando nossa visita ao {empreendimento}. Voce confirma presenca? Qualquer imprevisto me avisa.',
  ],
}

const INTERVALOS_FALLBACK = [1, 3, 7, 14]

type ConfigFollowUp = { mensagens: Record<string, string[]>; intervalos: number[] }

async function carregarConfigFollowUp(supabase: SupabaseClient): Promise<ConfigFollowUp> {
  const [{ data: msgsRows, error: msgsErr }, { data: intRows, error: intErr }] = await Promise.all([
    supabase.from('automacao_whatsapp_mensagens').select('estagio_funil, ordem, mensagem').order('ordem', { ascending: true }),
    supabase.from('automacao_whatsapp_intervalos').select('ordem, dias').order('ordem', { ascending: true }),
  ])

  let mensagens = MENSAGENS_FOLLOWUP_FALLBACK
  if (!msgsErr && msgsRows && msgsRows.length > 0) {
    const agrupado: Record<string, string[]> = {}
    for (const r of msgsRows as { estagio_funil: string; ordem: number; mensagem: string }[]) {
      agrupado[r.estagio_funil] = agrupado[r.estagio_funil] ?? []
      agrupado[r.estagio_funil].push(r.mensagem)
    }
    mensagens = agrupado
  } else if (msgsErr) {
    logWarn(SOURCE, 'automacao_whatsapp_mensagens indisponivel, usando fallback hardcoded', { db_message: msgsErr.message })
  }

  let intervalos = INTERVALOS_FALLBACK
  if (!intErr && intRows && intRows.length > 0) {
    intervalos = (intRows as { ordem: number; dias: number }[]).map((r) => r.dias)
  } else if (intErr) {
    logWarn(SOURCE, 'automacao_whatsapp_intervalos indisponivel, usando fallback hardcoded', { db_message: intErr.message })
  }

  return { mensagens, intervalos }
}

function getMensagemFollowUp(mensagens: Record<string, string[]>, estagio: string, tentativa: number, nome: string, empreendimento: string): string | null {
  const msgs = mensagens[estagio]
  if (!msgs || tentativa >= msgs.length) return null
  return msgs[tentativa]
    .replace(/{nome}/g, nome.split(' ')[0])
    .replace(/{empreendimento}/g, empreendimento)
}

type LeadRow = {
  id: string
  nome: string | null
  whatsapp: string
  estagio_funil: string
  tentativas_followup?: number | null
  empreendimento_interesse?: string | null
  property_id?: string | null
  property_name?: string | null
  lead_score?: number | null
}

async function processarLeadFollowUp(supabase: SupabaseClient, lead: LeadRow, config: ConfigFollowUp): Promise<
  { id: string; acao: 'mensagem_enviada' | 'escalado' | 'erro' | 'limite_atingido' | 'automacao_desativada' }
> {
  const {
    id,
    nome,
    whatsapp,
    estagio_funil,
    tentativas_followup = 0,
    empreendimento_interesse,
    property_id,
    property_name,
    lead_score = 0,
  } = lead

  let nomeEmpreendimento = property_name || 'nosso empreendimento'
  if (!property_name && property_id) {
    const { data: prop } = await supabase
      .from('properties')
      .select('nome')
      .eq('id', property_id)
      .maybeSingle()
    if (prop?.nome) nomeEmpreendimento = prop.nome
  } else if (!property_name && !property_id && empreendimento_interesse) {
    const { data: emp } = await supabase
      .from('empreendimentos')
      .select('nome')
      .eq('id', empreendimento_interesse)
      .single()
    if (emp) nomeEmpreendimento = emp.nome
  }

  const mensagem = getMensagemFollowUp(config.mensagens, estagio_funil, tentativas_followup ?? 0, nome ?? 'amigo', nomeEmpreendimento)

  // Sem mais mensagens — escalar para Stiven
  if (!mensagem) {
    await enviarAlertaEscalada(whatsapp, nome, lead_score ?? 0)
    await supabase.from('leads').update({
      requer_atencao: true,
      status: 'cold',
      observacoes_ia: 'Sequencia de follow-up esgotada sem resposta. Encaminhado para avaliacao manual.',
    }).eq('id', id)
    return { id, acao: 'escalado' as const }
  }

  // Interruptor mestre da automação proativa — checado ANTES do teto diário
  // de propósito: se está desligada, não vale a pena gastar uma query só
  // pra descobrir um limite que nem importa agora.
  if (!automacaoProativaAtiva()) {
    logWarn(SOURCE, 'automação proativa desativada (FOLLOWUP_AUTOMATICO_ATIVO), pulando lead', { leadId: id })
    return { id, acao: 'automacao_desativada' as const }
  }

  if (!(await podeEnviarAutomatico(supabase, id))) {
    logWarn(SOURCE, 'limite diário de envio automático atingido, pulando lead', { leadId: id })
    return { id, acao: 'limite_atingido' as const }
  }

  const enviado = await enviarFollowUp(whatsapp, mensagem)

  if (!enviado) {
    logError(SOURCE, 'evolution send failed', null, { leadId: id })
    return { id, acao: 'erro' as const }
  }

  const idxIntervalo = Math.min((tentativas_followup ?? 0) + 1, config.intervalos.length - 1)
  const proximoIntervalo = config.intervalos[idxIntervalo]
  const proximoFollowup = new Date()
  proximoFollowup.setDate(proximoFollowup.getDate() + proximoIntervalo)

  await supabase.from('interacoes').insert({
    lead_id: id,
    canal: 'whatsapp',
    direcao: 'saida',
    mensagem,
    processado_por_ia: true,
    intencao_detectada: 'follow_up_automatico',
  })

  await supabase.from('leads').update({
    tentativas_followup: (tentativas_followup ?? 0) + 1,
    ultimo_contato: new Date().toISOString(),
    proximo_followup: proximoFollowup.toISOString(),
  }).eq('id', id)

  return { id, acao: 'mensagem_enviada' as const }
}

// ============================================
// MOTOR DE REGRAS "SE/ENTÃO" (item 5) — roda dentro deste mesmo cron diário,
// não depende de haver leads pra follow-up nem é bloqueado por eles: são
// dois sistemas independentes compartilhando a mesma execução agendada
// (Vercel Hobby só permite os crons já cadastrados em vercel.json).
// ============================================

const LIMITE_CANDIDATOS_POR_REGRA = 200
const JANELA_DEDUP_HORAS = 20 // < 24h de propósito: cobre atraso/retry do cron sem re-executar no mesmo dia

function diasDesde(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000))
}

// Dias desde a ÚLTIMA mudança de etapa real (leads_interacoes.tipo=status_change),
// não leads.updated_at — esse campo é tocado por qualquer update (score, nota,
// etc), não só mudança de estágio, e daria falso positivo em "estagio_parado_dias".
async function calcularDiasNoEstagioAtual(supabase: SupabaseClient, leadId: string, updatedAtFallback: string | null): Promise<number | null> {
  const { data } = await supabase
    .from('leads_interacoes')
    .select('created_at')
    .eq('lead_id', leadId)
    .eq('tipo', 'status_change')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const desde = data?.created_at ?? updatedAtFallback
  return desde ? diasDesde(desde) : null
}

type LeadCandidatoRegra = {
  id: string
  nome: string | null
  whatsapp: string
  estagio_funil: string
  lead_score: number | null
  updated_at: string | null
  ultimo_contato: string | null
}

async function jaExecutouRegraHoje(supabase: SupabaseClient, regraId: string, leadId: string): Promise<boolean> {
  const desde = new Date(Date.now() - JANELA_DEDUP_HORAS * 60 * 60 * 1000).toISOString()
  const { count, error } = await supabase
    .from('automacao_regras_execucoes')
    .select('id', { count: 'exact', head: true })
    .eq('regra_id', regraId)
    .eq('lead_id', leadId)
    .gte('executado_em', desde)
  // Falha na checagem de dedup: mais seguro pular (não agir de novo por engano)
  // do que arriscar reenviar mensagem duplicada.
  if (error) return true
  return (count ?? 0) > 0
}

async function processarRegrasAutomacao(supabase: SupabaseClient): Promise<{ avaliados: number; executados: number }> {
  const { data: regrasRows, error } = await supabase
    .from('automacao_regras')
    .select('id, nome, ativo, gatilho_tipo, gatilho_params, filtro_estagio, acao_tipo, acao_params')
    .eq('ativo', true)

  if (error) {
    logWarn(SOURCE, 'automacao_regras indisponível, pulando motor de regras', { db_message: error.message })
    return { avaliados: 0, executados: 0 }
  }
  if (!regrasRows || regrasRows.length === 0) return { avaliados: 0, executados: 0 }

  let avaliados = 0
  let executados = 0

  for (const regra of regrasRows as RegraAutomacao[]) {
    const { data: candidatos, error: candErr } = await supabase
      .from('leads')
      .select('id, nome, whatsapp, estagio_funil, lead_score, updated_at, ultimo_contato')
      .not('whatsapp', 'is', null)
      .is('whatsapp_optout_at', null)
      .in('status', ['novo', 'ativo', 'qualificado'])
      .limit(LIMITE_CANDIDATOS_POR_REGRA)

    if (candErr || !candidatos) continue

    for (const lead of candidatos as LeadCandidatoRegra[]) {
      avaliados++

      if (regra.filtro_estagio && regra.filtro_estagio.length > 0 && !regra.filtro_estagio.includes(lead.estagio_funil)) {
        continue
      }

      const leadParaRegra: LeadParaRegra = {
        id: lead.id,
        estagio_funil: lead.estagio_funil,
        lead_score: lead.lead_score,
        // Só calcula com query extra quando o gatilho realmente precisa —
        // sem isso seria 1 query a mais por candidato mesmo pras regras que
        // nunca olham esse campo.
        diasNoEstagioAtual: regra.gatilho_tipo === 'estagio_parado_dias'
          ? await calcularDiasNoEstagioAtual(supabase, lead.id, lead.updated_at)
          : null,
        diasSemResposta: lead.ultimo_contato ? diasDesde(lead.ultimo_contato) : null,
      }

      if (!leadCasaNaRegra(leadParaRegra, regra)) continue
      if (await jaExecutouRegraHoje(supabase, regra.id, lead.id)) continue

      const ok = await executarAcao(
        supabase,
        { leadId: lead.id, whatsapp: lead.whatsapp, nome: lead.nome, leadScore: lead.lead_score },
        regra,
      )
      if (ok) {
        executados++
        await supabase.from('automacao_regras_execucoes').insert({ regra_id: regra.id, lead_id: lead.id })
      }
    }
  }

  logInfo(SOURCE, 'regras automacao summary', { avaliados, executados })
  return { avaliados, executados }
}

export async function GET(req: NextRequest) {
  // 1) Auth — sem persist
  const authHeader = req.headers.get('authorization')
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2) Envs Supabase — sem persist (não temos como)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Configuracao incompleta' }, { status: 503 })
  }

  // 3) Client + start do rastreio
  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const { runId, startedAt } = await startCronRun(supabase, CRON_NAME)

  let result: CronRunFinal | undefined

  try {
    // Guards Evolution — dias pulados por env ausente aparecem no histórico
    if (!process.env.EVOLUTION_API_URL || !process.env.EVOLUTION_API_KEY || !process.env.EVOLUTION_INSTANCE) {
      logWarn(SOURCE, 'skipped: envs Evolution ausentes')
      result = { status: 'skipped', motivo: 'EVOLUTION_API_URL / _API_KEY / _INSTANCE ausente' }
      return NextResponse.json({ skipped: true, motivo: result.motivo })
    }

    // Checa a instância UMA vez, antes de processar qualquer lead — sem isso,
    // uma instância desconectada gera o mesmo erro repetido por lead (achado
    // em produção: dias de falha silenciosa até alguém notar). Com a checagem
    // aqui, o motivo fica visível direto no histórico de /dashboard/cron.
    const instancia = await verificarInstancia()
    if (!instancia.ok) {
      logWarn(SOURCE, 'skipped: instância Evolution indisponível', { motivo: instancia.reason })
      result = { status: 'skipped', motivo: `Instância Evolution indisponível: ${instancia.reason}` }
      return NextResponse.json({ skipped: true, motivo: result.motivo })
    }

    const config = await carregarConfigFollowUp(supabase)

    const agora = new Date().toISOString()
    const { data: leads, error } = await supabase
      .from('leads')
      .select('id, nome, whatsapp, estagio_funil, tentativas_followup, empreendimento_interesse, property_id, property_name, lead_score')
      .lte('proximo_followup', agora)
      .eq('requer_atencao', false)
      .in('status', ['novo', 'ativo', 'qualificado'])
      .not('whatsapp', 'is', null)
      .is('whatsapp_optout_at', null)
      .limit(50)

    if (error) {
      logError(SOURCE, 'db select failed', error)
      result = { status: 'error', motivo: error.message ?? 'DB error' }
      return NextResponse.json({ error: 'DB error', details: error.message }, { status: 500 })
    }

    if (!leads || leads.length === 0) {
      const regrasResumo = await processarRegrasAutomacao(supabase)
      const baseConhecimentoResumo = await sugerirConhecimentoDeConversasResolvidas(supabase)
      const summary = { processados: 0, enviados: 0, escalados: 0, erros_envio: 0 }
      logInfo(SOURCE, 'run summary', summary)
      result = { status: 'ok', ...summary, details: { regras: regrasResumo, baseConhecimento: baseConhecimentoResumo } }
      return NextResponse.json({ message: 'Nenhum lead para follow-up.', processados: 0, regras: regrasResumo, baseConhecimento: baseConhecimentoResumo })
    }

    const resultados: Array<{ id: string; acao: 'mensagem_enviada' | 'escalado' | 'erro' | 'limite_atingido' | 'automacao_desativada' }> = []
    for (const lead of leads as LeadRow[]) {
      const resultado = await processarLeadFollowUp(supabase, lead, config)
      resultados.push(resultado)
      await new Promise((r) => setTimeout(r, 2000))
    }

    const regrasResumo = await processarRegrasAutomacao(supabase)
    const baseConhecimentoResumo = await sugerirConhecimentoDeConversasResolvidas(supabase)

    const enviados = resultados.filter((r) => r.acao === 'mensagem_enviada').length
    const escalados = resultados.filter((r) => r.acao === 'escalado').length
    const erros_envio = resultados.filter((r) => r.acao === 'erro').length
    const limite_atingido = resultados.filter((r) => r.acao === 'limite_atingido').length
    const automacao_desativada = resultados.filter((r) => r.acao === 'automacao_desativada').length
    const summary = { processados: leads.length, enviados, escalados, erros_envio, limite_atingido, automacao_desativada }
    logInfo(SOURCE, 'run summary', summary)
    result = {
      status: 'ok', processados: leads.length, enviados, erros_envio,
      details: { escalados, limite_atingido, automacao_desativada, regras: regrasResumo, baseConhecimento: baseConhecimentoResumo },
    }
    return NextResponse.json({ message: 'Follow-ups processados.', ...summary, regras: regrasResumo, baseConhecimento: baseConhecimentoResumo })
  } catch (err: unknown) {
    logError(SOURCE, 'run failed', err)
    result = { status: 'error', motivo: err instanceof Error ? err.message : String(err) }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  } finally {
    if (result) {
      await finishCronRun(supabase, runId, startedAt, result)
    }
  }
}
