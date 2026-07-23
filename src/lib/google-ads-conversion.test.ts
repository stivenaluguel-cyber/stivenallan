import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const originalEnv = { ...process.env }

function setFullConfig() {
  process.env.GOOGLE_ADS_DEVELOPER_TOKEN = 'dev-token'
  process.env.GOOGLE_ADS_CLIENT_ID = 'client-id'
  process.env.GOOGLE_ADS_CLIENT_SECRET = 'client-secret'
  process.env.GOOGLE_ADS_REFRESH_TOKEN = 'refresh-token'
  process.env.GOOGLE_ADS_CUSTOMER_ID = '1234567890'
  process.env.GOOGLE_ADS_CONVERSION_ACTION_VISITA_AGENDADA = '999888777'
}

beforeEach(() => {
  vi.resetModules()
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  process.env = { ...originalEnv }
  vi.restoreAllMocks()
})

describe('sendGoogleAdsConversion', () => {
  it('retorna skipped quando faltam credenciais', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { sendGoogleAdsConversion } = await import('./google-ads-conversion')

    const result = await sendGoogleAdsConversion({ estagioFunil: 'visita_agendada', gclid: 'abc', conversionDateTime: new Date() })

    expect(result).toEqual({ ok: false, skipped: true, reason: 'credenciais ausentes' })
    expect(fetchMock).not.toHaveBeenCalled()
  }, 15000)

  it('retorna skipped quando o estágio não tem conversion action configurada', async () => {
    setFullConfig()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { sendGoogleAdsConversion } = await import('./google-ads-conversion')

    const result = await sendGoogleAdsConversion({ estagioFunil: 'qualificado', gclid: 'abc', conversionDateTime: new Date() })

    expect(result).toEqual({ ok: false, skipped: true, reason: 'nenhuma conversion action configurada para o estágio "qualificado"' })
    expect(fetchMock).not.toHaveBeenCalled()
  }, 15000)

  it('retorna skipped quando o lead não tem gclid', async () => {
    setFullConfig()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { sendGoogleAdsConversion } = await import('./google-ads-conversion')

    const result = await sendGoogleAdsConversion({ estagioFunil: 'visita_agendada', gclid: '', conversionDateTime: new Date() })

    expect(result).toEqual({ ok: false, skipped: true, reason: 'lead sem gclid (não veio do Google Ads)' })
    expect(fetchMock).not.toHaveBeenCalled()
  }, 15000)

  it('troca refresh token por access token e sobe a conversão com o resource name correto', async () => {
    setFullConfig()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'access-123', expires_in: 3600 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
    vi.stubGlobal('fetch', fetchMock)
    const { sendGoogleAdsConversion } = await import('./google-ads-conversion')

    const result = await sendGoogleAdsConversion({
      estagioFunil: 'visita_agendada',
      gclid: 'abc123',
      conversionDateTime: new Date('2026-07-23T15:04:05.000Z'),
    })

    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)

    const [oauthUrl, oauthInit] = fetchMock.mock.calls[0]
    expect(oauthUrl).toBe('https://oauth2.googleapis.com/token')
    const oauthBody = new URLSearchParams(oauthInit.body as string)
    expect(oauthBody.get('refresh_token')).toBe('refresh-token')
    expect(oauthBody.get('grant_type')).toBe('refresh_token')

    const [uploadUrl, uploadInit] = fetchMock.mock.calls[1]
    expect(uploadUrl).toBe('https://googleads.googleapis.com/v18/customers/1234567890:uploadClickConversions')
    expect(uploadInit.headers.Authorization).toBe('Bearer access-123')
    expect(uploadInit.headers['developer-token']).toBe('dev-token')
    expect(uploadInit.headers['login-customer-id']).toBeUndefined()
    const body = JSON.parse(uploadInit.body as string)
    expect(body.conversions[0]).toEqual({
      gclid: 'abc123',
      conversionAction: 'customers/1234567890/conversionActions/999888777',
      conversionDateTime: '2026-07-23 15:04:05+00:00',
    })
  }, 15000)

  it('reusa o access token em cache dentro da validade, sem novo refresh', async () => {
    setFullConfig()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'access-1', expires_in: 3600 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
    vi.stubGlobal('fetch', fetchMock)
    const { sendGoogleAdsConversion } = await import('./google-ads-conversion')

    await sendGoogleAdsConversion({ estagioFunil: 'visita_agendada', gclid: 'g1', conversionDateTime: new Date() })
    await sendGoogleAdsConversion({ estagioFunil: 'visita_agendada', gclid: 'g2', conversionDateTime: new Date() })

    // 2 uploads + só 1 troca de token (3 chamadas ao todo, não 4)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  }, 15000)

  it('retorna erro (sem lançar) quando a Google Ads API responde falha', async () => {
    setFullConfig()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'access-123', expires_in: 3600 }) })
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: 'unauthenticated' }) })
    vi.stubGlobal('fetch', fetchMock)
    const { sendGoogleAdsConversion } = await import('./google-ads-conversion')

    const result = await sendGoogleAdsConversion({ estagioFunil: 'visita_agendada', gclid: 'abc', conversionDateTime: new Date() })

    expect(result).toEqual({ ok: false, error: 'Google Ads API falhou' })
  }, 15000)
})
