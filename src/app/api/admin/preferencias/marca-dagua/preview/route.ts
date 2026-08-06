import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { validarLogo } from '@/lib/marca-dagua/logo'
import { aplicarMarcaDagua } from '@/lib/marca-dagua/processar'
import { BUCKET_FOTOS, CONFIG_PADRAO, baixarLogo, buscarPreferencias, ehPosicaoValida } from '@/lib/marca-dagua/config'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const SOURCE = 'api/admin/preferencias/marca-dagua/preview'

/**
 * POST — prévia server-side sobre uma foto real do bucket `imoveis` (pasta
 * `capas/`, escolhida na hora em vez de fixa — não quebra se o arquivo
 * específico for removido/renomeado). Devolve a imagem já composta (bytes),
 * não JSON — o corretor vê o resultado antes de salvar qualquer coisa.
 *
 * Multipart, tudo opcional: `logo` (File — se ausente, usa a logo já
 * salva), `posicao`, `opacidade`, `larguraRelativa` (se ausentes, usa o que
 * já está salvo ou o padrão). Isso deixa o slider da tela de preferências
 * gerar prévia ao vivo sem precisar salvar a cada ajuste.
 */
export async function POST(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Envio inválido' }, { status: 400 })

  const client = sb()

  let logoBuffer: Buffer | null = null
  const logoFile = form.get('logo')
  if (logoFile instanceof File && logoFile.size > 0) {
    const buffer = Buffer.from(await logoFile.arrayBuffer())
    const validacao = await validarLogo(buffer, logoFile.type, logoFile.size)
    if (!validacao.ok) return NextResponse.json({ error: validacao.erro }, { status: 400 })
    logoBuffer = buffer
  } else {
    const prefs = await buscarPreferencias(client, adminId)
    if (prefs.logoPath) logoBuffer = await baixarLogo(client, prefs.logoPath)
  }

  if (!logoBuffer) return NextResponse.json({ error: 'Nenhuma logo enviada nem salva ainda' }, { status: 400 })

  const prefsAtuais = await buscarPreferencias(client, adminId)
  const posicaoBruta = form.get('posicao')
  const opacidadeBruta = form.get('opacidade')
  const larguraBruta = form.get('larguraRelativa')

  const config = {
    posicao: typeof posicaoBruta === 'string' && ehPosicaoValida(posicaoBruta) ? posicaoBruta : prefsAtuais.posicao ?? CONFIG_PADRAO.posicao,
    opacidade: typeof opacidadeBruta === 'string' && Number.isFinite(Number(opacidadeBruta)) ? Number(opacidadeBruta) : prefsAtuais.opacidade,
    larguraRelativa: typeof larguraBruta === 'string' && Number.isFinite(Number(larguraBruta)) ? Number(larguraBruta) : prefsAtuais.larguraRelativa,
  }

  const { data: lista, error: erroLista } = await client.storage.from(BUCKET_FOTOS).list('capas', { limit: 1 })
  if (erroLista || !lista || lista.length === 0) {
    return NextResponse.json({ error: 'Sem foto de exemplo disponível pra gerar prévia' }, { status: 500 })
  }

  const { data: fotoBlob, error: erroDownload } = await client.storage.from(BUCKET_FOTOS).download(`capas/${lista[0].name}`)
  if (erroDownload || !fotoBlob) {
    logError(SOURCE, 'falha ao baixar foto de exemplo', erroDownload, { adminId })
    return NextResponse.json({ error: 'Falha ao carregar foto de exemplo' }, { status: 500 })
  }

  try {
    const fotoBuffer = Buffer.from(await fotoBlob.arrayBuffer())
    const resultado = await aplicarMarcaDagua(fotoBuffer, logoBuffer, config)
    return new NextResponse(new Uint8Array(resultado.buffer), {
      headers: { 'Content-Type': resultado.contentType, 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    logError(SOURCE, 'falha ao gerar prévia', e, { adminId })
    return NextResponse.json({ error: 'Falha ao gerar a prévia' }, { status: 500 })
  }
}
