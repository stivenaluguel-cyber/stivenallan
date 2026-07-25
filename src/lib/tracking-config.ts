// IDs das plataformas de mensuração — centralizados aqui e configuráveis por env.
// Os fallbacks mantêm produção funcionando enquanto as envs não forem criadas na
// Vercel; depois de criadas, os fallbacks podem ser removidos.
// process.env.NEXT_PUBLIC_* precisa ser referenciado estaticamente (inline no build).

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || 'G-5TWF0JTG8H'

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '364836344657445'

// Pixel adicional por página — imóveis administrados fora do catálogo principal,
// com campanha rodando em Business Manager própria (ex.: Casa Guaíba Park →
// BM CS Incorporadora, pixel nativo dela, nunca compartilhado com o pessoal).
// fbq('init', ...) aceita múltiplos pixels na mesma página — eventos seguintes
// (PageView, Lead) disparam pra todos os inicializados, sem código extra.
export const PAGE_META_PIXEL_IDS: Record<string, string> = {
  '/casa-guaiba-park': '1796321424680587',
}

// Google Ads: sem fallback — só ativa quando a conta existir e as envs forem criadas.
// (NEXT_PUBLIC_GADS_CONVERSION é lida direto em tracking.ts, no momento da chamada.)
export const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID || ''
