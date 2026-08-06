import sharp, { type Metadata } from 'sharp'

// Validação da logo enviada pelo corretor. PNG com canal alpha é exigido
// porque a marca é composta POR CIMA da foto — sem transparência, o fundo
// da própria logo (quase sempre branco ou preto) cobriria a foto inteira
// em vez de só sobrepor o desenho.
export const TAMANHO_MAXIMO_LOGO_BYTES = 2 * 1024 * 1024

export type ValidacaoLogo = { ok: true } | { ok: false; erro: string }

export async function validarLogo(buffer: Buffer, mime: string, tamanhoBytes: number): Promise<ValidacaoLogo> {
  if (mime !== 'image/png') {
    return {
      ok: false,
      erro: 'A logo precisa ser um PNG com fundo transparente. Um JPEG sempre tem fundo sólido (geralmente branco), que cobriria a foto em vez de só sobrepor o desenho da marca.',
    }
  }

  if (tamanhoBytes > TAMANHO_MAXIMO_LOGO_BYTES) {
    return { ok: false, erro: `Arquivo muito grande — máximo de ${Math.round(TAMANHO_MAXIMO_LOGO_BYTES / (1024 * 1024))}MB.` }
  }

  let metadata: Metadata
  try {
    metadata = await sharp(buffer).metadata()
  } catch {
    return { ok: false, erro: 'Não foi possível ler o arquivo como imagem — confira se ele não está corrompido.' }
  }

  if (metadata.format !== 'png') {
    return { ok: false, erro: 'O conteúdo do arquivo não é um PNG de verdade, mesmo com essa extensão/tipo.' }
  }

  if (!metadata.hasAlpha) {
    return {
      ok: false,
      erro: 'Esse PNG não tem canal alpha (fundo transparente). Exporte a logo com fundo transparente — no Photoshop/Figma/Canva, a opção costuma se chamar "PNG transparente".',
    }
  }

  return { ok: true }
}
