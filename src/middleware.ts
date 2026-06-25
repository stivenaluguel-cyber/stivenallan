import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'stiven-dashboard-secret-2026-xk9p3m7q'
)

// Rotas publicas que nao precisam de autenticacao
const PUBLIC_PATHS = [
  '/dashboard/login',
  '/dashboard/esqueci-senha',
  '/dashboard/redefinir-senha',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/esqueci-senha',
  '/api/auth/redefinir-senha',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isDashboard = pathname.startsWith('/dashboard')
  const isAdminApi = pathname.startsWith('/api/admin')

  if (!isDashboard && !isAdminApi) {
    return NextResponse.next()
  }

  // Verificar se eh rota publica
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('dashboard_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/dashboard/login', request.url))
  }

  try {
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch {
    const response = NextResponse.redirect(new URL('/dashboard/login', request.url))
    response.cookies.delete('dashboard_token')
    return response
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*']
}
