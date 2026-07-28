#!/usr/bin/env node
// Troca segura do .env.local entre PRODUÇÃO e o projeto descartável, para
// smoke test. Sempre passa pela guarda de scripts/guarda-ambiente-teste.mjs.
//
//   node scripts/smoke-env.mjs usar      # aponta pro descartável
//   node scripts/smoke-env.mjs restaurar # volta ao original
//   node scripts/smoke-env.mjs conferir  # só mostra o alvo atual
//
// A service_role do descartável NÃO fica neste arquivo nem é pedida por
// aqui: ela é lida de ~/.supabase-descartavel-service-role (fora do repo,
// chmod 600) se existir, ou deixada como placeholder para ser colada à mão.
// Nenhum valor de chave é impresso em nenhum momento.

import { readFileSync, writeFileSync, existsSync, copyFileSync, chmodSync, unlinkSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { verificarAlvo } from './guarda-ambiente-teste.mjs'

const REF_DESCARTAVEL = 'qkjzanrcutzxvjiufaob'
const URL_DESCARTAVEL = `https://${REF_DESCARTAVEL}.supabase.co`

const ENV = '.env.local'
const BACKUP = '.env.local.backup-smoke'
const ARQUIVO_SERVICE_ROLE = join(homedir(), '.supabase-descartavel-service-role')
// A anon key do descartável é pública por natureza, mas não fica embutida
// aqui: string de chave em arquivo versionado dispara scanner de segredo à
// toa. As rotas admin usam service_role de qualquer forma — a anon só
// importa para as páginas públicas, que o smoke test do Modo Foco não toca.
const ARQUIVO_ANON = join(homedir(), '.supabase-descartavel-anon')
const PLACEHOLDER = 'COLE_AQUI_A_SERVICE_ROLE_DO_DESCARTAVEL'

function lerUrlAtual() {
  if (!existsSync(ENV)) return null
  const linha = readFileSync(ENV, 'utf8').split('\n').find((l) => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='))
  return linha ? linha.slice('NEXT_PUBLIC_SUPABASE_URL='.length).trim().replace(/^"|"$/g, '') : null
}

function conferir(exigirDescartavel) {
  const r = verificarAlvo(lerUrlAtual(), exigirDescartavel ? { refDescartavelEsperado: REF_DESCARTAVEL } : {})
  console.log(r.ok ? '✅ ' + r.motivo : '❌ ' + r.motivo)
  return r
}

const acao = process.argv[2]

if (acao === 'usar') {
  if (!existsSync(BACKUP)) {
    copyFileSync(ENV, BACKUP)
    chmodSync(BACKUP, 0o600)
    console.log(`Backup do .env.local original criado em ${BACKUP} (chmod 600).`)
  } else {
    console.log(`Backup ${BACKUP} já existe — preservado, não sobrescrito.`)
  }

  let serviceRole = PLACEHOLDER
  if (existsSync(ARQUIVO_SERVICE_ROLE)) {
    serviceRole = readFileSync(ARQUIVO_SERVICE_ROLE, 'utf8').trim()
    console.log('service_role do descartável lida de ~/.supabase-descartavel-service-role (valor não exibido).')
  } else {
    console.log(`⚠️  ${ARQUIVO_SERVICE_ROLE} não existe — SUPABASE_SERVICE_ROLE_KEY ficará como placeholder.`)
  }

  const anon = existsSync(ARQUIVO_ANON) ? readFileSync(ARQUIVO_ANON, 'utf8').trim() : null

  const linhas = readFileSync(BACKUP, 'utf8').split('\n').map((l) => {
    if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) return 'NEXT_PUBLIC_SUPABASE_URL=' + URL_DESCARTAVEL
    if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=') && anon) return 'NEXT_PUBLIC_SUPABASE_ANON_KEY=' + anon
    if (l.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) return 'SUPABASE_SERVICE_ROLE_KEY=' + serviceRole
    return l
  })
  writeFileSync(ENV, linhas.join('\n'))

  const r = conferir(true)
  if (!r.ok) process.exit(1)
  if (serviceRole === PLACEHOLDER) {
    console.log('⚠️  Ainda falta a service_role: o app não vai conseguir ler o banco até ela ser preenchida.')
    process.exit(2)
  }
} else if (acao === 'restaurar') {
  if (!existsSync(BACKUP)) {
    console.log(`❌ ${BACKUP} não existe — nada a restaurar (o .env.local pode já ser o original).`)
    process.exit(1)
  }
  copyFileSync(BACKUP, ENV)
  unlinkSync(BACKUP)
  console.log('.env.local restaurado a partir do backup; backup temporário removido.')
  const ref = verificarAlvo(lerUrlAtual())
  // Aqui o esperado é justamente voltar a apontar pra produção.
  console.log(ref.ref === 'xpkznaqgctfkoonqpcye'
    ? '✅ Voltou a apontar para produção (estado normal de desenvolvimento).'
    : `ℹ️  Alvo atual: ${ref.ref ?? 'desconhecido'}`)
} else if (acao === 'conferir') {
  process.exit(conferir(false).ok ? 0 : 1)
} else {
  console.log('Uso: node scripts/smoke-env.mjs usar|restaurar|conferir')
  process.exit(1)
}
