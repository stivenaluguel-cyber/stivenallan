import { describe, expect, it } from 'vitest'
import { normalizarProposta, descreverCondicoes } from './normalizar-proposta'

const COLUNAS_REAIS = new Set([
  'lead_id', 'empreendimento_id', 'unidade_id', 'corretor_id', 'valor_proposto',
  'valor_entrada', 'condicoes_pgto', 'simulacao_json', 'notas', 'status',
  'validade_ate', 'client_event_id',
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
  it('exige lead_id', () => {
    const r = normalizarProposta({ valor_proposto: 1000 }, 'admin-1')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.erro).toContain('lead_id')
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
