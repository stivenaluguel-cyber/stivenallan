import type { Empreendimento } from './types'

// Fontes: site oficial (eraldoconstrucoes.com.br/empreendimentos/gran-palazzo) + Drive
// público "MATERIAL DE VENDAS" (TABELA GRAN PALAZZO 10-07-26.pdf). URLs de imagem
// confirmadas publicamente acessíveis (200, sem sessão) antes de usar aqui.
//
// Campos deliberadamente ocultos/ausentes (sem fonte confirmada):
// - CEP: não localizado nem no site nem na tabela.
// - área privativa de Garden 201/202 e das 4 coberturas duplex: as plantas oficiais
//   não têm resolução suficiente para leitura segura do valor impresso — por isso
//   a ficha técnica dessas plantas fica sem área/quartos/suítes.
// - correção CUB: a tabela cita o CUB/SC de referência (igual em todas as 8 tabelas),
//   mas o texto das condições comerciais do Gran Palazzo não afirma que as parcelas
//   são corrigidas pelo CUB — por isso politicaComercial.correcaoCub fica false.
// - "últimas unidades": a entrega está a poucos meses (dez/2026), mas nada na tabela
//   ou no site comprova disponibilidade limitada — por instrução do usuário, a copy
//   NÃO usa esse termo, apenas o estágio real da obra.
const SITE = 'https://www.eraldoconstrucoes.com.br/wp-content/uploads'

export const granPalazzo: Empreendimento = {
  slug: 'gran-palazzo-vila-moema-tubarao-sc',
  nome: 'Gran Palazzo',
  construtoraSlug: 'eraldo',
  cidade: 'Tubarão',
  uf: 'SC',
  bairro: 'Vila Moema',
  endereco: 'Rua Doná Antonina Búrigo Corbeta, esquina com Rua Antônio Delpizzo Jr.',
  status: 'em_construcao',

  inicioObra: 'Janeiro de 2023',
  previsaoEntrega: 'Dezembro de 2026',
  registroIncorporacao: 'R.2/35.654',

  pavimentos: 21,
  totalUnidades: 66,

  eyebrow: 'Eraldo Construções · Vila Moema · Tubarão/SC',
  heroTitulo: 'A sofisticação do clássico com o mais moderno.',
  heroSubtitulo: 'Gran Palazzo — localizado no bairro mais nobre de Tubarão, a Vila Moema.',
  heroImg: `${SITE}/2024/11/image-scaled.jpeg`,
  heroImgAlt: 'Gran Palazzo — fachada, Vila Moema, Tubarão SC',

  conceitoTitulo: ['O clássico e o contemporâneo,', 'em uma só arquitetura.'],
  conceitoTextoDestaque: 'A arquitetura neoclássica com o contemporâneo reforça a sofisticação do clássico com o que há de mais moderno no mercado da construção civil.',
  conceitoTexto: '21 pavimentos na Vila Moema, com 66 apartamentos — 4 por andar, entre unidades garden e coberturas duplex.',
  conceitoChips: [
    { ico: '🏗', label: 'Em construção' },
    { ico: '🏢', label: '21 pavimentos' },
    { ico: '🏠', label: '66 unidades' },
    { ico: '📅', label: 'Entrega dez/2026' },
  ],
  conceitoImg: `${SITE}/2024/11/2bac4c3defa002f1471a338559521f57-scaled.jpeg`,
  conceitoImgAlt: 'Gran Palazzo — living integrado, apartamento decorado',
  conceitoStatusLabel: 'Em construção · Entrega dez/2026',

  metricas: [
    { val: '21', label: 'Pavimentos' },
    { val: '66', label: 'Unidades' },
    { val: '4', label: 'Aptos por andar' },
    { val: '12/2026', label: 'Entrega prevista' },
  ],
  metricasExtras: [
    { n: '2', label: 'Suítes por apartamento tipo' },
    { n: '4', label: 'Coberturas duplex' },
  ],

  diferenciaisGrupos: [
    {
      titulo: 'Segurança & Acesso',
      itens: [
        { ico: '🪪', title: 'Acesso facial e QR Code', desc: 'Controle de acesso com reconhecimento facial e QR Code.' },
        { ico: '📹', title: 'Monitoramento eletrônico', desc: 'Áreas comuns com vigilância contínua.' },
        { ico: '🚗', title: 'Garage Hall', desc: 'Recepção coberta para embarque e desembarque com conforto.' },
        { ico: '🔐', title: 'Porta pivotante com fechadura digital', desc: 'Entrada dos apartamentos com segurança e design.' },
      ],
    },
    {
      titulo: 'Conforto & Tecnologia',
      itens: [
        { ico: '🪟', title: 'Persianas automatizadas', desc: 'Esquadrias com controle por aplicativo nos quartos.' },
        { ico: '🌐', title: 'Cabeamento de internet', desc: 'Rede estruturada em todos os quartos e no living.' },
        { ico: '❄️', title: 'Pré-instalação para ar-condicionado split', desc: 'Área técnica pronta para a condensadora.' },
        { ico: '🔥', title: 'Pré-instalação para aquecedor a gás', desc: 'Água quente pronta para instalar.' },
        { ico: '🤖', title: 'Pré-instalação para automação', desc: 'Estrutura pronta para automatizar o apartamento.' },
        { ico: '🔇', title: 'Contrapiso com atenuante de ruídos', desc: 'Conforto sonoro no impacto entre andares.' },
        { ico: '🔋', title: 'Carregamento de veículos elétricos', desc: 'Tomada de carregamento disponível na garagem.' },
      ],
    },
    {
      titulo: 'Design & Acabamento',
      itens: [
        { ico: '🏛️', title: 'Fachada neoclássica', desc: 'Layout contemporâneo nos apartamentos.' },
        { ico: '🪟', title: 'Sacadas niveladas SlidinGlass', desc: '100% de vedação à água da chuva e atenuante acústico.' },
        { ico: '🗄', title: 'Depósito individual', desc: 'Espaço extra de armazenamento por apartamento.' },
        { ico: '📦', title: 'Espaço delivery e entrada de serviço', desc: 'Recebimento de encomendas sem transtorno.' },
        { ico: '🧊', title: 'Máquina de gelo', desc: 'Disponível nas áreas comuns.' },
        { ico: '🧱', title: 'Forro de gesso com bordas negativas', desc: 'Acabamento nobre em todos os ambientes.' },
        { ico: '🧱', title: 'Paredes mais espessas entre apartamentos', desc: 'Mais privacidade acústica entre unidades vizinhas.' },
        { ico: '🚿', title: 'Nicho e espera para ducha higiênica', desc: 'Espaço extra de praticidade no banho.' },
        { ico: '🔌', title: 'Tomadas USB', desc: 'Em todos os apartamentos.' },
        { ico: '🍖', title: 'Churrasqueira a carvão com exaustor', desc: 'Sistema de vedação dumper, sem fumaça dentro de casa.' },
      ],
    },
  ],
  fichaTecnicaExtra: [],

  galeriaTitulo: 'Perspectivas do Gran Palazzo',
  galeriaTexto: 'Imagens ilustrativas do projeto — o empreendimento está em construção.',
  galeria: [
    { src: `${SITE}/2024/11/Background-8.png`, alt: 'Gran Palazzo — piscina', label: 'Piscina' },
    { src: `${SITE}/2024/11/Background-1-4.png`, alt: 'Gran Palazzo — playground e espaço pet', label: 'Playground e espaço pet' },
    { src: `${SITE}/2024/11/05-Eraldo_Gran_Palazzo_T01_Beach-Tennis-1024x683.jpg`, alt: 'Gran Palazzo — quadra de beach tennis', label: 'Quadra beach tennis' },
    { src: `${SITE}/2024/11/Background-3-2.png`, alt: 'Gran Palazzo — espaço fitness', label: 'Espaço fitness' },
    { src: `${SITE}/2024/11/07_Gran-Palazzo_EF_Salao-de-Festas-scaled.jpg`, alt: 'Gran Palazzo — salão de festas', label: 'Salão de festas' },
    { src: `${SITE}/2024/11/09_Gran-Palazzo_EF_Gourmet-scaled.jpg`, alt: 'Gran Palazzo — espaço gourmet', label: 'Espaço gourmet' },
    { src: `${SITE}/2024/11/13_Gran-Palazzo_EF_Delivery_Alta-scaled.jpg`, alt: 'Gran Palazzo — espaço delivery', label: 'Espaço delivery' },
  ],

  tipologias: [
    { nome: 'Apartamento — Layout 01', areaPrivativa: 126.71, dormitorios: 3, suites: 2 },
    { nome: 'Apartamento — Layout 02', areaPrivativa: 129.43, dormitorios: 3, suites: 2 },
    { nome: 'Garden 201/202', observacao: 'Área privativa não confirmada com segurança na fonte disponível.' },
    { nome: 'Cobertura duplex (1801 a 1804)', observacao: '2 pavimentos internos, com piscina privativa. Área exata não confirmada com segurança na fonte disponível.' },
  ],
  plantasTitulo: 'Escolha o seu layout',
  plantasTexto: 'Apartamentos, unidades garden e coberturas duplex — plantas por tipo de unidade.',
  plantas: [
    { categoria: 'tipo', src: `${SITE}/2024/11/Planta-Humanizada-Tipo-01-alterada.png`, alt: 'Gran Palazzo — planta apartamento layout 01', label: 'Layout 01', area: 126.71, quartos: 3, suites: 2 },
    { categoria: 'tipo', src: `${SITE}/2024/11/Planta-Humanizada-Tipo-03-alterada.png`, alt: 'Gran Palazzo — planta apartamento layout 02', label: 'Layout 02', area: 129.43, quartos: 3, suites: 2 },
    { categoria: 'garden', src: `${SITE}/2024/11/1-Planta-Gran-P-Garden-201-1.jpg`, alt: 'Gran Palazzo — planta garden 201', label: 'Garden 201' },
    { categoria: 'garden', src: `${SITE}/2024/11/2-Planta-Gran-P-Garden-202-1.jpg`, alt: 'Gran Palazzo — planta garden 202', label: 'Garden 202' },
    { categoria: 'duplex', src: `${SITE}/2024/11/4-Planta-Gran-P-Duplex-1801-1.jpg`, alt: 'Gran Palazzo — planta cobertura duplex 1801', label: 'Duplex 1801' },
    { categoria: 'duplex', src: `${SITE}/2024/11/4-Planta-Gran-P-Duplex-1802-1.jpg`, alt: 'Gran Palazzo — planta cobertura duplex 1802', label: 'Duplex 1802' },
    { categoria: 'duplex', src: `${SITE}/2024/11/4-Planta-Gran-P-Duplex-1803-1.jpg`, alt: 'Gran Palazzo — planta cobertura duplex 1803', label: 'Duplex 1803' },
    { categoria: 'duplex', src: `${SITE}/2024/11/4-Planta-Gran-P-Duplex-1804-1.jpg`, alt: 'Gran Palazzo — planta cobertura duplex 1804', label: 'Duplex 1804' },
    { categoria: 'comum', src: `${SITE}/2024/11/5-Planta-Gran-P-Planta-Unificada-1.jpg`, alt: 'Gran Palazzo — planta unificada do pavimento tipo', label: 'Planta unificada' },
    { categoria: 'comum', src: `${SITE}/2024/11/12-Lazer.jpg`, alt: 'Gran Palazzo — planta da área de lazer', label: 'Área de lazer' },
    { categoria: 'comum', src: `${SITE}/2024/11/9-Planta-Gran-P-G-Subsolo-1.jpg`, alt: 'Gran Palazzo — planta do subsolo', label: 'Subsolo' },
    { categoria: 'comum', src: `${SITE}/2024/11/10-Planta-Gran-P-G-Terreo-1.jpg`, alt: 'Gran Palazzo — planta do térreo', label: 'Térreo' },
    { categoria: 'comum', src: `${SITE}/2024/11/11-Planta-Gran-P-G1-1.jpg`, alt: 'Gran Palazzo — planta da garagem G1', label: 'Garagem G1' },
  ],
  plantasGrupos: [
    { titulo: 'Apartamentos', categoria: 'tipo' },
    { titulo: 'Gardens', categoria: 'garden' },
    { titulo: 'Coberturas duplex', categoria: 'duplex' },
    { titulo: 'Áreas comuns e garagem', categoria: 'comum' },
  ],

  lazerTitulo: 'Lazer completo, do hall ao rooftop',
  lazerTexto: 'Hall de entrada com pé direito duplo, piscina, quadra de beach tennis e muito mais.',
  lazerImg: `${SITE}/2024/11/Background-8.png`,
  lazerImgAlt: 'Gran Palazzo — piscina',
  lazer: ['Hall de entrada com pé direito duplo', 'Salão de festas', 'Área gourmet', 'Game center', 'Espaço fitness', 'Quadra beach tennis', 'Playground', 'Espaço pet', 'Piscina', 'Espaço de convivência', 'Espaço delivery'],

  localizacaoTitulo: 'Vila Moema, Tubarão',
  localizacaoTexto: 'Rua Doná Antonina Búrigo Corbeta — no bairro mais nobre de Tubarão.',
  mapsQuery: 'Rua Doná Antonina Búrigo Corbeta, Vila Moema, Tubarão - SC',

  politicaComercial: {
    condicoes: [
      { titulo: 'Estrutura de pagamento', texto: '25% de entrada, 5% em reforços e 70% via financiamento bancário.' },
      { titulo: 'Desconto à vista', texto: '5% de desconto para pagamento à vista.' },
    ],
    correcaoCub: false,
  },

  ctaFinalTitulo: 'Garanta o seu Gran Palazzo.',
  ctaFinalTexto: 'O Gran Palazzo está em construção na Vila Moema, com entrega prevista para dezembro de 2026. Fale com Stiven para conhecer plantas, valores e condições de pagamento.',

  faq: [
    { pergunta: 'Como funciona o pagamento do Gran Palazzo?', resposta: '25% de entrada, 5% em reforços e 70% via financiamento bancário, com 5% de desconto para pagamento à vista. Fale com Stiven para a tabela atualizada.' },
    { pergunta: 'Qual a previsão de entrega do Gran Palazzo?', resposta: 'Entrega prevista para dezembro de 2026, na Vila Moema em Tubarão/SC. Obra iniciada em janeiro de 2023.' },
    { pergunta: 'O Gran Palazzo já iniciou as obras?', resposta: 'Sim, a obra está em fase final, com entrega prevista para dezembro de 2026. Fale com Stiven para saber a etapa atual.' },
    { pergunta: 'Quantos pavimentos e apartamentos tem o Gran Palazzo?', resposta: '21 pavimentos, com 66 unidades — 4 apartamentos por andar, além de unidades garden e coberturas duplex.' },
    { pergunta: 'Quem é a construtora do Gran Palazzo?', resposta: 'Eraldo Construções, com atuação em Tubarão, Criciúma, Laguna, Imbituba e Balneário Rincão. Stiven Allan atende como corretor parceiro para este e outros lançamentos da Eraldo.' },
  ],

  fontes: {
    siteUrl: 'https://www.eraldoconstrucoes.com.br/empreendimentos/gran-palazzo/',
    catalogoArquivo: 'GRAN PALAZZO (Drive — MATERIAL DE VENDAS/CATÁLOGOS)',
    tabelaArquivo: 'TABELA GRAN PALAZZO 10-07-26.pdf',
    tabelaVigencia: '2026-07-10',
  },
}
