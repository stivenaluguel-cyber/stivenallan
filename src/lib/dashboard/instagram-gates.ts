// Gatilhos de decisão do plano de growth do Instagram (docs/growth — metas 30/60/90 dias).
// Só os gatilhos computáveis a partir de dados que o dashboard realmente guarda:
// G2/G3/G6/G7/G9 vêm do snapshot semanal manual; G4/G5 vêm do calendário de conteúdo.
// G1 (custo/visita por criativo, 24h), G8 (velocidade de resposta) ficam de fora —
// exigem dado do Gerenciador de Anúncios / Direct que este app não captura.

export type WeeklyMetric = {
  semana_inicio: string
  seguidores: number | null
  novos_seguidores: number | null
  novos_seguidores_locais: number | null
  alcance: number | null
  alcance_educativo: number | null
  alcance_imovel: number | null
  taxa_engajamento: number | null
  visitas_perfil: number | null
  cliques_bio: number | null
  leads_qualificados: number | null
  custo_por_visita: number | null
  tempo_resposta_medio_min: number | null
}

export type CalendarEntryForGates = {
  id: string
  data: string | null
  tipo: 'reel_educativo' | 'reel_imovel' | 'story' | 'story_campanha'
  status: string
  watch_time_seg: number | null
}

export type Gate = {
  codigo: string
  nome: string
  severidade: 'alerta' | 'info'
  mensagem: string
}

const FEED_TIPOS = new Set(['reel_educativo', 'reel_imovel'])
const REEL_TIPOS = new Set(['reel_educativo', 'reel_imovel'])

export function computeWeeklyGates(current: WeeklyMetric, history: WeeklyMetric[]): Gate[] {
  const gates: Gate[] = []

  // G1 — Criativo (24h): custo por visita ao perfil do criativo ativo/campeão.
  if (current.custo_por_visita != null) {
    if (current.custo_por_visita > 0.3) {
      gates.push({
        codigo: 'G1',
        nome: 'Criativo',
        severidade: 'alerta',
        mensagem: `Custo por visita em R$${current.custo_por_visita.toFixed(2)} (teto R$0,30). Desligar o criativo e testar um novo.`,
      })
    } else if (current.custo_por_visita <= 0.2) {
      gates.push({
        codigo: 'G1',
        nome: 'Criativo',
        severidade: 'info',
        mensagem: `Custo por visita em R$${current.custo_por_visita.toFixed(2)} (piso campeão R$0,20). Manter e aplicar a regra CPC×100 pra escalar orçamento.`,
      })
    }
  }

  // G2 — Geografia (30 dias): % de novos seguidores locais < 50%.
  if (current.novos_seguidores && current.novos_seguidores > 0 && current.novos_seguidores_locais != null) {
    const pct = current.novos_seguidores_locais / current.novos_seguidores
    if (pct < 0.5) {
      gates.push({
        codigo: 'G2',
        nome: 'Geografia',
        severidade: 'alerta',
        mensagem: `Só ${Math.round(pct * 100)}% dos novos seguidores são locais (meta ≥50%). Estreitar segmentação (Criciúma/Içara/Rincão/Laguna + raio) e reforçar referência local nos 3s iniciais do criativo.`,
      })
    }
  }

  // G3 — Mix editorial: alcance educativo vs anúncio/imóvel.
  if (current.alcance_educativo != null && current.alcance_imovel != null && current.alcance_imovel > 0) {
    const ratio = current.alcance_educativo / current.alcance_imovel
    if (ratio < 1.5) {
      gates.push({
        codigo: 'G3',
        nome: 'Mix editorial',
        severidade: 'alerta',
        mensagem: `Alcance educativo caiu pra ${ratio.toFixed(1)}× o de imóvel (piso 1,5×). Voltar ao mix 1:1 até recuperar.`,
      })
    } else if (ratio < 2) {
      gates.push({
        codigo: 'G3',
        nome: 'Mix editorial',
        severidade: 'info',
        mensagem: `Alcance educativo em ${ratio.toFixed(1)}× o de imóvel — dentro da faixa, mas abaixo do padrão-ouro de 2×.`,
      })
    }
  }

  // G6 — Quadrado da conversão: cliques na bio / visitas ao perfil.
  if (current.visitas_perfil && current.visitas_perfil > 0 && current.cliques_bio != null) {
    const pct = current.cliques_bio / current.visitas_perfil
    if (pct < 0.02) {
      gates.push({
        codigo: 'G6',
        nome: 'Quadrado da conversão',
        severidade: 'alerta',
        mensagem: `Cliques no link ÷ visitas ao perfil em ${(pct * 100).toFixed(1)}% (piso 2%). Revisar bio, destaques e link.`,
      })
    }
  }

  // G7 — Leads (60 dias): soma das últimas 4 semanas (~1 mês) < 10.
  const last4 = [current, ...history].slice(0, 4)
  if (last4.length >= 4 && last4.every((w) => w.leads_qualificados != null)) {
    const total = last4.reduce((acc, w) => acc + (w.leads_qualificados ?? 0), 0)
    if (total < 10) {
      gates.push({
        codigo: 'G7',
        nome: 'Leads',
        severidade: 'alerta',
        mensagem: `${total} leads qualificados nas últimas 4 semanas (meta ≥10/mês). Revisar filtro anti-curioso do criativo e o form.`,
      })
    }
  }

  // G9 — Regressão de engajamento: taxa < baseline (1,34%) por 2 semanas seguidas.
  const BASELINE_ENGAJAMENTO = 1.34
  if (current.taxa_engajamento != null && current.taxa_engajamento < BASELINE_ENGAJAMENTO) {
    const anterior = history[0]
    if (anterior?.taxa_engajamento != null && anterior.taxa_engajamento < BASELINE_ENGAJAMENTO) {
      gates.push({
        codigo: 'G9',
        nome: 'Regressão de engajamento',
        severidade: 'alerta',
        mensagem: `Taxa de engajamento abaixo do baseline (${BASELINE_ENGAJAMENTO}%) por 2 semanas seguidas. Congelar aumento de cadência e voltar 100% ao formato campeão.`,
      })
    }
  }

  // G8 — Velocidade de resposta: > 30min de forma recorrente (2 semanas seguidas).
  if (current.tempo_resposta_medio_min != null && current.tempo_resposta_medio_min > 30) {
    const anterior = history[0]
    if (anterior?.tempo_resposta_medio_min != null && anterior.tempo_resposta_medio_min > 30) {
      gates.push({
        codigo: 'G8',
        nome: 'Velocidade de resposta',
        severidade: 'alerta',
        mensagem: `Tempo médio de primeira resposta em ${Math.round(current.tempo_resposta_medio_min)}min por 2 semanas seguidas (meta ≤30min). Ativar saudação automática com o form de 3 perguntas.`,
      })
    }
  }

  return gates
}

export function computeCalendarGates(entries: CalendarEntryForGates[]): Gate[] {
  const gates: Gate[] = []

  // G4 — Anti-canibalização: nunca 2 posts de feed no mesmo dia.
  const feedByDate = new Map<string, CalendarEntryForGates[]>()
  for (const e of entries) {
    if (!e.data || !FEED_TIPOS.has(e.tipo)) continue
    const list = feedByDate.get(e.data) ?? []
    list.push(e)
    feedByDate.set(e.data, list)
  }
  for (const [data, list] of feedByDate) {
    if (list.length > 1) {
      gates.push({
        codigo: 'G4',
        nome: 'Anti-canibalização',
        severidade: 'alerta',
        mensagem: `${list.length} posts de feed agendados pro mesmo dia (${data}). Espaçar no mínimo 24h — posts simultâneos historicamente tiveram 0 interações.`,
      })
    }
  }

  // G5 — Gancho de reel: watch time médio < 5s em 2 reels publicados seguidos.
  const reelsPublicados = entries
    .filter((e) => REEL_TIPOS.has(e.tipo) && e.status === 'publicado' && e.data && e.watch_time_seg != null)
    .sort((a, b) => (a.data! < b.data! ? 1 : -1))
    .slice(0, 2)
  if (reelsPublicados.length === 2 && reelsPublicados.every((e) => (e.watch_time_seg ?? 0) < 5)) {
    gates.push({
      codigo: 'G5',
      nome: 'Gancho de reel',
      severidade: 'alerta',
      mensagem: 'Watch time médio abaixo de 5s nos últimos 2 reels publicados. Refazer os 2 primeiros segundos no formato campeão (reflexão pessoal + urgência).',
    })
  }

  return gates
}
