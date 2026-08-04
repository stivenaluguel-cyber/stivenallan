import { describe, expect, it } from 'vitest'
import { buildLeadTimeline, parseAnotacoesLegadas } from './lead-timeline'

describe('parseAnotacoesLegadas', () => {
  it('lê o formato JSON array antigo', () => {
    const raw = JSON.stringify([{ data: '2026-01-01T00:00:00Z', texto: 'antiga' }])
    expect(parseAnotacoesLegadas(raw)).toHaveLength(1)
  })

  it('lê anotação legada em texto puro (formato de outra tela) sem quebrar', () => {
    const notas = parseAnotacoesLegadas('anotação escrita como texto solto')
    expect(notas).toHaveLength(1)
    expect(notas[0].texto).toBe('anotação escrita como texto solto')
  })

  it('vazio/nulo não gera item', () => {
    expect(parseAnotacoesLegadas(null)).toHaveLength(0)
    expect(parseAnotacoesLegadas('')).toHaveLength(0)
  })
})

describe('buildLeadTimeline', () => {
  it('combina todas as fontes numa linha do tempo cronológica (mais recente primeiro)', () => {
    const timeline = buildLeadTimeline({
      anotacoesLegadas: JSON.stringify([{ data: '2026-07-01T10:00:00Z', texto: 'nota antiga' }]),
      interacoesLead: [
        { id: 'i1', tipo: 'status_change', descricao: 'Movido de qualificado para interessado', created_at: '2026-07-05T10:00:00Z' },
        { id: 'i2', tipo: 'nota', descricao: 'nota nova', created_at: '2026-07-06T10:00:00Z' },
      ],
      mensagens: [{ id: 'm1', canal: 'whatsapp', direcao: 'entrada', mensagem: 'oi', created_at: '2026-07-04T10:00:00Z' }],
      agenda: [{ id: 'a1', titulo: 'Visita', tipo: 'visita', inicio: '2026-07-07T10:00:00Z', status: 'agendado' }],
      eventosFoco: [{ id: 'f1', action_type: 'contato_confirmado', created_at: '2026-07-03T10:00:00Z' }],
    })

    expect(timeline.map((t) => t.kind)).toEqual([
      'compromisso', 'anotacao', 'mudanca_etapa', 'mensagem', 'contato', 'anotacao',
    ])
    expect(timeline[0].data).toBe('2026-07-07T10:00:00Z')
    expect(timeline[timeline.length - 1].descricao).toBe('nota antiga')
  })

  it('não duplica visualmente: ação do Modo Foco já registrada por outra fonte aparece uma vez só', () => {
    // Uma anotação feita no Modo Foco gera DUAS linhas no banco: a
    // leads_interacoes (com o texto) e o crm_focus_events (o log da ação).
    // Na tela isso tem que aparecer uma vez.
    const timeline = buildLeadTimeline({
      interacoesLead: [{ id: 'i1', tipo: 'nota', descricao: 'anotação feita no foco', created_at: '2026-07-06T10:00:00Z' }],
      eventosFoco: [{ id: 'f1', action_type: 'anotacao', created_at: '2026-07-06T10:00:01Z' }],
    })
    expect(timeline).toHaveLength(1)
    expect(timeline[0].descricao).toBe('anotação feita no foco')
  })

  it('mudança de etapa e proposta também não duplicam com o log do Modo Foco', () => {
    const timeline = buildLeadTimeline({
      interacoesLead: [
        { id: 'i1', tipo: 'status_change', descricao: 'Movido de interessado para proposta_enviada', created_at: '2026-07-06T10:00:00Z' },
        { id: 'i2', tipo: 'proposta', descricao: 'Proposta criada no valor de R$ 500.000', created_at: '2026-07-06T10:01:00Z' },
      ],
      eventosFoco: [
        { id: 'f1', action_type: 'etapa_alterada', created_at: '2026-07-06T10:00:01Z' },
        { id: 'f2', action_type: 'proposta_enviada', created_at: '2026-07-06T10:01:01Z' },
      ],
    })
    expect(timeline).toHaveLength(2)
    expect(timeline.filter((t) => t.origem === 'Modo Foco')).toHaveLength(0)
  })

  it('ações que SÓ existem no Modo Foco continuam aparecendo', () => {
    const timeline = buildLeadTimeline({
      eventosFoco: [
        { id: 'f1', action_type: 'pular', created_at: '2026-07-06T10:00:00Z' },
        { id: 'f2', action_type: 'adiado', created_at: '2026-07-06T11:00:00Z' },
        { id: 'f3', action_type: 'perdido', created_at: '2026-07-06T12:00:00Z', metadata: { motivo: 'sem_interesse' } },
      ],
    })
    expect(timeline).toHaveLength(3)
    expect(timeline[0].titulo).toBe('Marcado como perdido')
    expect(timeline[0].descricao).toBe('sem interesse')
    expect(timeline.map((t) => t.titulo)).toContain('Lead adiado')
  })

  it('mensagens de Instagram aparecem (antes ficavam invisíveis pelo filtro canal=whatsapp)', () => {
    const timeline = buildLeadTimeline({
      mensagens: [{ id: 'm1', canal: 'instagram', direcao: 'entrada', mensagem: 'oi pelo direct', created_at: '2026-07-06T10:00:00Z' }],
    })
    expect(timeline).toHaveLength(1)
    expect(timeline[0].titulo).toBe('Recebida · Instagram')
  })

  it('anotação legada sem data vai para o fim, sem bagunçar a ordem das demais', () => {
    const timeline = buildLeadTimeline({
      anotacoesLegadas: 'nota sem timestamp',
      interacoesLead: [{ id: 'i1', tipo: 'nota', descricao: 'nota com data', created_at: '2026-07-06T10:00:00Z' }],
    })
    expect(timeline[0].descricao).toBe('nota com data')
    expect(timeline[1].descricao).toBe('nota sem timestamp')
  })

  it('lead sem nenhum histórico devolve lista vazia, não quebra', () => {
    expect(buildLeadTimeline({})).toEqual([])
  })

  it('deriva autor: mensagem de entrada é sempre humano (é o lead falando)', () => {
    const timeline = buildLeadTimeline({
      mensagens: [{ id: 'm1', canal: 'whatsapp', direcao: 'entrada', mensagem: 'oi', created_at: '2026-07-06T10:00:00Z', processado_por_ia: true }],
    })
    expect(timeline[0].autor).toBe('humano')
  })

  it('deriva autor: saída com processado_por_ia=true é ia', () => {
    const timeline = buildLeadTimeline({
      mensagens: [{ id: 'm1', canal: 'whatsapp', direcao: 'saida', mensagem: 'resposta do bot', created_at: '2026-07-06T10:00:00Z', processado_por_ia: true }],
    })
    expect(timeline[0].autor).toBe('ia')
  })

  it('deriva autor: saída sem processado_por_ia é humano (Stiven digitou)', () => {
    const timeline = buildLeadTimeline({
      mensagens: [{ id: 'm1', canal: 'whatsapp', direcao: 'saida', mensagem: 'resposta manual', created_at: '2026-07-06T10:00:00Z', processado_por_ia: false }],
    })
    expect(timeline[0].autor).toBe('humano')
  })

  it('carrega sentimento da mensagem quando presente', () => {
    const timeline = buildLeadTimeline({
      mensagens: [{ id: 'm1', canal: 'whatsapp', direcao: 'entrada', mensagem: 'urgente!', created_at: '2026-07-06T10:00:00Z', sentimento: 'urgente' }],
    })
    expect(timeline[0].sentimento).toBe('urgente')
  })

  it('sentimento ausente vira null, não undefined-quebrando-serialização', () => {
    const timeline = buildLeadTimeline({
      mensagens: [{ id: 'm1', canal: 'whatsapp', direcao: 'entrada', mensagem: 'oi', created_at: '2026-07-06T10:00:00Z' }],
    })
    expect(timeline[0].sentimento).toBeNull()
  })
})
