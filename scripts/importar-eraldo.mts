/**
 * Importa tabela da Construtora Eraldo.
 *
 *   npx tsx scripts/importar-eraldo.mts <slug> <arquivo.txt> [--confirmar]
 *                                       [--unidades 304,405,606]
 *                                       [--quartos "93.20=3/1"]
 *                                       [--somente-aptos] [--marcar-vendidas]
 *
 * VIRADA DE MÊS: a construtora publica tabela nova e a unidade vendida deixa
 * de constar. A prévia lista quem SUMIU desde a última importação — é a leitura
 * de vendas do mês. Sem isso a unidade ficaria "disponível" no site para
 * sempre, porque o upsert só sabe de quem veio. `--marcar-vendidas` baixa as
 * sumidas; sem o flag, só acusa (sair da tabela pode ser permuta ou bloqueio,
 * não só venda).
 *
 * As nove tabelas do Eraldo não compartilham a estrutura de pagamento — o Gran
 * Michel é 10/5/15/70 em cinco colunas, o Play é 30/70 em três. O parser lê a
 * estrutura de cada uma no cabeçalho e NÃO assume coluna nenhuma.
 *
 * O que bloqueia a importação, tudo automático:
 *
 *   1. preço = quantidade de CUB impressa × CUB do mês, por unidade;
 *   2. cada coluna é a fração exata do preço que o cabeçalho declara;
 *   3. a quantidade de pagamentos de cada coluna dá inteiro e é a mesma em
 *      todas as unidades;
 *   4. a contagem de "Apto NNN" do texto bate com lidas + rejeitadas.
 *
 * `--unidades` continua disponível para o caso de o corretor querer declarar a
 * lista conferida no PDF, mas deixou de ser obrigatório: a conferência 4 é
 * independente do fatiador, então não repete o erro do Pavia (em que a
 * contagem usava o mesmo corte que estava errando e aprovava).
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { coluna, parsearTabelaEraldo } from '../src/lib/unidades/importar-tabela-eraldo'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')]),
)

const [slug, arquivo] = process.argv.slice(2)
const confirmar = process.argv.includes('--confirmar')
const opt = (nome: string) => {
  const i = process.argv.indexOf(`--${nome}`)
  return i >= 0 ? process.argv[i + 1] : null
}
const lista = opt('unidades')?.split(',').map((u) => u.trim()) ?? null
const marcarVendidas = process.argv.includes('--marcar-vendidas')

/**
 * Quartos e suítes POR METRAGEM, no formato "192.95=3/3,373.16=3/3" — a
 * metragem privativa, o número de dormitórios e, depois da barra, o de suítes.
 * A parte das suítes é opcional.
 *
 * É mapa, não regra de corte. A tabela do Eraldo não traz a coluna (só o Play
 * traz) e a metragem sozinha não decide: no Gran Palazzo, 126,71 m² e
 * 129,43 m² são os dois "3 quartos sendo 1 suíte", enquanto no Symphony
 * 155,24 m² é "2 suítes e 2 demi-suítes" e 178,86 m² é "3 suítes". Os pares
 * saem das plantas do catálogo da construtora, uma a uma.
 *
 * Metragem que aparecer na tabela e não estiver no mapa BLOQUEIA a
 * importação: é planta que ninguém conferiu, não caso para chutar.
 */
const mapaQuartos = (() => {
  const s = opt('quartos')
  if (!s) return null
  const m = new Map<string, { dorm: number; suites: number | null }>()
  for (const par of s.split(',')) {
    const x = par.trim().match(/^([\d.]+)=(\d+)(?:\/(\d+))?$/)
    if (!x) { console.error(`par inválido em --quartos: "${par}" (use "192.95=3/3")`); process.exit(1) }
    m.set(Number(x[1]).toFixed(2), { dorm: Number(x[2]), suites: x[3] ? Number(x[3]) : null })
  }
  return m
})()
if (!slug || !arquivo) { console.error('uso: npx tsx scripts/importar-eraldo.mts <slug> <arquivo.txt> [--confirmar] [--unidades ...]'); process.exit(1) }

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const brl = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const { data: emp } = await sb.from('empreendimentos').select('id, nome').eq('slug', slug).maybeSingle()
if (!emp) { console.error(`Empreendimento não encontrado: ${slug}`); process.exit(1) }

const r = parsearTabelaEraldo(readFileSync(arquivo, 'utf8'))
const c = r.cabecalho

console.log(`\n=== ${emp.nome} (${slug}) ===`)
console.log(`unidades lidas: ${r.unidades.length} | rejeitadas: ${r.rejeitadas.length} | "Apto" no texto: ${r.conferencia.aptos_no_texto} ${r.conferencia.confere ? '✓ fecha' : '✗ NÃO FECHA'}`)
for (const x of r.rejeitadas) console.log(`  REJEITADA ${x.unidade}: ${x.motivo}`)
for (const l of r.conferencia.linhas_de_valor_orfas) console.log(`  LINHA DE VALORES FORA DA LEITURA: ${l.slice(0, 130)}`)
console.log(`CUB ${c.cub_valor ?? '—'} · percentuais ${c.percentuais ? c.percentuais.map((p) => `${(p * 100).toFixed(0)}%`).join(' / ') : 'NÃO LIDOS'}`)
if (r.quantidades && r.unidades[0]) {
  console.log(`colunas: ${r.unidades[0].colunas.map((x) => `${x.papel} ${x.quantidade}x (${(x.percentual * 100).toFixed(0)}%)`).join(' · ')}`)
}
console.log(`saldo financiado: ${c.tem_financiamento ? `sim, até ${c.pos_chaves_meses ?? r.unidades[0]?.colunas.at(-1)?.quantidade ?? '—'}x` : 'não'} · juros ${c.juros_ao_mes ?? '—'}% a.m. ${c.indice ?? ''} · entrega ${c.previsao_entrega ?? '—'}`)

const cel = (u: (typeof r.unidades)[number], papel: Parameters<typeof coluna>[1]) => {
  const x = coluna(u, papel)
  return x ? (x.quantidade > 1 ? `${x.quantidade}x ${brl(x.valor)}` : brl(x.valor)) : '—'
}

console.log('\n| Un. | Vagas | Depósito | m² priv. | m² global | CUB | Preço | Entrada | Reforços | Mensais | Chaves | Saldo |')
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|')
for (const u of r.unidades) {
  console.log(
    `| ${u.unidade} | ${u.vagas ?? '—'} | ${u.deposito ?? '—'} | ${brl(u.metragem)} | ${brl(u.metragem_global)} | ${brl(u.cub_quantidade)} | ${brl(u.preco)} | ` +
    `${cel(u, 'entrada')} | ${cel(u, 'reforcos')} | ${cel(u, 'mensais')} | ${cel(u, 'chaves')} | ${cel(u, 'saldo')} |`,
  )
}

const parar = (m: string) => { console.error(`\nBLOQUEADO: ${m}`); process.exit(2) }
if (r.unidades.length === 0) parar('nenhuma unidade válida na tabela')
if (r.rejeitadas.length > 0) parar(`${r.rejeitadas.length} linha(s) rejeitada(s) — confira antes de importar`)
if (!c.percentuais) parar('percentuais do cabeçalho não lidos; sem eles as invariantes não valem')
// `--somente-aptos` é o reconhecimento EXPLÍCITO de que a tabela tem linhas
// que não são apartamento e ficam de fora — decisão do corretor para as sete
// salas comerciais do Symphony. Continua imprimindo cada linha descartada:
// aceitar em silêncio é o que fez o Pavia entrar com 6 de 14.
const somenteAptos = process.argv.includes('--somente-aptos')
if (r.conferencia.linhas_de_valor_orfas.length > 0 && !somenteAptos) {
  parar(`${r.conferencia.linhas_de_valor_orfas.length} linha(s) de valores ficaram fora da leitura — há unidade na tabela que o parser não enxerga`)
}
if (somenteAptos && r.conferencia.linhas_de_valor_orfas.length > 0) {
  console.log(`\n*** ${r.conferencia.linhas_de_valor_orfas.length} linha(s) DELIBERADAMENTE fora (--somente-aptos) — as listadas acima. ***`)
}
if (r.conferencia.aptos_no_texto !== r.unidades.length + r.rejeitadas.length) {
  parar(`o texto anuncia ${r.conferencia.aptos_no_texto} apartamentos e o parser fechou ${r.unidades.length + r.rejeitadas.length}`)
}

let unidades = r.unidades
if (lista) {
  const lidas = new Set(unidades.map((u) => u.unidade))
  const faltando = lista.filter((u) => !lidas.has(u))
  const sobrando = unidades.filter((u) => !lista.includes(u.unidade))
  console.log(`\n*** LISTA DECLARADA (${lista.length} unidades) ***`)
  for (const u of sobrando) console.log(`  FORA da lista, descartada: ${u.unidade} (${brl(u.preco)}, ${brl(u.metragem)} m²)`)
  if (faltando.length > 0) parar(`a lista pede ${faltando.join(', ')} e o parser não leu`)
  unidades = unidades.filter((u) => lista.includes(u.unidade))
}

if (mapaQuartos) {
  const semPlanta = [...new Set(unidades.filter((u) => !mapaQuartos.has(u.metragem.toFixed(2))).map((u) => u.metragem.toFixed(2)))]
  if (semPlanta.length > 0) parar(`metragens fora do mapa de plantas: ${semPlanta.join(', ')} m²`)
}


const { data: existentes } = await sb.from('empreendimentos_unidades')
  .select('unidade, disponivel, metragem, valor_tabela').eq('empreendimento_id', emp.id)
const vendidas = new Set((existentes ?? []).filter((u) => u.disponivel === false).map((u) => u.unidade as string))

// QUEM SUMIU DA TABELA DO MÊS.
//
// A construtora publica tabela nova todo mês e a unidade vendida simplesmente
// deixa de constar. Sem esta conferência ela ficaria no site como
// "disponível" para sempre — o upsert atualiza quem veio e não sabe nada de
// quem faltou. É a diferença entre um espelho e uma foto velha.
//
// Sair da tabela não é prova de venda: pode ser permuta, bloqueio ou unidade
// que a construtora recolheu. Por isso o padrão é ACUSAR, e marcar como
// vendida só com `--marcar-vendidas`.
const naTabela = new Set(unidades.map((u) => u.unidade))
const sumiram = (existentes ?? []).filter((u) => u.disponivel !== false && !naTabela.has(u.unidade as string))
if (sumiram.length > 0) {
  console.log(`\n*** ${sumiram.length} unidade(s) SUMIRAM da tabela deste mês — provável venda ***`)
  console.log('| Un. | m² | último preço em tabela |')
  console.log('|---|---|---|')
  for (const u of sumiram) {
    console.log(`| ${u.unidade} | ${brl(Number(u.metragem))} | ${u.valor_tabela ? brl(Number(u.valor_tabela)) : '—'} |`)
  }
  console.log(marcarVendidas
    ? '    → serão marcadas como VENDIDAS (--marcar-vendidas).'
    : '    → continuam disponíveis no site. Use --marcar-vendidas para baixá-las.')
}

if (!confirmar) { console.log('\n(prévia — nada gravado. Use --confirmar para gravar.)'); process.exit(0) }
const linhas = unidades.map((u) => {
  const entrada = coluna(u, 'entrada')!
  const reforcos = coluna(u, 'reforcos')
  const mensais = coluna(u, 'mensais')
  const chaves = coluna(u, 'chaves')
  const saldo = coluna(u, 'saldo')
  // O pagamento nas chaves do Horizon NÃO é reforço: é valor e data de
  // contrato. Dobrá-lo em reforço faria o simulador diluí-lo quando o cliente
  // mexesse na entrada — 15% do preço virando parcela que a Eraldo não
  // ofereceu. Vai no campo próprio, que o simulador mantém fixo.
  const reforcosQtd = reforcos?.quantidade ?? 0
  const reforcoValor = reforcos?.valor ?? 0
  const pctAteChaves = Math.round((1 - (saldo?.percentual ?? 0)) * 100)
  const mesesDoSaldo = c.pos_chaves_meses ?? saldo?.quantidade ?? 0

  return {
    empreendimento_id: emp.id,
    unidade: u.unidade,
    bloco: null,
    andar: u.unidade.length >= 3 ? Math.floor(Number(u.unidade) / 100) : null,
    // A tabela vem primeiro; depois o mapa das plantas. Sem os dois, nulo —
    // melhor a página não dizer nada do que dizer o número errado.
    dormitorios: u.dormitorios ?? mapaQuartos?.get(u.metragem.toFixed(2))?.dorm ?? null,
    suites: mapaQuartos?.get(u.metragem.toFixed(2))?.suites ?? null,
    metragem: u.metragem,
    valor_tabela: u.preco,
    valor_entrada_min: entrada.valor,
    // numeric(6,4) não comporta 314 CUBs; a quantidade vive no plano.
    cub_fator: null,
    disponivel: !vendidas.has(u.unidade),
    plano_pagamento: {
      entrada: entrada.valor,
      parcelas_qtd: mensais?.quantidade ?? 0,
      parcela_valor: mensais?.valor ?? 0,
      reforcos_qtd: reforcosQtd,
      reforco_valor: reforcoValor,
      saldo_financiamento: saldo ? saldo.valor * saldo.quantidade : 0,
      // Financiamento DIRETO só quando a tabela parcela o saldo com a
      // construtora. O Gran Palazzo e o Play escrevem só "FINANC. BANCÁRIO" e
      // não trazem prazo nenhum: para eles o saldo é do banco, e prometer
      // parcelamento direto na tela seria condição que a Eraldo não ofereceu.
      financiamento_direto: saldo && mesesDoSaldo > 1
        ? { meses: mesesDoSaldo, jurosAoMes: c.juros_ao_mes ?? 0, indice: c.indice }
        : null,
      opcoes_pagamento: [],
      percentual_ate_chaves: pctAteChaves,
      previsao_entrega: c.previsao_entrega,
      cub_quantidade: u.cub_quantidade,
      // Campos que só o Eraldo tem. Vão no jsonb por decisão do corretor —
      // sem migration, como cub_quantidade e financiamento_direto já fazem.
      vagas: u.vagas,
      deposito: u.deposito,
      metragem_global: u.metragem_global,
      dormitorios_da_planta: u.dormitorios === null && mapaQuartos !== null,
      pagamento_nas_chaves: chaves ? chaves.valor : null,
      colunas: u.colunas,
    },
    condicoes_negociacao: [
      `Entrada de ${brl(entrada.valor)} (${(entrada.percentual * 100).toFixed(0)}%)`,
      reforcos ? `${reforcos.quantidade} reforços de ${brl(reforcos.valor)}` : null,
      mensais ? `${mensais.quantidade}x ${brl(mensais.valor)}` : null,
      chaves ? `${brl(chaves.valor)} na entrega das chaves` : null,
      saldo
        ? mesesDoSaldo > 1
          ? `saldo de ${brl(saldo.valor * saldo.quantidade)} em até ${mesesDoSaldo}x` +
            (c.juros_ao_mes ? ` (${String(c.juros_ao_mes).replace('.', ',')}% a.m. + ${c.indice ?? 'IGPM'})` : '')
          : `saldo de ${brl(saldo.valor)} em financiamento bancário`
        : null,
    ].filter(Boolean).join(' + ') + '.' + (u.vagas ? ` ${u.vagas}.` : '') + (u.deposito ? ` ${u.deposito}.` : ''),
  }
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
  const { error: e2 } = await sb.from('empreendimentos_unidades')
    .update({ disponivel: false })
    .eq('empreendimento_id', emp.id)
    .in('unidade', sumiram.map((u) => u.unidade as string))
  if (e2) { console.error(`ERRO ao marcar vendidas: ${e2.message}`); process.exit(1) }
  console.log(`MARCADAS COMO VENDIDAS: ${sumiram.length} (${sumiram.map((u) => u.unidade).join(', ')})`)
}
