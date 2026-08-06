import sharp from 'sharp'
import { calcularPosicionamento, type ConfigMarcaDagua } from './posicionamento'

export type ResultadoMarcaDagua = {
  buffer: Buffer
  contentType: 'image/jpeg' | 'image/png'
  largura: number
  altura: number
}

/**
 * Compõe a logo sobre a foto e devolve o resultado pronto pra subir ao
 * Storage. NUNCA sobrescreve o buffer de entrada — quem chama decide onde
 * gravar original vs. processada.
 *
 * Duas passagens no sharp, de propósito: `sharp(fotoBuffer).rotate()` corrige
 * a orientação EXIF (foto de celular "deitada"), mas `sharp(...).metadata()`
 * chamado ANTES do pipeline rodar reporta as dimensões CRUAS do arquivo, não
 * as de exibição — numa foto rotacionada 90°, largura e altura viriam
 * trocadas e a marca saïria posicionada/proporcional para o eixo errado.
 * `toBuffer({ resolveWithObject: true })` materializa a rotação e devolve
 * `info.width/height` já corretos, então a foto rotacionada vira a base real
 * da composição.
 */
export async function aplicarMarcaDagua(fotoBuffer: Buffer, logoBuffer: Buffer, config: ConfigMarcaDagua): Promise<ResultadoMarcaDagua> {
  const formatoOriginal = (await sharp(fotoBuffer).metadata()).format

  const { data: fotoRotacionada, info } = await sharp(fotoBuffer).rotate().toBuffer({ resolveWithObject: true })
  const largura = info.width
  const altura = info.height

  const metaLogo = await sharp(logoBuffer).metadata()
  if (!metaLogo.width || !metaLogo.height) throw new Error('Não foi possível ler as dimensões da logo')

  const pos = calcularPosicionamento({ largura, altura }, { largura: metaLogo.width, altura: metaLogo.height }, config)

  // Opacidade num PNG com alpha: sharp não tem um parâmetro direto de
  // "opacity" no composite. O truque padrão é multiplicar o alpha existente
  // pela fração desejada — compor um pixel 1x1 branco com alpha=opacidade,
  // repetido (`tile`) sobre toda a logo, em modo `dest-in` (mantém a cor da
  // logo, multiplica o alpha dela pelo alpha do pixel de cima).
  const logoComOpacidade = await sharp(logoBuffer)
    .resize(pos.larguraLogoPx, pos.alturaLogoPx)
    .composite([
      {
        input: Buffer.from([255, 255, 255, Math.round(pos.opacidade * 255)]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer()

  const composicao = sharp(fotoRotacionada).composite([{ input: logoComOpacidade, left: pos.left, top: pos.top }])

  // Preserva PNG só se a foto original já era PNG (planta baixa, print) —
  // fora isso, fotos de imóvel são sempre JPEG na prática.
  const manterPng = formatoOriginal === 'png'
  const buffer = manterPng
    ? await composicao.png({ compressionLevel: 8 }).toBuffer()
    : await composicao.jpeg({ quality: 88, mozjpeg: true }).toBuffer()

  return { buffer, contentType: manterPng ? 'image/png' : 'image/jpeg', largura, altura }
}
