#!/usr/bin/env node
// Validador de SEO sobre HTML renderizado — sem dependências novas (usa fetch nativo do Node).
// Uso: node scripts/seo-validate.mjs <base-url> <path1> <path2> ...
// Ex.:  node scripts/seo-validate.mjs http://localhost:3000 / /empreendimentos /guia/financiamento-direto-construtora
//
// Separa achados em:
//   erro   — title ausente, canonical ausente/errado, noindex indevido (página deveria ser indexável)
//   alerta — H1 múltiplo, title/description parecidos entre páginas distintas do lote

const baseUrl = process.argv[2]
const paths = process.argv.slice(3)

if (!baseUrl || paths.length === 0) {
  console.error('Uso: node scripts/seo-validate.mjs <base-url> <path1> [path2] ...')
  process.exit(1)
}

function extract(html, regex) {
  const matches = [...html.matchAll(regex)]
  return matches.map((m) => m[1])
}

async function checkPath(path) {
  const url = baseUrl.replace(/\/$/, '') + path
  const res = await fetch(url, { redirect: 'manual' })
  const status = res.status
  const isRedirectOrGone = status >= 300
  const html = isRedirectOrGone ? '' : await res.text()

  const titles = extract(html, /<title>([^<]*)<\/title>/g)
  const canonicals = extract(html, /<link rel="canonical" href="([^"]*)"\s*\/?>/g)
  const robotsMeta = extract(html, /<meta name="robots" content="([^"]*)"\s*\/?>/g)
  const h1s = extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/g).map((h) => h.replace(/<[^>]+>/g, '').trim())

  const errors = []
  const alerts = []

  if (!isRedirectOrGone) {
    if (titles.length === 0) errors.push('title ausente')
    if (canonicals.length === 0) errors.push('canonical ausente')
    if (canonicals.length > 0 && !canonicals[0].startsWith('https://stivenallan.com.br')) {
      errors.push(`canonical fora do domínio canônico: ${canonicals[0]}`)
    }
    const robots = robotsMeta[0] || ''
    const declaraNoindex = /noindex/i.test(robots)
    if (declaraNoindex && !path.startsWith('/lp/') && path !== '/casa-guaiba-park') {
      errors.push(`noindex indevido (robots: "${robots}")`)
    }
    if (h1s.length > 1) alerts.push(`H1 múltiplo (${h1s.length} ocorrências)`)
    if (h1s.length === 0) alerts.push('H1 ausente')
  }

  return { path, status, title: titles[0] || null, canonical: canonicals[0] || null, robots: robotsMeta[0] || null, h1: h1s[0] || null, errors, alerts }
}

const results = []
for (const path of paths) {
  try {
    results.push(await checkPath(path))
  } catch (e) {
    results.push({ path, status: 'ERRO_FETCH', errors: [String(e)], alerts: [] })
  }
}

// Alerta cruzado: title/description muito parecidos entre páginas distintas do lote
const byTitle = new Map()
for (const r of results) {
  if (!r.title) continue
  const key = r.title.trim().toLowerCase()
  if (!byTitle.has(key)) byTitle.set(key, [])
  byTitle.get(key).push(r.path)
}
for (const [title, pathsWithTitle] of byTitle) {
  if (pathsWithTitle.length > 1) {
    for (const p of pathsWithTitle) {
      const r = results.find((x) => x.path === p)
      r.alerts.push(`title idêntico a outra(s) página(s) do lote: ${pathsWithTitle.filter((x) => x !== p).join(', ')}`)
    }
  }
}

let totalErrors = 0
let totalAlerts = 0
for (const r of results) {
  console.log(`\n${r.path} — HTTP ${r.status}`)
  if (r.title) console.log(`  title: ${r.title}`)
  if (r.canonical) console.log(`  canonical: ${r.canonical}`)
  if (r.robots) console.log(`  robots: ${r.robots}`)
  if (r.h1) console.log(`  h1: ${r.h1}`)
  for (const e of r.errors) { console.log(`  ERRO: ${e}`); totalErrors++ }
  for (const a of r.alerts) { console.log(`  ALERTA: ${a}`); totalAlerts++ }
}

console.log(`\n--- Resumo: ${results.length} URLs, ${totalErrors} erro(s), ${totalAlerts} alerta(s) ---`)
process.exit(totalErrors > 0 ? 1 : 0)
