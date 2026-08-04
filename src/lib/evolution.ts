// Cliente para a Evolution API (WhatsApp)
// Docs: https://doc.evolution-api.com

const BASE_URL = process.env.EVOLUTION_API_URL!      // ex: https://evo.seudominio.com
const API_KEY  = process.env.EVOLUTION_API_KEY!
const INSTANCE = process.env.EVOLUTION_INSTANCE!     // ex: 'stiven'

// Numero do Stiven para alertas de escalada
const STIVEN_NUMBER = '5548991642332'

// Jitter no delay de "digitando...": um valor fixo (era 1200ms sempre) é um
// padrao reconhecivel demais quando o volume de envio automatico cresce —
// parte da higiene anti-banimento e variar o timing, nao só simular digitação.
const DELAY_MIN_MS = 900
const DELAY_MAX_MS = 2600

function delayComJitter(): number {
  return Math.floor(DELAY_MIN_MS + Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS))
}

// Preview e development NUNCA podem tocar a Evolution real — os mesmos
// EVOLUTION_API_URL/_KEY/_INSTANCE de produção também estão configurados no
// escopo Preview na Vercel (verificado em 04/08/2026), então sem este freio
// todo deploy de PR conseguiria mandar WhatsApp real pra lead real. A
// Vercel seta VERCEL_ENV pra 'production'/'preview'/'development' em todo
// deploy; localmente (next dev sem `vercel env pull`) fica ausente —
// ausência ou qualquer valor diferente de 'production' bloqueia
// (fail-closed). Único portão pra TODO envio real (enviarMensagem é a
// função de base de enviarFollowUp, enviarAlertaEscalada e do envio manual
// do painel) — não dá pra esquecer de aplicar em algum call site novo.
function ambienteDeProducaoReal(): boolean {
  return process.env.VERCEL_ENV === 'production'
}

// ============================================
// ENVIAR MENSAGEM DE TEXTO
// ============================================
export async function enviarMensagem(para: string, texto: string): Promise<boolean> {
  if (!ambienteDeProducaoReal()) {
    console.warn(`[evolution] envio bloqueado: VERCEL_ENV="${process.env.VERCEL_ENV ?? ''}" (só 'production' envia de verdade)`)
    return false
  }
  try {
    const res = await fetch(`${BASE_URL}/message/sendText/${INSTANCE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
      },
      body: JSON.stringify({
        number: para,
        text: texto,
        options: {
          delay: delayComJitter(), // simula digitacao humana, com variacao (anti-padrao)
          presence: 'composing',   // mostra 'digitando...'
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
// Motivo do reason detalhado: um "Application not found" (instância removida
// do servidor, ex. sessão do WhatsApp caiu e não foi reconectada via QR Code)
// já aconteceu em produção e só foi descoberto dias depois, por gerar um erro
// idêntico e repetido por lead no cron de follow-up. Chamado no início do
// cron (route.ts) pra falhar uma vez só, com o motivo visível direto no
// histórico de /dashboard/cron — sem precisar vasculhar log de runtime.
export type InstanciaStatus =
  | { ok: true; state: string }
  | { ok: false; reason: string }

export async function verificarInstancia(): Promise<InstanciaStatus> {
  try {
    const res = await fetch(`${BASE_URL}/instance/connectionState/${INSTANCE}`, {
      headers: { 'apikey': API_KEY },
    })
    if (!res.ok) {
      const detail = await res.text()
      return { ok: false, reason: `HTTP ${res.status}: ${detail.slice(0, 200)}` }
    }
    const data = await res.json()
    const state = data?.instance?.state
    if (state === 'open') return { ok: true, state }
    return { ok: false, reason: `instância no estado "${state ?? 'desconhecido'}" (esperado "open" — provável desconexão do WhatsApp, precisa reconectar via QR Code)` }
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) }
  }
}
