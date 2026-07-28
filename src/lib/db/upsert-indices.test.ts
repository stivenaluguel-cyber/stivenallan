import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

// Guarda de regressao para uma classe de bug que ja quebrou producao em
// silencio (2026-07-28, conversao lead -> cliente):
//
// O Postgres NAO consegue inferir um indice unico PARCIAL
// (create unique index ... where <predicado>) num "ON CONFLICT (col)" a menos
// que o predicado seja repetido na query. O supabase-js nao expoe isso no
// .upsert(payload, { onConflict: 'col' }) — entao um alvo de onConflict que so
// tenha indice parcial falha em runtime com
//   "there is no unique or exclusion constraint matching the ON CONFLICT specification".
//
// Pior: varios callers (ex: registrarMudancaEstagio) apenas logam o erro em vez
// de lancar, entao a falha nao aparece pra ninguem — o fluxo principal segue
// normal e o efeito colateral simplesmente nunca acontece.
//
// Este teste e ESTATICO (le o codigo e as migrations em disco). Ele nao
// substitui verificacao contra um Postgres real — testes unitarios com o client
// do Supabase mockado nao pegam semantica de constraint, que foi exatamente por
// que o bug original passou. Ele existe pra travar a regressao obvia: alguem
// adicionar/alterar um onConflict cujo alvo nao tenha indice unico TOTAL
// declarado em nenhuma migration.

const ROOT = join(__dirname, '..', '..', '..')
const SRC = join(ROOT, 'src')
const MIGRATIONS = join(ROOT, 'supabase', 'migrations')

function arquivos(dir: string, ext: string[], acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue
      arquivos(full, ext, acc)
    } else if (ext.some((e) => entry.name.endsWith(e))) {
      acc.push(full)
    }
  }
  return acc
}

/** Normaliza "admin_id,data, tipo" -> "admin_id,data,tipo" pra comparar. */
function normalizaColunas(raw: string): string {
  return raw.split(',').map((c) => c.trim().toLowerCase()).filter(Boolean).join(',')
}

function alvosDeOnConflict(): { colunas: string; arquivo: string }[] {
  const alvos: { colunas: string; arquivo: string }[] = []
  for (const arquivo of arquivos(SRC, ['.ts', '.tsx'])) {
    if (arquivo.includes('.test.')) continue
    const conteudo = readFileSync(arquivo, 'utf8')
    for (const m of conteudo.matchAll(/onConflict:\s*['"]([^'"]+)['"]/g)) {
      alvos.push({ colunas: normalizaColunas(m[1]), arquivo: arquivo.replace(ROOT + '/', '') })
    }
  }
  return alvos
}

/**
 * Conjuntos de colunas que tem indice/constraint unico TOTAL (sem WHERE) em
 * alguma migration. Cobre as tres formas usadas no projeto:
 *   create unique index ... on tabela (cols)
 *   alter table ... add constraint ... unique (cols)
 *   constraint nome unique (cols)   [inline no create table]
 */
function colunasComUniqueTotal(): Set<string> {
  const totais = new Set<string>()
  const sqls = readdirSync(MIGRATIONS)
    .filter((f) => f.endsWith('.sql'))
    .map((f) => readFileSync(join(MIGRATIONS, f), 'utf8'))
    .join('\n')

  // create unique index [if not exists] nome on tabela [using btree] (cols) [where ...]
  for (const m of sqls.matchAll(/create\s+unique\s+index[\s\S]*?\(([^)]+)\)([^;]*);/gi)) {
    const temWhere = /\bwhere\b/i.test(m[2])
    if (!temWhere) totais.add(normalizaColunas(m[1]))
  }
  // constraint ... unique (cols)  — inline ou via alter table
  for (const m of sqls.matchAll(/\bunique\s*\(([^)]+)\)/gi)) {
    totais.add(normalizaColunas(m[1]))
  }
  return totais
}

describe('upsert onConflict exige indice unico TOTAL', () => {
  it('todo alvo de onConflict tem unique total declarado em alguma migration', () => {
    const alvos = alvosDeOnConflict()
    // Sanidade: se o regex parar de casar, o teste vira um no-op silencioso.
    expect(alvos.length).toBeGreaterThan(0)

    const totais = colunasComUniqueTotal()
    const semCobertura = alvos.filter((a) => !totais.has(a.colunas))

    expect(
      semCobertura,
      'onConflict sem indice unico TOTAL (upsert falha em runtime): ' +
        JSON.stringify(semCobertura, null, 2),
    ).toEqual([])
  })

  it('crm_clientes.lead_id usa indice total, nao parcial (regressao do bug de 2026-07-28)', () => {
    const sqls = readdirSync(MIGRATIONS)
      .filter((f) => f.endsWith('.sql'))
      .sort()
      .map((f) => readFileSync(join(MIGRATIONS, f), 'utf8'))
      .join('\n')

    // O ultimo create do indice de lead_id (ordem cronologica dos arquivos)
    // nao pode ter WHERE — senao o upsert de conversao lead -> cliente quebra.
    const criacoes = [...sqls.matchAll(/create\s+unique\s+index[^;]*crm_clientes\s*\(\s*lead_id\s*\)([^;]*);/gi)]
    expect(criacoes.length).toBeGreaterThan(0)
    const ultima = criacoes[criacoes.length - 1]
    expect(/\bwhere\b/i.test(ultima[1])).toBe(false)
  })
})
