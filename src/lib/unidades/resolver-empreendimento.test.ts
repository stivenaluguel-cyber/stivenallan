import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { resolverIdComUnidades } from './resolver-empreendimento'

// Retrato do banco real em 30/07/2026: o Pineto tem linha nas duas tabelas,
// mesmo slug, ids diferentes, e só a de `empreendimentos` tem as 54 unidades.
const PROP = 'd6a65efa-b849-44d1-ba6b-68fd1dc7c555'
const EMPR = '0cf2d49f-d783-4163-8ac9-e9b6f94095f1'
const SLUG = 'pineto-centro-criciuma-sc'

/**
 * @param unidadesPorId quantas unidades cada id possui
 * @param slugs         linhas de cada tabela: id → slug
 */
function fakeClient(
  unidadesPorId: Record<string, number>,
  slugs: { properties?: Record<string, string>; empreendimentos?: Record<string, string> },
) {
  const consultas: string[] = []
  const client = {
    from(tabela: string) {
      if (tabela === 'empreendimentos_unidades') {
        return {
          select: () => ({
            eq: async (_c: string, id: string) => {
              consultas.push(`contar:${id}`)
              return { count: unidadesPorId[id] ?? 0 }
            },
          }),
        }
      }
      const linhas = (slugs as Record<string, Record<string, string> | undefined>)[tabela] ?? {}
      return {
        select: () => ({
          eq: (coluna: string, valor: string) => ({
            maybeSingle: async () => {
              consultas.push(`${tabela}.${coluna}=${valor}`)
              if (coluna === 'slug') {
                const achado = Object.entries(linhas).find(([, s]) => s === valor)
                return { data: achado ? { id: achado[0] } : null }
              }
              return { data: linhas[valor] ? { slug: linhas[valor] } : null }
            },
          }),
        }),
      }
    },
  }
  return { client: client as unknown as SupabaseClient, consultas }
}

describe('resolverIdComUnidades', () => {
  it('id que já tem unidades volta intacto, sem consultar as outras tabelas', async () => {
    const { client, consultas } = fakeClient({ [EMPR]: 54 }, {})
    expect(await resolverIdComUnidades(client, EMPR)).toBe(EMPR)
    expect(consultas).toEqual([`contar:${EMPR}`])
  })

  it('traduz o id de properties para o de empreendimentos pelo slug', async () => {
    const { client } = fakeClient(
      { [PROP]: 0, [EMPR]: 54 },
      { properties: { [PROP]: SLUG }, empreendimentos: { [EMPR]: SLUG } },
    )
    expect(await resolverIdComUnidades(client, PROP)).toBe(EMPR)
  })

  it('traduz também no sentido inverso', async () => {
    const { client } = fakeClient(
      { [EMPR]: 0, [PROP]: 54 },
      { properties: { [PROP]: SLUG }, empreendimentos: { [EMPR]: SLUG } },
    )
    expect(await resolverIdComUnidades(client, EMPR)).toBe(PROP)
  })

  it('prédio sem unidade em lugar nenhum devolve o próprio id', async () => {
    // Os outros 35 imóveis: ninguém tem tabela importada. A resposta correta é
    // lista vazia, não o espelho de outro empreendimento.
    const { client } = fakeClient(
      { [PROP]: 0, [EMPR]: 0 },
      { properties: { [PROP]: SLUG }, empreendimentos: { [EMPR]: SLUG } },
    )
    expect(await resolverIdComUnidades(client, PROP)).toBe(PROP)
  })

  it('id sem slug em nenhuma tabela não quebra', async () => {
    const { client } = fakeClient({}, {})
    expect(await resolverIdComUnidades(client, 'id-fantasma')).toBe('id-fantasma')
  })

  it('gêmeo com mesmo slug mas também vazio não é escolhido', async () => {
    const { client } = fakeClient(
      { [PROP]: 0, [EMPR]: 0, 'outro-id': 99 },
      { properties: { [PROP]: SLUG }, empreendimentos: { [EMPR]: SLUG } },
    )
    expect(await resolverIdComUnidades(client, PROP)).toBe(PROP)
  })
})
