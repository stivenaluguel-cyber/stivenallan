import { getOpenAI } from '@/lib/agent'
import { logError, tipoDeErro } from '@/lib/log'

const SOURCE = 'leads/sentimento'

export type Sentimento = 'positivo' | 'neutro' | 'negativo' | 'urgente'

const SENTIMENTOS_VALIDOS: Sentimento[] = ['positivo', 'neutro', 'negativo', 'urgente']

const SYSTEM_PROMPT = `Classifique o tom da mensagem de um lead imobiliário em UMA única palavra,
sem explicacao, sem pontuacao: positivo, neutro, negativo ou urgente.

"urgente" e so pra reclamacao forte, pedido explicito de resposta imediata,
ameaca de desistir do negocio, ou linguagem alterada — nao pra simples
interesse em ser atendido rapido ("quero visitar essa semana" e positivo,
nao urgente).`

// Classificacao separada da conversa principal (nao entra no loop de tools
// do agent.ts) — evita misturar o tom transiente de UMA mensagem com o
// perfil persistente do lead, e uma falha aqui nunca pode atrasar ou
// derrubar a resposta que vai pro WhatsApp.
export async function classificarSentimento(mensagem: string): Promise<Sentimento> {
  if (!mensagem.trim()) return 'neutro'

  try {
    const openai = getOpenAI()
    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: mensagem.slice(0, 2000) },
      ],
      max_tokens: 5,
      temperature: 0,
    })

    const bruto = (response.choices[0]?.message?.content ?? '').trim().toLowerCase()
    return SENTIMENTOS_VALIDOS.find((s) => bruto.includes(s)) ?? 'neutro'
  } catch (err) {
    // `mensagem` (texto do lead) vai no corpo da chamada pro LLM externo —
    // erros de validação de conteúdo de algumas APIs OpenAI-compatíveis
    // ecoam um trecho do conteúdo rejeitado na mensagem de erro. Só o tipo
    // do erro é seguro de logar aqui.
    logError(SOURCE, 'classificarSentimento falhou, usando neutro como fallback', undefined, {
      errorTipo: tipoDeErro(err),
      mensagemLength: mensagem.length,
    })
    return 'neutro'
  }
}
