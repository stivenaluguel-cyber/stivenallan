import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()

  const formData = await req.formData()
  const empreendimentoId = formData.get('empreendimentoId') as string
  const files = formData.getAll('files') as File[]

  if (!empreendimentoId || files.length === 0) {
    return NextResponse.json({ error: 'empreendimentoId e arquivos são obrigatórios' }, { status: 400 })
  }

  const urls: string[] = []
  const errors: string[] = []

  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${empreendimentoId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error } = await supabase.storage
      .from('midias')
      .upload(fileName, buffer, {
        contentType: file.type,
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
