import { describe, expect, it } from 'vitest'
import { htmlParaTexto } from './resend'

describe('htmlParaTexto', () => {
  it('converte parágrafos em linhas separadas por linha em branco', () => {
    const html = '<p>Olá João,</p><p>Segundo parágrafo.</p>'
    const texto = htmlParaTexto(html)
    expect(texto).toBe('Olá João,\n\nSegundo parágrafo.')
  })

  it('converte link em "texto (url)"', () => {
    const html = '<p>Veja <a href="https://stivenallan.com.br">o site</a> aqui.</p>'
    const texto = htmlParaTexto(html)
    expect(texto).toContain('o site (https://stivenallan.com.br)')
  })

  it('remove tags de estilo inteiras', () => {
    const html = '<style>.x{color:red}</style><p>Texto</p>'
    expect(htmlParaTexto(html)).toBe('Texto')
  })

  it('decodifica entidades HTML comuns', () => {
    const html = '<p>Investimento &gt; R$100 &amp; sem taxa &quot;oculta&quot;</p>'
    expect(htmlParaTexto(html)).toBe('Investimento > R$100 & sem taxa "oculta"')
  })

  it('colapsa 3+ quebras de linha em no máximo 2', () => {
    const html = '<p>A</p><div></div><div></div><p>B</p>'
    const texto = htmlParaTexto(html)
    expect(texto).not.toMatch(/\n{3,}/)
  })

  it('remove tags remanescentes sem deixar lixo', () => {
    const html = '<div style="padding:10px"><strong>Negrito</strong> normal</div>'
    expect(htmlParaTexto(html)).toBe('Negrito normal')
  })
})
