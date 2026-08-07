import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { createToken } from '@/lib/auth'
import { extractIp } from '@/lib/leads/anti-spam'
import { checkRateLimit } from '@/lib/leads/rate-limit'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'

const SOURCE = 'auth/login'

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

// Hash bcrypt válido, estático, cost factor 10 — o MESMO cost factor usado
// pra gerar hashes reais de admin (ver bcrypt.hash(novaSenha, 10) em
// src/app/api/auth/redefinir-senha/route.ts). Gerado uma única vez em
// desenvolvimento a partir de bytes aleatórios (nunca uma senha real, nunca
// reutilizado em lugar nenhum) — não é segredo, não precisa de env, e não
// pode ser gerado a cada request (isso reintroduziria custo variável).
// Usado só como alvo de bcrypt.compare() quando a conta não existe, pra que
// esse caminho pague o MESMO custo computacional do caminho "conta existe,
// senha errada" — sem isso, e-mail inexistente responde bem mais rápido
// (sem bcrypt) do que e-mail existente (com bcrypt), um sinal mensurável de
// enumeração de contas.
const DUMMY_BCRYPT_HASH = '$2a$10$D7unvNoztzuDkRl2UjPcB.HYpluzPCzwGvhC.PXG7LQKpjXuVBlGO'

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

    // maybeSingle() (não single()) distingue de verdade os três casos: zero
    // linhas devolve { data: null, error: null } (sem erro nenhum — não é
    // "single() não achou" colapsado em PGRST116); mais de uma linha devolve
    // um erro real (PGRST116, sintetizado client-side, ver postgrest-js);
    // qualquer outro problema (timeout, rede, schema) também vem como erro
    // real. Confirmado lendo o source instalado de @supabase/postgrest-js.
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', emailNormalizado)
      .maybeSingle()

    if (error) {
      // Falha real (rede, timeout, schema, ou múltiplas linhas inesperadas
      // — nunca "usuário não encontrado", isso vem sem erro acima). Nunca
      // mascarada como credencial inválida, e nunca disfarçada rodando
      // bcrypt só pra esconder a falha. Só o código categórico vai pro log
      // — nunca email, senha, hash real ou dummy.
      logError(SOURCE, 'falha ao consultar admin_users', undefined, { errorCode: error.code })
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }

    // Daqui em diante, admin === null significa, com certeza, "zero linhas"
    // — não erro. Equaliza estruturalmente os dois caminhos "credencial
    // inválida": conta inexistente e senha errada de conta existente
    // executam exatamente UM bcrypt.compare cada, contra hash real (conta
    // existe) ou hash dummy (conta não existe) — nunca contra hash vazio.
    const hashParaComparar = admin?.senha_hash ?? DUMMY_BCRYPT_HASH
    const senhaValida = await bcrypt.compare(senha, hashParaComparar)

    if (!admin || !senhaValida) {
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
