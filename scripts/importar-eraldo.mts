/**
 * Importa tabela da Construtora Eraldo.
 *
 *   npx tsx scripts/importar-eraldo.mts <slug> <arquivo.txt> [--confirmar]
 *                                       [--unidades 304,405,606]
 *
 * O Eraldo NÃO tem a repetição do CUB que sustenta a conferência de linhas nas
 * tabelas da Fontana, e as 9 tabelas dele não compartilham nem a estrutura de
 * pagamento (o Gran Michel é 10/5/15/70 em cinco colunas; o L'Essence tem
 * menos valores por unidade). Sem redundância no arquivo, a conferência
 * automática é substituída pela LISTA DECLARADA — o corretor confere a tabela
 * impressa contra o PDF e declara as unidades. Mesmo mecanismo do Pavia.
 *
 * O que continua automático e bloqueia: as invariantes por linha (entrada =
 * 10% do preço, pós-chaves = 70%) e a exigência de que as quantidades
 * derivadas de reforços e mensais deem inteiro e sejam IGUAIS em todas as
 * unidades — se uma coluna for lida errada, isso não fecha.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { parsearTabelaEraldo } from '../src/lib/unidades/importar-tabela-eraldo'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')]),
)

const [slug, arquivo] = process.argv.slice(2)
const confirmar = process.argv.includes('--confirmar')
const iL = process.argv.indexOf('--unidades')
const lista = iL >= 0 ? process.argv[iL + 1].split(',').map((u) => u.trim()) : null
if (!slug || !arquivo) { console.error('uso: npx tsx scripts/importar-eraldo.mts <slug> <arquivo.txt> [--confirmar] [--unidades ...]'); process.exit(1) }

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const brl = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const { data: emp } = await sb.from('empreendimentos').select('id, nome').eq('slug', slug).maybeSingle()
if (!emp) { console.error(`Empreendimento não encontrado: ${slug}`); process.exit(1) }

const r = parsearTabelaEraldo(readFileSync(arquivo, 'utf8'))

console.log(`\n=== ${emp.nome} (${slug}) ===`)
console.log(`unidades lidas: ${r.unidades.length} | rejeitadas: ${r.rejeitadas.length}`)
for (const x of r.rejeitadas) console.log(`  REJEITADA ${x.unidade}: ${x.motivo}`)
const c = r.cabecalho
console.log(`percentuais: ${c.percentuais ? c.percentuais.map((p) => `${(p * 100).toFixed(0)}%`).join(' / ') : 'NÃO LIDOS'} · pós-chaves até ${c.pos_chaves_meses ?? '—'}x · CUB ${c.cub_valor ?? '—'}`)
console.log(`quantidades derivadas: ${r.quantidades.reforcos ?? '?'} reforços · ${r.quantidades.mensais ?? '?'} mensais`)

console.log('\n| Un. | Vagas | Depósito | m² priv. | m² gar.+dep. | m² total | Preço | Entrada | Reforço | Mensal | Pós-chaves |')
console.log('|---|---|---|---|---|---|---|---|---|---|---|')
for (const u of r.unidades) {
  console.log(`| ${u.unidade} | ${u.vagas ?? '—'} | ${u.deposito ?? '—'} | ${brl(u.metragem)} | ${brl(u.metragem_garagem_deposito)} | ${brl(u.metragem_total)} | ${brl(u.preco)} | ${brl(u.entrada)} | ${u.reforcos_qtd}x ${brl(u.reforco)} | ${u.mensais_qtd}x ${brl(u.mensal)} | ${brl(u.pos_chaves)} |`)
}

const parar = (m: string) => { console.error(`\nBLOQUEADO: ${m}`); process.exit(2) }
if (r.unidades.length === 0) parar('nenhuma unidade válida na tabela')
if (r.rejeitadas.length > 0) parar(`${r.rejeitadas.length} linha(s) rejeitada(s) — confira antes de importar`)
if (!c.percentuais) parar('percentuais do cabeçalho não lidos; sem eles as invariantes não valem')
if (r.quantidades.reforcos === null || r.quantidades.mensais === null) {
  parar('as quantidades derivadas de reforços/mensais divergem entre unidades — alguma coluna foi lida errado')
}

let unidades = r.unidades
if (lista) {
  const lidas = new Set(unidades.map((u) => u.unidade))
  const faltando = lista.filter((u) => !lidas.has(u))
  const sobrando = unidades.filter((u) => !lista.includes(u.unidade))
  console.log(`\n*** CONFERÊNCIA AUTOMÁTICA SUBSTITUÍDA POR LISTA DECLARADA (${lista.length} unidades) ***`)
  for (const u of sobrando) console.log(`  FORA da lista, descartada: ${u.unidade} (${brl(u.preco)}, ${brl(u.metragem)} m²)`)
  if (faltando.length > 0) parar(`a lista pede ${faltando.join(', ')} e o parser não leu`)
  unidades = unidades.filter((u) => lista.includes(u.unidade))
} else {
  console.log('\n*** SEM CONFERÊNCIA DE CONTAGEM: o Eraldo não tem redundância no arquivo.')
  console.log('    Confira a tabela acima contra o PDF e use --unidades para declarar. ***')
}

if (!confirmar) { console.log('\n(prévia — nada gravado. Use --confirmar para gravar.)'); process.exit(0) }
if (!lista) parar('sem --unidades não há conferência de contagem; declare as unidades conferidas no PDF')

const { data: existentes } = await sb.from('empreendimentos_unidades').select('unidade, disponivel').eq('empreendimento_id', emp.id)
const vendidas = new Set((existentes ?? []).filter((u) => u.disponivel === false).map((u) => u.unidade as string))

const linhas = unidades.map((u) => ({
  empreendimento_id: emp.id,
  unidade: u.unidade,
  bloco: null,
  andar: u.unidade.length >= 3 ? Math.floor(Number(u.unidade) / 100) : null,
  // Regra confirmada pelo corretor: a tabela do Eraldo NÃO traz dormitórios,
  // e o rodapé só diz "3 quartos e alguns de 2". 93 m² = 3, 70 m² = 2.
  dormitorios: u.metragem >= 85 ? 3 : 2,
  suites: 1,
  metragem: u.metragem,
  valor_tabela: u.preco,
  valor_entrada_min: u.entrada,
  cub_fator: null,
  disponivel: !vendidas.has(u.unidade),
  plano_pagamento: {
    entrada: u.entrada,
    parcelas_qtd: u.mensais_qtd,
    parcela_valor: u.mensal,
    reforcos_qtd: u.reforcos_qtd,
    reforco_valor: u.reforco,
    saldo_financiamento: u.pos_chaves,
    financiamento_direto: c.pos_chaves_meses ? { meses: c.pos_chaves_meses, jurosAoMes: 0, indice: null } : null,
    opcoes_pagamento: [],
    percentual_ate_chaves: c.percentuais ? Math.round((1 - c.percentuais[3]) * 100) : null,
    previsao_entrega: null,
    cub_quantidade: null,
    // Campos que só o Eraldo tem. Vão no jsonb por decisão do corretor —
    // sem migration, como cub_quantidade e financiamento_direto já fazem.
    vagas: u.vagas,
    deposito: u.deposito,
    metragem_garagem_deposito: u.metragem_garagem_deposito,
    metragem_total: u.metragem_total,
    dormitorios_por_metragem: true,
  },
  condicoes_negociacao:
    `Entrada de ${brl(u.entrada)} (${((u.entrada / u.preco) * 100).toFixed(0)}%) + ${u.reforcos_qtd} reforços de ${brl(u.reforco)} + ` +
    `${u.mensais_qtd}x ${brl(u.mensal)}. Saldo de ${brl(u.pos_chaves)} após as chaves, em até ${c.pos_chaves_meses ?? 180}x.` +
    (u.vagas ? ` ${u.vagas}.` : '') + (u.deposito ? ` ${u.deposito}.` : ''),
}))

const { data, error } = await sb.from('empreendimentos_unidades')
  .upsert(linhas, { onConflict: 'empreendimento_id,bloco,unidade' }).select('id')
if (error) { console.error(`\nERRO ao gravar: ${error.message}`); process.exit(1) }
console.log(`\nGRAVADAS: ${data?.length} unidades${vendidas.size ? ` (${vendidas.size} vendidas preservadas)` : ''}`)
