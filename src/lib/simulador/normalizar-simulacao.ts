// Simulação salva no histórico do lead.
//
// O /dashboard/simulador calculava e jogava fora: o corretor mostrava a
// parcela ao cliente e, no follow-up seguinte, não tinha como retomar
// ("na simulação que fizemos, a parcela ficava em X"). Aqui o cenário vira
// registro, aparece na timeline do lead e pode ser reaberto.

export type SimulacaoPayload = {
  lead_id?: unknown
  empreendimento_slug?: unknown
  empreendimento_nome?: unknown
  valor_imovel?: unknown
  entrada?: unknown
  parcelas_qtd?: unknown
  parcelas_valor?: unknown
  reforcos_qtd?: unknown
  reforcos_valor?: unknown
  chaves_valor?: unknown
  correcao?: unknown
  detalhes?: unknown
  clientEventId?: unknown
}

export type SimulacaoInsert = {
  lead_id: string
  admin_id: string | null
  empreendimento_slug: string | null
  empreendimento_nome: string | null
  valor_imovel: number
  entrada: number | null
  parcelas_qtd: number | null
  parcelas_valor: number | null
  reforcos_qtd: number | null
  reforcos_valor: number | null
  chaves_valor: number | null
  correcao: string | null
  detalhes: Record<string, unknown>
  client_event_id: string | null
}

const CORRECOES = new Set(['igpm', 'incc', 'ipca', 'cub', 'nenhuma'])

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'string' ? Number(v.replace(/\./g, '').replace(',', '.')) : Number(v)
  return Number.isFinite(n) && n >= 0 ? n : null
}

// Contagem (parcelas, reforços) NÃO passa pelo parsing de moeda: lá o ponto
// é separador de milhar, então "60.7" viraria 607 parcelas em vez de 60.
function inteiro(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Number(typeof v === 'string' ? v.replace(',', '.') : v)
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null
}

function texto(v: unknown, max = 200): string | null {
  return typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null
}

export type ResultadoNormalizacao =
  | { ok: true; insert: SimulacaoInsert }
  | { ok: false; erro: string }

export function normalizarSimulacao(body: SimulacaoPayload, adminId: string | null): ResultadoNormalizacao {
  const leadId = texto(body.lead_id, 64)
  if (!leadId) return { ok: false, erro: 'lead_id é obrigatório — a simulação existe para ficar no histórico de um lead' }

  const valor = num(body.valor_imovel)
  if (valor === null || valor <= 0) return { ok: false, erro: 'valor_imovel deve ser maior que zero' }

  const entrada = num(body.entrada)
  if (entrada !== null && entrada > valor) {
    return { ok: false, erro: 'entrada não pode ser maior que o valor do imóvel' }
  }

  const correcaoBruta = texto(body.correcao, 20)?.toLowerCase() ?? null

  // `detalhes` guarda o cenário completo (tabela de prazos, comparativo
  // bancário) para reabrir a simulação como foi apresentada. Só aceitamos
  // objeto — array ou string aqui seria dado malformado no jsonb.
  const detalhes =
    body.detalhes && typeof body.detalhes === 'object' && !Array.isArray(body.detalhes)
      ? (body.detalhes as Record<string, unknown>)
      : {}

  return {
    ok: true,
    insert: {
      lead_id: leadId,
      admin_id: adminId,
      empreendimento_slug: texto(body.empreendimento_slug, 120),
      empreendimento_nome: texto(body.empreendimento_nome, 200),
      valor_imovel: valor,
      entrada,
      parcelas_qtd: inteiro(body.parcelas_qtd),
      parcelas_valor: num(body.parcelas_valor),
      reforcos_qtd: inteiro(body.reforcos_qtd),
      reforcos_valor: num(body.reforcos_valor),
      chaves_valor: num(body.chaves_valor),
      correcao: correcaoBruta && CORRECOES.has(correcaoBruta) ? correcaoBruta : null,
      detalhes,
      client_event_id: texto(body.clientEventId, 64),
    },
  }
}

const fmtBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Uma linha legível para a timeline do lead — o corretor bate o olho e
// lembra do cenário sem abrir nada.
export function descreverSimulacao(s: Pick<SimulacaoInsert, 'valor_imovel' | 'entrada' | 'parcelas_qtd' | 'parcelas_valor' | 'empreendimento_nome'>): string {
  const partes: string[] = []
  if (s.empreendimento_nome) partes.push(s.empreendimento_nome)
  partes.push('Imóvel ' + fmtBRL(s.valor_imovel))
  if (s.entrada) partes.push('entrada ' + fmtBRL(s.entrada))
  if (s.parcelas_qtd && s.parcelas_valor) partes.push(`${s.parcelas_qtd}x de ${fmtBRL(s.parcelas_valor)}`)
  return partes.join(' · ')
}
