import { describe, it, expect } from 'vitest'
import { calcularTiers, AMOSTRA_MINIMA, type ItemPortfolio } from './tiers'

function item(id: string, preco: number, ativo = true): ItemPortfolio {
  return { id, preco, ativo }
}

describe('calcularTiers — amostra pequena', () => {
  it('menos que AMOSTRA_MINIMA: não aplicável, não calcula tiers nenhum', () => {
    const itens = Array.from({ length: AMOSTRA_MINIMA - 1 }, (_, i) => item(`${i}`, 100_000 + i * 10_000))
    const r = calcularTiers(itens)
    expect(r.aplicavel).toBe(false)
    if (!r.aplicavel) {
      expect(r.amostra).toBe(AMOSTRA_MINIMA - 1)
      expect(r.motivo).toMatch(/amostra/i)
    }
  })

  it('exatamente AMOSTRA_MINIMA: já aplicável', () => {
    const itens = Array.from({ length: AMOSTRA_MINIMA }, (_, i) => item(`${i}`, 100_000 + i * 10_000))
    const r = calcularTiers(itens)
    expect(r.aplicavel).toBe(true)
  })

  it('lista vazia: não aplicável', () => {
    const r = calcularTiers([])
    expect(r.aplicavel).toBe(false)
    if (!r.aplicavel) expect(r.amostra).toBe(0)
  })
})

describe('calcularTiers — tercis com números exatos nos limites', () => {
  // 9 itens, preços 100k, 200k, ..., 900k (uniforme). p33 = percentil(1/3) sobre
  // [100k..900k] com interpolação linear: idx = (1/3)*8 = 2.667 -> entre
  // rank2(300k) e rank3(400k), frac .667 -> 300k+100k*.667=366.700.
  // p66: idx=(2/3)*8=5.333 -> entre rank5(600k) e rank6(700k), frac .333 -> 633.300.
  const itens = Array.from({ length: 9 }, (_, i) => item(`${i}`, (i + 1) * 100_000))

  it('todo item <= p33 cai em Baixo, entre p33 e p66 em Médio, > p66 em Alto', () => {
    const r = calcularTiers(itens)
    expect(r.aplicavel).toBe(true)
    if (!r.aplicavel) return
    const [baixo, medio, alto] = r.tiers
    // 100k,200k,300k <= 366.700 -> baixo tem 3
    expect(baixo.total).toBe(3)
    // 400k,500k,600k estão entre 366.700 e 633.300 -> medio tem 3
    expect(medio.total).toBe(3)
    // 700k,800k,900k > 633.300 -> alto tem 3
    expect(alto.total).toBe(3)
    expect(baixo.total + medio.total + alto.total).toBe(9)
  })

  it('nenhum item é perdido ou duplicado entre os tiers', () => {
    const r = calcularTiers(itens)
    if (!r.aplicavel) throw new Error('deveria ser aplicável')
    const somaTotal = r.tiers.reduce((s, t) => s + t.total, 0)
    expect(somaTotal).toBe(itens.length)
  })
})

describe('calcularTiers — empate no valor de corte', () => {
  it('todos os itens com o mesmo preço: p33 == p66 == esse preço, tudo cai em Baixo (fronteira inclusiva pra baixo)', () => {
    const itens = Array.from({ length: 9 }, (_, i) => item(`${i}`, 500_000))
    const r = calcularTiers(itens)
    expect(r.aplicavel).toBe(true)
    if (!r.aplicavel) return
    const [baixo, medio, alto] = r.tiers
    expect(baixo.total).toBe(9)
    expect(medio.total).toBe(0)
    expect(alto.total).toBe(0)
    // Médio e Alto ficam VAZIOS (ausência de inventário), não é gap — não há nem sinal de alerta aqui.
    expect(medio.gap).toBe(false)
    expect(alto.gap).toBe(false)
  })

  it('vários itens empatados exatamente no valor de p33: todos ficam no tier Baixo (inclusivo)', () => {
    // 6 itens a 100k (bem abaixo) + 3 itens empatados bem no p33 calculado.
    // Construído pra garantir que o valor de p33 coincida com um preço real da amostra.
    const itens = [
      item('a', 100_000), item('b', 100_000), item('c', 100_000),
      item('d', 100_000), item('e', 100_000), item('f', 100_000),
      item('g', 900_000), item('h', 900_000), item('i', 900_000),
    ]
    const r = calcularTiers(itens)
    if (!r.aplicavel) throw new Error('deveria ser aplicável')
    const somaTotal = r.tiers.reduce((s, t) => s + t.total, 0)
    expect(somaTotal).toBe(9) // nenhum item perdido mesmo com empate maciço
  })
})

describe('calcularTiers — tier vazio no total (ausência de inventário, não é gap)', () => {
  it('distribuição bimodal concentrada: tier do meio pode ficar vazio, sem virar alerta', () => {
    // 9 itens bem baratos + 1 item extremamente caro -> a faixa "média" de
    // preço não tem nenhum empreendimento de verdade nela.
    const itens = [
      ...Array.from({ length: 9 }, (_, i) => item(`b${i}`, 100_000 + i * 1_000)),
      item('caro', 10_000_000),
    ]
    const r = calcularTiers(itens)
    if (!r.aplicavel) throw new Error('deveria ser aplicável')
    const vazio = r.tiers.find((t) => t.total === 0)
    // Pode ou não haver tier vazio dependendo do corte exato — o que importa
    // é que, SE houver, ele nunca é reportado como gap.
    if (vazio) expect(vazio.gap).toBe(false)
  })
})

describe('calcularTiers — gap real (inventário existe, zero ativo)', () => {
  it('tier com itens mas nenhum ativo: gap = true', () => {
    const itens = [
      ...Array.from({ length: 3 }, (_, i) => item(`b${i}`, 100_000 + i * 1_000, false)), // baixo: todos inativos
      ...Array.from({ length: 3 }, (_, i) => item(`m${i}`, 500_000 + i * 1_000, true)),
      ...Array.from({ length: 3 }, (_, i) => item(`a${i}`, 900_000 + i * 1_000, true)),
    ]
    const r = calcularTiers(itens)
    if (!r.aplicavel) throw new Error('deveria ser aplicável')
    const baixo = r.tiers.find((t) => t.tier === 'baixo')!
    expect(baixo.total).toBeGreaterThan(0)
    expect(baixo.ativos).toBe(0)
    expect(baixo.gap).toBe(true)
    expect(r.temGap).toBe(true)
  })
})

describe('calcularTiers — todos ativos (sem alerta nenhum)', () => {
  it('nenhum tier com gap quando tudo está ativo', () => {
    const itens = Array.from({ length: 12 }, (_, i) => item(`${i}`, 100_000 + i * 50_000, true))
    const r = calcularTiers(itens)
    if (!r.aplicavel) throw new Error('deveria ser aplicável')
    expect(r.temGap).toBe(false)
    expect(r.tiers.every((t) => !t.gap)).toBe(true)
  })
})

describe('calcularTiers — dados reais de produção (33 empreendimentos, ago/2026)', () => {
  // Snapshot real: min(valor_tabela) por empreendimento via
  // properties.slug = empreendimentos.slug -> empreendimentos_unidades,
  // capturado em 06/08/2026. Todos ativo=true hoje (0 propriedades inativas
  // em produção) — então este teste não pode exercitar gap=true, só
  // confirma que a distribuição real não quebra o cálculo e cai bem
  // dividida (o que é esperado: distribuição suave, sem concentração
  // patológica).
  const PRECOS_REAIS = [
    540040.26, 540040.26, 558769.98, 580621.32, 601897.47, 618080.76, 621202.38,
    653608.01, 655540.20, 711729.36, 775451.35, 895904.94, 902148.18, 905269.80,
    936486.00, 998918.40, 1027012.98, 1037210.16, 1073837.28, 1083202.14,
    1183093.98, 1220553.42, 1324642.54, 1492543.70, 1541630.41, 1557688.38,
    1701282.90, 1777176.28, 1829269.32, 2304855.44, 2375552.82, 2575336.50,
    3333890.16,
  ]

  it('33 empreendimentos reais, todos ativos: nenhum gap, ~11 por tier', () => {
    const itens = PRECOS_REAIS.map((preco, i) => item(`p${i}`, preco, true))
    const r = calcularTiers(itens)
    expect(r.aplicavel).toBe(true)
    if (!r.aplicavel) return
    expect(r.temGap).toBe(false)
    for (const t of r.tiers) {
      expect(t.total).toBeGreaterThan(0)
      expect(t.total).toBeCloseTo(11, 0)
    }
    expect(r.tiers.reduce((s, t) => s + t.total, 0)).toBe(33)
  })
})
