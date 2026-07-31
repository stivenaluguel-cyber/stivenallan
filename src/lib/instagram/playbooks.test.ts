import { describe, expect, it } from 'vitest'
import { ORIGENS_ATIVACAO, PLAYBOOKS, origemAtivacaoValida, renderPlaybook } from './playbooks'

describe('renderPlaybook', () => {
  it('novo_seguidor renderiza com o nome', () => {
    expect(renderPlaybook('novo_seguidor', { nome: 'Maria' })).toBe(
      'Oi, Maria! Vi que você chegou por aqui agora. Você está buscando apartamento pra morar, pra investir, ou só acompanhando o mercado da região?'
    )
  })

  it('curtida renderiza com nome e assunto', () => {
    expect(renderPlaybook('curtida', { nome: 'João', assunto: 'financiamento direto' })).toBe(
      'Oi, João! Vi que você curtiu nosso post sobre financiamento direto. Já conhece o financiamento direto com a construtora ou ainda está pesquisando?'
    )
  })

  it('story renderiza com nome e assunto', () => {
    expect(renderPlaybook('story', { nome: 'Ana', assunto: 'Guaíba Park' })).toBe(
      'Oi, Ana! Vi que o story de Guaíba Park chamou sua atenção. É algo pra agora ou você está entendendo as opções?'
    )
  })

  it('comentario renderiza com o nome', () => {
    expect(renderPlaybook('comentario', { nome: 'Pedro' })).toBe(
      'Oi, Pedro! Vim continuar por aqui pra não te deixar com resposta genérica. Antes de te mandar valores e plantas, me conta: você já tem uma entrada guardada ou pretende montar?'
    )
  })

  it('seguidor_antigo renderiza com o nome', () => {
    expect(renderPlaybook('seguidor_antigo', { nome: 'Carla' })).toBe(
      'Oi, Carla! Você acompanha a gente há um tempo e nunca conversamos por aqui. Hoje, comprar apartamento na planta com financiamento direto faz sentido pra você?'
    )
  })

  it('reativacao renderiza com o nome', () => {
    expect(renderPlaybook('reativacao', { nome: 'Lucas' })).toBe(
      'Oi, Lucas! A gente já conversou por aqui antes. Como ficou a busca pelo apartamento? Posso te mostrar o que mudou nas condições da construtora?'
    )
  })

  // A falha tem que ser explícita: devolver "{nome}" cru pro operador colar
  // no DM sem perceber queima o contato.
  it('variável obrigatória faltando devolve null, nunca placeholder cru', () => {
    expect(renderPlaybook('novo_seguidor', {})).toBeNull()
    expect(renderPlaybook('curtida', { nome: 'João' })).toBeNull() // falta {assunto}
    expect(renderPlaybook('story', { assunto: 'planta' })).toBeNull() // falta {nome}
  })

  it('variável vazia ou só espaço conta como faltante', () => {
    expect(renderPlaybook('novo_seguidor', { nome: '' })).toBeNull()
    expect(renderPlaybook('novo_seguidor', { nome: '   ' })).toBeNull()
  })

  it('origem desconhecida devolve null', () => {
    expect(renderPlaybook('dm_frio', { nome: 'Maria' })).toBeNull()
  })

  it('nenhum render sai com placeholder não substituído', () => {
    for (const origem of ORIGENS_ATIVACAO) {
      const texto = renderPlaybook(origem, { nome: 'Teste', assunto: 'teste' })
      expect(texto, origem).not.toBeNull()
      expect(texto, origem).not.toMatch(/\{\w+\}/)
    }
  })

  // Regra do usuário para redes sociais: nada de CRECI. E nunca prometer
  // aprovação de crédito ou valorização — os templates precisam continuar limpos.
  it('nenhum template contém CRECI, promessa de aprovação ou de valorização', () => {
    for (const origem of ORIGENS_ATIVACAO) {
      const t = PLAYBOOKS[origem].template.toLowerCase()
      expect(t, origem).not.toContain('creci')
      expect(t, origem).not.toContain('aprova')
      expect(t, origem).not.toContain('valoriza')
      expect(t, origem).not.toContain('garant')
    }
  })
})

describe('origemAtivacaoValida', () => {
  it('aceita as 6 origens e recusa o resto', () => {
    for (const origem of ORIGENS_ATIVACAO) expect(origemAtivacaoValida(origem)).toBe(true)
    expect(origemAtivacaoValida('seguidor')).toBe(false)
    expect(origemAtivacaoValida(null)).toBe(false)
    expect(origemAtivacaoValida(42)).toBe(false)
  })
})
