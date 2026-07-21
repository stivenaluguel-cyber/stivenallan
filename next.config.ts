import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'estilofontana.com.br' },
      { protocol: 'https', hostname: '*.estilofontana.com.br' },
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ],
    deviceSizes: [390, 768, 1024, 1280, 1536],
    imageSizes: [64, 128, 256, 384, 512],
    // 1 ano (era 86400 = 1 dia) — a cota de Image Optimization Transformations da Vercel
    // (5.000/mês no Hobby) estourou (confirmado no painel de Usage: 5K/5K). Fotos de
    // empreendimento são praticamente estáticas; cache longo faz o Vercel servir a
    // variante já otimizada em vez de re-transformar, sem trocar qualidade/tamanho.
    minimumCacheTTL: 31536000,
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
    { source: '/_next/static/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    { source: '/favicon.ico', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] },
  ],
  redirects: async () => [
    {
      source: '/empreendimento/fontana/monte-leone-ana-lucia-criciuma-sc',
      destination: '/empreendimento/fontana/monte-leone-centro-criciuma-sc',
      permanent: true,
    },
    {
      source: '/empreendimento/fontana/lavis-centro-criciuma-sc',
      destination: '/empreendimento/fontana/lavis-residencial-centro-criciuma-sc',
      permanent: true,
    },
    {
      source: '/empreendimento/fontana/hub-smart-home-criciuma-sc',
      destination: '/empreendimentos',
      permanent: true,
    },
    // Site antigo (www.stivenallan.com.br) — checklist SEO 2026-07-20: essas URLs
    // ainda recebem impressão/clique real no Search Console mas hoje batem 404
    // (o redirect de www só trocava o domínio, mantendo o path morto). Mapeamento
    // 1:1 pros empreendimentos que continuam no portfólio atual. Unidades
    // confirmadas como descontinuadas (Sordello, Volpago, Belfiore, Hexa Prime,
    // Longarone, terrenos/casas avulsas) NÃO entram aqui — não têm equivalente
    // real, então viram 410 em src/middleware.ts em vez de redirect pro catálogo
    // (auditoria SEO 2026-07-21, docs/seo-sprint/2026-07-21/redirects.csv).
    {
      source: '/home',
      destination: '/',
      permanent: true,
    },
    {
      source: '/imovel/residencial-bosco-del-montello-pronto-para-morar-no-centro-de-criciuma-178/AP0097',
      destination: '/empreendimento/fontana/bosco-del-montello-centro-criciuma-sc',
      permanent: true,
    },
    {
      source: '/imovel/residencial-calalzo-di-cadore-modernidade-e-conforto-no-bairro-michel-criciuma-179/AP0098-179',
      destination: '/empreendimento/fontana/calalzo-di-cadore-michel-criciuma-sc',
      permanent: true,
    },
    {
      source: '/imovel/residencial-fidenza-grande-lancamento-no-centro-de-criciuma-182/AP0101-182',
      destination: '/empreendimento/fontana/fidenza-residencial-cruzeiro-do-sul-criciuma-sc',
      permanent: true,
    },
    {
      source: '/imovel/residencial-parco-savello-alto-padrao-no-bairro-santa-barbara-criciuma-sc-192/AP0108',
      destination: '/empreendimento/fontana/parco-savello-santa-barbara-criciuma-sc',
      permanent: true,
    },
    {
      source: '/imovel/residencial-parco-savello-alto-padrao-no-bairro-santa-barbara-criciuma-sc-192/AP0108-192',
      destination: '/empreendimento/fontana/parco-savello-santa-barbara-criciuma-sc',
      permanent: true,
    },
    {
      source: '/imovel/thiene-residencial-sofisticacao-e-conforto-no-centro-de-criciuma-195/AP0111-195',
      destination: '/empreendimento/fontana/thiene-centro-criciuma-sc',
      permanent: true,
    },
    {
      source: '/agendar-visita/thiene-residencial-sofisticacao-e-conforto-no-centro-de-criciuma-195',
      destination: '/empreendimento/fontana/thiene-centro-criciuma-sc',
      permanent: true,
    },
    // Removido o fallback wildcard `/imovel/:path*` e `/agendar-visita/:path*` →
    // /empreendimentos que existia aqui: redirecionava em massa qualquer URL não
    // mapeada (inclusive as 9 unidades confirmadas como descontinuadas) para o
    // catálogo, sem equivalente real — auditoria SEO 2026-07-21 (ver
    // docs/seo-sprint/2026-07-21/baseline.md, achado B1-4). As descontinuadas
    // confirmadas agora respondem 410 (src/middleware.ts); qualquer outra URL
    // antiga não mapeada aqui e não listada como descontinuada cai em 404 padrão
    // — mais correto do que fingir um redirect sem destino real comprovado.
    {
      source: '/imoveis',
      destination: '/empreendimentos',
      permanent: true,
    },
    {
      source: '/imoveis/:path*',
      destination: '/empreendimentos',
      permanent: true,
    },
  ],
}

// Export nomeado só pra teste (tests/next-config-redirects.test.ts) — inspecionar
// nextConfig.redirects() diretamente, sem depender de como withSentryConfig repassa
// (ou não) essa propriedade no objeto default exportado.
export { nextConfig }

// Sentry wrap — source map uploads são no-op sem SENTRY_AUTH_TOKEN,
// stack traces em prod ficam bundled até você adicionar essa env (opcional).
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Deixamos as source maps expostas apenas quando o auth token existir —
  // sem ele, tentar upload retorna warning que polui o build log.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
})
