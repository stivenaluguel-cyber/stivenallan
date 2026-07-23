import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

// Mesmo segredo (com o MESMO fallback) usado por middleware.ts e lib/auth.ts.
// Antes desta extração, a maioria das rotas /api/admin/* verificava a
// assinatura contra `process.env.JWT_SECRET!` puro, sem fallback — se essa
// env ficasse vazia (como está hoje em .env.local), o middleware liberava a
// requisição (usa o fallback) mas a rota em si rejeitava o mesmo cookie
// válido com 401. Centralizar aqui garante que middleware, login e todas as
// rotas admin concordam sobre qual segredo valida o token.
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'stiven-dashboard-secret-2026-xk9p3m7q'
)

export async function autenticado(): Promise<boolean> {
  const store = await cookies()
  const token = store.get('dashboard_token')?.value
  if (!token) return false
  try {
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

// Para rotas que precisam do adminId do payload (ex.: notificações de gates
// do Instagram por usuário), não só de um booleano.
export async function adminIdAutenticado(): Promise<string | null> {
  const store = await cookies()
  const token = store.get('dashboard_token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return (payload.adminId as string) ?? null
  } catch {
    return null
  }
}
