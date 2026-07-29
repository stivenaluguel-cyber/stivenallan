// Monitora o CUB/SC publicado pelo SINDUSCON (Grande Florianopolis) via
// scraping da homepage — não confundir com src/lib/cub.ts (config estática
// manual usada nas páginas de empreendimento). Este módulo é o valor "ao
// vivo", consumido por /api/cub e pela página pública /indicadores.
//
// Fonte oficial: https://sinduscon-fpolis.org.br/  (homepage exibe o valor vigente)
// O SINDUSCON nao oferece API publica; aqui fazemos o scraping do HTML da
// homepage, que traz "Mes de Referencia", "Para ser usado em" e os valores
// Residencial/Comercial Medio. Caso o layout do site mude ou o fetch falhe,
// caimos no FALLBACK (ultimo valor conhecido) para a UI nunca quebrar.
// >> PARA PLUGAR FONTE OFICIAL/PAGA NO FUTURO: troque apenas buscarDoSinduscon().
//
// Extraído de src/app/api/cub/route.ts pra ser reutilizável também pela
// página pública /indicadores (evita um hop HTTP interno pra chamar a
// própria API do site).

const FONTE = 'https://sinduscon-fpolis.org.br/'

// Fallback: ultimo valor conhecido (Maio/2026, usado em Junho/2026).
// Atualizado automaticamente sempre que o scraping funcionar.
const FALLBACK = {
  valor: 3096.25,
  comercial: 3297.09,
  referencia_label: 'Maio/2026',
  usar_em_label: 'Junho/2026',
}

const MESES: Record<string, number> = {
  janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
}

function normaliza(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

// Converte "Junho/2026" -> { key: "2026-06", label: "Junho/2026" }
function parseCompetencia(label: string) {
  const m = label.match(/([A-Za-zçÇ]+)\s*\/?\s*(\d{4})/)
  if (!m) return null
  const mes = MESES[normaliza(m[1])]
  if (!mes) return null
  const ano = m[2]
  return { key: `${ano}-${String(mes).padStart(2, '0')}`, label: `${m[1]}/${ano}` }
}

// Converte "3.096,25" -> 3096.25
function parseMoeda(s: string): number {
  return parseFloat(s.replace(/\./g, '').replace(',', '.'))
}

async function buscarDoSinduscon() {
  const res = await fetch(FONTE, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SA-Imoveis-CRM/1.0)' },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('SINDUSCON respondeu ' + res.status)
  const html = await res.text()
  // remove tags para facilitar o parse do texto visivel
  const texto = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ')

  const refMatch = texto.match(/Refer[eê]ncia[:\s]*([A-Za-zçÇ]+\/?\s*\d{4})/i)
  const usarMatch = texto.match(/usado em[:\s]*([A-Za-zçÇ]+\/?\s*\d{4})/i)
  // pega os dois primeiros valores R$ (Residencial Medio e Comercial Medio)
  const valores = texto.match(/R\$\s*([\d.]+,\d{2})/g) || []

  const valor = valores[0] ? parseMoeda(valores[0].replace(/R\$\s*/, '')) : FALLBACK.valor
  const comercial = valores[1] ? parseMoeda(valores[1].replace(/R\$\s*/, '')) : FALLBACK.comercial
  const referencia_label = refMatch ? refMatch[1].replace(/\s+/g, '') : FALLBACK.referencia_label
  const usar_em_label = usarMatch ? usarMatch[1].replace(/\s+/g, '') : FALLBACK.usar_em_label

  return { valor, comercial, referencia_label, usar_em_label }
}

export interface CubResult {
  valor_m2: number
  comercial_m2: number
  competencia: string | null
  competencia_label: string | null
  referencia_label: string
  usar_em_label: string
  fonte: string
  online: boolean
  atualizado_em: string
}

// ─────────────────────────────────────────────────────────────────────
// Guardas de sanidade do valor raspado.
//
// O scraping pega `valores[0]` da homepage — o primeiro "R$ x,xx" do texto.
// Se o SINDUSCON puser um banner de evento com preço antes do CUB, o site
// inteiro passaria a exibir R$ 199,90/m² como indicador oficial, e — pior —
// qualquer preço derivado de CUB (espelho de vendas) derreteria junto.
// Hoje o risco é só reputacional; com preço derivado, vira financeiro.
// ─────────────────────────────────────────────────────────────────────

// Faixa dura: CUB/SC residencial médio orbita R$ 3.0–3.6 mil em 2026.
// Os limites são largos de propósito — pegam banner e erro de parse, não
// travam a evolução normal do índice por anos.
const CUB_MINIMO = 2000
const CUB_MAXIMO = 6000
// O CUB é um índice de custo de construção: variação mensal típica fica
// abaixo de 1,5%. Um salto de 5% num mês é quase certamente erro de leitura.
const VARIACAO_MENSAL_MAXIMA = 0.05

export type ValidacaoCub = { ok: true } | { ok: false; motivo: string }

export function validarCubColetado(
  valor: number,
  anterior: number | null | undefined,
): ValidacaoCub {
  if (!Number.isFinite(valor) || valor <= 0) {
    return { ok: false, motivo: 'valor coletado não é um número válido' }
  }
  if (valor < CUB_MINIMO || valor > CUB_MAXIMO) {
    return {
      ok: false,
      motivo: `valor R$ ${valor.toFixed(2)} fora da faixa plausível (${CUB_MINIMO}–${CUB_MAXIMO})`,
    }
  }
  if (anterior && Number.isFinite(anterior) && anterior > 0) {
    const variacao = Math.abs(valor - anterior) / anterior
    if (variacao > VARIACAO_MENSAL_MAXIMA) {
      return {
        ok: false,
        motivo: `variação de ${(variacao * 100).toFixed(1)}% sobre o último valor conhecido (R$ ${anterior.toFixed(2)}) excede o máximo mensal de ${VARIACAO_MENSAL_MAXIMA * 100}%`,
      }
    }
  }
  return { ok: true }
}

export async function buscarCub(): Promise<CubResult> {
  let dados = FALLBACK
  let online = false
  try {
    const coletado = await buscarDoSinduscon()
    // Valor rejeitado = mesma coisa que scraping falhado: fica o fallback e
    // `online: false` avisa a UI (o dashboard já mostra o alerta amarelo).
    const v = validarCubColetado(coletado.valor, FALLBACK.valor)
    if (!v.ok) throw new Error('CUB rejeitado pela guarda: ' + v.motivo)
    dados = coletado
    online = true
  } catch {
    // mantem fallback; a UI segue funcionando
    online = false
  }

  // A competencia oficial e o mes "para ser usado em" (mes corrente de aplicacao)
  const comp = parseCompetencia(dados.usar_em_label) || parseCompetencia(dados.referencia_label)

  return {
    valor_m2: dados.valor,
    comercial_m2: dados.comercial,
    competencia: comp?.key ?? null,
    competencia_label: comp?.label ?? dados.usar_em_label,
    referencia_label: dados.referencia_label,
    usar_em_label: dados.usar_em_label,
    fonte: FONTE,
    online,
    atualizado_em: new Date().toISOString(),
  }
}
