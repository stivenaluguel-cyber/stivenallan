import { classificarExecucao } from '@/lib/cron/classificacao'

// Ciclo de vida completo de uma campanha. 'erro' foi mantido (em vez de
// renomear pra 'falhou') porque já é o valor gravado em rows existentes —
// trocar o literal exigiria migrar dado; o rótulo exibido na UI já usa
// "Falhou" (ver ESTADOS_CAMPANHA abaixo), então o usuário nunca vê "erro".
export type StatusCampanha =
  | 'rascunho'
  | 'agendada'
  | 'enviando'
  | 'enviada'
  | 'parcial'
  | 'erro'
  | 'cancelada'

export const ESTADOS_CAMPANHA: Record<StatusCampanha, { label: string; cor: string; corSoft: string }> = {
  rascunho: { label: 'Rascunho', cor: '#71717a', corSoft: 'rgba(113,113,122,0.12)' },
  agendada: { label: 'Agendada', cor: '#3b82f6', corSoft: 'rgba(59,130,246,0.12)' },
  enviando: { label: 'Enviando', cor: '#D24E22', corSoft: 'rgba(210,78,34,0.12)' },
  enviada: { label: 'Enviada', cor: '#16a34a', corSoft: 'rgba(22,163,74,0.12)' },
  parcial: { label: 'Parcial', cor: '#ea580c', corSoft: 'rgba(234,88,12,0.12)' },
  erro: { label: 'Falhou', cor: '#dc2626', corSoft: 'rgba(220,38,38,0.12)' },
  cancelada: { label: 'Cancelada', cor: '#71717a', corSoft: 'rgba(113,113,122,0.12)' },
}

// Reusa a mesma classificação enviados/erros_envio do cron (src/lib/cron/classificacao.ts)
// — mesma semântica: 'ok'→enviou tudo sem erro, 'partial'→enviou algo mas teve
// erro no meio, 'error'→não enviou nada. Só traduz pro vocabulário de campanha.
export function classificarEnvioCampanha(resumo: { enviados: number; erros_envio: number }): 'enviada' | 'parcial' | 'erro' {
  const status = classificarExecucao(resumo)
  if (status === 'ok') return 'enviada'
  if (status === 'partial') return 'parcial'
  return 'erro'
}

// Estados a partir dos quais a campanha ainda pode ser editada (segmento/corpo).
export function editavel(status: StatusCampanha | string): boolean {
  return status === 'rascunho'
}

// Estados a partir dos quais um agendamento pode ser criado/alterado.
export function podeAgendar(status: StatusCampanha | string): boolean {
  return status === 'rascunho' || status === 'agendada'
}

// Estados a partir dos quais a campanha pode ser cancelada (antes de começar a enviar de verdade).
export function podeCancelar(status: StatusCampanha | string): boolean {
  return status === 'rascunho' || status === 'agendada'
}
