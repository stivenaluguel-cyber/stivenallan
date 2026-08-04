// Extrai números de campos de ficha técnica em texto livre (ex.: "93 a 94",
// "230 a 253", "850 a 1.369", "172") para permitir filtro numérico no
// catálogo sem exigir que o cadastro (painel/planilha) mude de formato.
// Nunca inventa valor: campo ausente ou sem número reconhecível vira undefined
// e o card/filtro simplesmente não mostra aquele dado.

function paraNumero(token: string): number | undefined {
  // "1.369" (separador de milhar BR) -> 1369; "94,5" -> 94.5
  const limpo = token.replace(/\./g, '').replace(',', '.')
  const n = Number(limpo)
  return Number.isFinite(n) ? n : undefined
}

/** Primeiro e último número de uma string livre, na ordem em que aparecem. */
export function extrairFaixaNumerica(valor?: string | null): { min?: number; max?: number } {
  if (!valor) return {}
  const tokens = valor.match(/\d{1,3}(?:\.\d{3})*(?:,\d+)?/g)
  if (!tokens || tokens.length === 0) return {}
  const numeros = tokens.map(paraNumero).filter((n): n is number => n !== undefined)
  if (numeros.length === 0) return {}
  return { min: Math.min(...numeros), max: Math.max(...numeros) }
}

/** Primeiro número inteiro de uma string livre — uso em dormitórios/suítes/vagas. */
export function extrairInteiro(valor?: string | null): number | undefined {
  if (!valor) return undefined
  const m = valor.match(/\d+/)
  return m ? Number(m[0]) : undefined
}

/** Formata um par {min,max} como "93" ou "93 a 94" (pt-BR, sem casas decimais desnecessárias). */
export function formatarFaixa(min?: number, max?: number): string | undefined {
  if (min === undefined) return undefined
  const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  if (max === undefined || max === min) return fmt(min)
  return `${fmt(min)} a ${fmt(max)}`
}
