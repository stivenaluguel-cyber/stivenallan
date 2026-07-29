// Documentos de lead e de proposta.
//
// Num CRM comum anexo é conveniência. Aqui é o gargalo da venda: no
// financiamento direto quem analisa o crédito é o corretor, então a pasta de
// documentos É a análise. Por isso o módulo não para em "guardar arquivo" —
// ele sabe qual é o conjunto que fecha uma análise e o que ainda falta.

export const TIPOS_ANEXO = [
  { chave: 'documento_identidade', label: 'RG ou CNH', exigidoNaAnalise: true },
  { chave: 'cpf', label: 'CPF', exigidoNaAnalise: true },
  { chave: 'comprovante_renda', label: 'Comprovante de renda', exigidoNaAnalise: true },
  { chave: 'comprovante_residencia', label: 'Comprovante de residência', exigidoNaAnalise: true },
  { chave: 'certidao', label: 'Certidão (estado civil)', exigidoNaAnalise: true },
  { chave: 'contrato', label: 'Contrato', exigidoNaAnalise: false },
  { chave: 'comprovante_pagamento', label: 'Comprovante de pagamento', exigidoNaAnalise: false },
  { chave: 'proposta_assinada', label: 'Proposta assinada', exigidoNaAnalise: false },
  { chave: 'outro', label: 'Outro', exigidoNaAnalise: false },
] as const

export type TipoAnexo = (typeof TIPOS_ANEXO)[number]['chave']

const CHAVES = new Set<string>(TIPOS_ANEXO.map((t) => t.chave))

export function ehTipoValido(v: unknown): v is TipoAnexo {
  return typeof v === 'string' && CHAVES.has(v)
}

export function labelDoTipo(tipo: string): string {
  return TIPOS_ANEXO.find((t) => t.chave === tipo)?.label ?? 'Outro'
}

// Mesmo teto do bucket. Repetido aqui para o erro sair legível antes de subir
// 30 MB pela rede só para o Storage recusar no fim.
export const TAMANHO_MAXIMO_BYTES = 30 * 1024 * 1024
export const TAMANHO_MAXIMO_IMAGEM_BYTES = 10 * 1024 * 1024

export const MIMES_ACEITOS = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const EXTENSAO_POR_MIME: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}

export type ValidacaoAnexo = { ok: true } | { ok: false; erro: string }

export function validarArquivo(nome: string, mime: string, tamanho: number): ValidacaoAnexo {
  if (!nome || !nome.trim()) return { ok: false, erro: 'Arquivo sem nome' }
  if (!MIMES_ACEITOS.has(mime)) {
    return { ok: false, erro: `Formato não aceito (${mime || 'desconhecido'}). Envie PDF, imagem ou documento Word.` }
  }
  if (tamanho <= 0) return { ok: false, erro: 'Arquivo vazio' }

  // Imagem tem teto menor que documento: foto de RG tirada no celular passa
  // fácil de 10 MB sem ganhar nenhuma legibilidade.
  const limite = mime.startsWith('image/') ? TAMANHO_MAXIMO_IMAGEM_BYTES : TAMANHO_MAXIMO_BYTES
  if (tamanho > limite) {
    return { ok: false, erro: `Arquivo de ${formatarTamanho(tamanho)} excede o limite de ${formatarTamanho(limite)}.` }
  }
  return { ok: true }
}

export function formatarTamanho(bytes: number | null | undefined): string {
  const n = Number(bytes)
  if (!Number.isFinite(n) || n <= 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Caminho do objeto no Storage.
 *
 * O nome original do arquivo NÃO entra no caminho: vem do dispositivo do
 * cliente, costuma carregar nome e CPF ("cpf-joao-silva-12345678900.pdf") e o
 * caminho aparece em log. Ele fica guardado em `nome_arquivo`, na linha do
 * banco, que é onde o controle de acesso vale.
 */
export function montarCaminho(
  escopo: { leadId?: string | null; propostaId?: string | null },
  tipo: TipoAnexo,
  mime: string,
  sufixoUnico: string,
): string {
  const pasta = escopo.leadId ? `leads/${escopo.leadId}` : `propostas/${escopo.propostaId}`
  const ext = EXTENSAO_POR_MIME[mime] ?? 'bin'
  return `${pasta}/${tipo}-${sufixoUnico}.${ext}`
}

export type AnexoResumo = { tipo: string }

export type ChecklistAnalise = {
  itens: { chave: TipoAnexo; label: string; entregue: boolean }[]
  entregues: number
  total: number
  completo: boolean
  faltando: string[]
}

/**
 * O que ainda falta para fechar a análise de crédito.
 *
 * Só conta os tipos marcados como exigidos: contrato e comprovante de
 * pagamento são posteriores à aprovação e não podem aparecer como pendência
 * de análise.
 */
export function checklistAnalise(anexos: AnexoResumo[]): ChecklistAnalise {
  const presentes = new Set(anexos.map((a) => a.tipo))
  const exigidos = TIPOS_ANEXO.filter((t) => t.exigidoNaAnalise)

  const itens = exigidos.map((t) => ({
    chave: t.chave as TipoAnexo,
    label: t.label,
    entregue: presentes.has(t.chave),
  }))

  const entregues = itens.filter((i) => i.entregue).length
  return {
    itens,
    entregues,
    total: itens.length,
    completo: entregues === itens.length,
    faltando: itens.filter((i) => !i.entregue).map((i) => i.label),
  }
}
