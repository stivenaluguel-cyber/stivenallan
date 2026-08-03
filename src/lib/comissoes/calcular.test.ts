import { describe, expect, it } from 'vitest'
import { calcularDivisao, resumirComissoes, normalizarComissao, PERCENTUAL_PADRAO } from './calcular'

describe('calcularDivisao', () => {
  it('aplica o percentual padrão de 6% sobre a venda', () => {
    const d = calcularDivisao({ valorVenda: 500000 })
    expect(PERCENTUAL_PADRAO).toBe(6)
    expect(d.valorComissao).toBe(30000)
  })

  it('divide 50/50 entre captador e vendedor por padrão', () => {
    const d = calcularDivisao({ valorVenda: 500000 })
    expect(d.valorCaptador).toBe(15000)
    expect(d.valorVendedor).toBe(15000)
  })

  it('respeita divisão desigual', () => {
    const d = calcularDivisao({ valorVenda: 500000, percentualCaptador: 30 })
    expect(d.valorCaptador).toBe(9000)
    expect(d.valorVendedor).toBe(21000)
    expect(d.percentualVendedor).toBe(70)
  })

  it('corretor sozinho fica com 100% — não sobra metade sem dono', () => {
    const soCaptador = calcularDivisao({ valorVenda: 500000, temVendedor: false })
    expect(soCaptador.valorCaptador).toBe(30000)
    expect(soCaptador.valorVendedor).toBe(0)
    expect(soCaptador.percentualCaptador).toBe(100)

    const soVendedor = calcularDivisao({ valorVenda: 500000, temCaptador: false })
    expect(soVendedor.valorVendedor).toBe(30000)
    expect(soVendedor.valorCaptador).toBe(0)
  })

  it('as partes sempre somam exatamente o total, sem centavo perdido', () => {
    // 333333.33 * 6% = 19999.9998 → arredondamentos independentes divergiriam
    const d = calcularDivisao({ valorVenda: 333333.33, percentualCaptador: 33 })
    expect(d.valorCaptador + d.valorVendedor).toBeCloseTo(d.valorComissao, 2)
  })

  it('aceita percentual total diferente de 6', () => {
    expect(calcularDivisao({ valorVenda: 100000, percentualTotal: 5 }).valorComissao).toBe(5000)
  })

  it('percentual do captador fora de 0–100 é limitado em vez de gerar valor negativo', () => {
    expect(calcularDivisao({ valorVenda: 100000, percentualCaptador: 150 }).percentualCaptador).toBe(100)
    expect(calcularDivisao({ valorVenda: 100000, percentualCaptador: -20 }).percentualCaptador).toBe(0)
  })
})

describe('resumirComissoes', () => {
  const registros = [
    { status: 'prevista', valor_comissao: 30000, valor_venda: 500000, corretor_captador_id: 'a', corretor_vendedor_id: 'b', percentual_captador: 50 },
    { status: 'recebida', valor_comissao: 12000, valor_venda: 200000, corretor_captador_id: 'a', corretor_vendedor_id: null, percentual_captador: 100 },
    { status: 'cancelada', valor_comissao: 99999, valor_venda: 999999, corretor_captador_id: 'a', corretor_vendedor_id: 'b', percentual_captador: 50 },
  ]

  it('separa previsto, confirmado e recebido', () => {
    const r = resumirComissoes(registros)
    expect(r.previsto).toBe(30000)
    expect(r.recebido).toBe(12000)
    expect(r.confirmado).toBe(0)
  })

  it('cancelada fica fora de tudo, inclusive do total de vendas', () => {
    const r = resumirComissoes(registros)
    expect(r.quantidade).toBe(2)
    expect(r.totalVendas).toBe(700000)
    expect(r.previsto + r.confirmado + r.recebido).toBe(42000)
  })

  it('acumula por corretor respeitando a divisão', () => {
    const r = resumirComissoes(registros)
    const a = r.porCorretor.find((c) => c.corretorId === 'a')
    const b = r.porCorretor.find((c) => c.corretorId === 'b')
    expect(a?.valor).toBe(27000) // 15000 (metade) + 12000 (sozinho)
    expect(b?.valor).toBe(15000)
  })

  it('divisão detalhada manda no "por corretor"', () => {
    // Sem isto, uma venda 60/20/20 (vendedor, captador, imobiliária) seria
    // lida pelo par captador/vendedor e daria metade da comissão a cada um —
    // inflando o que os dois corretores realmente receberam.
    const r = resumirComissoes([
      {
        status: 'recebida', valor_comissao: 45000, valor_venda: 750000,
        corretor_captador_id: 'a', corretor_vendedor_id: 'b', percentual_captador: 50,
        participantes: [
          { corretor_id: 'b', percentual: 60 },
          { corretor_id: 'a', percentual: 20 },
          { corretor_id: null, percentual: 20 }, // imobiliária, sem cadastro
        ],
      },
    ])
    expect(r.porCorretor.find((c) => c.corretorId === 'b')?.valor).toBe(27000)
    expect(r.porCorretor.find((c) => c.corretorId === 'a')?.valor).toBe(9000)
    // A fatia da imobiliária não some do total — só não tem corretor a quem somar.
    expect(r.recebido).toBe(45000)
    expect(r.porCorretor).toHaveLength(2)
  })

  it('lista de participantes vazia cai no par captador/vendedor', () => {
    const r = resumirComissoes([
      { ...registros[0], participantes: [] },
    ])
    expect(r.porCorretor.find((c) => c.corretorId === 'a')?.valor).toBe(15000)
  })

  it('ordena por valor, do maior para o menor', () => {
    expect(resumirComissoes(registros).porCorretor[0].corretorId).toBe('a')
  })

  it('lista vazia não quebra', () => {
    const r = resumirComissoes([])
    expect(r).toMatchObject({ previsto: 0, recebido: 0, quantidade: 0, totalVendas: 0 })
    expect(r.porCorretor).toEqual([])
  })

  it('valores vindos como string do Postgres numeric são somados corretamente', () => {
    const r = resumirComissoes([{ status: 'recebida', valor_comissao: '12000.50', valor_venda: '200000.00', corretor_captador_id: 'a', corretor_vendedor_id: null, percentual_captador: '100' }])
    expect(r.recebido).toBe(12000.5)
  })
})

describe('normalizarComissao', () => {
  const base = { valor_venda: 500000, corretor_captador_id: 'c1' }

  it('calcula a comissão a partir da venda', () => {
    const r = normalizarComissao(base)
    if (!r.ok) throw new Error(r.erro)
    expect(r.insert.valor_comissao).toBe(30000)
    expect(r.insert.percentual_total).toBe(6)
  })

  it('exige valor de venda positivo', () => {
    expect(normalizarComissao({ ...base, valor_venda: 0 }).ok).toBe(false)
    expect(normalizarComissao({ ...base, valor_venda: -1 }).ok).toBe(false)
  })

  it('exige ao menos um corretor', () => {
    const r = normalizarComissao({ valor_venda: 500000 })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toContain('corretor')
  })

  it('percentuais sempre somam 100 (respeita o CHECK do banco)', () => {
    const r = normalizarComissao({ ...base, corretor_vendedor_id: 'c2', percentual_captador: 40 })
    if (!r.ok) throw new Error(r.erro)
    expect(r.insert.percentual_captador + r.insert.percentual_vendedor).toBe(100)
  })

  it('recusa status e data inválidos', () => {
    expect(normalizarComissao({ ...base, status: 'inventado' }).ok).toBe(false)
    expect(normalizarComissao({ ...base, data_venda: '28/07/2026' }).ok).toBe(false)
    expect(normalizarComissao({ ...base, data_venda: '2026-07-28' }).ok).toBe(true)
  })

  it('recusa percentual total fora de 0–100', () => {
    expect(normalizarComissao({ ...base, percentual_total: 150 }).ok).toBe(false)
  })

  it('status padrão é prevista', () => {
    const r = normalizarComissao(base)
    if (!r.ok) throw new Error(r.erro)
    expect(r.insert.status).toBe('prevista')
  })
})
