// Detecta pedido de opt-out por palavra-chave no WhatsApp. Hoje não existe
// nenhuma detecção — o bot continua mandando follow-up automático mesmo se
// o lead pedir explicitamente pra parar, o que é risco de banimento da
// instância Evolution e péssima experiência.
//
// Só considera opt-out quando a mensagem INTEIRA (normalizada) é curta e
// bate contra a lista — nunca por conter a palavra em algum lugar de uma
// frase longa. "não quero parar de ver os apartamentos" não pode disparar
// isso; só "para", "pare", "stop" etc sozinhos (ou quase) devem.
const PALAVRAS_OPTOUT = new Set([
  'parar', 'pare', 'para', 'stop', 'sair', 'cancelar', 'cancela',
  'descadastrar', 'descadastre', 'descadastrar-me', 'nao quero mais',
  'nao quero mais mensagens', 'para de mandar mensagem', 'chega',
])

const LIMITE_CARACTERES = 20

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos (marcas combinantes do NFD)
    .toLowerCase()
    .trim()
    .replace(/[!?.,]+$/g, '')
    .replace(/\s+/g, ' ')
}

export function detectarPalavraChaveOptOut(texto: string): boolean {
  const normalizado = normalizar(texto)
  if (!normalizado || normalizado.length > LIMITE_CARACTERES) return false
  return PALAVRAS_OPTOUT.has(normalizado)
}

export const MENSAGEM_CONFIRMACAO_OPTOUT =
  'Combinado, não vou mais te enviar mensagens automáticas por aqui. Se mudar de ideia ou precisar de algo, é só me chamar quando quiser 🙂'
