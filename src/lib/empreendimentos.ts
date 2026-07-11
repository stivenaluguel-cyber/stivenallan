// Fonte única de dados dos empreendimentos — todos os 29 ativos.
// Usada pela home, /empreendimentos, /empreendimento/[construtora]/[slug] e sitemap.

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

export const EMPREENDIMENTOS: Empreendimento[] = [
  { slug: 'aguas-de-marano-frente-mar-balneario-picarras-sc', nome: 'Águas de Marano', construtoraSlug: 'fontana', cidade: 'Balneário Piçarras', bairro: 'Frente Mar', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/aguas-de-marano-frente-mar-balneario-picarras-sc.jpg' },
  { slug: 'avezzano-centro-sideropolis-sc', nome: 'Avezzano Residencial', construtoraSlug: 'fontana', cidade: 'Siderópolis', bairro: 'Centro', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/avezzano-centro-sideropolis-sc.jpg' },
  { slug: 'bellante-comerciario-criciuma-sc', nome: 'Bellante Residencial', construtoraSlug: 'fontana', cidade: 'Criciúma', bairro: 'Comerciário', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/bellante-comerciario-criciuma-sc.jpg' },
  { slug: 'bosco-del-montello-centro-criciuma-sc', nome: 'Bosco Del Montello Residencial', construtoraSlug: 'fontana', cidade: 'Criciúma', bairro: 'Centro', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/bosco-del-montello-centro-criciuma-sc.jpg' },
  { slug: 'calalzo-di-cadore-michel-criciuma-sc', nome: 'Calalzo Di Cadore Residencial', construtoraSlug: 'fontana', cidade: 'Criciúma', bairro: 'Michel', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/calalzo-di-cadore-michel-criciuma-sc.jpg' },
  { slug: 'calliano-centro-criciuma-sc', nome: 'Calliano Residencial', construtoraSlug: 'fontana', cidade: 'Criciúma', bairro: 'Centro', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/calliano-centro-criciuma-sc.jpg' },
  { slug: 'campos-da-montanha-bom-jardim-da-serra-sc', nome: 'Campos da Montanha Residencial', construtoraSlug: 'fontana', cidade: 'Bom Jardim da Serra', bairro: '', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/campos-da-montanha-bom-jardim-da-serra-sc.jpg' },
  { slug: 'castellano-centro-icara-sc', nome: 'Castellano Residencial', construtoraSlug: 'fontana', cidade: 'Içara', bairro: 'Centro', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/castellano-centro-icara-sc.jpg' },
  { slug: 'due-fratelli-centro-criciuma-sc', nome: 'Due Fratelli Residencial', construtoraSlug: 'fontana', cidade: 'Criciúma', bairro: 'Centro', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/due-fratelli-centro-criciuma-sc.jpg' },
  { slug: 'fidenza-residencial-cruzeiro-do-sul-criciuma-sc', nome: 'Fidenza Residencial', construtoraSlug: 'fontana', cidade: 'Criciúma', bairro: 'Cruzeiro do Sul', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/fidenza-residencial-cruzeiro-do-sul-criciuma-sc.jpg' },
  { slug: 'lavis-residencial-centro-criciuma-sc', nome: 'Lavis Residencial', construtoraSlug: 'fontana', cidade: 'Criciúma', bairro: 'Centro', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/lavis-residencial-centro-criciuma-sc.jpg' },
  { slug: 'mar-di-arienzo-centro-balneario-rincao-sc', nome: 'Mar di Arienzo Residencial', construtoraSlug: 'fontana', cidade: 'Balneário Rincão', bairro: 'Centro', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/mar-di-arienzo-centro-balneario-rincao-sc.jpg' },
  { slug: 'mar-di-atrani-centro-balneario-rincao-sc', nome: 'Mar di Atrani Residencial', construtoraSlug: 'fontana', cidade: 'Balneário Rincão', bairro: 'Centro', uf: 'SC', imagem: 'https://estilofontana.com.br/images/empreendimento/slideshows/mar-di-atrani-residencial-675c232fef052.jpg?fm=webp' },
  { slug: 'mar-di-licata-mar-grosso-laguna-sc', nome: 'Mar di Licata Residencial', construtoraSlug: 'fontana', cidade: 'Laguna', bairro: 'Mar Grosso', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/mar-di-licata-mar-grosso-laguna-sc.jpg' },
  { slug: 'mar-di-nizza-mar-grosso-laguna-sc', nome: 'Mar di Nizza Residencial', construtoraSlug: 'fontana', cidade: 'Laguna', bairro: 'Mar Grosso', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/mar-di-nizza-mar-grosso-laguna-sc.jpg' },
  { slug: 'mar-positano-centro-balneario-rincao-sc', nome: 'Mar Positano Residencial', construtoraSlug: 'fontana', cidade: 'Balneário Rincão', bairro: 'Centro', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/mar-positano-centro-balneario-rincao-sc.jpg' },
  { slug: 'monte-leone-centro-criciuma-sc', nome: 'Monte Leone Residencial', construtoraSlug: 'fontana', cidade: 'Criciúma', bairro: 'Centro', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/monte-leone-centro-criciuma-sc.jpg' },
  { slug: 'parco-savello-santa-barbara-criciuma-sc', nome: 'Parco Savello Residencial', construtoraSlug: 'fontana', cidade: 'Criciúma', bairro: 'Santa Bárbara', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/parco-savello-santa-barbara-criciuma-sc.jpg' },
  { slug: 'pavia-rio-maina-criciuma-sc', nome: 'Pavia Residencial', construtoraSlug: 'fontana', cidade: 'Criciúma', bairro: 'Rio Maina', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/pavia-rio-maina-criciuma-sc.jpg' },
  { slug: 'pianezze-centro-icara-sc', nome: 'Pianezze Residencial', construtoraSlug: 'fontana', cidade: 'Içara', bairro: 'Centro', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/pianezze-centro-icara-sc.jpg' },
  { slug: 'piazza-castello-centro-icara-sc', nome: 'Piazza Castello Residencial', construtoraSlug: 'fontana', cidade: 'Içara', bairro: 'Centro', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/piazza-castello-centro-icara-sc.jpg' },
  { slug: 'pineto-centro-criciuma-sc', nome: 'Pineto Residencial', construtoraSlug: 'fontana', cidade: 'Criciúma', bairro: 'Centro', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/pineto-centro-criciuma-sc.jpg' },
  { slug: 'rocca-pietore-centro-sideropolis-sc', nome: 'Rocca Pietore Residencial', construtoraSlug: 'fontana', cidade: 'Siderópolis', bairro: 'Centro', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/rocca-pietore-centro-sideropolis-sc.jpg' },
  { slug: 'thiene-centro-criciuma-sc', nome: 'Thiene Residencial', construtoraSlug: 'fontana', cidade: 'Criciúma', bairro: 'Centro', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/thiene-centro-criciuma-sc.jpg' },
  { slug: 'tremezzo-residencial-centro-criciuma-sc', nome: 'Tremezzo Residencial', construtoraSlug: 'fontana', cidade: 'Criciúma', bairro: 'Centro', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/tremezzo-residencial-centro-criciuma-sc.jpg' },
  { slug: 'villaggio-verde-residenziale-grande-prospera-criciuma-sc', nome: 'Villaggio Verde Residenziale', construtoraSlug: 'fontana', cidade: 'Criciúma', bairro: 'Grande Próspera', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/villaggio-verde-residenziale-grande-prospera-criciuma-sc.jpg' },
  { slug: 'villammare-residencial-balneario-rincao-sc', nome: 'Villammare Residencial', construtoraSlug: 'fontana', cidade: 'Balneário Rincão', bairro: 'Centro', uf: 'SC', imagem: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/villammare-residencial-balneario-rincao-sc.jpg' },
];

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
  return 'Sob consulta';
}
