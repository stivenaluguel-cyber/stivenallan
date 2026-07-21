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

// URLs do site antigo (Voa Corretor / www.stivenallan.com.br) confirmadas como
// unidades descontinuadas: sem equivalente real no portfólio atual (dado de
// negócio + inventário de Search Console, auditoria SEO 2026-07-21 — ver
// docs/seo-sprint/2026-07-21/redirects.csv). Redirecionar essas pro catálogo
// simularia uma equivalência que não existe; 410 é o sinal correto para o Google.
const GONE_PATHS = new Set([
  '/imovel/residencial-sordello-lancamento-ao-lado-do-combo-atacadista-em-criciuma-194/AP0110-194',
  '/imovel/residencial-volpago-del-montello-conforto-e-praticidade-em-criciuma-200/AP0115-200',
  '/imovel/belfiore-residencial-conforto-e-sofisticacao-no-bairro-michel-criciuma-176/AP0095-176',
  '/imovel/hexa-prime-residence-conforto-e-modernidade-em-um-so-lugar-173/AP0094-173',
  '/imovel/longarone-residencial-alto-padrao-da-construtora-fontana-em-criciuma-185/AP0103-185',
  '/imovel/casa-alto-padrao-no-bairro-santa-barbara-criciuma-sc-3-suites-piscina-e-localizacao-privilegiada-174/CA0012-174',
  '/imovel/apartamento-a-venda-em-criciuma-centro-com-3-quartos-169-38m',
  '/imovel/loteamento-murialdo-terrenos-de-163m-a-partir-de-rs-163-000-em-orleans-sc-com-vista-deslumbrante-da-serra-catarinense-169/TE0014-169',
  '/imovel/terrenos-em-condominio-fechado-de-alto-padrao-no-bairro-sao-simao-criciuma-sc-161/TE0006-161',
])

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (GONE_PATHS.has(pathname)) {
    return new NextResponse(null, { status: 410 })
  }

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
  matcher: [
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/imovel/residencial-sordello-lancamento-ao-lado-do-combo-atacadista-em-criciuma-194/AP0110-194',
    '/imovel/residencial-volpago-del-montello-conforto-e-praticidade-em-criciuma-200/AP0115-200',
    '/imovel/belfiore-residencial-conforto-e-sofisticacao-no-bairro-michel-criciuma-176/AP0095-176',
    '/imovel/hexa-prime-residence-conforto-e-modernidade-em-um-so-lugar-173/AP0094-173',
    '/imovel/longarone-residencial-alto-padrao-da-construtora-fontana-em-criciuma-185/AP0103-185',
    '/imovel/casa-alto-padrao-no-bairro-santa-barbara-criciuma-sc-3-suites-piscina-e-localizacao-privilegiada-174/CA0012-174',
    '/imovel/apartamento-a-venda-em-criciuma-centro-com-3-quartos-169-38m',
    '/imovel/loteamento-murialdo-terrenos-de-163m-a-partir-de-rs-163-000-em-orleans-sc-com-vista-deslumbrante-da-serra-catarinense-169/TE0014-169',
    '/imovel/terrenos-em-condominio-fechado-de-alto-padrao-no-bairro-sao-simao-criciuma-sc-161/TE0006-161',
  ]
}
