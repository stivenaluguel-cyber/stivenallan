import { afterEach, describe, expect, it, vi } from 'vitest'
import { primeiroNome, mensagemWhatsApp, montarLinkWhatsApp, abrirWhatsApp } from './focus-whatsapp'

describe('primeiroNome', () => {
  it('extrai o primeiro nome', () => {
    expect(primeiroNome('Maria Aparecida Souza')).toBe('Maria')
  })

  it('devolve null (não um fallback que vira saudação) quando não há nome', () => {
    expect(primeiroNome(null)).toBeNull()
    expect(primeiroNome('')).toBeNull()
    expect(primeiroNome('   ')).toBeNull()
    expect(primeiroNome('J')).toBeNull()
  })
})

describe('mensagemWhatsApp', () => {
  const lead = { nome: 'Carlos Silva', whatsapp: '5548999999999', empreendimentos: { nome: 'Monte Leone' } }

  it('usa o primeiro nome e o interesse real do lead', () => {
    const msg = mensagemWhatsApp(lead, { followupVencido: true })
    expect(msg).toContain('Olá, Carlos!')
    expect(msg).toContain('Monte Leone')
  })

  it('lead SEM nome não gera "Olá, tudo bem! Tudo bem?"', () => {
    const msg = mensagemWhatsApp({ nome: null, whatsapp: '5548999999999' }, { nuncaContatado: true })
    expect(msg).toBe('Olá! Tudo bem? Sou da Stiven Allan. Vi seu interesse e estou à disposição para te ajudar.')
    expect(msg).not.toMatch(/tudo bem.*tudo bem/i)
  })

  it('sem empreendimento não inventa imóvel', () => {
    const msg = mensagemWhatsApp({ nome: 'Ana', whatsapp: '5548999999999' }, { quente: true })
    expect(msg).not.toContain('undefined')
    expect(msg).not.toContain('sobre o ')
  })

  it('a mensagem reflete o motivo real, na mesma ordem de prioridade', () => {
    expect(mensagemWhatsApp(lead, { followupVencido: true, agendaVencida: true })).toContain('retomar nosso contato')
    expect(mensagemWhatsApp(lead, { agendaVencida: true })).toContain('compromisso ficou pendente')
    expect(mensagemWhatsApp(lead, {})).toContain('ainda faz sentido conversarmos')
  })
})

describe('montarLinkWhatsApp', () => {
  it('prefixa 55 quando falta e monta o link', () => {
    expect(montarLinkWhatsApp('48999999999', 'oi')).toBe('https://wa.me/5548999999999?text=oi')
  })

  it('não duplica o 55 quando já existe', () => {
    expect(montarLinkWhatsApp('5548999999999', 'oi')).toBe('https://wa.me/5548999999999?text=oi')
  })

  it('lead do Instagram (placeholder ig:) nunca gera link de WhatsApp', () => {
    expect(montarLinkWhatsApp('ig:17841400000000000', 'oi')).toBeNull()
  })

  it('escapa o texto', () => {
    expect(montarLinkWhatsApp('5548999999999', 'olá & tudo bem?')).toContain('ol%C3%A1%20%26%20tudo%20bem%3F')
  })
})

describe('abrirWhatsApp', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('detecta pop-up bloqueado quando window.open devolve null', () => {
    vi.stubGlobal('window', { open: () => null })
    expect(abrirWhatsApp('https://wa.me/5548999999999').popupBloqueado).toBe(true)
  })

  it('detecta pop-up bloqueado quando a janela já vem fechada', () => {
    vi.stubGlobal('window', { open: () => ({ closed: true }) })
    expect(abrirWhatsApp('https://wa.me/5548999999999').popupBloqueado).toBe(true)
  })

  it('reporta sucesso quando a janela abre', () => {
    vi.stubGlobal('window', { open: () => ({ closed: false }) })
    expect(abrirWhatsApp('https://wa.me/5548999999999').popupBloqueado).toBe(false)
  })
})
