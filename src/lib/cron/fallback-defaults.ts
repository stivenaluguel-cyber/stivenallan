// Valores padrão de fábrica da régua de follow-up — únicos usados quando a
// tabela do banco (automacao_whatsapp_mensagens/_intervalos, automacao_email_passos)
// vem vazia ou a leitura falha. Extraídos pra cá (antes viviam duplicados
// dentro de cada cron/route.ts) porque o botão "Restaurar padrões" do editor
// em /dashboard/automacoes precisa mostrar EXATAMENTE o que o cron usaria no
// pior caso — duas cópias divergentes já causaram um bug real de vocabulário
// nesta base (ver src/lib/dashboard/estagios.ts).
//
// Textos com acentuação correta (antes só 'primeiro_contato' tinha acento —
// os demais eram "condicoes"/"voce"/"duvida"/"horarios"/"Ola" sem acento).

export type EtapaEmailFallback = { diasMinimos: number; assunto: string; corpoHtml: string }

export const WPP_LINK_FALLBACK = 'https://wa.me/5548991642332'

export const MENSAGENS_FOLLOWUP_FALLBACK: Record<string, string[]> = {
  primeiro_contato: [
    'Oi {nome}! Aqui é o Stiven 😊 Recebi seu interesse no {empreendimento}. Já separei as plantas e as condições direto com a construtora — prefere que eu envie por aqui, ou marcamos 10 minutinhos para eu te mostrar o que cabe no seu plano?',
    'Oi {nome}! Uma informação importante sobre o {empreendimento}: quando a obra avança de fase, a tabela sobe. Se fizer sentido, te passo as condições de hoje, sem compromisso.',
    '{nome}, prometo que é minha última mensagem 😄 Se o momento não é agora, tudo bem. Quer que eu te avise quando houver novidade de obra ou condição especial no {empreendimento}? É só responder AVISA.',
  ],
  qualificado: [
    'Oi {nome}! Com base no seu perfil, tenho condições especiais para {empreendimento}. Podemos conversar hoje?',
    'Olá {nome}! Queria compartilhar uma novidade sobre {empreendimento} que pode te interessar muito.',
  ],
  interessado: [
    '{nome}, que tal agendarmos uma visita ao {empreendimento}? Tenho horários disponíveis essa semana.',
    'Oi {nome}! Ainda pensando em {empreendimento}? Posso tirar qualquer dúvida por aqui.',
  ],
  proposta_enviada: [
    '{nome}, você teve chance de analisar a proposta do {empreendimento}? Fico à disposição para tirar qualquer dúvida.',
    'Oi {nome}! Queria saber se surgiu alguma dúvida sobre a proposta. Posso agendar uma visita se preferir.',
  ],
  visita_agendada: [
    'Olá {nome}! Confirmando nossa visita ao {empreendimento}. Você confirma presença? Qualquer imprevisto me avisa.',
  ],
}

export const INTERVALOS_FALLBACK = [1, 3, 7, 14]

export const ETAPAS_EMAIL_FALLBACK: EtapaEmailFallback[] = [
  {
    diasMinimos: 2,
    assunto: 'Por que ninguém te explicou o financiamento sem banco?',
    corpoHtml: `
      <p>Olá {nome},</p>
      <p>A pergunta que mais recebo é sempre a mesma: <strong>"como assim, comprar apartamento sem banco?"</strong></p>
      <p>É mais simples do que parece — e escrevi um guia completo explicando: entrada de 20%, parcelas durante a obra corrigidas pelo CUB/SC, e nenhuma análise bancária no processo.</p>
      <p><a href="https://stivenallan.com.br/guia/financiamento-direto-construtora" style="color:#1A5C3A;font-weight:700">→ Leia o guia do financiamento direto</a></p>
      <p>Se ficou qualquer dúvida sobre o {empreendimento}, <a href="${WPP_LINK_FALLBACK}" style="color:#1A5C3A">me chama no WhatsApp</a> que eu explico com os números do seu caso.</p>
    `,
  },
  {
    diasMinimos: 7,
    assunto: 'A tabela do {empreendimento} muda com a obra',
    corpoHtml: `
      <p>Olá {nome},</p>
      <p>Um aviso honesto antes de eu parar de te escrever: <strong>a tabela do {empreendimento} é reajustada a cada fase da obra</strong>. As condições que eu te apresentaria hoje não são as mesmas do mês que vem.</p>
      <p>Se o momento não é agora, tudo bem — o link no rodapé te tira desta régua sem compromisso.</p>
      <p><a href="${WPP_LINK_FALLBACK}" style="color:#1A5C3A;font-weight:700">→ Ver os números de hoje no WhatsApp</a></p>
    `,
  },
]
