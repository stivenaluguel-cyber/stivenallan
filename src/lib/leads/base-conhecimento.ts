import type { SupabaseClient } from '@supabase/supabase-js'

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
      console.error('[base-conhecimento] busca falhou, seguindo sem contexto extra', error)
      return []
    }
    return data ?? []
  } catch (err) {
    // Nunca pode derrubar a resposta principal da IA por causa de uma
    // consulta de contexto que é só um "bônus".
    console.error('[base-conhecimento] busca lançou exceção, seguindo sem contexto extra', err)
    return []
  }
}

export function montarBlocoContexto(entradas: EntradaConhecimento[]): string {
  if (entradas.length === 0) return ''
  const itens = entradas.map((e, i) => `${i + 1}. P: ${e.pergunta}\n   R: ${e.resposta}`).join('\n')
  return `\n\nCONTEXTO DE ATENDIMENTOS ANTERIORES (use se for relevante pra essa conversa; nunca invente informacao que nao esteja aqui nem force encaixe se nao bater):\n${itens}`
}
