import { NextRequest, NextResponse } from 'next/server'
import { autenticado } from '@/lib/dashboard/auth-check'
import { enviarFollowUp } from '@/lib/evolution'

export const dynamic = 'force-dynamic'

// POST { numero, mensagem } — envio avulso de conferência, endereçado pro
// número de teste informado (não é um lead). Mesma função de envio usada
// pelo cron de follow-up (enviarFollowUp), só que sem gravar em `interacoes`
// nem tocar em nenhum lead — é só validar que a Evolution API está respondendo.
export async function POST(req: NextRequest) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.EVOLUTION_API_URL || !process.env.EVOLUTION_API_KEY || !process.env.EVOLUTION_INSTANCE) {
    return NextResponse.json(
      { error: 'Evolution API não configurada (EVOLUTION_API_URL / EVOLUTION_API_KEY / EVOLUTION_INSTANCE ausente).' },
      { status: 503 },
    )
  }

  const body = await req.json().catch(() => ({}))
  const numero = typeof body.numero === 'string' ? body.numero.trim() : ''
  const mensagem = typeof body.mensagem === 'string' ? body.mensagem.trim() : ''

  if (!numero || !mensagem) {
    return NextResponse.json({ error: 'numero e mensagem são obrigatórios.' }, { status: 400 })
  }

  const texto = mensagem.replace(/{nome}/g, 'Teste').replace(/{empreendimento}/g, 'nosso empreendimento')

  const enviado = await enviarFollowUp(numero, texto)
  if (!enviado) {
    return NextResponse.json({ error: 'Falha ao enviar via Evolution API. Confira o número e o estado da instância.' }, { status: 502 })
  }

  return NextResponse.json({ success: true })
}
