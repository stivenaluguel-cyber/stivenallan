// Resolução pura de segmento de campanha contra uma lista de leads —
// sem SQL dinâmico, dado o volume atual (dezenas/poucas centenas de
// leads): busca tudo e filtra em memória, mais simples e testável.

export type Segmento = {
  estagio_funil?: string[]
  temperatura?: number[]
  origem?: string[]
  cidade_interesse?: string[]
}

export type LeadParaSegmento = {
  id: string
  email: string | null
  estagio_funil: string | null
  temperatura: number | null
  origem: string | null
  cidade_interesse: string | null
  unsubscribed_at: string | null
}

export function leadCorrespondeSegmento(lead: LeadParaSegmento, segmento: Segmento): boolean {
  if (lead.unsubscribed_at) return false
  if (!lead.email) return false
  if (segmento.estagio_funil?.length && !(lead.estagio_funil && segmento.estagio_funil.includes(lead.estagio_funil))) return false
  if (segmento.temperatura?.length && !(lead.temperatura != null && segmento.temperatura.includes(lead.temperatura))) return false
  if (segmento.origem?.length && !(lead.origem && segmento.origem.includes(lead.origem))) return false
  if (segmento.cidade_interesse?.length && !(lead.cidade_interesse && segmento.cidade_interesse.includes(lead.cidade_interesse))) return false
  return true
}

export function filtrarLeadsPorSegmento(leads: LeadParaSegmento[], segmento: Segmento): LeadParaSegmento[] {
  return leads.filter((l) => leadCorrespondeSegmento(l, segmento))
}

export function parseSegmento(raw: unknown): Segmento {
  if (!raw || typeof raw !== 'object') return {}
  const r = raw as Record<string, unknown>
  const asStrArr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : undefined)
  const asNumArr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is number => typeof x === 'number') : undefined)
  return {
    estagio_funil: asStrArr(r.estagio_funil),
    temperatura: asNumArr(r.temperatura),
    origem: asStrArr(r.origem),
    cidade_interesse: asStrArr(r.cidade_interesse),
  }
}
