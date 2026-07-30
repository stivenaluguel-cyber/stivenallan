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
