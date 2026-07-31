import { describe, it, expect } from 'vitest'
import {
  paraUnidadeDoBanco, parsearTabelaFontana,
  contarLinhasPelaRepeticaoDoCub, lerDormitoriosDoRodape,
  lerRegrasPorFinal, regraDaUnidade,
} from './importar-tabela-fontana'

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
  const POLITICA = { meses: 240, jurosAoMes: 0.0075, indice: 'IGPM' }
  const linha = paraUnidadeDoBanco(r.unidades.find((u) => u.unidade === '102')!, 'emp-pineto', POLITICA)

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
      // A quantidade de CUBs NÃO cabe aqui: a coluna é numeric(6,4), teto
      // 99,9999. Ela vive em plano_pagamento.cub_quantidade.
      cub_fator: null,
      disponivel: true,
    })
    expect((linha.plano_pagamento as Record<string, unknown>).cub_quantidade).toBe(224)
  })

  it('escreve o plano de pagamento legível em condicoes_negociacao', () => {
    expect(linha.condicoes_negociacao).toContain('40x')
    expect(linha.condicoes_negociacao).toContain('4 reforços')
    expect(linha.condicoes_negociacao).toContain('30% até as chaves')
    expect(linha.condicoes_negociacao).toContain('240x')
    expect(linha.condicoes_negociacao).toContain('IGPM')
    expect(linha.condicoes_negociacao).toContain('224 CUB')
  })

  it('não emite coluna que não existe na tabela', () => {
    const COLUNAS_REAIS = new Set([
      'empreendimento_id', 'bloco', 'unidade', 'andar', 'metragem', 'dormitorios',
      'suites', 'orientacao', 'valor_tabela', 'valor_promocional', 'valor_entrada_min',
      'disponivel', 'reservado_ate', 'lead_id_reserva', 'condicoes_negociacao', 'cub_fator',
      'plano_pagamento',
    ])
    for (const k of Object.keys(linha)) {
      expect(COLUNAS_REAIS.has(k), `coluna inexistente: ${k}`).toBe(true)
    }
  })
})

describe('paraUnidadeDoBanco — plano de pagamento estruturado', () => {
  const r = parsearTabelaFontana(TABELA, CUB_JULHO)
  const l = paraUnidadeDoBanco(r.unidades.find((u) => u.unidade === '102')!, 'emp')

  it('grava o plano com os valores exatos da tabela', () => {
    expect(l.plano_pagamento).toMatchObject({
      entrada: 55939.43,
      parcelas_qtd: 40,
      parcela_valor: 2796.97,
      reforcos_qtd: 4,
      reforco_valor: 10488.64,
      saldo_financiamento: 489470.02,
    })
  })

  it('a quantidade de CUBs vai no plano — cub_fator não comporta 224', () => {
    expect(l.plano_pagamento.cub_quantidade).toBe(224)
  })

  it('calcula o percentual até as chaves a partir dos próprios valores', () => {
    expect(l.plano_pagamento.percentual_ate_chaves).toBe(30)
  })

  it('o plano fecha a conta do contrato', () => {
    const p = l.plano_pagamento
    const soma = p.entrada + p.parcelas_qtd * p.parcela_valor + p.reforcos_qtd * p.reforco_valor
    expect(soma + p.saldo_financiamento).toBeCloseTo(699242.88, 0)
  })
})

// ─────────────────────────────────────────────────────────────────────
// Segundo formato: entrada única + financiamento.
//
// Texto real da tabela do Avezzano (julho/2026), como o conector do Drive
// devolve. Nem toda tabela da Fontana é como a do Pineto: aqui não há parcela
// nem reforço, só entrada de 15% e 85% financiados na entrega.
// ─────────────────────────────────────────────────────────────────────
const AVEZZANO = `Vigência desta tabela: Julho/2026
Empresa: CONSTRUTORA FONTANA LTDA.
CUB06 - Julho - R$ 3.121,62 UNIDADE
101 3 23D - T 127,22 24,00 199,90 156.393,16 1.042.621,08 886.227,92 1.042.621,08 334 334 102 3 25D - T 127,22 24,00 199,90 154.051,95 1.027.012,98 872.961,03 1.027.012,98 329 329 103 3 30D - T 127,22 24,00 199,90 156.393,16 1.042.621,08 886.227,92 1.042.621,08 334 334 Observações:`

describe('tabela no formato entrada + financiamento', () => {
  it('lê as unidades em vez de recusar por não ter parcela', () => {
    const r = parsearTabelaFontana(AVEZZANO)
    expect(r.unidades).toHaveLength(3)
    expect(r.rejeitadas).toHaveLength(0)
  })

  it('marca o formato, e zera parcela e reforço em vez de inventar', () => {
    const u = parsearTabelaFontana(AVEZZANO).unidades[0]
    expect(u.formato).toBe('entrada_financiamento')
    expect(u.parcela_mensal).toBe(0)
    expect(u.reforco_anual).toBe(0)
  })

  it('a unidade 101 bate com o PDF, no centavo', () => {
    const u = parsearTabelaFontana(AVEZZANO).unidades[0]
    expect(u.unidade).toBe('101')
    expect(u.dormitorios).toBe(3)
    expect(u.metragem).toBe(127.22)
    expect(u.valor_tabela).toBe(1042621.08)
    expect(u.valor_entrada_min).toBe(156393.16)
    expect(u.saldo_financiamento).toBe(886227.92)
    expect(u.cub_fator).toBe(334)
  })

  it('entrada + financiamento fecham o total em todas', () => {
    for (const u of parsearTabelaFontana(AVEZZANO).unidades) {
      expect(u.valor_entrada_min + u.saldo_financiamento).toBeCloseTo(u.valor_tabela, 2)
    }
  })

  it('o total continua sendo a quantidade de CUBs vezes o CUB do mês', () => {
    for (const u of parsearTabelaFontana(AVEZZANO).unidades) {
      expect(u.cub_fator! * 3121.62).toBeCloseTo(u.valor_tabela, 2)
    }
  })

  it('linha que não fecha em nenhum dos dois formatos é recusada', () => {
    const adulterada = AVEZZANO.replace('886.227,92', '999.999,99')
    const r = parsearTabelaFontana(adulterada)
    expect(r.unidades).toHaveLength(2)
    expect(r.rejeitadas[0].unidade).toBe('101')
  })

  it('não confunde o formato do Pineto com o simples', () => {
    // Blindagem contra a heurística escolher errado e zerar parcela/reforço de
    // uma tabela que os tem.
    const r = parsearTabelaFontana(TABELA)
    expect(r.unidades.length).toBeGreaterThan(0)
    for (const u of r.unidades) {
      expect(u.formato).toBe('parcelado')
      expect(u.parcela_mensal).toBeGreaterThan(0)
    }
  })
})

describe('guarda contra coluna faltando', () => {
  it('linha truncada é recusada, não aceita em silêncio', () => {
    // Toda comparação com NaN é falsa: `Math.abs(NaN - x) > tolerancia` dá
    // false. Sem a guarda explícita, a linha atravessava as invariantes sem
    // disparar nenhuma e entrava como se tivesse sido conferida.
    const truncada = `Vigência desta tabela: Julho/2026
CUB06 - Julho - R$ 3.121,62 UNIDADE
101 3 23D - T 127,22 24,00 199,90 156.393,16 334 334 Observações:`
    const r = parsearTabelaFontana(truncada)
    expect(r.unidades).toHaveLength(0)
    expect(r.rejeitadas).toHaveLength(1)
  })
})


describe('paraUnidadeDoBanco e o formato da tabela', () => {
  it('não promete parcelamento direto que a tabela não menciona', () => {
    // Sem política lida, o texto some. Antes o "240x" era fixo no código e
    // aparecia para qualquer empreendimento, tivesse ou não a condição.
    const r = parsearTabelaFontana(TABELA)
    const l = paraUnidadeDoBanco(r.unidades[0], 'emp')
    expect(l.condicoes_negociacao).not.toContain('240x')
    expect(l.condicoes_negociacao).toContain('financiado')
  })

  it('tabela de entrada única não grava 40 parcelas inventadas', () => {
    const r = parsearTabelaFontana(AVEZZANO)
    const l = paraUnidadeDoBanco(r.unidades[0], 'emp-avezzano', { meses: 240, jurosAoMes: 0.0075, indice: 'IGPM' })
    const plano = l.plano_pagamento as Record<string, unknown>
    expect(plano.parcelas_qtd).toBe(0)
    expect(plano.reforcos_qtd).toBe(0)
    expect(plano.entrada).toBe(156393.16)
    expect(l.condicoes_negociacao).toContain('Entrada única')
    expect(l.condicoes_negociacao).toContain('240x')
  })

  it('a política lida do rodapé viaja até o plano gravado', () => {
    // Rodapé real da tabela do Avezzano. Sem ele o parser não tem de onde tirar
    // a condição — e o teste precisa provar o caminho inteiro, do PDF ao jsonb.
    const comRodape = AVEZZANO.replace(
      'Observações:',
      'Observações: 1) POLITICA COMERCIAL: OPÇÃO 02: O SALDO DEVEDOR PODERÁ SER PARCELADO DIRETO COM A CONSTRUTORA EM ATÉ 240 MESES, SENDO CORRIGIDO PELO IGPM E ACRESCIDO DE JUROS COMPENSATÓRIOS DE 0,75% A.M;',
    )
    const r = parsearTabelaFontana(comRodape)
    expect(r.cabecalho.financiamento_direto).toEqual({ meses: 240, jurosAoMes: 0.0075, indice: 'IGPM' })

    const l = paraUnidadeDoBanco(r.unidades[0], 'emp', r.cabecalho.financiamento_direto)
    const plano = l.plano_pagamento as Record<string, unknown>
    expect(plano.financiamento_direto).toEqual({ meses: 240, jurosAoMes: 0.0075, indice: 'IGPM' })
  })
})

describe('cub_fator não recebe a quantidade de CUBs', () => {
  // `cub_fator` é numeric(6,4): teto 99,9999. As quantidades reais vão de 210
  // (Pineto) a 372 (Avezzano). Gravar ali derruba a importação inteira com
  // "numeric field overflow" — foi o que aconteceu ao importar o Avezzano.
  it('a coluna vai nula, mesmo com quantidade alta na tabela', () => {
    const r = parsearTabelaFontana(AVEZZANO)
    const l = paraUnidadeDoBanco(r.unidades[0], 'emp')
    expect(l.cub_fator).toBeNull()
    expect(r.unidades[0].cub_fator).toBe(334)
  })

  it('a quantidade continua guardada, no plano', () => {
    const r = parsearTabelaFontana(AVEZZANO)
    const l = paraUnidadeDoBanco(r.unidades[0], 'emp')
    expect((l.plano_pagamento as Record<string, unknown>).cub_quantidade).toBe(334)
  })

  it('vale também para o formato parcelado', () => {
    const r = parsearTabelaFontana(TABELA)
    const l = paraUnidadeDoBanco(r.unidades[0], 'emp')
    expect(l.cub_fator).toBeNull()
    expect((l.plano_pagamento as Record<string, unknown>).cub_quantidade).toBeGreaterThan(99)
  })
})

// ─────────────────────────────────────────────────────────────────────
// Terceiro formato: 100% até as chaves, sem financiamento.
//
// Tremezzo, julho/2026. Entrada + 72 parcelas + 6 reforços fecham o valor
// inteiro do imóvel — a tabela não tem coluna de financiamento, porque não
// sobra saldo para o banco. Assumir 40 parcelas, 4 reforços e 30/70 recusava
// esta tabela inteira.
// ─────────────────────────────────────────────────────────────────────
const TREMEZZO = `Vigência desta tabela: Julho/2026
CUB06 - Julho - R$ 3.121,62 UNIDADE
BOX (m²) TOTAL (m²) ENTRADA
1 X
REFORÇO
PARCELA R$ ANUAL 100%
MENSAL R$ CUB06 100% 6 X
72 X
R$ CUB06 100% CUB06 102 3 105SE - 1º Pav 125,35 26,05 217,55 265.962,02 1.329.810,12 52.150,72 1.329.810,12 10.429,77 426 1.329.810,12 426 426 104 3 42S - 1º SS 125,35 13,50 201,96 244.110,68 1.220.553,42 47.866,04 1.220.553,42 9.572,87 391 1.220.553,42 391 391 Observações:
6) POLITICA COMERCIAL: OPÇÃO 1: SERÁ CONCEDIDO DESCONTO DE 15% PARA PAGAMENTO À VISTA, SEM PERMUTA.
OPÇÃO 2: O SALDO DEVEDOR DEVERÁ SER QUITADO VIA FINANCIAMENTO BANCÁRIO OU DIRETO COM A CONSTRUTORA EM ATÉ 180 MESES, SENDO CORRIGIDO PELO IGPM E ACRESCIDO DE JUROS COMPENSATÓRIOS DE 0,75% a.m.`

describe('tabela com 100% até as chaves', () => {
  it('lê as quantidades do cabeçalho, não do código', () => {
    const r = parsearTabelaFontana(TREMEZZO)
    expect(r.cabecalho.parcelas_qtd).toBe(72)
    expect(r.cabecalho.reforcos_qtd).toBe(6)
  })

  it('aceita a tabela em vez de recusar por não ter financiamento', () => {
    const r = parsearTabelaFontana(TREMEZZO)
    expect(r.unidades).toHaveLength(2)
    expect(r.rejeitadas).toHaveLength(0)
  })

  it('a conta fecha no valor inteiro do imóvel', () => {
    const u = parsearTabelaFontana(TREMEZZO).unidades[0]
    const soma = u.valor_entrada_min + 72 * u.parcela_mensal + 6 * u.reforco_anual
    expect(soma).toBeCloseTo(u.valor_tabela, 0)
    expect(u.saldo_financiamento).toBe(0)
  })

  it('o plano gravado registra 72/6 e 100% até as chaves', () => {
    const r = parsearTabelaFontana(TREMEZZO)
    const plano = paraUnidadeDoBanco(r.unidades[0], 'e').plano_pagamento as Record<string, unknown>
    expect(plano.parcelas_qtd).toBe(72)
    expect(plano.reforcos_qtd).toBe(6)
    expect(plano.percentual_ate_chaves).toBe(100)
  })

  it('o desconto à vista do rodapé vira opção', () => {
    const ops = parsearTabelaFontana(TREMEZZO).cabecalho.opcoes_pagamento
    expect(ops.find(o => o.tipo === 'a_vista')?.descontoPct).toBe(15)
    expect(ops.find(o => o.tipo === 'direto')?.meses).toBe(180)
  })

  it('o Pineto continua com 40/4 e o saldo IMPRESSO, não o derivado', () => {
    // Multiplicar 40 parcelas arredondadas dá 489.470,09; o PDF imprime
    // 489.470,02. Sete centavos que iriam para o contrato do cliente.
    const r = parsearTabelaFontana(TABELA)
    expect(r.cabecalho.parcelas_qtd).toBe(40)
    expect(r.cabecalho.reforcos_qtd).toBe(4)
    const u = r.unidades.find(x => x.unidade === '102')!
    expect(u.saldo_financiamento).toBe(489470.02)
  })
})

describe('nenhuma unidade some em silêncio', () => {
  // A unidade 1702 do Tremezzo tem DOIS boxes: "09 e 16S - 2º SS". A prévia
  // mostrava 13 de 14 unidades com ZERO rejeitadas — a linha desaparecia sem
  // deixar rastro. Perder em silêncio é pior que rejeitar.
  const COM_BOX_COMPOSTO = `Vigência desta tabela: Julho/2026
CUB06 - Julho - R$ 3.121,62 ENTRADA 1 X REFORÇO ANUAL 6 X PARCELA MENSAL 72 X
102 3 105SE - 1º Pav 125,35 26,05 217,55 265.962,02 1.329.810,12 52.150,72 1.329.810,12 10.429,77 426 1.329.810,12 426 426 1702 3 09 e 16S - 2º SS 125,35 27,00 218,71 314.034,97 1.570.174,86 61.577,02 1.570.174,86 12.314,97 503 1.570.174,86 503 503 Observações:`

  it('lê a unidade com dois boxes em vez de descartá-la', () => {
    const r = parsearTabelaFontana(COM_BOX_COMPOSTO)
    expect(r.unidades.map(u => u.unidade)).toContain('1702')
    expect(r.unidades).toHaveLength(2)
  })

  it('linha que o fatiador não pega vira rejeição visível', () => {
    // Código impossível de prever: a varredura tem que apontar o sumiço.
    const estranho = COM_BOX_COMPOSTO.replace('09 e 16S - 2º SS', '@@@')
    const r = parsearTabelaFontana(estranho)
    expect(r.unidades).toHaveLength(1)
    expect(r.rejeitadas.map(x => x.unidade)).toContain('1702')
  })

  it('a soma sempre fecha: lidas + rejeitadas = o que está no PDF', () => {
    const r = parsearTabelaFontana(COM_BOX_COMPOSTO)
    expect(r.unidades.length + r.rejeitadas.length).toBe(2)
  })
})

describe('prédio com mais de uma torre — letra do bloco na linha', () => {
  // Bosco del Montello, Torre B (tabela de julho/2026). A letra da torre vem
  // entre o número da unidade e os dormitórios: "904 B 2 44S - 2ºSS". Sem
  // prever esse campo, o fatiador não reconhecia NENHUMA das três linhas e a
  // importação inteira voltava vazia — 0 de 3, com zero rejeitadas.
  //
  // A unidade 1003 é o caso ruim de propósito: o extrator do PDF injeta
  // "FINANCIAMENTO 1 X -" entre o código do box e os valores.
  const BOSCO_TORRE_B = `Vigência desta tabela: Julho/2026
CUB06 - Julho - R$ 3.121,62 ENTRADA 1 X R$ CUB06 100% CUB06 904 B 2 44S - 2ºSS 66,36 12,00 107,35 87.093,20 580.621,32 493.528,12 580.621,32 186 186 1003 B 2 82E - 1ºSS/119S 2ºSS FINANCIAMENTO 1 X - 66,36 32,75 132,25 99.735,76 664.905,06 565.169,30 664.905,06 213 213 1004 B 2 160S e 163E - 2ºSS 66,36 26,00 124,08 102.545,22 683.634,78 581.089,56 683.634,78 219 219 Observações:`

  it('lê as três unidades da torre em vez de voltar vazia', () => {
    const r = parsearTabelaFontana(BOSCO_TORRE_B, CUB_JULHO)
    expect(r.unidades.map(u => u.unidade)).toEqual(['904', '1003', '1004'])
    expect(r.rejeitadas).toEqual([])
  })

  it('guarda a letra da torre em `bloco`', () => {
    const r = parsearTabelaFontana(BOSCO_TORRE_B, CUB_JULHO)
    expect(r.unidades.map(u => u.bloco)).toEqual(['B', 'B', 'B'])
    expect(paraUnidadeDoBanco(r.unidades[0], 'emp-1').bloco).toBe('B')
  })

  it('a letra do bloco não vira dormitório nem código de box', () => {
    const r = parsearTabelaFontana(BOSCO_TORRE_B, CUB_JULHO)
    expect(r.unidades[0].dormitorios).toBe(2)
    expect(r.unidades[0].box_codigo).toBe('44S')
  })

  it('as invariantes continuam valendo com a letra no meio', () => {
    const r = parsearTabelaFontana(BOSCO_TORRE_B, CUB_JULHO)
    const u = r.unidades[0]
    expect(u.formato).toBe('entrada_financiamento')
    expect(u.valor_tabela).toBeCloseTo(186 * CUB_JULHO, 2)
    expect(u.valor_entrada_min + u.saldo_financiamento).toBeCloseTo(u.valor_tabela, 2)
  })

  it('prédio de bloco único continua com bloco nulo', () => {
    const r = parsearTabelaFontana(TABELA, CUB_JULHO)
    expect(r.unidades.every(u => u.bloco === null)).toBe(true)
  })

  it('linha perdida numa tabela com bloco também vira rejeição visível', () => {
    const estranho = BOSCO_TORRE_B.replace('160S e 163E - 2ºSS', '@@@')
    const r = parsearTabelaFontana(estranho, CUB_JULHO)
    expect(r.unidades.map(u => u.unidade)).not.toContain('1004')
    expect(r.rejeitadas.map(x => x.unidade)).toContain('1004')
  })
})

describe('tabelas reais de julho/2026 — regressão do fatiador com bloco opcional', () => {
  // Trechos FIÉIS das tabelas já importadas e conferidas contra produção.
  // Existem porque o grupo opcional do bloco (`(?:[A-Z]\s+)?`) afrouxa o
  // reconhecimento do início de unidade, e esse mesmo padrão decide ONDE o
  // cabeçalho termina — se ele casar cedo demais, os multiplicadores "6 X" e
  // "72 X" ficam de fora e a tabela inteira volta com o plano do Pineto (40/4).
  //
  // Cada fixture guarda o cabeçalho inteiro, duas unidades e o rodapé.

  const THIENE = `Data RUA MONTEIRO LOBATO, 105, ESQ. RUA SANTO ANTONIO - CENTRO - CRICIÚMA/SC
emissão: 01/07/2026 17:05:43
Previsão de entrega: 30/09/2026 Vigência desta tabela: Julho/2026
CUB06 - Julho - R$ 3.121,62 UNIDADE
UNIDADE (m²) PRIVATIVA BOX (m²) TOTAL (m²) ENTRADA
1 X
REFORÇO
PARCELA R$ ANUAL 100%
MENSAL R$ CUB06 100% 6 X
72 X
R$ CUB06 100% CUB06 102 3 16S - T 101,88 13,50 174,03 214.767,46 1.073.837,28 42.112,32 1.073.837,28 8.422,17 344 1.073.837,28 344 344 301 3 06S - SS 101,88 14,57 175,41 245.983,66 1.229.918,28 48.233,30 1.229.918,28 9.646,32 394 1.229.918,28 394 394 Observações:
6) POLÍTICA COMERCIAL: OPÇÃO 1: SERÁ CONCEDIDO DESCONTO DE 15% PARA PAGAMENTO À VISTA;
OPÇÃO 2: SERÁ CONCEDIDO DESCONTO DE 10% SOBRE O VALOR TOTAL, PAGANDO 40% ATÉ AS CHAVES , COM ATO MÍNIMO DE 10%. APÓS A CONCLUSÃO DO EMPREENDIMENTO, O SALDO DEVEDOR DEVERÁ SER QUITADO VIA FINANCIAMENTO BANCÁRIO OU DIRETO COM A CONSTRUTORA EM ATÉ 180 MESES, SENDO CORRIGIDO PELO IGPM E ACRESCIDO DE JUROS COMPENSATÓRIOS DE 0,75% a.m (NESSA OPÇÃO NÃO SERÁ ACEITO PERMUTA).`

  const BELLANTE = `RUA TREZE DE MAIO - COMERCIARIO - Criciúma/SC
Previsão de entrega: 30/11/2026 Vigência desta tabela: Julho/2026
CUB06 - Julho - R$ 3.121,62 UNIDADE
UNIDADE (m²) PRIVATIVA BOX (m²) TOTAL (m²) ENTRADA
1 X
REFORÇO
PARCELA R$ ANUAL 100%
MENSAL R$ CUB06 100% 2 X
4 X
R$ CUB06 100%
R$ CUB06 100% CUB06 103 2 34S - SS 67,41 12,50 115,81 51.943,76 649.296,96 14.284,53 649.296,96 28.569,07 208 649.296,96 454.507,87 208 649.296,96 208 208 104 2 04S - SS 64,85 12,00 111,42 49.945,92 624.324,00 13.735,13 624.324,00 27.470,26 200 624.324,00 437.026,80 200 624.324,00 200 200 Observações:
1) Os valores contidos na presente tabela sofrerão correção monetária mensal com base na variação do CUB/SINDUSCON/SC até a data de conclusão do empreendimento, sendo que após a conclusão, os valores remanescentes serão corrigidos pelo IGPM e acrescidos de juros compensatórios de 0,75% ao mês. 2) Até a entrega de conclusão do empreendimento, 30% do valor do mesmo deverá estar quitado, sendo que o restante deverá ser liquidado mediante financiamento bancário ou em até 240 meses, diretamente com a construtora, observando-se o disposto no ítem 1. 6) Este empreendimento não aceita permuta; 8) POLÍTICA COMERCIAL: NESTE EMPREENDIMENTO SERÁ CONCEDIDO DESCONTO DE 5% PARA PAGAMENTO À VISTA`

  const CALLIANO = `Data Rua São José - Centro - CRICIÚMA/SC
Vigência desta tabela: Julho/2026
CUB06 - Julho - R$ 3.121,62 UNIDADE
UNIDADE (m²) PRIVATIVA BOX (m²) TOTAL (m²) ENTRADA
1 X
FINANCIAMENTO R$ 100% 1 X
R$ CUB06 100% CUB06 305 3 31 e 42S - SS 92,47 24,00 155,69 135.790,47 905.269,80 769.479,33 905.269,80 290 290 Observações:
1) POLITICA COMERCIAL:
OPÇÃO 01: FINANCIAMENTO BANCÁRIO
OPÇÃO 02: O SALDO DEVEDOR PODERÁ SER PARCELADO DIRETO COM A CONSTRUTORA EM ATÉ 180 MESES, SENDO CORRIGIDO PELO IGPM E ACRESCIDO DE JUROS COMPENSATÓRIOS DE 0,75% A.M;`

  it('Thiene: cabeçalho preserva 72 parcelas e 6 reforços', () => {
    const r = parsearTabelaFontana(THIENE, CUB_JULHO)
    expect(r.cabecalho.parcelas_qtd).toBe(72)
    expect(r.cabecalho.reforcos_qtd).toBe(6)
    expect(r.unidades).toHaveLength(2)
    expect(r.rejeitadas).toEqual([])
    const u = r.unidades[0]
    expect(u.bloco).toBeNull()
    expect(u.box_codigo).toBe('16S')
    expect(u.valor_tabela).toBe(1073837.28)
    expect(u.valor_entrada_min).toBe(214767.46)
    expect(u.parcela_mensal).toBe(8422.17)
    expect(u.reforco_anual).toBe(42112.32)
    expect(u.saldo_financiamento).toBe(0)
    expect(u.cub_fator).toBe(344)
  })

  it('Thiene: a opção 2 chega inteira, com desconto, chaves, ato e permuta', () => {
    const { opcoes_pagamento } = parsearTabelaFontana(THIENE, CUB_JULHO).cabecalho
    const direto = opcoes_pagamento.find(o => o.tipo === 'direto')
    expect(direto).toMatchObject({
      meses: 180, jurosAoMes: 0.0075, indice: 'IGPM',
      descontoPct: 10, ateAsChavesPct: 40, atoMinimoPct: 10, aceitaPermuta: false,
    })
    expect(opcoes_pagamento.find(o => o.tipo === 'a_vista')?.descontoPct).toBe(15)
  })

  it('Bellante: 4 parcelas e 2 reforços, e o direto de 240x volta a aparecer', () => {
    const r = parsearTabelaFontana(BELLANTE, CUB_JULHO)
    expect(r.cabecalho.parcelas_qtd).toBe(4)
    expect(r.cabecalho.reforcos_qtd).toBe(2)
    // A regressão que motivou o fix: "0,75% ao mês" devolvia null.
    expect(r.cabecalho.financiamento_direto).toEqual({
      meses: 240, jurosAoMes: 0.0075, indice: 'IGPM',
    })
    expect(r.cabecalho.desconto_a_vista_pct).toBe(5)
    expect(r.cabecalho.aceita_permuta).toBe(false)
    expect(r.unidades).toHaveLength(2)
    expect(r.rejeitadas).toEqual([])

    const u = r.unidades[0]
    expect(u.bloco).toBeNull()
    expect(u.valor_entrada_min).toBe(51943.76)
    expect(u.parcela_mensal).toBe(28569.07)
    expect(u.reforco_anual).toBe(14284.53)
    expect(u.saldo_financiamento).toBe(454507.87)
    // 30% até as chaves com as quantidades DESTA tabela — não as do Pineto.
    const ateChaves = u.valor_entrada_min + 4 * u.parcela_mensal + 2 * u.reforco_anual
    expect(ateChaves / u.valor_tabela).toBeCloseTo(0.3, 4)
  })

  it('Calliano: box composto e formato entrada+financiamento intactos', () => {
    const r = parsearTabelaFontana(CALLIANO, CUB_JULHO)
    expect(r.unidades).toHaveLength(1)
    expect(r.rejeitadas).toEqual([])
    const u = r.unidades[0]
    expect(u.bloco).toBeNull()
    expect(u.box_codigo).toBe('31 e 42S')
    expect(u.formato).toBe('entrada_financiamento')
    expect(u.valor_entrada_min + u.saldo_financiamento).toBeCloseTo(u.valor_tabela, 2)
    expect(u.cub_fator).toBe(290)
  })

  it('a letra do bloco não inventa unidade onde não há', () => {
    // Nenhuma das tabelas de bloco único pode ganhar unidade a mais por causa
    // do grupo opcional.
    for (const [nome, texto, esperado] of [
      ['Thiene', THIENE, 2], ['Bellante', BELLANTE, 2], ['Calliano', CALLIANO, 1],
    ] as const) {
      const r = parsearTabelaFontana(texto, CUB_JULHO)
      expect(`${nome}:${r.unidades.length + r.rejeitadas.length}`).toBe(`${nome}:${esperado}`)
    }
  })
})

describe('previsão de entrega vai para o plano', () => {
  // A data já era lida no cabeçalho e parava ali. A tela precisa dela para
  // dividir o "até as chaves" da opção comercial pelos meses que faltam.
  it('grava a entrega do cabeçalho no plano_pagamento', () => {
    const r = parsearTabelaFontana(TABELA, CUB_JULHO)
    expect(r.cabecalho.previsao_entrega).toBe('30/11/2029')
    const linha = paraUnidadeDoBanco(
      r.unidades[0], 'emp-1', r.cabecalho.financiamento_direto,
      r.cabecalho.opcoes_pagamento, r.cabecalho.previsao_entrega,
    )
    expect(linha.plano_pagamento.previsao_entrega).toBe('30/11/2029')
  })

  it('tabela sem data de entrega grava null, não string vazia', () => {
    const r = parsearTabelaFontana(TABELA, CUB_JULHO)
    const linha = paraUnidadeDoBanco(r.unidades[0], 'emp-1', null, [], null)
    expect(linha.plano_pagamento.previsao_entrega).toBeNull()
  })
})

describe('quantidade de CUB acima de mil', () => {
  // Monte Leone (julho/2026): apartamentos de 4 dormitórios entre R$ 3,33M e
  // R$ 4,60M — os primeiros do portfólio a passar de 1.000 CUBs. Acima de mil
  // o PDF escreve "1.192" com separador de milhar, e o extrator de inteiros
  // capturava só "192". A invariante `total = quantidade × CUB` então
  // derrubava a linha: 26 de 26 rejeitadas, com zero unidades importadas.
  const MONTE_LEONE = `Previsão de entrega: 30/08/2030 Vigência desta tabela: Julho/2026
CUB06 - Julho - R$ 3.121,62 ENTRADA 1 X REFORÇO ANUAL 6 X PARCELA MENSAL 72 X
301 4 03D e 10S - 2ºSS 253,80 37,50 430,61 744.194,21 3.720.971,04 145.924,08 3.720.971,04 29.183,78 1.192 3.720.971,04 1.192 1.192 303 4 01D e 08S - 2ºSS 232,70 40,50 403,67 666.778,03 3.333.890,16 130.744,06 3.333.890,16 26.147,89 1.068 3.333.890,16 1.068 1.068 1301 4 42E - T, 43 e 44S - T 03 253,80 45,00 446,32 919.629,25 4.598.146,26 180.323,97 4.598.146,26 36.063,52 1.473 4.598.146,26 1.473 1.473 Observações:`

  it('lê 1.192 como 1192, não como 192', () => {
    const r = parsearTabelaFontana(MONTE_LEONE, CUB_JULHO)
    expect(r.rejeitadas).toEqual([])
    expect(r.unidades.map(u => u.cub_fator)).toEqual([1192, 1068, 1473])
  })

  it('a invariante do CUB volta a fechar', () => {
    const r = parsearTabelaFontana(MONTE_LEONE, CUB_JULHO)
    expect(r.unidades).toHaveLength(3)
    for (const u of r.unidades) {
      expect(u.cub_fator * CUB_JULHO).toBeCloseTo(u.valor_tabela, 1)
    }
  })

  it('a quantidade grande vai para o jsonb, nunca para cub_fator', () => {
    // `cub_fator` é numeric(6,4): 1192 estouraria a coluna.
    const r = parsearTabelaFontana(MONTE_LEONE, CUB_JULHO)
    const linha = paraUnidadeDoBanco(r.unidades[0], 'emp-1')
    expect(linha.cub_fator).toBeNull()
    expect(linha.plano_pagamento.cub_quantidade).toBe(1192)
  })

  it('tabela sem separador de milhar continua igual', () => {
    // Pineto opera entre 210 e 264 CUBs, escritos sem ponto.
    const r = parsearTabelaFontana(TABELA, CUB_JULHO)
    expect(r.unidades.map(u => u.cub_fator)).toEqual([224, 210, 257, 264, 260])
    expect(r.rejeitadas).toEqual([])
  })

  it('quatro dígitos corridos, sem ponto, também são lidos inteiros', () => {
    const semPonto = MONTE_LEONE.replace(/1\.192/g, '1192')
    const r = parsearTabelaFontana(semPonto, CUB_JULHO)
    expect(r.unidades.find(u => u.unidade === '301')!.cub_fator).toBe(1192)
  })
})

describe('contagem independente do fatiador', () => {
  // A rede que substitui `unidadesPerdidas` nas tabelas sem coluna de
  // dormitórios, onde aquela heurística fica sem âncora. Cada linha de unidade
  // termina com a quantidade de CUB repetida duas vezes — redundância que o
  // fatiador não usa, e que por isso serve de conferência independente.

  it('conta as linhas do Pineto sem olhar para o começo delas', () => {
    const r = parsearTabelaFontana(TABELA, CUB_JULHO)
    expect(r.conferenciaLinhas).toEqual({ esperado: 5, lidas: 5, confere: true })
  })

  it('acusa quando o fatiador perde uma linha que o PDF tem', () => {
    // Destrói o começo da linha da 104 sem tocar no fim: o fatiador deixa de
    // vê-la, mas a repetição do CUB continua lá.
    const mutilada = TABELA.replace('104 2 04S - T', '@@@@@@@@@@@@@')
    const r = parsearTabelaFontana(mutilada, CUB_JULHO)
    expect(r.unidades.length + r.rejeitadas.length).toBe(4)
    expect(r.conferenciaLinhas).toEqual({ esperado: 5, lidas: 4, confere: false })
  })

  it('centavos que colam no número seguinte NÃO viram par', () => {
    // "1.863.607,14 14.616,37" tem "14 14" no meio, e sem as guardas de
    // fronteira a conferência acusava 57 linhas onde havia 55 — bloqueando
    // uma importação correta. Falso positivo aqui é tão ruim quanto falso
    // negativo: ensina a ignorar o alarme.
    const comColisao = `CUB06 - Julho - R$ 3.121,62 ENTRADA 1 X REFORÇO ANUAL 6 X PARCELA MENSAL 72 X
903 116 e 117S 132,00 24,00 226,41 372.721,43 1.863.607,14 73.084,46 1.863.607,14 14.616,37 597 1.863.607,14 597 597 Observações:`
    expect(contarLinhasPelaRepeticaoDoCub(comColisao)).toBe(1)
  })

  it('quantidade acima de mil, com separador, também é contada', () => {
    const monteLeone = `CUB06 - Julho - R$ 3.121,62 ENTRADA 1 X REFORÇO ANUAL 6 X PARCELA MENSAL 72 X
301 4 03D e 10S - 2ºSS 253,80 37,50 430,61 744.194,21 3.720.971,04 145.924,08 3.720.971,04 29.183,78 1.192 3.720.971,04 1.192 1.192 Observações:`
    expect(contarLinhasPelaRepeticaoDoCub(monteLeone)).toBe(1)
  })

  it('texto sem a repetição devolve null em vez de zero', () => {
    // Zero seria interpretado como "o PDF não tem linha nenhuma" e bloquearia
    // tudo. Null significa "esta tabela não tem esta redundância".
    expect(contarLinhasPelaRepeticaoDoCub('Observações: nada aqui')).toBeNull()
  })
})

describe('tabela sem coluna de dormitórios (Lavis)', () => {
  // O Lavis vai do número da unidade direto para o box, e declara "03
  // Dormitórios ( 03 Suítes)" uma vez só, no rodapé.
  const LAVIS = `Previsão de entrega: 31/12/2030 Vigência desta tabela: Julho/2026
CUB06 - Julho - R$ 3.121,62 ENTRADA 1 X REFORÇO ANUAL 6 X PARCELA MENSAL 72 X
501 63D - T 125,98 25,90 219,88 340.256,58 1.701.282,90 66.718,64 1.701.282,90 13.343,26 545 1.701.282,90 545 545 701 13 e 14S - 2ºSS 125,98 24,00 217,50 357.737,65 1.788.688,26 70.146,39 1.788.688,26 14.028,78 573 1.788.688,26 573 573 Observações:
Nº DORMITÓRIOS UNIDADES 03 Dormitórios ( 03 Suítes)`

  it('reconhece as linhas sem o dígito de dormitórios', () => {
    const r = parsearTabelaFontana(LAVIS, CUB_JULHO)
    expect(r.unidades.map(u => u.unidade)).toEqual(['501', '701'])
    expect(r.rejeitadas).toEqual([])
    expect(r.conferenciaLinhas.confere).toBe(true)
  })

  it('o box não é confundido com dormitórios', () => {
    const r = parsearTabelaFontana(LAVIS, CUB_JULHO)
    // "501 63D": o 6 NÃO é dormitório — vem colado no 3.
    expect(r.unidades[0].box_codigo).toBe('63D')
    expect(r.unidades[1].box_codigo).toBe('13 e 14S')
  })

  it('dormitórios e suítes vêm do rodapé', () => {
    const r = parsearTabelaFontana(LAVIS, CUB_JULHO)
    expect(r.unidades.every(u => u.dormitorios === 3 && u.suites === 3)).toBe(true)
    expect(paraUnidadeDoBanco(r.unidades[0], 'emp-1').suites).toBe(3)
  })

  it('tabela COM a coluna não muda de caminho', () => {
    // A detecção tenta primeiro a forma com dormitórios; só cai na outra
    // quando nenhuma linha é reconhecida.
    const r = parsearTabelaFontana(TABELA, CUB_JULHO)
    expect(r.unidades.every(u => u.dormitorios === 2)).toBe(true)
    expect(r.unidades[0].box_codigo).toBe('91S')
  })
})

describe('suítes saem do rodapé, não de valor fixo', () => {
  it('rodapé uniforme define as suítes do prédio', () => {
    expect(lerDormitoriosDoRodape('Nº DORMITÓRIOS UNIDADES 03 Dormitórios ( 03 Suítes)'))
      .toEqual({ dormitorios: 3, suites: 3 })
    expect(lerDormitoriosDoRodape('Apto Tipo - 03 Dormitórios (01 Suíte)'))
      .toEqual({ dormitorios: 3, suites: 1 })
    expect(lerDormitoriosDoRodape('04 Dormitórios (Sendo 03 Suítes)'))
      .toEqual({ dormitorios: 4, suites: 3 })
  })

  it('rodapé que varia por final devolve null em vez de chutar', () => {
    // Monte Leone: "Finais 01 e 02 - 04 Dormitórios (Sendo 03 Suítes) Final 03
    // - 04 Dormitórios (Sendo 04 Suítes)". Escolher um dos dois colocaria
    // número errado em parte do prédio.
    const r = lerDormitoriosDoRodape(
      'Finais 01 e 02 - 04 Dormitórios (Sendo 03 Suítes) Final 03 - 04 Dormitórios (Sendo 04 Suítes)',
    )
    expect(r.dormitorios).toBe(4) // uniforme
    expect(r.suites).toBeNull()   // varia
  })

  it('sem rodapé legível, mantém 1 e não quebra', () => {
    expect(lerDormitoriosDoRodape('sem nada disso')).toEqual({ dormitorios: null, suites: null })
    const r = parsearTabelaFontana(TABELA.replace(/02 Dormitórios \(01 Suíte\)/, ''), CUB_JULHO)
    expect(paraUnidadeDoBanco(r.unidades[0], 'e').suites).toBe(1)
  })
})

describe('suítes e dormitórios declarados por final', () => {
  const MONTE_LEONE = 'Finais 01 e 02 - 04 Dormitórios (Sendo 03 Suítes) Final 03 - 04 Dormitórios (Sendo 04 Suítes)'
  const CALLIANO = 'Final 1,2,4 e 5 - 03 Dormitórios (01 Suíte) Final 3 e 6 - 02 Dormitórios (01 Suíte)'
  // O PDF do Due Fratelli escreve "Dormítórios", com o acento fora do lugar.
  const DUE = 'Apartamento Finais: 1,2,4 e 5 - 03 Dormitórios (01 Suíte) Apartamento Finais: 3 e 6 - 02 Dormítórios (01 Suíte)'

  it('lê as duas regras do Monte Leone', () => {
    expect(lerRegrasPorFinal(MONTE_LEONE)).toEqual([
      { finais: ['01', '02'], dormitorios: 4, suites: 3 },
      { finais: ['03'], dormitorios: 4, suites: 4 },
    ])
  })

  it('final de DOIS dígitos casa pelos dois últimos', () => {
    const r = lerRegrasPorFinal(MONTE_LEONE)
    expect(regraDaUnidade('301', r)?.suites).toBe(3)   // final 01
    expect(regraDaUnidade('1002', r)?.suites).toBe(3)  // final 02
    expect(regraDaUnidade('303', r)?.suites).toBe(4)   // final 03
    expect(regraDaUnidade('1303', r)?.suites).toBe(4)
  })

  it('final de UM dígito casa pelo último — não fixar em dois', () => {
    const r = lerRegrasPorFinal(CALLIANO)
    expect(regraDaUnidade('305', r)?.dormitorios).toBe(3) // final 5
    expect(regraDaUnidade('306', r)?.dormitorios).toBe(2) // final 6
  })

  it('tolera o acento errado do PDF do Due Fratelli', () => {
    expect(lerRegrasPorFinal(DUE)).toHaveLength(2)
    expect(regraDaUnidade('306', lerRegrasPorFinal(DUE))?.dormitorios).toBe(2)
  })

  it('rodapé uniforme não vira regra por final', () => {
    expect(lerRegrasPorFinal('Nº DORMITÓRIOS UNIDADES 03 Dormitórios ( 03 Suítes)')).toEqual([])
  })

  it('unidade sem regra aplicável não recebe suíte inventada', () => {
    expect(regraDaUnidade('307', lerRegrasPorFinal(MONTE_LEONE))).toBeNull()
  })

  it('a regra por final chega até a linha do banco', () => {
    const tabela = `Vigência desta tabela: Julho/2026
CUB06 - Julho - R$ 3.121,62 ENTRADA 1 X REFORÇO ANUAL 6 X PARCELA MENSAL 72 X
301 4 03D e 10S 253,80 37,50 430,61 744.194,21 3.720.971,04 145.924,08 3.720.971,04 29.183,78 1.192 3.720.971,04 1.192 1.192 303 4 01D e 08S 232,70 40,50 403,67 666.778,03 3.333.890,16 130.744,06 3.333.890,16 26.147,89 1.068 3.333.890,16 1.068 1.068 Observações:
${MONTE_LEONE}`
    const r = parsearTabelaFontana(tabela, CUB_JULHO)
    expect(r.unidades).toHaveLength(2)
    expect(paraUnidadeDoBanco(r.unidades[0], 'e').suites).toBe(3) // 301
    expect(paraUnidadeDoBanco(r.unidades[1], 'e').suites).toBe(4) // 303
    // Dormitórios continuam vindo da COLUNA, que existe nesta tabela.
    expect(r.unidades.every(u => u.dormitorios === 4)).toBe(true)
  })
})

describe('ordem das colunas parcela/reforço varia por tabela', () => {
  const VALORES = '101 4 03D - T 189,51 24,00 272,15 561.267,28 2.806.336,38 26.412,30 2.806.336,38 132.066,19 899 2.806.336,38 899 899 Observações:'

  // Villammare: MENSAL antes de ANUAL, multiplicadores "60 X 5 X".
  const INVERTIDA = `CUB06 - Julho - R$ 3.121,62 ENTRADA 1 X PARCELA MENSAL R$ 100% REFORÇO ANUAL 1 X 60 X 5 X ${VALORES}`
  // A mesma linha, com o cabeçalho na ordem da maioria.
  const PADRAO = `CUB06 - Julho - R$ 3.121,62 ENTRADA 1 X REFORÇO ANUAL 100% PARCELA MENSAL 1 X 5 X 60 X ${VALORES}`

  it('lê parcela e reforço pela ordem do cabeçalho, não por posição fixa', () => {
    const inv = parsearTabelaFontana(INVERTIDA, CUB_JULHO).unidades[0]
    // Confirmado pelo corretor: 60x de R$ 26.412,30 com 5 reforços de R$ 132.066,19.
    expect(inv.parcela_mensal).toBe(26412.30)
    expect(inv.reforco_anual).toBe(132066.19)
  })

  it('a troca fecha a soma e por isso as invariantes NÃO a pegam', () => {
    // É o ponto do fix. O Mar di Atrani passava com 9 unidades e ZERO
    // rejeitadas, com parcela e reforço trocados em todas — a soma
    // `entrada + Np + Mr` fecha igual quando as quantidades se combinam.
    // Na tela viraria "72 parcelas de R$ 132 mil" em vez de "72 de R$ 26 mil".
    const r = parsearTabelaFontana(PADRAO, CUB_JULHO)
    expect(r.unidades[0].parcela_mensal).toBe(132066.19) // lido ao contrário
    expect(r.rejeitadas).toEqual([])                      // e ainda assim aceito
  })

  it('reforço MENOR que a parcela é legítimo — não serve de detector', () => {
    // Bellante entrega em 4 meses: 4 parcelas de R$ 28.569,07 e 2 reforços de
    // R$ 14.284,53. Uma trava "reforço >= parcela" recusaria uma tabela certa.
    const r = parsearTabelaFontana(TABELA_BELLANTE, CUB_JULHO)
    const u = r.unidades[0]
    expect(u.parcela_mensal).toBe(28569.07)
    expect(u.reforco_anual).toBe(14284.53)
    expect(u.reforco_anual).toBeLessThan(u.parcela_mensal)
    expect(r.rejeitadas).toEqual([])
  })
})

const TABELA_BELLANTE = `CUB06 - Julho - R$ 3.121,62 ENTRADA 1 X REFORÇO PARCELA R$ ANUAL 100% MENSAL R$ CUB06 100% 2 X 4 X
103 2 34S - SS 67,41 12,50 115,81 51.943,76 649.296,96 14.284,53 649.296,96 28.569,07 208 649.296,96 454.507,87 208 649.296,96 208 208 Observações:`
