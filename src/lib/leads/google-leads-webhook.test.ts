import { describe, expect, it } from 'vitest'
import { verificarChaveGoogle, extrairCamposLeadGoogle } from './google-leads-webhook'

describe('verificarChaveGoogle', () => {
  it('aceita quando google_key bate com a chave esperada', () => {
    expect(verificarChaveGoogle({ chaveEsperada: 'chave-secreta', payload: { google_key: 'chave-secreta' } })).toBe(true)
  })

  it('rejeita quando a chave nao bate', () => {
    expect(verificarChaveGoogle({ chaveEsperada: 'chave-secreta', payload: { google_key: 'outra-coisa' } })).toBe(false)
  })

  it('rejeita quando google_key esta ausente ou nao e string', () => {
    expect(verificarChaveGoogle({ chaveEsperada: 'chave-secreta', payload: {} })).toBe(false)
    expect(verificarChaveGoogle({ chaveEsperada: 'chave-secreta', payload: { google_key: 123 } })).toBe(false)
  })
})

describe('extrairCamposLeadGoogle', () => {
  it('mapeia FULL_NAME, PHONE_NUMBER e EMAIL', () => {
    const payload = {
      user_column_data: [
        { column_id: 'FULL_NAME', string_value: 'Fulano da Silva' },
        { column_id: 'PHONE_NUMBER', string_value: '+5511999999999' },
        { column_id: 'EMAIL', string_value: 'fulano@example.com' },
      ],
    }
    expect(extrairCamposLeadGoogle(payload)).toEqual({
      nome: 'Fulano da Silva',
      whatsapp: '+5511999999999',
      email: 'fulano@example.com',
    })
  })

  it('monta o nome a partir de FIRST_NAME + LAST_NAME quando FULL_NAME nao vem', () => {
    const payload = {
      user_column_data: [
        { column_id: 'FIRST_NAME', string_value: 'Fulano' },
        { column_id: 'LAST_NAME', string_value: 'Silva' },
      ],
    }
    expect(extrairCamposLeadGoogle(payload).nome).toBe('Fulano Silva')
  })

  it('e case-insensitive pro column_id', () => {
    const payload = { user_column_data: [{ column_id: 'phone_number', string_value: '11999999999' }] }
    expect(extrairCamposLeadGoogle(payload).whatsapp).toBe('11999999999')
  })

  it('lida com user_column_data ausente/malformado sem lancar excecao', () => {
    expect(extrairCamposLeadGoogle({})).toEqual({ nome: null, whatsapp: null, email: null })
    expect(extrairCamposLeadGoogle({ user_column_data: 'nao-e-array' })).toEqual({ nome: null, whatsapp: null, email: null })
  })
})
