// Faixas de investimento do formulário de contato, por padrão do empreendimento.
// Calibradas pelas tabelas oficiais de julho/2026 (CUB/SC R$ 3.121,62):
// A: Lavis 1,70–2,28M · Aura 1,76–2,25M (duplex até 4,1M) · Fidenza 2,38–2,68M · Monte Leone 3,33–4,60M
// B: Calliano 0,90M · Due Fratelli 0,90–1,00M · Parco Savello 1,00–1,17M · Thiene 1,07–1,51M · Tremezzo 1,22–1,57M
// C: Pavia 0,57–0,62M · Bosco 0,58–0,68M · Bellante 0,62–0,65M · Pineto 0,66–0,82M · Calalzo 0,71M · Gran Michel 0,65–1,27M
// Slugs fora do mapa (L'Essence, Villaggio Verde, litoral, Içara, Siderópolis,
// Tubarão, serra e cadastros futuros do dashboard) usam as faixas padrão.
export type TierInvestimento = 'A' | 'B' | 'C';

export const FAIXAS_PADRAO: readonly string[] = [
  'Até R$ 600 mil',
  'R$ 600 mil a R$ 1 milhão',
  'R$ 1 a 2 milhões',
  'Acima de R$ 2 milhões',
];

const FAIXAS_POR_TIER: Record<TierInvestimento, readonly string[]> = {
  A: ['Até R$ 1,5 milhão', 'R$ 1,5 a 2,5 milhões', 'R$ 2,5 a 3,5 milhões', 'Acima de R$ 3,5 milhões'],
  B: ['Até R$ 900 mil', 'R$ 900 mil a R$ 1,2 milhão', 'R$ 1,2 a 1,6 milhão', 'Acima de R$ 1,6 milhão'],
  C: ['Até R$ 600 mil', 'R$ 600 a 750 mil', 'R$ 750 a 900 mil', 'Acima de R$ 900 mil'],
};

const TIER_POR_SLUG: Record<string, TierInvestimento> = {
  // Alto padrão — Criciúma
  'monte-leone-centro-criciuma-sc': 'A',
  'fidenza-residencial-cruzeiro-do-sul-criciuma-sc': 'A',
  'lavis-residencial-centro-criciuma-sc': 'A',
  'arbor-centro-criciuma-sc': 'A',
  'aura-residence-centro-criciuma-sc': 'A',
  // Médio-alto — Criciúma
  'tremezzo-residencial-centro-criciuma-sc': 'B',
  'thiene-centro-criciuma-sc': 'B',
  'parco-savello-santa-barbara-criciuma-sc': 'B',
  'due-fratelli-centro-criciuma-sc': 'B',
  'calliano-centro-criciuma-sc': 'B',
  // Compacto — Criciúma
  'bellante-comerciario-criciuma-sc': 'C',
  'bosco-del-montello-centro-criciuma-sc': 'C',
  'pineto-centro-criciuma-sc': 'C',
  'calalzo-di-cadore-michel-criciuma-sc': 'C',
  'pavia-rio-maina-criciuma-sc': 'C',
  'gran-michel-criciuma-sc': 'C',
};

export function getFaixasInvestimento(slug?: string | null): readonly string[] {
  if (!slug) return FAIXAS_PADRAO;
  const tier = TIER_POR_SLUG[slug];
  return tier ? FAIXAS_POR_TIER[tier] : FAIXAS_PADRAO;
}
