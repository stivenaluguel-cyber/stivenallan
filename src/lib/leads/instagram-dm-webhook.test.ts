import { describe, expect, it } from 'vitest'
import { extrairMensagensInstagram } from './instagram-dm-webhook'

describe('extrairMensagensInstagram', () => {
  it('extrai sender, texto, mid e timestamp de uma mensagem real', () => {
    const payload = {
      entry: [
        {
          messaging: [
            { sender: { id: 'igsid-1' }, timestamp: 1700000000, message: { mid: 'mid-1', text: 'Oi, tenho interesse' } },
          ],
        },
      ],
    }
    expect(extrairMensagensInstagram(payload)).toEqual([
      { senderId: 'igsid-1', texto: 'Oi, tenho interesse', mid: 'mid-1', timestamp: 1700000000 },
    ])
  })

  it('ignora echoes (a propria pagina respondendo)', () => {
    const payload = {
      entry: [{ messaging: [{ sender: { id: 'page-1' }, message: { is_echo: true, text: 'Resposta automatica' } }] }],
    }
    expect(extrairMensagensInstagram(payload)).toEqual([])
  })

  it('ignora eventos sem texto (reacoes, anexos sem legenda)', () => {
    const payload = { entry: [{ messaging: [{ sender: { id: 'igsid-1' }, message: {} }] }] }
    expect(extrairMensagensInstagram(payload)).toEqual([])
  })

  it('extrai varias mensagens de varios entries', () => {
    const payload = {
      entry: [
        { messaging: [{ sender: { id: 'igsid-1' }, message: { text: 'msg 1' } }] },
        { messaging: [{ sender: { id: 'igsid-2' }, message: { text: 'msg 2' } }] },
      ],
    }
    expect(extrairMensagensInstagram(payload).map((m) => m.senderId)).toEqual(['igsid-1', 'igsid-2'])
  })

  it('lida com payload vazio/malformado sem lancar excecao', () => {
    expect(extrairMensagensInstagram(null)).toEqual([])
    expect(extrairMensagensInstagram({})).toEqual([])
    expect(extrairMensagensInstagram({ entry: 'nao-e-array' })).toEqual([])
  })
})
