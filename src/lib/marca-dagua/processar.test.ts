import { describe, it, expect } from 'vitest'
import sharp from 'sharp'
import { aplicarMarcaDagua } from './processar'
import type { ConfigMarcaDagua } from './posicionamento'

const CONFIG: ConfigMarcaDagua = { posicao: 'inferior-direita', opacidade: 0.6, larguraRelativa: 0.25 }

async function foto(largura: number, altura: number): Promise<Buffer> {
  return sharp({ create: { width: largura, height: altura, channels: 3, background: { r: 120, g: 130, b: 140 } } })
    .jpeg()
    .toBuffer()
}

async function logoComAlpha(largura = 200, altura = 100): Promise<Buffer> {
  return sharp({ create: { width: largura, height: altura, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 0.8 } } })
    .png()
    .toBuffer()
}

describe('aplicarMarcaDagua', () => {
  it('foto paisagem: gera JPEG do mesmo tamanho da foto original', async () => {
    const f = await foto(800, 500)
    const l = await logoComAlpha()
    const r = await aplicarMarcaDagua(f, l, CONFIG)
    expect(r.largura).toBe(800)
    expect(r.altura).toBe(500)
    expect(r.contentType).toBe('image/jpeg')
    const metaSaida = await sharp(r.buffer).metadata()
    expect(metaSaida.width).toBe(800)
    expect(metaSaida.height).toBe(500)
  })

  it('foto retrato: dimensões preservadas, sem inverter largura/altura', async () => {
    const f = await foto(600, 1200)
    const l = await logoComAlpha()
    const r = await aplicarMarcaDagua(f, l, CONFIG)
    expect(r.largura).toBe(600)
    expect(r.altura).toBe(1200)
  })

  it('foto muito pequena: não lança erro, produz uma imagem válida do mesmo tamanho', async () => {
    const f = await foto(50, 40)
    const l = await logoComAlpha(200, 100)
    const r = await aplicarMarcaDagua(f, l, CONFIG)
    expect(r.largura).toBe(50)
    expect(r.altura).toBe(40)
    const metaSaida = await sharp(r.buffer).metadata()
    expect(metaSaida.width).toBe(50)
    expect(metaSaida.height).toBe(40)
  })

  it('logo maior que a foto: não lança erro, resultado continua do tamanho da foto', async () => {
    const f = await foto(300, 200)
    const l = await logoComAlpha(2000, 2000)
    const r = await aplicarMarcaDagua(f, l, CONFIG)
    expect(r.largura).toBe(300)
    expect(r.altura).toBe(200)
    const metaSaida = await sharp(r.buffer).metadata()
    expect(metaSaida.width).toBe(300)
    expect(metaSaida.height).toBe(200)
  })

  it('PNG de entrada (planta baixa) sai como PNG, não JPEG', async () => {
    const plantaBaixa = await sharp({ create: { width: 400, height: 300, channels: 3, background: { r: 255, g: 255, b: 255 } } })
      .png()
      .toBuffer()
    const l = await logoComAlpha()
    const r = await aplicarMarcaDagua(plantaBaixa, l, CONFIG)
    expect(r.contentType).toBe('image/png')
    const metaSaida = await sharp(r.buffer).metadata()
    expect(metaSaida.format).toBe('png')
  })

  describe('orientação EXIF', () => {
    it('foto com EXIF orientation=6 (girar 90°) sai com as dimensões de EXIBIÇÃO, não as cruas', async () => {
      // Pixels crus 120x80 (paisagem), mas orientation=6 diz "gire 90° pra
      // exibir corretamente" — exibição correta é 80x120 (retrato).
      const cru = await sharp({ create: { width: 120, height: 80, channels: 3, background: { r: 10, g: 200, b: 10 } } })
        .jpeg()
        .withMetadata({ orientation: 6 })
        .toBuffer()

      // Confere que o fixture está mesmo configurado como eu penso antes de
      // testar o comportamento — senão um bug no fixture mascararia um bug
      // real (ou o inverso).
      const metaCru = await sharp(cru).metadata()
      expect(metaCru.orientation).toBe(6)

      const l = await logoComAlpha()
      const r = await aplicarMarcaDagua(cru, l, CONFIG)

      // Se a rotação EXIF não tivesse sido aplicada, largura/altura sairiam
      // 120x80 (cru) em vez de 80x120 (exibição) — a marca sairia "deitada".
      expect(r.largura).toBe(80)
      expect(r.altura).toBe(120)

      const metaSaida = await sharp(r.buffer).metadata()
      expect(metaSaida.width).toBe(80)
      expect(metaSaida.height).toBe(120)
      // EXIF removido do resultado (rotate() sem argumento já corrigiu e
      // "queimou" a orientação nos pixels — não deve sobrar tag pra girar de novo).
      expect(metaSaida.orientation).toBeUndefined()
    })
  })
})
