// Matemática pura de posicionamento da marca d'água. Recebe dimensões (em
// pixels, já pós-correção de EXIF — quem chama garante isso) e devolve onde
// e em que tamanho compor a logo. Sem sharp, sem I/O — testável com números
// direto.

export type PosicaoMarcaDagua = 'centro' | 'inferior-direita' | 'inferior-esquerda'

export type ConfigMarcaDagua = {
  posicao: PosicaoMarcaDagua
  /** 0-1 (ex.: 0.6 = 60%) */
  opacidade: number
  /** 0-1, fração da largura da FOTO que a logo deve ocupar (ex.: 0.25 = 25%) */
  larguraRelativa: number
}

export type Dimensoes = { largura: number; altura: number }

export type ResultadoPosicionamento = {
  larguraLogoPx: number
  alturaLogoPx: number
  left: number
  top: number
  opacidade: number
}

// Margem da borda pra posições de canto, como fração da menor dimensão da
// foto — cresce com a foto (não é um valor fixo em px que sumiria numa foto
// grande ou dominaria uma pequena).
const MARGEM_RELATIVA = 0.03

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), Math.max(min, max))
}

export function calcularPosicionamento(foto: Dimensoes, logo: Dimensoes, config: ConfigMarcaDagua): ResultadoPosicionamento {
  const fotoLargura = Math.max(1, Math.round(foto.largura))
  const fotoAltura = Math.max(1, Math.round(foto.altura))
  const logoLargura = Math.max(1, logo.largura)
  const logoAltura = Math.max(1, logo.altura)
  const aspectoLogo = logoAltura / logoLargura

  // Alvo: largura relativa à foto, nunca passando da própria foto (mesmo
  // que a config peça mais que 100%).
  let larguraLogoPx = Math.round(clamp(config.larguraRelativa, 0.01, 1) * fotoLargura)
  let alturaLogoPx = Math.round(larguraLogoPx * aspectoLogo)

  // Logo desproporcionalmente alta (ou foto muito baixa/paisagem estreita):
  // se mesmo respeitando a largura relativa a altura estourar a foto,
  // reancora pela altura em vez de deixar a marca vazar pra fora da imagem.
  if (alturaLogoPx > fotoAltura) {
    alturaLogoPx = fotoAltura
    larguraLogoPx = Math.round(alturaLogoPx / aspectoLogo)
  }
  // Depois do reancoramento por altura, ainda pode sobrar largura de menos
  // (caso extremo: logo maior que a foto nas duas dimensões) — trava de novo.
  larguraLogoPx = Math.min(larguraLogoPx, fotoLargura)
  alturaLogoPx = Math.min(alturaLogoPx, fotoAltura)
  larguraLogoPx = Math.max(1, larguraLogoPx)
  alturaLogoPx = Math.max(1, alturaLogoPx)

  const margem = Math.round(MARGEM_RELATIVA * Math.min(fotoLargura, fotoAltura))

  let left: number
  let top: number
  switch (config.posicao) {
    case 'centro':
      left = Math.round((fotoLargura - larguraLogoPx) / 2)
      top = Math.round((fotoAltura - alturaLogoPx) / 2)
      break
    case 'inferior-esquerda':
      left = margem
      top = fotoAltura - alturaLogoPx - margem
      break
    case 'inferior-direita':
    default:
      left = fotoLargura - larguraLogoPx - margem
      top = fotoAltura - alturaLogoPx - margem
      break
  }

  // Foto muito pequena (menor que a margem + logo): nunca deixa a logo
  // nascer fora do canvas, mesmo que isso signifique cobrir quase tudo.
  left = clamp(left, 0, fotoLargura - larguraLogoPx)
  top = clamp(top, 0, fotoAltura - alturaLogoPx)

  return {
    larguraLogoPx,
    alturaLogoPx,
    left,
    top,
    opacidade: clamp(config.opacidade, 0, 1),
  }
}
