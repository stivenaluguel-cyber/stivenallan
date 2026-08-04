import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // next-env.d.ts é gerado pelo próprio Next.js a cada build/dev — o
    // arquivo tem um aviso próprio ("This file should not be edited"), então
    // não faz sentido lintar nem tentar corrigir a triple-slash reference dele.
    ignores: ['.next/**', 'node_modules/**', '.claude/**', 'next-env.d.ts'],
  },
  {
    // P2-6 (revisão independente): dívida de lint pré-existente, de ANTES
    // desta branch — 78 usos de `any` só em código de dashboard/CRM/leads
    // (rotas admin, fila de foco, mudança de estágio de lead, etc.). Corrigir
    // cada um exigiria mapear o formato real dos dados vindos do Supabase e
    // de webhooks externos por função, o que é arriscado demais pra fazer às
    // cegas dentro desta branch (o objetivo aqui é acessibilidade/UX do site
    // público, não uma tipagem completa do dashboard interno).
    //
    // Exceção documentada e escopada só a estes arquivos — não é uma licença
    // geral pra usar `any` em código novo. Qualquer arquivo fora desta lista
    // continua com a regra padrão do next/typescript.
    files: [
      'src/app/admin/empreendimentos/page.tsx',
      'src/app/admin/page.tsx',
      'src/app/api/admin/ativacoes/route.test.ts',
      'src/app/api/admin/construtoras/route.ts',
      'src/app/api/admin/empreendimentos/\\[id\\]/route.test.ts',
      'src/app/api/admin/empreendimentos/\\[id\\]/route.ts',
      'src/app/api/admin/empreendimentos/route.ts',
      'src/app/api/admin/focus/events/route.test.ts',
      'src/app/api/admin/propostas/route.test.ts',
      'src/app/api/cron/leads-retention/route.ts',
      'src/app/dashboard/empreendimentos/novo/page.tsx',
      'src/app/dashboard/leads/page.tsx',
      'src/lib/agent.ts',
      'src/lib/dashboard/focus-queue-server.ts',
      'src/lib/dashboard/focus-session-events.test.ts',
      'src/lib/dashboard/focus-session-events.ts',
      'src/lib/leads/delete-lead.ts',
      'src/lib/leads/registrar-mudanca-estagio.test.ts',
      'src/lib/leads/registrar-mudanca-estagio.ts',
      'src/lib/supabase.ts',
      'src/lib/vitrine.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]

export default eslintConfig
