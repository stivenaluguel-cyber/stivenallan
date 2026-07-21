import type { Empreendimento } from './types'

// Fontes: site oficial (eraldoconstrucoes.com.br/empreendimentos/horizon) + Drive
// público "MATERIAL DE VENDAS" (TABELA HORIZON 01-07-26.pdf). URLs de imagem
// confirmadas publicamente acessíveis (200, sem sessão) antes de usar aqui.
//
// Campos deliberadamente ocultos/ausentes (sem fonte confirmada):
// - CEP: não localizado nem no site nem na tabela.
// - área privativa do Garden 302: a planta oficial traz o valor impresso, mas em
//   resolução no limite da legibilidade seguraм — por isso a ficha técnica desta
//   planta fica sem área (mantém quartos/suítes, que são claramente legíveis).
// - vagas nas unidades garden: o site só confirma "2 vagas" para o apartamento
//   tipo (125m²) — não generalizado para as unidades garden, que são maiores.
// - correção CUB: a tabela cita o CUB/SC de referência (igual em todas as 8
//   tabelas), mas o texto das condições comerciais do Horizon não afirma que as
//   parcelas são corrigidas pelo CUB — por isso politicaComercial.correcaoCub
//   fica false, sem generalizar.
// - "últimas unidades": a entrega está a poucos meses (30/nov/2026), mas nada na
//   tabela ou no site comprova disponibilidade limitada — por instrução do
//   usuário, a copy NÃO usa esse termo, apenas o estágio real da obra.
const SITE = 'https://www.eraldoconstrucoes.com.br/wp-content/uploads'

export const horizon: Empreendimento = {
  slug: 'horizon-centro-balneario-rincao-sc',
  nome: 'Horizon',
  construtoraSlug: 'eraldo',
  cidade: 'Balneário Rincão',
  uf: 'SC',
  bairro: 'Centro',
  endereco: 'Av. dos Esportes, 143, esquina com Rua Urupema',
  status: 'em_construcao',

  inicioObra: 'Novembro de 2023',
  previsaoEntrega: '30 de novembro de 2026',
  registroIncorporacao: 'R.2/58.946 — Ofício de Registro de Imóveis da Comarca de Içara/SC',

  pavimentos: 14,
  totalUnidades: 35,
  unidadesPorAndar: 3,

  eyebrow: 'Eraldo Construções · Centro · Balneário Rincão/SC',
  heroTitulo: 'O alto padrão a poucos passos do mar.',
  heroSubtitulo: 'Horizon — único em cada detalhe, uma verdadeira experiência de alto padrão à beira-mar.',
  heroImg: `${SITE}/2024/11/74b4f4d0cb0b9b53b4f972c124a11506-scaled.jpeg`,
  heroImgAlt: 'Horizon — sacada com vista para o mar, Balneário Rincão SC',

  conceitoTitulo: ['Requinte e imponência,', 'a poucos passos do mar.'],
  conceitoTextoDestaque: 'Único em cada detalhe, o Horizon é um empreendimento que respira requinte e imponência, proporcionando uma verdadeira experiência de alto padrão aos seus moradores.',
  conceitoTexto: '14 pavimentos no Centro de Balneário Rincão, com 35 apartamentos (3 por andar) e 2 unidades garden — todas com aproximadamente 125 m² privativos, 3 suítes e 2 vagas de garagem.',
  conceitoChips: [
    { ico: '🏗', label: 'Em construção' },
    { ico: '🏢', label: '14 pavimentos' },
    { ico: '🏠', label: '35 unidades' },
    { ico: '📅', label: 'Entrega 30/nov/2026' },
  ],
  conceitoImg: `${SITE}/2024/11/eb83e49bdb3e66336f812b4a60ac1ca5-scaled.jpeg`,
  conceitoImgAlt: 'Horizon — fachada do empreendimento',
  conceitoStatusLabel: 'Em construção · Entrega 30/nov/2026',

  metricas: [
    { val: '14', label: 'Pavimentos' },
    { val: '35', label: 'Apartamentos' },
    { val: '3', label: 'Aptos por andar' },
    { val: '2', label: 'Unidades garden' },
  ],
  metricasExtras: [
    { n: '3', label: 'Suítes por apartamento' },
    { n: '2', label: 'Vagas de garagem' },
  ],

  diferenciaisGrupos: [
    {
      titulo: 'Segurança & Acesso',
      itens: [
        { ico: '🪪', title: 'Acesso facial e QR Code', desc: 'Reconhecimento facial e QR Code no controle de acesso.' },
        { ico: '📹', title: 'Monitoramento eletrônico', desc: 'Áreas comuns com vigilância contínua.' },
        { ico: '🚗', title: 'Garage Hall', desc: 'Recepção coberta para embarque e desembarque com conforto.' },
        { ico: '🔐', title: 'Fechadura digital', desc: 'Porta de entrada dos apartamentos.' },
      ],
    },
    {
      titulo: 'Conforto & Tecnologia',
      itens: [
        { ico: '🪟', title: 'Persianas automatizadas', desc: 'Esquadrias automatizadas nos quartos.' },
        { ico: '🌐', title: 'Cabeamento de internet', desc: 'Rede estruturada em todos os quartos e no living.' },
        { ico: '❄️', title: 'Pré-instalação para ar-condicionado split', desc: 'Estrutura pronta para climatizar.' },
        { ico: '🧱', title: 'Forro de gesso com bordas negativas', desc: 'Acabamento nobre em todos os ambientes.' },
        { ico: '🔇', title: 'Contrapiso com atenuante de ruídos', desc: 'Conforto sonoro no impacto entre andares.' },
      ],
    },
    {
      titulo: 'Sustentabilidade',
      itens: [
        { ico: '💧', title: 'Reúso de água da chuva', desc: 'Aproveitamento na limpeza das áreas comuns.' },
        { ico: '🔋', title: 'Carregamento de veículos elétricos', desc: 'Tomadas de carregamento na garagem.' },
        { ico: '🚲', title: 'Bike Share', desc: 'Bicicletas compartilhadas para os moradores.' },
      ],
    },
    {
      titulo: 'Design & Acabamento',
      itens: [
        { ico: '🏺', title: 'Porcelanato 90×90', desc: 'Áreas internas revestidas em grandes formatos.' },
        { ico: '🧱', title: 'Paredes mais espessas entre apartamentos', desc: 'Mais privacidade acústica entre unidades vizinhas.' },
        { ico: '🚿', title: 'Nicho e espera para ducha higiênica', desc: 'Espaço extra de praticidade no banho.' },
        { ico: '🗄', title: 'Depósito individual', desc: 'Espaço extra de armazenamento por apartamento.' },
        { ico: '📦', title: 'Espaço delivery', desc: 'Recebimento de encomendas sem transtorno.' },
        { ico: '🧊', title: 'Máquina de gelo', desc: 'Disponível nas áreas comuns.' },
        { ico: '🍖', title: 'Churrasqueira a carvão com exaustor', desc: 'Sistema de vedação dumper, sem fumaça dentro de casa.' },
      ],
    },
  ],
  fichaTecnicaExtra: [],

  galeriaTitulo: 'Perspectivas do Horizon',
  galeriaTexto: 'Imagens ilustrativas do projeto — o empreendimento está em construção.',
  galeria: [
    { src: `${SITE}/2024/11/4-1-scaled.jpg`, alt: 'Horizon — piscina com trocador de calor', label: 'Piscina' },
    { src: `${SITE}/2024/11/047c962d0e4390580e3015073ff89bf9-2048x1152.jpeg`, alt: 'Horizon — living com vista para o mar', label: 'Living' },
    { src: `${SITE}/2024/11/Background-3-1.png`, alt: 'Horizon — playground', label: 'Playground' },
    { src: `${SITE}/2024/11/Academia-Imagem-06-ALTA.png`, alt: 'Horizon — academia', label: 'Academia' },
    { src: `${SITE}/2024/11/Salao-de-Festas-Imagem-04.png`, alt: 'Horizon — salão de festas', label: 'Salão de festas' },
    { src: `${SITE}/2024/11/b3e1e00ae4f04f04b426b491e92023d2-scaled.jpeg`, alt: 'Horizon — acesso à praia', label: 'Beach access' },
  ],

  tipologias: [
    { nome: 'Apartamento — posição 1', areaPrivativa: 125.45, dormitorios: 3, suites: 3, vagas: 2 },
    { nome: 'Apartamento — posição 2', areaPrivativa: 121.20, dormitorios: 3, suites: 3, vagas: 2 },
    { nome: 'Apartamento — posição 3', areaPrivativa: 122.35, dormitorios: 3, suites: 3, vagas: 2 },
    { nome: 'Garden 203', areaPrivativa: 195.31, dormitorios: 3, suites: 3, observacao: 'Inclui garden privativo de 85,75 m².' },
    { nome: 'Garden 302', dormitorios: 3, suites: 3, observacao: 'Inclui garden privativo. Área total não confirmada com segurança na fonte disponível.' },
  ],
  plantasTitulo: 'Escolha o seu layout',
  plantasTexto: 'Apartamentos e unidades garden — plantas por posição no andar.',
  plantas: [
    { categoria: 'tipo', src: `${SITE}/2024/11/1-Planta-Horizon-Apto-1-1.jpg`, alt: 'Horizon — planta apartamento posição 1', label: 'Apartamento 1', area: 125.45, quartos: 3, suites: 3 },
    { categoria: 'tipo', src: `${SITE}/2024/11/2-Planta-Horizon-Apto-2-2.jpg`, alt: 'Horizon — planta apartamento posição 2', label: 'Apartamento 2', area: 121.20, quartos: 3, suites: 3 },
    { categoria: 'tipo', src: `${SITE}/2024/11/3-Planta-Horizon-Apto-3-2.jpg`, alt: 'Horizon — planta apartamento posição 3', label: 'Apartamento 3', area: 122.35, quartos: 3, suites: 3 },
    { categoria: 'garden', src: `${SITE}/2024/11/4-Planta-Horizon-Apto-4-1.jpg`, alt: 'Horizon — planta garden 203', label: 'Garden 203', area: 195.31, quartos: 3, suites: 3 },
    { categoria: 'garden', src: `${SITE}/2024/11/5-Planta-Horizon-Apto-5-1.jpg`, alt: 'Horizon — planta garden 302', label: 'Garden 302', quartos: 3, suites: 3 },
    { categoria: 'comum', src: `${SITE}/2024/11/6-Planta-Horizon-G1-1.jpg`, alt: 'Horizon — planta da garagem G1', label: 'Garagem G1' },
    { categoria: 'comum', src: `${SITE}/2024/11/7-Planta-Horizon-G2-1.jpg`, alt: 'Horizon — planta da garagem G2', label: 'Garagem G2' },
    { categoria: 'comum', src: `${SITE}/2024/11/8-Planta-Horizon-Lazer-1.jpg`, alt: 'Horizon — planta da área de lazer', label: 'Área de lazer' },
  ],
  plantasGrupos: [
    { titulo: 'Apartamentos', categoria: 'tipo' },
    { titulo: 'Gardens', categoria: 'garden' },
    { titulo: 'Áreas comuns e garagem', categoria: 'comum' },
  ],

  lazerTitulo: 'Lazer completo, a poucos passos do mar',
  lazerTexto: 'Piscina com trocador de calor, academia, playground, deck externo e acesso à praia.',
  lazerImg: `${SITE}/2024/11/4-1-scaled.jpg`,
  lazerImgAlt: 'Horizon — piscina com trocador de calor',
  lazer: ['Piscina com trocador de calor', 'Academia', 'Playground', 'Espaço delivery', 'Deck externo', 'Salão de festas', 'Beach access', 'Bike share'],

  localizacaoTitulo: 'Centro, Balneário Rincão',
  localizacaoTexto: 'Av. dos Esportes, 143 — no Centro de Balneário Rincão, a poucos passos do mar.',
  mapsQuery: 'Av. dos Esportes, 143, Centro, Balneário Rincão - SC',

  politicaComercial: {
    condicoes: [
      { titulo: 'Estrutura de pagamento', texto: '20% de entrada, 15% mais 5% em reforços até as chaves e 60% em parcelas mensais, via financiamento bancário ou parcelas corrigidas por IGPM + 0,75% ao mês.' },
      { titulo: 'Desconto à vista', texto: '10% de desconto para pagamento à vista.' },
    ],
    correcaoCub: false,
  },

  ctaFinalTitulo: 'Garanta o seu Horizon.',
  ctaFinalTexto: 'O Horizon está em construção no Centro de Balneário Rincão, com entrega prevista para 30 de novembro de 2026. Fale com Stiven para conhecer plantas, valores e condições de pagamento.',

  faq: [
    { pergunta: 'Como funciona o pagamento do Horizon?', resposta: '20% de entrada, 15% mais 5% em reforços até as chaves e 60% em parcelas mensais (financiamento bancário ou parcelas corrigidas por IGPM), com 10% de desconto para pagamento à vista. Fale com Stiven para a tabela atualizada.' },
    { pergunta: 'Qual a previsão de entrega do Horizon?', resposta: 'Entrega prevista para 30 de novembro de 2026, no Centro de Balneário Rincão/SC. Obra iniciada em novembro de 2023.' },
    { pergunta: 'O Horizon já iniciou as obras?', resposta: 'Sim, a obra está em fase final, com entrega prevista para 30 de novembro de 2026. Fale com Stiven para saber a etapa atual.' },
    { pergunta: 'Quantos pavimentos e apartamentos tem o Horizon?', resposta: '14 pavimentos, com 35 apartamentos (3 por andar) e mais 2 unidades garden — todas com aproximadamente 125 m² privativos, 3 suítes e 2 vagas de garagem.' },
    { pergunta: 'Quem é a construtora do Horizon?', resposta: 'Eraldo Construções, com atuação em Tubarão, Criciúma, Laguna, Imbituba e Balneário Rincão. Stiven Allan atende como corretor parceiro para este e outros lançamentos da Eraldo.' },
  ],

  fontes: {
    siteUrl: 'https://www.eraldoconstrucoes.com.br/empreendimentos/horizon/',
    catalogoArquivo: 'HORIZON (Drive — MATERIAL DE VENDAS/CATÁLOGOS)',
    tabelaArquivo: 'TABELA HORIZON 01-07-26.pdf',
    tabelaVigencia: '2026-07-01',
  },
}
