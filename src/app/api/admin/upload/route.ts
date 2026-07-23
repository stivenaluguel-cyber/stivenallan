import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { otimizarParaEmail } from '@/lib/media/otimizar-imagem'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'Serviço indisponível' }, { status: 503 })

  const formData = await req.formData()
  const empreendimentoId = formData.get('empreendimentoId') as string
  const files = formData.getAll('files') as File[]
  const perfil = formData.get('perfil') as string | null // 'email' ativa otimização

  if (!empreendimentoId || files.length === 0) {
    return NextResponse.json({ error: 'empreendimentoId e arquivos são obrigatórios' }, { status: 400 })
  }

  const urls: string[] = []
  const errors: string[] = []

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer()
    let buffer: Uint8Array | Buffer = new Uint8Array(arrayBuffer)
    let contentType = file.type
    let ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'

    if (perfil === 'email') {
      try {
        const otimizada = await otimizarParaEmail(Buffer.from(arrayBuffer))
        buffer = otimizada.buffer
        contentType = otimizada.contentType
        ext = otimizada.ext
      } catch (e) {
        errors.push(`${file.name}: falha ao otimizar (${e instanceof Error ? e.message : 'erro desconhecido'}), enviado sem otimizar`)
      }
    }

    const fileName = `${empreendimentoId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from('midias')
      .upload(fileName, buffer, {
        contentType,
        cacheControl: '31536000',
        upsert: false,
      })

    if (error) {
      errors.push(`${file.name}: ${error.message}`)
      continue
    }

    const { data: urlData } = supabase.storage
      .from('midias')
      .getPublicUrl(fileName)

    urls.push(urlData.publicUrl)
  }

  if (errors.length > 0 && urls.length === 0) {
    return NextResponse.json({ error: errors.join('; ') }, { status: 500 })
  }

  return NextResponse.json({ urls, errors: errors.length > 0 ? errors : undefined })
}
