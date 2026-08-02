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
 *                                          [--unidades T1:101,T2:704,302]
 *
 * `--unidades` é o escape para tabela que o parser não lê inteira. O operador
 * declara a lista exata, conferida no PDF, e ela SUBSTITUI a conferência
 * automática de linhas. Só use quando a automática não serve — o Pavia junta
 * três torres e quatro lojas num arquivo, e o fim de uma linha encosta no
 * começo da outra, produzindo unidade falsa que passa nas invariantes.
 *
 * A troca é explícita: o script diz na saída que a rede automática foi
 * substituída por conferência humana, e acusa tanto o que veio a mais quanto
 * o que faltou em relação à lista.
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
const marcarVendidas = process.argv.includes('--marcar-vendidas')
const iLista = process.argv.indexOf('--unidades')
// Aceita "T1:704" e "302". O bloco é obrigatório onde o número se repete
// entre torres — o Pavia tem um 704 na T1 e outro na T2, e uma lista de
// números soltos não distingue os dois. É a mesma razão da chave do banco.
const listaDeclarada = iLista >= 0 ? process.argv[iLista + 1].split(',').map((u) => u.trim()) : null
const chaveDa = (bloco: string | null, unidade: string) => (bloco ? `${bloco}:${unidade}` : unidade)
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

const r: ReturnType<typeof parsearTabelaFontana> = parsearTabelaFontana(readFileSync(arquivo, 'utf8'), cubSistema)

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

if (listaDeclarada) {
  // Casa por "bloco:unidade" quando a lista declara o bloco, e por número
  // solto quando não declara — para tabela de torre única continuar simples.
  const combina = (u: (typeof r.unidades)[number]) =>
    listaDeclarada.includes(chaveDa(u.bloco, u.unidade)) ||
    (!listaDeclarada.some((x) => x.includes(':')) && listaDeclarada.includes(u.unidade))

  const lidas = new Set(r.unidades.map((u) => chaveDa(u.bloco, u.unidade)))
  const sobrando = r.unidades.filter((u) => !combina(u))
  const faltando = listaDeclarada.filter((x) => !lidas.has(x) && !lidas.has(x.split(':').pop()!))

  console.log(`\n*** CONFERÊNCIA AUTOMÁTICA DE LINHAS SUBSTITUÍDA POR LISTA DECLARADA ***`)
  console.log(`lista do operador: ${listaDeclarada.length} unidades`)
  for (const u of sobrando) console.log(`  FORA da lista, descartada: ${chaveDa(u.bloco, u.unidade)} (${brl(u.valor_tabela)}, ${u.dormitorios} dorm, ${brl(u.metragem)} m²)`)
  if (faltando.length > 0) parar(`a lista pede ${faltando.join(', ')} e o parser não leu. Confira o PDF.`)

  // Só as declaradas seguem.
  r.unidades = r.unidades.filter(combina)
} else if (r.conferenciaLinhas.confere === false) {
  parar(`o PDF tem ${r.conferenciaLinhas.esperado} linhas e o parser reconheceu ${r.conferenciaLinhas.lidas}. Alguma linha não foi vista.`)
}
const perdidos = r.conferenciaRodape.filter((x) => !x.confere)
if (perdidos.length > 0) parar('rodapé com condição não lida: ' + perdidos.map((x) => `${x.sinal}=${x.noTexto}`).join('; '))
if (r.conferenciaCub.confere === false) parar(`CUB divergente: tabela ${r.conferenciaCub.impresso}, sistema ${r.conferenciaCub.sistema}`)

const { data: existentes } = await sb.from('empreendimentos_unidades')
  .select('unidade, disponivel, bloco, metragem, valor_tabela').eq('empreendimento_id', emp.id)
const vendidas = new Set((existentes ?? []).filter((u) => u.disponivel === false).map((u) => u.unidade as string))

// QUEM SUMIU DA TABELA DO MÊS.
//
// A Fontana publica tabela nova todo mês e a unidade vendida deixa de constar.
// O upsert só sabe de quem veio: sem esta conferência a vendida ficaria
// "disponível" no site para sempre. Sair da tabela não é prova de venda —
// pode ser permuta ou bloqueio —, então o padrão é ACUSAR e só baixar com
// `--marcar-vendidas`.
const chave = (bloco: unknown, unidade: unknown) => `${(bloco as string) ?? ''}|${unidade as string}`
const naTabela = new Set(r.unidades.map((u) => chave(u.bloco, u.unidade)))
const sumiram = (existentes ?? []).filter(
  (u) => u.disponivel !== false && !naTabela.has(chave(u.bloco, u.unidade)),
)
if (sumiram.length > 0) {
  const brl = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  console.log(`\n*** ${sumiram.length} unidade(s) SUMIRAM da tabela deste mês — provável venda ***`)
  console.log('| Bloco | Un. | m² | último preço em tabela |')
  console.log('|---|---|---|---|')
  for (const u of sumiram) {
    console.log(`| ${u.bloco ?? '—'} | ${u.unidade} | ${brl(Number(u.metragem))} | ${u.valor_tabela ? brl(Number(u.valor_tabela)) : '—'} |`)
  }
  console.log(marcarVendidas
    ? '    → serão marcadas como VENDIDAS (--marcar-vendidas).'
    : '    → continuam disponíveis no site. Use --marcar-vendidas para baixá-las.')
}

if (!confirmar) { console.log('\n(prévia — nada gravado. Use --confirmar para gravar.)'); process.exit(0) }

const linhas = r.unidades.map((u) => {
  const linha = paraUnidadeDoBanco(u, emp.id, c.financiamento_direto, c.opcoes_pagamento, c.previsao_entrega)
  if (vendidas.has(u.unidade)) linha.disponivel = false  // a construtora não sabe o que você já vendeu
  return linha
})

const { data, error } = await sb.from('empreendimentos_unidades')
  .upsert(linhas, { onConflict: 'empreendimento_id,bloco,unidade' }).select('id')
if (error) { console.error(`\nERRO ao gravar: ${error.message}`); process.exit(1) }
console.log(`\nGRAVADAS: ${data?.length} unidades${vendidas.size ? ` (${vendidas.size} vendidas preservadas)` : ''}`)

// A unidade some da tabela; ela NÃO é apagada do banco. Vendida sai da página
// PÚBLICA (decisão do corretor, 02/08) mas continua no espelho interno e no
// resumo — "42 de 54 disponíveis" comunica a escassez — e apagar perderia o
// histórico de preço da unidade.
if (marcarVendidas && sumiram.length > 0) {
  for (const u of sumiram) {
    const q = sb.from('empreendimentos_unidades').update({ disponivel: false, vendida_em: new Date().toISOString() })
      .eq('empreendimento_id', emp.id).eq('unidade', u.unidade as string)
    const { error: e2 } = await (u.bloco === null ? q.is('bloco', null) : q.eq('bloco', u.bloco as string))
    if (e2) { console.error(`ERRO ao marcar ${u.unidade} como vendida: ${e2.message}`); process.exit(1) }
  }
  console.log(`MARCADAS COMO VENDIDAS: ${sumiram.length} (${sumiram.map((u) => u.unidade).join(', ')})`)
}
