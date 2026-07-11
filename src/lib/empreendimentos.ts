// Fonte única de dados dos empreendimentos — todos os 27 ativos.
// Usada por /empreendimentos e /empreendimento/[construtora]/[slug].
// Dados (nome/status/preço/etc.) vêm de @/data/imoveis; home e sitemap leem
// @/data/imoveis diretamente via getVitrineImoveis.
import { imoveis } from '@/data/imoveis';

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
}

// Imagem do Mar di Atrani em /empreendimentos usa uma URL diferente da capa no
// Supabase (que já aparece na home) — preservada intencionalmente nesta unificação
// de fontes para não alterar o visual já publicado. Ver decisão registrada em
// sessão de refatoração (2026-07-11).
const IMAGEM_OVERRIDE: Record<string, string> = {
  'mar-di-atrani-centro-balneario-rincao-sc':
    'https://estilofontana.com.br/images/empreendimento/slideshows/mar-di-atrani-residencial-675c232fef052.jpg?fm=webp',
};

// @/data/imoveis tem 2 bairros incorretos (confirmado contra o PropertySchema das
// páginas estáticas reais, fonte de maior confiança): Águas de Marano é "Frente Mar"
// (imoveis.ts diz "Centro") e Villammare é "Centro" (imoveis.ts duplica a cidade,
// "Balneário Rincão"). Override preserva o valor correto até o bug ser corrigido na
// fonte. Ver decisão registrada em sessão de refatoração (2026-07-11).
const BAIRRO_OVERRIDE: Record<string, string> = {
  'aguas-de-marano-frente-mar-balneario-picarras-sc': 'Frente Mar',
  'villammare-residencial-balneario-rincao-sc': 'Centro',
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
    bairro: BAIRRO_OVERRIDE[i.slug] ?? i.bairro,
    uf: i.uf,
    imagem: IMAGEM_OVERRIDE[i.slug] ?? i.img,
    oculto: !i.ativo,
    statusObra: i.status as StatusObra,
    exibirPreco: i.exibir_preco,
    precoAPartirDe: i.preco ?? undefined,
    frase: i.frase,
    construtoraNome: i.construtora,
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
