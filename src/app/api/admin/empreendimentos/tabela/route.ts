import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import {
  caminhoTabela,
  competenciaISO,
  competenciaLabel,
  planoDeRetencao,
  TABELAS_GUARDADAS,
  validarTabela,
} from '@/lib/unidades/tabela-precos'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const BUCKET = 'documentos'
const TABELA = 'empreendimentos_tabelas_precos'
const SOURCE = 'api/admin/empreendimentos/tabela'
// Link curto: dá para abrir e baixar, não vira URL pública da tabela da
// construtora circulando por aí.
const VALIDADE_LINK_SEGUNDOS = 300

/**
 * GET ?slug=...        — tabelas de um empreendimento, com link assinado
 * GET (sem parâmetro)  — resumo por slug, para a listagem marcar quem já tem
 */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const slug = new URL(req.url).searchParams.get('slug')
  const client = sb()

  if (!slug) {
    const { data, error } = await client
      .from(TABELA)
      .select('empreendimento_slug, competencia')
      .order('competencia', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Só a competência mais recente de cada prédio interessa à listagem.
    const recente: Record<string, string> = {}
    for (const t of data ?? []) {
      const s = t.empreendimento_slug as string
      if (!recente[s]) recente[s] = t.competencia as string
    }
    return NextResponse.json({ recentePorSlug: recente })
  }

  const { data, error } = await client
    .from(TABELA)
    .select('*')
    .eq('empreendimento_slug', slug)
    .order('competencia', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const linhas = data ?? []
  const assinados: Record<string, string> = {}
  if (linhas.length > 0) {
    const { data: urls, error: erroUrl } = await client.storage
      .from(BUCKET)
      .createSignedUrls(linhas.map((l) => l.storage_path as string), VALIDADE_LINK_SEGUNDOS)
    if (erroUrl) {
      // Sem link o registro ainda deve aparecer: some o botão de abrir, não a
      // informação de que a tabela daquele mês existe.
      logError(SOURCE, 'falha ao assinar urls de tabelas', erroUrl, { slug })
    } else {
      for (const u of urls ?? []) {
        if (u.path && u.signedUrl) assinados[u.path] = u.signedUrl
      }
    }
  }

  return NextResponse.json({
    data: linhas.map((l) => ({ ...l, url: assinados[l.storage_path as string] ?? null })),
  })
}

/** POST — multipart: file, slug, competencia, cub?, observacao? */
export async function POST(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Envio inválido' }, { status: 400 })

  const slug = String(form.get('slug') ?? '').trim()
  const competencia = competenciaISO(form.get('competencia'))
  const file = form.get('file')
  const cubBruto = form.get('cub')
  const observacao = (form.get('observacao') as string) || null

  if (!slug) return NextResponse.json({ error: 'Empreendimento não informado' }, { status: 400 })
  if (!competencia) return NextResponse.json({ error: 'Informe o mês da tabela' }, { status: 400 })
  if (!(file instanceof File)) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })

  const validacao = validarTabela(file.name, file.type, file.size)
  if (!validacao.ok) return NextResponse.json({ error: validacao.erro }, { status: 400 })

  const client = sb()

  // Retenção decidida ANTES do upload: aceitar uma tabela velha para apagá-la
  // logo em seguida faria o arquivo sumir sozinho depois de "salvo".
  const { data: jaGuardadas } = await client
    .from(TABELA)
    .select('id, competencia, storage_path')
    .eq('empreendimento_slug', slug)
    .order('competencia', { ascending: false })

  const existentes = (jaGuardadas ?? []).map((t) => t.competencia as string)
  const plano = planoDeRetencao(existentes, competencia)

  if (!plano.novaEntra) {
    return NextResponse.json({
      error: `Guardamos as ${TABELAS_GUARDADAS} tabelas mais recentes (${plano.manter.map(competenciaLabel).join(' e ')}). Esta é de ${competenciaLabel(competencia)}.`,
    }, { status: 409 })
  }

  const caminho = caminhoTabela(slug, competencia, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`)

  const { error: erroUpload } = await client.storage
    .from(BUCKET)
    .upload(caminho, new Uint8Array(await file.arrayBuffer()), { contentType: file.type, upsert: false })
  if (erroUpload) {
    logError(SOURCE, 'falha no upload da tabela', erroUpload, { slug, competencia })
    return NextResponse.json({ error: 'Não foi possível enviar o arquivo' }, { status: 500 })
  }

  // O caminho antigo do MESMO mês, para apagar depois de sobrescrever a linha.
  const anterior = (jaGuardadas ?? []).find((t) => t.competencia === competencia) ?? null

  const cub = Number(String(cubBruto ?? '').replace(/\./g, '').replace(',', '.'))

  const { data: linha, error: erroInsert } = await client
    .from(TABELA)
    .upsert({
      empreendimento_slug: slug,
      competencia,
      storage_path: caminho,
      nome_arquivo: file.name.slice(0, 300),
      tamanho_bytes: file.size,
      cub_valor_m2: Number.isFinite(cub) && cub > 0 ? cub : null,
      observacao,
      admin_id: adminId,
    }, { onConflict: 'empreendimento_slug,competencia' })
    .select()
    .single()

  if (erroInsert) {
    // Registro não entrou: tira o arquivo do bucket para não deixar órfão.
    await client.storage.from(BUCKET).remove([caminho])
    logError(SOURCE, 'falha ao gravar tabela', erroInsert, { slug, competencia })
    return NextResponse.json({ error: erroInsert.message }, { status: 500 })
  }

  const arquivosParaApagar: string[] = []
  if (anterior?.storage_path && anterior.storage_path !== caminho) {
    arquivosParaApagar.push(anterior.storage_path as string)
  }

  // Fora da janela de retenção: sai o registro e sai o arquivo.
  const vencidas = (jaGuardadas ?? []).filter((t) => plano.descartar.includes(t.competencia as string))
  if (vencidas.length > 0) {
    const { error: erroDelete } = await client
      .from(TABELA)
      .delete()
      .in('id', vencidas.map((t) => t.id as string))
    // Falhar aqui não invalida o envio: a tabela nova está salva. Só sobra
    // espaço ocupado, que a próxima subida tenta limpar de novo.
    if (erroDelete) logError(SOURCE, 'falha ao aplicar retencao', erroDelete, { slug })
    else arquivosParaApagar.push(...vencidas.map((t) => t.storage_path as string))
  }

  if (arquivosParaApagar.length > 0) {
    await client.storage.from(BUCKET).remove(arquivosParaApagar)
  }

  return NextResponse.json({
    data: linha,
    descartadas: plano.descartar,
  }, { status: 201 })
}

/** DELETE ?id=... — remove o registro e o arquivo. */
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })

  const client = sb()
  const { data: linha } = await client.from(TABELA).select('storage_path').eq('id', id).maybeSingle()
  if (!linha) return NextResponse.json({ error: 'Tabela não encontrada' }, { status: 404 })

  const { error } = await client.from(TABELA).delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await client.storage.from(BUCKET).remove([linha.storage_path as string])
  return NextResponse.json({ success: true })
}
