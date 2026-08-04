import { describe, expect, it } from 'vitest'
import { autenticarWebhookEvolution } from './evolution-webhook-auth'

const SECRET = 'segredo-evolution-de-teste'

describe('autenticarWebhookEvolution', () => {
  it('aceita quando o header bate exatamente com o segredo configurado', () => {
    expect(autenticarWebhookEvolution({
      secretConfigurado: SECRET,
      authorizationHeader: `Bearer ${SECRET}`,
    })).toBe(true)
  })

  it('rejeita quando o segredo do header está errado', () => {
    expect(autenticarWebhookEvolution({
      secretConfigurado: SECRET,
      authorizationHeader: 'Bearer segredo-errado',
    })).toBe(false)
  })

  it('rejeita quando o segredo do header tem tamanho diferente (não lança RangeError)', () => {
    expect(autenticarWebhookEvolution({
      secretConfigurado: SECRET,
      authorizationHeader: 'Bearer curto',
    })).toBe(false)
  })

  it('rejeita header ausente', () => {
    expect(autenticarWebhookEvolution({ secretConfigurado: SECRET, authorizationHeader: null })).toBe(false)
  })

  it('rejeita header sem o prefixo "Bearer "', () => {
    expect(autenticarWebhookEvolution({ secretConfigurado: SECRET, authorizationHeader: SECRET })).toBe(false)
  })

  it('rejeita "Bearer " sem nada depois', () => {
    expect(autenticarWebhookEvolution({ secretConfigurado: SECRET, authorizationHeader: 'Bearer ' })).toBe(false)
  })

  it('rejeita quando EVOLUTION_WEBHOOK_SECRET não está configurado — fail-closed, não ignora a checagem', () => {
    expect(autenticarWebhookEvolution({
      secretConfigurado: undefined,
      authorizationHeader: `Bearer ${SECRET}`,
    })).toBe(false)
  })

  it('rejeita string vazia como segredo configurado (mesmo tratamento de "ausente")', () => {
    expect(autenticarWebhookEvolution({
      secretConfigurado: '',
      authorizationHeader: 'Bearer ',
    })).toBe(false)
  })
})
