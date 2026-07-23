import { describe, expect, it } from 'vitest'
import sharp from 'sharp'
import { otimizarParaEmail, LARGURA_MAX_EMAIL } from './otimizar-imagem'

async function gerarImagem(width: number, height: number, comAlpha: boolean): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: comAlpha ? 4 : 3,
      background: comAlpha ? { r: 200, g: 100, b: 50, alpha: 0.5 } : { r: 200, g: 100, b: 50 },
    },
  }).png().toBuffer()
}

describe('otimizarParaEmail', () => {
  it('redimensiona imagem maior que o limite pra largura máxima', async () => {
    const original = await gerarImagem(2000, 1500, false)
    const resultado = await otimizarParaEmail(original)
    const metadata = await sharp(resultado.buffer).metadata()
    expect(metadata.width).toBe(LARGURA_MAX_EMAIL)
    expect(metadata.height).toBe(Math.round(1500 * (LARGURA_MAX_EMAIL / 2000)))
  })

  it('não amplia imagem menor que o limite (mantém tamanho original)', async () => {
    const original = await gerarImagem(400, 300, false)
    const resultado = await otimizarParaEmail(original)
    const metadata = await sharp(resultado.buffer).metadata()
    expect(metadata.width).toBe(400)
    expect(metadata.height).toBe(300)
  })

  it('converte imagem sem transparência pra JPEG', async () => {
    const original = await gerarImagem(600, 400, false)
    const resultado = await otimizarParaEmail(original)
    expect(resultado.contentType).toBe('image/jpeg')
    expect(resultado.ext).toBe('jpg')
    const metadata = await sharp(resultado.buffer).metadata()
    expect(metadata.format).toBe('jpeg')
  })

  it('preserva PNG quando a imagem tem canal alpha (evita fundo preto em logo)', async () => {
    const original = await gerarImagem(600, 400, true)
    const resultado = await otimizarParaEmail(original)
    expect(resultado.contentType).toBe('image/png')
    expect(resultado.ext).toBe('png')
    const metadata = await sharp(resultado.buffer).metadata()
    expect(metadata.format).toBe('png')
    expect(metadata.hasAlpha).toBe(true)
  })

  it('reduz o peso de uma imagem grande (compressão de verdade, não só resize)', async () => {
    const original = await gerarImagem(2000, 1500, false)
    const resultado = await otimizarParaEmail(original)
    expect(resultado.buffer.length).toBeLessThan(original.length)
  })
})
