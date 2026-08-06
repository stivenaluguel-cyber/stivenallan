import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { validarLogo } from '@/lib/marca-dagua/logo'
import { BUCKET_LOGO, buscarPreferencias, caminhoLogo, ehPosicaoValida } from '@/lib/marca-dagua/config'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const SOURCE = 'api/admin/preferencias/marca-dagua'

/** GET — config atual + URL pública da logo (bucket é público). */
export async function GET() {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = sb()
  const prefs = await buscarPreferencias(client, adminId)
  const logoUrl = prefs.logoPath ? client.storage.from(BUCKET_LOGO).getPublicUrl(prefs.logoPath).data.publicUrl : null

  return NextResponse.json({
    posicao: prefs.posicao,
    opacidade: prefs.opacidade,
    larguraRelativa: prefs.larguraRelativa,
    logoUrl,
  })
}

/**
 * POST — multipart. `logo` (File, opcional — omitir mantém a logo atual),
 * `posicao`, `opacidade` (0-1), `larguraRelativa` (0-1). Salva em
 * crm_preferencias; a logo em si vai pro bucket `marcas-dagua` num path
 * fixo por admin (upsert — não acumula versão antiga).
 */
export async function POST(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Envio inválido' }, { status: 400 })

  const client = sb()
  const logoFile = form.get('logo')
  const patch: Record<string, unknown> = { admin_id: adminId, updated_at: new Date().toISOString() }

  if (logoFile instanceof File && logoFile.size > 0) {
    const buffer = Buffer.from(await logoFile.arrayBuffer())
    const validacao = await validarLogo(buffer, logoFile.type, logoFile.size)
    if (!validacao.ok) return NextResponse.json({ error: validacao.erro }, { status: 400 })

    const caminho = caminhoLogo(adminId)
    const { error: erroUpload } = await client.storage.from(BUCKET_LOGO).upload(caminho, buffer, {
      contentType: 'image/png',
      upsert: true,
    })
    if (erroUpload) {
      logError(SOURCE, 'falha ao subir logo', erroUpload, { adminId })
      return NextResponse.json({ error: 'Falha ao salvar a logo' }, { status: 500 })
    }
    patch.marca_dagua_logo_path = caminho
  }

  const posicaoBruta = form.get('posicao')
  if (typeof posicaoBruta === 'string' && posicaoBruta) {
    if (!ehPosicaoValida(posicaoBruta)) return NextResponse.json({ error: 'Posição inválida' }, { status: 400 })
    patch.marca_dagua_posicao = posicaoBruta
  }

  const opacidadeBruta = form.get('opacidade')
  if (typeof opacidadeBruta === 'string' && opacidadeBruta) {
    const v = Number(opacidadeBruta)
    if (!Number.isFinite(v) || v <= 0 || v > 1) return NextResponse.json({ error: 'Opacidade deve estar entre 0 e 1' }, { status: 400 })
    patch.marca_dagua_opacidade = v
  }

  const larguraBruta = form.get('larguraRelativa')
  if (typeof larguraBruta === 'string' && larguraBruta) {
    const v = Number(larguraBruta)
    if (!Number.isFinite(v) || v <= 0 || v > 1) return NextResponse.json({ error: 'Largura relativa deve estar entre 0 e 1' }, { status: 400 })
    patch.marca_dagua_largura_relativa = v
  }

  const { error } = await client.from('crm_preferencias').upsert(patch, { onConflict: 'admin_id' })
  if (error) {
    logError(SOURCE, 'falha ao salvar preferências de marca d\'água', error, { adminId })
    return NextResponse.json({ error: 'Falha ao salvar as preferências' }, { status: 500 })
  }

  return GET()
}
