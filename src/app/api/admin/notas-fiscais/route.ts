import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { hojeEmSaoPaulo } from '@/lib/dashboard/timezone-sp'
import { gerarRegua, calcularResumo, type NotaFiscal } from '@/lib/notas-fiscais/regua'
import {
  validarCompetencia, competenciaParaData, validarValor, validarNumero, validarArquivoPdf,
} from '@/lib/notas-fiscais/validacao'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const SOURCE = 'api/admin/notas-fiscais'
const BUCKET = 'notas-fiscais'
const VALIDADE_LINK_SEGUNDOS = 300

type LinhaNotaFiscal = {
  id: string
  competencia: string
  numero: string
  valor: number
  storage_path: string
  created_at: string
}

/**
 * GET — régua completa (do primeiro mês com nota até hoje, em
 * America/Sao_Paulo) + resumo. Tabela pode não existir ainda neste
 * ambiente (migration 20260806100000 não aplicada) — cai num estado
 * "conta nova" em vez de derrubar a tela.
 */
export async function GET() {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = sb()
  const { data, error } = await client
    .from('crm_notas_fiscais')
    .select('id, competencia, numero, valor, storage_path, created_at')
    .eq('admin_id', adminId)
    .order('competencia', { ascending: false })

  if (error) {
    if (error.code === '42P01') return NextResponse.json({ regua: [], resumo: { totalAnoCorrente: 0, mesesPendentes: 0 }, contaNova: true })
    logError(SOURCE, 'falha ao listar notas fiscais', error, { adminId })
    return NextResponse.json({ error: 'Falha ao carregar notas fiscais' }, { status: 500 })
  }

  const linhas = (data ?? []) as LinhaNotaFiscal[]

  let assinados: Record<string, string> = {}
  if (linhas.length > 0) {
    const { data: urls, error: erroUrl } = await client.storage
      .from(BUCKET)
      .createSignedUrls(linhas.map((l) => l.storage_path), VALIDADE_LINK_SEGUNDOS)
    if (erroUrl) {
      logError(SOURCE, 'falha ao assinar urls de notas fiscais', erroUrl, { quantidade: linhas.length })
    } else {
      for (const u of urls ?? []) {
        if (u.path && u.signedUrl) assinados[u.path] = u.signedUrl
      }
    }
  }

  const notas: NotaFiscal[] = linhas.map((l) => ({
    id: l.id,
    competencia: l.competencia,
    numero: l.numero,
    valor: Number(l.valor),
    storagePath: l.storage_path,
    criadoEm: l.created_at,
  }))

  const hoje = hojeEmSaoPaulo()
  const regua = gerarRegua(notas, hoje)
  const resumo = calcularResumo(regua, Number(hoje.slice(0, 4)))

  const reguaComUrl = regua.map((mes) => ({
    ...mes,
    notas: mes.notas.map((n) => ({ ...n, url: assinados[n.storagePath] ?? null })),
  }))

  return NextResponse.json({ regua: reguaComUrl, resumo, contaNova: false })
}

/**
 * POST — multipart: `competencia` (YYYY-MM), `numero`, `valor`, `arquivo`
 * (PDF). Sobe o PDF pro bucket privado antes de inserir a linha; se o
 * insert falhar (ex.: número duplicado na competência), remove o arquivo
 * órfão em vez de deixar lixo no bucket.
 */
export async function POST(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Envio inválido' }, { status: 400 })

  const competenciaBruta = String(form.get('competencia') ?? '')
  const numero = String(form.get('numero') ?? '').trim()
  const valor = Number(form.get('valor'))
  const arquivo = form.get('arquivo')

  const vCompetencia = validarCompetencia(competenciaBruta)
  if (!vCompetencia.ok) return NextResponse.json({ error: vCompetencia.erro }, { status: 400 })

  const vNumero = validarNumero(numero)
  if (!vNumero.ok) return NextResponse.json({ error: vNumero.erro }, { status: 400 })

  const vValor = validarValor(valor)
  if (!vValor.ok) return NextResponse.json({ error: vValor.erro }, { status: 400 })

  if (!(arquivo instanceof File)) return NextResponse.json({ error: 'Envie o PDF da nota' }, { status: 400 })
  const vArquivo = validarArquivoPdf(arquivo.type, arquivo.size)
  if (!vArquivo.ok) return NextResponse.json({ error: vArquivo.erro }, { status: 400 })

  const competencia = competenciaParaData(competenciaBruta)
  const client = sb()

  const sufixo = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const numeroSanitizado = numero.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 40)
  const caminho = `${adminId}/${competenciaBruta}/${numeroSanitizado}-${sufixo}.pdf`

  const { error: erroUpload } = await client.storage.from(BUCKET).upload(caminho, new Uint8Array(await arquivo.arrayBuffer()), {
    contentType: 'application/pdf',
    upsert: false,
  })
  if (erroUpload) {
    logError(SOURCE, 'falha ao subir pdf da nota fiscal', erroUpload, { adminId })
    return NextResponse.json({ error: 'Falha ao salvar o arquivo' }, { status: 500 })
  }

  const { data: linha, error: erroInsert } = await client
    .from('crm_notas_fiscais')
    .insert({ admin_id: adminId, competencia, numero, valor, storage_path: caminho })
    .select()
    .single()

  if (erroInsert) {
    const { error: erroRemover } = await client.storage.from(BUCKET).remove([caminho])
    if (erroRemover) logError(SOURCE, 'falha ao limpar pdf órfão após erro de insert', erroRemover, { caminho })

    if (erroInsert.code === '23505') {
      return NextResponse.json({ error: `Já existe uma nota com o número "${numero}" nessa competência.` }, { status: 409 })
    }
    logError(SOURCE, 'falha ao inserir nota fiscal', erroInsert, { adminId })
    return NextResponse.json({ error: 'Falha ao salvar a nota fiscal' }, { status: 500 })
  }

  return NextResponse.json({ data: linha }, { status: 201 })
}
