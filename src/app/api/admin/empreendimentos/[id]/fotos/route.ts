import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { validarFotoImovel, extensaoPorMime } from '@/lib/marca-dagua/foto'
import { aplicarMarcaDagua } from '@/lib/marca-dagua/processar'
import { BUCKET_FOTOS, baixarLogo, buscarPreferencias } from '@/lib/marca-dagua/config'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const SOURCE = 'api/admin/empreendimentos/[id]/fotos'

type Params = { params: Promise<{ id: string }> }

function urlsPublicas(client: ReturnType<typeof sb>, row: { storage_path_original: string; storage_path_processada: string | null }) {
  return {
    original: client.storage.from(BUCKET_FOTOS).getPublicUrl(row.storage_path_original).data.publicUrl,
    processada: row.storage_path_processada
      ? client.storage.from(BUCKET_FOTOS).getPublicUrl(row.storage_path_processada).data.publicUrl
      : null,
  }
}

/** GET — lista as fotos do empreendimento (properties.id), com URL pública de cada versão. */
export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: propertyId } = await params

  const client = sb()
  const { data, error } = await client
    .from('properties_fotos')
    .select('*')
    .eq('property_id', propertyId)
    .order('ordem', { ascending: true })

  if (error) {
    if (error.code === '42P01') return NextResponse.json({ data: [] }) // migration ainda não aplicada neste ambiente
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: (data ?? []).map((f) => ({ ...f, urls: urlsPublicas(client, f) })) })
}

/**
 * POST — multipart, campo `fotos` (um ou mais File). Pra cada arquivo: sobe
 * o ORIGINAL sem alteração (fonte de verdade, nunca sobrescrita) e, se
 * houver logo configurada, gera e sobe a versão com marca d'água. Sem logo
 * configurada, sobe só o original e segue sem erro — a marca é opcional,
 * não um requisito de upload.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: propertyId } = await params

  const client = sb()
  const { data: property } = await client.from('properties').select('id').eq('id', propertyId).maybeSingle()
  if (!property) return NextResponse.json({ error: 'Empreendimento não encontrado' }, { status: 404 })

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Envio inválido' }, { status: 400 })

  const arquivos = form.getAll('fotos').filter((f): f is File => f instanceof File)
  if (arquivos.length === 0) return NextResponse.json({ error: 'Nenhuma foto enviada' }, { status: 400 })

  const prefs = await buscarPreferencias(client, adminId)
  const logoBuffer = prefs.logoPath ? await baixarLogo(client, prefs.logoPath) : null

  const { count: totalAtual } = await client
    .from('properties_fotos')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', propertyId)
  let proximaOrdem = totalAtual ?? 0

  const criadas: unknown[] = []
  const erros: string[] = []

  for (const arquivo of arquivos) {
    const validacao = validarFotoImovel(arquivo.type, arquivo.size)
    if (!validacao.ok) {
      erros.push(`${arquivo.name}: ${validacao.erro}`)
      continue
    }

    const buffer = Buffer.from(await arquivo.arrayBuffer())
    const sufixo = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const pathOriginal = `originais/${propertyId}/${sufixo}.${extensaoPorMime(arquivo.type)}`

    const { error: erroUploadOriginal } = await client.storage.from(BUCKET_FOTOS).upload(pathOriginal, buffer, {
      contentType: arquivo.type,
      upsert: false,
    })
    if (erroUploadOriginal) {
      erros.push(`${arquivo.name}: falha ao salvar original (${erroUploadOriginal.message})`)
      continue
    }

    let pathProcessada: string | null = null
    let largura: number | null = null
    let altura: number | null = null

    if (logoBuffer) {
      try {
        const resultado = await aplicarMarcaDagua(buffer, logoBuffer, prefs)
        const extProcessada = resultado.contentType === 'image/png' ? 'png' : 'jpg'
        pathProcessada = `galeria/${propertyId}/${sufixo}.${extProcessada}`
        const { error: erroUploadProc } = await client.storage.from(BUCKET_FOTOS).upload(pathProcessada, resultado.buffer, {
          contentType: resultado.contentType,
          upsert: false,
        })
        if (erroUploadProc) throw new Error(erroUploadProc.message)
        largura = resultado.largura
        altura = resultado.altura
      } catch (e) {
        // Original já está salvo e é o que importa preservar — a foto entra
        // sem marca (fica pra próxima regeneração) em vez de perder o upload inteiro.
        logError(SOURCE, 'falha ao gerar versão com marca d\'água, mantendo só o original', e, { propertyId, arquivo: arquivo.name })
        pathProcessada = null
      }
    }

    const { data: linha, error: erroInsert } = await client
      .from('properties_fotos')
      .insert({
        property_id: propertyId,
        storage_path_original: pathOriginal,
        storage_path_processada: pathProcessada,
        largura_original: largura,
        altura_original: altura,
        ordem: proximaOrdem++,
        admin_id: adminId,
        processado_em: pathProcessada ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (erroInsert) {
      erros.push(`${arquivo.name}: ${erroInsert.message}`)
      continue
    }

    criadas.push({ ...linha, urls: urlsPublicas(client, linha) })
  }

  if (criadas.length === 0) {
    return NextResponse.json({ error: 'Nenhuma foto pôde ser salva', detalhes: erros }, { status: 400 })
  }

  return NextResponse.json({ data: criadas, erros: erros.length > 0 ? erros : undefined }, { status: 201 })
}

/**
 * DELETE — /api/admin/empreendimentos/[id]/fotos?fotoId=...
 *
 * A linha sai primeiro (mesmo padrão de api/admin/anexos/route.ts): se a
 * ordem fosse inversa e o delete da linha falhasse, sobraria um registro
 * apontando pra um arquivo que já não existe — pior que um arquivo órfão
 * no storage, porque a UI mostraria uma foto que não abre.
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: propertyId } = await params

  const fotoId = new URL(req.url).searchParams.get('fotoId')
  if (!fotoId) return NextResponse.json({ error: 'fotoId obrigatório' }, { status: 400 })

  const client = sb()
  const { data: foto } = await client
    .from('properties_fotos')
    .select('*')
    .eq('id', fotoId)
    .eq('property_id', propertyId)
    .maybeSingle()
  if (!foto) return NextResponse.json({ error: 'Foto não encontrada' }, { status: 404 })

  const { error } = await client.from('properties_fotos').delete().eq('id', fotoId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const paths = [foto.storage_path_original, foto.storage_path_processada].filter((p): p is string => !!p)
  const { error: erroStorage } = await client.storage.from(BUCKET_FOTOS).remove(paths)
  if (erroStorage) logError(SOURCE, 'linha removida mas arquivo(s) permaneceram no storage', erroStorage, { propertyId, fotoId })

  return NextResponse.json({ success: true })
}

/**
 * PATCH — /api/admin/empreendimentos/[id]/fotos?fotoId=...
 *
 * Remove a marca d'água de UMA foto específica (não apaga a foto — o
 * original continua). Diferente da exclusão de foto: aqui a coluna sai
 * primeiro, o arquivo do storage depois — na ordem inversa, se o delete
 * do arquivo funcionasse mas a coluna não fosse atualizada, a linha
 * continuaria apontando pra um `storage_path_processada` inexistente e a
 * galeria mostraria uma URL quebrada. Com a coluna zerada primeiro, o pior
 * caso de falha do storage é só um arquivo órfão (inofensivo) — a UI já
 * mostra o original corretamente assim que a coluna vira null.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: propertyId } = await params

  const fotoId = new URL(req.url).searchParams.get('fotoId')
  if (!fotoId) return NextResponse.json({ error: 'fotoId obrigatório' }, { status: 400 })

  const client = sb()
  const { data: foto } = await client
    .from('properties_fotos')
    .select('*')
    .eq('id', fotoId)
    .eq('property_id', propertyId)
    .maybeSingle()
  if (!foto) return NextResponse.json({ error: 'Foto não encontrada' }, { status: 404 })

  if (!foto.storage_path_processada) {
    // Já está sem marca — nada a fazer, não é erro (idempotente).
    return NextResponse.json({ data: { ...foto, urls: urlsPublicas(client, foto) } })
  }

  const pathProcessada = foto.storage_path_processada as string
  const { data: linha, error } = await client
    .from('properties_fotos')
    .update({ storage_path_processada: null, processado_em: null })
    .eq('id', fotoId)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { error: erroStorage } = await client.storage.from(BUCKET_FOTOS).remove([pathProcessada])
  if (erroStorage) logError(SOURCE, 'marca d\'água removida da linha mas arquivo processado permaneceu no storage', erroStorage, { propertyId, fotoId })

  return NextResponse.json({ data: { ...linha, urls: urlsPublicas(client, linha) } })
}
