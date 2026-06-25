import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enviarFollowUp, enviarAlertaEscalada } from '@/lib/evolution';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Mensagens de follow-up por estágio
const MENSAGENS_FOLLOWUP: Record<string, string[]> = {
  primeiro_contato: [
    'Oi {nome}! Stiven aqui. Vi que você demonstrou interesse no {empreendimento}. Posso te contar mais sobre as opções disponíveis? 🏠',
    'Olá {nome}, tudo bem? Queria saber se você ainda tem interesse no {empreendimento}. As unidades estão se esgotando rápido.',
    '{nome}, última mensagem minha por aqui. Se quiser conversar sobre o {empreendimento}, estou à disposição. Abraço!',
  ],
  qualificado: [
    'Oi {nome}! Com base no seu perfil, tenho condições especiais para o {empreendimento}. Podemos conversar hoje?',
    'Olá {nome}! Queria compartilhar uma novidade sobre o {empreendimento} que pode te interessar muito.',
  ],
  proposta_enviada: [
    '{nome}, você teve chance de analisar a proposta do {empreendimento}? Fico à disposição para tirar qualquer dúvida.',
    'Oi {nome}! Queria saber se surgiu alguma dúvida sobre a proposta. Posso agendar uma visita se preferir ver pessoalmente.',
  ],
  visita_agendada: [
    'Olá {nome}! Confirmando nossa visita ao {empreendimento}. Você confirma presença? Qualquer imprevisto me avisa.',
  ],
};
function getMensagemFollowUp(estagio: string, tentativa: number, nome: string, empreendimento: string): string | null {
  const msgs = MENSAGENS_FOLLOWUP[estagio];
  if (!msgs || tentativa >= msgs.length) return null;
  return msgs[tentativa]
    .replace(/{nome}/g, nome.split(' ')[0])
    .replace(/{empreendimento}/g, empreendimento);
}

async function processarLeadFollowUp(lead: any) {
  const { id, nome, whatsapp, estagio_funil, tentativas_followup = 0, empreendimento_interesse } = lead;

  // Buscar nome do empreendimento de interesse
  let nomeEmpreendimento = 'nosso empreendimento';
  if (empreendimento_interesse) {
    const { data: emp } = await supabase
      .from('empreendimentos')
      .select('nome')
      .eq('id', empreendimento_interesse)
      .single();
    if (emp) nomeEmpreendimento = emp.nome;
  }

  const mensagem = getMensagemFollowUp(estagio_funil, tentativas_followup, nome, nomeEmpreendimento);

  // Se não há mais mensagens — escalar para Stiven
  if (!mensagem) {
    await enviarAlertaEscalada(
      whatsapp,
      nome,
      'Lead esgotou sequência de follow-up automático sem resposta. Avaliação manual necessária.',
      estagio_funil
    );
    await supabase.from('leads').update({
      requer_atencao: true,
      status: 'cold',
      observacoes_ia: 'Sequência de follow-up esgotada sem resposta. Encaminhado para avaliação manual.',
    }).eq('id', id);
    return { id, acao: 'escalado', motivo: 'sem_mais_followups' };
  }

  // Enviar follow-up
  const enviado = await enviarFollowUp(whatsapp, mensagem);

  if (!enviado) {
    console.error('Falha ao enviar follow-up para', whatsapp);
    return { id, acao: 'erro', motivo: 'falha_envio' };
  }

  // Calcular próximo follow-up baseado na tentativa
  const intervalos = [1, 3, 7, 14]; // dias
  const proximoIntervalo = intervalos[Math.min(tentativas_followup + 1, intervalos.length - 1)];
  const proximoFollowup = new Date();
  proximoFollowup.setDate(proximoFollowup.getDate() + proximoIntervalo);

  // Registrar interação
  await supabase.from('interacoes').insert({
    lead_id: id,
    canal: 'whatsapp',
    direcao: 'saida',
    mensagem,
    processado_por_ia: true,
    intencao_detectada: 'follow_up_automatico',
  });

  // Atualizar lead
  await supabase.from('leads').update({
    tentativas_followup: tentativas_followup + 1,
    ultimo_contato: new Date().toISOString(),
    proximo_followup: proximoFollowup.toISOString(),
  }).eq('id', id);

  return { id, acao: 'mensagem_enviada', tentativa: tentativas_followup + 1, proximoFollowup };
}
export async function GET(req: NextRequest) {
  // Verificar autorização do cron (Vercel Cron envia header authorization)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const agora = new Date().toISOString();

    // Buscar leads que precisam de follow-up
    const { data: leads, error } = await supabase
      .from('leads')
      .select('id, nome, whatsapp, estagio_funil, tentativas_followup, empreendimento_interesse')
      .lte('proximo_followup', agora)
      .eq('requer_atencao', false)
      .in('status', ['novo', 'em_atendimento', 'qualificado', 'proposta_enviada', 'visita_agendada'])
      .not('whatsapp', 'is', null)
      .limit(50); // processar até 50 por execução para não sobrecarregar

    if (error) {
      console.error('Erro ao buscar leads:', error);
      return NextResponse.json({ error: 'DB error', details: error.message }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ message: 'Nenhum lead para follow-up agora.', processados: 0 });
    }

    console.log('Processando follow-ups para', leads.length, 'leads...');

    // Processar com delay entre envios para não ser bloqueado
    const resultados = [];
    for (const lead of leads) {
      const resultado = await processarLeadFollowUp(lead);
      resultados.push(resultado);
      // 2s entre mensagens para parecer humano
      await new Promise(r => setTimeout(r, 2000));
    }

    const enviados = resultados.filter(r => r.acao === 'mensagem_enviada').length;
    const escalados = resultados.filter(r => r.acao === 'escalado').length;
    const erros = resultados.filter(r => r.acao === 'erro').length;

    return NextResponse.json({
      message: 'Follow-ups processados.',
      processados: leads.length,
      enviados,
      escalados,
      erros,
      resultados,
    });

  } catch (err: any) {
    console.error('Erro geral no cron:', err);
    return NextResponse.json({ error: 'Internal error', details: err.message }, { status: 500 });
  }
}
