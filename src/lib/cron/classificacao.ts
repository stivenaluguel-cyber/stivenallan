// Classificação pura do resultado de uma execução de cron — separa
// "o job rodou até o fim" (sucesso de EXECUÇÃO) de "todo mundo recebeu a
// mensagem" (sucesso de ENTREGA). Antes desta extração, todo cron marcava
// status='ok' sempre que o try não lançava exceção, mesmo com enviados=0 e
// erros_envio>0 — por isso a tela conseguia mostrar "100% de sucesso" e
// "10 erros de envio" ao mesmo tempo.

export type StatusExecucaoCron = 'ok' | 'partial' | 'error'

export type ResumoEnvio = {
  enviados: number
  erros_envio: number
}

// ok      — terminou sem nenhum erro de envio (inclui o caso de 0 tentativas)
// partial — enviou pelo menos uma mensagem, mas teve pelo menos um erro
// error   — não conseguiu enviar NENHUMA mensagem e teve pelo menos um erro
export function classificarExecucao(resumo: ResumoEnvio): StatusExecucaoCron {
  if (resumo.erros_envio <= 0) return 'ok'
  if (resumo.enviados > 0) return 'partial'
  return 'error'
}

export function motivoResumido(status: StatusExecucaoCron, resumo: ResumoEnvio): string | undefined {
  if (status === 'ok') return undefined
  if (status === 'partial') return `${resumo.erros_envio} de ${resumo.enviados + resumo.erros_envio} envio(s) falharam`
  return `todos os ${resumo.erros_envio} envio(s) falharam`
}
