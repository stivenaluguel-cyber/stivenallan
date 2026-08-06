import { describe, it, expect } from 'vitest'
import sharp from 'sharp'
import { validarLogo, TAMANHO_MAXIMO_LOGO_BYTES } from './logo'

async function pngComAlpha(): Promise<Buffer> {
  return sharp({ create: { width: 40, height: 40, channels: 4, background: { r: 10, g: 20, b: 30, alpha: 0 } } })
    .png()
    .toBuffer()
}

async function pngSemAlpha(): Promise<Buffer> {
  return sharp({ create: { width: 40, height: 40, channels: 3, background: { r: 255, g: 255, b: 255 } } })
    .png()
    .toBuffer()
}

async function jpegQualquer(): Promise<Buffer> {
  return sharp({ create: { width: 40, height: 40, channels: 3, background: { r: 200, g: 0, b: 0 } } })
    .jpeg()
    .toBuffer()
}

describe('validarLogo', () => {
  it('aceita PNG com canal alpha', async () => {
    const buf = await pngComAlpha()
    const r = await validarLogo(buf, 'image/png', buf.length)
    expect(r.ok).toBe(true)
  })

  it('rejeita JPEG explicando o motivo (fundo cobriria a foto)', async () => {
    const buf = await jpegQualquer()
    const r = await validarLogo(buf, 'image/jpeg', buf.length)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.erro).toMatch(/transparente/i)
      expect(r.erro).toMatch(/fundo/i)
    }
  })

  it('rejeita PNG sem canal alpha, explicando o motivo', async () => {
    const buf = await pngSemAlpha()
    const r = await validarLogo(buf, 'image/png', buf.length)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toMatch(/alpha|transparen/i)
  })

  it('rejeita arquivo maior que o teto, mesmo sendo um PNG válido com alpha', async () => {
    const buf = await pngComAlpha()
    const r = await validarLogo(buf, 'image/png', TAMANHO_MAXIMO_LOGO_BYTES + 1)
    expect(r.ok).toBe(false)
  })

  it('rejeita mime declarado como png quando os bytes são de outro formato', async () => {
    const buf = await jpegQualquer()
    const r = await validarLogo(buf, 'image/png', buf.length)
    expect(r.ok).toBe(false)
  })

  it('rejeita buffer corrompido/ilegível', async () => {
    const r = await validarLogo(Buffer.from('isso não é uma imagem'), 'image/png', 100)
    expect(r.ok).toBe(false)
  })
})
