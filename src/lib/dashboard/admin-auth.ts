import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { getJwtSecret } from '@/lib/auth-secret'

// Verificação de sessão admin em um lugar só. Antes, 25 rotas sob
// /api/admin repetiam este mesmo bloco de jwtVerify inline, em 3 variações
// levemente diferentes (algumas devolvendo boolean, outras o adminId) — o
// que significa que qualquer endurecimento futuro precisaria ser aplicado
// 25 vezes sem esquecer nenhuma.
//
// Devolve o adminId (não um boolean) porque escopar dados por admin exige
// a identidade, não só "está logado" — mesmo o projeto sendo single-operator
// hoje.
export async function requireAdmin(): Promise<string | null> {
  const store = await cookies()
  const token = store.get('dashboard_token')?.value
  if (!token) return null
  const secret = getJwtSecret()
  if (!secret) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return (payload.adminId as string) ?? null
  } catch {
    return null
  }
}
