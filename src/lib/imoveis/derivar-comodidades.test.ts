import { describe, it, expect } from 'vitest'
import { derivarComodidades, proporFiltros } from './derivar-comodidades'
import { COMODIDADES } from './filtros'

// Todos os textos abaixo são CÓPIAS LITERAIS de produção (colunas `lazer` e
// `diferenciais` de properties), não exemplos inventados. É o que garante que
// a derivação funciona no dado real e não só no dado bonito.

const MAR_DI_ARIENZO_LAZER = [
  'Piscina adulto e infantil', 'Terraço', 'Academia', 'Salão de Festas', 'Playground',
  'Brinquedoteca', 'Hall com pé direito duplo', 'Acesso digital com reconhecimento facial',
  'Câmeras 24h', 'Gerador para áreas comuns', 'Espera para carregador elétrico',
  'Acesso para banhistas', 'Porte-Cochère', '2 Elevadores',
]
const MAR_DI_ARIENZO_DIF = [
  'Sacada com guarda-corpo em vidro e churrasqueira com exaustão',
  'Persianas automatizadas e fechadura digital',
]

const AGUAS_DE_MARANO_LAZER = [
  'Piscina adulto com wet bar', 'Splash infantil', 'Spa aquecido', 'Salão de festas',
  'Espaço fogo / terraço', 'Sala de jogos com gourmet', 'Fitness', 'Garden lounge',
  'Espaço teen', 'Pet place', 'Acesso à praia', 'Gerador', 'Câmeras 24h',
]

const CAMPOS_DA_MONTANHA_LAZER = [
  'Spa com Sauna', 'Quiosque com Fogo de Chão', 'Espaço Fogo', 'Salão de Festas',
  'Sala de Jogos', 'Playground', 'Brinquedoteca', 'Quadra Poliesportiva',
  'Quadra de Tînis', 'Pórtico de Entrada monumental', 'Fazendinha', 'Pomar',
]

const MONTE_LEONE_LAZER = [
  'Piscina climatizada (adulto e infantil)', 'Salão de festas', 'Sala de jogos',
  'Espaço gourmet com churrasqueira', 'Academia interna', 'Circuito ao ar livre',
  'Brinquedoteca', 'Playground', 'Terraço externo',
  '3 elevadores (com elevador de serviço exclusivo)',
]

// Aqui o cadastro colocou a churrasqueira dentro de `lazer`, não de
// `diferenciais` — o caso que obriga a varrer os dois campos juntos.
const VILLAMMARE_LAZER = [
  'Salao de festas com living integrado',
  'Sacada com churrasqueira a carvao e guarda-corpo em vidro',
  '2 elevadores', 'Hall de entrada sofisticado', 'Fechadura digital',
]
const VILLAMMARE_DIF = [
  '4 dormitorios - 2 suites e 2 demi suites de alto padrao',
  'Construtora Fontana - solidez e qualidade comprovadas',
  'Financiamento direto com a Construtora Fontana',
]

const VILLAGGIO_DIF = [
  'Terrenos de 794 a 1.038 m² — espaço real para sua casa ideal',
  'Condomínio fechado com segurança e portaria 24h',
  'Campo de golfe e campo de futebol no próprio condomínio',
  'Financiamento direto com a Construtora Fontana',
]

describe('derivarComodidades — contra o texto REAL de produção', () => {
  it('Mar di Arienzo: piscina, academia, salão, playground, elevador e churrasqueira', () => {
    const c = derivarComodidades({ lazer: MAR_DI_ARIENZO_LAZER, diferenciais: MAR_DI_ARIENZO_DIF })
    expect(c).toEqual([
      'academia', 'churrasqueira_carvao', 'elevador', 'piscina', 'playground', 'salao_festas',
    ])
  })

  it('Águas de Marano: "Fitness" conta como academia e "Splash"/"Spa" como piscina', () => {
    const c = derivarComodidades({ lazer: AGUAS_DE_MARANO_LAZER })
    expect(c).toContain('academia')
    expect(c).toContain('piscina')
    // Não tem elevador nem playground listados — não pode inventar.
    expect(c).not.toContain('elevador')
    expect(c).not.toContain('playground')
  })

  it('Campos da Montanha (loteamento): "Spa com Sauna" e fogo de chão, sem elevador', () => {
    const c = derivarComodidades({ lazer: CAMPOS_DA_MONTANHA_LAZER })
    expect(c).toContain('piscina') // spa
    expect(c).toContain('churrasqueira_carvao') // fogo de chão / espaço fogo
    expect(c).toContain('playground')
    expect(c).not.toContain('elevador')
    expect(c).not.toContain('academia')
  })

  it('Monte Leone: "Circuito ao ar livre" NÃO é academia, mas "Academia interna" é', () => {
    const c = derivarComodidades({ lazer: MONTE_LEONE_LAZER })
    expect(c).toContain('academia')
    expect(c).toContain('elevador')
    expect(c).toContain('piscina')
  })

  it('Villammare: acha a churrasqueira mesmo estando no campo `lazer`', () => {
    const c = derivarComodidades({ lazer: VILLAMMARE_LAZER, diferenciais: VILLAMMARE_DIF })
    expect(c).toContain('churrasqueira_carvao')
    expect(c).toContain('elevador')
    expect(c).toContain('salao_festas')
    // Sem piscina no texto — e a maioria dos filtros começa por piscina.
    expect(c).not.toContain('piscina')
  })
})

describe('derivarComodidades — o que NÃO deve virar comodidade', () => {
  it('imóvel sem texto nenhum devolve lista vazia', () => {
    expect(derivarComodidades({})).toEqual([])
    expect(derivarComodidades({ lazer: [], diferenciais: [] })).toEqual([])
    expect(derivarComodidades({ lazer: null, diferenciais: null })).toEqual([])
  })

  it('"wet bar" sozinho não é piscina', () => {
    expect(derivarComodidades({ lazer: ['Wet bar no terraço'] })).toEqual([])
  })

  it('texto decorativo não gera nada', () => {
    const c = derivarComodidades({
      lazer: ['Hall com pé direito duplo', 'Câmeras 24h', 'Gerador', 'Pet place', 'Bicicletário'],
    })
    expect(c).toEqual([])
  })

  it('nunca devolve valor fora do vocabulário controlado', () => {
    const validos = new Set(COMODIDADES.map((c) => c.valor))
    const todos = [
      ...MAR_DI_ARIENZO_LAZER, ...MAR_DI_ARIENZO_DIF, ...AGUAS_DE_MARANO_LAZER,
      ...CAMPOS_DA_MONTANHA_LAZER, ...MONTE_LEONE_LAZER, ...VILLAMMARE_LAZER, ...VILLAGGIO_DIF,
    ]
    for (const c of derivarComodidades({ lazer: todos })) {
      expect(validos.has(c), `valor inválido: ${c}`).toBe(true)
    }
  })

  it('não repete comodidade mencionada várias vezes', () => {
    const c = derivarComodidades({ lazer: ['Piscina adulto', 'Piscina infantil', 'Piscina aquecida'] })
    expect(c).toEqual(['piscina'])
  })
})

describe('derivarComodidades — churrasqueira é excludente', () => {
  it('a carvão vence o simples "ponto de churrasqueira"', () => {
    const c = derivarComodidades({
      lazer: ['Espera para churrasqueira', 'Sacada com churrasqueira a carvão'],
    })
    expect(c).toContain('churrasqueira_carvao')
    expect(c).not.toContain('churrasqueira_ponto')
  })

  it('só o ponto, sem carvão, fica como ponto', () => {
    expect(derivarComodidades({ lazer: ['Espera para churrasqueira na sacada'] }))
      .toEqual(['churrasqueira_ponto'])
  })

  it('churrasqueira com exaustão conta como a carvão', () => {
    expect(derivarComodidades({ diferenciais: ['Churrasqueira com exaustão'] }))
      .toEqual(['churrasqueira_carvao'])
  })
})

describe('proporFiltros — parcelamento só com evidência', () => {
  it('marca true e guarda a frase que provou', () => {
    const p = proporFiltros({ diferenciais: VILLAGGIO_DIF })
    expect(p.parcelamento_construtora).toBe(true)
    expect(p.evidenciaParcelamento).toBe('Financiamento direto com a Construtora Fontana')
  })

  it('sem frase que comprove volta null (não sei), nunca false', () => {
    const p = proporFiltros({ lazer: MAR_DI_ARIENZO_LAZER, diferenciais: MAR_DI_ARIENZO_DIF })
    // Ser da Fontana NÃO é evidência de financiamento direto neste imóvel.
    expect(p.parcelamento_construtora).toBeNull()
    expect(p.evidenciaParcelamento).toBeNull()
  })

  it('"solidez da Construtora Fontana" não é evidência de parcelamento', () => {
    const p = proporFiltros({ diferenciais: ['Construtora Fontana - solidez e qualidade comprovadas'] })
    expect(p.parcelamento_construtora).toBeNull()
  })

  it('devolve as comodidades junto, para revisar tudo de uma vez', () => {
    const p = proporFiltros({ lazer: VILLAMMARE_LAZER, diferenciais: VILLAMMARE_DIF })
    expect(p.comodidades.length).toBeGreaterThan(0)
    expect(p.parcelamento_construtora).toBe(true)
  })
})
