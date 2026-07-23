import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { processarEnvioCampanha } from '@/lib/campanhas/processar-envio'
import { autenticado } from '@/lib/dashboard/auth-check'

export const dynamic = 'force-dynamic'
// Nenhuma rota do projeto declarava isso antes (rodando no default da
// Vercel) — o loop de envio com throttle de 600ms entre mensagens precisa
// de folga explícita pra não estourar o timeout padrão bem mais curto.
export const maxDuration = 60

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const resultado = await processarEnvioCampanha(sb(), id)
  if (!resultado.ok) return NextResponse.json({ error: resultado.error }, { status: resultado.status })

  const { enviados, erros, restantes } = resultado
  return NextResponse.json({
    mensagem: `Processados ${enviados + erros} (${enviados} enviados, ${erros} erros).${restantes ? ` ${restantes} restantes.` : ''}`,
    enviados,
    erros,
    restantes,
  })
}
