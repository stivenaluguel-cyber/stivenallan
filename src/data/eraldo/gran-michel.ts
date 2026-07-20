import type { Empreendimento } from './types'

// Fontes: site oficial (eraldoconstrucoes.com.br/empreendimentos/gran-michel) + Drive
// público "MATERIAL DE VENDAS" (TABELA GRAN MICHEL 01-07-26.pdf). URLs de imagem
// confirmadas publicamente acessíveis (200, sem sessão) antes de usar aqui.
const SITE = 'https://www.eraldoconstrucoes.com.br/wp-content/uploads'

export const granMichel: Empreendimento = {
  slug: 'gran-michel-criciuma-sc',
  nome: 'Gran Michel',
  construtoraSlug: 'eraldo',
  cidade: 'Criciúma',
  uf: 'SC',
  bairro: 'Michel',
  endereco: 'Rua Senador Paulo Sarasate',
  status: 'em_construcao',

  inicioObra: 'Abril de 2024',
  previsaoEntrega: 'Junho de 2028',
  registroIncorporacao: 'R.3/153.799 — 1º Ofício de Registro de Imóveis da Comarca de Criciúma',

  pavimentos: 15,
  totalUnidades: 88,

  eyebrow: 'Eraldo Construções · Michel · Criciúma/SC',
  heroTitulo: 'O luxo em sua medida certa.',
  heroSubtitulo: 'Gran Michel — o seu compacto de luxo no Bairro Michel, com rooftop, piscina e área de lazer completa.',
  heroImg: `${SITE}/2024/11/Render-1-scaled.jpg`,
  heroImgAlt: 'Gran Michel — fachada, Bairro Michel, Criciúma SC',

  conceitoTitulo: ['Menos espaço perdido,', 'mais vida por m².'],
  conceitoTextoDestaque: 'O Gran Michel nasce para provar que compacto não é sinônimo de simples — é sinônimo de bem pensado, com cada metro quadrado projetado para render mais no seu dia a dia.',
  conceitoTexto: '15 pavimentos no Bairro Michel, com apartamentos de 2 e 3 quartos, unidades garden e rooftop com piscina — tudo pensado para caber no seu momento de vida.',
  conceitoChips: [
    { ico: '🏗', label: 'Em construção' },
    { ico: '🏢', label: '15 pavimentos' },
    { ico: '🏠', label: '88 unidades' },
    { ico: '📅', label: 'Entrega jun/2028' },
  ],
  conceitoImg: `${SITE}/2024/11/cb40b10655328d472b8fc3cae35f15f1-scaled.jpeg`,
  conceitoImgAlt: 'Gran Michel — vista externa do empreendimento',
  conceitoStatusLabel: 'Em construção · Entrega jun/2028',

  metricas: [
    { val: '15', label: 'Pavimentos' },
    { val: '88', label: 'Unidades' },
    { val: '4', label: 'Apartamentos garden' },
    { val: '06/2028', label: 'Entrega prevista' },
  ],
  metricasExtras: [
    { n: '2–3', label: 'Quartos por unidade' },
    { n: '1', label: 'Piscina no rooftop' },
  ],

  diferenciaisGrupos: [
    {
      titulo: 'Segurança & Acesso',
      itens: [
        { ico: '🪪', title: 'Acesso facial e QR Code', desc: 'Reconhecimento facial e QR Code no controle de acesso.' },
        { ico: '📹', title: 'Monitoramento eletrônico', desc: 'Áreas comuns com vigilância contínua.' },
        { ico: '🚗', title: 'Garage hall', desc: 'Recepção coberta para embarque e desembarque com conforto.' },
        { ico: '🔐', title: 'Fechadura digital', desc: 'Segurança e praticidade na porta do apartamento.' },
      ],
    },
    {
      titulo: 'Conforto & Tecnologia',
      itens: [
        { ico: '🔇', title: 'Contrapiso com atenuante de ruídos', desc: 'Conforto sonoro no impacto entre andares.' },
        { ico: '🌐', title: 'Cabeamento de internet', desc: 'Rede estruturada em quartos e living.' },
        { ico: '❄️', title: 'Pré-instalação para ar-condicionado Split', desc: 'Estrutura pronta para climatizar quando quiser.' },
        { ico: '🪟', title: 'Persianas automatizadas', desc: 'Controle de luz e privacidade nos quartos.' },
        { ico: '🔥', title: 'Pré-instalação para aquecedor a gás', desc: 'Água quente pronta para instalar.' },
      ],
    },
    {
      titulo: 'Sustentabilidade',
      itens: [
        { ico: '☀️', title: 'Energia fotovoltaica', desc: 'Geração própria de energia solar nas áreas comuns.' },
        { ico: '💧', title: 'Reúso de água da chuva', desc: 'Aproveitamento na limpeza das áreas comuns.' },
        { ico: '🔋', title: 'Pré-instalação para gerador de energia', desc: 'Estrutura pronta para continuidade das áreas comuns.' },
      ],
    },
    {
      titulo: 'Design & Acabamento',
      itens: [
        { ico: '🏺', title: 'Porcelanato 90×90', desc: 'Acabamento em grandes formatos nas áreas internas.' },
        { ico: '🧱', title: 'Paredes mais espessas entre apartamentos', desc: 'Mais privacidade acústica entre unidades vizinhas.' },
        { ico: '🚿', title: 'Nicho no banheiro', desc: 'Espaço extra de organização no banho.' },
        { ico: '🍖', title: 'Churrasqueira a carvão com exaustor', desc: 'Sabor de verdade, sem fumaça dentro de casa.' },
        { ico: '🗄', title: 'Depósito individual', desc: 'Espaço extra de armazenamento por apartamento.' },
        { ico: '🔋', title: 'Tomada compartilhada para carro elétrico', desc: 'Ponto de recarga disponível na garagem.' },
        { ico: '📦', title: 'Espaço delivery', desc: 'Recebimento de encomendas sem transtorno.' },
        { ico: '🏊', title: 'Piscina pastilhada e iluminada', desc: 'Acabamento nobre no rooftop.' },
      ],
    },
  ],
  fichaTecnicaExtra: [],

  galeriaTitulo: 'Como o Gran Michel vai nascer',
  galeriaTexto: 'Imagens ilustrativas do projeto — o empreendimento está em fase de construção.',
  galeria: [
    { src: `${SITE}/2024/11/Render-1-scaled.jpg`, alt: 'Gran Michel — fachada', label: 'Fachada' },
    { src: `${SITE}/2024/11/a8a58feacda9c547a5ff8b7688bb6189-scaled.jpeg`, alt: 'Gran Michel — vista externa', label: 'Vista externa' },
    { src: `${SITE}/2024/11/Background-9.png`, alt: 'Gran Michel — piscina no rooftop', label: 'Piscina rooftop' },
    { src: `${SITE}/2024/11/Background-3-3.png`, alt: 'Gran Michel — espaço fitness', label: 'Espaço fitness' },
    { src: `${SITE}/2024/11/Background-4-3.png`, alt: 'Gran Michel — salão de festas', label: 'Salão de festas' },
    { src: `${SITE}/2024/11/Background-1-5.png`, alt: 'Gran Michel — playground', label: 'Playground' },
    { src: `${SITE}/2024/11/Background-2-5.png`, alt: 'Gran Michel — coworking', label: 'Coworking' },
  ],

  tipologias: [
    { nome: 'Apartamento (1 vaga)', areaPrivativa: 70.71 },
    { nome: 'Apartamento (2 vagas)', areaPrivativa: 93.20 },
  ],
  plantasTitulo: 'Escolha o seu layout',
  plantasTexto: 'Apartamentos, unidades garden e rooftop — plantas por tipo de unidade.',
  plantas: [
    { categoria: 'tipo', src: `${SITE}/2024/11/1-Planta-GMI-Apto-1.jpg`, alt: 'Gran Michel — planta apartamento tipo 1', label: 'Apartamento 1' },
    { categoria: 'tipo', src: `${SITE}/2024/11/2-Planta-GMI-Apto-2.jpg`, alt: 'Gran Michel — planta apartamento tipo 2', label: 'Apartamento 2' },
    { categoria: 'tipo', src: `${SITE}/2024/11/3-Planta-GMI-Apto-3.jpg`, alt: 'Gran Michel — planta apartamento tipo 3', label: 'Apartamento 3' },
    { categoria: 'tipo', src: `${SITE}/2024/11/4-Planta-GMI-Apto-4.jpg`, alt: 'Gran Michel — planta apartamento tipo 4', label: 'Apartamento 4' },
    { categoria: 'tipo', src: `${SITE}/2024/11/6-Planta-GMI-Apto-5.jpg`, alt: 'Gran Michel — planta apartamento tipo 5', label: 'Apartamento 5' },
    { categoria: 'tipo', src: `${SITE}/2024/11/8-Planta-GMI-Apto-6.jpg`, alt: 'Gran Michel — planta apartamento tipo 6', label: 'Apartamento 6' },
    { categoria: 'tipo', src: `${SITE}/2024/11/10-Planta-GMI-Apto-7.jpg`, alt: 'Gran Michel — planta apartamento tipo 7', label: 'Apartamento 7' },
    { categoria: 'tipo', src: `${SITE}/2024/11/12-Planta-GMI-Apto-8.jpg`, alt: 'Gran Michel — planta apartamento tipo 8', label: 'Apartamento 8' },
    { categoria: 'garden', src: `${SITE}/2024/11/5-Planta-GMI-Garden-205.jpg`, alt: 'Gran Michel — planta garden 205', label: 'Garden 205' },
    { categoria: 'garden', src: `${SITE}/2024/11/7-Planta-GMI-Garden-206.jpg`, alt: 'Gran Michel — planta garden 206', label: 'Garden 206' },
    { categoria: 'garden', src: `${SITE}/2024/11/9-Planta-GMI-Garden-207.jpg`, alt: 'Gran Michel — planta garden 207', label: 'Garden 207' },
    { categoria: 'garden', src: `${SITE}/2024/11/11-Planta-GMI-Garden-208.jpg`, alt: 'Gran Michel — planta garden 208', label: 'Garden 208' },
    { categoria: 'comum', src: `${SITE}/2024/11/16-Planta-GMI-Rooftop.jpg`, alt: 'Gran Michel — planta do rooftop', label: 'Rooftop' },
    { categoria: 'comum', src: `${SITE}/2024/11/13-Planta-GMI-G-Subsolo.jpg`, alt: 'Gran Michel — planta do subsolo', label: 'Subsolo' },
    { categoria: 'comum', src: `${SITE}/2024/11/14-Planta-GMI-G-Terreo.jpg`, alt: 'Gran Michel — planta do térreo', label: 'Térreo' },
    { categoria: 'comum', src: `${SITE}/2024/11/15-Planta-GMI-G1.jpg`, alt: 'Gran Michel — planta da garagem G1', label: 'Garagem G1' },
  ],
  plantasGrupos: [
    { titulo: 'Apartamentos', categoria: 'tipo' },
    { titulo: 'Gardens', categoria: 'garden' },
    { titulo: 'Áreas comuns e garagem', categoria: 'comum' },
  ],

  lazerTitulo: 'Lazer completo, do térreo ao rooftop',
  lazerTexto: 'Bike share, coworking e uma piscina no rooftop com vista da cidade.',
  lazerImg: `${SITE}/2024/11/Background-9.png`,
  lazerImgAlt: 'Gran Michel — piscina no rooftop',
  lazer: ['Bike share', 'Piscina no rooftop', 'Coworking', 'Espaço fitness', 'Salão de festas', 'Playground', 'Pet place'],

  localizacaoTitulo: 'Bairro Michel, Criciúma',
  localizacaoTexto: 'Rua Senador Paulo Sarasate — no Bairro Michel.',
  mapsQuery: 'Rua Senador Paulo Sarasate, Michel, Criciúma - SC',

  politicaComercial: {
    condicoes: [
      { titulo: 'Condição 1 (tabela)', texto: 'Parcela A: 10% de entrada, 5% em reforços até as chaves e 15% em 22 parcelas mensais corrigidas pelo CUB. Parcela B: 70% em até 180 parcelas mensais corrigidas pelo IGPM + 0,75% ao mês, direto com a construtora ou financiamento bancário.' },
      { titulo: 'Condição 2', texto: '5% de desconto — Parcela A (70% até as chaves): 10% de entrada, 20% em reforços até as chaves e 40% em 22 parcelas mensais corrigidas pelo CUB. Parcela B: 30% em até 180 parcelas mensais (IGPM + 0,75% ao mês), direto ou financiamento bancário.' },
      { titulo: 'Condição 3', texto: '7% de desconto para pagamento até as chaves — 20% de entrada, 20% em reforços até as chaves, 60% em 22 parcelas mensais corrigidas pelo CUB.' },
      { titulo: 'Condição 4', texto: '10% de desconto para pagamento à vista.' },
    ],
    correcaoCub: true,
    cubValor: 3121.62,
    cubReferencia: 'julho/2026',
    observacao: 'Apartamentos "Diferenciados" possuem pé-direito de 4,70m. Intervalo máximo entre reforços: 12 meses.',
  },

  ctaFinalTitulo: 'Garanta o seu Gran Michel.',
  ctaFinalTexto: 'O Gran Michel está em construção no Bairro Michel. Fale com Stiven para conhecer plantas, valores e condições de pagamento direto com a Eraldo Construções.',

  faq: [
    { pergunta: 'Como funciona o financiamento direto do Gran Michel?', resposta: 'Parcelamento direto com a construtora: 10% de entrada, 5% em reforços até as chaves e 15% em 22 parcelas mensais corrigidas pelo CUB/SC, com o saldo em até 180 parcelas (IGPM + 0,75% ao mês) direto ou via financiamento bancário. Há também condições com desconto para pagamento antecipado ou à vista. Fale com Stiven para a tabela atualizada.' },
    { pergunta: 'Qual a previsão de entrega do Gran Michel?', resposta: 'Entrega prevista para junho de 2028, no Bairro Michel em Criciúma/SC. Obra iniciada em abril de 2024.' },
    { pergunta: 'O Gran Michel já iniciou as obras?', resposta: 'Sim, a obra está em andamento. Fale com Stiven para saber a etapa atual.' },
    { pergunta: 'Quantos pavimentos e apartamentos tem o Gran Michel?', resposta: '15 pavimentos, com 88 unidades — apartamentos de 2 e 3 quartos, mais 4 unidades garden e rooftop com piscina.' },
    { pergunta: 'Quem é a construtora do Gran Michel?', resposta: 'Eraldo Construções, com atuação em Tubarão, Criciúma, Laguna, Imbituba e Balneário Rincão. Stiven Allan atende como corretor parceiro para este e outros lançamentos da Eraldo.' },
  ],

  fontes: {
    siteUrl: 'https://www.eraldoconstrucoes.com.br/empreendimentos/gran-michel/',
    catalogoArquivo: 'GRAN MICHEL (Drive — MATERIAL DE VENDAS/CATÁLOGOS)',
    tabelaArquivo: 'TABELA GRAN MICHEL 01-07-26.pdf',
    tabelaVigencia: '2026-07-01',
  },
}
