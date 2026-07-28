import { afterEach, describe, expect, it, vi } from 'vitest'
import { buscarIndicadoresBcb } from './indicadores-bcb'

afterEach(() => {
  vi.restoreAllMocks()
})

function sgsResponse(valor: string, data: string) {
  return { ok: true, json: async () => [{ data, valor }] }
}

const PTAX_DOLAR = {
  ok: true,
  json: async () => ({
    value: [
      { cotacaoCompra: 5.0888, cotacaoVenda: 5.0894, dataHoraCotacao: '2026-07-20 13:03:16.960952', tipoBoletim: 'Abertura' },
      { cotacaoCompra: 5.1171, cotacaoVenda: 5.1177, dataHoraCotacao: '2026-07-28 13:25:31.150278', tipoBoletim: 'Fechamento' },
    ],
  }),
}

const PTAX_EURO = {
  ok: true,
  json: async () => ({
    value: [
      { cotacaoCompra: 5.8335, cotacaoVenda: 5.8347, dataHoraCotacao: '2026-07-28 13:25:31.150278', tipoBoletim: 'Fechamento' },
    ],
  }),
}

describe('buscarIndicadoresBcb', () => {
  it('busca todos os indicadores com sucesso', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('sgs.432')) return sgsResponse('14.25', '05/08/2026')
      if (url.includes('sgs.4391')) return sgsResponse('1.00', '01/07/2026')
      if (url.includes('sgs.189')) return sgsResponse('-0.50', '01/06/2026')
      if (url.includes('sgs.195')) return sgsResponse('0.6741', '27/07/2026')
      if (url.includes('CotacaoDolarPeriodo')) return PTAX_DOLAR
      if (url.includes('CotacaoMoedaPeriodo')) return PTAX_EURO
      throw new Error('URL inesperada: ' + url)
    })
    vi.stubGlobal('fetch', fetchMock)

    const r = await buscarIndicadoresBcb()

    expect(r.selic).toEqual({ valor: 14.25, data: '05/08/2026' })
    expect(r.cdi).toEqual({ valor: 1.0, data: '01/07/2026' })
    expect(r.igpm).toEqual({ valor: -0.5, data: '01/06/2026' })
    expect(r.poupanca).toEqual({ valor: 0.6741, data: '27/07/2026' })
    expect(r.dolar).toEqual({ compra: 5.1171, venda: 5.1177, data: '28/07/2026' })
    expect(r.euro).toEqual({ compra: 5.8335, venda: 5.8347, data: '28/07/2026' })
  })

  it('retorna null pros indicadores que falharem, sem derrubar os outros', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('sgs.432')) return { ok: false, status: 500 }
      if (url.includes('sgs.4391')) throw new Error('network error')
      if (url.includes('sgs.189')) return sgsResponse('-0.50', '01/06/2026')
      if (url.includes('sgs.195')) return { ok: true, json: async () => [] }
      if (url.includes('CotacaoDolarPeriodo')) return { ok: true, json: async () => ({ value: [] }) }
      if (url.includes('CotacaoMoedaPeriodo')) return PTAX_EURO
      throw new Error('URL inesperada: ' + url)
    })
    vi.stubGlobal('fetch', fetchMock)

    const r = await buscarIndicadoresBcb()

    expect(r.selic).toBeNull()
    expect(r.cdi).toBeNull()
    expect(r.igpm).toEqual({ valor: -0.5, data: '01/06/2026' })
    expect(r.poupanca).toBeNull()
    expect(r.dolar).toBeNull()
    expect(r.euro).toEqual({ compra: 5.8335, venda: 5.8347, data: '28/07/2026' })
  })
})
