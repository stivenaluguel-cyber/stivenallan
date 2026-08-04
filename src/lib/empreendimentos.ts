// Fonte única de dados dos empreendimentos — todos os 27 ativos.
// Usada por /empreendimentos e /empreendimento/[construtora]/[slug].
// Dados (nome/status/preço/etc.) vêm de @/data/imoveis; home e sitemap leem
// @/data/imoveis diretamente via getVitrineImoveis.
import { imoveis } from '@/data/imoveis';
import { politicaFinanciamentoFontana } from './fontana-politica-financiamento';
import type { PoliticaFinanciamento } from './eraldo-politica-financiamento';

export type StatusObra = 'na planta' | 'em obras' | 'pronto' | 'entregue';

export interface Empreendimento {
  slug: string;
  nome: string;
  construtoraSlug: string;
  cidade: string;
  bairro: string;
  uf: string;
  imagem: string;
  oculto?: boolean;
  // campos legados (opcionais)
  statusObra?: StatusObra;
  dorms?: string;
  areaMin?: number;
  areaMax?: number;
  exibirPreco?: boolean;
  precoAPartirDe?: number;
  frase?: string;
  descricao?: string;
  imagens?: string[];
  diferenciais?: string[];
  videoUrl?: string;
  catalogoUrl?: string;
  construtoraNome?: string;
  // Ficha técnica pro catálogo (/empreendimentos) — sempre opcional, só
  // populado quando existe dado real na fonte (properties/Supabase pra
  // Fontana, tipologias reais pra Eraldo). Nunca inventar valor ausente.
  suitesLabel?: string;
  metragemLabel?: string;
  vagasLabel?: string;
  previsaoEntregaLabel?: string;
  dormitoriosMin?: number;
  dormitoriosMax?: number;
  suitesMin?: number;
  suitesMax?: number;
  vagasMin?: number;
  vagasMax?: number;
  // Classificação real da política de financiamento (mesmo sistema de
  // @/lib/eraldo-politica-financiamento) — populada pro card do catálogo nunca
  // afirmar "financiamento direto" quando o texto real da página descreve
  // banco como única opção ou como alternativa. Opcional como as outras da
  // ficha técnica — ausente só em reconstruções parciais (ex.: filtro
  // client-side), nunca em EMPREENDIMENTOS (ver teste de cobertura completa
  // em fontana-politica-financiamento.test.ts).
  politicaFinanciamento?: PoliticaFinanciamento;
}

// Imagem do Mar di Atrani em /empreendimentos usa uma URL diferente da capa no
// Supabase (que já aparece na home) — preservada intencionalmente nesta unificação
// de fontes para não alterar o visual já publicado. Ver decisão registrada em
// sessão de refatoração (2026-07-11).
const IMAGEM_OVERRIDE: Record<string, string> = {
  'mar-di-atrani-centro-balneario-rincao-sc':
    'https://estilofontana.com.br/images/empreendimento/slideshows/mar-di-atrani-residencial-675c232fef052.jpg?fm=webp',
};

// Derivado de @/data/imoveis (fonte canônica) — ordenado alfabeticamente por nome
// para preservar a ordem de exibição já publicada em /empreendimentos.
export const EMPREENDIMENTOS: Empreendimento[] = [...imoveis]
  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  .map((i) => ({
    slug: i.slug,
    nome: i.nome,
    construtoraSlug: i.construtora_slug,
    cidade: i.cidade,
    bairro: i.bairro,
    uf: i.uf,
    imagem: IMAGEM_OVERRIDE[i.slug] ?? i.img,
    oculto: !i.ativo,
    statusObra: i.status as StatusObra,
    exibirPreco: i.exibir_preco,
    precoAPartirDe: i.preco ?? undefined,
    frase: i.frase,
    construtoraNome: i.construtora,
    politicaFinanciamento: politicaFinanciamentoFontana(i.slug),
  }));

export function getEmpreendimentosVisiveis(): Empreendimento[] {
  return EMPREENDIMENTOS.filter((e) => !e.oculto);
}

export function getEmpreendimento(
  construtoraSlug: string,
  slug: string,
): Empreendimento | undefined {
  return EMPREENDIMENTOS.find(
    (e) => e.construtoraSlug === construtoraSlug && e.slug === slug,
  );
}

export function hrefEmpreendimento(e: Empreendimento): string {
  return '/empreendimento/' + e.construtoraSlug + '/' + e.slug;
}

export function precoLabel(e: Empreendimento): string {
  if (!e.exibirPreco || !e.precoAPartirDe) return 'Sob consulta';
  return 'A partir de R$ ' + e.precoAPartirDe.toLocaleString('pt-BR');
}

export function statusLabel(s?: StatusObra): string {
  if (s === 'na planta') return 'Na planta';
  if (s === 'em obras') return 'Em obras';
  if (s === 'pronto') return 'Pronto para morar';
  if (s === 'entregue') return 'Entregue';
  return 'Sob consulta';
}
