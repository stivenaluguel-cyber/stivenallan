import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function checkAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('dashboard_token')?.value
  if (!token) return false
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('empreendimentos')
    .select(`*, tipologias(*), diferenciais_empreendimento(*)`)
    .eq('id', id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  const supabase = getSupabase()
  const { tipologias, diferenciais, ...empreendimentoData } = body

  const { data: emp, error: empError } = await supabase
    .from('empreendimentos')
    .update({ ...empreendimentoData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (empError) return NextResponse.json({ error: empError.message }, { status: 500 })

  if (tipologias !== undefined) {
    await supabase.from('tipologias').delete().eq('empreendimento_id', id)
    if (tipologias.length > 0) {
      const tiposData = tipologias.map((t: any) => {
        const { id: _id, empreendimento_id: _eid, ...rest } = t
        return { ...rest, empreendimento_id: id }
      })
      await supabase.from('tipologias').insert(tiposData)
    }
  }

  if (diferenciais !== undefined) {
    await supabase.from('diferenciais_empreendimento').delete().eq('empreendimento_id', id)
    if (diferenciais.length > 0) {
      const difData = diferenciais.map((d: any) => {
        const { id: _id, empreendimento_id: _eid, ...rest } = d
        return { ...rest, empreendimento_id: id }
      })
      await supabase.from('diferenciais_empreendimento').insert(difData)
    }
  }

  return NextResponse.json({ data: emp })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = getSupabase()
  const { error } = await supabase.from('empreendimentos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
