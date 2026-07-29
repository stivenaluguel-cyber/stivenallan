// Derivação de comodidades a partir do texto que já existe.
//
// A migration 20260728193314 criou `properties.comodidades` (vocabulário
// controlado, com índice GIN) e os filtros já sabem consultar — mas as 36
// linhas nasceram com array vazio, então todo filtro devolve zero resultado.
//
// O dado, porém, JÁ está no banco: `lazer` e `diferenciais` são arrays de
// texto livre escritos para leitura humana ("Piscina adulto com wet bar",
// "Sacada com churrasqueira a carvão e guarda-corpo em vidro"). Este módulo
// traduz esse texto para o vocabulário controlado.
//
// Três decisões que evitam encher o catálogo de mentira:
//
// 1. Os DOIS campos são varridos juntos. Em `Villammare` o cadastro colocou
//    "Sacada com churrasqueira a carvao" dentro de `lazer`, e em `Parco
//    Savello` dentro de `diferenciais`. Olhar só um dos dois perderia metade.
// 2. Churrasqueira a carvão e ponto de churrasqueira são EXCLUDENTES, e a
//    carvão vence: quem tem churrasqueira de verdade não deve aparecer como
//    "só o ponto".
// 3. Nada é inferido de ausência. Texto que não casa com nenhum padrão não
//    gera comodidade — melhor um imóvel de fora do filtro do que um imóvel
//    prometendo piscina que não tem.

import type { Comodidade } from './filtros'

function normalizar(s: string): string {
  return (s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

// Padrões por comodidade. Deliberadamente conservadores.
const PADROES: { comodidade: Comodidade; teste: RegExp }[] = [
  // "Fitness" e "Espaço fitness com terraço" são academia; "circuito ao ar
  // livre" NÃO é — é uma pista de caminhada.
  { comodidade: 'academia', teste: /\bacademia\b|\bfitness\b/ },

  // "2 elevadores", "3 elevadores (com elevador de serviço)".
  { comodidade: 'elevador', teste: /\belevador(es)?\b/ },

  // Piscina, splash, spa aquecido — todos são lâmina d'água de lazer.
  // "wet bar" sozinho não conta (é o bar da borda, não a piscina).
  { comodidade: 'piscina', teste: /\bpiscina|\bsplash\b|\bspa\b/ },

  { comodidade: 'playground', teste: /\bplayground\b|\bbrinquedoteca\b/ },

  { comodidade: 'salao_festas', teste: /sal[ao]o de festas/ },
]

// Churrasqueira tem tratamento próprio por causa da exclusividade.
const CHURRASQUEIRA_CARVAO = /churrasqueira a carv[ao]o|churrasqueira com exaust[ao]o|espa[cç]o fogo|fogo de ch[ao]o|qui[oó]sque com fogo/
const CHURRASQUEIRA_PONTO = /espera para (a )?churrasqueira|ponto (de|para) churrasqueira|churrasqueira/

export type FonteComodidades = {
  lazer?: string[] | null
  diferenciais?: string[] | null
}

/**
 * Traduz o texto livre em comodidades do vocabulário controlado.
 * Devolve ordenado, sem repetição.
 */
export function derivarComodidades(fonte: FonteComodidades): Comodidade[] {
  // Um blob só: a mesma comodidade pode estar descrita em qualquer um dos
  // dois campos, e o cadastro não é consistente sobre onde põe o quê.
  const texto = normalizar([...(fonte.lazer ?? []), ...(fonte.diferenciais ?? [])].join(' · '))
  if (!texto.trim()) return []

  const achadas = new Set<Comodidade>()
  for (const { comodidade, teste } of PADROES) {
    if (teste.test(texto)) achadas.add(comodidade)
  }

  // Excludentes: a carvão vence o ponto.
  if (CHURRASQUEIRA_CARVAO.test(texto)) achadas.add('churrasqueira_carvao')
  else if (CHURRASQUEIRA_PONTO.test(texto)) achadas.add('churrasqueira_ponto')

  return [...achadas].sort()
}

export type PropostaFiltros = {
  comodidades: Comodidade[]
  // `parcelamento_construtora` só é marcado com evidência textual explícita.
  // Assumir "é Fontana, logo tem financiamento direto" transformaria uma
  // suposição comercial em filtro do site — e o site é público.
  parcelamento_construtora: boolean | null
  evidenciaParcelamento: string | null
}

const PARCELAMENTO_DIRETO = /financiamento direto|direto com a construtora|parcelamento direto|direto com a incorporadora|sem banco|sem financiamento banc[ao]rio/

/**
 * Proposta de preenchimento para UM imóvel. Nada é gravado aqui — a rota
 * mostra o resultado para revisão antes de aplicar.
 *
 * `parcelamento_construtora` volta `null` (= não sei, não mexer) quando não há
 * frase que comprove. Marcar `false` seria afirmar que NÃO tem, o que também
 * é uma afirmação sem base.
 */
export function proporFiltros(fonte: FonteComodidades): PropostaFiltros {
  const textoBruto = [...(fonte.lazer ?? []), ...(fonte.diferenciais ?? [])]
  const texto = normalizar(textoBruto.join(' · '))

  const trecho = textoBruto.find((t) => PARCELAMENTO_DIRETO.test(normalizar(t)))

  return {
    comodidades: derivarComodidades(fonte),
    parcelamento_construtora: PARCELAMENTO_DIRETO.test(texto) ? true : null,
    evidenciaParcelamento: trecho ?? null,
  }
}
