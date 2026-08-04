import { describe, expect, it } from 'vitest'
import { enderecoResumido } from './formatacao'

describe('enderecoResumido', () => {
  it('extrai "Cidade - UF" de um endereço completo do Google Places', () => {
    expect(enderecoResumido('Av. Luiz Lazzarin, 260 - Rio Maina, Criciúma - SC, 88817-045')).toBe('Criciúma - SC')
  })

  it('funciona mesmo sem o CEP no final', () => {
    expect(enderecoResumido('R. Exemplo, 10 - Centro, Içara - SC')).toBe('Içara - SC')
  })

  it('corta o endereço quando não reconhece o padrão "Cidade - UF"', () => {
    const longo = 'Um endereço qualquer sem o padrão esperado de jeito nenhum aqui'
    expect(enderecoResumido(longo)).toBe(longo.slice(0, 40) + '…')
  })

  it('devolve travessão para endereço ausente', () => {
    expect(enderecoResumido(null)).toBe('—')
    expect(enderecoResumido(undefined)).toBe('—')
    expect(enderecoResumido('')).toBe('—')
  })
})
