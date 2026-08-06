import { describe, expect, it } from 'vitest'
import { extrairMensagensWhatsappCloud } from './whatsapp-cloud-webhook'

function payloadComMensagem(overrides: Record<string, unknown> = {}) {
  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '102290129340398',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '16505551111', phone_number_id: '106540352242922' },
              contacts: [{ profile: { name: 'Kerry Fisher' }, wa_id: '16315551234' }],
              messages: [
                {
                  from: '16315551234',
                  id: 'wamid.HBGLM123',
                  timestamp: '1603059201',
                  type: 'text',
                  text: { body: 'Olá, tudo bem?' },
                  ...overrides,
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  }
}

describe('extrairMensagensWhatsappCloud', () => {
  it('extrai from, texto, wamid, timestamp e phoneNumberId de uma mensagem de texto', () => {
    const mensagens = extrairMensagensWhatsappCloud(payloadComMensagem())

    expect(mensagens).toEqual([
      { from: '16315551234', texto: 'Olá, tudo bem?', wamid: 'wamid.HBGLM123', timestamp: 1603059201, phoneNumberId: '106540352242922' },
    ])
  })

  it('ignora tipos diferentes de "text" (imagem, áudio, interativo, ...)', () => {
    const payload = payloadComMensagem({ type: 'image', text: undefined, image: { id: 'media-1' } })
    expect(extrairMensagensWhatsappCloud(payload)).toEqual([])
  })

  it('ignora mensagem sem corpo de texto ou só espaços', () => {
    expect(extrairMensagensWhatsappCloud(payloadComMensagem({ text: { body: '' } }))).toEqual([])
    expect(extrairMensagensWhatsappCloud(payloadComMensagem({ text: { body: '   ' } }))).toEqual([])
  })

  it('ignora mensagem sem "from"', () => {
    expect(extrairMensagensWhatsappCloud(payloadComMensagem({ from: undefined }))).toEqual([])
  })

  it('callback de status de entrega (value.statuses, sem value.messages) não gera mensagem nenhuma', () => {
    const payload = {
      entry: [
        {
          id: '102290129340398',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: { phone_number_id: '106540352242922' },
                statuses: [{ id: 'wamid.XYZ', status: 'delivered', timestamp: '1603059202' }],
              },
              field: 'messages',
            },
          ],
        },
      ],
    }
    expect(extrairMensagensWhatsappCloud(payload)).toEqual([])
  })

  it('trata timestamp fora do padrão numérico (string vazia, não numérica) como null', () => {
    expect(extrairMensagensWhatsappCloud(payloadComMensagem({ timestamp: 'nao-numerico' }))[0].timestamp).toBeNull()
    expect(extrairMensagensWhatsappCloud(payloadComMensagem({ timestamp: undefined }))[0].timestamp).toBeNull()
  })

  it('phoneNumberId vira null quando metadata não tem phone_number_id', () => {
    const payload = {
      entry: [{ id: 'x', changes: [{ value: { metadata: {}, messages: payloadComMensagem().entry[0].changes[0].value.messages }, field: 'messages' }] }],
    }
    expect(extrairMensagensWhatsappCloud(payload)[0].phoneNumberId).toBeNull()
  })

  it('várias mensagens em entries/changes diferentes — todas extraídas', () => {
    const payload = {
      entry: [
        payloadComMensagem().entry[0],
        {
          id: 'outro-entry',
          changes: [
            {
              value: {
                metadata: { phone_number_id: '999' },
                messages: [{ from: '5511988887777', id: 'wamid.OUTRO', timestamp: '1603059300', type: 'text', text: { body: 'segunda mensagem' } }],
              },
              field: 'messages',
            },
          ],
        },
      ],
    }
    expect(extrairMensagensWhatsappCloud(payload)).toHaveLength(2)
  })

  it('payload malformado/vazio devolve lista vazia sem lançar', () => {
    expect(extrairMensagensWhatsappCloud(null)).toEqual([])
    expect(extrairMensagensWhatsappCloud(undefined)).toEqual([])
    expect(extrairMensagensWhatsappCloud({})).toEqual([])
    expect(extrairMensagensWhatsappCloud({ entry: 'nao-e-array' })).toEqual([])
    expect(extrairMensagensWhatsappCloud({ entry: [{ changes: 'nao-e-array' }] })).toEqual([])
  })
})
