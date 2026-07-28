// Integração nativa e gratuita do Google Ads com "Lead form extensions" /
// "Formulários de lead": ao configurar o método de entrega "Webhook" no
// próprio Google Ads (Ferramentas > Ativos de leads > Configurações do
// webhook), o Google faz um POST direto pra essa URL a cada novo lead — sem
// Zapier/Make, sem custo além do que já se paga na campanha.
//
// Verificação aqui é mais simples que a do Meta: não tem assinatura HMAC no
// header. O Google reenvia, em TODO POST, o mesmo `google_key` (uma string
// aleatória que você mesmo gera e cola na configuração do webhook no Google
// Ads) — comparar contra o valor esperado é o que autentica a chamada.

export type ColunaLeadGoogle = { column_id?: unknown; string_value?: unknown }

export type PayloadLeadGoogle = {
  google_key?: unknown
  lead_id?: unknown
  form_id?: unknown
  campaign_id?: unknown
  is_test?: unknown
  gcl_id?: unknown
  user_column_data?: unknown
}

export function verificarChaveGoogle(params: { chaveEsperada: string; payload: PayloadLeadGoogle }): boolean {
  const { chaveEsperada, payload } = params
  return typeof payload.google_key === 'string' && payload.google_key === chaveEsperada
}

export type CampoLeadGoogle = { nome: string | null; whatsapp: string | null; email: string | null }

// `user_column_data` é uma lista [{column_id, string_value}] — column_id
// documentado pelo Google (FULL_NAME, PHONE_NUMBER, EMAIL, FIRST_NAME,
// LAST_NAME, entre outros). Só os 3 que viram coluna em `leads` são
// extraídos aqui; se só vier FIRST_NAME (sem FULL_NAME), usa como nome.
export function extrairCamposLeadGoogle(payload: PayloadLeadGoogle): CampoLeadGoogle {
  const resultado: CampoLeadGoogle = { nome: null, whatsapp: null, email: null }
  const colunas = payload.user_column_data
  if (!Array.isArray(colunas)) return resultado

  let firstName: string | null = null
  let lastName: string | null = null

  for (const coluna of colunas as ColunaLeadGoogle[]) {
    if (!coluna || typeof coluna !== 'object') continue
    const columnId = typeof coluna.column_id === 'string' ? coluna.column_id.toUpperCase() : ''
    const valor = typeof coluna.string_value === 'string' ? coluna.string_value.trim() : ''
    if (!columnId || !valor) continue

    if (columnId === 'FULL_NAME') resultado.nome = valor
    else if (columnId === 'FIRST_NAME') firstName = valor
    else if (columnId === 'LAST_NAME') lastName = valor
    else if (columnId === 'PHONE_NUMBER') resultado.whatsapp = valor
    else if (columnId === 'EMAIL') resultado.email = valor
  }

  if (!resultado.nome && (firstName || lastName)) {
    resultado.nome = [firstName, lastName].filter(Boolean).join(' ') || null
  }
  return resultado
}
