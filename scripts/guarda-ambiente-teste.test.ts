import { describe, expect, it } from 'vitest'
import { extrairProjectRef, verificarAlvo, PROJECT_REF_PRODUCAO } from './guarda-ambiente-teste.mjs'

const DESCARTAVEL = 'qkjzanrcutzxvjiufaob'

describe('extrairProjectRef', () => {
  it('extrai o ref de uma URL do Supabase', () => {
    expect(extrairProjectRef('https://qkjzanrcutzxvjiufaob.supabase.co')).toBe(DESCARTAVEL)
    expect(extrairProjectRef('https://xpkznaqgctfkoonqpcye.supabase.co/rest/v1')).toBe(PROJECT_REF_PRODUCAO)
  })

  it('devolve null para entradas que não dá pra identificar', () => {
    expect(extrairProjectRef('')).toBeNull()
    expect(extrairProjectRef('http://localhost:54321')).toBeNull()
    expect(extrairProjectRef(undefined)).toBeNull()
    expect(extrairProjectRef(null)).toBeNull()
  })
})

describe('verificarAlvo — a guarda que impede escrever em produção', () => {
  it('ABORTA quando o alvo é o projeto de produção', () => {
    const r = verificarAlvo('https://' + PROJECT_REF_PRODUCAO + '.supabase.co')
    expect(r.ok).toBe(false)
    expect(r.motivo).toContain('PRODUÇÃO')
  })

  it('aborta mesmo quando a URL de produção vem com caminho extra', () => {
    expect(verificarAlvo('https://' + PROJECT_REF_PRODUCAO + '.supabase.co/rest/v1/leads').ok).toBe(false)
  })

  it('aborta quando não consegue identificar o alvo (não assume que é seguro)', () => {
    expect(verificarAlvo('').ok).toBe(false)
    expect(verificarAlvo(undefined).ok).toBe(false)
    expect(verificarAlvo('https://exemplo.com').ok).toBe(false)
  })

  it('aprova o projeto descartável', () => {
    const r = verificarAlvo('https://' + DESCARTAVEL + '.supabase.co')
    expect(r.ok).toBe(true)
    expect(r.ref).toBe(DESCARTAVEL)
  })

  it('aborta se o alvo não for exatamente o descartável esperado', () => {
    const r = verificarAlvo('https://outroprojetoqualquer.supabase.co', { refDescartavelEsperado: DESCARTAVEL })
    expect(r.ok).toBe(false)
    expect(r.motivo).toContain('não é o descartável esperado')
  })

  it('aprova quando o alvo bate exatamente com o descartável esperado', () => {
    expect(verificarAlvo('https://' + DESCARTAVEL + '.supabase.co', { refDescartavelEsperado: DESCARTAVEL }).ok).toBe(true)
  })

  it('não existe flag de override para produção — nem passando o ref como "esperado"', () => {
    const r = verificarAlvo('https://' + PROJECT_REF_PRODUCAO + '.supabase.co', { refDescartavelEsperado: PROJECT_REF_PRODUCAO })
    expect(r.ok).toBe(false)
  })
})
