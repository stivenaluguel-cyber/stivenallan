import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autenticado } from '@/lib/dashboard/auth-check'
import { validarCadenciaWhatsapp } from '@/lib/automacoes/validacao'
import { logWarn } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [{ data: intervalos, error: e1 }, { data: mensagens, error: e2 }] = await Promise.all([
    sb().from('automacao_whatsapp_intervalos').select('ordem, dias').order('ordem', { ascending: true }),
    sb().from('automacao_whatsapp_mensagens').select('estagio_funil, ordem, mensagem').order('estagio_funil', { ascending: true }).order('ordem', { ascending: true }),
  ])
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 })
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })
  return NextResponse.json({ intervalos: intervalos ?? [], mensagens: mensagens ?? [] })
}

// Substitui o conjunto inteiro de regras (o painel de edição sempre manda o
// estado completo — mais simples e seguro que diffs parciais pra uma tabela
// pequena que só um corretor edita).
export async function PUT(req: NextRequest) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const intervalos: { ordem: number; dias: number }[] = Array.isArray(body.intervalos) ? body.intervalos : []
  const mensagens: { estagio_funil: string; ordem: number; mensagem: string }[] = Array.isArray(body.mensagens) ? body.mensagens : []

  const erros = validarCadenciaWhatsapp(intervalos, mensagens)
  if (erros.length > 0) {
    // Estrutura simples (string única) — o client (automacoes-view.tsx) já
    // consome `data.error` como mensagem única em msgWpp; um array exigiria
    // lógica extra no front só pra concatenar de novo.
    return NextResponse.json({ error: erros.join(' ') }, { status: 400 })
  }

  const client = sb()

  // Estado anterior pra registrar em automacao_historico — lido ANTES do
  // delete, fail-open (se a leitura falhar, salva mesmo assim só sem histórico).
  const [{ data: intervalosAntes }, { data: mensagensAntes }] = await Promise.all([
    client.from('automacao_whatsapp_intervalos').select('ordem, dias'),
    client.from('automacao_whatsapp_mensagens').select('estagio_funil, ordem, mensagem'),
  ])

  const { error: delErr1 } = await client.from('automacao_whatsapp_intervalos').delete().gte('ordem', 0)
  if (delErr1) return NextResponse.json({ error: delErr1.message }, { status: 500 })
  const { error: insErr1 } = await client.from('automacao_whatsapp_intervalos').insert(intervalos)
  if (insErr1) return NextResponse.json({ error: insErr1.message }, { status: 500 })

  const { error: delErr2 } = await client.from('automacao_whatsapp_mensagens').delete().gte('ordem', 0)
  if (delErr2) return NextResponse.json({ error: delErr2.message }, { status: 500 })
  const { error: insErr2 } = await client.from('automacao_whatsapp_mensagens').insert(mensagens)
  if (insErr2) return NextResponse.json({ error: insErr2.message }, { status: 500 })

  try {
    await client.from('automacao_historico').insert({
      tipo: 'whatsapp',
      payload_antes: { intervalos: intervalosAntes ?? [], mensagens: mensagensAntes ?? [] },
      payload_depois: { intervalos, mensagens },
    })
  } catch (err) {
    logWarn('admin/automacoes/whatsapp', 'automacao_historico insert falhou (cadência salva normalmente)', {
      error: err instanceof Error ? err.message : String(err),
    })
  }

  return NextResponse.json({ success: true })
}
