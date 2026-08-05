import { describe, it, expect } from 'vitest'
import { scrubSentryEvent } from './sentry-scrub'

const TOKEN = 'TOKEN_DE_SESSAO_EM_CLARO_NAO_PODE_VAZAR'
const JWT_ADMIN = 'eyJhbGciOiJIUzI1NiJ9.PAYLOAD_ADMIN.assinatura'

function eventoTipico() {
  return {
    message: 'route exception',
    request: {
      method: 'POST',
      url: 'https://stivenallan.com.br/api/lead-track',
      cookies: { sa_session: TOKEN, dashboard_token: JWT_ADMIN, outro: '1' },
      headers: {
        cookie: `sa_session=${TOKEN}; dashboard_token=${JWT_ADMIN}`,
        'user-agent': 'Mozilla/5.0',
        referer: 'https://stivenallan.com.br/empreendimento/fontana/parco-savello-santa-barbara-criciuma-sc',
      },
    },
  }
}

describe('scrubSentryEvent', () => {
  it('remove o dicionário de cookies e o header Cookie', () => {
    const limpo = scrubSentryEvent(eventoTipico())
    const serializado = JSON.stringify(limpo)
    expect(serializado).not.toContain(TOKEN)
    expect(serializado).not.toContain(JWT_ADMIN)
    expect(limpo.request).not.toHaveProperty('cookies')
    expect(limpo.request.headers).not.toHaveProperty('cookie')
  })

  it('preserva os headers que servem pra diagnosticar', () => {
    const limpo = scrubSentryEvent(eventoTipico())
    expect(limpo.request.headers['user-agent']).toBe('Mozilla/5.0')
    expect(limpo.request.headers.referer).toContain('parco-savello')
    expect(limpo.request.method).toBe('POST')
    expect(limpo.request.url).toContain('/api/lead-track')
  })

  it('pega variações de caixa e outros headers de credencial', () => {
    const evento = {
      request: {
        headers: {
          Cookie: `sa_session=${TOKEN}`,
          Authorization: 'Bearer segredo',
          'Proxy-Authorization': 'Basic segredo',
          'Set-Cookie': `sa_session=${TOKEN}`,
          accept: 'application/json',
        },
      },
    }
    const limpo = scrubSentryEvent(evento)
    expect(JSON.stringify(limpo)).not.toContain(TOKEN)
    expect(JSON.stringify(limpo)).not.toContain('segredo')
    expect(limpo.request.headers.accept).toBe('application/json')
  })

  it('não quebra com evento sem request, sem headers, ou nulo', () => {
    expect(() => scrubSentryEvent({ message: 'sem request' })).not.toThrow()
    expect(() => scrubSentryEvent({ request: {} })).not.toThrow()
    expect(() => scrubSentryEvent(null)).not.toThrow()
    expect(() => scrubSentryEvent(undefined)).not.toThrow()
    expect(scrubSentryEvent({ request: { url: 'x' } }).request.url).toBe('x')
  })
})
