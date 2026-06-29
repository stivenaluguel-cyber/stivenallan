// API Route: GET /api/cub
// Monitora o CUB/SC publicado pelo SINDUSCON (Grande Florianopolis).
// Fonte oficial: https://sinduscon-fpolis.org.br/  (homepage exibe o valor vigente)
// O SINDUSCON nao oferece API publica; aqui fazemos o scraping do HTML da
// homepage, que traz "Mes de Referencia", "Para ser usado em" e os valores
// Residencial/Comercial Medio. Caso o layout do site mude ou o fetch falhe,
// caimos no FALLBACK (ultimo valor conhecido) para a UI nunca quebrar.
// >> PARA PLUGAR FONTE OFICIAL/PAGA NO FUTURO: troque apenas buscarDoSinduscon().

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
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

export async function GET() {
  let dados = FALLBACK
  let online = false
  try {
    dados = await buscarDoSinduscon()
    online = true
  } catch (e) {
    // mantem fallback; a UI segue funcionando
    online = false
  }

  // A competencia oficial e o mes "para ser usado em" (mes corrente de aplicacao)
  const comp = parseCompetencia(dados.usar_em_label) || parseCompetencia(dados.referencia_label)

  return NextResponse.json({
    valor_m2: dados.valor,
    comercial_m2: dados.comercial,
    competencia: comp?.key ?? null,
    competencia_label: comp?.label ?? dados.usar_em_label,
    referencia_label: dados.referencia_label,
    usar_em_label: dados.usar_em_label,
    fonte: FONTE,
    online,
    atualizado_em: new Date().toISOString(),
  })
}
