import { describe, it, expect } from 'vitest'
import { chunk, classificacaoPorScore, montarPromptIcp, montarPromptScoring, parseIcp, parseScoring, scoreFinal } from './prompts'
import type { PlaceCandidato } from './google-places'

const candidato = (over: Partial<PlaceCandidato> = {}): PlaceCandidato => ({
  placeId: 'place-1',
  nome: 'Transportes Natal',
  endereco: 'Av. Luiz Lazzarin, 260 - Criciúma - SC',
  telefone: '(48) 3431-0600',
  site: 'https://transnatal.com.br',
  rating: 4.5,
  ratingCount: 37,
  tipos: ['moving_company'],
  ...over,
})

describe('montarPromptIcp', () => {
  it('leva as respostas do formulário pro prompt', () => {
    const p = montarPromptIcp({
      produto: 'Apartamento na planta como investimento',
      publico: 'Donos de empresas de médio porte',
      problema: 'Proteger capital em ativo real',
      localizacao: 'Criciúma, SC',
      exemplos: 'Empresa X, Empresa Y',
    })
    expect(p).toContain('Apartamento na planta como investimento')
    expect(p).toContain('Donos de empresas de médio porte')
    expect(p).toContain('Proteger capital em ativo real')
    expect(p).toContain('Criciúma, SC')
    expect(p).toContain('Empresa X, Empresa Y')
  })

  it('não inventa dado quando campo opcional está vazio', () => {
    const p = montarPromptIcp({ produto: 'Apartamento na planta' })
    expect(p).toContain('não informado')
    expect(p).toContain('Brasil inteiro')
    expect(p).toContain('nenhum exemplo informado')
  })

  it('pede JSON estrito no formato esperado pelo parser', () => {
    const p = montarPromptIcp({ produto: 'x' })
    expect(p).toContain('"nomeCampanha"')
    expect(p).toContain('"queries"')
    expect(p).toContain('SOMENTE um JSON válido')
  })
})

const icpJson = JSON.stringify({
  nomeCampanha: 'Investidores PJ Criciúma',
  alvo: 'Donos de empresas de médio porte em Criciúma',
  abordagem: 'Consultiva, focada em segurança do ativo',
  estrategia: 'Aproveitar a solidez das empresas locais',
  criterios: ['CNPJ com mais de 10 anos', 'Porte médio'],
  queries: ['transportadoras em Criciúma SC', 'metalúrgicas em Criciúma SC'],
})

describe('parseIcp', () => {
  it('interpreta um JSON bem formado', () => {
    const icp = parseIcp(icpJson)
    expect(icp).toEqual({
      nomeCampanha: 'Investidores PJ Criciúma',
      alvo: 'Donos de empresas de médio porte em Criciúma',
      abordagem: 'Consultiva, focada em segurança do ativo',
      estrategia: 'Aproveitar a solidez das empresas locais',
      criterios: ['CNPJ com mais de 10 anos', 'Porte médio'],
      queries: ['transportadoras em Criciúma SC', 'metalúrgicas em Criciúma SC'],
    })
  })

  it('tira a cerca de markdown que a IA às vezes adiciona apesar da instrução', () => {
    const icp = parseIcp('```json\n' + icpJson + '\n```')
    expect(icp?.nomeCampanha).toBe('Investidores PJ Criciúma')
  })

  it('corta em 4 queries mesmo se a IA devolver mais', () => {
    const bruto = JSON.stringify({ ...JSON.parse(icpJson), queries: ['a', 'b', 'c', 'd', 'e', 'f'] })
    const icp = parseIcp(bruto)
    expect(icp?.queries).toHaveLength(4)
  })

  it('devolve null (nunca lança) para JSON quebrado', () => {
    expect(parseIcp('não é json')).toBeNull()
    expect(parseIcp('')).toBeNull()
    expect(parseIcp('{"alvo": "x"')).toBeNull()
  })

  it('devolve null quando falta nomeCampanha, alvo ou queries', () => {
    expect(parseIcp(JSON.stringify({ alvo: 'x', queries: ['a'] }))).toBeNull()
    expect(parseIcp(JSON.stringify({ nomeCampanha: 'x', queries: ['a'] }))).toBeNull()
    expect(parseIcp(JSON.stringify({ nomeCampanha: 'x', alvo: 'y', queries: [] }))).toBeNull()
  })

  it('descarta item não-string dentro de criterios/queries em vez de quebrar', () => {
    const bruto = JSON.stringify({
      nomeCampanha: 'x',
      alvo: 'y',
      criterios: ['ok', 123, null],
      queries: ['ok', {}],
    })
    const icp = parseIcp(bruto)
    expect(icp?.criterios).toEqual(['ok'])
    expect(icp?.queries).toEqual(['ok'])
  })
})

describe('chunk', () => {
  it('divide em pedaços do tamanho pedido, preservando a ordem', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
  })

  it('array menor que o tamanho do lote vira um pedaço só', () => {
    expect(chunk([1, 2], 20)).toEqual([[1, 2]])
  })

  it('array vazio devolve lista de pedaços vazia', () => {
    expect(chunk([], 20)).toEqual([])
  })

  it('60 candidatos em lotes de 20 viram exatamente 3 pedaços — o caso real que estourava o limite de tokens', () => {
    const candidatos = Array.from({ length: 60 }, (_, i) => i)
    const pedacos = chunk(candidatos, 20)
    expect(pedacos).toHaveLength(3)
    expect(pedacos.every((p) => p.length === 20)).toBe(true)
  })

  it('tamanho <= 0 devolve o array inteiro como pedaço único, sem loop infinito', () => {
    expect(chunk([1, 2, 3], 0)).toEqual([[1, 2, 3]])
    expect(chunk([1, 2, 3], -5)).toEqual([[1, 2, 3]])
  })
})

describe('montarPromptScoring', () => {
  it('numera os candidatos e leva os dados reais pro prompt, sem inventar', () => {
    const p = montarPromptScoring({
      produto: 'Apartamento na planta',
      alvo: 'Donos de empresa de médio porte',
      criterios: ['Porte médio'],
      candidatos: [candidato(), candidato({ placeId: 'place-2', nome: 'Metal Aguiar', telefone: null, site: null })],
    })
    expect(p).toContain('place-1')
    expect(p).toContain('Transportes Natal')
    expect(p).toContain('place-2')
    expect(p).toContain('Metal Aguiar')
    expect(p).toContain('tem telefone=não')
  })

  it('pede JSON array no formato esperado pelo parser', () => {
    const p = montarPromptScoring({ produto: 'x', alvo: 'y', criterios: [], candidatos: [candidato()] })
    expect(p).toContain('"scoreFit"')
    expect(p).toContain('"scorePotencial"')
    expect(p).toContain('"scoreAcessibilidade"')
    expect(p).toContain('mesma ordem')
  })
})

describe('parseScoring', () => {
  const candidatos = [candidato({ placeId: 'place-1' }), candidato({ placeId: 'place-2', nome: 'Metal Aguiar' })]

  it('interpreta um array bem formado', () => {
    const bruto = JSON.stringify([
      { id: 'place-1', scoreFit: 98, scorePotencial: 97, scoreAcessibilidade: 90, contexto: 'Bate em cheio com o ICP.' },
      { id: 'place-2', scoreFit: 70, scorePotencial: 60, scoreAcessibilidade: 80, contexto: 'Fit parcial.' },
    ])
    expect(parseScoring(bruto, candidatos)).toEqual([
      { placeId: 'place-1', scoreFit: 98, scorePotencial: 97, scoreAcessibilidade: 90, contexto: 'Bate em cheio com o ICP.' },
      { placeId: 'place-2', scoreFit: 70, scorePotencial: 60, scoreAcessibilidade: 80, contexto: 'Fit parcial.' },
    ])
  })

  it('ignora id que não corresponde a nenhum candidato enviado — não confia cegamente na IA', () => {
    const bruto = JSON.stringify([{ id: 'place-inventado', scoreFit: 99, scorePotencial: 99, scoreAcessibilidade: 99, contexto: 'x' }])
    expect(parseScoring(bruto, candidatos)).toEqual([])
  })

  it('fica só com a primeira ocorrência quando o mesmo id vem repetido', () => {
    const bruto = JSON.stringify([
      { id: 'place-1', scoreFit: 10, scorePotencial: 10, scoreAcessibilidade: 10, contexto: 'primeira' },
      { id: 'place-1', scoreFit: 90, scorePotencial: 90, scoreAcessibilidade: 90, contexto: 'segunda' },
    ])
    const r = parseScoring(bruto, candidatos)
    expect(r).toHaveLength(1)
    expect(r[0].contexto).toBe('primeira')
  })

  it('um candidato faltando no array não derruba os outros — melhor parcial que nada', () => {
    const bruto = JSON.stringify([{ id: 'place-1', scoreFit: 80, scorePotencial: 80, scoreAcessibilidade: 80, contexto: 'ok' }])
    const r = parseScoring(bruto, candidatos)
    expect(r).toHaveLength(1)
    expect(r[0].placeId).toBe('place-1')
  })

  it('trava as notas em 0-100 mesmo se a IA devolver fora da faixa', () => {
    const bruto = JSON.stringify([{ id: 'place-1', scoreFit: 150, scorePotencial: -20, scoreAcessibilidade: 50.7, contexto: 'x' }])
    const r = parseScoring(bruto, candidatos)
    expect(r[0]).toMatchObject({ scoreFit: 100, scorePotencial: 0, scoreAcessibilidade: 51 })
  })

  it('devolve array vazio (nunca lança) para JSON quebrado ou formato errado', () => {
    expect(parseScoring('não é json', candidatos)).toEqual([])
    expect(parseScoring('{"nao": "e array"}', candidatos)).toEqual([])
    expect(parseScoring('', candidatos)).toEqual([])
  })
})

describe('scoreFinal', () => {
  it('é a média das três notas, arredondada', () => {
    expect(scoreFinal({ scoreFit: 98, scorePotencial: 97, scoreAcessibilidade: 90 })).toBe(95)
    expect(scoreFinal({ scoreFit: 0, scorePotencial: 0, scoreAcessibilidade: 1 })).toBe(0)
  })
})

describe('classificacaoPorScore', () => {
  it('segue os limiares nas fronteiras exatas', () => {
    expect(classificacaoPorScore(90)).toBe('EXCELENTE')
    expect(classificacaoPorScore(89)).toBe('MUITO FORTE')
    expect(classificacaoPorScore(80)).toBe('MUITO FORTE')
    expect(classificacaoPorScore(79)).toBe('FORTE')
    expect(classificacaoPorScore(70)).toBe('FORTE')
    expect(classificacaoPorScore(69)).toBe('BOM')
    expect(classificacaoPorScore(55)).toBe('BOM')
    expect(classificacaoPorScore(54)).toBe('FRACO')
    expect(classificacaoPorScore(0)).toBe('FRACO')
  })
})
