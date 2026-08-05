// Validação pura do LeadUnlockForm — nunca "return silencioso": toda rejeição
// devolve uma mensagem específica, usada tanto pro aria-live quanto pra decidir
// o primeiro campo a focar.

export type CampoLeadGate =
  | 'nome'
  | 'whatsapp'
  | 'email'
  | 'faixaInvestimento'
  | 'prazoCompra'
  | 'entradaDisponivel'
  | 'consentimento'

export const CAMPOS_LEAD_GATE_ORDEM: CampoLeadGate[] = [
  'nome',
  'whatsapp',
  'email',
  'faixaInvestimento',
  'prazoCompra',
  'entradaDisponivel',
  'consentimento',
]

export type ValoresLeadGate = Record<CampoLeadGate, string | boolean>

function whatsappValido(valor: string): boolean {
  const digitos = valor.replace(/\D/g, '')
  const semPais = digitos.length > 11 && digitos.startsWith('55') ? digitos.slice(2) : digitos
  return semPais.length >= 10 && semPais.length <= 11
}

function emailValido(valor: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim())
}

export function validarCampoLeadGate(campo: CampoLeadGate, valor: string | boolean): string | null {
  switch (campo) {
    case 'nome':
      return typeof valor === 'string' && valor.trim().length >= 2 ? null : 'Digite seu nome completo'
    case 'whatsapp':
      return typeof valor === 'string' && whatsappValido(valor) ? null : 'Digite um WhatsApp válido, com DDD'
    case 'email':
      return typeof valor === 'string' && emailValido(valor) ? null : 'Digite um e-mail válido'
    case 'faixaInvestimento':
      return typeof valor === 'string' && valor.trim() !== '' ? null : 'Selecione a faixa de investimento'
    case 'prazoCompra':
      return typeof valor === 'string' && valor.trim() !== '' ? null : 'Selecione quando pretende comprar'
    case 'entradaDisponivel':
      return typeof valor === 'string' && valor.trim() !== '' ? null : 'Selecione a entrada disponível'
    case 'consentimento':
      return valor === true ? null : 'É necessário concordar com os termos para continuar'
  }
}

// Primeiro campo com erro, na ordem de exibição do formulário — usado pra
// decidir o foco após uma tentativa de envio inválida.
export function primeiroCampoInvalido(valores: ValoresLeadGate): CampoLeadGate | null {
  for (const campo of CAMPOS_LEAD_GATE_ORDEM) {
    if (validarCampoLeadGate(campo, valores[campo])) return campo
  }
  return null
}

export function validarFormularioCompleto(valores: ValoresLeadGate): Partial<Record<CampoLeadGate, string>> {
  const erros: Partial<Record<CampoLeadGate, string>> = {}
  for (const campo of CAMPOS_LEAD_GATE_ORDEM) {
    const erro = validarCampoLeadGate(campo, valores[campo])
    if (erro) erros[campo] = erro
  }
  return erros
}
