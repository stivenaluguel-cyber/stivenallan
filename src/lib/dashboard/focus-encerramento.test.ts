import { describe, expect, it } from 'vitest'
import { deveEncerrarSessao, type EstadoFila } from './focus-encerramento'

const base: EstadoFila = {
  sessaoAtiva: true,
  carregando: false,
  erro: false,
  carregouComSucesso: true,
  itensNaTela: 0,
  pendentesNoServidor: 0,
  jaEncerrada: false,
}

describe('deveEncerrarSessao', () => {
  it('encerra quando o servidor confirma zero pendentes após um carregamento bem-sucedido', () => {
    expect(deveEncerrarSessao(base)).toBe(true)
  })

  // REGRESSÃO: este é o bug que encerrou uma sessão real em produção. No
  // primeiro render, a fila ainda não respondeu — o estado é "vazia, sem
  // erro", que é indistinguível de "acabou" se não olharmos
  // carregouComSucesso.
  it('NÃO encerra antes da primeira resposta da fila chegar', () => {
    expect(deveEncerrarSessao({ ...base, carregouComSucesso: false })).toBe(false)
  })

  it('NÃO encerra enquanto a fila está carregando', () => {
    expect(deveEncerrarSessao({ ...base, carregando: true })).toBe(false)
  })

  it('NÃO encerra quando o carregamento falhou (erro de rede/servidor)', () => {
    expect(deveEncerrarSessao({ ...base, erro: true, carregouComSucesso: false })).toBe(false)
  })

  it('NÃO encerra por erro mesmo que um carregamento anterior tenha dado certo', () => {
    expect(deveEncerrarSessao({ ...base, erro: true })).toBe(false)
  })

  it('NÃO encerra enquanto ainda há itens na tela', () => {
    expect(deveEncerrarSessao({ ...base, itensNaTela: 3 })).toBe(false)
  })

  it('NÃO encerra quando a página atual está vazia mas o servidor ainda tem pendentes', () => {
    // Fila paginada: o lote exibido acabou, mas há mais no servidor.
    expect(deveEncerrarSessao({ ...base, itensNaTela: 0, pendentesNoServidor: 12 })).toBe(false)
  })

  it('NÃO encerra uma sessão que já foi encerrada (idempotente)', () => {
    expect(deveEncerrarSessao({ ...base, jaEncerrada: true })).toBe(false)
  })

  it('NÃO encerra quando não há sessão ativa', () => {
    expect(deveEncerrarSessao({ ...base, sessaoAtiva: false })).toBe(false)
  })

  it('um filtro que não devolve nada não encerra a sessão sozinho — só o servidor confirmando zero pendentes', () => {
    // Filtro vazio na PREPARAÇÃO não cria sessão (sessaoAtiva=false).
    expect(deveEncerrarSessao({ ...base, sessaoAtiva: false, carregouComSucesso: true })).toBe(false)
  })
})
