import { describe, expect, it } from 'vitest'
import { linkWhatsappProspeccao, mensagemWhatsAppProspeccao } from './whatsapp'

describe('mensagemWhatsAppProspeccao', () => {
  it('monta a mensagem com o nome da empresa e a primeira frase do produto', () => {
    const msg = mensagemWhatsAppProspeccao(
      'Duda Imóveis',
      'Rede de parceria para corretores: repasso empreendimentos na planta com financiamento direto.',
    )
    expect(msg).toBe(
      'Olá! Tudo bem? Encontrei a Duda Imóveis pesquisando parceiros — Rede de parceria para corretores: repasso empreendimentos na planta com financiamento direto. Faz sentido conversarmos?',
    )
  })

  it('corta no primeiro ponto final — não arrasta a segunda frase do produto', () => {
    const msg = mensagemWhatsAppProspeccao('Empresa X', 'Primeira frase. Segunda frase que não devia aparecer.')
    expect(msg).toContain('Primeira frase')
    expect(msg).not.toContain('Segunda frase')
  })

  it('corta produto muito longo em vez de estourar o tamanho da mensagem', () => {
    const produtoLongo = 'A'.repeat(300)
    const msg = mensagemWhatsAppProspeccao('Empresa X', produtoLongo)
    expect(msg.length).toBeLessThan(250)
    expect(msg).toContain('…')
  })

  it('sem produto (string vazia), ainda monta uma mensagem válida sem travessão solto', () => {
    const msg = mensagemWhatsAppProspeccao('Empresa X', '')
    expect(msg).toBe('Olá! Tudo bem? Encontrei a Empresa X pesquisando parceiros. Faz sentido conversarmos?')
  })
})

describe('linkWhatsappProspeccao', () => {
  it('monta o link wa.me com o texto codificado quando o telefone é celular', () => {
    const link = linkWhatsappProspeccao('(48) 99164-2332', 'Duda Imóveis', 'Financiamento direto.')
    expect(link).toContain('https://wa.me/5548991642332?text=')
    expect(link).toContain(encodeURIComponent('Duda Imóveis'))
  })

  it('devolve null pra telefone fixo — fixo não recebe WhatsApp', () => {
    expect(linkWhatsappProspeccao('(48) 3431-0600', 'Empresa X', 'x')).toBeNull()
  })

  it('devolve null sem telefone', () => {
    expect(linkWhatsappProspeccao(null, 'Empresa X', 'x')).toBeNull()
  })
})
