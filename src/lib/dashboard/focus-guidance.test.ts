import { describe, expect, it } from 'vitest'
import { explainFocusPriority, recommendFocusAction } from './focus-guidance'
import type { FocusQueueEntry } from './focus-queue'

const base: FocusQueueEntry = {
  lead: { id: 'l1', whatsapp: '11999999999', estagio_funil: 'primeiro_contato', created_at: '2026-07-01T12:00:00Z' },
  followupVencido: false, requerAtencao: false, agendaVencida: false,
  nuncaContatado: false, quente: false, diasSemContato: 2,
}

describe('explainFocusPriority', () => {
  it('follow-up vencido vence qualquer outra camada', () => {
    const entry = { ...base, followupVencido: true, requerAtencao: true, agendaVencida: true, quente: true }
    expect(explainFocusPriority(entry).title).toBe('Follow-up vencido')
    expect(explainFocusPriority(entry).level).toBe('urgent')
  })

  it('requer atenção vence tudo abaixo dela quando follow-up não está vencido', () => {
    const entry = { ...base, requerAtencao: true, agendaVencida: true, nuncaContatado: true, quente: true }
    expect(explainFocusPriority(entry).title).toBe('Requer atenção')
  })

  it('compromisso/agenda atrasada vence nunca-contatado e quente', () => {
    const entry = { ...base, agendaVencida: true, nuncaContatado: true, quente: true }
    const p = explainFocusPriority(entry)
    expect(p.title).toBe('Compromisso atrasado')
    expect(p.level).toBe('urgent')
  })

  it('nunca contatado vence quente e dias sem contato', () => {
    const entry = { ...base, nuncaContatado: true, quente: true, diasSemContato: 30 }
    expect(explainFocusPriority(entry).title).toBe('Ainda sem contato')
  })

  it('lead quente vence dias sem contato e etapa avançada', () => {
    const entry = { ...base, quente: true, diasSemContato: 30, lead: { ...base.lead, estagio_funil: 'negociacao' } }
    expect(explainFocusPriority(entry).title).toBe('Lead quente')
  })

  it('muitos dias sem contato (>=7) vence etapa avançada', () => {
    const entry = { ...base, diasSemContato: 7, lead: { ...base.lead, estagio_funil: 'negociacao' } }
    expect(explainFocusPriority(entry).title).toBe('Sem contato há 7 dias')
    expect(explainFocusPriority(entry).level).toBe('normal')
  })

  it('não considera "muitos dias sem contato" abaixo do limiar de 7', () => {
    const entry = { ...base, diasSemContato: 6.9 }
    expect(explainFocusPriority(entry).title).not.toMatch(/Sem contato há/)
  })

  it('lead avançado no funil (proposta enviada ou além) quando nenhuma camada anterior se aplica', () => {
    const entry = { ...base, diasSemContato: 1, lead: { ...base.lead, estagio_funil: 'proposta_enviada' } }
    const p = explainFocusPriority(entry)
    expect(p.title).toBe('Lead avançado no funil')
    expect(p.detail).toContain('Proposta Enviada')
  })

  it('etapas iniciais (antes de proposta enviada) não contam como "avançado no funil"', () => {
    const entry = { ...base, diasSemContato: 1, lead: { ...base.lead, estagio_funil: 'qualificado' } }
    expect(explainFocusPriority(entry).title).not.toBe('Lead avançado no funil')
  })

  it('fallback final genérico quando nenhum critério real se aplica', () => {
    const entry = { ...base, diasSemContato: 1, lead: { ...base.lead, estagio_funil: 'primeiro_contato' } }
    expect(explainFocusPriority(entry).title).toBe('Prioridade da fila')
  })
})

describe('recommendFocusAction', () => {
  // Antes, esta função checava agendaVencida ANTES de followupVencido, ao
  // contrário de explainFocusPriority/sortKey — então um lead com os dois
  // sinais mostrava "Por que está aqui: Follow-up vencido" ao lado de
  // "Próxima ação: Conferir compromisso". Agora a ordem é única.
  it('usa a MESMA ordem de explainFocusPriority: follow-up vencido vence compromisso atrasado', () => {
    const entry = { ...base, agendaVencida: true, followupVencido: true, nuncaContatado: true, quente: true }
    expect(explainFocusPriority(entry).title).toBe('Follow-up vencido')
    expect(recommendFocusAction(entry).action).toBe('whatsapp')
  })

  it('requer atenção vem antes de compromisso atrasado, igual à explicação', () => {
    const entry = { ...base, requerAtencao: true, agendaVencida: true, compromissoVencidoTipo: 'visita' }
    expect(explainFocusPriority(entry).title).toBe('Requer atenção')
    expect(recommendFocusAction(entry).title).toBe('Falar com o lead agora')
  })

  it('follow-up vencido (sem agenda atrasada) recomenda retomar no WhatsApp', () => {
    const entry = { ...base, followupVencido: true, nuncaContatado: true, quente: true }
    const r = recommendFocusAction(entry)
    expect(r.action).toBe('whatsapp')
    expect(r.title).toBe('Retomar pelo WhatsApp')
  })

  it('VISITA atrasada abre o fluxo de visita', () => {
    const entry = { ...base, agendaVencida: true, compromissoVencidoTipo: 'visita' }
    const r = recommendFocusAction(entry)
    expect(r.action).toBe('visita')
    expect(r.title).toBe('Conferir a visita atrasada')
  })

  it('follow-up/ligação atrasada NÃO abre o fluxo de visita', () => {
    const ligacao = recommendFocusAction({ ...base, agendaVencida: true, compromissoVencidoTipo: 'ligacao' })
    expect(ligacao.action).toBe('followup')
    expect(ligacao.action).not.toBe('visita')

    const outro = recommendFocusAction({ ...base, agendaVencida: true, compromissoVencidoTipo: 'outro' })
    expect(outro.action).toBe('followup')
  })

  it('compromisso de tipo desconhecido cai no fluxo genérico, não no de visita', () => {
    const r = recommendFocusAction({ ...base, agendaVencida: true, compromissoVencidoTipo: 'tipo_novo_qualquer' })
    expect(r.action).toBe('followup')
    expect(r.title).toBe('Conferir compromisso atrasado')
  })

  it('nunca contatado (sem agenda/follow-up vencidos) recomenda primeiro contato', () => {
    const entry = { ...base, nuncaContatado: true, quente: true }
    const r = recommendFocusAction(entry)
    expect(r.action).toBe('whatsapp')
    expect(r.title).toBe('Fazer o primeiro contato')
  })

  it('lead quente (sem os anteriores) recomenda convidar para visita', () => {
    expect(recommendFocusAction({ ...base, quente: true }).action).toBe('visita')
  })

  it('demais casos recomendam agendar follow-up', () => {
    const r = recommendFocusAction({ ...base, diasSemContato: 10, lead: { ...base.lead, estagio_funil: 'negociacao' } })
    expect(r.action).toBe('followup')
    expect(r.title).toBe('Agendar próximo passo')
  })
})

describe('recommendFocusAction — lead do Instagram (sem telefone real)', () => {
  const igLead = { ...base, lead: { ...base.lead, whatsapp: 'ig:17841400000000000' } }

  it('follow-up vencido sem telefone nunca recomenda WhatsApp', () => {
    const r = recommendFocusAction({ ...igLead, followupVencido: true })
    expect(r.action).not.toBe('whatsapp')
    expect(r.title).toBe('Responder no Instagram')
  })

  it('nunca contatado sem telefone nunca recomenda WhatsApp', () => {
    const r = recommendFocusAction({ ...igLead, nuncaContatado: true })
    expect(r.action).not.toBe('whatsapp')
    expect(r.title).toBe('Responder no Instagram')
  })

  it('com telefone real, comportamento normal é preservado', () => {
    const r = recommendFocusAction({ ...base, followupVencido: true })
    expect(r.action).toBe('whatsapp')
  })
})
