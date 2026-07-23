import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autenticado } from '@/lib/dashboard/auth-check'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Espelha o check constraint de `situacao` da migration 0018 — validar aqui
// dá um 400 claro em vez de deixar o Postgres estourar um 500 genérico.
const SITUACOES_VALIDAS = ['disponivel', 'reservada', 'vendida', 'bloqueada', 'indisponivel'] as const

function situacaoInvalida(situacao: unknown): boolean {
  return situacao !== undefined && !SITUACOES_VALIDAS.includes(situacao as typeof SITUACOES_VALIDAS[number])
}

// GET /api/admin/unidades?empreendimento_id=xxx
export async function GET(req: NextRequest) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const empId = new URL(req.url).searchParams.get('empreendimento_id')
  if (!empId) return NextResponse.json({ error: 'empreendimento_id obrigatorio' }, { status: 400 })
  // select('*') já traz vagas/situacao/data_tabela (migration 0018) sem
  // precisar listar coluna por coluna — não há allow-list de campos aqui.
  const { data, error } = await sb()
    .from('empreendimentos_unidades')
    .select('*')
    .eq('empreendimento_id', empId)
    .order('unidade')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Enriquecer com CUB vigente
  const { data: cub } = await sb().from('configuracoes_cub').select('valor_m2').order('mes_referencia', { ascending: false }).limit(1).single()
  return NextResponse.json({ data, cub_vigente: cub?.valor_m2 ?? null })
}

// POST — cria unidade
export async function POST(req: NextRequest) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  if (!body.empreendimento_id || !body.unidade || !body.metragem)
    return NextResponse.json({ error: 'empreendimento_id, unidade e metragem obrigatorios' }, { status: 400 })
  if (situacaoInvalida(body.situacao))
    return NextResponse.json({ error: `situacao deve ser uma de: ${SITUACOES_VALIDAS.join(', ')}` }, { status: 400 })
  // insert(body) já grava vagas/situacao/data_tabela quando enviados
  // (migration 0018) — sem allow-list de campos, o body inteiro é gravado.
  const { data, error } = await sb().from('empreendimentos_unidades').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

// PATCH — atualiza disponibilidade ou valor
export async function PATCH(req: NextRequest) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })
  if (situacaoInvalida(updates.situacao))
    return NextResponse.json({ error: `situacao deve ser uma de: ${SITUACOES_VALIDAS.join(', ')}` }, { status: 400 })
  updates.updated_at = new Date().toISOString()
  // update(updates) já grava vagas/situacao/data_tabela quando enviados
  // (migration 0018) — sem allow-list de campos, tudo que vier no body
  // (exceto `id`) é gravado.
  const { data, error } = await sb().from('empreendimentos_unidades').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
