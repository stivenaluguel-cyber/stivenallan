import { createHmac, timingSafeEqual } from 'node:crypto'

// Verificação da assinatura do webhook do Meta (Lead Ads) — mesmo estilo
// node:crypto de src/lib/campanhas/resend-webhook.ts, sem dependência nova.
// O Meta assina o corpo RAW com HMAC-SHA256 usando o App Secret e manda o
// resultado no header `x-hub-signature-256` como "sha256=<hex>".
export function verificarAssinaturaMeta(params: {
  appSecret: string
  assinaturaHeader: string | null
  rawBody: string
}): boolean {
  const { appSecret, assinaturaHeader, rawBody } = params
  if (!assinaturaHeader || !assinaturaHeader.startsWith('sha256=')) return false

  const recebido = assinaturaHeader.slice('sha256='.length)
  const esperado = createHmac('sha256', appSecret).update(rawBody).digest('hex')

  let recebidoBuf: Buffer
  let esperadoBuf: Buffer
  try {
    recebidoBuf = Buffer.from(recebido, 'hex')
    esperadoBuf = Buffer.from(esperado, 'hex')
  } catch {
    return false
  }
  return recebidoBuf.length === esperadoBuf.length && timingSafeEqual(recebidoBuf, esperadoBuf)
}

// Payload de handshake da verificação inicial do webhook (GET), exigido
// pelo Meta ao cadastrar a URL do webhook no App: ele manda hub.verify_token
// e espera receber hub.challenge de volta, em texto puro, se o token bater.
export function resolverDesafioVerificacaoMeta(params: {
  verifyTokenEsperado: string
  mode: string | null
  verifyTokenRecebido: string | null
  challenge: string | null
}): string | null {
  const { verifyTokenEsperado, mode, verifyTokenRecebido, challenge } = params
  if (mode !== 'subscribe') return null
  if (!challenge) return null
  if (verifyTokenRecebido !== verifyTokenEsperado) return null
  return challenge
}

export type MetaLeadgenChange = {
  leadgenId: string
  pageId: string | null
  formId: string | null
  adId: string | null
}

// Extrai cada leadgen_id notificado no payload do webhook (`entry[].changes[]`
// com field "leadgen"). Um único POST pode trazer vários entries/changes —
// o Meta agrupa notificações que chegaram próximas no tempo.
export function extrairLeadgenIds(payload: unknown): MetaLeadgenChange[] {
  const resultado: MetaLeadgenChange[] = []
  if (!payload || typeof payload !== 'object') return resultado
  const entries = (payload as { entry?: unknown }).entry
  if (!Array.isArray(entries)) return resultado

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue
    const pageId = typeof (entry as { id?: unknown }).id === 'string' ? (entry as { id: string }).id : null
    const changes = (entry as { changes?: unknown }).changes
    if (!Array.isArray(changes)) continue
    for (const change of changes) {
      if (!change || typeof change !== 'object') continue
      if ((change as { field?: unknown }).field !== 'leadgen') continue
      const value = (change as { value?: unknown }).value
      if (!value || typeof value !== 'object') continue
      const leadgenId = (value as { leadgen_id?: unknown }).leadgen_id
      if (typeof leadgenId !== 'string' || !leadgenId) continue
      resultado.push({
        leadgenId,
        pageId,
        formId: typeof (value as { form_id?: unknown }).form_id === 'string' ? (value as { form_id: string }).form_id : null,
        adId: typeof (value as { ad_id?: unknown }).ad_id === 'string' ? (value as { ad_id: string }).ad_id : null,
      })
    }
  }
  return resultado
}

export type CampoLeadMeta = { nome: string | null; whatsapp: string | null; email: string | null }

// A resposta de GET /{leadgen_id} da Graph API traz field_data como uma
// lista [{name, values:[...]}] — os nomes variam por formulário (perguntas
// customizadas incluídas), então mapeamos só os 3 campos padrão que
// realmente viram colunas em `leads`; qualquer outro campo é ignorado aqui
// (não há coluna genérica de "respostas extra" hoje).
const ALIASES_NOME = ['full_name', 'nome_completo', 'first_name']
const ALIASES_TELEFONE = ['phone_number', 'telefone']
const ALIASES_EMAIL = ['email']

export function extrairCamposLeadMeta(fieldData: unknown): CampoLeadMeta {
  const resultado: CampoLeadMeta = { nome: null, whatsapp: null, email: null }
  if (!Array.isArray(fieldData)) return resultado

  for (const item of fieldData) {
    if (!item || typeof item !== 'object') continue
    const name = (item as { name?: unknown }).name
    const values = (item as { values?: unknown }).values
    if (typeof name !== 'string' || !Array.isArray(values) || typeof values[0] !== 'string') continue
    const valor = values[0].trim()
    if (!valor) continue
    const chave = name.toLowerCase()
    if (!resultado.nome && ALIASES_NOME.includes(chave)) resultado.nome = valor
    else if (!resultado.whatsapp && ALIASES_TELEFONE.includes(chave)) resultado.whatsapp = valor
    else if (!resultado.email && ALIASES_EMAIL.includes(chave)) resultado.email = valor
  }
  return resultado
}
