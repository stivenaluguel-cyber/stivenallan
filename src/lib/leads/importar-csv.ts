// Importação de leads a partir de planilha.
//
// A pergunta número um de quem sai do Excel é "eu perco meu histórico?".
// Hoje o sistema só EXPORTA CSV. Este módulo faz o caminho de volta.
//
// Três decisões que evitam estrago:
//
// 1. O cabeçalho é reconhecido por sinônimos, não por posição fixa. Planilha
//    de corretor nunca vem com o nome de coluna que o sistema espera.
// 2. Telefone é a chave. Linha sem telefone utilizável é rejeitada com o
//    número da linha, porque `leads.whatsapp` é NOT NULL e um lead sem
//    telefone é um lead que nunca será trabalhado.
// 3. Nada é gravado por este arquivo. Ele só produz o plano de importação —
//    quem decide inserir ou pular é a rota, depois de conferir o que já
//    existe no banco.

import { normalizeEmail, normalizePhone, normalizeString } from './normalize'

export type LinhaImportada = {
  linha: number
  whatsapp: string
  nome: string | null
  email: string | null
  origem: string | null
  cidade_interesse: string | null
  orcamento_max: number | null
  entrada_disponivel: string | null
  prazo_compra: string | null
  observacoes: string | null
}

export type LinhaRejeitada = { linha: number; motivo: string; conteudo: string }

export type ResultadoParse = {
  linhas: LinhaImportada[]
  rejeitadas: LinhaRejeitada[]
  duplicadasNoArquivo: number
  colunasReconhecidas: Record<string, string>
  colunasIgnoradas: string[]
  total: number
}

// Sinônimos por campo. Comparados sem acento, sem pontuação e em minúsculas.
const SINONIMOS: Record<keyof Omit<LinhaImportada, 'linha' | 'whatsapp'> | 'whatsapp', string[]> = {
  whatsapp: ['whatsapp', 'telefone', 'celular', 'fone', 'contato', 'tel', 'numero', 'zap'],
  nome: ['nome', 'cliente', 'lead', 'nomecompleto', 'nomedocliente', 'razaosocial'],
  email: ['email', 'e-mail', 'mail', 'correio'],
  origem: ['origem', 'fonte', 'canal', 'source', 'midia'],
  cidade_interesse: ['cidade', 'cidadeinteresse', 'cidadedeinteresse', 'municipio', 'local'],
  orcamento_max: ['orcamento', 'orcamentomax', 'valor', 'valormaximo', 'budget', 'investimento'],
  entrada_disponivel: ['entrada', 'entradadisponivel', 'sinal', 'valorentrada'],
  prazo_compra: ['prazo', 'prazocompra', 'prazodecompra', 'quandopretendecomprar'],
  observacoes: ['observacoes', 'observacao', 'obs', 'anotacoes', 'notas', 'comentarios', 'descricao'],
}

function chaveNormalizada(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Detecta o separador olhando a primeira linha.
 *
 * Excel em português exporta com ponto e vírgula por padrão. Assumir vírgula
 * faria a planilha inteira virar uma coluna só, e o importador diria
 * "nenhuma coluna reconhecida" para um arquivo perfeitamente válido.
 */
export function detectarSeparador(primeiraLinha: string): ';' | ',' | '\t' {
  const candidatos: (';' | ',' | '\t')[] = [';', ',', '\t']
  let melhor: ';' | ',' | '\t' = ','
  let maior = 0
  for (const c of candidatos) {
    const n = dividirLinha(primeiraLinha, c).length
    if (n > maior) { maior = n; melhor = c }
  }
  return melhor
}

/**
 * Divide uma linha respeitando aspas duplas e o escape `""`.
 *
 * Um split simples quebraria "Silva, João" em duas colunas e desalinharia a
 * linha inteira — o telefone acabaria na coluna do e-mail.
 */
export function dividirLinha(linha: string, sep: string): string[] {
  const out: string[] = []
  let atual = ''
  let dentroDeAspas = false

  for (let i = 0; i < linha.length; i++) {
    const c = linha[i]
    if (c === '"') {
      if (dentroDeAspas && linha[i + 1] === '"') { atual += '"'; i++ }
      else dentroDeAspas = !dentroDeAspas
      continue
    }
    if (c === sep && !dentroDeAspas) { out.push(atual); atual = ''; continue }
    atual += c
  }
  out.push(atual)
  return out.map((v) => v.trim())
}

function moeda(v: string | null): number | null {
  if (!v) return null
  // "R$ 350.000,00" → 350000. Remove tudo que não é dígito, vírgula ou ponto,
  // depois trata o ponto como separador de milhar (padrão pt-BR).
  const limpo = v.replace(/[^\d.,]/g, '')
  if (!limpo) return null
  const n = Number(limpo.replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : null
}

/**
 * Telefone brasileiro utilizável.
 *
 * Aceita 10 ou 11 dígitos (com DDD) e também 12/13 com o 55 na frente, que é
 * como a maioria das exportações de WhatsApp vem. Qualquer coisa menor não é
 * telefone — é um campo preenchido errado, e gravar isso criaria um lead que
 * nunca poderá ser contatado.
 */
export function normalizarTelefoneImportado(valor: string | null): string | null {
  const digitos = normalizePhone(valor)
  if (!digitos) return null
  const semPais = digitos.length > 11 && digitos.startsWith('55') ? digitos.slice(2) : digitos
  if (semPais.length < 10 || semPais.length > 11) return null
  return semPais
}

export function parsearCsvLeads(conteudo: string): ResultadoParse {
  // BOM do Excel entra no primeiro cabeçalho e faria "nome" virar "﻿nome".
  const texto = conteudo.replace(/^﻿/, '')
  const linhas = texto.split(/\r\n|\n|\r/).filter((l) => l.trim() !== '')

  if (linhas.length < 2) {
    return {
      linhas: [], rejeitadas: [], duplicadasNoArquivo: 0,
      colunasReconhecidas: {}, colunasIgnoradas: [], total: 0,
    }
  }

  const sep = detectarSeparador(linhas[0])
  const cabecalho = dividirLinha(linhas[0], sep)

  // Mapa coluna → campo. Primeira coluna que casa vence: planilha com
  // "telefone" e "telefone 2" usa a primeira e ignora a segunda, em vez de
  // sobrescrever com o número secundário.
  const indicePorCampo: Partial<Record<keyof typeof SINONIMOS, number>> = {}
  const colunasReconhecidas: Record<string, string> = {}
  const colunasIgnoradas: string[] = []

  cabecalho.forEach((titulo, i) => {
    const chave = chaveNormalizada(titulo)
    const campo = (Object.keys(SINONIMOS) as (keyof typeof SINONIMOS)[]).find(
      (c) => SINONIMOS[c].includes(chave) && indicePorCampo[c] === undefined,
    )
    if (campo) {
      indicePorCampo[campo] = i
      colunasReconhecidas[titulo] = campo
    } else if (titulo.trim()) {
      colunasIgnoradas.push(titulo)
    }
  })

  const valor = (celulas: string[], campo: keyof typeof SINONIMOS): string | null => {
    const i = indicePorCampo[campo]
    return i === undefined ? null : normalizeString(celulas[i])
  }

  const out: LinhaImportada[] = []
  const rejeitadas: LinhaRejeitada[] = []
  const vistos = new Set<string>()
  let duplicadasNoArquivo = 0

  for (let i = 1; i < linhas.length; i++) {
    const bruto = linhas[i]
    const celulas = dividirLinha(bruto, sep)
    // +1 porque a linha 1 é o cabeçalho: o número tem que bater com o que o
    // corretor vê no Excel.
    const numeroLinha = i + 1

    const whatsapp = normalizarTelefoneImportado(valor(celulas, 'whatsapp'))
    if (!whatsapp) {
      rejeitadas.push({
        linha: numeroLinha,
        motivo: 'Sem telefone válido (precisa de DDD + número)',
        conteudo: bruto.slice(0, 120),
      })
      continue
    }

    // Duplicata dentro do próprio arquivo: a primeira ocorrência vence, as
    // demais são contadas mas não viram erro — planilha antiga repete lead o
    // tempo todo e travar a importação por isso seria hostil.
    if (vistos.has(whatsapp)) { duplicadasNoArquivo++; continue }
    vistos.add(whatsapp)

    out.push({
      linha: numeroLinha,
      whatsapp,
      nome: valor(celulas, 'nome'),
      email: normalizeEmail(valor(celulas, 'email')),
      origem: valor(celulas, 'origem'),
      cidade_interesse: valor(celulas, 'cidade_interesse'),
      orcamento_max: moeda(valor(celulas, 'orcamento_max')),
      entrada_disponivel: valor(celulas, 'entrada_disponivel'),
      prazo_compra: valor(celulas, 'prazo_compra'),
      observacoes: valor(celulas, 'observacoes'),
    })
  }

  return {
    linhas: out,
    rejeitadas,
    duplicadasNoArquivo,
    colunasReconhecidas,
    colunasIgnoradas,
    total: linhas.length - 1,
  }
}

/**
 * Monta a linha de insert. `origem` cai em 'importacao' quando a planilha não
 * traz o campo, para o relatório de conversão por origem não misturar lead
 * importado com lead captado de verdade.
 */
export function paraInsert(l: LinhaImportada, agoraIso: string) {
  return {
    whatsapp: l.whatsapp,
    nome: l.nome,
    email: l.email,
    origem: l.origem || 'importacao',
    cidade_interesse: l.cidade_interesse,
    orcamento_max: l.orcamento_max,
    entrada_disponivel: l.entrada_disponivel,
    prazo_compra: l.prazo_compra,
    anotacoes: l.observacoes,
    estagio_funil: 'primeiro_contato',
    status: 'novo',
    created_at: agoraIso,
    updated_at: agoraIso,
  }
}
