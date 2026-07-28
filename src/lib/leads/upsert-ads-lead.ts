import type { SupabaseClient } from '@supabase/supabase-js'
import { normalizeEmail, normalizePhone, normalizeString } from './normalize'

export type AdsLeadInput = {
  nome: string | null
  whatsapp: string | null
  email: string | null
  origem: 'Meta Ads' | 'Google Ads'
  source: string // ex.: 'meta_lead_ads:<form_id>' / 'google_lead_ads:<form_id>' — auditável no banco
}

export type AdsLeadResult =
  | { status: 'created'; id: string }
  | { status: 'existing'; id: string }
  | { status: 'skipped'; motivo: string }

// `leads.whatsapp` tem índice único (migrations 0002 e 0007) — um lead que já
// existe (ex.: já preencheu o site antes, ou clicou em dois anúncios) NUNCA
// pode ser sobrescrito por aqui: sobrescrever arriscaria voltar um lead já
// qualificado/em negociação pro topo do funil só porque ele clicou em outro
// anúncio. Por isso o insert só grava campos NOVOS; em conflito, devolve o
// lead existente sem tocar em nenhuma coluna dele.
export async function upsertAdsLead(supabase: SupabaseClient, input: AdsLeadInput): Promise<AdsLeadResult> {
  const nome = normalizeString(input.nome)
  const whatsapp = normalizePhone(input.whatsapp)
  const email = normalizeEmail(input.email)

  if (!whatsapp) {
    return { status: 'skipped', motivo: 'sem telefone no lead do anúncio' }
  }

  const { data, error } = await supabase
    .from('leads')
    .insert({
      nome,
      whatsapp,
      email,
      origem: input.origem,
      source: input.source,
      estagio_funil: 'primeiro_contato',
      status: 'novo',
      requer_atencao: false,
      proximo_followup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('id')
    .single()

  if (!error) {
    return { status: 'created', id: data!.id }
  }

  // 23505 = unique_violation (Postgres) — já existe lead com esse whatsapp.
  if (error.code === '23505') {
    const { data: existente } = await supabase.from('leads').select('id').eq('whatsapp', whatsapp).maybeSingle()
    if (existente) return { status: 'existing', id: existente.id }
  }

  return { status: 'skipped', motivo: error.message }
}
