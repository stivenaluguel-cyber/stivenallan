// Pool de concorrência genérico: roda `tarefa` para cada item, no máximo
// `limite` em paralelo. Usado pela regeneração em lote da marca d'água pra
// não estourar memória/CPU processando 500 fotos ao mesmo tempo — mas não
// sabe nada de fotos, sharp ou Storage, então é testável com funções falsas.
//
// Erros não são engolidos aqui: se `tarefa` lançar, o worker propaga e os
// outros workers em andamento continuam até o próprio `await` desse índice
// (Promise.all só rejeita depois que todos os workers terminam ou rejeitam).
// Quem chama decide se quer tolerância a falha por item — normalmente
// fazendo a própria `tarefa` capturar o erro e devolver um resultado
// {ok:false} em vez de lançar.
export async function executarComLimiteConcorrencia<T, R>(
  itens: T[],
  limite: number,
  tarefa: (item: T, indice: number) => Promise<R>,
): Promise<R[]> {
  const resultados: R[] = new Array(itens.length)
  const maxTrabalhadores = Math.max(1, Math.min(Math.floor(limite) || 1, itens.length))
  let cursor = 0

  async function trabalhador(): Promise<void> {
    while (cursor < itens.length) {
      const indice = cursor++
      resultados[indice] = await tarefa(itens[indice], indice)
    }
  }

  await Promise.all(Array.from({ length: maxTrabalhadores }, () => trabalhador()))
  return resultados
}
