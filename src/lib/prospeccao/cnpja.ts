import { logError, logInfo } from '@/lib/log'

const SOURCE = 'lib/prospeccao/cnpja'
const BASE_URL = 'https://api.cnpja.com'

// cnpja.com — sob demanda, só quando o corretor pede pra UM lead
// específico (nunca em lote pra campanha inteira): o plano gratuito é 50
// créditos/mês, e uma busca de campanha já traz até 60 candidatos brutos —
// enriquecer todos de uma vez estouraria a cota numa campanha só.
//
// Duas chamadas por lookup, porque são produtos diferentes na API deles:
// 1. GET /office?names.in=<nome> — acha o CNPJ a partir do nome da empresa
//    (o gap real: toda API gratuita de CNPJ exige já saber o CNPJ; essa é
//    paga exatamente por resolver nome → CNPJ).
// 2. GET /office/{cnpj} — traz o detalhe completo (sócios, telefone,
//    e-mail, endereço) daquele CNPJ específico.
//
// CPF do sócio nunca vem completo — a Receita Federal mascara
// (`***123456**`) em qualquer fonte legítima, inclusive paga; é proteção de
// dado pessoal pela LGPD, não limitação do provedor. Só o nome vem
// completo, e é isso que este módulo expõe.

export type SocioCnpja = { nome: string; cargo: string | null }

export type DetalhesCnpja = {
  cnpj: string
  razaoSocial: string
  situacao: string | null
  telefone: string | null
  email: string | null
  socios: SocioCnpja[]
}

export type BuscarCnpjaResultado =
  | { ok: true; skipped: false; dados: DetalhesCnpja }
  | { ok: true; skipped: false; dados: null } // busca rodou, nenhuma empresa encontrada com esse nome
  | { ok: false; skipped: true } // sem CNPJA_API_KEY configurada
  | { ok: false; skipped: false; error: string }

type OfficeSearchResponse = { data?: Array<{ taxId?: string }> }

type OfficeDetailResponse = {
  taxId?: string
  company?: {
    name?: string
    members?: Array<{
      person?: { name?: string }
      role?: { text?: string }
    }>
  }
  status?: { text?: string }
  phones?: Array<{ area?: string; number?: string }>
  emails?: Array<{ address?: string }>
}

function headers(apiKey: string) {
  return { Authorization: apiKey, Accept: 'application/json' }
}

async function buscarTaxIdPorNome(nome: string, apiKey: string): Promise<string | null | { error: string }> {
  try {
    const url = BASE_URL + '/office?names.in=' + encodeURIComponent(nome) + '&limit=1'
    const res = await fetch(url, { headers: headers(apiKey) })
    if (!res.ok) {
      const corpo = await res.text().catch(() => '')
      logError(SOURCE, 'busca por nome falhou', corpo, { status: res.status })
      return { error: 'cnpja.com recusou a busca (status ' + res.status + ')' }
    }
    const data = (await res.json()) as OfficeSearchResponse
    const taxId = data.data?.[0]?.taxId
    return taxId ?? null
  } catch (err) {
    logError(SOURCE, 'falha de rede na busca por nome', err)
    return { error: 'Falha de rede ao consultar o cnpja.com' }
  }
}

function mapDetalhes(d: OfficeDetailResponse): DetalhesCnpja | null {
  if (!d.taxId || !d.company?.name) return null
  return {
    cnpj: d.taxId,
    razaoSocial: d.company.name,
    situacao: d.status?.text ?? null,
    telefone: d.phones?.[0] ? '(' + d.phones[0].area + ') ' + d.phones[0].number : null,
    email: d.emails?.[0]?.address ?? null,
    socios: (d.company.members ?? [])
      .filter((m): m is { person: { name: string }; role?: { text?: string } } => !!m.person?.name)
      .map((m) => ({ nome: m.person.name, cargo: m.role?.text ?? null })),
  }
}

/**
 * Nome da empresa → CNPJ + sócios + contato. `dados: null` (com `ok: true`)
 * significa que a busca rodou normal mas não achou nenhuma empresa com esse
 * nome — diferente de erro, não deve ser tratado como falha na tela.
 */
export async function buscarCnpjPorNome(nome: string): Promise<BuscarCnpjaResultado> {
  const apiKey = process.env.CNPJA_API_KEY
  if (!apiKey) return { ok: false, skipped: true }

  const taxIdOuErro = await buscarTaxIdPorNome(nome, apiKey)
  if (taxIdOuErro && typeof taxIdOuErro === 'object') return { ok: false, skipped: false, error: taxIdOuErro.error }
  if (taxIdOuErro === null) {
    logInfo(SOURCE, 'nenhuma empresa encontrada', { nome })
    return { ok: true, skipped: false, dados: null }
  }

  try {
    const res = await fetch(BASE_URL + '/office/' + taxIdOuErro, { headers: headers(apiKey) })
    if (!res.ok) {
      const corpo = await res.text().catch(() => '')
      logError(SOURCE, 'detalhe do CNPJ falhou', corpo, { status: res.status, taxId: taxIdOuErro })
      return { ok: false, skipped: false, error: 'cnpja.com recusou o detalhe (status ' + res.status + ')' }
    }
    const dados = mapDetalhes((await res.json()) as OfficeDetailResponse)
    if (!dados) return { ok: false, skipped: false, error: 'cnpja.com devolveu um detalhe sem CNPJ ou nome válido' }
    logInfo(SOURCE, 'CNPJ encontrado', { nome, cnpj: dados.cnpj, socios: dados.socios.length })
    return { ok: true, skipped: false, dados }
  } catch (err) {
    logError(SOURCE, 'falha de rede no detalhe do CNPJ', err)
    return { ok: false, skipped: false, error: 'Falha de rede ao consultar o cnpja.com' }
  }
}
