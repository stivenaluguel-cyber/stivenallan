// ============================================================
// CONFIG CENTRAL DO CUB/SC  —  edite AQUI todo mês
// ------------------------------------------------------------
// O Sinduscon-SC publica o CUB até o dia 5 de cada mês.
// Atualize 'valor' e 'vigencia' abaixo e o site inteiro reflete.
// Fonte: https://sinduscon-fpolis.org.br/cub  (Sinduscon-SC)
// ============================================================

export interface CubConfig {
  /** Valor do CUB/SC em R$ por m² (padrão R-8-N, residencial). */
  valor: number
  /** Mês/ano de vigência, ex.: 'junho/2026'. */
  vigencia: string
  /** Fonte oficial citada na página. */
  fonte: string
  /** Link para a publicação oficial do Sinduscon-SC. */
  fonteUrl: string
  /** Padrão construtivo de referência (apenas informativo). */
  padrao: string
}

/**
 * >>> ATUALIZE MENSALMENTE ESTES CAMPOS <<<
 * Único lugar a alterar — reflete em todos os empreendimentos.
 */
export const CUB_SC: CubConfig = {
  valor: 3096.25,
  vigencia: 'junho/2026',
  fonte: 'Sinduscon-SC',
  fonteUrl: 'https://sinduscon-fpolis.org.br/cub',
  padrao: 'R-8-N (residencial, padrão normal)',
}

/** Formata o valor do CUB como moeda BRL. */
export function cubLabel(cfg: CubConfig = CUB_SC): string {
  return 'R$\u00a0' + cfg.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Texto curto padrão usado nas páginas de empreendimento. */
export const CUB_NOTA =
  'As parcelas e reforços são corrigidos pelo CUB/SC durante a construção.'
