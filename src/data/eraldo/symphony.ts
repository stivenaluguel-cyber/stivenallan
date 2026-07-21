import type { Empreendimento } from './types'

// Fontes: site oficial (eraldoconstrucoes.com.br/empreendimentos/symphony) + Drive
// público "MATERIAL DE VENDAS" (TABELA SYMPHONY 03-07-26.pdf). URLs de imagem
// confirmadas publicamente acessíveis (200, sem sessão) antes de usar aqui.
//
// Campos deliberadamente ocultos/ausentes (sem fonte confirmada):
// - Mês de início da obra: o site só informa "obra iniciada", sem data — por isso
//   inicioObra fica omitido.
// - Área de Garden 401/402/404/407/503/506 e das coberturas duplex 1601/1602/1604/
//   1605: não lidas com segurança nesta rodada — tipologias ficam name-only.
// - Financiamento bancário: a tabela do Symphony NÃO menciona essa opção (diferente
//   de outros empreendimentos da Eraldo) — só parcelamento direto corrigido pelo
//   CUB. Por isso a política comercial aqui NÃO inclui uma linha de financiamento
//   bancário que não está na fonte.
const SITE = 'https://www.eraldoconstrucoes.com.br/wp-content/uploads'

export const symphony: Empreendimento = {
  slug: 'symphony-mar-grosso-laguna-sc',
  nome: 'Symphony',
  construtoraSlug: 'eraldo',
  cidade: 'Laguna',
  uf: 'SC',
  bairro: 'Mar Grosso',
  endereco: 'Av. Senador Gallotti, esquina com Rua Bom Jardim',
  cep: '88790-000',
  status: 'em_construcao',

  previsaoEntrega: 'Novembro de 2027',
  registroIncorporacao: 'R.2/46.592 — Ofício de Registro de Imóveis de Laguna/SC',

  pavimentos: 19,
  totalUnidades: 76,
  unidadesPorAndar: 3,

  eyebrow: 'Eraldo Construções · Mar Grosso · Laguna/SC',
  heroTitulo: 'A mais luxuosa obra da Eraldo.',
  heroSubtitulo: 'Symphony — sofisticação, poder e exclusividade a poucos passos do mar, em Mar Grosso.',
  heroImg: `${SITE}/2024/11/b09c9bf46b1e4857de7545937f48e288.png`,
  heroImgAlt: 'Symphony — fachada, Mar Grosso, Laguna SC',

  conceitoTitulo: ['Sofisticação, poder', 'e exclusividade.'],
  conceitoTextoDestaque: 'Uma Dubai só para você. A mais luxuosa e imponente obra da Eraldo Construções — o Symphony representa sofisticação, poder e exclusividade.',
  conceitoTexto: '19 pavimentos em 2 torres, com 76 apartamentos (3 por andar) em Mar Grosso, a poucos passos do mar.',
  conceitoChips: [
    { ico: '🏗', label: 'Em construção' },
    { ico: '🏢', label: '19 pavimentos' },
    { ico: '🏠', label: '76 unidades' },
    { ico: '📅', label: 'Entrega nov/2027' },
  ],
  conceitoImg: `${SITE}/2024/11/f8a4e8b127f5131c44288c33cfebe3cf.png`,
  conceitoImgAlt: 'Symphony — vista da praia de Mar Grosso, Laguna',
  conceitoStatusLabel: 'Em construção · Entrega nov/2027',

  metricas: [
    { val: '19', label: 'Pavimentos' },
    { val: '76', label: 'Unidades' },
    { val: '3', label: 'Aptos por andar' },
    { val: '11/2027', label: 'Entrega prevista' },
  ],
  metricasExtras: [
    { n: '2', label: 'Torres' },
    { n: '4', label: 'Coberturas duplex' },
  ],

  diferenciaisGrupos: [
    {
      titulo: 'Segurança & Acesso',
      itens: [
        { ico: '🪪', title: 'Acesso facial e QR Code', desc: 'Reconhecimento facial e QR Code no controle de acesso.' },
        { ico: '📹', title: 'Monitoramento eletrônico', desc: 'Áreas comuns com vigilância contínua.' },
        { ico: '🚗', title: 'Garage Hall', desc: 'Recepção coberta para embarque e desembarque com conforto.' },
        { ico: '🔐', title: 'Fechadura digital com biometria', desc: 'Segurança na entrada dos apartamentos.' },
      ],
    },
    {
      titulo: 'Conforto & Tecnologia',
      itens: [
        { ico: '🪟', title: 'Persianas automatizadas', desc: 'Esquadrias com controle por aplicativo.' },
        { ico: '🌐', title: 'Cabeamento de internet', desc: 'Rede estruturada em todos os quartos e no living.' },
        { ico: '❄️', title: 'Pré-instalação para ar-condicionado split', desc: 'Estrutura pronta para climatizar.' },
        { ico: '🔥', title: 'Pré-instalação para aquecedor a gás', desc: 'Água quente pronta para instalar.' },
        { ico: '🔇', title: 'Contrapiso com atenuante de ruídos', desc: 'Conforto sonoro no impacto entre andares.' },
        { ico: '🧱', title: 'Forro de gesso com bordas negativas', desc: 'Acabamento nobre em todos os ambientes.' },
      ],
    },
    {
      titulo: 'Sustentabilidade',
      itens: [
        { ico: '💧', title: 'Reúso de água da chuva', desc: 'Aproveitamento na limpeza das áreas comuns.' },
        { ico: '🔋', title: 'Carregamento de veículos elétricos', desc: 'Tomadas individuais de carregamento.' },
      ],
    },
    {
      titulo: 'Design & Acabamento',
      itens: [
        { ico: '✨', title: 'Fachada pastilhada e iluminada', desc: 'Acabamento nobre visível à distância.' },
        { ico: '🏺', title: 'Porcelanato 80×80', desc: 'Áreas internas revestidas em grandes formatos.' },
        { ico: '🪟', title: 'Sacadas niveladas SlidinGlass', desc: 'Sistema de vedação e integração com o living.' },
        { ico: '🗄', title: 'Depósito individual', desc: 'Espaço extra de armazenamento por apartamento.' },
        { ico: '📦', title: 'Espaço delivery', desc: 'Recebimento de encomendas sem transtorno.' },
        { ico: '🧊', title: 'Máquina de gelo', desc: 'Disponível nas áreas comuns.' },
        { ico: '🚿', title: 'Nicho e espera para ducha higiênica', desc: 'Espaço extra de praticidade no banho.' },
        { ico: '🧱', title: 'Paredes mais espessas entre apartamentos', desc: 'Mais privacidade acústica entre unidades vizinhas.' },
        { ico: '🍖', title: 'Churrasqueira a carvão com exaustor', desc: 'Sistema de vedação dumper, sem fumaça dentro de casa.' },
        { ico: '🏄', title: 'Surf Space', desc: 'Espaço dedicado para guardar pranchas e equipamentos.' },
      ],
    },
  ],
  fichaTecnicaExtra: [],

  galeriaTitulo: 'Perspectivas do Symphony',
  galeriaTexto: 'Imagens ilustrativas do projeto — o empreendimento está em construção.',
  galeria: [
    { src: `${SITE}/2024/11/b09c9bf46b1e4857de7545937f48e288.png`, alt: 'Symphony — fachada', label: 'Fachada' },
    { src: `${SITE}/2024/11/f8a4e8b127f5131c44288c33cfebe3cf.png`, alt: 'Symphony — vista da praia de Mar Grosso', label: 'Vista para o mar' },
    { src: `${SITE}/2024/11/Background-1-2.png`, alt: 'Symphony — piscina e deck com vista para o mar', label: 'Piscina' },
    { src: `${SITE}/2024/11/Background-4.png`, alt: 'Symphony — espaço gourmet', label: 'Espaço gourmet' },
    { src: `${SITE}/2024/11/Background-6.png`, alt: 'Symphony — hall de entrada', label: 'Hall de entrada' },
  ],

  tipologias: [
    { nome: 'Apartamento — posição 6', areaPrivativa: 122.01, dormitorios: 3, suites: 3 },
    { nome: 'Apartamento — posição 1', areaPrivativa: 199.68, dormitorios: 4, suites: 4 },
    { nome: 'Garden (401/402/404/407/503/506)', observacao: 'Área privativa não confirmada com segurança na fonte disponível.' },
    { nome: 'Cobertura duplex (1601/1602/1604/1605)', observacao: 'Área privativa não confirmada com segurança na fonte disponível.' },
  ],
  plantasTitulo: 'Escolha o seu layout',
  plantasTexto: 'Apartamentos, unidades garden e coberturas duplex — plantas por posição no andar.',
  plantas: [
    { categoria: 'tipo', src: `${SITE}/2024/11/7-Planta-Symphony-Apto-6-1.jpg`, alt: 'Symphony — planta apartamento posição 6', label: 'Apartamento 6', area: 122.01, quartos: 3, suites: 3 },
    { categoria: 'tipo', src: `${SITE}/2024/11/7-Planta-Symphony-Apto-1.jpg`, alt: 'Symphony — planta apartamento posição 1', label: 'Apartamento 1', area: 199.68, quartos: 4, suites: 4 },
    { categoria: 'tipo', src: `${SITE}/2024/11/7-Planta-Symphony-Apto-2.jpg`, alt: 'Symphony — planta apartamento posição 2', label: 'Apartamento 2' },
    { categoria: 'tipo', src: `${SITE}/2024/11/7-Planta-Symphony-Apto-3-1.jpg`, alt: 'Symphony — planta apartamento posição 3', label: 'Apartamento 3' },
    { categoria: 'tipo', src: `${SITE}/2024/11/7-Planta-Symphony-Apto-4.jpg`, alt: 'Symphony — planta apartamento posição 4', label: 'Apartamento 4' },
    { categoria: 'tipo', src: `${SITE}/2024/11/7-Planta-Symphony-Apto-5.jpg`, alt: 'Symphony — planta apartamento posição 5', label: 'Apartamento 5' },
    { categoria: 'garden', src: `${SITE}/2024/11/1-Planta-Symphony-Garden-401.jpg`, alt: 'Symphony — planta garden 401', label: 'Garden 401' },
    { categoria: 'garden', src: `${SITE}/2024/11/2-Planta-Symphony-Garden-402.jpg`, alt: 'Symphony — planta garden 402', label: 'Garden 402' },
    { categoria: 'garden', src: `${SITE}/2024/11/3-Planta-Symphony-Garden-404.jpg`, alt: 'Symphony — planta garden 404', label: 'Garden 404' },
    { categoria: 'garden', src: `${SITE}/2024/11/5-Planta-Symphony-Garden-503.jpg`, alt: 'Symphony — planta garden 503', label: 'Garden 503' },
    { categoria: 'duplex', src: `${SITE}/2024/11/8-Planta-Symphony-Duplex-1601-e-1605.jpg`, alt: 'Symphony — planta cobertura duplex 1601 e 1605', label: 'Duplex 1601/1605' },
    { categoria: 'duplex', src: `${SITE}/2024/11/9-Planta-Symphony-Duplex-1602-e-1604.jpg`, alt: 'Symphony — planta cobertura duplex 1602 e 1604', label: 'Duplex 1602/1604' },
    { categoria: 'comum', src: `${SITE}/2024/11/10-Planta-Symphony-G-Subsolo.jpg`, alt: 'Symphony — planta do subsolo', label: 'Subsolo' },
    { categoria: 'comum', src: `${SITE}/2024/11/11-Planta-Symphony-G1.jpg`, alt: 'Symphony — planta da garagem G1', label: 'Garagem G1' },
  ],
  plantasGrupos: [
    { titulo: 'Apartamentos', categoria: 'tipo' },
    { titulo: 'Gardens', categoria: 'garden' },
    { titulo: 'Coberturas duplex', categoria: 'duplex' },
    { titulo: 'Áreas comuns e garagem', categoria: 'comum' },
  ],

  lazerTitulo: 'Lazer completo, a poucos passos do mar',
  lazerTexto: 'Salão de festas, game center, piscina, deck externo e deck coberto — tudo com vista para o mar.',
  lazerImg: `${SITE}/2024/11/Background-1-2.png`,
  lazerImgAlt: 'Symphony — piscina e deck com vista para o mar',
  lazer: ['Salão de festas', 'Game center', 'Playground', 'Espaço gourmet', 'Espaço fitness', 'Pet place', 'Bike share', 'Piscina', 'Deck externo', 'Deck coberto'],

  localizacaoTitulo: 'Mar Grosso, Laguna',
  localizacaoTexto: 'Av. Senador Gallotti — em Mar Grosso, a poucos passos do mar.',
  mapsQuery: 'Av. Senador Gallotti, Mar Grosso, Laguna - SC',

  politicaComercial: {
    condicoes: [
      { titulo: 'Condição 1', texto: '5% de desconto para pagamento até as chaves — 20% de entrada, 20% em reforços anuais e 60% em 16 parcelas mensais corrigidas somente pelo CUB.' },
      { titulo: 'Condição 2', texto: '10% de desconto para pagamento à vista.' },
    ],
    correcaoCub: true,
    cubValor: 3121.62,
    cubReferencia: 'julho/2026',
  },

  ctaFinalTitulo: 'Garanta o seu Symphony.',
  ctaFinalTexto: 'O Symphony está em construção em Mar Grosso, a poucos passos do mar. Fale com Stiven para conhecer plantas, valores e condições de pagamento direto com a Eraldo Construções.',

  faq: [
    { pergunta: 'Como funciona o pagamento do Symphony?', resposta: '20% de entrada, 20% em reforços anuais e 60% em 16 parcelas mensais corrigidas pelo CUB/SC, com 5% de desconto até as chaves ou 10% de desconto à vista. Fale com Stiven para a tabela atualizada.' },
    { pergunta: 'Qual a previsão de entrega do Symphony?', resposta: 'Entrega prevista para novembro de 2027, em Mar Grosso, Laguna/SC.' },
    { pergunta: 'O Symphony já iniciou as obras?', resposta: 'Sim, a obra está em andamento. Fale com Stiven para saber a etapa atual.' },
    { pergunta: 'Quantos pavimentos e apartamentos tem o Symphony?', resposta: '19 pavimentos em 2 torres, com 76 unidades — 3 apartamentos por andar, além de unidades garden e coberturas duplex.' },
    { pergunta: 'Quem é a construtora do Symphony?', resposta: 'Eraldo Construções, com atuação em Tubarão, Criciúma, Laguna, Imbituba e Balneário Rincão. Stiven Allan atende como corretor parceiro para este e outros lançamentos da Eraldo.' },
  ],

  fontes: {
    siteUrl: 'https://www.eraldoconstrucoes.com.br/empreendimentos/symphony/',
    catalogoArquivo: 'SYMPHONY.pdf (Drive — MATERIAL DE VENDAS/CATÁLOGOS)',
    tabelaArquivo: 'TABELA SYMPHONY 03-07-26.pdf',
    tabelaVigencia: '2026-07-03',
  },
}
