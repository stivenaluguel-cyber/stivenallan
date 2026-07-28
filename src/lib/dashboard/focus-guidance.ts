import { ESTAGIOS_FUNIL } from './estagios'
import { temWhatsappReal } from '@/lib/leads/normalize'
import type { FocusQueueEntry } from './focus-queue'

export type FocusPriority = {
  title: string
  detail: string
  level: 'urgent' | 'attention' | 'normal'
}

export type FocusRecommendation = {
  action: 'whatsapp' | 'followup' | 'visita' | 'atualizar_etapa'
  title: string
  detail: string
}

// A partir de qual índice em ESTAGIOS_FUNIL um lead conta como "avançado no
// funil" pra fins de explicação (0=primeiro_contato). 3 = proposta_enviada,
// o primeiro estágio em que já existe uma proposta ou visita em jogo — antes
// disso ainda é só qualificação, não dá pra chamar de "avançado" com boa fé.
const INDICE_FUNIL_AVANCADO = 3

// Explica a PRIMEIRA camada que colocou o lead nesta posição. A fila continua
// sendo ordenada em focus-queue.ts; este módulo só torna a decisão legível
// para o corretor, sem inventar uma recomendação de IA ou usar dados externos.
// A ordem dos `if` replica exatamente a ordem de camadas de sortKey em
// focus-queue.ts — nunca deve divergir dela.
export function explainFocusPriority(entry: FocusQueueEntry): FocusPriority {
  if (entry.followupVencido) return { title: 'Follow-up vencido', detail: 'O prazo de retorno deste lead já passou.', level: 'urgent' }
  if (entry.requerAtencao) return { title: 'Requer atenção', detail: 'Este lead foi sinalizado para acompanhamento prioritário.', level: 'attention' }
  if (entry.agendaVencida) return { title: 'Compromisso atrasado', detail: 'Há um compromisso pendente que precisa ser conferido.', level: 'urgent' }
  if (entry.nuncaContatado) return { title: 'Ainda sem contato', detail: 'Este lead entrou no funil e não tem contato humano registrado.', level: 'attention' }
  if (entry.quente) return { title: 'Lead quente', detail: 'A temperatura alta indica prioridade comercial.', level: 'attention' }
  if (entry.diasSemContato >= 7) return { title: `Sem contato há ${Math.round(entry.diasSemContato)} dias`, detail: 'Vale retomar a conversa antes que o interesse esfrie.', level: 'normal' }
  const estagioIdx = ESTAGIOS_FUNIL.findIndex((e) => e.key === entry.lead.estagio_funil)
  if (estagioIdx >= INDICE_FUNIL_AVANCADO) {
    const label = ESTAGIOS_FUNIL[estagioIdx].label
    return { title: 'Lead avançado no funil', detail: `Já está na etapa "${label}" — vale priorizar antes que esfrie.`, level: 'normal' }
  }
  return { title: 'Prioridade da fila', detail: 'Este lead está entre os mais relevantes pelos critérios de etapa, score e tempo de espera.', level: 'normal' }
}

// Recomendação de ação — percorre a MESMA ordem de camadas de
// explainFocusPriority/sortKey (follow-up vencido → requer atenção →
// compromisso vencido → nunca contatado → quente → ...). Antes esta função
// checava agendaVencida ANTES de followupVencido, então um lead com os dois
// sinais mostrava "Por que está aqui: Follow-up vencido" ao lado de
// "Próxima ação: Conferir compromisso" — dois motivos diferentes lado a
// lado, e a ação sugerida abria o fluxo de visita para um follow-up
// atrasado. Agora a ordem é única; quando a melhor ação não corresponde
// à primeira camada, `motivoDivergente` explica isso no card em vez de
// deixar a contradição implícita.
//
// Lead vindo de DM do Instagram ainda não tem telefone real (ver
// temWhatsappReal em lib/leads/normalize.ts) — nunca recomendar "WhatsApp"
// pra ele; a alternativa honesta é registrar um follow-up (responder a
// conversa no próprio Instagram é uma ação fora do Modo Foco por enquanto).
export function recommendFocusAction(entry: FocusQueueEntry): FocusRecommendation {
  const temWhatsapp = temWhatsappReal(entry.lead.whatsapp)
  const contatoInicial: FocusRecommendation = temWhatsapp
    ? { action: 'whatsapp', title: 'Retomar pelo WhatsApp', detail: 'O follow-up venceu; uma mensagem curta é o próximo passo mais direto.' }
    : { action: 'followup', title: 'Responder no Instagram', detail: 'O follow-up venceu; responda a conversa no Instagram e registre o retorno aqui.' }

  if (entry.followupVencido) return contatoInicial

  if (entry.requerAtencao) {
    return temWhatsapp
      ? { action: 'whatsapp', title: 'Falar com o lead agora', detail: 'Este lead foi sinalizado para acompanhamento prioritário.' }
      : { action: 'followup', title: 'Responder no Instagram', detail: 'Este lead foi sinalizado para acompanhamento prioritário.' }
  }

  // Só um compromisso do tipo 'visita' abre o fluxo de visita. Um follow-up
  // atrasado (tipo 'ligacao'/'outro') vira uma ação de follow-up, não de
  // visita — era exatamente essa confusão que levava o corretor ao modal de
  // visita errado.
  if (entry.agendaVencida) {
    if (entry.compromissoVencidoTipo === 'visita') {
      return { action: 'visita', title: 'Conferir a visita atrasada', detail: 'A visita marcada já passou — registre se ela aconteceu ou não.' }
    }
    return { action: 'followup', title: 'Conferir compromisso atrasado', detail: 'Há um compromisso pendente que já passou do horário — confirme o que aconteceu.' }
  }

  if (entry.nuncaContatado) {
    return temWhatsapp
      ? { action: 'whatsapp', title: 'Fazer o primeiro contato', detail: 'Apresente-se e confirme o interesse antes de avançar o funil.' }
      : { action: 'followup', title: 'Responder no Instagram', detail: 'Este lead veio de uma DM — apresente-se por lá e, se possível, peça o WhatsApp.' }
  }
  if (entry.quente) return { action: 'visita', title: 'Convidar para uma visita', detail: 'O lead está quente; transforme interesse em próximo compromisso.' }
  return { action: 'followup', title: 'Agendar próximo passo', detail: 'Defina quando e por qual canal você vai retomar a conversa.' }
}
