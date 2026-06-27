// Fonte única de dados dos empreendimentos.
// Usada pela home, pelas páginas /lancamentos/[cidade], pela rota de detalhe
// /empreendimento/[construtora]/[slug] e pelo sitemap — para manter tudo sincronizado.

export type StatusObra = 'na planta' | 'em obras' | 'pronto';

export interface Empreendimento {
  slug: string;            // slug usado na URL de detalhe
  nome: string;
  construtoraSlug: string; // ex.: 'fontana'
  construtoraNome: string; // ex.: 'Construtora Fontana'
  cidade: string;
  bairro: string;
  uf: string;
  regiao: string;
  statusObra: StatusObra;
  dorms: string;
  areaMin: number;
  areaMax: number;
  exibirPreco: boolean;
  precoAPartirDe: number;
  frase: string;
  descricao: string;
  diferenciais: string[];
  imagens: string[];       // urls de fotos reais (vazio = usa fallback)
  catalogoUrl?: string;
  videoUrl?: string;
  oculto?: boolean;        // não aparece em listagens, mas a página resolve
}

// Imagem de fallback enquanto não houver fotos reais.
export const IMAGEM_FALLBACK = '/og-image.jpg';

export const EMPREENDIMENTOS: Empreendimento[] = [
  {
    slug: 'monte-leone-ana-lucia-criciuma-sc',
    nome: 'Monte Leone Residencial',
    construtoraSlug: 'fontana',
    construtoraNome: 'Construtora Fontana',
    cidade: 'Criciúma',
    bairro: 'Centro',
    uf: 'SC',
    regiao: 'Sul Catarinense',
    statusObra: 'na planta',
    dorms: '2 e 3 dorms',
    areaMin: 230,
    areaMax: 253,
    exibirPreco: true,
    precoAPartirDe: 280000,
    frase: 'Viver no centro com a sofisticação que você merece.',
    descricao:
      'Empreendimento na planta no coração de Criciúma, com apartamentos amplos de 2 e 3 dormitórios e acabamento de alto padrão. Financiamento direto com a construtora, sem aprovação bancária.',
    diferenciais: [
      'Apartamentos de 2 e 3 dormitórios',
      'Áreas privativas de 230 a 253 m²',
      'Localização central em Criciúma',
      'Financiamento direto com a construtora',
    ],
    imagens: [],
  },
  {
    slug: 'lavis-residencial-centro-criciuma-sc',
    nome: 'Lavis Residencial',
    construtoraSlug: 'fontana',
    construtoraNome: 'Construtora Fontana',
    cidade: 'Criciúma',
    bairro: 'Centro',
    uf: 'SC',
    regiao: 'Sul Catarinense',
    statusObra: 'em obras',
    dorms: '2 e 3 dorms',
    areaMin: 65,
    areaMax: 95,
    exibirPreco: true,
    precoAPartirDe: 320000,
    frase: 'Conforto moderno no coração de Criciúma.',
    descricao:
      'Em obras no Centro de Criciúma, o Lavis Residencial une conforto moderno, plantas inteligentes e localização privilegiada. Condições de financiamento direto negociadas com a construtora.',
    diferenciais: [
      'Apartamentos de 2 e 3 dormitórios',
      'Áreas privativas de 65 a 95 m²',
      'Plantas modernas e funcionais',
      'Financiamento direto com a construtora',
    ],
    imagens: [],
  },
  {
    slug: 'pineto-centro-criciuma-sc',
    nome: 'Pineto Residencial',
    construtoraSlug: 'fontana',
    construtoraNome: 'Construtora Fontana',
    cidade: 'Criciúma',
    bairro: 'Centro',
    uf: 'SC',
    regiao: 'Sul Catarinense',
    statusObra: 'na planta',
    dorms: '2 dorms (1 suíte)',
    areaMin: 75,
    areaMax: 76,
    exibirPreco: true,
    precoAPartirDe: 619250,
    frase: 'Design, localização e liberdade financeira em um só endereço.',
    descricao:
      'Pronto para morar no Centro de Criciúma. O Pineto Residencial combina design, localização privilegiada e a liberdade do financiamento direto com a construtora.',
    diferenciais: [
      'Apartamentos de 2 e 3 dormitórios',
      'Áreas privativas de 65 a 110 m²',
      'Pronto para morar',
      'Financiamento direto com a construtora',
    ],
    imagens: [
      'https://lh3.googleusercontent.com/d/1WoeVn8nWbU-Zbr-NGK9fT-quhSH_OFas=w1600',
      'https://lh3.googleusercontent.com/d/1pAWa8inPVV_XM0-CDKNC6M8T6YO5wNGv=w1600',
      'https://lh3.googleusercontent.com/d/1KmOmEQuPraRJUfmW8FBoK-6_WyQ8fFK_=w1600',
      'https://lh3.googleusercontent.com/d/1lzQM-x4vIGkMBbwuGrqwIiTZ8RqgdolJ=w1600',
      'https://lh3.googleusercontent.com/d/1PwMdWzuLF7hXM9SkEVNtv90kvjdPR3dt=w1600',
      'https://lh3.googleusercontent.com/d/1HKmiz9MsLrg3xrW2WknSq3YdLLlsv921=w1600',
      'https://lh3.googleusercontent.com/d/1ISCgwxJn2DIBQAhUb3bl1dfcOf-34hzC=w1600',
      'https://lh3.googleusercontent.com/d/1mt3O1a0jWgMHBXK8CCIRjMOQPBrdIqRS=w1600',
      'https://lh3.googleusercontent.com/d/1osvUbZHc8XJP0gZP2Oxbn1PZK1V3fgVW=w1600',
      'https://lh3.googleusercontent.com/d/1UY_UxkyWI1gN8dMqW_7UJVl2uMBHsAMP=w1600',
      'https://lh3.googleusercontent.com/d/1Mg6ipBSqIecSJ9nWmlQtClUwFVzvsm9R=w1600',
    ],
    catalogoUrl: 'https://drive.google.com/file/d/1NvzrWE4HAz8UnI9NaTqKeEpaEgmTv5wr/view',
    videoUrl: 'https://drive.google.com/file/d/1cNbxAoNKNQwoSo6bzCGYAl9_C1_gELOG/preview',
  },
  {
    slug: 'hub-smart-home-criciuma-sc',
    nome: 'Hub Smart Home',
    construtoraSlug: 'fontana',
    construtoraNome: 'Construtora Fontana',
    cidade: 'Criciúma',
    bairro: 'Centro',
    uf: 'SC',
    regiao: 'Sul Catarinense',
    statusObra: 'em obras',
    dorms: '2 e 3 dorms',
    areaMin: 0,
    areaMax: 0,
    exibirPreco: false,
    precoAPartirDe: 0,
    frase: 'Um novo padrão de viver no Sul Catarinense.',
    descricao:
      'Empreendimento com conceito smart home em Criciúma. Condições e disponibilidade sob consulta.',
    diferenciais: [
      'Conceito smart home',
      'Localização em Criciúma',
      'Financiamento direto com a construtora',
    ],
    imagens: [],
    oculto: true,
  },
];

// --- Helpers ---

// Empreendimentos visíveis em listagens (home, /lancamentos).
export function getEmpreendimentosVisiveis(): Empreendimento[] {
  return EMPREENDIMENTOS.filter((e) => !e.oculto);
}

// Resolve um empreendimento pela combinação construtora + slug.
export function getEmpreendimento(
  construtoraSlug: string,
  slug: string,
): Empreendimento | undefined {
  return EMPREENDIMENTOS.find(
    (e) => e.construtoraSlug === construtoraSlug && e.slug === slug,
  );
}

// Caminho canônico da página de detalhe.
export function hrefEmpreendimento(e: Empreendimento): string {
  return '/empreendimento/' + e.construtoraSlug + '/' + e.slug;
}

// Modelo de preço híbrido — consistente em todo o site.
export function precoLabel(e: Empreendimento): string {
  if (!e.exibirPreco || !e.precoAPartirDe) return 'Sob consulta';
  return 'A partir de R$ ' + e.precoAPartirDe.toLocaleString('pt-BR');
}

// Rótulo amigável de fase da obra.
export function statusLabel(s: StatusObra): string {
  if (s === 'na planta') return 'Na planta';
  if (s === 'em obras') return 'Em obras';
  return 'Pronto para morar';
}
