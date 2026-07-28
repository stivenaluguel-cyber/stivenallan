import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  verificarAssinaturaMeta,
  resolverDesafioVerificacaoMeta,
  extrairLeadgenIds,
  extrairCamposLeadMeta,
} from './meta-leadgen-webhook'

const APP_SECRET = 'app-secret-de-teste'

function assinar(rawBody: string, secret = APP_SECRET): string {
  return 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex')
}

describe('verificarAssinaturaMeta', () => {
  const rawBody = JSON.stringify({ entry: [] })

  it('aceita assinatura valida', () => {
    const assinaturaHeader = assinar(rawBody)
    expect(verificarAssinaturaMeta({ appSecret: APP_SECRET, assinaturaHeader, rawBody })).toBe(true)
  })

  it('rejeita assinatura forjada', () => {
    const assinaturaHeader = 'sha256=' + 'a'.repeat(64)
    expect(verificarAssinaturaMeta({ appSecret: APP_SECRET, assinaturaHeader, rawBody })).toBe(false)
  })

  it('rejeita quando o corpo foi alterado depois de assinado', () => {
    const assinaturaHeader = assinar(rawBody)
    expect(verificarAssinaturaMeta({ appSecret: APP_SECRET, assinaturaHeader, rawBody: rawBody + 'x' })).toBe(false)
  })

  it('rejeita header ausente ou sem prefixo sha256=', () => {
    expect(verificarAssinaturaMeta({ appSecret: APP_SECRET, assinaturaHeader: null, rawBody })).toBe(false)
    expect(verificarAssinaturaMeta({ appSecret: APP_SECRET, assinaturaHeader: 'sha1=abc', rawBody })).toBe(false)
  })
})

describe('resolverDesafioVerificacaoMeta', () => {
  it('devolve o challenge quando mode e token batem', () => {
    const resultado = resolverDesafioVerificacaoMeta({
      verifyTokenEsperado: 'token-secreto',
      mode: 'subscribe',
      verifyTokenRecebido: 'token-secreto',
      challenge: 'abc123',
    })
    expect(resultado).toBe('abc123')
  })

  it('rejeita quando o token nao bate', () => {
    const resultado = resolverDesafioVerificacaoMeta({
      verifyTokenEsperado: 'token-secreto',
      mode: 'subscribe',
      verifyTokenRecebido: 'token-errado',
      challenge: 'abc123',
    })
    expect(resultado).toBeNull()
  })

  it('rejeita quando mode nao e subscribe', () => {
    const resultado = resolverDesafioVerificacaoMeta({
      verifyTokenEsperado: 'token-secreto',
      mode: 'unsubscribe',
      verifyTokenRecebido: 'token-secreto',
      challenge: 'abc123',
    })
    expect(resultado).toBeNull()
  })
})

describe('extrairLeadgenIds', () => {
  it('extrai leadgen_id, page_id, form_id e ad_id de um payload real', () => {
    const payload = {
      entry: [
        {
          id: 'page-1',
          changes: [
            { field: 'leadgen', value: { leadgen_id: 'lead-1', form_id: 'form-1', ad_id: 'ad-1' } },
          ],
        },
      ],
    }
    expect(extrairLeadgenIds(payload)).toEqual([
      { leadgenId: 'lead-1', pageId: 'page-1', formId: 'form-1', adId: 'ad-1' },
    ])
  })

  it('extrai varios entries/changes num unico payload', () => {
    const payload = {
      entry: [
        { id: 'page-1', changes: [{ field: 'leadgen', value: { leadgen_id: 'lead-1' } }] },
        { id: 'page-2', changes: [{ field: 'leadgen', value: { leadgen_id: 'lead-2' } }] },
      ],
    }
    expect(extrairLeadgenIds(payload).map((c) => c.leadgenId)).toEqual(['lead-1', 'lead-2'])
  })

  it('ignora changes que nao sao do campo leadgen', () => {
    const payload = { entry: [{ id: 'page-1', changes: [{ field: 'feed', value: {} }] }] }
    expect(extrairLeadgenIds(payload)).toEqual([])
  })

  it('lida com payload vazio/malformado sem lancar excecao', () => {
    expect(extrairLeadgenIds(null)).toEqual([])
    expect(extrairLeadgenIds({})).toEqual([])
    expect(extrairLeadgenIds({ entry: 'nao-e-array' })).toEqual([])
  })
})

describe('extrairCamposLeadMeta', () => {
  it('mapeia full_name, phone_number e email', () => {
    const fieldData = [
      { name: 'full_name', values: ['Fulano da Silva'] },
      { name: 'phone_number', values: ['+5511999999999'] },
      { name: 'email', values: ['fulano@example.com'] },
    ]
    expect(extrairCamposLeadMeta(fieldData)).toEqual({
      nome: 'Fulano da Silva',
      whatsapp: '+5511999999999',
      email: 'fulano@example.com',
    })
  })

  it('ignora perguntas customizadas que nao mapeiam pra nenhum campo conhecido', () => {
    const fieldData = [
      { name: 'full_name', values: ['Fulano'] },
      { name: 'qual_seu_orcamento', values: ['500000'] },
    ]
    expect(extrairCamposLeadMeta(fieldData)).toEqual({ nome: 'Fulano', whatsapp: null, email: null })
  })

  it('lida com field_data ausente/malformado sem lancar excecao', () => {
    expect(extrairCamposLeadMeta(undefined)).toEqual({ nome: null, whatsapp: null, email: null })
    expect(extrairCamposLeadMeta([{ name: 'full_name', values: [] }])).toEqual({ nome: null, whatsapp: null, email: null })
  })
})
