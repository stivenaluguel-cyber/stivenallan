// Classificação da política de financiamento REAL de cada empreendimento
// Fontana — mesmo sistema de 4 categorias de @/lib/eraldo-politica-financiamento,
// aplicado aqui porque a Fontana não tem um campo estruturado equivalente a
// `politicaComercial.condicoes[]`: o texto comercial vive solto, escrito à mão,
// dentro do JSX de cada página em @/app/empreendimento/fontana/*/page.tsx.
//
// Cada entrada abaixo foi classificada lendo o texto REAL já publicado na
// própria página do empreendimento (auditoria de 2026-08-04, ver trecho citado
// em cada comentário) — nunca por suposição. Mesma heurística da Eraldo:
// - menciona banco só ao lado de "ou" (alternativa oferecida) → 'hibrido'
// - menciona banco sem alternativa na mesma frase → 'bancario'
// - texto comercial real, sem menção a banco → 'direto'
// - só FAQ genérica ("fale com um corretor") ou sem texto comercial algum,
//   sem uma frase que realmente descreva a condição desta unidade → 'nao_informado'
//   (a mesma FAQ "Posso usar financiamento bancário ou FGTS?" aparece copiada
//   em várias páginas sem revelar a política real — não é evidência de nada,
//   só uma resposta de FAQ que empurra pro corretor).
//
// Revisar esta lista sempre que o texto comercial de uma página Fontana mudar.
import type { PoliticaFinanciamento } from './eraldo-politica-financiamento'

export const FONTANA_POLITICA_FINANCIAMENTO: Record<string, PoliticaFinanciamento> = {
  // — direto (texto comercial real, sem menção a banco) —
  'bosco-del-montello-centro-criciuma-sc': 'direto', // "Financiamento direto com a construtora, sem banco."
  'fidenza-residencial-cruzeiro-do-sul-criciuma-sc': 'direto', // "direto com a Fontana... sem depender de banco."
  'lavis-residencial-centro-criciuma-sc': 'direto', // "...somam 100% do valor da unidade, sem necessidade de banco."
  'mar-di-licata-mar-grosso-laguna-sc': 'direto', // "...defina uma proposta sob medida, sem amarras bancárias."
  'mar-di-nizza-mar-grosso-laguna-sc': 'direto', // entrada 20% + 6 reforços + 72 parcelas, "Financiamento direto Fontana", sem banco
  'mar-positano-centro-balneario-rincao-sc': 'direto', // mesma estrutura do Mar di Nizza, sem banco
  'monte-leone-centro-criciuma-sc': 'direto', // "...direto com a construtora — sem necessidade de banco."
  'tremezzo-residencial-centro-criciuma-sc': 'direto', // "Financiamento direto com a construtora, sem banco."
  'villaggio-verde-residenziale-grande-prospera-criciuma-sc': 'direto', // "negociadas diretamente" com a Fontana, sem banco

  // — híbrido (banco OU direto, oferecidos como alternativa na mesma frase) —
  'avezzano-centro-sideropolis-sc': 'hibrido', // "financiamento bancário, ou parcelamento direto com a construtora"
  'bellante-comerciario-criciuma-sc': 'hibrido', // "financiamento bancário ou ... diretamente com a construtora"
  'calalzo-di-cadore-michel-criciuma-sc': 'hibrido', // "via financiamento bancário ou parcelado diretamente com a construtora"
  'mar-di-arienzo-centro-balneario-rincao-sc': 'hibrido', // "financiado — bancário ou direto com a construtora"
  'parco-savello-santa-barbara-criciuma-sc': 'hibrido', // "quitável via financiamento bancário ou diretamente com a construtora"
  'thiene-centro-criciuma-sc': 'hibrido', // mesmo texto do Parco Savello

  // — não informado (sem tabela/condição real publicada nesta página) —
  'aguas-de-marano-frente-mar-balneario-picarras-sc': 'nao_informado', // "condições comerciais ficam pendentes" (tabela removida do Drive)
  'calliano-centro-criciuma-sc': 'nao_informado', // "condições variam conforme unidade e modalidade" — sem estrutura real
  'campos-da-montanha-bom-jardim-da-serra-sc': 'nao_informado', // só a FAQ genérica de banco/FGTS
  'castellano-centro-icara-sc': 'nao_informado', // só a FAQ genérica de banco/FGTS
  'due-fratelli-centro-criciuma-sc': 'nao_informado', // só a FAQ genérica de banco/FGTS
  'mar-di-atrani-centro-balneario-rincao-sc': 'nao_informado', // só a FAQ genérica de banco/FGTS
  'pavia-rio-maina-criciuma-sc': 'nao_informado', // só a FAQ genérica de banco/FGTS
  'pianezze-centro-icara-sc': 'nao_informado', // só a FAQ genérica de banco/FGTS
  'piazza-castello-centro-icara-sc': 'nao_informado', // só a FAQ genérica de banco/FGTS
  'pineto-centro-criciuma-sc': 'nao_informado', // só a FAQ genérica de banco/FGTS
  'rocca-pietore-centro-sideropolis-sc': 'nao_informado', // só a FAQ genérica de banco/FGTS
  'villammare-residencial-balneario-rincao-sc': 'nao_informado', // só a FAQ genérica de banco/FGTS
}

/** Slug sem entrada cadastrada (empreendimento novo, ainda não auditado) também
 * cai em 'nao_informado' — nunca assume 'direto' por omissão. */
export function politicaFinanciamentoFontana(slug: string): PoliticaFinanciamento {
  return FONTANA_POLITICA_FINANCIAMENTO[slug] ?? 'nao_informado'
}

export const TITULO_FINANCIAMENTO_FONTANA: Record<PoliticaFinanciamento, string> = {
  direto: 'Financiamento direto',
  bancario: 'Como funciona o pagamento',
  hibrido: 'Financiamento direto ou bancário',
  nao_informado: 'Condições sob consulta',
}
