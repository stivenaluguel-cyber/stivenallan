import type { StatusObra } from '@/lib/empreendimentos'

// Normalizações compartilhadas do cadastro de empreendimentos.
//
// Existiam SEIS cópias levemente diferentes da mesma lógica de slug espalhadas
// pelo projeto (sitemap, rota pública, listagem do painel, dois formulários de
// cadastro...). Uma delas — a que monta o link "Ver" na listagem — slugificava
// a construtora, enquanto a API gravava o valor CRU digitado pelo usuário. Com
// isso, cadastrar `Acme Construções` gerava link para `/empreendimento/acme-construcoes/...`
// enquanto o banco guardava `Acme Construções`, e a página respondia 404.

/** minúsculas, sem acento, separado por hífen. `Acme Construções` -> `acme-construcoes` */
export function slugificar(valor: unknown): string {
  if (typeof valor !== 'string') return ''
  return valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Vocabulário público, definido por StatusObra em @/lib/empreendimentos e
// exibido por statusLabel(). Qualquer valor fora desta lista faz o site
// mostrar "Sob consulta" no lugar do status real.
export const STATUS_OBRA_VALIDOS: readonly StatusObra[] = ['na planta', 'em obras', 'pronto', 'entregue']

// Sinônimos já encontrados em produção ou emitidos pelos formulários do painel.
// O select de cadastro mandava `lancamento`/`em_obras` (que o site não conhece)
// e a tela de edição mandava `em_construcao`/`breve_lancamento`/`concluido` —
// três vocabulários diferentes para a mesma coluna.
const ALIASES_STATUS_OBRA: Record<string, StatusObra> = {
  'lancamento': 'na planta',
  'breve-lancamento': 'na planta',
  'planta': 'na planta',
  'obras': 'em obras',
  'em-obras': 'em obras',
  'em-construcao': 'em obras',
  'construcao': 'em obras',
  'pronto-para-morar': 'pronto',
  'concluido': 'entregue',
  'entregues': 'entregue',
}

/**
 * Converte qualquer variação para o vocabulário que o site entende.
 * Devolve null quando não dá para mapear com segurança (melhor deixar o campo
 * intacto do que gravar um valor que vira "Sob consulta").
 */
export function normalizarStatusObra(valor: unknown): StatusObra | null {
  if (typeof valor !== 'string') return null
  const bruto = valor.trim()
  if (!bruto) return null

  const chave = slugificar(bruto)
  if (!chave) return null

  const direto = STATUS_OBRA_VALIDOS.find((s) => slugificar(s) === chave)
  if (direto) return direto

  return ALIASES_STATUS_OBRA[chave] ?? null
}

/**
 * Resolve o slug da construtora a partir do corpo enviado pelo painel, que usa
 * `construtora` (campo de texto livre do formulário) ou `construtora_slug`.
 *
 * Devolve `undefined` quando o chamador não mandou nada — essencial para o
 * update parcial não sobrescrever a construtora de um empreendimento existente
 * com string vazia.
 */
export function montarConstrutoraSlug(form: { construtora?: unknown; construtora_slug?: unknown }): string | undefined {
  const bruto = form.construtora ?? form.construtora_slug
  if (bruto === undefined || bruto === null) return undefined
  const slug = slugificar(bruto)
  return slug || undefined
}

export const STATUS_VENDA_VALIDOS = ['ativo', 'pausado', 'encerrado'] as const
export type StatusVenda = (typeof STATUS_VENDA_VALIDOS)[number]

/** Status comercial (coluna própria — não confundir com o status de obra). */
export function normalizarStatusVenda(valor: unknown): StatusVenda | null {
  if (typeof valor !== 'string') return null
  const chave = slugificar(valor)
  return (STATUS_VENDA_VALIDOS as readonly string[]).includes(chave) ? (chave as StatusVenda) : null
}

/**
 * Monta um objeto de update PARCIAL de verdade: uma chave só entra se o
 * chamador realmente mandou um valor.
 *
 * BUG REAL que isso corrige: o PUT montava a linha inteira com `?? null` em
 * cada campo e depois removia só as chaves `undefined` — que nunca existiam,
 * porque o `?? null` já as tinha convertido em `null`. Uma chamada parcial
 * (o seletor de status da listagem manda só `{status_venda}`) zerava nome,
 * cidade, descrições, preço, galeria, diferenciais e FAQ. Confirmado em
 * produção: 8 empreendimentos ficaram com o status de obra vazio.
 */
export function criarAcumuladorParcial() {
  const row: Record<string, unknown> = {}
  const set = (chave: string, valor: unknown) => {
    if (valor !== undefined) row[chave] = valor
  }
  return { row, set }
}
