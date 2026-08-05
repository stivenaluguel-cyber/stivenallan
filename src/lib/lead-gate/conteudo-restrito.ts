import 'server-only'

// Conteúdo que só é entregue depois de validar a sessão.
//
// POR QUE ESTE ARQUIVO EXISTE — e por que `server-only`:
//
// A tentativa natural é envolver o bloco em <GatedContent> e passar o conteúdo
// como children. Isso NÃO protege nada. GatedContent é Client Component, então
// o Next serializa os children no payload RSC embutido no HTML — mesmo quando o
// componente decide não renderizá-los. Medido na QA: o HTML servido a um
// visitante sem cookie continha as 7 URLs de planta dentro de
// `\"galeria\":[{\"src\":\"https://estilofontana...\"}]`. Um `curl` bastava.
//
// Também não dá pra resolver lendo o cookie no servidor: `cookies()` em
// qualquer ponto da árvore tira a rota do cache estático, e as 36 páginas de
// empreendimento são `revalidate = 3600` de propósito.
//
// A saída que preserva ISR e protege de verdade: a página estática NUNCA
// contém o conteúdo restrito; ele é buscado depois, por uma rota que valida a
// sessão (/api/lead-gate/content). Este módulo é a fonte desses dados, marcado
// `server-only` para que um import acidental de client component quebre o build
// em vez de reintroduzir o vazamento em silêncio.
//
// LIMITAÇÃO CONHECIDA (documentada, não resolvida no piloto): as URLs das
// plantas apontam para estilofontana.com.br, um host público de terceiro. Quem
// já tiver a URL continua acessando sem sessão. O que este gate garante é que a
// URL não é DESCOBERTA pela nossa página sem cadastro. Proteção real do arquivo
// exigiria proxy autenticado ou URL assinada, o que depende de mover o material
// para storage próprio — fora do escopo do piloto.

import type { ItemGaleria, BlocoRestrito } from './conteudo-restrito-tipos'

export type { ItemGaleria, BlocoRestrito }

const IMG_BASE_PARCO = '/images/empreendimentos/parco-savello-santa-barbara-criciuma-sc'

// Fotos do Parco Savello que ficam ATRÁS do cadastro (as 4 primeiras da galeria
// seguem públicas — ver FOTOS_PUBLICAS na página).
const PARCO_FOTOS_RESTRITAS: ItemGaleria[] = [
  { src: `${IMG_BASE_PARCO}/torre.jpg`, alt: 'Parco Savello Residencial - torre', label: 'Torre' },
  { src: `${IMG_BASE_PARCO}/entorno.jpg`, alt: 'Parco Savello Residencial - entorno', label: 'Entorno' },
  { src: `${IMG_BASE_PARCO}/lazer.jpg`, alt: 'Parco Savello Residencial - lazer', label: 'Lazer' },
  { src: `${IMG_BASE_PARCO}/paisagismo.jpg`, alt: 'Parco Savello Residencial - paisagismo', label: 'Paisagismo' },
]

// Plantas oficiais — site estilofontana.com.br (aba "Plantas" do Parco Savello).
const PARCO_PLANTAS: ItemGaleria[] = [
  { categoria: 'tipo', src: 'https://estilofontana.com.br/images/empreendimento_planta/apartamento-tipo-final-01-1716385603.jpg', alt: 'Parco Savello Residencial — planta apartamento tipo final 01', label: 'Apartamento Tipo — Final 01', area: 93.31, quartos: 3, suites: 2 },
  { categoria: 'tipo', src: 'https://estilofontana.com.br/images/empreendimento_planta/apartamento-tipo-final-02-1716385722.jpg', alt: 'Parco Savello Residencial — planta apartamento tipo final 02', label: 'Apartamento Tipo — Final 02', area: 94.07, quartos: 3, suites: 2 },
  { categoria: 'tipo', src: 'https://estilofontana.com.br/images/empreendimento_planta/apartamento-tipo-final-03-1716385822.jpg', alt: 'Parco Savello Residencial — planta apartamento tipo final 03', label: 'Apartamento Tipo — Final 03', area: 93.31, quartos: 3, suites: 2 },
  { categoria: 'tipo', src: 'https://estilofontana.com.br/images/empreendimento_planta/apartamento-tipo-final-04-1716385893.jpg', alt: 'Parco Savello Residencial — planta apartamento tipo final 04', label: 'Apartamento Tipo — Final 04', area: 94.07, quartos: 3, suites: 2 },
  { categoria: 'comum', src: 'https://estilofontana.com.br/images/empreendimento_planta/Area-de-lazer-1716386105.jpg', alt: 'Parco Savello Residencial — área de lazer', label: 'Área de Lazer' },
  { categoria: 'comum', src: 'https://estilofontana.com.br/images/empreendimento_planta/terreo-1716386225.jpg', alt: 'Parco Savello Residencial — planta do térreo', label: 'Térreo' },
  { categoria: 'comum', src: 'https://estilofontana.com.br/images/empreendimento_planta/subsolo-1716386276.jpg', alt: 'Parco Savello Residencial — subsolo', label: 'Subsolo · Garagem' },
]

const REGISTRO: Record<string, Partial<Record<BlocoRestrito, ItemGaleria[]>>> = {
  'parco-savello-santa-barbara-criciuma-sc': {
    plantas: PARCO_PLANTAS,
    fotos: PARCO_FOTOS_RESTRITAS,
  },
}

export function getConteudoRestrito(slug: string, bloco: BlocoRestrito): ItemGaleria[] | null {
  return REGISTRO[slug]?.[bloco] ?? null
}

// Só as CONTAGENS podem atravessar para o lado público: é o que alimenta o
// teaser ("mais 4 imagens", "7 plantas oficiais") sem revelar nenhuma URL.
export function contarConteudoRestrito(slug: string, bloco: BlocoRestrito): number {
  return getConteudoRestrito(slug, bloco)?.length ?? 0
}
