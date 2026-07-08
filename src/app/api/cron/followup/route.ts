import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enviarFollowUp, enviarAlertaEscalada } from '@/lib/evolution';

export const dynamic = 'force-dynamic';

// Lazy init supabase - evita erro de build
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Mensagens de follow-up por estagio_funil
const MENSAGENS_FOLLOWUP: Record<string, string[]> = {
  primeiro_contato: [
    'Oi {nome}! Aqui é o Stiven 😊 Recebi seu interesse no {empreendimento}. Já separei as plantas e as condições direto com a construtora — prefere que eu envie por aqui, ou marcamos 10 minutinhos para eu te mostrar o que cabe no seu plano?',
    'Oi {nome}! Uma informação importante sobre o {empreendimento}: quando a obra avança de fase, a tabela sobe. Se fizer sentido, te passo as condições de hoje, sem compromisso.',
    '{nome}, prometo que é minha última mensagem 😄 Se o momento não é agora, tudo bem. Quer que eu te avise quando houver novidade de obra ou condição especial no {empreendimento}? É só responder AVISA.',
  ],
  qualificado: [
    'Oi {nome}! Com base no seu perfil, tenho condicoes especiais para {empreendimento}. Podemos conversar hoje?',
    'Ola {nome}! Queria compartilhar uma novidade sobre {empreendimento} que pode te interessar muito.',
  ],
  interessado: [
    '{nome}, que tal agendarmos uma visita ao {empreendimento}? Tenho horarios disponiveis essa semana.',
    'Oi {nome}! Ainda pensando em {empreendimento}? Posso tirar qualquer duvida por aqui.',
  ],
  proposta_enviada: [
    '{nome}, voce teve chance de analisar a proposta do {empreendimento}? Fico a disposicao para tirar qualquer duvida.',
    'Oi {nome}! Queria saber se surgiu alguma duvida sobre a proposta. Posso agendar uma visita se preferir.',
  ],
  visita_agendada: [
    'Ola {nome}! Confirmando nossa visita ao {empreendimento}. Voce confirma presenca? Qualquer imprevisto me avisa.',
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
  const supabase = getSupabase();
  const { id, nome, whatsapp, estagio_funil, tentativas_followup = 0, empreendimento_interesse, property_id, property_name, lead_score = 0 } = lead;

  let nomeEmpreendimento = property_name || 'nosso empreendimento';
  if (!property_name && property_id) {
    const { data: prop } = await supabase
      .from('properties')
      .select('nome')
      .eq('id', property_id)
      .maybeSingle();
    if (prop?.nome) nomeEmpreendimento = prop.nome;
  } else if (!property_name && !property_id && empreendimento_interesse) {
    const { data: emp } = await supabase
      .from('empreendimentos')
      .select('nome')
      .eq('id', empreendimento_interesse)
      .single();
    if (emp) nomeEmpreendimento = emp.nome;
  }

  const mensagem = getMensagemFollowUp(estagio_funil, tentativas_followup, nome ?? 'amigo', nomeEmpreendimento);

  // Sem mais mensagens — escalar para Stiven
  if (!mensagem) {
    await enviarAlertaEscalada(whatsapp, nome, lead_score ?? 0);
    await supabase.from('leads').update({
      requer_atencao: true,
      status: 'cold',
      observacoes_ia: 'Sequencia de follow-up esgotada sem resposta. Encaminhado para avaliacao manual.',
    }).eq('id', id);
    return { id, acao: 'escalado', motivo: 'sem_mais_followups' };
  }

  const enviado = await enviarFollowUp(whatsapp, mensagem);

  if (!enviado) {
    console.error('Falha ao enviar follow-up para', whatsapp);
    return { id, acao: 'erro', motivo: 'falha_envio' };
  }

  const intervalos = [1, 3, 7, 14];
  const proximoIntervalo = intervalos[Math.min(tentativas_followup + 1, intervalos.length - 1)];
  const proximoFollowup = new Date();
  proximoFollowup.setDate(proximoFollowup.getDate() + proximoIntervalo);

  await supabase.from('interacoes').insert({
    lead_id: id,
    canal: 'whatsapp',
    direcao: 'saida',
    mensagem,
    processado_por_ia: true,
    intencao_detectada: 'follow_up_automatico',
  });

  await supabase.from('leads').update({
    tentativas_followup: tentativas_followup + 1,
    ultimo_contato: new Date().toISOString(),
    proximo_followup: proximoFollowup.toISOString(),
  }).eq('id', id);

  return { id, acao: 'mensagem_enviada', tentativa: tentativas_followup + 1, proximoFollowup };
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const agora = new Date().toISOString();

    const { data: leads, error } = await supabase
      .from('leads')
      .select('id, nome, whatsapp, estagio_funil, tentativas_followup, empreendimento_interesse, property_id, property_name, lead_score')
      .lte('proximo_followup', agora)
      .eq('requer_atencao', false)
      .in('status', ['novo', 'ativo', 'qualificado'])
      .not('whatsapp', 'is', null)
      .limit(50);

    if (error) {
      return NextResponse.json({ error: 'DB error', details: error.message }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ message: 'Nenhum lead para follow-up.', processados: 0 });
    }

    const resultados = [];
    for (const lead of leads) {
      const resultado = await processarLeadFollowUp(lead);
      resultados.push(resultado);
      await new Promise(r => setTimeout(r, 2000));
    }

    const enviados = resultados.filter(r => r.acao === 'mensagem_enviada').length;
    const escalados = resultados.filter(r => r.acao === 'escalado').length;
    const erros = resultados.filter(r => r.acao === 'erro').length;

    return NextResponse.json({ message: 'Follow-ups processados.', processados: leads.length, enviados, escalados, erros });

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal error', details: err.message }, { status: 500 });
  }
}
