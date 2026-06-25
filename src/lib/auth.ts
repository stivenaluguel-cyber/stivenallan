import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'stiven-dashboard-secret-2026-xk9p3m7q'
)

export async function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function createToken(adminId: string): Promise<string> {
  return await new SignJWT({ adminId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<{ adminId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { adminId: payload.adminId as string }
  } catch {
    return null
  }
}

export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('dashboard_token')?.value || null
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthCookie()
  if (!token) return false
  const payload = await verifyToken(token)
  return payload !== null
}

export async function getAdminUser() {
  const token = await getAuthCookie()
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null

  const supabase = await getSupabaseAdmin()
  const { data } = await supabase
    .from('admin_users')
    .select('id, email, nome')
    .eq('id', payload.adminId)
    .single()

  return data
}
