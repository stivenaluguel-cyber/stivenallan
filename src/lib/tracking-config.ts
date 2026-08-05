// IDs das plataformas de mensuração — centralizados aqui e configuráveis por env.
// Os fallbacks mantêm produção funcionando enquanto as envs não forem criadas na
// Vercel; depois de criadas, os fallbacks podem ser removidos.
// process.env.NEXT_PUBLIC_* precisa ser referenciado estaticamente (inline no build).

// ─────────────────────────────────────────────────────────────────────
// Interruptor geral de mensuração.
//
// Por que existe: os fallbacks abaixo são os IDs REAIS de produção. Hoje o
// NEXT_PUBLIC_GA4_ID nem está declarado na Vercel — produção depende só do
// fallback. Consequência: qualquer ambiente que rode este código sem env
// própria (preview, QA, máquina de dev) manda dado para as contas de verdade.
//
// Trocar o ID por um valor falso NÃO resolve: o <Script> do GA4 continua
// baixando googletagmanager.com e o snippet do Pixel continua baixando
// connect.facebook.net — só que com ID inválido. A requisição sai igual.
// Desligar de verdade é não injetar script nenhum, e é isso que ID vazio faz
// (ver AnalyticsScripts.tsx, que agora checa cada ID antes de renderizar).
//
// Semântica escolhida:
//   ausente/vazio/"false"/"0" → LIGADO (produção não muda de comportamento)
//   qualquer outro valor      → DESLIGADO
// O default é ligado de propósito, para esta variável nunca poder derrubar a
// mensuração de produção por esquecimento. Já a checagem é frouxa de
// propósito no outro sentido: "1", "yes", "sim", "TRUE" e até um typo qualquer
// desligam. Num interruptor de segurança, errar para o lado de não coletar é
// barato; errar para o lado de coletar em ambiente errado contamina conta real.
const desligado = (process.env.NEXT_PUBLIC_ANALYTICS_DISABLED ?? '').trim().toLowerCase()
export const ANALYTICS_DISABLED = desligado !== '' && desligado !== 'false' && desligado !== '0'

export const GA4_ID = ANALYTICS_DISABLED ? '' : (process.env.NEXT_PUBLIC_GA4_ID || 'G-5TWF0JTG8H')

export const META_PIXEL_ID = ANALYTICS_DISABLED ? '' : (process.env.NEXT_PUBLIC_META_PIXEL_ID || '364836344657445')

// Pixel adicional por página — imóveis administrados fora do catálogo principal,
// com campanha rodando em Business Manager própria (ex.: Casa Guaíba Park →
// BM CS Incorporadora, pixel nativo dela, nunca compartilhado com o pessoal).
// fbq('init', ...) aceita múltiplos pixels na mesma página — eventos seguintes
// (PageView, Lead) disparam pra todos os inicializados, sem código extra.
export const PAGE_META_PIXEL_IDS: Record<string, string> = ANALYTICS_DISABLED
  ? {}
  : {
      '/casa-guaiba-park': '1796321424680587',
    }

// Google Ads: sem fallback — só ativa quando a conta existir e as envs forem criadas.
// (NEXT_PUBLIC_GADS_CONVERSION é lida direto em tracking.ts, no momento da chamada.)
export const GADS_ID = ANALYTICS_DISABLED ? '' : (process.env.NEXT_PUBLIC_GADS_ID || '')
