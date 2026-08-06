import type { SupabaseClient } from '@supabase/supabase-js'
import { aplicarMarcaDagua } from './processar'
import type { ConfigMarcaDagua } from './posicionamento'
import { BUCKET_FOTOS } from './config'

/**
 * Baixa o original do Storage, aplica a marca d'água e sobe o resultado no
 * path da versão processada — reaproveitando o path já existente (upsert)
 * quando é uma regeneração, ou criando um novo na primeira vez. Só a cola
 * de I/O do Storage; o processamento em si (sharp) está em processar.ts,
 * já testado sem depender de rede.
 */
export async function processarFotoDoStorage(
  client: SupabaseClient,
  params: {
    propertyId: string
    storagePathOriginal: string
    storagePathProcessadaExistente: string | null
    logoBuffer: Buffer
    config: ConfigMarcaDagua
  },
): Promise<{ storagePathProcessada: string; largura: number; altura: number }> {
  const { data: original, error: erroDownload } = await client.storage.from(BUCKET_FOTOS).download(params.storagePathOriginal)
  if (erroDownload || !original) {
    throw new Error(`Falha ao baixar original (${params.storagePathOriginal}): ${erroDownload?.message ?? 'sem dados'}`)
  }

  const fotoBuffer = Buffer.from(await original.arrayBuffer())
  const resultado = await aplicarMarcaDagua(fotoBuffer, params.logoBuffer, params.config)

  const ext = resultado.contentType === 'image/png' ? 'png' : 'jpg'
  const sufixo = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const path = params.storagePathProcessadaExistente ?? `galeria/${params.propertyId}/${sufixo}.${ext}`

  const { error: erroUpload } = await client.storage.from(BUCKET_FOTOS).upload(path, resultado.buffer, {
    contentType: resultado.contentType,
    upsert: true,
  })
  if (erroUpload) throw new Error(`Falha ao subir versão processada (${path}): ${erroUpload.message}`)

  return { storagePathProcessada: path, largura: resultado.largura, altura: resultado.altura }
}
