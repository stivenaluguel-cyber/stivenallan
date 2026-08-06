import { describe, it, expect } from 'vitest'
import { calcularPosicionamento, type ConfigMarcaDagua, type Dimensoes } from './posicionamento'

const PADRAO: ConfigMarcaDagua = { posicao: 'inferior-direita', opacidade: 0.6, larguraRelativa: 0.25 }

describe('calcularPosicionamento — escala proporcional', () => {
  it('foto paisagem: logo escala em proporção à largura da foto, não em pixels fixos', () => {
    const foto: Dimensoes = { largura: 4000, altura: 3000 }
    const logo: Dimensoes = { largura: 400, altura: 200 } // aspecto 1:2 (altura = metade da largura)
    const r = calcularPosicionamento(foto, logo, PADRAO)
    expect(r.larguraLogoPx).toBe(1000) // 25% de 4000
    expect(r.alturaLogoPx).toBe(500) // mantém aspecto da logo
  })

  it('a mesma logo numa foto 5x menor produz uma marca 5x menor em pixels — proporcional, não fixo', () => {
    const logo: Dimensoes = { largura: 400, altura: 200 }
    const grande = calcularPosicionamento({ largura: 4000, altura: 3000 }, logo, PADRAO)
    const pequena = calcularPosicionamento({ largura: 800, altura: 600 }, logo, PADRAO)
    expect(grande.larguraLogoPx).toBe(1000)
    expect(pequena.larguraLogoPx).toBe(200)
    expect(grande.larguraLogoPx / pequena.larguraLogoPx).toBe(5)
  })

  it('foto retrato: largura relativa ainda calculada sobre a LARGURA da foto (não a altura)', () => {
    const foto: Dimensoes = { largura: 1080, altura: 1920 } // retrato de celular
    const logo: Dimensoes = { largura: 300, altura: 100 }
    const r = calcularPosicionamento(foto, logo, PADRAO)
    expect(r.larguraLogoPx).toBe(270) // 25% de 1080, não de 1920
    expect(r.alturaLogoPx).toBe(90)
  })
})

describe('calcularPosicionamento — logo maior que a foto', () => {
  it('logo com largura/altura maiores que a foto nunca vaza pra fora do canvas', () => {
    const foto: Dimensoes = { largura: 200, altura: 150 }
    const logo: Dimensoes = { largura: 3000, altura: 3000 } // logo gigante, quadrada
    const r = calcularPosicionamento(foto, logo, { ...PADRAO, larguraRelativa: 0.9 })
    expect(r.larguraLogoPx).toBeLessThanOrEqual(200)
    expect(r.alturaLogoPx).toBeLessThanOrEqual(150)
    expect(r.left).toBeGreaterThanOrEqual(0)
    expect(r.top).toBeGreaterThanOrEqual(0)
    expect(r.left + r.larguraLogoPx).toBeLessThanOrEqual(200)
    expect(r.top + r.alturaLogoPx).toBeLessThanOrEqual(150)
  })

  it('logo muito alta (aspecto extremo) é reancorada pela altura da foto, sem estourar', () => {
    const foto: Dimensoes = { largura: 1000, altura: 400 } // paisagem baixa (banner)
    const logo: Dimensoes = { largura: 100, altura: 800 } // logo bem vertical
    // 25% de largura pediria largura=250, altura=250*8=2000 — estouraria os 400 de altura.
    const r = calcularPosicionamento(foto, logo, PADRAO)
    expect(r.alturaLogoPx).toBeLessThanOrEqual(400)
    expect(r.larguraLogoPx).toBeLessThanOrEqual(1000)
  })
})

describe('calcularPosicionamento — foto muito pequena', () => {
  it('foto menor que a margem + logo: a logo nunca nasce com coordenada negativa', () => {
    const foto: Dimensoes = { largura: 40, altura: 30 }
    const logo: Dimensoes = { largura: 100, altura: 50 }
    const r = calcularPosicionamento(foto, logo, PADRAO)
    expect(r.left).toBeGreaterThanOrEqual(0)
    expect(r.top).toBeGreaterThanOrEqual(0)
    expect(r.left + r.larguraLogoPx).toBeLessThanOrEqual(40)
    expect(r.top + r.alturaLogoPx).toBeLessThanOrEqual(30)
  })

  it('foto 1x1 não quebra (dimensão mínima defensiva)', () => {
    const r = calcularPosicionamento({ largura: 1, altura: 1 }, { largura: 50, altura: 50 }, PADRAO)
    expect(r.larguraLogoPx).toBeGreaterThan(0)
    expect(r.alturaLogoPx).toBeGreaterThan(0)
    expect(Number.isFinite(r.left)).toBe(true)
    expect(Number.isFinite(r.top)).toBe(true)
  })
})

describe('calcularPosicionamento — posições', () => {
  const foto: Dimensoes = { largura: 1000, altura: 800 }
  const logo: Dimensoes = { largura: 400, altura: 200 } // 250x125 depois de escalar a 25%

  it('centro: centralizada nos dois eixos', () => {
    const r = calcularPosicionamento(foto, logo, { ...PADRAO, posicao: 'centro' })
    expect(r.left).toBe(Math.round((1000 - r.larguraLogoPx) / 2))
    expect(r.top).toBe(Math.round((800 - r.alturaLogoPx) / 2))
  })

  it('inferior-direita: encostada no canto direito/inferior, com margem', () => {
    const r = calcularPosicionamento(foto, logo, { ...PADRAO, posicao: 'inferior-direita' })
    expect(r.left).toBeLessThan(1000 - r.larguraLogoPx) // tem margem, não encosta na borda exata
    expect(r.left + r.larguraLogoPx).toBeLessThan(1000)
    expect(r.top + r.alturaLogoPx).toBeLessThan(800)
  })

  it('inferior-esquerda: encostada no canto esquerdo/inferior, com margem', () => {
    const r = calcularPosicionamento(foto, logo, { ...PADRAO, posicao: 'inferior-esquerda' })
    expect(r.left).toBeGreaterThan(0)
    expect(r.top + r.alturaLogoPx).toBeLessThan(800)
  })

  it('inferior-esquerda e inferior-direita ficam na mesma altura (mesmo top)', () => {
    const esquerda = calcularPosicionamento(foto, logo, { ...PADRAO, posicao: 'inferior-esquerda' })
    const direita = calcularPosicionamento(foto, logo, { ...PADRAO, posicao: 'inferior-direita' })
    expect(esquerda.top).toBe(direita.top)
  })
})

describe('calcularPosicionamento — opacidade', () => {
  it('repassa a opacidade configurada', () => {
    const r = calcularPosicionamento({ largura: 100, altura: 100 }, { largura: 10, altura: 10 }, { ...PADRAO, opacidade: 0.6 })
    expect(r.opacidade).toBe(0.6)
  })

  it('nunca deixa a opacidade sair de 0-1 mesmo com config fora do range', () => {
    const acima = calcularPosicionamento({ largura: 100, altura: 100 }, { largura: 10, altura: 10 }, { ...PADRAO, opacidade: 1.5 })
    const abaixo = calcularPosicionamento({ largura: 100, altura: 100 }, { largura: 10, altura: 10 }, { ...PADRAO, opacidade: -0.2 })
    expect(acima.opacidade).toBe(1)
    expect(abaixo.opacidade).toBe(0)
  })
})
