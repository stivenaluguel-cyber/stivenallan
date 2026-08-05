import { describe, expect, it } from 'vitest'
import {
  primeiroCampoInvalido,
  validarCampoLeadGate,
  validarFormularioCompleto,
  type ValoresLeadGate,
} from './validation'

const VALORES_VALIDOS: ValoresLeadGate = {
  nome: 'Ana Maria',
  whatsapp: '48991642332',
  email: 'ana@example.com',
  faixaInvestimento: 'R$ 900 mil a R$ 1,2 milhão',
  prazoCompra: '3 a 6 meses',
  entradaDisponivel: '20% a 29%',
  consentimento: true,
}

describe('validarCampoLeadGate', () => {
  it('nome: rejeita vazio/curto com mensagem especifica', () => {
    expect(validarCampoLeadGate('nome', '')).toBe('Digite seu nome completo')
    expect(validarCampoLeadGate('nome', 'A')).toBe('Digite seu nome completo')
    expect(validarCampoLeadGate('nome', 'Ana')).toBeNull()
  })

  it('whatsapp: aceita 10-11 digitos com ou sem +55, rejeita o resto', () => {
    expect(validarCampoLeadGate('whatsapp', '')).toMatch(/whatsapp/i)
    expect(validarCampoLeadGate('whatsapp', '123')).toMatch(/whatsapp/i)
    expect(validarCampoLeadGate('whatsapp', '48991642332')).toBeNull()
    expect(validarCampoLeadGate('whatsapp', '4832211234')).toBeNull() // 10 digitos (fixo aceito na validacao de forma, so tamanho)
    expect(validarCampoLeadGate('whatsapp', '5548991642332')).toBeNull() // com +55
  })

  it('email: valida formato basico com mensagem especifica', () => {
    expect(validarCampoLeadGate('email', '')).toBe('Digite um e-mail válido')
    expect(validarCampoLeadGate('email', 'nao-e-email')).toBe('Digite um e-mail válido')
    expect(validarCampoLeadGate('email', 'ana@example.com')).toBeNull()
  })

  it('selects obrigatorios: cada um com mensagem propria', () => {
    expect(validarCampoLeadGate('faixaInvestimento', '')).toBe('Selecione a faixa de investimento')
    expect(validarCampoLeadGate('prazoCompra', '')).toBe('Selecione quando pretende comprar')
    expect(validarCampoLeadGate('entradaDisponivel', '')).toBe('Selecione a entrada disponível')
  })

  it('consentimento: so aceita true explicito, nunca truthy generico', () => {
    expect(validarCampoLeadGate('consentimento', false)).toMatch(/concordar/i)
    expect(validarCampoLeadGate('consentimento', true)).toBeNull()
  })
})

describe('primeiroCampoInvalido', () => {
  it('null quando tudo valido', () => {
    expect(primeiroCampoInvalido(VALORES_VALIDOS)).toBeNull()
  })

  it('respeita a ordem de exibicao do formulario', () => {
    expect(primeiroCampoInvalido({ ...VALORES_VALIDOS, email: '', entradaDisponivel: '' })).toBe('email')
    expect(primeiroCampoInvalido({ ...VALORES_VALIDOS, entradaDisponivel: '' })).toBe('entradaDisponivel')
  })
})

describe('validarFormularioCompleto', () => {
  it('objeto vazio quando tudo valido', () => {
    expect(validarFormularioCompleto(VALORES_VALIDOS)).toEqual({})
  })

  it('acumula todos os erros, nao so o primeiro', () => {
    const erros = validarFormularioCompleto({ ...VALORES_VALIDOS, nome: '', email: '', consentimento: false })
    expect(Object.keys(erros).sort()).toEqual(['consentimento', 'email', 'nome'])
  })
})
