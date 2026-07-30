// A tabela de preços em PDF, guardada por empreendimento.
//
// A Fontana tira os PDFs do Drive no meio do mês e publica a tabela do mês
// seguinte no lugar. Quem precisa consultar a condição que foi passada ao
// cliente na semana anterior fica sem o documento — e as unidades importadas
// no espelho não guardam o papel que as originou.
//
// Guardar o arquivo aqui resolve os dois: o documento fica, e fica junto do
// empreendimento a que pertence.
//
// A chave é o SLUG, não o id. O mesmo prédio tem linha em `properties` e em
// `empreendimentos` com ids diferentes (ver resolver-empreendimento.ts); o slug
// é a única coisa igual nas duas.

/** Só PDF. Tabela de preço é documento oficial da construtora, não print. */
export const MIME_TABELA = 'application/pdf'
export const TAMANHO_MAXIMO_TABELA_BYTES = 15 * 1024 * 1024

export type ValidacaoTabela = { ok: true } | { ok: false; erro: string }

export function validarTabela(nome: string, mime: string, tamanho: number): ValidacaoTabela {
  if (!nome || !nome.trim()) return { ok: false, erro: 'Arquivo sem nome' }
  if (mime !== MIME_TABELA) {
    return { ok: false, erro: `Envie o PDF da tabela (recebido: ${mime || 'formato desconhecido'}).` }
  }
  if (tamanho <= 0) return { ok: false, erro: 'Arquivo vazio' }
  if (tamanho > TAMANHO_MAXIMO_TABELA_BYTES) {
    const mb = (tamanho / (1024 * 1024)).toFixed(1)
    return { ok: false, erro: `Arquivo de ${mb} MB excede o limite de 15 MB.` }
  }
  return { ok: true }
}

/**
 * Normaliza a competência para o primeiro dia do mês.
 *
 * A tabela vale por mês inteiro ("validade desta tabela — até final do mês
 * corrente"), então guardar o dia só criaria duplicata: a mesma tabela subida
 * no dia 3 e no dia 20 viraria dois registros do mesmo mês.
 *
 * Aceita `2026-07`, `2026-07-15` e `07/2026`.
 */
export function competenciaISO(valor: unknown): string | null {
  const s = String(valor ?? '').trim()
  if (!s) return null

  let ano: number, mes: number
  const iso = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(s)
  const br = /^(\d{2})\/(\d{4})$/.exec(s)
  if (iso) { ano = Number(iso[1]); mes = Number(iso[2]) }
  else if (br) { ano = Number(br[2]); mes = Number(br[1]) }
  else return null

  if (mes < 1 || mes > 12) return null
  if (ano < 2000 || ano > 2100) return null
  return `${ano}-${String(mes).padStart(2, '0')}-01`
}

/** "2026-07-01" → "julho de 2026", para a tela. */
export function competenciaLabel(iso: string | null | undefined): string {
  const s = String(iso ?? '')
  const m = /^(\d{4})-(\d{2})/.exec(s)
  if (!m) return '—'
  const MESES = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ]
  const mes = MESES[Number(m[2]) - 1]
  return mes ? `${mes} de ${m[1]}` : '—'
}

/**
 * Caminho no bucket privado.
 *
 * O sufixo único evita que reenviar a tabela do mesmo mês sobrescreva o arquivo
 * anterior enquanto alguém está com o link assinado aberto.
 */
export function caminhoTabela(slug: string, competencia: string, sufixoUnico: string): string {
  const limpo = slug.replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'sem-slug'
  return `tabelas/${limpo}/${competencia}-${sufixoUnico}.pdf`
}

/** A competência do mês corrente, para pré-preencher o formulário. */
export function competenciaDoMes(agora: Date): string {
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-01`
}

/**
 * Uma tabela vence no fim do mês da sua competência.
 *
 * Serve para a tela avisar "esta tabela é de junho" em vez de exibir um preço
 * velho como se fosse o de hoje.
 */
export function tabelaVencida(competencia: string, agora: Date): boolean {
  const atual = competenciaDoMes(agora)
  return competencia < atual
}

/**
 * Quantas tabelas ficam guardadas por empreendimento.
 *
 * Duas: a vigente e a anterior. A anterior importa porque proposta feita sob a
 * tabela do mês passado costuma fechar no mês seguinte — e aí é preciso provar
 * a condição que foi oferecida.
 *
 * Guardar tudo cresce sem teto: ~512 KB por PDF (medida real do Pineto) × 36
 * imóveis × 12 meses ≈ 216 MB por ano, para sempre. Com o limite de duas, o
 * total para em ~37 MB e não cresce mais.
 */
export const TABELAS_GUARDADAS = 2

export type PlanoRetencao = {
  /** Competências que continuam guardadas, da mais recente para a mais antiga. */
  manter: string[]
  /** Competências que saem — registro e arquivo. */
  descartar: string[]
  /** false quando a tabela enviada já nasce fora da janela. */
  novaEntra: boolean
}

/**
 * Decide o que fica e o que sai depois de enviar uma tabela nova.
 *
 * `novaEntra: false` acontece quando alguém envia uma tabela mais antiga que as
 * que já estão guardadas. Aí o certo é recusar antes do upload, e não aceitar
 * para apagar em seguida — arquivo que some sozinho depois de "salvo" parece
 * defeito.
 */
export function planoDeRetencao(
  existentes: string[],
  nova: string,
  limite: number = TABELAS_GUARDADAS,
): PlanoRetencao {
  const todas = [...new Set([...existentes, nova])].sort().reverse()
  const manter = todas.slice(0, Math.max(1, limite))
  const descartar = todas.slice(Math.max(1, limite))
  return { manter, descartar, novaEntra: manter.includes(nova) }
}
