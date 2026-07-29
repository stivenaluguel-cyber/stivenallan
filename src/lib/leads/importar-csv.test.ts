import { describe, it, expect } from 'vitest'
import {
  detectarSeparador,
  dividirLinha,
  normalizarTelefoneImportado,
  paraInsert,
  parsearCsvLeads,
} from './importar-csv'

describe('detectarSeparador', () => {
  it('reconhece ponto e vírgula, que é o padrão do Excel em português', () => {
    expect(detectarSeparador('nome;telefone;email')).toBe(';')
  })

  it('reconhece vírgula', () => {
    expect(detectarSeparador('nome,telefone,email')).toBe(',')
  })

  it('reconhece tabulação', () => {
    expect(detectarSeparador('nome\ttelefone\temail')).toBe('\t')
  })
})

describe('dividirLinha', () => {
  it('respeita aspas e não quebra nome com vírgula dentro', () => {
    expect(dividirLinha('"Silva, João",48999998888', ',')).toEqual(['Silva, João', '48999998888'])
  })

  it('trata aspas duplas escapadas', () => {
    expect(dividirLinha('"disse ""oi""",123', ',')).toEqual(['disse "oi"', '123'])
  })

  it('preserva colunas vazias para não desalinhar a linha', () => {
    expect(dividirLinha('a,,c', ',')).toEqual(['a', '', 'c'])
  })
})

describe('normalizarTelefoneImportado', () => {
  it('aceita celular com 11 dígitos', () => {
    expect(normalizarTelefoneImportado('(48) 99999-8888')).toBe('48999998888')
  })

  it('aceita fixo com 10 dígitos', () => {
    expect(normalizarTelefoneImportado('4834334455')).toBe('4834334455')
  })

  it('remove o 55 do país que vem em export de WhatsApp', () => {
    expect(normalizarTelefoneImportado('5548999998888')).toBe('48999998888')
  })

  it('rejeita número curto demais para ter DDD', () => {
    expect(normalizarTelefoneImportado('99998888')).toBeNull()
  })

  it('rejeita texto sem dígitos', () => {
    expect(normalizarTelefoneImportado('sem telefone')).toBeNull()
    expect(normalizarTelefoneImportado(null)).toBeNull()
  })
})

describe('parsearCsvLeads — reconhecimento de colunas', () => {
  it('reconhece cabeçalho por sinônimo, acento e maiúscula', () => {
    const r = parsearCsvLeads('Nome;Celular;E-mail;Cidade\nJoão;48999998888;a@b.com;Criciúma')
    expect(Object.values(r.colunasReconhecidas)).toContain('whatsapp')
    expect(r.linhas[0].nome).toBe('João')
    expect(r.linhas[0].email).toBe('a@b.com')
    expect(r.linhas[0].cidade_interesse).toBe('Criciúma')
  })

  it('remove o BOM do Excel do primeiro cabeçalho', () => {
    const r = parsearCsvLeads('﻿nome;telefone\nAna;48999998888')
    expect(Object.values(r.colunasReconhecidas)).toContain('nome')
    expect(r.linhas).toHaveLength(1)
  })

  it('lista as colunas que não soube mapear em vez de descartar em silêncio', () => {
    const r = parsearCsvLeads('nome;telefone;corretor_antigo\nAna;48999998888;Pedro')
    expect(r.colunasIgnoradas).toContain('corretor_antigo')
  })

  it('a primeira coluna de telefone vence quando há duas', () => {
    const r = parsearCsvLeads('telefone;celular\n48111112222;48999998888')
    expect(r.linhas[0].whatsapp).toBe('48111112222')
  })

  it('arquivo só com cabeçalho não produz linha nem erro', () => {
    const r = parsearCsvLeads('nome;telefone')
    expect(r.total).toBe(0)
    expect(r.linhas).toEqual([])
  })

  it('arquivo vazio devolve resultado vazio em vez de quebrar', () => {
    expect(parsearCsvLeads('').total).toBe(0)
  })
})

describe('parsearCsvLeads — linhas', () => {
  it('rejeita linha sem telefone e informa o número que o corretor vê no Excel', () => {
    const r = parsearCsvLeads('nome;telefone\nAna;48999998888\nSem Telefone;\nBia;48988887777')
    expect(r.linhas).toHaveLength(2)
    expect(r.rejeitadas).toHaveLength(1)
    // Linha 1 é o cabeçalho, então "Sem Telefone" é a linha 3.
    expect(r.rejeitadas[0].linha).toBe(3)
    expect(r.rejeitadas[0].motivo).toMatch(/telefone/i)
  })

  it('duplicata no arquivo é contada, não rejeitada, e a primeira ocorrência vence', () => {
    const r = parsearCsvLeads('nome;telefone\nAna;48999998888\nAna Repetida;(48) 99999-8888')
    expect(r.linhas).toHaveLength(1)
    expect(r.linhas[0].nome).toBe('Ana')
    expect(r.duplicadasNoArquivo).toBe(1)
    expect(r.rejeitadas).toHaveLength(0)
  })

  it('converte moeda em pt-BR sem inflar o valor', () => {
    const r = parsearCsvLeads('telefone;orcamento\n48999998888;"R$ 350.000,00"')
    expect(r.linhas[0].orcamento_max).toBe(350000)
  })

  it('orçamento não numérico vira null em vez de zero', () => {
    const r = parsearCsvLeads('telefone;orcamento\n48999998888;a combinar')
    expect(r.linhas[0].orcamento_max).toBeNull()
  })

  it('campo em branco vira null e não string vazia', () => {
    const r = parsearCsvLeads('telefone;nome;email\n48999998888;;   ')
    expect(r.linhas[0].nome).toBeNull()
    expect(r.linhas[0].email).toBeNull()
  })

  it('aceita quebra de linha do Windows', () => {
    const r = parsearCsvLeads('telefone\r\n48999998888\r\n48988887777')
    expect(r.linhas).toHaveLength(2)
  })

  it('total conta as linhas do arquivo, não as aproveitadas', () => {
    const r = parsearCsvLeads('telefone\n48999998888\nlixo\n48988887777')
    expect(r.total).toBe(3)
    expect(r.linhas).toHaveLength(2)
    expect(r.rejeitadas).toHaveLength(1)
  })
})

describe('paraInsert', () => {
  const agora = '2026-07-29T12:00:00.000Z'

  it('marca origem "importacao" quando a planilha não traz o campo', () => {
    const r = parsearCsvLeads('telefone;nome\n48999998888;Ana')
    expect(paraInsert(r.linhas[0], agora).origem).toBe('importacao')
  })

  it('preserva a origem informada na planilha', () => {
    const r = parsearCsvLeads('telefone;origem\n48999998888;indicacao')
    expect(paraInsert(r.linhas[0], agora).origem).toBe('indicacao')
  })

  it('lead importado entra no início do funil e com status novo', () => {
    const r = parsearCsvLeads('telefone\n48999998888')
    const insert = paraInsert(r.linhas[0], agora)
    expect(insert.estagio_funil).toBe('primeiro_contato')
    expect(insert.status).toBe('novo')
    expect(insert.created_at).toBe(agora)
  })

  it('não gera a chave `linha` do parse no insert', () => {
    const r = parsearCsvLeads('telefone\n48999998888')
    expect('linha' in paraInsert(r.linhas[0], agora)).toBe(false)
  })
})
