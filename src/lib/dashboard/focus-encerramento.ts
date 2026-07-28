// Decisão de encerrar automaticamente uma sessão do Modo Foco, extraída da
// tela para poder ser testada isoladamente.
//
// Existe porque um erro aqui é caro e silencioso: encerrar a sessão de alguém
// que ainda tinha trabalho pela frente. Já aconteceu na prática — a fila
// ainda não tinha carregado (estado inicial: zero itens, zero pendentes,
// nenhum erro registrado ainda) e isso foi lido como "acabou".
export type EstadoFila = {
  sessaoAtiva: boolean
  carregando: boolean
  erro: boolean
  // Só vira true depois de uma resposta bem-sucedida do servidor. É a
  // diferença entre "a fila está vazia" e "a fila ainda não chegou".
  carregouComSucesso: boolean
  itensNaTela: number
  pendentesNoServidor: number
  jaEncerrada: boolean
}

export function deveEncerrarSessao(estado: EstadoFila): boolean {
  if (!estado.sessaoAtiva) return false
  if (estado.jaEncerrada) return false
  if (estado.carregando) return false
  if (estado.erro) return false
  if (!estado.carregouComSucesso) return false
  return estado.itensNaTela === 0 && estado.pendentesNoServidor === 0
}
