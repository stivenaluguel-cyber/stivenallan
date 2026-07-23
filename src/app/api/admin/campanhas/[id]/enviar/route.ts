import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { filtrarLeadsPorSegmento, parseSegmento, type LeadParaSegmento } from '@/lib/campanhas/segmento'
import { montarHtml, buildUnsubscribeUrl } from '@/lib/cron/email-followup-helpers'
import { enviarEmailResend } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'
// Nenhuma rota do projeto declarava isso antes (rodando no default da
// Vercel) — o loop de envio com throttle de 600ms entre mensagens precisa
// de folga explícita pra não estourar o timeout padrão bem mais curto.
export const maxDuration = 60

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function auth() {
  const s = await cookies(); const t = s.get('dashboard_token')?.value; if (!t) return false
  try { await jwtVerify(t, new TextEncoder().encode(process.env.JWT_SECRET!)); return true } catch { return false }
}

const LOTE = 50 // ~50 * 600ms de throttle + rede cabe com folga em maxDuration=60s

type Params = { params: Promise<{ id: string }> }

type LeadEnvio = LeadParaSegmento & { nome: string | null; property_id: string | null; property_name: string | null }

async function resolverNomeEmpreendimento(supabase: SupabaseClient, lead: LeadEnvio): Promise<string> {
  if (lead.property_name) return lead.property_name
  if (lead.property_id) {
    const { data } = await supabase.from('properties').select('nome').eq('id', lead.property_id).maybeSingle()
    if (data?.nome) return data.nome
  }
  return 'nosso empreendimento'
}

export async function POST(_req: NextRequest, { params }: Params) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = sb()

  const { data: campanha, error: campanhaErr } = await supabase.from('campanhas').select('*').eq('id', id).single()
  if (campanhaErr || !campanha) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
  if (campanha.status === 'enviada') return NextResponse.json({ error: 'Campanha já foi enviada.' }, { status: 400 })

  // Bootstrap: primeira chamada (ainda rascunho) — resolve e congela o público.
  if (campanha.status === 'rascunho') {
    const segmento = parseSegmento(campanha.segmento)
    const { data: leads, error: leadsErr } = await supabase
      .from('leads')
      .select('id, email, estagio_funil, temperatura, origem, cidade_interesse, unsubscribed_at, nome, property_id, property_name')
      .not('email', 'is', null)
    if (leadsErr) return NextResponse.json({ error: leadsErr.message }, { status: 500 })

    const correspondentes = filtrarLeadsPorSegmento((leads ?? []) as LeadEnvio[], segmento) as LeadEnvio[]
    if (correspondentes.length === 0) {
      return NextResponse.json({ error: 'Nenhum lead corresponde ao segmento selecionado.' }, { status: 400 })
    }

    const linhas = correspondentes.map((l) => ({ campanha_id: id, lead_id: l.id, email: l.email!, status: 'pendente' }))
    const { error: insErr } = await supabase.from('campanha_destinatarios').insert(linhas)
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

    await supabase.from('campanhas').update({ status: 'enviando' }).eq('id', id)
  }

  // Processa um lote de pendentes (idempotente — cada chamada só avança o
  // que ainda não foi tentado, seguro pra clicar de novo após um timeout).
  const { data: pendentes, error: pendErr } = await supabase
    .from('campanha_destinatarios')
    .select('id, lead_id, email')
    .eq('campanha_id', id)
    .eq('status', 'pendente')
    .limit(LOTE)
  if (pendErr) return NextResponse.json({ error: pendErr.message }, { status: 500 })

  let enviados = 0
  let erros = 0

  for (const dest of pendentes ?? []) {
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

  if (!restantes) {
    const { count: totalEnviado } = await supabase
      .from('campanha_destinatarios')
      .select('id', { count: 'exact', head: true })
      .eq('campanha_id', id)
      .eq('status', 'enviado')
    await supabase.from('campanhas').update({
      status: totalEnviado && totalEnviado > 0 ? 'enviada' : 'erro',
      enviada_em: new Date().toISOString(),
    }).eq('id', id)
  }

  return NextResponse.json({
    mensagem: `Processados ${enviados + erros} (${enviados} enviados, ${erros} erros).${restantes ? ` ${restantes} restantes.` : ''}`,
    enviados,
    erros,
    restantes: restantes ?? 0,
  })
}
