import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { paraInsert, parsearCsvLeads } from '@/lib/leads/importar-csv'
import { recalcularScores } from '@/lib/leads/score-server'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const SOURCE = 'api/admin/leads/importar'
// Um corretor com cinco anos de planilha tem centenas de linhas, não milhares.
// O teto existe para um arquivo errado (um export de outro sistema) não virar
// uma importação de 50 mil linhas antes de alguém perceber.
const MAXIMO_LINHAS = 2000

// POST /api/admin/leads/importar
//   multipart com `file`, ou JSON { csv: "..." }
//   `?simular=1` (ou { simular: true }) devolve o plano SEM gravar nada.
//
// A prévia não é opcional na interface: importar planilha é irreversível na
// prática, e o corretor precisa ver quantos leads são novos, quantos já
// existem e quais linhas foram rejeitadas antes de confirmar.
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  let csv = ''
  let simular = url.searchParams.get('simular') === '1'

  const contentType = req.headers.get('content-type') ?? ''
  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData().catch(() => null)
    if (!form) return NextResponse.json({ error: 'Envio inválido' }, { status: 400 })
    const file = form.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    csv = await file.text()
    if (form.get('simular') === 'true') simular = true
  } else {
    const body = await req.json().catch(() => null)
    if (!body || typeof body.csv !== 'string') {
      return NextResponse.json({ error: 'Envie o arquivo em multipart ou { csv } em JSON' }, { status: 400 })
    }
    csv = body.csv
    if (body.simular === true) simular = true
  }

  const parse = parsearCsvLeads(csv)

  if (parse.total === 0) {
    return NextResponse.json({ error: 'Planilha vazia ou sem cabeçalho' }, { status: 400 })
  }
  if (!Object.values(parse.colunasReconhecidas).includes('whatsapp')) {
    return NextResponse.json(
      { error: 'Não encontrei a coluna de telefone. Renomeie para "telefone", "whatsapp" ou "celular".',
        colunasIgnoradas: parse.colunasIgnoradas },
      { status: 400 },
    )
  }
  if (parse.linhas.length > MAXIMO_LINHAS) {
    return NextResponse.json(
      { error: `A planilha tem ${parse.linhas.length} linhas válidas. O limite por importação é ${MAXIMO_LINHAS}.` },
      { status: 400 },
    )
  }

  const client = sb()

  // Quem já está na base não é reimportado: sobrescrever o lead existente
  // apagaria estágio, anotações e histórico com o conteúdo de uma planilha
  // antiga — exatamente o que o corretor NÃO quer ao migrar do Excel.
  const telefones = parse.linhas.map((l) => l.whatsapp)
  const jaExistentes = new Set<string>()
  for (let i = 0; i < telefones.length; i += 500) {
    const { data, error } = await client.from('leads').select('whatsapp').in('whatsapp', telefones.slice(i, i + 500))
    if (error) {
      logError(SOURCE, 'falha ao verificar leads existentes', error)
      return NextResponse.json({ error: 'Falha ao conferir a base antes de importar' }, { status: 500 })
    }
    for (const l of data ?? []) jaExistentes.add(l.whatsapp as string)
  }

  const novos = parse.linhas.filter((l) => !jaExistentes.has(l.whatsapp))

  const plano = {
    total: parse.total,
    novos: novos.length,
    jaExistentes: parse.linhas.length - novos.length,
    duplicadasNoArquivo: parse.duplicadasNoArquivo,
    rejeitadas: parse.rejeitadas,
    colunasReconhecidas: parse.colunasReconhecidas,
    colunasIgnoradas: parse.colunasIgnoradas,
    amostra: novos.slice(0, 5),
  }

  if (simular) return NextResponse.json({ simulado: true, ...plano })

  if (novos.length === 0) {
    return NextResponse.json({ importados: 0, ...plano })
  }

  const agora = new Date().toISOString()
  const { data: inseridos, error } = await client
    .from('leads')
    .insert(novos.map((l) => paraInsert(l, agora)))
    .select('id')

  if (error) {
    logError(SOURCE, 'falha ao inserir leads importados', error, { quantidade: novos.length })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Lead importado nasce com score calculado; sem isso ele entraria na fila do
  // Modo Foco com zero e ficaria atrás de leads piores.
  const ids = (inseridos ?? []).map((l) => l.id as string)
  const scores = await recalcularScores(client, ids)

  return NextResponse.json({ importados: ids.length, comScore: scores.length, ...plano }, { status: 201 })
}
