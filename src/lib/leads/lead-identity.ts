import type { SupabaseClient } from '@supabase/supabase-js'
import { normalizeEmail, normalizeString, normalizarCelularBR } from './normalize'
import type { Attribution } from '@/lib/tracking'

export type LeadIdentityInput = {
  nome: string | null
  whatsapp: string | null
  email: string | null
  propertyId: string | null
  propertyName: string | null
  source: string | null
  faixaInvestimento: string | null
  prazoCompra: string | null
  entradaDisponivel: string | null
  attribution: Attribution
}

export type LeadIdentityResult =
  | { status: 'resolved'; leadId: string; created: boolean; conflito: boolean }
  | { status: 'invalid'; motivo: string }
  | { status: 'error'; motivo: string }

// Único ponto de entrada do gate pra identidade de lead — nunca chama `leads`
// direto. `resolve_lead_for_gate` (função Postgres, ver migration
// 20260805003000) trava telefone e depois e-mail com FOR UPDATE na mesma
// transação: é o único jeito de fechar a corrida entre duas abas submetendo
// o mesmo contato ao mesmo tempo sem um round-trip JS por passo.
//
// Usa `normalizarCelularBR` (rigorosa: 10-11 dígitos, sem prefixo de país) em
// vez do `normalizePhone` fraco usado em /api/leads legado — aqui é seguro
// endurecer porque esta é uma rota nova, sem risco de regressão nas 35
// páginas fora do piloto que continuam no fluxo antigo.
export async function resolveLeadForGate(
  supabase: SupabaseClient,
  input: LeadIdentityInput,
): Promise<LeadIdentityResult> {
  const nome = normalizeString(input.nome)
  const whatsapp = normalizarCelularBR(input.whatsapp)
  const email = normalizeEmail(input.email)

  if (!nome || !whatsapp || !email) {
    return { status: 'invalid', motivo: 'nome, whatsapp e email sao obrigatorios' }
  }

  const { data, error } = await supabase.rpc('resolve_lead_for_gate', {
    p_whatsapp: whatsapp,
    p_email: email,
    p_nome: nome,
    p_property_id: input.propertyId,
    p_property_name: input.propertyName,
    p_source: input.source,
    p_utm_source: input.attribution.utm_source ?? null,
    p_utm_medium: input.attribution.utm_medium ?? null,
    p_utm_campaign: input.attribution.utm_campaign ?? null,
    p_utm_content: input.attribution.utm_content ?? null,
    p_utm_term: input.attribution.utm_term ?? null,
    p_gclid: input.attribution.gclid ?? null,
    p_fbclid: input.attribution.fbclid ?? null,
    p_faixa_investimento: normalizeString(input.faixaInvestimento),
    p_prazo_compra: normalizeString(input.prazoCompra),
    p_entrada_disponivel: normalizeString(input.entradaDisponivel),
  })

  if (error) {
    return { status: 'error', motivo: error.message }
  }

  const resultado = data as { leadId: string; created: boolean; conflito: boolean }
  return { status: 'resolved', leadId: resultado.leadId, created: resultado.created, conflito: resultado.conflito }
}
