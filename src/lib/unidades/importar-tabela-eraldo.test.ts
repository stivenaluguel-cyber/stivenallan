import { describe, expect, it } from 'vitest'
import { coluna, parsearTabelaEraldo } from './importar-tabela-eraldo'

// Os números destes trechos são das tabelas de julho/2026, copiados do texto
// extraído dos PDFs. Inventar valor aqui não testaria nada: o que o parser faz
// é justamente conferir que eles fecham entre si.

const GRAN_MICHEL = `CUB (JULHO/2026)  R$ 3.121,62 LANÇAMENTO - RUA SENADOR PAULO SARASATE, BAIRRO MICHEL, CRICIÚMA/SC
ÁREAS PARCELAS
UNIDADES REFORCOS x PÓS CHAVES
APTO TOTAL PREÇO ENTRADA MENSAIS x
GLOBAL OU FIN. ATÉ 180X *
VAGAS (m²) CUB (R$) 3 22
APTO DEP. VAGAS GARAGEM (m²)
GARAGEM PRIVAT. 10% 5% 15% 70%
Dep. 31 V80 A/B
Apto 304 2 Vagas - 93,20 160,97 314,38 R$ 981.383,66 R$ 98.138,37 R$ 16.356,39 R$ 6.691,25 R$ 686.968,56
(Subsolo) (G1)
Dep. 1 V69
Apto 405 1 Vaga - 71,47 116,47 212,78 R$ 664.227,72 R$ 66.422,77 R$ 11.070,46 R$ 4.528,83 R$ 464.959,40
(Subsolo) (G1)
- Parcela B - 70% em até 180 parcelas mensais corrigidas pelo IGPM + 075% ao mês, direto com a construtora.
4 - Prazo de entrega Junho de 2028.
`

// Três colunas e nenhum saldo: tudo se paga até as chaves.
const ARBOR = `CUB (JULHO/2026)  R$ 3.121,62 LANÇAMENTO
ÁREAS REFORÇOS PARCELAS
UNIDADES Entrada
APTO PREÇO ANUAIS x MENSAIS x
GLOBAL TOTAL CUB (20%)
(m²) (R$) 6 65
APTO DEP. VAGAS GARAGEM (m²)
PRIVAT. 20% 20% 60%
Dep. 6 V 05 V 27A/B
Apto 301 192,95 332,55 855,48 R$ 2.670.476,21 R$ 534.095,24 R$ 89.015,87 R$ 24.650,55
(Subsolo) (Subsolo) (Subsolo)
Dep. 5 V 59 V 26A/B
Apto 302 192,95 332,46 855,25 R$ 2.669.776,77 R$ 533.955,35 R$ 88.992,56 R$ 24.644,09
(Subsolo) (G1) (Subsolo)
3 - Conclusão da obra: OUT/28.
`

const HORIZON = `CUB (JULHO/2026)  R$ 3.121,62 LANÇAMENTO - AV. DOS ESPORTES, BALNEÁRIO RINCÃO/SC
ÁREAS FIN. BANCÁRIO OU
PARCELAS
UNIDADES PARCELAS MENSAIS
PREÇO ENTRADA CHAVES MENSAIS x
APTO TOTAL CUB (0,75% + IGPM) x
GLOBAL (R$)
(m²)
(m²) 4 60
APTO DEP. VAGAS GARAGEM
PRIVAT. 20% 15% 5% 60%
Apto 201 Dep. 16 V03 A/B
- - 125,45 220,36 619,20 R$ 1.932.907,35 R$ 386.581,47 R$ 289.936,10 R$ 24.161,34 R$ 19.329,07
(decorado) (G1) (Térreo)
4 - Prazo de entrega: 30 de Novembro de 2026.
`

const PLAY = `CUB - JULHO - 2026 R$ 3.121,62
ÁREAS UN.
UNIDADES ÁREA FINANC.
(m²) TOTAL PREÇO ENTRADA
GLOBAL BANCÁRIO
Nº Nº VAGAS CUB (R$)
UN. PRIVAT. (m²)
DORM. CARROS GARAGEM 30% 70%
V415
Apto 301 2 1 - 61,18 115,76 191,00 R$ 596.239,95 R$ 178.871,98 R$ 417.367,96
(G4)
6- Prazo de entrega dos aptos decorados:OUTUBRO/2025
`

// Tabela de agosto/2026 — "Mês do Corretor". A Eraldo inseriu uma coluna de
// preço promocional entre o preço de tabela e a entrada; as três colunas de
// pagamento são fração do preço COM desconto, não do preço cheio.
const AURA_CAMPANHA = `CUB (AGOSTO/2026)  R$ 3.151,24 LANÇAMENTO
ÁREAS REFORÇOS PARCELAS
UNIDADES
APTO PREÇO CAMPANHA ENTRADA ANUAIS X MENSAIS x
GLOBAL TOTAL CUB
(m²) (R$) (R$) 6 74
APTO DEP. VAGAS GARAGEM (m²)
PRIVAT. 10% 20% 70%
Dep. 12 V 01 V 28
Apto 201 - 155,82 281,06 563,96 R$ 1.777.176,28 R$ 1.682.806,28 R$ 168.280,63 R$ 56.093,54 R$ 15.918,44
(Subsolo 3) (Subsolo 3) (Subsolo 3)
Dep. 2 V 04 V 05
Apto 203 - 155,76 277,38 581,03 R$ 1.830.975,62 R$ 1.660.748,86 R$ 166.074,89 R$ 55.358,30 R$ 15.709,79
(Subsolo 3) (Subsolo 3) (Subsolo 3)
4 - Prazo de entrega ABR/29.
`

describe('preço de campanha (agosto/2026 — Mês do Corretor)', () => {
  it('detecta a coluna extra pelo cabeçalho', () => {
    expect(parsearTabelaEraldo(AURA_CAMPANHA).cabecalho.tem_preco_campanha).toBe(true)
    expect(parsearTabelaEraldo(GRAN_MICHEL).cabecalho.tem_preco_campanha).toBe(false)
  })

  it('calcula entrada/reforço/mensal sobre o preço COM desconto, não o de tabela', () => {
    const r = parsearTabelaEraldo(AURA_CAMPANHA)

    expect(r.rejeitadas).toEqual([])
    expect(r.unidades).toHaveLength(2)
    // 10% de R$ 1.682.806,28 (campanha) = R$ 168.280,63 — bate.
    // 10% de R$ 1.777.176,28 (tabela) seria R$ 177.717,63 — não bate.
    expect(coluna(r.unidades[0], 'entrada')?.valor).toBe(168280.63)
    expect(r.unidades[0].preco).toBe(1682806.28)
    expect(r.unidades[0].preco_tabela).toBe(1777176.28)
  })

  it('a conferência de CUB usa o preço de TABELA — o CUB é do imóvel, não muda com desconto', () => {
    // Se a conferência usasse o preço de campanha aqui, a linha seria
    // rejeitada: 1.682.806,28 / 3.151,24 = 534,04, muito longe de 563,96.
    const r = parsearTabelaEraldo(AURA_CAMPANHA)
    expect(r.rejeitadas).toEqual([])
    expect(r.unidades[0].cub_quantidade).toBe(563.96)
  })

  it('sem campanha, preco_tabela fica nulo — preco já É o de tabela', () => {
    const r = parsearTabelaEraldo(GRAN_MICHEL)
    expect(r.unidades.every((u) => u.preco_tabela === null)).toBe(true)
  })

  it('a linha rejeita com o número certo de colunas esperadas quando falta a de campanha', () => {
    // Simula a coluna de campanha desaparecer de uma única linha (erro de
    // extração) — a tabela inteira já foi identificada como "tem campanha"
    // pelo cabeçalho, então a linha tem que ter as 5 colunas, não 4.
    const semCampanhaNaLinha = AURA_CAMPANHA.replace(
      'R$ 1.777.176,28 R$ 1.682.806,28 R$ 168.280,63 R$ 56.093,54 R$ 15.918,44',
      'R$ 1.682.806,28 R$ 168.280,63 R$ 56.093,54 R$ 15.918,44',
    )
    const r = parsearTabelaEraldo(semCampanhaNaLinha)
    expect(r.rejeitadas.find((x) => x.unidade === '201')?.motivo).toContain('colunas fora do esperado')
  })
})

describe('estrutura de pagamento — cada tabela tem a sua', () => {
  it('lê as quatro colunas do Gran Michel e deriva as quantidades', () => {
    const r = parsearTabelaEraldo(GRAN_MICHEL)

    expect(r.rejeitadas).toEqual([])
    expect(r.unidades).toHaveLength(2)
    expect(r.quantidades).toEqual([1, 3, 22, 1])
    expect(r.unidades[0].colunas.map((c) => c.papel)).toEqual(['entrada', 'reforcos', 'mensais', 'saldo'])
    expect(r.cabecalho.pos_chaves_meses).toBe(180)
    expect(r.cabecalho.previsao_entrega).toBe('Junho de 2028')
  })

  it('não inventa saldo onde a tabela não tem: o Árbor fecha 100% até as chaves', () => {
    const r = parsearTabelaEraldo(ARBOR)

    expect(r.rejeitadas).toEqual([])
    expect(r.cabecalho.percentuais).toEqual([0.2, 0.2, 0.6])
    expect(r.cabecalho.tem_financiamento).toBe(false)
    expect(r.unidades[0].colunas.map((c) => c.papel)).toEqual(['entrada', 'reforcos', 'mensais'])
    expect(coluna(r.unidades[0], 'saldo')).toBeNull()
    expect(r.quantidades).toEqual([1, 6, 65])
    expect(r.cabecalho.previsao_entrega).toBe('OUT/28')
  })

  it('separa o pagamento nas chaves do Horizon das parcelas mensais', () => {
    const r = parsearTabelaEraldo(HORIZON)

    expect(r.rejeitadas).toEqual([])
    expect(r.unidades[0].colunas.map((c) => c.papel)).toEqual(['entrada', 'chaves', 'mensais', 'saldo'])
    expect(coluna(r.unidades[0], 'chaves')?.valor).toBe(289936.1)
    expect(coluna(r.unidades[0], 'mensais')?.quantidade).toBe(4)
    // O saldo do Horizon é parcelado em 60x, não pago de uma vez.
    expect(coluna(r.unidades[0], 'saldo')?.quantidade).toBe(60)
    expect(r.cabecalho.juros_ao_mes).toBe(0.75)
  })

  it('usa a coluna de dormitórios quando a tabela traz (só o Play traz)', () => {
    const r = parsearTabelaEraldo(PLAY)

    expect(r.rejeitadas).toEqual([])
    expect(r.unidades[0].dormitorios).toBe(2)
    expect(r.unidades[0].vagas).toBe('1 Vaga')
    expect(r.unidades[0].colunas.map((c) => c.papel)).toEqual(['entrada', 'saldo'])
  })

  it('acha os dormitórios mesmo com a vaga entre o número e as contagens', () => {
    // Play 1004: o identificador ficou numa linha e a vaga entrou no meio.
    const separado = PLAY.replace(
      'Apto 301 2 1 - 61,18 115,76 191,00 R$ 596.239,95 R$ 178.871,98 R$ 417.367,96',
      'Apto 1004 V332\n2 1 - 61,60 118,59 264,47 R$ 825.561,60 R$ 247.668,48 R$ 577.893,12',
    )
    const r = parsearTabelaEraldo(separado)

    expect(r.rejeitadas).toEqual([])
    expect(r.unidades[0].unidade).toBe('1004')
    expect(r.unidades[0].dormitorios).toBe(2)
  })

  it('a data do apartamento decorado não é a entrega do prédio', () => {
    expect(parsearTabelaEraldo(PLAY).cabecalho.previsao_entrega).toBeNull()
  })
})

describe('o juro do rodapé', () => {
  it('lê "IGPM + 075% ao mês" como 0,75% — não como 75%', () => {
    expect(parsearTabelaEraldo(GRAN_MICHEL).cabecalho.juros_ao_mes).toBe(0.75)
  })
})

describe('a rede de conferência', () => {
  it('rejeita a unidade cujo preço não é a quantidade de CUB impressa', () => {
    // R$ 1.000.000,00 no lugar de R$ 981.383,66, com as demais colunas
    // recalculadas para 10/5/15/70 — todas as invariantes de percentual
    // continuam fechando, e só o CUB denuncia.
    const adulterado = GRAN_MICHEL.replace(
      'R$ 981.383,66 R$ 98.138,37 R$ 16.356,39 R$ 6.691,25 R$ 686.968,56',
      'R$ 1.000.000,00 R$ 100.000,00 R$ 16.666,67 R$ 6.818,18 R$ 700.000,00',
    )
    const r = parsearTabelaEraldo(adulterado)

    expect(r.unidades.map((u) => u.unidade)).toEqual(['405'])
    expect(r.rejeitadas[0].unidade).toBe('304')
    expect(r.rejeitadas[0].motivo).toContain('CUB não fecha')
  })

  it('rejeita a linha em que uma coluna não dá número inteiro de pagamentos', () => {
    const r = parsearTabelaEraldo(GRAN_MICHEL.replace('R$ 16.356,39', 'R$ 15.000,00'))

    expect(r.rejeitadas[0].unidade).toBe('304')
    expect(r.rejeitadas[0].motivo).toContain('não dá inteiro')
  })

  it('recusa a tabela inteira quando as quantidades divergem entre unidades', () => {
    // Metade do reforço na 405: cada linha passa sozinha, mas uma diz 3
    // reforços e a outra 6. Não é a tabela de dois apartamentos diferentes.
    const r = parsearTabelaEraldo(GRAN_MICHEL.replace('R$ 11.070,46', 'R$ 5.535,23'))

    expect(r.unidades).toEqual([])
    expect(r.quantidades).toBeNull()
    expect(r.rejeitadas).toHaveLength(2)
    expect(r.rejeitadas[0].motivo).toContain('quantidades divergem')
  })

  it('acusa a linha de valores que ficou fora da leitura', () => {
    // As sete salas comerciais do Symphony vêm depois do rodapé dos
    // apartamentos, com estrutura própria. Não são "Apto": a contagem por
    // identificador fechava 2 de 2 e não via nada.
    const comSalas = `${ARBOR}Sala C. 02 117,34 159,00 159,00 318,00 R$ 992.678,89 R$ 198.535,78 R$ 198.535,78 R$ 16.544,65\n`
    const r = parsearTabelaEraldo(comSalas)

    expect(r.unidades).toHaveLength(2)
    expect(r.conferencia.aptos_no_texto).toBe(2)
    expect(r.conferencia.linhas_de_valor_orfas).toHaveLength(1)
    expect(r.conferencia.confere).toBe(false)
  })

  it('fecha quando tudo que parece unidade virou unidade', () => {
    const r = parsearTabelaEraldo(GRAN_MICHEL)

    expect(r.conferencia.confere).toBe(true)
    expect(r.conferencia.linhas_de_valor_orfas).toEqual([])
  })
})

describe('política comercial do rodapé', () => {
  const RODAPE = `${GRAN_MICHEL}Condição 2 - 5% de desconto
- Parcela A (70% até as chaves) - 10% de entrada, 20% em reforços até as chaves e 40% divididos em 22 parcelas mensais corrigidas pelo CUB.
- Parcela B - 30% em até 180 parcelas mensais corrigidas pelo IGPM + 075% ao mês, direto com a construtora ou financiamento bancário.
Condição 3 -7% de desconto para pagamento até as chaves
- Parcela A - 20% de entrada 20% em reforços até as chaves 60% em 22 parcelas mensais corrigidas pelo CUB
Condição 4 - 10% de desconto
- Pagamento à vista.
ATENÇÃO: O período máximo de intervalo entre os reforços será de 12 meses.
1 - Os valores expressos na presente tabela serão corrigidos mensalmente conforme variaçao do CUB.
5 - Os apartamentos "Diferenciados"possuem pé direito 4,70m.
`

  it('lê as condições numeradas com desconto, prazo e juros', () => {
    const o = parsearTabelaEraldo(RODAPE).cabecalho.opcoes_pagamento

    expect(o.map((x) => x.tipo)).toEqual(['direto', 'outro', 'a_vista'])
    expect(o[0]).toMatchObject({ descontoPct: 5, ateAsChavesPct: 70, atoMinimoPct: 10 })
    expect(o[1]).toMatchObject({ descontoPct: 7, ateAsChavesPct: 100 })
    expect(o[2]).toMatchObject({ descontoPct: 10 })
  })

  it('não confunde a fatia do reforço com o total até as chaves', () => {
    // A condição 3 diz "20% em reforços até as chaves" e quita 100% antes da
    // entrega. Ler o 20 como total é afirmar uma condição que não existe.
    const c3 = parsearTabelaEraldo(RODAPE).cabecalho.opcoes_pagamento[1]
    expect(c3.ateAsChavesPct).toBe(100)
  })

  it('para nas observações de obra, que não são condição de pagamento', () => {
    for (const o of parsearTabelaEraldo(RODAPE).cabecalho.opcoes_pagamento) {
      expect(o.descricao).not.toMatch(/ATEN[ÇC][ÃA]O|corrigidos mensalmente|pé direito/i)
    }
  })

  it('guarda o pé-direito dos "Diferenciados", que o corretor quer em destaque', () => {
    expect(parsearTabelaEraldo(RODAPE).cabecalho.pe_direito).toBe('4,70m')
  })

  it('pega o desconto à vista solto na lista de observações', () => {
    // Gran Palazzo, Horizon e L'Essence não têm lista de condições.
    const semLista = `${ARBOR}5- 10% de desconto para pagamento á vista;\n`
    const o = parsearTabelaEraldo(semLista).cabecalho.opcoes_pagamento

    expect(o).toHaveLength(1)
    expect(o[0]).toMatchObject({ tipo: 'a_vista', descontoPct: 10 })
  })

  it('não oferece a condição das salas comerciais como se fosse dos apartamentos', () => {
    // O rodapé dos apartamentos do Symphony é seguido da tabela das salas,
    // com estrutura e condição próprias (20/40/40 em 24x).
    const comSalas = `${ARBOR}Condição 3 - 10% de desconto
- Pagamento à vista.
PRIVAT. TOTAL 20% 40% 40%
Sala C. 02 117,34 159,00 159,00 318,00 R$ 992.678,89 R$ 198.535,78 R$ 198.535,78 R$ 16.544,65
Condição 1 - 20% entrada, 40% em reforços anuais e 40% em 24 parcelas mensais.
`
    const o = parsearTabelaEraldo(comSalas).cabecalho.opcoes_pagamento

    expect(o).toHaveLength(1)
    expect(o[0].descricao).toContain('Condição 3')
    expect(o.some((x) => /24 parcelas/.test(x.descricao))).toBe(false)
  })
})

describe('percentuais do cabeçalho', () => {
  it('ignora a condição comercial do rodapé que também fecha em 100%', () => {
    // A condição 4 do Aura é "10% de entrada, 10% em 3 reforços anuais, 20% em
    // parcelas mensais e 60% após a entrega das chaves". Procurando no
    // documento inteiro, essa janela de quatro vencia a estrutura de três da
    // tabela e as 29 unidades voltavam rejeitadas por número de colunas.
    const comRodape = `${ARBOR}-> 10% de entrada, 10% em 3 reforços anuais, 20% em parcelas mensais até o fim da obra e 60% após a entrega das chaves em até 180 parcelas.\n`
    const r = parsearTabelaEraldo(comRodape)

    expect(r.cabecalho.percentuais).toEqual([0.2, 0.2, 0.6])
    expect(r.rejeitadas).toEqual([])
    expect(r.unidades).toHaveLength(2)
  })
})
