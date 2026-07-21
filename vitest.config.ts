import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // tsconfig.json usa jsx: "preserve" (o Next.js faz o próprio transform via SWC no
  // build da app) — sem isso, o Vite (oxc, nesta versão) tenta "preservar" o JSX ao
  // transformar arquivos .tsx pro Vitest e falha ao importar um componente React
  // direto num teste. Só afeta a transformação de arquivos pelo test runner, não o
  // build/tsconfig do app.
  oxc: {
    jsx: { runtime: 'automatic' },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'],
    globals: false,
    clearMocks: true,
  },
})
