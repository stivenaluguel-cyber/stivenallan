import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { autenticado } from '@/lib/dashboard/auth-check'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ erro: 'OPENAI_API_KEY nao configurada' }, { status: 503 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Coletar dados do pipeline
  const { data: leads } = await supabase
    .from('leads')
    .select('nome, estagio_funil, lead_score, requer_atencao, perfil, orcamento_max, prazo_compra, ultimo_contato, created_at, motivacao')
    .order('created_at', { ascending: false })
    .limit(50)

  if (!leads || leads.length === 0) {
    return NextResponse.json({ insights: 'Nenhum lead ainda no pipeline.' })
  }

  // Abaixo disso a "análise" seria a IA extrapolando tendência de 1-2 leads —
  // mesmo limite usado no botão em /dashboard (src/app/dashboard/dashboard-view.tsx).
  const MIN_LEADS_PARA_INSIGHTS = 3
  if (leads.length < MIN_LEADS_PARA_INSIGHTS) {
    return NextResponse.json(
      { erro: `Dados insuficientes: cadastre pelo menos ${MIN_LEADS_PARA_INSIGHTS} leads para uma análise significativa (hoje há ${leads.length}).` },
      { status: 422 },
    )
  }

  const resumo = {
    total: leads.length,
    por_estagio: leads.reduce((acc: Record<string, number>, l) => {
      acc[l.estagio_funil || 'desconhecido'] = (acc[l.estagio_funil || 'desconhecido'] || 0) + 1
      return acc
    }, {}),
    score_medio: Math.round(leads.reduce((s, l) => s + (l.lead_score || 0), 0) / leads.length),
    requer_atencao: leads.filter(l => l.requer_atencao).length,
    por_perfil: leads.reduce((acc: Record<string, number>, l) => {
      if (l.perfil) acc[l.perfil] = (acc[l.perfil] || 0) + 1
      return acc
    }, {}),
  }

  const groq = new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  })

  const prompt = `Voce e um especialista em vendas imobiliarias analisando o pipeline CRM de Stiven Allan, corretor em Criciuma/SC.

Dados do pipeline:
- Total de leads: ${resumo.total}
- Score medio: ${resumo.score_medio}/100
- Precisam atencao urgente: ${resumo.requer_atencao}
- Por estagio: ${JSON.stringify(resumo.por_estagio)}
- Por perfil: ${JSON.stringify(resumo.por_perfil)}

Leads recentes (max 10):
${leads.slice(0, 10).map(l => `- ${l.nome || 'Lead'}: estagio=${l.estagio_funil}, score=${l.lead_score}, orcamento=R$${l.orcamento_max?.toLocaleString('pt-BR') || 'N/A'}, prazo=${l.prazo_compra || 'N/A'}`).join('\n')}

Gere um analise executiva em portugues com:
1. Saude geral do pipeline (2-3 frases)
2. Top 3 acoes prioritarias para hoje
3. Oportunidade mais quente no momento
4. Alerta de atencao se houver leads parados

Seja direto, pratico e focado em conversao. Maximo 200 palavras.`

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
    temperature: 0.7,
  })

  const insights = response.choices[0]?.message?.content || 'Nao foi possivel gerar insights.'

  return NextResponse.json({
    insights,
    resumo,
    gerado_em: new Date().toISOString(),
  })
}
