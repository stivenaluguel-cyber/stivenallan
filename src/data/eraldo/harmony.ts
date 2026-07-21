import type { Empreendimento } from './types'

// Fontes: site oficial (eraldoconstrucoes.com.br/empreendimentos/harmony-residence) +
// Drive público "MATERIAL DE VENDAS" (TABELA HARMONY 01-07-26.pdf). URLs de imagem
// confirmadas publicamente acessíveis (200, sem sessão) antes de usar aqui.
//
// Campos deliberadamente ocultos/ausentes (sem fonte confirmada):
// - vagas por tipologia: nem o site nem a tabela trazem essa coluna.
// - área exata das 2 coberturas planas: a tabela confirma a faixa 211,30–216,70 m²,
//   mas não foi possível ler com segurança qual planta (cobertura1/cobertura2)
//   corresponde a qual valor — por isso a ficha técnica das coberturas não traz área.
// - correção CUB: a tabela cita o CUB/SC de referência (igual em todas as 8 tabelas),
//   mas o texto das condições comerciais do Harmony não afirma explicitamente que as
//   parcelas são corrigidas pelo CUB (diferente de Árbor/Gran Michel) — por isso
//   politicaComercial.correcaoCub fica false aqui, para não generalizar.
const SITE = 'https://www.eraldoconstrucoes.com.br/wp-content/uploads'

export const harmony: Empreendimento = {
  slug: 'harmony-residence-centro-balneario-rincao-sc',
  nome: 'Harmony Residence',
  construtoraSlug: 'eraldo',
  cidade: 'Balneário Rincão',
  uf: 'SC',
  bairro: 'Centro',
  endereco: 'Rua Urupema',
  cep: '88820-000',
  status: 'lancamento',

  inicioObra: 'Março de 2026',
  previsaoEntrega: 'Setembro de 2029',
  registroIncorporacao: 'R.1/63.749 — Ofício de Registro de Imóveis da Comarca de Içara/SC',

  pavimentos: 12,
  totalUnidades: 36,

  eyebrow: 'Eraldo Construções · Centro · Balneário Rincão/SC',
  heroTitulo: 'A vida em sintonia com o mar.',
  heroSubtitulo: 'Harmony Residence — localização privilegiada a poucos passos do mar, em Balneário Rincão.',
  heroImg: `${SITE}/2026/03/drone3-scaled-e1773844454167.jpg`,
  heroImgAlt: 'Harmony Residence — vista aérea noturna da torre à beira-mar, Balneário Rincão SC',

  conceitoTitulo: ['O prazer de morar', 'onde o mar é presença constante.'],
  conceitoTextoDestaque: 'O Harmony une localização privilegiada, exclusividade e o prazer de morar onde a presença constante do mar encontra um espaço pensado para acolher o dia a dia com harmonia.',
  conceitoTexto: '12 pavimentos no Centro de Balneário Rincão, com 34 apartamentos tipo e 2 coberturas planas — 4 unidades por andar e 2 pavimentos de garagem.',
  conceitoChips: [
    { ico: '🏗', label: 'Lançamento' },
    { ico: '🏢', label: '12 pavimentos' },
    { ico: '🏠', label: '36 unidades' },
    { ico: '📅', label: 'Entrega set/2029' },
  ],
  conceitoImg: `${SITE}/2026/03/vista1-scaled.jpg`,
  conceitoImgAlt: 'Harmony Residence — vista externa do empreendimento',
  conceitoStatusLabel: 'Lançamento · Entrega set/2029',

  metricas: [
    { val: '12', label: 'Pavimentos' },
    { val: '36', label: 'Unidades' },
    { val: '4', label: 'Aptos por andar' },
    { val: '09/2029', label: 'Entrega prevista' },
  ],
  metricasExtras: [
    { n: '2', label: 'Pavimentos de garagem' },
    { n: '2', label: 'Coberturas planas' },
  ],

  diferenciaisGrupos: [
    {
      titulo: 'Segurança & Acesso',
      itens: [
        { ico: '🪪', title: 'Acesso facial e QR Code', desc: 'Controle de acesso com reconhecimento facial e QR Code no hall de entrada.' },
        { ico: '📹', title: 'Monitoramento eletrônico', desc: 'Áreas comuns com vigilância contínua.' },
        { ico: '🚗', title: 'Garage hall', desc: 'Recepção coberta para embarque e desembarque com conforto.' },
        { ico: '🛗', title: '2 elevadores', desc: 'Circulação vertical ágil para os moradores.' },
      ],
    },
    {
      titulo: 'Conforto & Tecnologia',
      itens: [
        { ico: '🔇', title: 'Contrapiso com atenuante de ruídos', desc: 'Conforto sonoro no impacto entre andares.' },
        { ico: '🌐', title: 'Cabeamento de internet', desc: 'Rede estruturada em todos os quartos e no living.' },
        { ico: '❄️', title: 'Pré-instalação para ar-condicionado', desc: 'Tubulação de cobre pronta para climatizar.' },
        { ico: '🪟', title: 'Persianas automatizadas', desc: 'Esquadrias com persianas automatizadas nos quartos.' },
        { ico: '🔥', title: 'Pré-instalação para aquecedor a gás', desc: 'Água quente pronta para instalar.' },
        { ico: '🏖️', title: 'Acesso para banhistas com ducha', desc: 'Praticidade para quem volta da praia.' },
      ],
    },
    {
      titulo: 'Sustentabilidade',
      itens: [
        { ico: '☀️', title: 'Energia fotovoltaica', desc: 'Geração própria de energia solar nas áreas comuns.' },
        { ico: '💧', title: 'Reúso de água da chuva', desc: 'Aproveitamento na limpeza das áreas comuns.' },
        { ico: '🔋', title: 'Carregamento de veículos elétricos', desc: 'Tomadas individuais para carregamento na garagem.' },
      ],
    },
    {
      titulo: 'Design & Acabamento',
      itens: [
        { ico: '🏺', title: 'Porcelanato 90×90', desc: 'Áreas internas revestidas em grandes formatos.' },
        { ico: '🚿', title: 'Nicho e espera para ducha higiênica', desc: 'Espaço extra de praticidade no banho.' },
        { ico: '🔐', title: 'Fechadura digital com biometria', desc: 'Segurança na entrada dos apartamentos.' },
        { ico: '🍖', title: 'Churrasqueira a carvão com exaustor', desc: 'Sistema de vedação dumper, sem fumaça dentro de casa.' },
        { ico: '🧱', title: 'Paredes mais espessas entre apartamentos', desc: 'Mais privacidade acústica entre unidades vizinhas.' },
        { ico: '🗄', title: 'Depósito individual', desc: 'Espaço extra de armazenamento por apartamento.' },
        { ico: '📦', title: 'Espaço delivery', desc: 'Recebimento de encomendas sem transtorno.' },
        { ico: '🧊', title: 'Máquina de gelo', desc: 'Disponível nas áreas comuns.' },
      ],
    },
  ],
  fichaTecnicaExtra: [],

  galeriaTitulo: 'Perspectivas do Harmony',
  galeriaTexto: 'Imagens ilustrativas do projeto — o empreendimento está em fase de lançamento.',
  galeria: [
    { src: `${SITE}/2026/03/fachada2-2-scaled.jpg`, alt: 'Harmony Residence — fachada', label: 'Fachada' },
    { src: `${SITE}/2026/03/piscina-scaled.jpg`, alt: 'Harmony Residence — piscina com prainha e deck', label: 'Piscina' },
    { src: `${SITE}/2026/03/festas2-scaled.jpeg`, alt: 'Harmony Residence — salão de festas', label: 'Salão de festas' },
    { src: `${SITE}/2026/03/academia-1-scaled.jpg`, alt: 'Harmony Residence — academia', label: 'Academia' },
    { src: `${SITE}/2026/03/grill.jpg`, alt: 'Harmony Residence — espaço grill', label: 'Espaço grill' },
    { src: `${SITE}/2026/03/IMG_6734.JPG-1-1-scaled.jpeg`, alt: 'Harmony Residence — living com vista para o mar', label: 'Living' },
    { src: `${SITE}/2026/03/Copia-de-IMG_2612-1-scaled.jpg`, alt: 'Harmony Residence — terraço da cobertura com vista para o mar', label: 'Cobertura' },
    { src: `${SITE}/2026/03/sacada-scaled.jpg`, alt: 'Harmony Residence — sacada', label: 'Sacada' },
  ],

  tipologias: [
    { nome: 'Apartamento tipo — Final 03', areaPrivativa: 74.43, dormitorios: 2, suites: 2 },
    { nome: 'Apartamento tipo — Final 04', areaPrivativa: 100.88, dormitorios: 3, suites: 1 },
    { nome: 'Apartamento tipo — Final 01', areaPrivativa: 122.82, dormitorios: 3, suites: 3 },
    { nome: 'Apartamento tipo — Final 02', areaPrivativa: 125.03, dormitorios: 3, suites: 3 },
    { nome: 'Cobertura plana', observacao: '211,30 a 216,70 m² de área privativa, conforme a unidade.' },
  ],
  plantasTitulo: 'Escolha o seu layout',
  plantasTexto: 'Apartamentos tipo e coberturas planas — plantas por unidade.',
  plantas: [
    { categoria: 'tipo', src: `${SITE}/2026/03/TIPO-FINAL-01-scaled.png`, alt: 'Harmony Residence — planta apartamento final 01', label: 'Apartamento final 01', area: 122.82, quartos: 3, suites: 3 },
    { categoria: 'tipo', src: `${SITE}/2026/03/TIPO-FINAL-02-scaled.png`, alt: 'Harmony Residence — planta apartamento final 02', label: 'Apartamento final 02', area: 125.03, quartos: 3, suites: 3 },
    { categoria: 'tipo', src: `${SITE}/2026/03/TIPO-FINAL-03-scaled.png`, alt: 'Harmony Residence — planta apartamento final 03', label: 'Apartamento final 03', area: 74.43, quartos: 2, suites: 2 },
    { categoria: 'tipo', src: `${SITE}/2026/03/TIPO-FINAL-04-scaled.png`, alt: 'Harmony Residence — planta apartamento final 04', label: 'Apartamento final 04', area: 100.88, quartos: 3, suites: 1 },
    { categoria: 'cobertura', src: `${SITE}/2026/03/cobertura1-scaled.png`, alt: 'Harmony Residence — planta cobertura final 01', label: 'Cobertura final 01' },
    { categoria: 'cobertura', src: `${SITE}/2026/03/cobertura2-scaled.png`, alt: 'Harmony Residence — planta cobertura final 02', label: 'Cobertura final 02' },
    { categoria: 'comum', src: `${SITE}/2026/03/AREA-DE-LAZER_TIPO-FINAL-04-scaled.png`, alt: 'Harmony Residence — planta da área de lazer', label: 'Área de lazer' },
    { categoria: 'comum', src: `${SITE}/2026/03/terreo-scaled.jpg`, alt: 'Harmony Residence — planta do térreo', label: 'Térreo' },
    { categoria: 'comum', src: `${SITE}/2026/03/garagem-scaled.jpg`, alt: 'Harmony Residence — planta da garagem G1', label: 'Garagem G1' },
  ],
  plantasGrupos: [
    { titulo: 'Apartamentos', categoria: 'tipo' },
    { titulo: 'Coberturas', categoria: 'cobertura' },
    { titulo: 'Áreas comuns e garagem', categoria: 'comum' },
  ],

  lazerTitulo: 'Lazer com vista para o mar',
  lazerTexto: 'Piscina com prainha e deck, salão de festas, academia e espaço grill.',
  lazerImg: `${SITE}/2026/03/piscina-scaled.jpg`,
  lazerImgAlt: 'Harmony Residence — piscina com prainha e deck',
  lazer: ['Piscina com prainha e deck', 'Salão de festas', 'Academia', 'Espaço grill'],

  localizacaoTitulo: 'Centro, Balneário Rincão',
  localizacaoTexto: 'Rua Urupema — no Centro de Balneário Rincão, a poucos passos do mar.',
  mapsQuery: 'Rua Urupema, Centro, Balneário Rincão - SC',

  politicaComercial: {
    condicoes: [
      { titulo: 'Condição 1 (parcelamento direto)', texto: '20% de entrada, 40% em 7 reforços e 40% em parcelas mensais.' },
      { titulo: 'Condição 2', texto: '5% de desconto para pagamento até as chaves — 20% de entrada, 40% em 3 reforços anuais e 40% em parcelas mensais até o fim da obra.' },
      { titulo: 'Condição 3', texto: '10% de desconto para pagamento à vista.' },
    ],
    correcaoCub: false,
  },

  ctaFinalTitulo: 'Garanta o seu Harmony Residence.',
  ctaFinalTexto: 'O Harmony Residence é o novo lançamento da Eraldo Construções em Balneário Rincão. Fale com Stiven para conhecer plantas, valores e condições de pagamento direto com a construtora.',

  faq: [
    { pergunta: 'Como funciona o financiamento direto do Harmony Residence?', resposta: 'Parcelamento direto com a construtora: 20% de entrada, 40% em 7 reforços e 40% em parcelas mensais. Há também uma condição com 5% de desconto para pagamento até as chaves e outra com 10% de desconto à vista. Fale com Stiven para a tabela atualizada.' },
    { pergunta: 'Qual a previsão de entrega do Harmony Residence?', resposta: 'Entrega prevista para setembro de 2029, no Centro de Balneário Rincão/SC. Início de obra em março de 2026.' },
    { pergunta: 'O Harmony Residence já iniciou as obras?', resposta: 'É um lançamento — a obra tem início previsto para março de 2026. Fale com Stiven para saber a etapa atual.' },
    { pergunta: 'Quantos pavimentos e apartamentos tem o Harmony Residence?', resposta: '12 pavimentos, com 36 unidades — 34 apartamentos tipo (4 por andar) e 2 coberturas planas.' },
    { pergunta: 'Quem é a construtora do Harmony Residence?', resposta: 'Eraldo Construções, com atuação em Tubarão, Criciúma, Laguna, Imbituba e Balneário Rincão. Stiven Allan atende como corretor parceiro para este e outros lançamentos da Eraldo.' },
  ],

  fontes: {
    siteUrl: 'https://www.eraldoconstrucoes.com.br/empreendimentos/harmony-residence/',
    catalogoArquivo: 'HARMONY.pdf (Drive — MATERIAL DE VENDAS/CATÁLOGOS)',
    tabelaArquivo: 'TABELA HARMONY 01-07-26.pdf',
    tabelaVigencia: '2026-07-01',
  },
}
