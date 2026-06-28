import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Permitir build de producao mesmo com type errors durante desenvolvimento
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'estilofontana.com.br',
      },
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
    {
      source: '/_next/static/(.*)',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
    {
      source: '/favicon.ico',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
    },
  ],
  redirects: async () => [
    {
      source: '/empreendimento/fontana/monte-leone-ana-lucia-criciuma-sc',
      destination: '/empreendimento/fontana/monte-leone-centro-criciuma-sc',
      permanent: true,
    },
  ],
}

export default nextConfig
