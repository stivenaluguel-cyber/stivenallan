import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { checklistAnalise, ehTipoValido, montarCaminho, validarArquivo, type TipoAnexo } from '@/lib/anexos/tipos'
import { recalcularScoreLead } from '@/lib/leads/score-server'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const BUCKET = 'documentos'
const SOURCE = 'api/admin/anexos'
// Link curto: o suficiente para abrir ou baixar, curto demais para virar
// URL compartilhável de documento pessoal.
const VALIDADE_LINK_SEGUNDOS = 300

// GET /api/admin/anexos?leadId=... | ?propostaId=...
// Devolve os anexos com link assinado temporário e o checklist da análise.
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const leadId = searchParams.get('leadId')
  const propostaId = searchParams.get('propostaId')
  if (!leadId && !propostaId) {
    return NextResponse.json({ error: 'Informe leadId ou propostaId' }, { status: 400 })
  }

  const client = sb()
  let q = client.from('crm_anexos').select('*').order('created_at', { ascending: false })
  if (leadId) q = q.eq('lead_id', leadId)
  if (propostaId) q = q.eq('proposta_id', propostaId)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const anexos = data ?? []

  // Um createSignedUrls para a lista inteira; assinar um a um seria N
  // round-trips para abrir uma aba.
  const assinados: Record<string, string> = {}
  if (anexos.length > 0) {
    const { data: urls, error: erroUrl } = await client.storage
      .from(BUCKET)
      .createSignedUrls(anexos.map((a) => a.storage_path as string), VALIDADE_LINK_SEGUNDOS)
    if (erroUrl) {
      // Sem link o anexo ainda deve aparecer na lista — some o botão de
      // abrir, não o registro de que o documento existe.
      logError(SOURCE, 'falha ao assinar urls de anexos', erroUrl, { quantidade: anexos.length })
    } else {
      for (const u of urls ?? []) {
        if (u.path && u.signedUrl) assinados[u.path] = u.signedUrl
      }
    }
  }

  return NextResponse.json({
    data: anexos.map((a) => ({ ...a, url: assinados[a.storage_path as string] ?? null })),
    checklist: checklistAnalise(anexos.map((a) => ({ tipo: a.tipo as string }))),
  })
}

// POST /api/admin/anexos — multipart: files[], tipo, leadId|propostaId
export async function POST(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Envio inválido' }, { status: 400 })

  const leadId = (form.get('leadId') as string) || null
  const propostaId = (form.get('propostaId') as string) || null
  const tipoBruto = (form.get('tipo') as string) || 'outro'
  const observacao = (form.get('observacao') as string) || null
  const files = form.getAll('files').filter((f): f is File => f instanceof File)

  if (!leadId && !propostaId) return NextResponse.json({ error: 'Informe leadId ou propostaId' }, { status: 400 })
  if (files.length === 0) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  if (!ehTipoValido(tipoBruto)) return NextResponse.json({ error: 'Tipo de documento inválido' }, { status: 400 })
  const tipo: TipoAnexo = tipoBruto

  const client = sb()

  // Vínculo conferido antes de subir: anexo apontando para lead inexistente
  // seria recusado pela FK depois do upload e deixaria o arquivo órfão
  // ocupando espaço no bucket.
  if (leadId) {
    const { data: lead } = await client.from('leads').select('id').eq('id', leadId).maybeSingle()
    if (!lead) return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
  }
  if (propostaId) {
    const { data: p } = await client.from('crm_propostas').select('id').eq('id', propostaId).maybeSingle()
    if (!p) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })
  }

  const criados: unknown[] = []
  const erros: string[] = []

  for (const file of files) {
    const validacao = validarArquivo(file.name, file.type, file.size)
    if (!validacao.ok) {
      erros.push(`${file.name}: ${validacao.erro}`)
      continue
    }

    const sufixo = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    const caminho = montarCaminho({ leadId, propostaId }, tipo, file.type, sufixo)

    const { error: erroUpload } = await client.storage
      .from(BUCKET)
      .upload(caminho, new Uint8Array(await file.arrayBuffer()), {
        contentType: file.type,
        upsert: false,
      })

    if (erroUpload) {
      erros.push(`${file.name}: ${erroUpload.message}`)
      continue
    }

    const { data: linha, error: erroInsert } = await client
      .from('crm_anexos')
      .insert({
        lead_id: leadId,
        proposta_id: propostaId,
        admin_id: adminId,
        tipo,
        nome_arquivo: file.name.slice(0, 300),
        storage_path: caminho,
        mime_type: file.type,
        tamanho_bytes: file.size,
        observacao: observacao ? observacao.slice(0, 500) : null,
      })
      .select()
      .single()

    if (erroInsert) {
      // O arquivo já subiu mas não tem linha que o referencie — ninguém
      // conseguiria vê-lo nem apagá-lo pela interface. Removemos aqui para
      // não pagar armazenamento por lixo invisível.
      await client.storage.from(BUCKET).remove([caminho])
      erros.push(`${file.name}: ${erroInsert.message}`)
      continue
    }

    criados.push(linha)
  }

  if (criados.length === 0) {
    return NextResponse.json({ error: erros.join(' · ') || 'Nenhum arquivo foi salvo' }, { status: 400 })
  }

  // Documento entregue mexe no score (dimensão Comportamento) e pode
  // completar o checklist da análise.
  const score = await recalcularScoreLead(client, leadId)

  return NextResponse.json(
    { data: criados, erros: erros.length ? erros : undefined, score },
    { status: 201 },
  )
}

// DELETE /api/admin/anexos?id=...
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const client = sb()
  const { data: anexo } = await client.from('crm_anexos').select('*').eq('id', id).maybeSingle()
  if (!anexo) return NextResponse.json({ error: 'Anexo não encontrado' }, { status: 404 })

  // A linha sai primeiro. Se a ordem fosse inversa e o delete da linha
  // falhasse, sobraria um registro apontando para um arquivo que não existe
  // mais — pior do que um arquivo órfão, porque a interface mostraria um
  // documento que não abre.
  const { error } = await client.from('crm_anexos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { error: erroStorage } = await client.storage.from(BUCKET).remove([anexo.storage_path as string])
  if (erroStorage) logError(SOURCE, 'linha removida mas arquivo permaneceu no storage', erroStorage, { anexoId: id })

  const score = await recalcularScoreLead(client, anexo.lead_id as string | null)
  return NextResponse.json({ success: true, score })
}
