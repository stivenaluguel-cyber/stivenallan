#!/usr/bin/env node
// Guarda de ambiente para seed e smoke test.
//
// Existe porque um smoke test anterior rodou contra o banco de PRODUÇÃO e
// alterou uma sessão real. Conferir o .env "no olho" não é suficiente:
// qualquer script que escreva dados precisa abortar sozinho se o alvo for
// produção.
//
// Uso:
//   node scripts/guarda-ambiente-teste.mjs            → valida e imprime o ref
//   node scripts/guarda-ambiente-teste.mjs --exigir-descartavel
//
// Nunca imprime valores de chaves — só o project ref, que não é segredo
// (aparece na própria URL pública do projeto).

import { readFileSync, existsSync } from 'node:fs'

// Produção. Se o alvo for este ref, aborta — sem exceção, sem flag de
// override. Um override existiria só para ser usado por engano.
export const PROJECT_REF_PRODUCAO = 'xpkznaqgctfkoonqpcye'

export function extrairProjectRef(supabaseUrl) {
  if (typeof supabaseUrl !== 'string' || !supabaseUrl) return null
  const m = supabaseUrl.match(/^https:\/\/([a-z0-9]+)\.supabase\.(co|in)/i)
  return m ? m[1].toLowerCase() : null
}

export function verificarAlvo(supabaseUrl, { refDescartavelEsperado } = {}) {
  const ref = extrairProjectRef(supabaseUrl)

  if (!ref) {
    return { ok: false, ref: null, motivo: 'NEXT_PUBLIC_SUPABASE_URL ausente ou em formato inesperado — não dá para saber qual banco seria usado.' }
  }
  if (ref === PROJECT_REF_PRODUCAO) {
    return { ok: false, ref, motivo: `ALVO É PRODUÇÃO (${ref}). Abortando: seed e smoke test nunca podem escrever em produção.` }
  }
  if (refDescartavelEsperado && ref !== refDescartavelEsperado) {
    return { ok: false, ref, motivo: `Alvo (${ref}) não é o descartável esperado (${refDescartavelEsperado}).` }
  }
  return { ok: true, ref, motivo: `Alvo confirmado como descartável: ${ref}` }
}

function lerEnvLocal(caminho) {
  if (!existsSync(caminho)) return {}
  const out = {}
  for (const linha of readFileSync(caminho, 'utf8').split('\n')) {
    if (!linha.includes('=') || linha.trimStart().startsWith('#')) continue
    const i = linha.indexOf('=')
    let v = linha.slice(i + 1).trim()
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
    out[linha.slice(0, i).trim()] = v
  }
  return out
}

// Executado direto (não importado por teste)
if (process.argv[1] && process.argv[1].endsWith('guarda-ambiente-teste.mjs')) {
  const env = lerEnvLocal('.env.local')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
  const esperado = process.env.REF_DESCARTAVEL_ESPERADO || null

  const r = verificarAlvo(url, { refDescartavelEsperado: esperado })
  console.log(r.ok ? '✅ ' + r.motivo : '❌ ' + r.motivo)
  process.exit(r.ok ? 0 : 1)
}
