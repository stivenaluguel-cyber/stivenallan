// Indicadores financeiros do Banco Central (APIs públicas, sem chave) —
// usado pela página pública /indicadores. Cada indicador é buscado de forma
// independente (Promise.allSettled): se um falhar, os outros continuam
// aparecendo — a página nunca quebra por causa de UM indicador fora do ar.

const SGS_BASE = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs'
const PTAX_BASE = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata'

export interface IndicadorValor {
  valor: number
  data: string // dd/mm/aaaa, como publicado pelo BC
}

export interface IndicadoresBcb {
  selic: IndicadorValor | null // Meta Selic (% a.a.) — SGS 432
  cdi: IndicadorValor | null // CDI acumulado no mês (% a.m.) — SGS 4391
  igpm: IndicadorValor | null // IGP-M, variação mensal (% a.m.) — SGS 189
  poupanca: IndicadorValor | null // Poupança, rendimento do período (% a.m.) — SGS 195
  dolar: { compra: number; venda: number; data: string } | null
  euro: { compra: number; venda: number; data: string } | null
  atualizado_em: string
}

async function buscarSgs(codigo: number): Promise<IndicadorValor | null> {
  try {
    const res = await fetch(`${SGS_BASE}.${codigo}/dados/ultimos/1?formato=json`, { cache: 'no-store' })
    if (!res.ok) return null
    const rows = (await res.json()) as Array<{ data: string; valor: string }>
    const ultimo = rows[rows.length - 1]
    if (!ultimo) return null
    const valor = parseFloat(ultimo.valor)
    if (Number.isNaN(valor)) return null
    return { valor, data: ultimo.data }
  } catch {
    return null
  }
}

function formatarDataPtax(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${mm}-${dd}-${d.getFullYear()}`
}

// PTAX só publica em dia útil — busca os últimos 10 dias corridos e fica com
// o fechamento mais recente, em vez de adivinhar qual foi o último dia útil.
async function buscarPtax(moeda: 'dolar' | 'euro'): Promise<{ compra: number; venda: number; data: string } | null> {
  try {
    const fim = new Date()
    const inicio = new Date(fim)
    inicio.setDate(inicio.getDate() - 10)

    const endpoint =
      moeda === 'dolar'
        ? `${PTAX_BASE}/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@dataInicial='${formatarDataPtax(inicio)}'&@dataFinalCotacao='${formatarDataPtax(fim)}'&$format=json`
        : `${PTAX_BASE}/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@moeda='EUR'&@dataInicial='${formatarDataPtax(inicio)}'&@dataFinalCotacao='${formatarDataPtax(fim)}'&$format=json`

    const res = await fetch(endpoint, { cache: 'no-store' })
    if (!res.ok) return null
    const json = (await res.json()) as { value: Array<{ cotacaoCompra: number; cotacaoVenda: number; dataHoraCotacao: string; tipoBoletim?: string }> }
    const fechamentos = json.value.filter((v) => !v.tipoBoletim || v.tipoBoletim === 'Fechamento')
    const ultimo = fechamentos[fechamentos.length - 1] ?? json.value[json.value.length - 1]
    if (!ultimo) return null
    return { compra: ultimo.cotacaoCompra, venda: ultimo.cotacaoVenda, data: ultimo.dataHoraCotacao.slice(0, 10).split('-').reverse().join('/') }
  } catch {
    return null
  }
}

export async function buscarIndicadoresBcb(): Promise<IndicadoresBcb> {
  const [selic, cdi, igpm, poupanca, dolar, euro] = await Promise.all([
    buscarSgs(432),
    buscarSgs(4391),
    buscarSgs(189),
    buscarSgs(195),
    buscarPtax('dolar'),
    buscarPtax('euro'),
  ])

  return { selic, cdi, igpm, poupanca, dolar, euro, atualizado_em: new Date().toISOString() }
}
