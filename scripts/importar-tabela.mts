/**
 * Importa uma tabela Fontana a partir do TEXTO já extraído, sem passar pelo
 * navegador.
 *
 * Existe porque importar pela UI custava o PDF inteiro duas vezes no contexto
 * do assistente — ler e redigitar —, e foi redigitando que um rodapé chegou
 * abreviado ao parser. Aqui o texto vai de arquivo direto para o parser.
 *
 * Roda com a service key, então PULA o `requireAdmin` da rota. É script de
 * manutenção, não porta de entrada. As travas que importam são as mesmas,
 * importadas do mesmo arquivo, e na mesma ordem da rota.
 *
 *   npx tsx scripts/importar-tabela.mts <slug> <arquivo.txt> [--confirmar]
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { paraUnidadeDoBanco, parsearTabelaFontana } from '../src/lib/unidades/importar-tabela-fontana'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')]),
)

const [slug, arquivo] = process.argv.slice(2)
const confirmar = process.argv.includes('--confirmar')
if (!slug || !arquivo) {
  console.error('uso: npx tsx scripts/importar-tabela.mts <slug> <arquivo.txt> [--confirmar]')
  process.exit(1)
}

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const brl = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const { data: emp } = await sb.from('empreendimentos').select('id, nome').eq('slug', slug).maybeSingle()
if (!emp) { console.error(`Empreendimento não encontrado: ${slug}`); process.exit(1) }

const { data: cubRow } = await sb.from('configuracoes_cub')
  .select('valor_m2').order('mes_referencia', { ascending: false }).limit(1).maybeSingle()
const cubSistema = cubRow?.valor_m2 ? Number(cubRow.valor_m2) : null

const r = parsearTabelaFontana(readFileSync(arquivo, 'utf8'), cubSistema)

console.log(`\n=== ${emp.nome} (${slug}) ===`)
console.log(`unidades lidas: ${r.unidades.length} | rejeitadas: ${r.rejeitadas.length}`)
for (const x of r.rejeitadas) console.log(`  REJEITADA ${x.unidade}: ${x.motivo}`)
console.log(`conferência de linhas: ${r.conferenciaLinhas.lidas}/${r.conferenciaLinhas.esperado} → ${r.conferenciaLinhas.confere}`)
console.log(`CUB: impresso ${r.conferenciaCub.impresso} · sistema ${r.conferenciaCub.sistema} → ${r.conferenciaCub.confere}`)
for (const s of r.conferenciaRodape) console.log(`rodapé · ${s.sinal}: PDF=${s.noTexto} lido=${s.lido} → ${s.confere}`)
const c = r.cabecalho
console.log(`cabeçalho: ${c.parcelas_qtd}x + ${c.reforcos_qtd} reforços · entrega ${c.previsao_entrega} · à vista ${c.desconto_a_vista_pct ?? '—'}%`)
for (const o of c.opcoes_pagamento) {
  console.log(`opção ${o.tipo}: desc=${o.descontoPct ?? '—'} chaves=${o.ateAsChavesPct ?? '—'} ato=${o.atoMinimoPct ?? '—'} ${o.meses ?? '—'}m`)
}

console.log('\n| Un. | Bloco | Box | Dorm | Suítes | m² | Total | Entrada | Parcela | Reforço | Saldo | CUB |')
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|')
for (const u of r.unidades) {
  console.log(`| ${u.unidade} | ${u.bloco ?? '—'} | ${u.box_codigo ?? '—'} | ${u.dormitorios} | ${u.suites} | ${brl(u.metragem)} | ${brl(u.valor_tabela)} | ${brl(u.valor_entrada_min)} | ${brl(u.parcela_mensal)} | ${brl(u.reforco_anual)} | ${brl(u.saldo_financiamento)} | ${u.cub_fator} |`)
}

// ── As mesmas travas da rota, na mesma ordem ──────────────────────────
const parar = (msg: string) => { console.error(`\nBLOQUEADO: ${msg}`); process.exit(2) }
if (r.unidades.length === 0) parar('nenhuma unidade válida na tabela')
if (r.conferenciaLinhas.confere === false) {
  parar(`o PDF tem ${r.conferenciaLinhas.esperado} linhas e o parser reconheceu ${r.conferenciaLinhas.lidas}. Alguma linha não foi vista.`)
}
const perdidos = r.conferenciaRodape.filter((x) => !x.confere)
if (perdidos.length > 0) parar('rodapé com condição não lida: ' + perdidos.map((x) => `${x.sinal}=${x.noTexto}`).join('; '))
if (r.conferenciaCub.confere === false) parar(`CUB divergente: tabela ${r.conferenciaCub.impresso}, sistema ${r.conferenciaCub.sistema}`)

if (!confirmar) { console.log('\n(prévia — nada gravado. Use --confirmar para gravar.)'); process.exit(0) }

const { data: existentes } = await sb.from('empreendimentos_unidades')
  .select('unidade, disponivel').eq('empreendimento_id', emp.id)
const vendidas = new Set((existentes ?? []).filter((u) => u.disponivel === false).map((u) => u.unidade as string))

const linhas = r.unidades.map((u) => {
  const linha = paraUnidadeDoBanco(u, emp.id, c.financiamento_direto, c.opcoes_pagamento, c.previsao_entrega)
  if (vendidas.has(u.unidade)) linha.disponivel = false  // a construtora não sabe o que você já vendeu
  return linha
})

const { data, error } = await sb.from('empreendimentos_unidades')
  .upsert(linhas, { onConflict: 'empreendimento_id,unidade' }).select('id')
if (error) { console.error(`\nERRO ao gravar: ${error.message}`); process.exit(1) }
console.log(`\nGRAVADAS: ${data?.length} unidades${vendidas.size ? ` (${vendidas.size} vendidas preservadas)` : ''}`)
