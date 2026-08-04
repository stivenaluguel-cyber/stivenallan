// Classifica a política de financiamento REAL de um empreendimento a partir do
// texto das condições comerciais já cadastradas em @/data/eraldo/* — nunca por
// suposição. Achado da revisão independente (P1-6): o template descrevia TODO
// empreendimento como "sem intermediação bancária", mas Gran Palazzo e Play
// Residence exigem financiamento bancário na tabela vigente — uma contradição
// direta com o card de condições comerciais exibido na mesma página.
//
// Heurística: cada `condicoes[].texto` é uma frase única (não itens
// estruturados), então a classificação lê o texto em si.
// - Nenhuma condição menciona banco → 'direto'.
// - Alguma condição menciona banco, mas SEMPRE ao lado de "ou" (oferecendo uma
//   alternativa não-bancária na mesma frase, ex.: "direto com a construtora OU
//   financiamento bancário") → 'hibrido'.
// - Alguma condição menciona banco sem "ou" (nenhuma alternativa oferecida
//   naquela frase) → 'bancario'.
// - Sem política cadastrada (ou sem nenhuma condição) → 'nao_informado'.
// Validado manualmente contra os 8 empreendimentos Eraldo cadastrados em
// @/data/eraldo/* antes de virar código (ver politica-financiamento.test.ts).
import type { PoliticaComercial } from '@/data/eraldo/types'

export type PoliticaFinanciamento = 'direto' | 'bancario' | 'hibrido' | 'nao_informado'

const RE_BANCO = /\bbanc\w*/i
const RE_OFERECE_ALTERNATIVA = /\bou\b/i

export function classificarPoliticaFinanciamento(
  politica: PoliticaComercial | null | undefined,
): PoliticaFinanciamento {
  if (!politica || politica.condicoes.length === 0) return 'nao_informado'

  let mencionaBanco = false
  let existeCondicaoSoBancaria = false

  for (const { texto } of politica.condicoes) {
    if (RE_BANCO.test(texto)) {
      mencionaBanco = true
      if (!RE_OFERECE_ALTERNATIVA.test(texto)) existeCondicaoSoBancaria = true
    }
  }

  if (!mencionaBanco) return 'direto'
  return existeCondicaoSoBancaria ? 'bancario' : 'hibrido'
}

// Copy institucional por classificação — nunca contradiz o card de condições
// comerciais exibido logo abaixo na mesma seção. Texto genérico sugerido pela
// revisão para o caso 'nao_informado', adaptado por classificação.
export const TITULO_FINANCIAMENTO: Record<PoliticaFinanciamento, string> = {
  direto: 'Financiamento direto',
  bancario: 'Como funciona o pagamento',
  hibrido: 'Financiamento direto ou bancário',
  nao_informado: 'Condições de pagamento',
}

export const TEXTO_FINANCIAMENTO: Record<PoliticaFinanciamento, string> = {
  direto: 'Negociado diretamente com a Eraldo Construções, sem intermediação bancária.',
  bancario: 'Pagamento via entrada e financiamento bancário, com o suporte da Eraldo Construções durante todo o processo.',
  hibrido: 'Condições de pagamento negociadas com a Eraldo Construções, incluindo financiamento direto e, à sua escolha, financiamento bancário.',
  nao_informado: 'Condições de pagamento negociadas conforme a política comercial da Eraldo Construções, incluindo modalidades de financiamento direto e, em alguns empreendimentos, financiamento bancário. Fale com Stiven para a tabela atualizada.',
}
