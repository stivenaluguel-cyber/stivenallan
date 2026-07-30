import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractIp, isBotSubmission } from '@/lib/leads/anti-spam'
import { checkRateLimit } from '@/lib/leads/rate-limit'
import { normalizeEmail, normalizePhone, normalizeString } from '@/lib/leads/normalize'
import { notificarLeadNovo } from '@/lib/leads/notificar-lead-novo'
import { recalcularScoreLead } from '@/lib/leads/score-server'
import { resolverLeadDoEspelho } from '@/lib/unidades/lead-do-espelho'
import { planoDoJson, simular } from '@/lib/unidades/simular'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const SOURCE = 'api/espelho/simular'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

/**
 * POST /api/espelho/simular — o degrau de baixo do espelho.
 *
 * Reservar por 48h é um pedido alto para quem acabou de abrir a página. Pedir
 * a simulação é o passo natural: o cliente já está olhando a unidade e quer
 * saber quanto fica por mês. Em troca ele se identifica — e entra no Kanban
 * com o empreendimento e a unidade carimbados no card.
 *
 * Diferença para a reserva: NÃO trava estoque. Nenhuma unidade muda de estado
 * aqui; dez pessoas podem simular o mesmo apartamento no mesmo minuto.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    if (isBotSubmission(body)) return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })

    // Mais folgado que a reserva (3/min): simular não trava unidade, então o
    // limite existe contra abuso, não contra corrida por estoque.
    const rl = await checkRateLimit(extractIp(req), {
      identifier: 'espelho-simulacao',
      limit: 6,
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
    const entradaDesejada = Number.isFinite(Number(body.entrada)) ? Number(body.entrada) : null

    if (!unidadeId) return NextResponse.json({ error: 'Unidade não informada' }, { status: 400 })
    if (!nome) return NextResponse.json({ error: 'Informe seu nome' }, { status: 400 })
    if (!whatsapp || whatsapp.length < 10) {
      return NextResponse.json({ error: 'Informe um WhatsApp com DDD' }, { status: 400 })
    }

    const client = sb()

    const { data: unidade } = await client
      .from('empreendimentos_unidades')
      .select('id, unidade, bloco, valor_tabela, valor_promocional, plano_pagamento, empreendimento_id, empreendimentos(nome)')
      .eq('id', unidadeId)
      .maybeSingle()

    if (!unidade) return NextResponse.json({ error: 'Unidade não encontrada' }, { status: 404 })

    const plano = planoDoJson(unidade.plano_pagamento)
    const valor = Number(unidade.valor_promocional ?? unidade.valor_tabela ?? 0)
    const sim = plano ? simular(valor, plano, entradaDesejada) : null

    const empNome = (unidade.empreendimentos as { nome?: string } | null)?.nome ?? 'empreendimento'
    const rotulo = [unidade.bloco, unidade.unidade].filter(Boolean).join(' ')

    const r = await resolverLeadDoEspelho(client, {
      whatsapp,
      nome,
      email,
      empreendimentoId: unidade.empreendimento_id as string | null,
      empreendimentoNome: empNome,
      unidadeRotulo: rotulo,
      origem: 'simulacao',
      // Só conta como declaração quando a pessoa MEXEU no slider — a entrada
      // padrão da tabela é escolha da construtora, não dela.
      entradaDeclarada: sim && !sim.padraoDaTabela ? sim.entrada : null,
    })
    if (!r.ok) return NextResponse.json({ error: r.erro }, { status: 500 })

    // A timeline registra o que foi simulado, com os números. Sem isso o
    // corretor liga sem saber sobre qual condição a pessoa está pensando.
    const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const descricao = sim
      ? `Simulou a unidade ${rotulo} do ${empNome}: entrada ${brl(sim.entrada)} + ` +
        `${sim.parcelasQtd}x ${brl(sim.parcelaValor)}` +
        (sim.padraoDaTabela ? ' (condição da tabela)' : ' (entrada ajustada pelo cliente)')
      : `Pediu simulação da unidade ${rotulo} do ${empNome}`

    await client.from('leads_interacoes').insert({
      lead_id: r.leadId,
      tipo: 'simulacao',
      descricao,
    })

    // Histórico estruturado, para reabrir a simulação exatamente como foi
    // apresentada — a tabela crm_simulacoes já existe para isso.
    if (sim) {
      await client.from('crm_simulacoes').insert({
        lead_id: r.leadId,
        empreendimento_nome: empNome,
        valor_imovel: sim.valorTotal,
        entrada: sim.entrada,
        parcelas_qtd: sim.parcelasQtd,
        parcelas_valor: sim.parcelaValor,
        reforcos_qtd: sim.reforcosQtd,
        reforcos_valor: sim.reforcoValor,
        correcao: 'CUB/SC até a entrega, IGPM + 0,75% a.m. após',
        detalhes: { origem: 'espelho', unidade: rotulo, simulacao: sim },
      }).then(({ error }) => {
        if (error) logError(SOURCE, 'falha ao gravar crm_simulacoes', error, { leadId: r.leadId })
      })
    }

    notificarLeadNovo(client, {
      id: r.leadId,
      nome,
      origem: r.nasceuAgora ? 'espelho (simulação)' : 'espelho (simulação, lead existente)',
    }).catch((e) => logError(SOURCE, 'notificacao falhou', e))

    recalcularScoreLead(client, r.leadId).catch((e) => logError(SOURCE, 'score falhou', e))

    // O preço e o plano saem AQUI, não no payload anônimo: é o que a pessoa
    // ganha por se identificar.
    return NextResponse.json({
      ok: true,
      unidade: rotulo,
      empreendimento: empNome,
      valor,
      plano,
      simulacao: sim,
    }, { status: 201 })
  } catch (e) {
    logError(SOURCE, 'erro inesperado', e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
