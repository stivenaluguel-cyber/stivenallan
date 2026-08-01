/**
 * Importa tabela da Construtora Eraldo.
 *
 *   npx tsx scripts/importar-eraldo.mts <slug> <arquivo.txt> [--confirmar]
 *                                       [--unidades 304,405,606]
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

/**
 * Regra de quartos/suítes por metragem, no formato "85:3/2" — a partir de
 * 85 m² são 3, abaixo são 2. Aceita também um número só, quando vale para o
 * prédio inteiro.
 *
 * Existe porque a tabela do Eraldo não traz a coluna (só o Play traz) e o
 * corretor confirmou a leitura por metragem para o GRAN MICHEL — 93 m² = 3
 * quartos, 70 m² = 2. Estender esse corte aos outros oito prédios seria
 * decisão minha, não dele: o Árbor tem apartamento de 192 m² e duplex de 373.
 * Sem a regra declarada na linha de comando, a coluna fica nula.
 */
const regra = (s: string | null) => {
  if (!s) return null
  if (/^\d+$/.test(s)) return () => Number(s)
  const m = s.match(/^([\d.]+):(\d+)\/(\d+)$/)
  if (!m) { console.error(`regra inválida: ${s} (use "85:3/2" ou "3")`); process.exit(1) }
  return (metragem: number) => (metragem >= Number(m[1]) ? Number(m[2]) : Number(m[3]))
}
const regraDorm = regra(opt('dormitorios'))
const regraSuites = regra(opt('suites'))
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

if (!confirmar) { console.log('\n(prévia — nada gravado. Use --confirmar para gravar.)'); process.exit(0) }

const { data: existentes } = await sb.from('empreendimentos_unidades').select('unidade, disponivel').eq('empreendimento_id', emp.id)
const vendidas = new Set((existentes ?? []).filter((u) => u.disponivel === false).map((u) => u.unidade as string))

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
    // A tabela vem primeiro; depois a regra que o corretor declarar. Sem as
    // duas, nulo — melhor a página não dizer nada do que dizer o número errado.
    dormitorios: u.dormitorios ?? regraDorm?.(u.metragem) ?? null,
    suites: regraSuites?.(u.metragem) ?? null,
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
      dormitorios_por_metragem: u.dormitorios === null && regraDorm !== null,
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
