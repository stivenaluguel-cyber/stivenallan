import { describe, it, expect } from 'vitest'
import { montarPromptSocio, parseSugestoes, ultimaMensagemDoLead, type MensagemSocio } from './socio'

const conversa: MensagemSocio[] = [
  { direcao: 'saida', mensagem: 'Olá, João! Tudo bem?' },
  { direcao: 'entrada', mensagem: 'oi, tudo. queria saber do Pineto' },
  { direcao: 'saida', mensagem: 'Claro, te mando os detalhes.' },
  { direcao: 'entrada', mensagem: 'quanto fica a entrada?' },
]

describe('ultimaMensagemDoLead', () => {
  it('pega a última fala do lead, não a do corretor', () => {
    expect(ultimaMensagemDoLead(conversa)).toBe('quanto fica a entrada?')
  })

  it('devolve null quando só o corretor falou', () => {
    expect(ultimaMensagemDoLead([{ direcao: 'saida', mensagem: 'Oi!' }])).toBeNull()
  })

  it('ignora mensagem de entrada vazia', () => {
    expect(ultimaMensagemDoLead([{ direcao: 'entrada', mensagem: '   ' }])).toBeNull()
  })

  it('devolve null com histórico vazio', () => {
    expect(ultimaMensagemDoLead([])).toBeNull()
  })
})

describe('montarPromptSocio', () => {
  it('leva o contexto comercial do lead pro prompt', () => {
    const prompt = montarPromptSocio({
      lead: {
        nome: 'João Carlos Silva',
        estagio_funil: 'interessado',
        temperatura: 3,
        orcamento_max: 480000,
        empreendimentos: { nome: 'Pineto' },
      },
      mensagem: 'quanto fica a entrada?',
      historico: conversa,
    })
    expect(prompt).toContain('Primeiro nome: João')
    expect(prompt).toContain('Estágio no funil: Interessado')
    expect(prompt).toContain('Temperatura: quente')
    expect(prompt).toContain('Empreendimento de interesse: Pineto')
    expect(prompt).toContain('R$ 480.000')
    expect(prompt).toContain('quanto fica a entrada?')
  })

  it('não inventa linha de contexto quando o campo está vazio', () => {
    const prompt = montarPromptSocio({ lead: {}, mensagem: 'oi' })
    expect(prompt).toContain('(nenhum dado além da conversa)')
    expect(prompt).toContain('(sem histórico registrado no painel)')
    expect(prompt).not.toContain('Orçamento máximo')
  })

  // Nome de uma letra vira ruído no prompt ("Primeiro nome: J") e o modelo
  // passa a chamar o cliente pela inicial.
  it('descarta primeiro nome de uma letra só', () => {
    const prompt = montarPromptSocio({ lead: { nome: 'J Silva' }, mensagem: 'oi' })
    expect(prompt).not.toContain('Primeiro nome')
  })

  // O join do supabase-js é tipado como array; o PostgREST devolve objeto.
  it('lê o empreendimento nas duas formas do join', () => {
    const comArray = montarPromptSocio({ lead: { empreendimentos: [{ nome: 'Thiene' }] }, mensagem: 'oi' })
    expect(comArray).toContain('Empreendimento de interesse: Thiene')
    const vazio = montarPromptSocio({ lead: { empreendimentos: [] }, mensagem: 'oi' })
    expect(vazio).not.toContain('Empreendimento de interesse')
  })

  it('property_name serve de interesse quando não há empreendimento ligado', () => {
    const prompt = montarPromptSocio({ lead: { property_name: 'Villa Di Sois' }, mensagem: 'oi' })
    expect(prompt).toContain('Empreendimento de interesse: Villa Di Sois')
  })

  it('corta o histórico nas últimas 8 mensagens', () => {
    const longo: MensagemSocio[] = Array.from({ length: 12 }, (_, i) => ({
      direcao: 'entrada' as const,
      mensagem: 'msg-' + i,
    }))
    const prompt = montarPromptSocio({ lead: {}, mensagem: 'oi', historico: longo })
    expect(prompt).not.toContain('msg-3')
    expect(prompt).toContain('msg-4')
    expect(prompt).toContain('msg-11')
  })
})

describe('parseSugestoes', () => {
  it('separa os três tons', () => {
    const r = parseSugestoes(`<<<DIRETO>>>
Depende da unidade, João. Me diz qual planta te interessa que eu te passo a entrada certinha hoje.
<<<FIRME>>>
A entrada varia por unidade e as melhores saem primeiro. Consegue me dizer hoje qual planta você quer?
<<<LEVE>>>
Boa pergunta! Varia conforme a unidade. Quer que eu te mande as opções pra você dar uma olhada com calma?`)
    expect(r).toHaveLength(3)
    expect(r.map((s) => s.tom)).toEqual(['direto', 'firme', 'leve'])
    expect(r[0].texto).toMatch(/^Depende da unidade/)
  })

  it('ignora conversa fiada antes do primeiro marcador', () => {
    const r = parseSugestoes('Claro! Aqui vão as três opções:\n<<<DIRETO>>>\nTexto direto.')
    expect(r).toHaveLength(1)
    expect(r[0].texto).toBe('Texto direto.')
  })

  it('tira aspas e negrito que o modelo às vezes adiciona', () => {
    const r = parseSugestoes('<<<DIRETO>>>\n**"Bom dia! Posso te ligar agora?"**')
    expect(r[0].texto).toBe('Bom dia! Posso te ligar agora?')
  })

  it('remove o rótulo entre parênteses quando o modelo copia o formato do prompt', () => {
    const r = parseSugestoes('<<<LEVE>>>\n(descontraída, tira a pressão) Sem pressa, tá? Me chama quando quiser.')
    expect(r[0].texto).toBe('Sem pressa, tá? Me chama quando quiser.')
  })

  it('aceita marcador em minúsculo', () => {
    expect(parseSugestoes('<<<direto>>>\nOi.')[0].tom).toBe('direto')
  })

  it('fica com a primeira ocorrência quando o tom vem repetido', () => {
    const r = parseSugestoes('<<<DIRETO>>>\nPrimeira.\n<<<DIRETO>>>\nSegunda.')
    expect(r).toHaveLength(1)
    expect(r[0].texto).toBe('Primeira.')
  })

  it('descarta tom sem texto', () => {
    const r = parseSugestoes('<<<DIRETO>>>\nTem texto.\n<<<FIRME>>>\n   ')
    expect(r).toHaveLength(1)
  })

  it('devolve lista vazia quando o modelo ignora o formato', () => {
    expect(parseSugestoes('Desculpe, não posso ajudar.')).toEqual([])
    expect(parseSugestoes('')).toEqual([])
  })
})
