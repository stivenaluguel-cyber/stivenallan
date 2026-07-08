// Cliente para a Evolution API (WhatsApp)
// Docs: https://doc.evolution-api.com

const BASE_URL = process.env.EVOLUTION_API_URL!      // ex: https://evo.seudominio.com
const API_KEY  = process.env.EVOLUTION_API_KEY!
const INSTANCE = process.env.EVOLUTION_INSTANCE!     // ex: 'stiven'

// Numero do Stiven para alertas de escalada
const STIVEN_NUMBER = '5548991642332'

// ============================================
// ENVIAR MENSAGEM DE TEXTO
// ============================================
export async function enviarMensagem(para: string, texto: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/message/sendText/${INSTANCE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
      },
      body: JSON.stringify({
        number: para,
        textMessage: { text: texto },
        options: {
          delay: 1200,           // simula digitacao humana (1.2s)
          presence: 'composing', // mostra 'digitando...'
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[evolution] enviarMensagem error:', res.status, err)
      return false
    }
    return true
  } catch (err) {
    console.error('[evolution] enviarMensagem exception:', err)
    return false
  }
}

// ============================================
// ALERTA DE ESCALADA — notifica Stiven
// ============================================
export async function enviarAlertaEscalada(
  leadWhatsapp: string,
  leadNome: string | null,
  leadScore: number,
): Promise<void> {
  const nome = leadNome ?? 'Lead sem nome'
  const link = `https://wa.me/${leadWhatsapp}`

  const mensagem = [
    '*ALERTA — Lead quente precisa da sua atencao* ',
    '',
    `Lead: ${nome}`,
    `WhatsApp: +${leadWhatsapp}`,
    `Score: ${leadScore}/100`,
    `Contato direto: ${link}`,
    '',
    'Acesse o painel para ver o historico completo da conversa.',
  ].join('\n')

  await enviarMensagem(STIVEN_NUMBER, mensagem)
}

// ============================================
// FOLLOW-UP — chamado pelo cron job
// ============================================
export async function enviarFollowUp(
  para: string,
  mensagem: string,
): Promise<boolean> {
  return enviarMensagem(para, mensagem)
}

// ============================================
// VERIFICAR STATUS DA INSTANCIA
// ============================================
export async function verificarInstancia(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/instance/connectionState/${INSTANCE}`, {
      headers: { 'apikey': API_KEY },
    })
    const data = await res.json()
    return data?.instance?.state === 'open'
  } catch {
    return false
  }
}
