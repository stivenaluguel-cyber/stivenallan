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
    minimumCacheTTL: 86400,
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
  ],
}

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
