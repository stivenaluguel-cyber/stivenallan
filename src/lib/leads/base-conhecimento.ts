import type { SupabaseClient } from '@supabase/supabase-js'
import { logError, tipoDeErro } from '@/lib/log'

const SOURCE = 'leads/base-conhecimento'

export type EntradaConhecimento = { id: string; pergunta: string; resposta: string }

// Busca textual (tsvector/GIN, config 'portuguese') sobre base_conhecimento
// — decisão de escopo documentada na migration: sem embeddings/pgvector,
// pra não depender de uma chave de API nova. Só considera entradas
// aprovadas e ativas: uma sugestão automática pendente de revisão nunca
// pode influenciar uma resposta real antes do corretor aprovar.
export async function buscarConhecimentoRelevante(
  supabase: SupabaseClient,
  pergunta: string,
  limite = 3,
): Promise<EntradaConhecimento[]> {
  const termo = pergunta.trim()
  if (!termo) return []

  try {
    const { data, error } = await supabase
      .from('base_conhecimento')
      .select('id, pergunta, resposta')
      .eq('aprovado', true)
      .eq('ativo', true)
      .textSearch('busca', termo, { type: 'plain', config: 'portuguese' })
      .limit(limite)

    if (error) {
      // `termo` é o texto do lead usado como tsquery — em caso de erro de
      // sintaxe do tsquery, a mensagem do Postgres pode ecoar o termo
      // recebido. code é categórico e seguro (ex: erro de sintaxe tem um
      // code próprio); nunca logar error.message/details inteiro aqui.
      logError(SOURCE, 'busca de conhecimento falhou, seguindo sem contexto extra', undefined, {
        errorCode: error.code,
        termoLength: termo.length,
      })
      return []
    }
    return data ?? []
  } catch (err) {
    // Nunca pode derrubar a resposta principal da IA por causa de uma
    // consulta de contexto que é só um "bônus".
    logError(SOURCE, 'busca de conhecimento lançou excecao, seguindo sem contexto extra', undefined, {
      errorTipo: tipoDeErro(err),
      termoLength: termo.length,
    })
    return []
  }
}

export function montarBlocoContexto(entradas: EntradaConhecimento[]): string {
  if (entradas.length === 0) return ''
  const itens = entradas.map((e, i) => `${i + 1}. P: ${e.pergunta}\n   R: ${e.resposta}`).join('\n')
  return `\n\nCONTEXTO DE ATENDIMENTOS ANTERIORES (use se for relevante pra essa conversa; nunca invente informacao que nao esteja aqui nem force encaixe se nao bater):\n${itens}`
}
