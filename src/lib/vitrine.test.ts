import { describe, expect, it, vi } from 'vitest'

// BUG real encontrado ao testar o catálogo manualmente: os 9 empreendimentos
// Eraldo só entram na vitrine pelo caminho "extras" (linha em `properties`,
// que nunca é a fonte da ficha técnica deles — vem de @/data/eraldo/*.ts e
// lá as colunas dormitorios/suites/metragem/vagas são sempre NULL). Antes da
// correção, `enriquecerComEraldo` só era chamado para itens de `EMPREENDIMENTOS`
// (que é só Fontana) — os cards Eraldo do catálogo ficavam sem ficha técnica.
const propertiesFixture = [
  {
    slug: 'arbor-centro-criciuma-sc', // Eraldo real, chega via "extras"
    nome: 'Árbor', construtora_slug: 'eraldo', cidade: 'Criciúma', bairro: 'Centro', uf: 'SC',
    cover_image_url: 'https://example.com/arbor.jpg', oculto: false, ativo: true, status: 'em obras',
    dormitorios: null, suites: null, metragem: null, vagas: null, previsao_entrega: null,
  },
  {
    slug: 'monte-leone-centro-criciuma-sc', // Fontana, já existe em @/data/imoveis (estático) — testa o merge de specs reais do banco
    nome: 'Monte Leone Residencial', construtora_slug: 'fontana', cidade: 'Criciúma', bairro: 'Centro', uf: 'SC',
    cover_image_url: 'https://example.com/ml.jpg', oculto: false, ativo: true, status: 'em obras',
    dormitorios: '4', suites: '3', metragem: '230 a 253', vagas: '3', previsao_entrega: 'agosto de 2030',
  },
]

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from(table: string) {
      if (table === 'construtoras') {
        return { select: async () => ({ data: [{ slug: 'eraldo', nome: 'Eraldo Construções' }] }) }
      }
      return { select: async () => ({ data: propertiesFixture }) }
    },
  }),
}))

import { getVitrineEmpreendimentos } from './vitrine'

describe('getVitrineEmpreendimentos — ficha técnica', () => {
  it('empreendimento Eraldo (via extras) recebe specs reais de @/data/eraldo, não fica sem ficha técnica', async () => {
    const lista = await getVitrineEmpreendimentos()
    const arbor = lista.find((e) => e.slug === 'arbor-centro-criciuma-sc')
    expect(arbor).toBeDefined()
    expect(arbor?.suitesLabel).toBe('3') // vem de tipologias reais de @/data/eraldo/arbor.ts, não da coluna NULL do banco
    expect(arbor?.dorms).toBeUndefined() // arbor.ts não tem `dormitorios` em nenhuma tipologia — não inventa
    expect(arbor?.previsaoEntregaLabel).toBe('Outubro de 2028')
  })

  it('empreendimento Fontana estático recebe specs reais das colunas do banco', async () => {
    const lista = await getVitrineEmpreendimentos()
    const monteLeone = lista.find((e) => e.slug === 'monte-leone-centro-criciuma-sc')
    expect(monteLeone).toBeDefined()
    expect(monteLeone?.dorms).toBe('4')
    expect(monteLeone?.metragemLabel).toBe('230 a 253')
  })

  it('empreendimento Fontana estático: dormitoriosMin/Max vêm da faixa numérica extraída do texto', async () => {
    const lista = await getVitrineEmpreendimentos()
    const monteLeone = lista.find((e) => e.slug === 'monte-leone-centro-criciuma-sc')
    expect(monteLeone?.dormitoriosMin).toBe(4)
    expect(monteLeone?.areaMin).toBe(230)
    expect(monteLeone?.areaMax).toBe(253)
  })
})
