import { timingSafeEqual } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'

// Fonte única de verdade pra autenticação dos endpoints /api/cron/*. Antes,
// cada rota repetia `authHeader !== 'Bearer ' + process.env.CRON_SECRET`
// inline — além de duplicado, essa comparação tem um edge case sério: se
// CRON_SECRET não estiver configurado na Vercel, a expressão vira
// literalmente "Bearer undefined", e uma requisição real mandando o header
// "Authorization: Bearer undefined" autenticava. Mesmo padrão de
// centralização já usado pra sessão admin (requireAdmin, em admin-auth.ts).

export type CronAuthResult =
  | { ok: true }
  | { ok: false; reason: 'missing_secret' | 'unauthorized' }

function getCronSecret(): string | null {
  // .trim() pega tanto string vazia quanto só-espaços — mesmo idioma de
  // getJwtSecret() em auth-secret.ts. Servidor mal configurado (segredo
  // ausente/vazio/espaços) tem que falhar fechado, nunca aceitar qualquer
  // Authorization "porque a comparação deu match com undefined/vazio".
  const value = process.env.CRON_SECRET?.trim()
  return value ? value : null
}

// Puro — sem NextRequest/NextResponse — pra ser testável isoladamente.
export function autenticarCron(authorizationHeader: string | null): CronAuthResult {
  const secret = getCronSecret()
  if (!secret) return { ok: false, reason: 'missing_secret' }

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return { ok: false, reason: 'unauthorized' }
  }

  const recebido = authorizationHeader.slice('Bearer '.length)
  if (!recebido) return { ok: false, reason: 'unauthorized' }

  const esperadoBuf = Buffer.from(secret)
  const recebidoBuf = Buffer.from(recebido)
  // Tamanhos diferentes: timingSafeEqual lança RangeError em vez de devolver
  // false. Comparar o length antes não reintroduz o timing leak que essa
  // função existe pra evitar — o que importa proteger é o CONTEÚDO do
  // segredo, não o seu tamanho (mesmo raciocínio de evolution-webhook-auth.ts).
  if (esperadoBuf.length !== recebidoBuf.length) return { ok: false, reason: 'unauthorized' }
  if (!timingSafeEqual(esperadoBuf, recebidoBuf)) return { ok: false, reason: 'unauthorized' }

  return { ok: true }
}

// Wrapper de conveniência pras rotas: devolve a Response pronta (401/503)
// quando a autenticação falha, ou null quando pode seguir. Concentrar a
// tradução reason→status aqui garante que os 4 crons usem exatamente a
// mesma mensagem/código — não decidem isso cada um por conta própria.
//
// Nunca loga CRON_SECRET, o Authorization recebido, nem partes/comprimento
// do segredo — só o motivo categórico (missing_secret | unauthorized).
export function verificarAutenticacaoCron(req: NextRequest | { headers: { get(name: string): string | null } }): NextResponse | null {
  const result = autenticarCron(req.headers.get('authorization'))
  if (result.ok) return null

  if (result.reason === 'missing_secret') {
    return NextResponse.json({ error: 'Cron não configurado' }, { status: 503 })
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
