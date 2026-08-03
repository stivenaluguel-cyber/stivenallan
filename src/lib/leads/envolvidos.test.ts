import { describe, expect, it } from 'vitest'
import { linkWhatsapp, normalizarEnvolvido, normalizarWhatsapp } from './envolvidos'

describe('normalizarWhatsapp', () => {
  it('tira a formatação e guarda só os dígitos', () => {
    expect(normalizarWhatsapp('(48) 99999-8888')).toBe('48999998888')
  })

  it('remove o 55 colado do WhatsApp — senão o link vira 5555...', () => {
    expect(normalizarWhatsapp('+55 48 99999-8888')).toBe('48999998888')
  })

  it('não confunde DDD 55 (Rio Grande do Sul) com código do país', () => {
    // 5599998888 tem 10 dígitos: é DDD 55 + fixo, não país + número.
    expect(normalizarWhatsapp('(55) 9999-8888')).toBe('5599998888')
  })

  it('número curto demais não passa', () => {
    expect(normalizarWhatsapp('99998888')).toBeNull()
    expect(normalizarWhatsapp('123')).toBeNull()
  })

  it('vazio é nulo, não string vazia', () => {
    expect(normalizarWhatsapp('')).toBeNull()
    expect(normalizarWhatsapp(null)).toBeNull()
  })
})

describe('linkWhatsapp', () => {
  it('monta o link com o país', () => {
    expect(linkWhatsapp('48999998888')).toBe('https://wa.me/5548999998888')
  })

  it('sem número não há botão', () => {
    expect(linkWhatsapp(null)).toBeNull()
  })

  it('mensagem pré-escrita vai codificada', () => {
    const l = linkWhatsapp('48999998888', 'Olá, sobre a unidade 302 & a proposta')
    expect(l).toContain('?text=')
    expect(l).toContain('%26')
  })
})

describe('normalizarEnvolvido', () => {
  const base = { nome: 'Ana Correspondente', papel: 'correspondente', whatsapp: '(48) 99999-8888' }

  it('aceita um envolvido completo', () => {
    const r = normalizarEnvolvido(base)
    expect(r.ok).toBe(true)
    expect(r.ok && r.envolvido.whatsapp).toBe('48999998888')
  })

  it('exige nome', () => {
    expect(normalizarEnvolvido({ ...base, nome: '  ' }).ok).toBe(false)
  })

  it('recusa papel fora da lista', () => {
    expect(normalizarEnvolvido({ ...base, papel: 'porteiro' }).ok).toBe(false)
  })

  it('envolvido sem WhatsApp é válido — nem todo contato é por zap', () => {
    const r = normalizarEnvolvido({ nome: 'Cartório 2º Ofício', papel: 'despachante' })
    expect(r.ok).toBe(true)
    expect(r.ok && r.envolvido.whatsapp).toBeNull()
  })

  it('recusa WhatsApp digitado errado em vez de gravar meio número', () => {
    // Gravar 9999-8888 sem DDD faria o botão abrir conversa com desconhecido.
    const r = normalizarEnvolvido({ ...base, whatsapp: '99998888' })
    expect(r.ok).toBe(false)
    expect(r.ok === false && r.erro).toContain('DDD')
  })

  it('recusa e-mail malformado', () => {
    expect(normalizarEnvolvido({ ...base, email: 'ana@' }).ok).toBe(false)
  })
})
