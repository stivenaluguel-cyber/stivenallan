import { describe, it, expect } from 'vitest'
import {
  checklistAnalise,
  ehTipoValido,
  formatarTamanho,
  labelDoTipo,
  montarCaminho,
  TAMANHO_MAXIMO_BYTES,
  TAMANHO_MAXIMO_IMAGEM_BYTES,
  validarArquivo,
} from './tipos'

describe('validarArquivo', () => {
  it('aceita PDF dentro do limite', () => {
    expect(validarArquivo('rg.pdf', 'application/pdf', 500_000)).toEqual({ ok: true })
  })

  it('recusa formato fora da lista', () => {
    const r = validarArquivo('planilha.xlsx', 'application/vnd.ms-excel', 1000)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toMatch(/Formato não aceito/)
  })

  it('recusa arquivo sem nome', () => {
    expect(validarArquivo('  ', 'application/pdf', 1000).ok).toBe(false)
  })

  it('recusa arquivo vazio', () => {
    expect(validarArquivo('vazio.pdf', 'application/pdf', 0).ok).toBe(false)
  })

  it('imagem tem teto menor que documento', () => {
    const tamanho = TAMANHO_MAXIMO_IMAGEM_BYTES + 1
    expect(validarArquivo('foto.jpg', 'image/jpeg', tamanho).ok).toBe(false)
    // O mesmo tamanho passa como PDF, que tem limite de 30 MB.
    expect(validarArquivo('doc.pdf', 'application/pdf', tamanho).ok).toBe(true)
  })

  it('recusa documento acima de 30 MB', () => {
    expect(validarArquivo('contrato.pdf', 'application/pdf', TAMANHO_MAXIMO_BYTES + 1).ok).toBe(false)
  })

  it('mensagem de erro traz os dois tamanhos em formato legível', () => {
    const r = validarArquivo('foto.png', 'image/png', 12 * 1024 * 1024)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toContain('MB')
  })
})

describe('montarCaminho', () => {
  it('não coloca o nome original do arquivo no caminho', () => {
    const caminho = montarCaminho(
      { leadId: 'lead-1' },
      'cpf',
      'application/pdf',
      'abc123',
    )
    expect(caminho).toBe('leads/lead-1/cpf-abc123.pdf')
    expect(caminho).not.toContain('joao')
  })

  it('separa por proposta quando o anexo não é de lead', () => {
    expect(montarCaminho({ propostaId: 'prop-9' }, 'contrato', 'image/jpeg', 'x1')).toBe(
      'propostas/prop-9/contrato-x1.jpg',
    )
  })

  it('mime desconhecido vira extensão bin em vez de quebrar', () => {
    expect(montarCaminho({ leadId: 'l' }, 'outro', 'application/zip', 'z')).toBe('leads/l/outro-z.bin')
  })

  it('extensão sai do mime, não do nome enviado pelo cliente', () => {
    expect(montarCaminho({ leadId: 'l' }, 'cpf', 'image/png', 's')).toMatch(/\.png$/)
  })
})

describe('checklistAnalise', () => {
  it('lista vazia devolve os cinco exigidos como pendentes', () => {
    const c = checklistAnalise([])
    expect(c.total).toBe(5)
    expect(c.entregues).toBe(0)
    expect(c.completo).toBe(false)
    expect(c.faltando).toHaveLength(5)
  })

  it('conta só os documentos exigidos na análise', () => {
    // Contrato e comprovante de pagamento vêm DEPOIS da aprovação; não
    // podem contar como progresso da análise de crédito.
    const c = checklistAnalise([{ tipo: 'contrato' }, { tipo: 'comprovante_pagamento' }])
    expect(c.entregues).toBe(0)
    expect(c.completo).toBe(false)
  })

  it('fecha o checklist com os cinco exigidos', () => {
    const c = checklistAnalise([
      { tipo: 'documento_identidade' },
      { tipo: 'cpf' },
      { tipo: 'comprovante_renda' },
      { tipo: 'comprovante_residencia' },
      { tipo: 'certidao' },
    ])
    expect(c.completo).toBe(true)
    expect(c.faltando).toEqual([])
  })

  it('dois arquivos do mesmo tipo contam como um item entregue', () => {
    const c = checklistAnalise([{ tipo: 'cpf' }, { tipo: 'cpf' }, { tipo: 'cpf' }])
    expect(c.entregues).toBe(1)
  })

  it('nomeia o que falta em vez de só devolver a contagem', () => {
    const c = checklistAnalise([{ tipo: 'cpf' }])
    expect(c.faltando).toContain('Comprovante de renda')
    expect(c.faltando).not.toContain('CPF')
  })
})

describe('tipos e formatação', () => {
  it('reconhece tipo válido e rejeita inventado', () => {
    expect(ehTipoValido('comprovante_renda')).toBe(true)
    expect(ehTipoValido('selfie_com_documento')).toBe(false)
    expect(ehTipoValido(null)).toBe(false)
  })

  it('tipo desconhecido cai em Outro em vez de quebrar a tela', () => {
    expect(labelDoTipo('inexistente')).toBe('Outro')
    expect(labelDoTipo('cpf')).toBe('CPF')
  })

  it('formata tamanho em B, KB e MB', () => {
    expect(formatarTamanho(500)).toBe('500 B')
    expect(formatarTamanho(2048)).toBe('2 KB')
    expect(formatarTamanho(5 * 1024 * 1024)).toBe('5.0 MB')
    expect(formatarTamanho(null)).toBe('—')
    expect(formatarTamanho(0)).toBe('—')
  })
})
