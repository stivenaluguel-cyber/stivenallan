// Flags server-only (nunca NEXT_PUBLIC_*): a lista de slugs habilitados não
// pode vazar no bundle público — um visitante inspecionando o JS não deveria
// conseguir descobrir quais empreendimentos têm o gate ativo antes de nós
// decidirmos expandir. O client só recebe o resultado já decidido (gateEnabled:
// true/false), nunca a flag ou a lista.

function parseSlugList(raw: string | undefined): Set<string> {
  if (!raw) return new Set()
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  )
}

export function isLeadGateEnabledForSlug(slug: string): boolean {
  if (process.env.LEAD_GATE_ENABLED !== 'true') return false
  return parseSlugList(process.env.LEAD_GATE_SLUGS).has(slug)
}

export function isPropertyHistoryEnabledForSlug(slug: string): boolean {
  if (process.env.LEAD_PROPERTY_HISTORY_ENABLED !== 'true') return false
  return parseSlugList(process.env.LEAD_GATE_SLUGS).has(slug)
}
