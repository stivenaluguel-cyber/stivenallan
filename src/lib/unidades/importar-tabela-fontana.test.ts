import { describe, it, expect } from 'vitest'
import { paraUnidadeDoBanco, parsearTabelaFontana } from './importar-tabela-fontana'

// TEXTO REAL da tabela Pineto (Julho/2026), extraído do PDF do Drive
// (fileId 1J2gzZvym-m3GTlQNZy5bywAy68rqPQPJ). Recortado em 5 unidades para o
// arquivo caber, mas cada caractere é o do PDF — inclusive o cabeçalho
// bagunçado que o extrator produz.
const CABECALHO = `Data RUA ITAJAI - CENTRO - CRICIÚMA/SC emissão: 01/07/2026 16:40:22 Previsão de entrega: 30/11/2029 Vigência desta tabela: Julho/2026

Empresa: OBF CONSTRUÇÕES LTDA - PINETO

CUB06 - Julho - R$ 3.121,62 UNIDADE

ÁREA APROXIMADA CONDIÇÕES CONDIÇÕES CONDIÇÕES DE VENDA CONDIÇÕES DE TOTAL VENDA VENDADE VENDA TOTAL VENDATOTAL VENDATOTAL VENDAAPART DMT BOX PRIVATIVA

DEP

UNIDADE (m²)

PRIVATIVA

BOX (m²) TOTAL (m²) ENTRADA

1 X

REFORÇO

PARCELA

FINANCIAMENTO R$ ANUAL 100%

MENSAL R$ CUB06 100%

R$ CUB06 100% 4 X

40 X

1 X

R$ CUB06 100% CUB06 `

const UNIDADES =
  '102 2 91S - 3º Pav Gar 76,34 12,00 131,33 55.939,43 699.242,88 10.488,64 699.242,88 2.796,97 224 699.242,88 489.470,02 224 699.242,88 224 224 ' +
  '104 2 04S - T 76,25 13,50 133,09 52.443,22 655.540,20 9.833,10 655.540,20 2.622,16 210 655.540,20 458.878,14 210 655.540,20 210 210 ' +
  '1105 2 02S - T 02 75,72 13,50 142,61 64.180,51 802.256,34 12.033,85 802.256,34 3.209,03 257 802.256,34 561.579,44 257 802.256,34 257 257 ' +
  '1505 2 89E - 3º Pav Gar 75,72 20,25 140,79 65.928,61 824.107,68 12.361,62 824.107,68 3.296,43 264 824.107,68 576.875,38 264 824.107,68 264 264 ' +
  '1606 2 96E - 3º Pav Gar 75,72 20,00 140,46 64.929,70 811.621,20 12.174,32 811.621,20 3.246,48 260 811.621,20 568.134,84 260 811.621,20 260 260 '

const RODAPE = `
Observações:

1\\) Os valores contidos na presente tabela e nos contratos celebrados, sofrerão correção monetária mensal com base na variação do CUB/SINDUSCON/SC até a data de conclusão do empreendimento, sendo que após a conclusão, os valores remanescentes serão corrigidos pelo IGPM e acrescidos de juros compensatórios de 0,75% ao mês. 2) Até a entrega de conclusão do empreendimento, 30% do valor do mesmo deverá estar quitado, sendo que o restante deverá ser liquidado mediante financiamento bancário ou em até 240 meses, diretamente com a construtora. 6) Este empreendimento não aceita permuta; 8) POLÍTICA COMERCIAL: NESTE EMPREENDIMENTO SERÁ CONCEDIDO DESCONTO DE 5% PARA PAGAMENTO À VISTA

NÚMERO DORMITÓRIOS UNIDADES 02 Dormitórios (01 Suíte)`

const TABELA = CABECALHO + UNIDADES + RODAPE
const CUB_JULHO = 3121.62

describe('parsearTabelaFontana — cabeçalho', () => {
  const r = parsearTabelaFontana(TABELA)

  it('extrai o CUB impresso e o mês', () => {
    expect(r.cabecalho.cub_valor).toBe(CUB_JULHO)
    expect(r.cabecalho.cub_label).toBe('Julho')
  })

  it('extrai vigência, entrega e endereço', () => {
    expect(r.cabecalho.vigencia).toBe('Julho/2026')
    expect(r.cabecalho.previsao_entrega).toBe('30/11/2029')
    expect(r.cabecalho.endereco).toBe('RUA ITAJAI - CENTRO - CRICIÚMA/SC')
  })

  it('lê a política comercial: 5% à vista e não aceita permuta', () => {
    expect(r.cabecalho.desconto_a_vista_pct).toBe(5)
    expect(r.cabecalho.aceita_permuta).toBe(false)
  })
})

describe('parsearTabelaFontana — unidades', () => {
  const r = parsearTabelaFontana(TABELA, CUB_JULHO)

  it('lê todas as 5 unidades e não rejeita nenhuma', () => {
    expect(r.unidades).toHaveLength(5)
    expect(r.rejeitadas).toEqual([])
  })

  it('a unidade 102 sai com todos os valores exatos do PDF', () => {
    const u = r.unidades.find((x) => x.unidade === '102')!
    expect(u).toMatchObject({
      dormitorios: 2,
      andar: 1,
      metragem: 76.34,
      box_m2: 12,
      metragem_total: 131.33,
      box_codigo: '91S',
      valor_tabela: 699242.88,
      valor_entrada_min: 55939.43,
      parcela_mensal: 2796.97,
      reforco_anual: 10488.64,
      saldo_financiamento: 489470.02,
      cub_fator: 224,
    })
  })

  it('deriva o andar de unidades de 3 e de 4 dígitos', () => {
    expect(r.unidades.find((u) => u.unidade === '104')!.andar).toBe(1)
    expect(r.unidades.find((u) => u.unidade === '1105')!.andar).toBe(11)
    expect(r.unidades.find((u) => u.unidade === '1606')!.andar).toBe(16)
  })

  it('não confunde o código do box com o número da unidade', () => {
    // "1505 2 89E" — o 89 é o box, não a unidade.
    const u = r.unidades.find((x) => x.unidade === '1505')!
    expect(u.box_codigo).toBe('89E')
    expect(u.valor_tabela).toBe(824107.68)
  })
})

describe('parsearTabelaFontana — as invariantes que provam a leitura', () => {
  const r = parsearTabelaFontana(TABELA, CUB_JULHO)

  it('todo total é exatamente quantidade_CUB × CUB do mês', () => {
    for (const u of r.unidades) {
      expect(Math.abs(u.cub_fator * CUB_JULHO - u.valor_tabela)).toBeLessThan(0.01)
    }
  })

  it('entrada + 40 parcelas + 4 reforços fecha 30% do total', () => {
    for (const u of r.unidades) {
      const soma = u.valor_entrada_min + 40 * u.parcela_mensal + 4 * u.reforco_anual
      expect(soma / u.valor_tabela).toBeCloseTo(0.3, 3)
    }
  })

  it('o saldo financiado é exatamente 70% do total', () => {
    for (const u of r.unidades) {
      expect(u.saldo_financiamento / u.valor_tabela).toBeCloseTo(0.7, 3)
    }
  })

  it('a entrada isolada é 8%, não os 20% do plano padrão dos guias', () => {
    // Serve de documentação: quem ler o site e assumir 20% erra o Pineto.
    for (const u of r.unidades) {
      expect(u.valor_entrada_min / u.valor_tabela).toBeCloseTo(0.08, 3)
    }
  })
})

describe('parsearTabelaFontana — recusa em vez de importar errado', () => {
  it('coluna deslocada quebra a invariante e a linha é REJEITADA', () => {
    // Total trocado de 699.242,88 para 799.242,88: não bate mais com 224 × CUB,
    // nem com os 30%, nem com os 70%.
    const adulterada = TABELA.replace('55.939,43 699.242,88', '55.939,43 799.242,88')
    const r = parsearTabelaFontana(adulterada, CUB_JULHO)
    expect(r.unidades.find((u) => u.unidade === '102')).toBeUndefined()
    const rej = r.rejeitadas.find((x) => x.unidade === '102')
    expect(rej).toBeDefined()
    expect(rej!.motivo).toMatch(/CUB|30%|70%/)
  })

  it('linha truncada é rejeitada com o motivo, não importada parcial', () => {
    const truncada = CABECALHO + '102 2 91S - 3º Pav Gar 76,34 12,00 ' + RODAPE
    const r = parsearTabelaFontana(truncada, CUB_JULHO)
    expect(r.unidades).toHaveLength(0)
    expect(r.rejeitadas[0].motivo).toMatch(/colunas insuficientes/)
  })

  it('tabela sem nenhuma unidade não quebra', () => {
    const r = parsearTabelaFontana(CABECALHO + RODAPE, CUB_JULHO)
    expect(r.unidades).toEqual([])
    expect(r.rejeitadas).toEqual([])
    expect(r.cabecalho.cub_valor).toBe(CUB_JULHO)
  })
})

describe('parsearTabelaFontana — conferência do CUB', () => {
  it('CUB do sistema igual ao impresso confere', () => {
    expect(parsearTabelaFontana(TABELA, 3121.62).conferenciaCub.confere).toBe(true)
  })

  it('CUB do sistema DIFERENTE do impresso levanta a bandeira', () => {
    // Tabela de julho aberta com o CUB de maio ainda no sistema.
    const r = parsearTabelaFontana(TABELA, 3096.25)
    expect(r.conferenciaCub.confere).toBe(false)
    expect(r.conferenciaCub.impresso).toBe(3121.62)
    expect(r.conferenciaCub.sistema).toBe(3096.25)
  })

  it('sem CUB no sistema, a conferência fica indefinida em vez de falsa', () => {
    expect(parsearTabelaFontana(TABELA).conferenciaCub.confere).toBeNull()
  })
})

describe('paraUnidadeDoBanco', () => {
  const r = parsearTabelaFontana(TABELA, CUB_JULHO)
  const linha = paraUnidadeDoBanco(r.unidades.find((u) => u.unidade === '102')!, 'emp-pineto')

  it('mapeia para as colunas reais de empreendimentos_unidades', () => {
    expect(linha).toMatchObject({
      empreendimento_id: 'emp-pineto',
      unidade: '102',
      andar: 1,
      metragem: 76.34,
      dormitorios: 2,
      suites: 1,
      valor_tabela: 699242.88,
      valor_entrada_min: 55939.43,
      cub_fator: 224,
      disponivel: true,
    })
  })

  it('escreve o plano de pagamento legível em condicoes_negociacao', () => {
    expect(linha.condicoes_negociacao).toContain('40x')
    expect(linha.condicoes_negociacao).toContain('4 reforços')
    expect(linha.condicoes_negociacao).toContain('30% até as chaves')
    expect(linha.condicoes_negociacao).toContain('240x')
    expect(linha.condicoes_negociacao).toContain('224 CUB')
  })

  it('não emite coluna que não existe na tabela', () => {
    const COLUNAS_REAIS = new Set([
      'empreendimento_id', 'bloco', 'unidade', 'andar', 'metragem', 'dormitorios',
      'suites', 'orientacao', 'valor_tabela', 'valor_promocional', 'valor_entrada_min',
      'disponivel', 'reservado_ate', 'lead_id_reserva', 'condicoes_negociacao', 'cub_fator',
    ])
    for (const k of Object.keys(linha)) {
      expect(COLUNAS_REAIS.has(k), `coluna inexistente: ${k}`).toBe(true)
    }
  })
})
