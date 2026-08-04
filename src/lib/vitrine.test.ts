import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  comDadosVivosImovel,
  comDadosVivosEmpreendimento,
  getDadosVivosPorSlug,
  type DadosVivos,
} from './vitrine'
import type { ImovelVitrine } from './vitrine'
import type { Empreendimento } from './empreendimentos'

// getDadosVivosPorSlug monta o PRÓPRIO client com a service role (não usa
// createClient() de cookies/RLS — ver comentário na função: RLS libera
// `properties` para o público mas bloqueia `empreendimentos` e
// `empreendimentos_unidades` em silêncio, sem erro, só devolvendo 0 linhas).
// Mockar @supabase/supabase-js é o jeito de testar isso sem bater no Postgres
// real nem depender de variável de ambiente.
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

async function mockarTabelas(tabelas: Record<string, unknown[]>) {
  const { createClient } = await import('@supabase/supabase-js')
  vi.mocked(createClient).mockReturnValue({
    from(tabela: string) {
      return { select: async () => ({ data: tabelas[tabela] ?? [] }) }
    },
  } as any)
}

async function mockarErro() {
  const { createClient } = await import('@supabase/supabase-js')
  vi.mocked(createClient).mockImplementation(() => {
    throw new Error('conexão caiu')
  })
}

afterEach(() => {
  vi.clearAllMocks()
})

const IMOVEL_BASE: ImovelVitrine = {
  id: '1', nome: 'Prédio Base', slug: 'predio-base', construtora_slug: 'fontana',
  construtora: 'Construtora Fontana', bairro: 'Centro', cidade: 'Criciúma', uf: 'SC',
  status: 'na planta', exibir_preco: false, preco: null,
  frase: 'Frase original.', img: 'capa.jpg', ativo: true,
}

const EMP_BASE: Empreendimento = {
  slug: 'predio-base', nome: 'Prédio Base', construtoraSlug: 'fontana',
  cidade: 'Criciúma', bairro: 'Centro', uf: 'SC', imagem: 'capa.jpg',
  statusObra: 'na planta', exibirPreco: false, precoAPartirDe: undefined,
  frase: 'Frase original.',
}

describe('getDadosVivosPorSlug', () => {
  it('usa o MENOR valor_tabela entre as unidades disponíveis do prédio', async () => {
    await mockarTabelas({
      properties: [{ slug: 'arbor-x', status: 'em obras', exibir_preco: false, preco: null }],
      empreendimentos: [{ id: 'e1', slug: 'arbor-x' }],
      empreendimentos_unidades: [
        { empreendimento_id: 'e1', valor_tabela: 2500000, disponivel: true },
        { empreendimento_id: 'e1', valor_tabela: 1500000, disponivel: true },
        { empreendimento_id: 'e1', valor_tabela: 1800000, disponivel: true },
      ],
    })
    const m = await getDadosVivosPorSlug()
    expect(m.get('arbor-x')).toEqual({ status: 'em obras', exibirPreco: true, preco: 1500000 })
  })

  it('ignora unidade vendida (disponivel: false) no cálculo do mínimo', async () => {
    await mockarTabelas({
      properties: [{ slug: 'x', status: 'em obras', exibir_preco: false, preco: null }],
      empreendimentos: [{ id: 'e1', slug: 'x' }],
      empreendimentos_unidades: [
        { empreendimento_id: 'e1', valor_tabela: 500000, disponivel: false }, // vendida, mais barata
        { empreendimento_id: 'e1', valor_tabela: 900000, disponivel: true },
      ],
    })
    const m = await getDadosVivosPorSlug()
    expect(m.get('x')?.preco).toBe(900000)
  })

  it('sem unidade nenhuma, cai no preco de properties (cadastro manual)', async () => {
    await mockarTabelas({
      properties: [{ slug: 'sem-espelho', status: 'pronto', exibir_preco: true, preco: 777000 }],
      empreendimentos: [{ id: 'e1', slug: 'sem-espelho' }],
      empreendimentos_unidades: [],
    })
    const m = await getDadosVivosPorSlug()
    expect(m.get('sem-espelho')).toEqual({ status: 'pronto', exibirPreco: true, preco: 777000 })
  })

  it('sem unidade e sem properties.preco, exibirPreco fica false — nunca inventa número', async () => {
    await mockarTabelas({
      properties: [{ slug: 'nada', status: 'na planta', exibir_preco: false, preco: null }],
      empreendimentos: [{ id: 'e1', slug: 'nada' }],
      empreendimentos_unidades: [],
    })
    const m = await getDadosVivosPorSlug()
    expect(m.get('nada')).toEqual({ status: 'na planta', exibirPreco: false, preco: null })
  })

  it('devolve mapa vazio se a consulta falhar — chamador cai no fallback estático', async () => {
    await mockarErro()
    const m = await getDadosVivosPorSlug()
    expect(m.size).toBe(0)
  })
})

describe('comDadosVivosImovel — precedência status/preço', () => {
  it('sem dados vivos, devolve o item estático intocado', () => {
    expect(comDadosVivosImovel(IMOVEL_BASE, undefined)).toBe(IMOVEL_BASE)
  })

  it('status vivo sobrepõe o estático', () => {
    const vivos: DadosVivos = { status: 'em obras', exibirPreco: false, preco: null }
    expect(comDadosVivosImovel(IMOVEL_BASE, vivos).status).toBe('em obras')
  })

  it('preço vivo liga exibir_preco mesmo se o estático dizia false', () => {
    const vivos: DadosVivos = { status: 'em obras', exibirPreco: true, preco: 1200000 }
    const r = comDadosVivosImovel(IMOVEL_BASE, vivos)
    expect(r.exibir_preco).toBe(true)
    expect(r.preco).toBe(1200000)
  })

  it('sem preço vivo (exibirPreco false), preserva o preço estático — nunca zera o que já funcionava', () => {
    const comPrecoEstatico: ImovelVitrine = { ...IMOVEL_BASE, exibir_preco: true, preco: 999000 }
    const semPrecoVivo: DadosVivos = { exibirPreco: false, preco: null }
    const r = comDadosVivosImovel(comPrecoEstatico, semPrecoVivo)
    expect(r.exibir_preco).toBe(true)
    expect(r.preco).toBe(999000)
  })

  it('preserva frase/imagem/bairro do estático — a camada viva não é dona do conteúdo', () => {
    const vivos: DadosVivos = { status: 'pronto', exibirPreco: true, preco: 500000 }
    const r = comDadosVivosImovel(IMOVEL_BASE, vivos)
    expect(r.frase).toBe('Frase original.')
    expect(r.img).toBe('capa.jpg')
    expect(r.bairro).toBe('Centro')
  })
})

describe('comDadosVivosEmpreendimento — mesma precedência, campos de /empreendimentos', () => {
  it('preço vivo sobrepõe precoAPartirDe e liga exibirPreco', () => {
    const vivos: DadosVivos = { status: 'em obras', exibirPreco: true, preco: 2100000 }
    const r = comDadosVivosEmpreendimento(EMP_BASE, vivos)
    expect(r.exibirPreco).toBe(true)
    expect(r.precoAPartirDe).toBe(2100000)
    expect(r.statusObra).toBe('em obras')
  })

  it('sem dados vivos, devolve o item estático intocado', () => {
    expect(comDadosVivosEmpreendimento(EMP_BASE, undefined)).toBe(EMP_BASE)
  })
})
