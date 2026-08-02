import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizeEmail, normalizePhone, normalizeString } from '@/lib/leads/normalize'
import { extractIp, isBotSubmission } from '@/lib/leads/anti-spam'
import { checkRateLimit } from '@/lib/leads/rate-limit'
import { intencaoValida, tipoImovelValido } from '@/lib/proprietarios/pipeline'
import { criarAcumuladorParcial } from '@/lib/imoveis/normalizar'
import { logError, logWarn } from '@/lib/log'

export const dynamic = 'force-dynamic'

const SOURCE = 'api/proprietarios'

// Captura pública de PROPRIETÁRIO (quem quer vender ou alugar) — destino do
// formulário da campanha de captação. Rota separada de /api/leads de propósito:
// são funis diferentes, com pipeline, métrica e atendimento próprios. Ver o
// comentário em src/lib/proprietarios/pipeline.ts.
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  // Honeypot: mesma proteção do formulário de comprador.
  if (isBotSubmission(body)) {
    logWarn(SOURCE, 'submissão descartada pelo honeypot')
    // 200 de propósito: bot não deve aprender que foi detectado.
    return NextResponse.json({ success: true })
  }

  const rl = await checkRateLimit(extractIp(req), {
    identifier: 'proprietarios',
    limit: 5,
    windowSeconds: 60,
  })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente em instantes.' },
      { status: 429, headers: rl.retryAfter ? { 'Retry-After': String(rl.retryAfter) } : undefined },
    )
  }

  const b = body as Record<string, unknown>
  const nome = normalizeString(b.nome)
  const whatsapp = normalizePhone(b.whatsapp)

  if (!nome) return NextResponse.json({ error: 'Informe seu nome.' }, { status: 400 })
  if (!whatsapp) return NextResponse.json({ error: 'Informe um WhatsApp válido.' }, { status: 400 })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    logError(SOURCE, 'envs do Supabase ausentes')
    return NextResponse.json({ error: 'Configuração incompleta' }, { status: 503 })
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  // Vocabulário validado aqui além do CHECK do banco: erro de constraint
  // devolveria 500 opaco pro visitante em vez de dizer o que está errado.
  const intencao = intencaoValida(b.intencao) ? b.intencao : 'vender'
  const tipoImovel = tipoImovelValido(b.tipo_imovel) ? b.tipo_imovel : null

  // Só entram no upsert as chaves realmente enviadas. No Postgres, o
  // `ON CONFLICT DO UPDATE` só toca as colunas presentes no INSERT — então
  // omitir a chave preserva o que já estava gravado.
  //
  // Descoberto testando a rota de verdade: com a linha montada inteira e
  // `null` nos campos ausentes, um segundo envio do formulário (em que a
  // pessoa preenche menos) APAGAVA cidade, tipo de imóvel e valor pretendido.
  // É o mesmo padrão de perda de dados que zerou 8 empreendimentos.
  const { row, set } = criarAcumuladorParcial()
  set('nome', nome)
  set('whatsapp', whatsapp)
  set('intencao', intencao)
  set('email', normalizeEmail(b.email) ?? undefined)
  set('tipo_imovel', tipoImovel ?? undefined)
  set('cidade', normalizeString(b.cidade) ?? undefined)
  set('bairro', normalizeString(b.bairro) ?? undefined)
  set('valor_pretendido', typeof b.valor_pretendido === 'number' ? b.valor_pretendido : undefined)
  set('origem', normalizeString(b.origem) ?? 'formulario_captacao')
  set('fbclid', normalizeString(b.fbclid) ?? undefined)
  set('gclid', normalizeString(b.gclid) ?? undefined)
  set('utm_source', normalizeString(b.utm_source) ?? undefined)
  set('utm_medium', normalizeString(b.utm_medium) ?? undefined)
  set('utm_campaign', normalizeString(b.utm_campaign) ?? undefined)
  set('anotacoes', normalizeString(b.mensagem) ?? undefined)

  // Reenvio do formulário atualiza o cartão em vez de criar um segundo.
  // Sem isto, um proprietário ansioso viraria 3 cartões e a métrica de
  // "custo por captação" ficaria 3x melhor do que a realidade.
  //
  // `estagio` fica FORA do upsert de propósito: o default da coluna cobre o
  // insert, e reenviar o formulário não pode arrastar de volta pra "novo"
  // alguém que o corretor já moveu para "avaliação agendada".
  const { data, error } = await supabase
    .from('crm_proprietarios')
    .upsert(row, { onConflict: 'whatsapp' })
    .select('id')
    .single()

  if (error) {
    logError(SOURCE, 'falha ao gravar proprietário', error)
    return NextResponse.json({ error: 'Não foi possível registrar agora.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data?.id ?? null }, { status: 201 })
}
