import type { SupabaseClient } from '@supabase/supabase-js'
import { filtrarLeadsPorSegmento, parseSegmento, type LeadParaSegmento } from '@/lib/campanhas/segmento'
import { montarHtml, buildUnsubscribeUrl } from '@/lib/cron/email-followup-helpers'
import { enviarEmailResend } from '@/lib/email/resend'

// Lógica de envio de campanha compartilhada entre a rota manual
// (/api/admin/campanhas/[id]/enviar, clique de "Enviar agora"/"Continuar
// envio") e o cron de agendamento (/api/cron/campanhas-agendadas) — as duas
// pontas processam exatamente do mesmo jeito, só quem dispara é diferente.

const LOTE = 50 // ~50 * 600ms de throttle + rede cabe com folga em maxDuration=60s

export type ResultadoProcessamento =
  | { ok: false; status: 400 | 404; error: string }
  | { ok: true; enviados: number; erros: number; restantes: number; statusFinal: string | null }

type LeadEnvio = LeadParaSegmento & { nome: string | null; property_id: string | null; property_name: string | null }

async function resolverNomeEmpreendimento(supabase: SupabaseClient, lead: LeadEnvio): Promise<string> {
  if (lead.property_name) return lead.property_name
  if (lead.property_id) {
    const { data } = await supabase.from('properties').select('nome').eq('id', lead.property_id).maybeSingle()
    if (data?.nome) return data.nome
  }
  return 'nosso empreendimento'
}

export async function processarEnvioCampanha(supabase: SupabaseClient, id: string): Promise<ResultadoProcessamento> {
  const { data: campanha, error: campanhaErr } = await supabase.from('campanhas').select('*').eq('id', id).single()
  if (campanhaErr || !campanha) return { ok: false, status: 404, error: 'Campanha não encontrada' }
  if (campanha.status === 'enviada') return { ok: false, status: 400, error: 'Campanha já foi enviada.' }

  // Bootstrap: primeira vez que esta campanha é processada (rascunho ou
  // agendada). Transição ATÔMICA rascunho/agendada→enviando: o `.eq('status', ...)`
  // dentro do update garante que só QUEM CONSEGUIR mudar o status de verdade
  // é quem monta a lista de destinatários — se duas requisições chegarem
  // juntas (clique duplo, ou o cron de agendamento rodando ao mesmo tempo de
  // um clique manual em "Enviar agora"), só uma delas recebe uma row de volta
  // em `transicao`; a outra cai direto pro processamento de pendentes abaixo
  // sem nunca montar o público duas vezes.
  if (campanha.status === 'rascunho' || campanha.status === 'agendada') {
    const { data: transicao, error: transErr } = await supabase
      .from('campanhas')
      .update({ status: 'enviando' })
      .eq('id', id)
      .eq('status', campanha.status)
      .select('id')

    if (transErr) return { ok: false, status: 400, error: transErr.message }

    if (transicao && transicao.length > 0) {
      const segmento = parseSegmento(campanha.segmento)
      const { data: leads, error: leadsErr } = await supabase
        .from('leads')
        .select('id, email, estagio_funil, temperatura, origem, cidade_interesse, unsubscribed_at, nome, property_id, property_name')
        .not('email', 'is', null)
      if (leadsErr) {
        await supabase.from('campanhas').update({ status: campanha.status }).eq('id', id)
        return { ok: false, status: 400, error: leadsErr.message }
      }

      const correspondentes = filtrarLeadsPorSegmento((leads ?? []) as LeadEnvio[], segmento) as LeadEnvio[]
      if (correspondentes.length === 0) {
        // reverte — não deixa a campanha travada em 'enviando' sem ninguém pra processar
        await supabase.from('campanhas').update({ status: campanha.status }).eq('id', id)
        return { ok: false, status: 400, error: 'Nenhum lead corresponde ao segmento selecionado.' }
      }

      const linhas = correspondentes.map((l) => ({ campanha_id: id, lead_id: l.id, email: l.email!, status: 'pendente' }))
      const { error: insErr } = await supabase.from('campanha_destinatarios').insert(linhas)
      if (insErr) return { ok: false, status: 400, error: insErr.message }
    }
  }

  // Processa um lote de pendentes (idempotente — cada chamada só avança o
  // que ainda não foi tentado, seguro pra clicar de novo após um timeout).
  //
  // O SELECT abaixo só decide QUAIS ids tentar claimar — não é o que garante
  // exclusividade. A exclusividade vem do UPDATE logo depois: duas
  // invocações concorrentes (cron de agendamento rodando junto de um clique
  // manual em "Continuar envio", ou o próprio cron duplicado por retry da
  // Vercel) podem selecionar os MESMOS ids aqui, mas o
  // `.update(...).eq('status','pendente')` só afeta — e só devolve via
  // `.select()` — as linhas que AINDA estavam 'pendente' no exato momento do
  // UPDATE. Postgres serializa updates concorrentes na mesma linha: a segunda
  // invocação sempre perde a corrida e recebe 0 linhas pra essa parte do
  // lote, em vez de reenviar e-mail duplicado.
  const { data: candidatos, error: candErr } = await supabase
    .from('campanha_destinatarios')
    .select('id')
    .eq('campanha_id', id)
    .eq('status', 'pendente')
    .limit(LOTE)
  if (candErr) return { ok: false, status: 400, error: candErr.message }

  let pendentes: { id: string; lead_id: string; email: string }[] = []
  if (candidatos && candidatos.length > 0) {
    const { data: claimados, error: claimErr } = await supabase
      .from('campanha_destinatarios')
      .update({ status: 'enviando' })
      .in('id', candidatos.map((c) => c.id))
      .eq('status', 'pendente')
      .select('id, lead_id, email')
    if (claimErr) return { ok: false, status: 400, error: claimErr.message }
    pendentes = claimados ?? []
  }

  let enviados = 0
  let erros = 0

  for (const dest of pendentes) {
    const { data: lead } = await supabase
      .from('leads')
      .select('id, nome, property_id, property_name')
      .eq('id', dest.lead_id)
      .maybeSingle()

    const primeiroNome = (lead?.nome ?? '').split(' ')[0] || 'tudo bem'
    const nomeEmpreendimento = lead
      ? await resolverNomeEmpreendimento(supabase, { ...lead, id: dest.lead_id } as LeadEnvio)
      : 'nosso empreendimento'

    const substituir = (txt: string) => txt.replace(/{nome}/g, primeiroNome).replace(/{empreendimento}/g, nomeEmpreendimento)
    const unsubUrl = buildUnsubscribeUrl(dest.lead_id)

    const resultado = await enviarEmailResend({
      to: dest.email,
      subject: substituir(campanha.assunto),
      html: montarHtml(substituir(campanha.corpo_html), unsubUrl),
      headers: {
        'List-Unsubscribe': `<${unsubUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })

    if (resultado.ok) {
      enviados++
      await supabase.from('campanha_destinatarios').update({
        status: 'enviado', resend_message_id: resultado.id ?? null, enviado_em: new Date().toISOString(),
      }).eq('id', dest.id)
    } else {
      erros++
      await supabase.from('campanha_destinatarios').update({ status: 'erro' }).eq('id', dest.id)
    }

    await new Promise((r) => setTimeout(r, 600))
  }

  const { count: restantes } = await supabase
    .from('campanha_destinatarios')
    .select('id', { count: 'exact', head: true })
    .eq('campanha_id', id)
    .eq('status', 'pendente')

  let statusFinal: string | null = null
  if (!restantes) {
    const { count: totalEnviado } = await supabase
      .from('campanha_destinatarios')
      .select('id', { count: 'exact', head: true })
      .eq('campanha_id', id)
      .eq('status', 'enviado')
    statusFinal = totalEnviado && totalEnviado > 0 ? 'enviada' : 'erro'
    await supabase.from('campanhas').update({ status: statusFinal, enviada_em: new Date().toISOString() }).eq('id', id)
  }

  return { ok: true, enviados, erros, restantes: restantes ?? 0, statusFinal }
}
