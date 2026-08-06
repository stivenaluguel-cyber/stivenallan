// Validação de entrada manual — não há integração com emissor, o corretor
// digita tudo. Funções puras: recebem os valores já extraídos do form/body,
// sem saber de FormData, Supabase ou HTTP.

export type ValidacaoNota = { ok: true } | { ok: false; erro: string }

const COMPETENCIA_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/

/** Aceita "YYYY-MM" (o formato nativo de <input type="month">). */
export function validarCompetencia(v: string): ValidacaoNota {
  if (!v || !COMPETENCIA_REGEX.test(v)) {
    return { ok: false, erro: 'Competência deve estar no formato mês/ano.' }
  }
  const ano = Number(v.slice(0, 4))
  if (ano < 2000 || ano > 2100) return { ok: false, erro: 'Ano fora do intervalo aceito.' }
  return { ok: true }
}

/** "YYYY-MM" -> "YYYY-MM-01", a forma como a competência é guardada (sempre dia 1). */
export function competenciaParaData(v: string): string {
  return `${v}-01`
}

/** "YYYY-MM-01" -> "YYYY-MM", pro <input type="month"> ler de volta. */
export function dataParaCompetencia(v: string): string {
  return v.slice(0, 7)
}

export function validarValor(v: number): ValidacaoNota {
  if (!Number.isFinite(v) || v <= 0) return { ok: false, erro: 'Valor deve ser um número positivo.' }
  return { ok: true }
}

export function validarNumero(v: string): ValidacaoNota {
  if (!v || !v.trim()) return { ok: false, erro: 'Número da nota é obrigatório.' }
  if (v.trim().length > 50) return { ok: false, erro: 'Número da nota muito longo.' }
  return { ok: true }
}

export const TAMANHO_MAXIMO_PDF_BYTES = 10 * 1024 * 1024

export function validarArquivoPdf(mime: string, tamanhoBytes: number): ValidacaoNota {
  if (mime !== 'application/pdf') return { ok: false, erro: 'Envie um arquivo PDF.' }
  if (tamanhoBytes > TAMANHO_MAXIMO_PDF_BYTES) {
    return { ok: false, erro: `Arquivo muito grande — máximo de ${Math.round(TAMANHO_MAXIMO_PDF_BYTES / (1024 * 1024))}MB.` }
  }
  if (tamanhoBytes <= 0) return { ok: false, erro: 'Arquivo vazio.' }
  return { ok: true }
}
