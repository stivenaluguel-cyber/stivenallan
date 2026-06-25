import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ erro: 'ANTHROPIC_API_KEY nao configurada' }, { status: 503 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Coletar dados do pipeline
  const { data: leads } = await supabase
    .from('leads')
    .select('nome, estagio_funil, lead_score, requer_atencao, perfil, orcamento_max, prazo_compra, ultimo_contato, created_at, motivacao')
    .order('lead_score', { ascending: false })
    .limit(50)

  if (!leads || leads.length === 0) {
    return NextResponse.json({ texto: 'Nenhum lead no pipeline ainda. Assim que os primeiros leads chegarem pelo WhatsApp, a IA irá analisar e gerar insights estratégicos.' })
  }

  const agora = new Date()
  const hoje = new Date(); hoje.setHours(0,0,0,0)
  const semanaAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)

  const stats = {
    total: leads.length,
    atencao: leads.filter((l: any) => l.requer_atencao).length,
    scoreAlto: leads.filter((l: any) => (l.lead_score ?? 0) >= 60).length,
    novosUltimaSemana: leads.filter((l: any) => new Date(l.created_at) >= semanaAtras).length,
    estagios: leads.reduce((acc: any, l: any) => { acc[l.estagio_funil] = (acc[l.estagio_funil] ?? 0) + 1; return acc }, {}),
    semResposta: leads.filter((l: any) => l.ultimo_contato && new Date(l.ultimo_contato) < semanaAtras).length,
  }

  const topLeads = leads
    .filter((l: any) => (l.lead_score ?? 0) >= 40)
    .slice(0, 5)
    .map((l: any) => l.nome ?? 'Lead anônimo')

  const prompt = 'Você é um consultor estratégico de vendas imobiliárias analisando o pipeline do corretor Stiven Allan em Criciúma/SC.' +
    ' Dados do pipeline:' +
    ' Total de leads: ' + stats.total +
    ' | Precisando atenção: ' + stats.atencao +
    ' | Score alto (60+): ' + stats.scoreAlto +
    ' | Novos na semana: ' + stats.novosUltimaSemana +
    ' | Sem resposta há 7+ dias: ' + stats.semResposta +
    ' | Distribuição: ' + JSON.stringify(stats.estagios) +
    ' | Top leads: ' + topLeads.join(', ') +
    '. Gere 3 insights práticos e diretos (máximo 120 palavras no total) sobre: 1) Ação mais urgente agora 2) Oportunidade identificada 3) Risco ou ponto de atenção. Seja específico e acionável. Use português brasileiro.'

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      })
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[insights] Anthropic error:', err)
      return NextResponse.json({ erro: 'Erro na API Claude' }, { status: 500 })
    }

    const data = await res.json()
    const texto = data.content?.[0]?.text ?? 'Sem resposta da IA.'

    return NextResponse.json({ texto, stats, geradoEm: new Date().toISOString() })

  } catch (err: any) {
    return NextResponse.json({ erro: err.message }, { status: 500 })
  }
}
