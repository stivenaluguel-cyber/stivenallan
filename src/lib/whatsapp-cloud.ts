// Cliente para a WhatsApp Cloud API oficial da Meta (Graph API) — convive
// lado a lado com a Evolution API (src/lib/evolution.ts) enquanto a
// migração não é decidida; nada aqui substitui o Evolution ainda. Mesma
// versão da Graph API já usada em src/lib/instagram/comment-automations.ts.
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api

const GRAPH_VERSION = 'v21.0'

const PHONE_NUMBER_ID = process.env.META_WHATSAPP_PHONE_NUMBER_ID
// Token permanente da WhatsApp Cloud API — produto diferente do
// META_PAGE_ACCESS_TOKEN do Instagram, mesmo dentro do mesmo Business
// Manager (cada produto tem o próprio token, mesmo App).
const TOKEN = process.env.META_WHATSAPP_TOKEN

// Preview e development NUNCA podem tocar a API real — mesmo freio de
// src/lib/evolution.ts (ambienteDeProducaoReal): a Vercel seta VERCEL_ENV
// pra 'production'/'preview'/'development' em todo deploy; localmente
// (next dev sem `vercel env pull`) fica ausente — ausência ou qualquer
// valor diferente de 'production' bloqueia (fail-closed).
function ambienteDeProducaoReal(): boolean {
  return process.env.VERCEL_ENV === 'production'
}

type PayloadEnvio = Record<string, unknown>

// Guard de envs ANTES de tentar a chamada — sem token/phone_number_id
// configurados (ainda não existe nenhum na Vercel), a chamada nem sai:
// erro claro no log em vez de um fetch fadado a falhar com URL quebrada.
async function enviarPayload(payload: PayloadEnvio): Promise<boolean> {
  if (!PHONE_NUMBER_ID || !TOKEN) {
    console.error('[whatsapp-cloud] envs ausentes: defina META_WHATSAPP_PHONE_NUMBER_ID e META_WHATSAPP_TOKEN')
    return false
  }
  if (!ambienteDeProducaoReal()) {
    console.warn(`[whatsapp-cloud] envio bloqueado: VERCEL_ENV="${process.env.VERCEL_ENV ?? ''}" (só 'production' envia de verdade)`)
    return false
  }
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ messaging_product: 'whatsapp', ...payload }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[whatsapp-cloud] envio error:', res.status, err)
      return false
    }
    return true
  } catch (err) {
    console.error('[whatsapp-cloud] envio exception:', err)
    return false
  }
}

// ============================================
// TEXTO LIVRE
// ============================================
// Só é aceito pela própria Cloud API dentro da janela de 24h de
// atendimento (regra da Meta: fora da janela ela recusa com o erro 131047
// "re-engagement message" — não validamos essa janela aqui, quem decide é
// a API). Fora da janela, usar enviarTemplateWhatsappCloud.
export async function enviarTextoWhatsappCloud(telefone: string, texto: string): Promise<boolean> {
  return enviarPayload({
    to: telefone,
    type: 'text',
    text: { body: texto },
  })
}

// ============================================
// TEMPLATE — primeiro contato / fora da janela de 24h
// ============================================
// Exige um template já aprovado no WhatsApp Manager da Meta. Nome, idioma e
// parâmetros NÃO são hardcoded de propósito — nenhum template está
// aprovado ainda; quem chama decide qual usar.
export async function enviarTemplateWhatsappCloud(
  telefone: string,
  nomeTemplate: string,
  idioma: string,
  parametros: string[] = [],
): Promise<boolean> {
  return enviarPayload({
    to: telefone,
    type: 'template',
    template: {
      name: nomeTemplate,
      language: { code: idioma },
      // Componente "body" só entra se houver parâmetro — um template sem
      // variável não tem components na chamada.
      ...(parametros.length > 0
        ? { components: [{ type: 'body', parameters: parametros.map((valor) => ({ type: 'text', text: valor })) }] }
        : {}),
    },
  })
}
