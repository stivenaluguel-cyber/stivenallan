// Régua de competências: o ponto principal do bloco de notas fiscais.
//
// Não lista só o que existe — gera TODOS os meses entre a primeira nota
// registrada e o mês corrente, e marca como pendente qualquer mês sem
// nota. Uma lista que só mostra o que existe esconde exatamente o hiato
// que motivou este bloco (achado real em auto de infração CRECI-SC).
//
// Função pura: recebe as notas já buscadas e o "hoje" (em
// America/Sao_Paulo — quem chama resolve isso, ver
// src/lib/dashboard/timezone-sp.ts) e devolve a régua pronta. Sem banco,
// sem Date.now() aqui dentro — testável com qualquer combinação de datas.

export type NotaFiscal = {
  id: string
  /** "YYYY-MM-01" — sempre dia 1, é uma competência (mês/ano), não uma data exata. */
  competencia: string
  numero: string
  valor: number
  storagePath: string
  criadoEm: string
}

export type MesRegua = {
  /** "YYYY-MM-01" */
  competencia: string
  notas: NotaFiscal[]
  pendente: boolean
}

export type ResumoNotasFiscais = {
  totalAnoCorrente: number
  mesesPendentes: number
}

function competenciaAno(c: string): number {
  return Number(c.slice(0, 4))
}

/**
 * Régua completa, ordem cronológica DECRESCENTE. Lista vazia se não há
 * nenhuma nota — a régua só começa a existir quando há um primeiro mês de
 * referência; sem isso é o estado vazio (tratado fora deste módulo).
 */
export function gerarRegua(notas: NotaFiscal[], hojeYYYYMMDD: string): MesRegua[] {
  if (notas.length === 0) return []

  const porCompetencia = new Map<string, NotaFiscal[]>()
  for (const n of notas) {
    const lista = porCompetencia.get(n.competencia) ?? []
    lista.push(n)
    porCompetencia.set(n.competencia, lista)
  }

  const competencias = [...porCompetencia.keys()].sort()
  const primeira = competencias[0]
  const mesCorrente = `${hojeYYYYMMDD.slice(0, 7)}-01`

  // Se por algum motivo a nota mais antiga for "depois" do mês corrente
  // (relógio do cliente adiantado, dado futuro digitado errado), a régua
  // é só aquele mês — nunca uma régua invertida/negativa.
  const fim = mesCorrente >= primeira ? mesCorrente : primeira

  let [ano, mes] = primeira.split('-').map(Number)
  const [anoFim, mesFim] = fim.split('-').map(Number)

  const meses: MesRegua[] = []
  while (ano < anoFim || (ano === anoFim && mes <= mesFim)) {
    const competencia = `${ano}-${String(mes).padStart(2, '0')}-01`
    const notasDoMes = (porCompetencia.get(competencia) ?? [])
      .slice()
      .sort((a, b) => a.numero.localeCompare(b.numero, 'pt-BR', { numeric: true }))
    meses.push({ competencia, notas: notasDoMes, pendente: notasDoMes.length === 0 })
    mes++
    if (mes > 12) { mes = 1; ano++ }
  }

  return meses.reverse()
}

/**
 * `mesesPendentes` conta a régua inteira (desde a primeira nota), não só o
 * ano corrente — o hiato que motivou este bloco pode ser de anos
 * anteriores, e esconder isso do resumo reintroduziria o mesmo problema.
 */
export function calcularResumo(regua: MesRegua[], anoCorrente: number): ResumoNotasFiscais {
  const totalAnoCorrente = regua
    .filter((m) => competenciaAno(m.competencia) === anoCorrente)
    .reduce((soma, m) => soma + m.notas.reduce((s, n) => s + n.valor, 0), 0)

  const mesesPendentes = regua.filter((m) => m.pendente).length

  return { totalAnoCorrente, mesesPendentes }
}
