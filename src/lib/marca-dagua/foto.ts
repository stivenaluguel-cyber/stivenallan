export const TAMANHO_MAXIMO_FOTO_BYTES = 20 * 1024 * 1024
const MIMES_FOTO = new Set(['image/jpeg', 'image/png', 'image/webp'])
const EXT_POR_MIME: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

export type ValidacaoFoto = { ok: true } | { ok: false; erro: string }

export function validarFotoImovel(mime: string, tamanhoBytes: number): ValidacaoFoto {
  if (!MIMES_FOTO.has(mime)) return { ok: false, erro: 'Formato não aceito — envie JPEG, PNG ou WebP.' }
  if (tamanhoBytes > TAMANHO_MAXIMO_FOTO_BYTES) {
    return { ok: false, erro: `Arquivo muito grande — máximo de ${Math.round(TAMANHO_MAXIMO_FOTO_BYTES / (1024 * 1024))}MB.` }
  }
  return { ok: true }
}

export function extensaoPorMime(mime: string): string {
  return EXT_POR_MIME[mime] ?? 'jpg'
}
