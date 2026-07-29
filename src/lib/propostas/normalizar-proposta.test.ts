import { describe, expect, it } from 'vitest'
import { normalizarProposta, normalizarPatchProposta, descreverCondicoes } from './normalizar-proposta'

const COLUNAS_REAIS = new Set([
  'lead_id', 'empreendimento_id', 'unidade_id', 'corretor_id', 'valor_proposto',
  'valor_entrada', 'condicoes_pgto', 'simulacao_json', 'notas', 'status',
  'validade_ate', 'client_event_id',
  // Adicionadas em 20260729171057 para o Financeiro sair do localStorage.
  'cliente_nome', 'valor_recebido', 'valor_a_receber', 'data_venda',
])

describe('normalizarProposta — só emite colunas que existem', () => {
  it('nenhum campo do insert está fora do schema real de crm_propostas', () => {
    const r = normalizarProposta({
      lead_id: 'lead-1', valor_proposto: 500000, entrada: 100000,
      parcelas_qtd: 60, parcelas_valor: 5000, reforcos: 4, reforcos_valor: 20000,
      chaves_valor: 80000, observacoes: 'cliente pediu desconto', status: 'pendente',
    }, 'admin-1')

    expect(r.ok).toBe(true)
    if (!r.ok) return
    for (const chave of Object.keys(r.insert)) {
      expect(COLUNAS_REAIS.has(chave), `campo inexistente no schema: ${chave}`).toBe(true)
    }
  })

  it('NÃO emite as colunas inventadas que o código antigo mandava', () => {
    const r = normalizarProposta({ lead_id: 'lead-1', valor_proposto: 1000, entrada: 100 }, 'admin-1')
    if (!r.ok) throw new Error('deveria normalizar')
    for (const inventada of ['entrada', 'parcelas_qtd', 'parcelas_valor', 'baloes', 'observacoes', 'versao']) {
      expect(r.insert).not.toHaveProperty(inventada)
    }
  })

  it('NÃO envia `numero` — ele vem do default (sequence) do banco', () => {
    const r = normalizarProposta({ lead_id: 'lead-1', valor_proposto: 1000 }, 'admin-1')
    if (!r.ok) throw new Error('deveria normalizar')
    expect(r.insert).not.toHaveProperty('numero')
  })

  it('renomeia entrada→valor_entrada e observacoes→notas', () => {
    const r = normalizarProposta({ lead_id: 'lead-1', valor_proposto: 500000, entrada: 100000, observacoes: 'texto' }, 'admin-1')
    if (!r.ok) throw new Error('deveria normalizar')
    expect(r.insert.valor_entrada).toBe(100000)
    expect(r.insert.notas).toBe('texto')
  })

  it('agrupa o parcelamento em simulacao_json sem perder dado', () => {
    const r = normalizarProposta({
      lead_id: 'lead-1', valor_proposto: 500000,
      parcelas_qtd: 60, parcelas_valor: 5000, reforcos: 4, reforcos_valor: 20000, chaves_valor: 80000,
    }, 'admin-1')
    if (!r.ok) throw new Error('deveria normalizar')
    expect(r.insert.simulacao_json).toEqual({
      parcelas_qtd: 60, parcelas_valor: 5000, reforcos: 4, reforcos_valor: 20000, chaves_valor: 80000,
    })
  })

  it('preenche corretor_id com o admin autenticado', () => {
    const r = normalizarProposta({ lead_id: 'lead-1', valor_proposto: 1000 }, 'admin-42')
    if (!r.ok) throw new Error('deveria normalizar')
    expect(r.insert.corretor_id).toBe('admin-42')
  })
})

describe('normalizarProposta — validação', () => {
  it('exige lead_id ou nome do cliente', () => {
    const r = normalizarProposta({ valor_proposto: 1000 }, 'admin-1')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.erro).toMatch(/lead|cliente/i)
  })

  // Proposta do CRM sempre tem lead. Venda antiga lançada direto no
  // Financeiro não tem — e exigir lead ali obrigaria a criar um lead fantasma
  // por venda histórica, poluindo o funil e a conversão por origem.
  it('aceita venda sem lead quando vem o nome do cliente', () => {
    const r = normalizarProposta({ cliente_nome: 'Márcio Souza', valor_proposto: 450000 }, 'admin-1')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.insert.lead_id).toBeNull()
    expect(r.insert.cliente_nome).toBe('Márcio Souza')
  })

  it('recusa data_venda fora do formato AAAA-MM-DD', () => {
    const r = normalizarProposta(
      { cliente_nome: 'Ana', valor_proposto: 1000, data_venda: '10/08/2026' }, 'a')
    expect(r.ok).toBe(false)
  })

  it('recebido e a receber default para zero, não para null', () => {
    const r = normalizarProposta({ lead_id: 'l1', valor_proposto: 1000 }, 'a')
    if (!r.ok) throw new Error('deveria normalizar')
    expect(r.insert.valor_recebido).toBe(0)
    expect(r.insert.valor_a_receber).toBe(0)
  })

  it('aceita o vocabulário da tela do Financeiro (recebido/a_receber)', () => {
    const r = normalizarProposta(
      { lead_id: 'l1', valor_proposto: 1000, recebido: 300, a_receber: 700 }, 'a')
    if (!r.ok) throw new Error('deveria normalizar')
    expect(r.insert.valor_recebido).toBe(300)
    expect(r.insert.valor_a_receber).toBe(700)
  })

  it('exige valor_proposto numérico maior que zero', () => {
    expect(normalizarProposta({ lead_id: 'l1' }, 'a').ok).toBe(false)
    expect(normalizarProposta({ lead_id: 'l1', valor_proposto: 0 }, 'a').ok).toBe(false)
    expect(normalizarProposta({ lead_id: 'l1', valor_proposto: -5 }, 'a').ok).toBe(false)
    expect(normalizarProposta({ lead_id: 'l1', valor_proposto: 'abc' }, 'a').ok).toBe(false)
  })

  it('empreendimento_id passou a ser opcional (a coluna é nullable)', () => {
    const r = normalizarProposta({ lead_id: 'l1', valor_proposto: 1000 }, 'a')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.insert.empreendimento_id).toBeNull()
  })

  it('status desconhecido cai no padrão em vez de ir cru pro banco', () => {
    const r = normalizarProposta({ lead_id: 'l1', valor_proposto: 1000, status: 'inventado' }, 'a')
    if (!r.ok) throw new Error('deveria normalizar')
    expect(r.insert.status).toBe('pendente')
  })

  it('aceita valor em formato brasileiro vindo do formulário', () => {
    const r = normalizarProposta({ lead_id: 'l1', valor_proposto: '500.000,50' }, 'a')
    if (!r.ok) throw new Error('deveria normalizar')
    expect(r.insert.valor_proposto).toBeCloseTo(500000.5, 2)
  })
})

describe('descreverCondicoes', () => {
  it('resume as condições de forma legível', () => {
    const texto = descreverCondicoes({ parcelas_qtd: 60, parcelas_valor: 5000, chaves_valor: 80000 }, 100000)
    expect(texto).toContain('Entrada')
    expect(texto).toContain('60x')
    expect(texto).toContain('Chaves')
  })

  it('sem condições devolve null em vez de string vazia', () => {
    expect(descreverCondicoes({}, null)).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────
// PATCH — a origem do bug que deixou produção sem financeiro.
//
// A rota antiga espalhava o corpo inteiro no update. A tela do Financeiro
// manda `leads: {nome}` e `empreendimentos: {nome}` junto, que não são
// colunas: o update falhava, a tela caía num fallback em localStorage e
// ninguém percebeu.
// ─────────────────────────────────────────────────────────────────────
describe('normalizarPatchProposta', () => {
  it('descarta os objetos de join que a tela manda junto', () => {
    const r = normalizarPatchProposta({
      status: 'aceita',
      valor_proposto: 500000,
      leads: { nome: 'Márcio' },
      empreendimentos: { nome: 'Pineto' },
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.update).not.toHaveProperty('leads')
    expect(r.update).not.toHaveProperty('empreendimentos')
    expect(r.update.status).toBe('aceita')
  })

  it('traduz o vocabulário da tela para o nome real da coluna', () => {
    const r = normalizarPatchProposta({ entrada: 100000, recebido: 5000, a_receber: 95000, observacoes: 'ok' })
    if (!r.ok) throw new Error('deveria normalizar')
    expect(r.update.valor_entrada).toBe(100000)
    expect(r.update.valor_recebido).toBe(5000)
    expect(r.update.valor_a_receber).toBe(95000)
    expect(r.update.notas).toBe('ok')
  })

  it('recusa status inválido em vez de mandar para o banco', () => {
    expect(normalizarPatchProposta({ status: 'quitada' }).ok).toBe(false)
  })

  it('recusa data_venda em formato brasileiro', () => {
    expect(normalizarPatchProposta({ data_venda: '10/08/2026' }).ok).toBe(false)
    expect(normalizarPatchProposta({ data_venda: '2026-08-10' }).ok).toBe(true)
  })

  it('corpo só com campos desconhecidos não vira update vazio no banco', () => {
    const r = normalizarPatchProposta({ campo_inventado: 1, outro: 'x' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toMatch(/Nenhum campo válido/)
  })

  it('entrada zero vira null (sem entrada); recebido zero continua zero', () => {
    const r = normalizarPatchProposta({ entrada: 0, recebido: 0 })
    if (!r.ok) throw new Error('deveria normalizar')
    expect(r.update.valor_entrada).toBeNull()
    expect(r.update.valor_recebido).toBe(0)
  })

  it('aceita valor em formato pt-BR sem inflar', () => {
    const r = normalizarPatchProposta({ valor_proposto: '350.000,00' })
    if (!r.ok) throw new Error('deveria normalizar')
    expect(r.update.valor_proposto).toBe(350000)
  })
})
