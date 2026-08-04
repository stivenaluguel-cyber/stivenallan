// Ficha técnica dos empreendimentos Eraldo para o catálogo (/empreendimentos)
// e cards da home, derivada das `tipologias` reais de cada arquivo em
// @/data/eraldo/* — nunca inventa número: só agrega o que já está cadastrado
// (e cada arquivo já documenta a fonte em `fontes`). O Aura Residence é
// hand-crafted (não usa EmpreendimentoTemplate) e não tem arquivo de dados
// próprio em @/data/eraldo — por isso fica de fora deste índice e o catálogo
// simplesmente não mostra ficha técnica pra ele (comportamento correto:
// "exibir quando os dados existirem").
import { arbor } from '@/data/eraldo/arbor'
import { granMichel } from '@/data/eraldo/gran-michel'
import { granPalazzo } from '@/data/eraldo/gran-palazzo'
import { harmony } from '@/data/eraldo/harmony'
import { horizon } from '@/data/eraldo/horizon'
import { lessence } from '@/data/eraldo/lessence'
import { play } from '@/data/eraldo/play'
import { symphony } from '@/data/eraldo/symphony'
import type { Empreendimento as EraldoData, Tipologia } from '@/data/eraldo/types'

const ERALDO_EMPREENDIMENTOS: readonly EraldoData[] = [arbor, granMichel, granPalazzo, harmony, horizon, lessence, play, symphony]

export type EraldoCardSpecs = {
  dormitoriosMin?: number
  dormitoriosMax?: number
  suitesMin?: number
  suitesMax?: number
  areaMin?: number
  areaMax?: number
  vagasMin?: number
  vagasMax?: number
  previsaoEntrega?: string
}

function faixa(nums: (number | undefined)[]): { min?: number; max?: number } {
  const validos = nums.filter((n): n is number => typeof n === 'number')
  if (!validos.length) return {}
  return { min: Math.min(...validos), max: Math.max(...validos) }
}

export function specsDeTipologias(tipologias: readonly Tipologia[]): EraldoCardSpecs {
  const dorms = faixa(tipologias.map((t) => t.dormitorios))
  const suites = faixa(tipologias.map((t) => t.suites))
  const area = faixa(tipologias.map((t) => t.areaPrivativa))
  const vagas = faixa(tipologias.map((t) => t.vagas))
  return {
    dormitoriosMin: dorms.min, dormitoriosMax: dorms.max,
    suitesMin: suites.min, suitesMax: suites.max,
    areaMin: area.min, areaMax: area.max,
    vagasMin: vagas.min, vagasMax: vagas.max,
  }
}

const INDICE: Map<string, EraldoCardSpecs> = new Map(
  ERALDO_EMPREENDIMENTOS.map((e) => [
    e.slug,
    { ...specsDeTipologias(e.tipologias), previsaoEntrega: e.status === 'entregue' ? e.dataConclusao : e.previsaoEntrega },
  ])
)

export function getEraldoCardSpecs(slug: string): EraldoCardSpecs | undefined {
  return INDICE.get(slug)
}
