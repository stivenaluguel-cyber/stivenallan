import sharp from 'sharp'

// Redimensiona/comprime pra uso em e-mail: e-mail nunca é lido numa coluna
// maior que ~600px, então uma foto de câmera/celular (às vezes 12MP+) só
// deixa a mensagem pesada e lenta sem ganho nenhum de nitidez — e um e-mail
// majoritariamente peso-de-imagem é sinal ruim pra filtro de spam.
// rotate() sem argumento corrige fotos de celular que vêm "deitadas" via
// flag EXIF e remove o EXIF do arquivo final (bônus de privacidade).
export const LARGURA_MAX_EMAIL = 1200

export async function otimizarParaEmail(buffer: Buffer): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  const imagem = sharp(buffer).rotate()
  const metadata = await imagem.metadata()
  const redimensionada = (metadata.width ?? 0) > LARGURA_MAX_EMAIL
    ? imagem.resize({ width: LARGURA_MAX_EMAIL, withoutEnlargement: true })
    : imagem

  if (metadata.hasAlpha) {
    const out = await redimensionada.png({ compressionLevel: 8 }).toBuffer()
    return { buffer: out, contentType: 'image/png', ext: 'png' }
  }
  const out = await redimensionada.jpeg({ quality: 82, mozjpeg: true }).toBuffer()
  return { buffer: out, contentType: 'image/jpeg', ext: 'jpg' }
}
