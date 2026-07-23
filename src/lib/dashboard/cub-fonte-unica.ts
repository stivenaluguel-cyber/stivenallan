// Fonte única de verdade pro CUB/SC exibido no dashboard (Home, CRM,
// Financeiro liam de 3 lugares diferentes e formatavam de 3 jeitos
// diferentes — daí a divergência real observada: "R$ 3.122/m² sem
// competência" (Home) vs "R$ 3.121,62/m² com junho/2026" (CRM, só que
// competência ERRADA por bug de fuso) vs "R$ 3.121,62/m² com julho/2026"
// (Financeiro, via cache local desconectado do banco).
//
// Todo mundo deve ler `configuracoes_cub` via GET /api/admin/cub e formatar
// com as funções daqui — nenhuma tela deve fazer sua própria conta de Date().

export type CubVigente = {
  valor_m2: number
  mes_referencia: string // 'YYYY-MM-01' (como vem do banco)
  variacao_mensal?: number | null
  variacao_anual?: number | null
  updated_at?: string | null
}

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

// Parseia 'YYYY-MM' ou 'YYYY-MM-DD' SEM passar por `new Date(string)` — esse
// é o bug real encontrado: `new Date('2026-07-01')` vira meia-noite UTC, e
// formatado no fuso do Brasil (UTC-3) desloca um mês pra trás ("maio" em vez
// de "junho"). Aqui é só split de string + tabela — sem timezone envolvido.
export function competenciaLabelFromChave(mesReferencia: string): string {
  const [anoStr, mesStr] = mesReferencia.split('-')
  const ano = Number(anoStr)
  const mesIdx = Number(mesStr) - 1
  if (!Number.isFinite(ano) || mesIdx < 0 || mesIdx > 11) return mesReferencia
  return `${MESES[mesIdx]} de ${ano}`
}

export function formatarCubValor(valorM2: number, precisao: 'inteiro' | 'completo' = 'completo'): string {
  const casas = precisao === 'inteiro' ? 0 : 2
  return 'R$ ' + valorM2.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}

// Linha completa e autoexplicativa — "CUB/SC — competência julho de 2026 —
// R$ 3.121,62/m²" — pra qualquer tela que queira mostrar tudo de uma vez.
export function formatarCubCompleto(cub: CubVigente): string {
  return `CUB/SC — competência ${competenciaLabelFromChave(cub.mes_referencia)} — ${formatarCubValor(cub.valor_m2)}/m²`
}

export type StatusAtualizacaoCub = 'atualizado' | 'desatualizado'

// Ano/mês "de hoje" no fuso de Brasília via Intl (mesma técnica de
// src/lib/automacoes/horario.ts) — evita o mesmo bug de fuso que este módulo
// inteiro existe pra corrigir: `agora.getMonth()` sozinho reflete o fuso do
// SERVIDOR (Vercel roda em UTC), não o de São Paulo.
function anoMesEmSaoPaulo(agora: Date): { ano: number; mes: number } {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(agora)
  return {
    ano: Number(partes.find((p) => p.type === 'year')?.value ?? '0'),
    mes: Number(partes.find((p) => p.type === 'month')?.value ?? '1'),
  }
}

// Divulgação do CUB/SC é mensal — tolera até 1 mês de defasagem antes de
// avisar que pode estar desatualizado (o Sinduscon costuma divulgar o valor
// do mês corrente só perto do fim do mês anterior).
export function statusAtualizacaoCub(mesReferencia: string, agora: Date = new Date()): StatusAtualizacaoCub {
  const [anoStr, mesStr] = mesReferencia.split('-')
  const ano = Number(anoStr)
  const mes = Number(mesStr)
  const hoje = anoMesEmSaoPaulo(agora)
  const mesesDesde = (hoje.ano - ano) * 12 + (hoje.mes - mes)
  return mesesDesde <= 1 ? 'atualizado' : 'desatualizado'
}
