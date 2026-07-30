import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractIp, isBotSubmission } from '@/lib/leads/anti-spam'
import { checkRateLimit } from '@/lib/leads/rate-limit'
import { normalizeEmail, normalizePhone, normalizeString } from '@/lib/leads/normalize'
import { notificarLeadNovo } from '@/lib/leads/notificar-lead-novo'
import { recalcularScoreLead } from '@/lib/leads/score-server'
import { expiraEm, RESERVA_DURACAO_HORAS } from '@/lib/unidades/espelho'
import { resolverLeadDoEspelho } from '@/lib/unidades/lead-do-espelho'
import { enviarMensagem } from '@/lib/evolution'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const SOURCE = 'api/espelho/reservar'
// Mesmo número que src/lib/evolution.ts já usa no alerta de escalada.
const CORRETOR_WHATSAPP = '5548991642332'

function sb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Um comprador de verdade reserva uma unidade, no máximo duas ("estou entre a
// 302 e a 402"). Mais que isso é alguém travando o espelho — seja de má-fé ou
// por engano de clique.
const MAXIMO_RESERVAS_POR_LEAD = 2

/**
 * POST /api/espelho/reservar — reserva pública de unidade.
 *
 * É a única rota ANÔNIMA do sistema que altera estado comercial, então carrega
 * as três defesas do formulário público (honeypot, rate limit por IP, teto por
 * lead) mais uma quarta específica: o claim ATÔMICO.
 *
 * Sobre o claim: duas pessoas clicando na mesma unidade ao mesmo tempo é o caso
 * que importa. Em vez de ler-e-depois-escrever (que perde a corrida), o UPDATE
 * carrega o predicado "ainda está livre" dentro de si. Quem chega em segundo
 * recebe 0 linhas afetadas e vê "acabou de ser reservada" — não existe reserva
 * dupla.
 *
 * Reserva NÃO marca a unidade como vendida: só carimba `reservado_ate` no
 * futuro. Vencido o prazo, a unidade volta sozinha ao espelho (ver
 * statusDaUnidade — expiração é derivada na leitura, sem cron).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })

    if (isBotSubmission(body)) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    // Mais apertado que o formulário de contato (5/min): reservar é uma ação
    // que trava estoque, não um "quero saber mais".
    const rl = await checkRateLimit(extractIp(req), {
      identifier: 'espelho-reserva',
      limit: 3,
      windowSeconds: 60,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas, aguarde um instante' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } },
      )
    }

    const unidadeId = normalizeString(body.unidade_id)
    const nome = normalizeString(body.nome)
    const whatsapp = normalizePhone(body.telefone)
    const email = normalizeEmail(body.email)

    if (!unidadeId) return NextResponse.json({ error: 'Unidade não informada' }, { status: 400 })
    if (!nome) return NextResponse.json({ error: 'Informe seu nome' }, { status: 400 })
    if (!whatsapp || whatsapp.length < 10) {
      return NextResponse.json({ error: 'Informe um WhatsApp com DDD' }, { status: 400 })
    }

    const client = sb()
    const agora = new Date()
    const agoraIso = agora.toISOString()

    // Confere a unidade antes de qualquer escrita, só para poder devolver
    // mensagem específica ("já vendida" vs "já reservada") em vez de um erro
    // genérico. A garantia de corrida vem do UPDATE condicional lá embaixo.
    const { data: unidade } = await client
      .from('empreendimentos_unidades')
      .select('id, unidade, bloco, disponivel, reservado_ate, empreendimento_id, empreendimentos(nome)')
      .eq('id', unidadeId)
      .maybeSingle()

    if (!unidade) return NextResponse.json({ error: 'Unidade não encontrada' }, { status: 404 })
    if (unidade.disponivel === false) {
      return NextResponse.json({ error: 'Esta unidade já foi vendida' }, { status: 409 })
    }

    const empNome = (unidade.empreendimentos as { nome?: string } | null)?.nome ?? 'empreendimento'
    const rotulo = [unidade.bloco, unidade.unidade].filter(Boolean).join(' ')

    // Mesmo helper da simulação: resolve-ou-cria o lead E carimba o interesse
    // (empreendimento + unidade) nos campos que o Kanban desenha. Antes o lead
    // nascia sem isso e o corretor tinha que abrir a timeline para saber qual
    // apartamento a pessoa queria.
    const rLead = await resolverLeadDoEspelho(client, {
      whatsapp,
      nome,
      email,
      empreendimentoId: unidade.empreendimento_id as string | null,
      empreendimentoNome: empNome,
      unidadeRotulo: rotulo,
      origem: 'reserva',
    })
    if (!rLead.ok) return NextResponse.json({ error: rLead.erro }, { status: 500 })
    const lead = { id: rLead.leadId, nome, created_at: new Date().toISOString() }

    // Teto por lead, contando só reservas VIGENTES (as vencidas não contam —
    // mesma régua de expiração do resto do módulo).
    const { data: vigentes } = await client
      .from('empreendimentos_unidades')
      .select('id')
      .eq('lead_id_reserva', lead.id)
      .eq('disponivel', true)
      .gt('reservado_ate', agoraIso)

    const jaReservouEsta = (vigentes ?? []).some((u) => u.id === unidadeId)
    if (!jaReservouEsta && (vigentes ?? []).length >= MAXIMO_RESERVAS_POR_LEAD) {
      return NextResponse.json(
        { error: `Você já tem ${MAXIMO_RESERVAS_POR_LEAD} unidades reservadas. Fale com o corretor para seguir.` },
        { status: 409 },
      )
    }

    // ── Claim atômico ───────────────────────────────────────────────────
    // O predicado viaja DENTRO do UPDATE: só grava se a unidade continuar
    // disponível e sem reserva vigente — ou se a reserva vigente já for deste
    // mesmo lead (renovação do próprio prazo, não roubo de unidade alheia).
    const expira = expiraEm(agora)
    const { data: reservadas, error: erroClaim } = await client
      .from('empreendimentos_unidades')
      .update({ reservado_ate: expira, lead_id_reserva: lead.id, updated_at: agoraIso })
      .eq('id', unidadeId)
      .eq('disponivel', true)
      .or(`reservado_ate.is.null,reservado_ate.lt.${agoraIso},lead_id_reserva.eq.${lead.id}`)
      .select('id, unidade, bloco')

    if (erroClaim) {
      logError(SOURCE, 'falha no claim da unidade', erroClaim, { unidadeId, leadId: lead.id })
      return NextResponse.json({ error: 'Não foi possível registrar a reserva' }, { status: 500 })
    }

    // Zero linhas = outra pessoa ganhou a corrida entre a checagem e o UPDATE.
    if (!reservadas || reservadas.length === 0) {
      return NextResponse.json(
        { error: 'Esta unidade acabou de ser reservada por outra pessoa' },
        { status: 409 },
      )
    }

    // Rastro na timeline do lead: sem isso a reserva não aparece em lugar
    // nenhum do CRM e o corretor descobriria pelo espelho, sem contexto.
    await client.from('leads_interacoes').insert({
      lead_id: lead.id,
      tipo: 'reserva',
      descricao: `Reservou a unidade ${rotulo} do ${empNome} pelo site (válida por ${RESERVA_DURACAO_HORAS}h)`,
    })

    // Notificação e score são best-effort: a reserva já está gravada e não
    // pode ser desfeita por falha em avisar.
    const nascidoAgora = rLead.nasceuAgora
    // A mensagem para o CLIENTE sai pela rota de simulação, que roda antes
    // desta no mesmo fluxo e já carrega o valor e o plano. Duplicar aqui faria
    // a pessoa receber duas mensagens em sequência dizendo quase a mesma coisa.
    //
    // O que muda para o corretor é o peso: "quer a unidade" não é o mesmo que
    // "pediu simulação", e por isso este aviso vale mesmo dentro da janela.
    enviarMensagem(
      CORRETOR_WHATSAPP,
      `*Quer esta unidade — pelo site*\n\n${nome} · +${whatsapp}\n${empNome} · unidade ${rotulo}\n` +
      `Sinalizada por ${RESERVA_DURACAO_HORAS}h no sistema. Confirme a disponibilidade com a construtora.\n\n` +
      `https://wa.me/${whatsapp}`,
    ).catch((e) => logError(SOURCE, 'falha ao avisar o corretor', e))

    notificarLeadNovo(client, {
      id: lead.id,
      nome,
      origem: nascidoAgora ? 'espelho' : 'espelho (lead existente)',
    }, {
      naoRepetirPorMinutos: 15,
      tituloCustom: `Quer a unidade ${rotulo}: ${nome}`,
      corpoCustom: `${empNome}. Confirme a disponibilidade com a construtora.`,
    }).catch((e) => logError(SOURCE, 'notificacao falhou', e))

    recalcularScoreLead(client, lead.id).catch((e) => logError(SOURCE, 'score falhou', e))

    return NextResponse.json({
      ok: true,
      unidade: rotulo,
      empreendimento: empNome,
      reservado_ate: expira,
      horas: RESERVA_DURACAO_HORAS,
    }, { status: 201 })

  } catch (e) {
    logError(SOURCE, 'erro inesperado', e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
