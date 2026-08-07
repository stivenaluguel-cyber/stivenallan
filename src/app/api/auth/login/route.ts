import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { createToken } from '@/lib/auth'
import { extractIp } from '@/lib/leads/anti-spam'
import { checkRateLimit } from '@/lib/leads/rate-limit'

export const dynamic = 'force-dynamic'

// Três dimensões, reaproveitando a mesma infra de rate limit do módulo de
// leads (Upstash quando configurado — distribuído entre instâncias —, com
// fallback in-memory por instância quando não):
//   1) IP sozinho — evita um único atacante martelando várias contas.
//   2) IP+conta — protege uma conta específica sem deixar um IP
//      compartilhado (NAT/escritório) travar OUTRAS contas por engano.
//   3) conta sozinha (accountKey, sem IP) — fecha a lacuna que (1) e (2)
//      deixam: um atacante rotacionando IPs contra a MESMA conta, mandando
//      só um punhado de tentativas por IP (abaixo do teto de (2)), nunca
//      seria pego só por (1)/(2). Ex.: 4 IPs x 5 tentativas cada ficam todos
//      dentro do limite de IP+conta, mas somam 20 tentativas reais contra a
//      conta — é exatamente o teto de (3), calibrado de propósito pra isso.
// O limite de conta é o mais permissivo em contagem E o de janela mais
// longa dos três — de propósito: por agregar tentativas de qualquer origem,
// precisa de mais folga pra não travar o dono legítimo por coincidência
// (ex: ele errando a senha em IPs diferentes ao longo do dia), reduzindo o
// risco de virar uma ferramenta de DoS proposital contra a própria conta.
const LOGIN_IP_LIMIT = { identifier: 'admin-login-ip', limit: 10, windowSeconds: 300 }
const LOGIN_IP_ACCOUNT_LIMIT = { identifier: 'admin-login-ip-account', limit: 5, windowSeconds: 900 }
const LOGIN_ACCOUNT_LIMIT = { identifier: 'admin-login-account', limit: 20, windowSeconds: 1800 }

// Nunca usa o e-mail cru como chave de rate limit (Redis/in-memory) — só o
// digest determinístico. SHA-256 não é sigiloso (é reversível por força
// bruta de dicionário para um e-mail conhecido), mas não é esse o objetivo
// aqui: é evitar PII textual óbvia nas chaves operacionais, não impedir
// alguém que já suspeita do e-mail de confirmar a suspeita.
function accountKeyFromEmail(emailNormalizado: string): string {
  return createHash('sha256').update(emailNormalizado).digest('hex')
}

function respostaBloqueada(retryAfter: number | undefined, fallbackSeconds: number) {
  // Mensagem genérica de propósito: não revela qual das três dimensões (IP,
  // IP+conta ou conta) bloqueou, nem quantas tentativas restam, nem se o
  // e-mail existe — mesmo padrão anti-enumeração do resto do projeto.
  //
  // Retry-After: deliberadamente NÃO homogeneizado entre as três dimensões
  // (cada bloqueio devolve o retryAfter real do limiter que disparou, com
  // fallback pra janela dele). A única coisa que a tarefa pede pra nunca
  // revelar é QUAL dimensão bloqueou via status/corpo/estrutura da resposta
  // — isso já vale aqui (sempre 429 + mesma mensagem + mesmo shape). O valor
  // numérico de Retry-After é um sinal bem mais fraco e redundante: quem já
  // está martelando de vários IPs contra o mesmo e-mail já sabe, pelo
  // próprio padrão de tentativas que está enviando, qual limite
  // provavelmente vai bater — homogeneizar pra um teto fixo (ex: sempre os
  // 1800s da conta) tiraria a utilidade real do header pro dono legítimo
  // (que erra a senha 1x e só quer saber quando pode tentar de novo) sem
  // fechar nenhuma brecha adicional de verdade.
  return NextResponse.json(
    { error: 'Muitas tentativas. Tente novamente em instantes.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter ?? fallbackSeconds) } },
  )
}

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json()

    if (!email || !senha) {
      return NextResponse.json({ error: 'Email e senha obrigatorios' }, { status: 400 })
    }

    const emailNormalizado = email.toLowerCase().trim()
    const ip = extractIp(request)
    const accountKey = accountKeyFromEmail(emailNormalizado)

    // Rate limit ANTES de qualquer operação cara (Supabase, bcrypt).
    // Identificador nunca inclui a senha nem o e-mail cru — só IP e o
    // digest opaco da conta. Sucesso não reseta os contadores: a infra
    // atual (checkRateLimit) não expõe reset seletivo de uma chave (só
    // __resetForTests, exclusivo de teste, que limpa tudo) — implementar
    // isso extrapolaria o escopo desta tarefa, mexendo num módulo
    // compartilhado por outras 7 rotas só por UX marginal. A janela expira
    // sozinha; não resetar em sucesso também evita "premiar" um acerto de
    // senha vazada no meio de uma janela de ataque com uma cota nova.
    const rlIp = await checkRateLimit(ip, LOGIN_IP_LIMIT)
    if (!rlIp.allowed) {
      return respostaBloqueada(rlIp.retryAfter, LOGIN_IP_LIMIT.windowSeconds)
    }
    const rlIpAccount = await checkRateLimit(`${ip}:${accountKey}`, LOGIN_IP_ACCOUNT_LIMIT)
    if (!rlIpAccount.allowed) {
      return respostaBloqueada(rlIpAccount.retryAfter, LOGIN_IP_ACCOUNT_LIMIT.windowSeconds)
    }
    // Conta sozinha, sem IP — fecha a lacuna de rotação de IP contra o
    // mesmo e-mail (ver comentário das constantes acima).
    const rlAccount = await checkRateLimit(accountKey, LOGIN_ACCOUNT_LIMIT)
    if (!rlAccount.allowed) {
      return respostaBloqueada(rlAccount.retryAfter, LOGIN_ACCOUNT_LIMIT.windowSeconds)
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', emailNormalizado)
      .single()

    if (error || !admin) {
      return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 })
    }

    const senhaValida = await bcrypt.compare(senha, admin.senha_hash)
    if (!senhaValida) {
      return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 })
    }

    const token = await createToken(admin.id)

    const response = NextResponse.json({ success: true, nome: admin.nome })
    response.cookies.set('dashboard_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: '/'
    })

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
