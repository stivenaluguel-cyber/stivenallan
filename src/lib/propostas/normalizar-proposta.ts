// Tradução entre o payload que o formulário de Propostas envia e as colunas
// que crm_propostas REALMENTE tem.
//
// O POST antigo inseria `entrada`, `parcelas_qtd`, `parcelas_valor`,
// `baloes`, `observacoes` e `versao` — nenhuma dessas colunas existe. Além
// disso nunca preenchia `numero`, que é NOT NULL. Resultado: toda criação de
// proposta falhava, e o frontend caía num fallback silencioso em
// localStorage — por isso produção tem zero propostas e ninguém percebeu.
//
// Nada aqui inventa coluna: o que não tem lugar próprio no schema vai para
// `simulacao_json`, que é exatamente a coluna destinada à simulação de
// pagamento, e o texto livre vai para `notas`.

export type PropostaPayload = {
  lead_id?: unknown
  cliente_nome?: unknown
  empreendimento_id?: unknown
  unidade_id?: unknown
  valor_proposto?: unknown
  entrada?: unknown
  parcelas_qtd?: unknown
  parcelas_valor?: unknown
  reforcos?: unknown
  reforcos_valor?: unknown
  chaves_valor?: unknown
  baloes?: unknown
  observacoes?: unknown
  status?: unknown
  validade_ate?: unknown
  clientEventId?: unknown
  recebido?: unknown
  a_receber?: unknown
  valor_recebido?: unknown
  valor_a_receber?: unknown
  data_venda?: unknown
}

export type PropostaInsert = {
  lead_id: string | null
  cliente_nome: string | null
  empreendimento_id: string | null
  unidade_id: string | null
  corretor_id: string | null
  valor_proposto: number
  valor_entrada: number | null
  condicoes_pgto: string | null
  simulacao_json: Record<string, number>
  notas: string | null
  status: string
  validade_ate: string | null
  client_event_id: string | null
  valor_recebido: number
  valor_a_receber: number
  data_venda: string | null
}

const STATUS_VALIDOS = new Set(['rascunho', 'pendente', 'em_analise', 'aceita', 'recusada', 'cancelada'])

function numeroOuNull(v: unknown): number | null {
  const n = typeof v === 'string' ? Number(v.replace(/\./g, '').replace(',', '.')) : Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

function textoOuNull(v: unknown, max = 2000): string | null {
  return typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null
}

const fmtBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Resumo legível das condições, para quem lê a proposta sem abrir o JSON.
export function descreverCondicoes(sim: Record<string, number>, valorEntrada: number | null): string | null {
  const partes: string[] = []
  if (valorEntrada) partes.push('Entrada de ' + fmtBRL(valorEntrada))
  if (sim.parcelas_qtd && sim.parcelas_valor) partes.push(`${sim.parcelas_qtd}x de ${fmtBRL(sim.parcelas_valor)}`)
  else if (sim.parcelas_qtd) partes.push(`${sim.parcelas_qtd} parcelas`)
  if (sim.reforcos && sim.reforcos_valor) partes.push(`${sim.reforcos} reforços de ${fmtBRL(sim.reforcos_valor)}`)
  if (sim.chaves_valor) partes.push('Chaves: ' + fmtBRL(sim.chaves_valor))
  return partes.length ? partes.join(' · ') : null
}

export type ResultadoNormalizacao =
  | { ok: true; insert: PropostaInsert }
  | { ok: false; erro: string }

// Zero é valor legítimo aqui (nada recebido ainda), diferente de `entrada`,
// onde zero significa "sem entrada" e vira null.
function numeroOuZero(v: unknown): number {
  const n = typeof v === 'string' ? Number(v.replace(/\./g, '').replace(',', '.')) : Number(v)
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function normalizarProposta(body: PropostaPayload, corretorId: string | null): ResultadoNormalizacao {
  const leadId = typeof body.lead_id === 'string' && body.lead_id ? body.lead_id : null
  const clienteNome = textoOuNull(body.cliente_nome, 200)

  // Proposta do CRM vem com lead. Venda antiga lançada direto no Financeiro
  // não tem — e exigir lead ali obrigaria a criar um lead fantasma por venda
  // histórica só para registrar faturamento. Um dos dois basta; nenhum dos
  // dois deixa a linha sem identificação.
  if (!leadId && !clienteNome) {
    return { ok: false, erro: 'Informe o lead ou o nome do cliente' }
  }

  const valorProposto = numeroOuNull(body.valor_proposto)
  if (valorProposto === null) return { ok: false, erro: 'valor_proposto deve ser um número maior que zero' }

  const dataVenda = textoOuNull(body.data_venda, 10)
  if (dataVenda && !/^\d{4}-\d{2}-\d{2}$/.test(dataVenda)) {
    return { ok: false, erro: 'data_venda deve estar no formato AAAA-MM-DD' }
  }

  const status = typeof body.status === 'string' && STATUS_VALIDOS.has(body.status) ? body.status : 'pendente'

  // Campos de parcelamento que não têm coluna própria — vão para
  // simulacao_json (jsonb), preservando o dado sem inventar schema.
  const simulacao: Record<string, number> = {}
  for (const [chave, valor] of [
    ['parcelas_qtd', body.parcelas_qtd],
    ['parcelas_valor', body.parcelas_valor],
    ['reforcos', body.reforcos],
    ['reforcos_valor', body.reforcos_valor],
    ['chaves_valor', body.chaves_valor],
    ['baloes', body.baloes],
  ] as const) {
    const n = numeroOuNull(valor)
    if (n !== null) simulacao[chave] = n
  }

  const valorEntrada = numeroOuNull(body.entrada)

  return {
    ok: true,
    insert: {
      lead_id: leadId,
      cliente_nome: clienteNome,
      empreendimento_id: typeof body.empreendimento_id === 'string' && body.empreendimento_id ? body.empreendimento_id : null,
      unidade_id: typeof body.unidade_id === 'string' && body.unidade_id ? body.unidade_id : null,
      corretor_id: corretorId,
      valor_proposto: valorProposto,
      valor_entrada: valorEntrada,
      condicoes_pgto: descreverCondicoes(simulacao, valorEntrada),
      simulacao_json: simulacao,
      notas: textoOuNull(body.observacoes),
      status,
      validade_ate: typeof body.validade_ate === 'string' && body.validade_ate ? body.validade_ate : null,
      client_event_id: typeof body.clientEventId === 'string' && body.clientEventId ? body.clientEventId : null,
      // A tela do Financeiro chama os campos de `recebido`/`a_receber`; as
      // colunas são `valor_*`. Aceitamos os dois vocabulários para não
      // quebrar quem já chama do jeito antigo.
      valor_recebido: numeroOuZero(body.valor_recebido ?? body.recebido),
      valor_a_receber: numeroOuZero(body.valor_a_receber ?? body.a_receber),
      data_venda: dataVenda,
    },
  }
}

// Campos que o PATCH pode alterar, com o nome real da coluna.
//
// Antes, o PATCH espalhava o corpo inteiro no update — e o Financeiro manda
// `leads: {nome}` e `empreendimentos: {nome}` junto, que não são colunas. O
// update falhava, a tela caía no localStorage, e produção ficou sem
// financeiro nenhum sem ninguém perceber.
const CAMPOS_PATCH: Record<string, string> = {
  status: 'status',
  valor_proposto: 'valor_proposto',
  entrada: 'valor_entrada',
  valor_entrada: 'valor_entrada',
  observacoes: 'notas',
  notas: 'notas',
  condicoes_pgto: 'condicoes_pgto',
  validade_ate: 'validade_ate',
  empreendimento_id: 'empreendimento_id',
  unidade_id: 'unidade_id',
  lead_id: 'lead_id',
  cliente_nome: 'cliente_nome',
  data_venda: 'data_venda',
  recebido: 'valor_recebido',
  valor_recebido: 'valor_recebido',
  a_receber: 'valor_a_receber',
  valor_a_receber: 'valor_a_receber',
}

const NUMERICOS = new Set(['valor_proposto', 'valor_entrada', 'valor_recebido', 'valor_a_receber'])

export type ResultadoPatch =
  | { ok: true; update: Record<string, unknown> }
  | { ok: false; erro: string }

export function normalizarPatchProposta(body: Record<string, unknown>): ResultadoPatch {
  const update: Record<string, unknown> = {}

  for (const [chave, valor] of Object.entries(body)) {
    const coluna = CAMPOS_PATCH[chave]
    if (!coluna) continue

    if (NUMERICOS.has(coluna)) {
      // `valor_entrada` é nullable e zero ali significa "sem entrada".
      // `valor_recebido`/`valor_a_receber` são NOT NULL com default 0.
      update[coluna] = coluna === 'valor_entrada' ? numeroOuNull(valor) : numeroOuZero(valor)
      continue
    }

    if (coluna === 'status') {
      if (typeof valor !== 'string' || !STATUS_VALIDOS.has(valor)) return { ok: false, erro: 'status inválido' }
      update.status = valor
      continue
    }

    if (coluna === 'data_venda') {
      const d = textoOuNull(valor, 10)
      if (d && !/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        return { ok: false, erro: 'data_venda deve estar no formato AAAA-MM-DD' }
      }
      update.data_venda = d
      continue
    }

    update[coluna] = typeof valor === 'string' ? (valor.trim() || null) : valor
  }

  if (Object.keys(update).length === 0) return { ok: false, erro: 'Nenhum campo válido para atualizar' }
  return { ok: true, update }
}
