import type { Empreendimento } from './types'

// Fontes: site oficial (eraldoconstrucoes.com.br/empreendimentos/arbor) + Drive
// público "MATERIAL DE VENDAS" (TABELA ARBOR 06-07-26.pdf). URLs de imagem
// confirmadas publicamente acessíveis (200, sem sessão) antes de usar aqui.
const SITE = 'https://www.eraldoconstrucoes.com.br/wp-content/uploads'

export const arbor: Empreendimento = {
  slug: 'arbor-centro-criciuma-sc',
  nome: 'Árbor',
  construtoraSlug: 'eraldo',
  cidade: 'Criciúma',
  uf: 'SC',
  bairro: 'Centro',
  endereco: 'Rua Barão do Rio Branco, 453',
  status: 'em_construcao',

  inicioObra: 'Abril de 2025',
  previsaoEntrega: 'Outubro de 2028',
  registroIncorporacao: 'R.3/153.408 — 1º Ofício de Registro de Imóveis de Criciúma',

  pavimentos: 25,
  totalUnidades: 40,
  unidadesPorAndar: 2,

  eyebrow: 'Eraldo Construções · Centro · Criciúma/SC',
  heroTitulo: 'Onde a cidade cria raízes.',
  heroSubtitulo: 'Árbor — 25 pavimentos na Barão do Rio Branco, um refúgio no centro para você criar raízes, plantar felicidades e florescer todos os dias.',
  heroImg: `${SITE}/2024/12/Fachada-Noturna-scaled.jpg`,
  heroImgAlt: 'Árbor — fachada noturna, Centro de Criciúma SC',

  conceitoTitulo: ['Raízes no centro,', 'copa até o horizonte.'],
  conceitoTextoDestaque: 'O Árbor nasce como um refúgio dentro da cidade — um verdadeiro lar com vida, pensado para você criar raízes, plantar felicidades e colecionar momentos.',
  conceitoTexto: '25 pavimentos na Rua Barão do Rio Branco, no Centro de Criciúma, com apartamentos de 3 suítes e coberturas duplex — apenas 2 unidades por andar, 3 elevadores e 12 espaços de lazer completos.',
  conceitoChips: [
    { ico: '🏗', label: 'Em construção' },
    { ico: '🏢', label: '25 pavimentos' },
    { ico: '🏠', label: '40 unidades' },
    { ico: '📅', label: 'Entrega out/2028' },
  ],
  conceitoImg: `${SITE}/2024/12/Eraldo_Arbor-Concept-Home_EF_21-Terraco-Cobertura-Cam-01-scaled.jpg`,
  conceitoImgAlt: 'Árbor — terraço da cobertura',
  conceitoStatusLabel: 'Em construção · Entrega out/2028',

  metricas: [
    { val: '25', label: 'Pavimentos' },
    { val: '40', label: 'Unidades' },
    { val: '3', label: 'Suítes por apto' },
    { val: '10/2028', label: 'Entrega prevista' },
  ],
  metricasExtras: [
    { n: '2', label: 'Apartamentos por andar' },
    { n: '3', label: 'Elevadores' },
    { n: '12', label: 'Espaços de lazer' },
  ],

  diferenciaisGrupos: [
    {
      titulo: 'Segurança & Acesso',
      itens: [
        { ico: '🪪', title: 'Acesso facial e QR Code', desc: 'Reconhecimento facial e QR Code no controle de acesso.' },
        { ico: '📹', title: 'Monitoramento eletrônico', desc: 'Áreas comuns com vigilância contínua.' },
        { ico: '🛗', title: '3 elevadores', desc: 'Circulação ágil em um prédio de 25 pavimentos.' },
        { ico: '🚗', title: 'Garage hall', desc: 'Recepção coberta para embarque e desembarque com conforto.' },
        { ico: '🔐', title: 'Fechadura digital com biometria', desc: 'Segurança e praticidade na porta do apartamento.' },
      ],
    },
    {
      titulo: 'Conforto & Tecnologia',
      itens: [
        { ico: '🪟', title: 'Esquadrias PVC automatizadas', desc: 'Controle de luz e ventilação direto na esquadria.' },
        { ico: '♨️', title: 'Coifa com exaustão externa', desc: 'Cozinha sem odores acumulados.' },
        { ico: '📲', title: 'Pré-instalação para automação, ar e aspiração central', desc: 'Estrutura pronta para os upgrades que você quiser.' },
        { ico: '🔇', title: 'Contrapiso com atenuante acústico', desc: 'Conforto sonoro no impacto entre andares.' },
        { ico: '🌐', title: 'Cabeamento de internet', desc: 'Rede estruturada nos ambientes do apartamento.' },
        { ico: '🔌', title: 'Tomadas com USB-C', desc: 'Carregamento direto, sem adaptadores.' },
      ],
    },
    {
      titulo: 'Sustentabilidade',
      itens: [
        { ico: '☀️', title: 'Energia fotovoltaica', desc: 'Geração própria de energia solar nas áreas comuns.' },
        { ico: '💧', title: 'Reúso de água da chuva', desc: 'Aproveitamento na limpeza das áreas comuns.' },
        { ico: '🔋', title: 'Gerador de energia', desc: 'Continuidade das áreas comuns em caso de queda de energia.' },
      ],
    },
    {
      titulo: 'Design & Acabamento',
      itens: [
        { ico: '🚪', title: 'Porta pivotante', desc: 'Entrada do apartamento com acabamento diferenciado.' },
        { ico: '🍖', title: 'Churrasqueira a carvão com exaustor', desc: 'Sabor de verdade, sem fumaça dentro de casa.' },
        { ico: '🏺', title: 'Porcelanato 1×1 nas áreas internas', desc: 'Acabamento em grandes formatos.' },
        { ico: '🧶', title: 'Piso vinílico nas áreas íntimas', desc: 'Conforto térmico e acústico nos quartos.' },
        { ico: '🧱', title: 'Paredes mais espessas entre apartamentos', desc: 'Mais privacidade acústica entre unidades vizinhas.' },
        { ico: '🏛', title: 'Fachada 100% pastilhada', desc: 'Acabamento nobre e durável em toda a fachada.' },
        { ico: '🏊', title: 'Piscina com trocador de calor', desc: 'Pré-instalação pronta para climatização futura.' },
        { ico: '📦', title: 'Espaço delivery', desc: 'Recebimento de encomendas sem transtorno.' },
        { ico: '🔋', title: 'Carregamento para carros elétricos', desc: 'Ponto de recarga disponível nas vagas de garagem.' },
      ],
    },
  ],
  fichaTecnicaExtra: [],

  galeriaTitulo: 'Como o Árbor vai nascer',
  galeriaTexto: 'Imagens ilustrativas do projeto — o empreendimento está em fase de construção.',
  galeria: [
    { src: `${SITE}/2024/12/Eraldo_Arbor-Concept-Home_EF_21-Terraco-Cobertura-Cam-01-scaled.jpg`, alt: 'Árbor — terraço da cobertura', label: 'Terraço cobertura' },
    { src: `${SITE}/2024/12/Eraldo_Arbor-Concept-Home_EF_15-Pet-Place-Cam-02-scaled.jpg`, alt: 'Árbor — pet place', label: 'Pet place' },
    { src: `${SITE}/2024/12/Eraldo_Arbor-Concept-Home_EF_08-Sport-Lounge-Cam-02-scaled.jpg`, alt: 'Árbor — sport lounge', label: 'Sport lounge' },
    { src: `${SITE}/2024/12/Eraldo_Arbor-Concept-Home_EF_12-Piscina-scaled.jpg`, alt: 'Árbor — piscina', label: 'Piscina' },
    { src: `${SITE}/2024/12/Eraldo_Arbor-Concept-Home_EF_05-Gourmet-A-Cam-02-scaled.jpg`, alt: 'Árbor — espaço gourmet', label: 'Espaço gourmet' },
    { src: `${SITE}/2024/12/Eraldo_Arbor-Concept-Home_EF_09-Coworking-Cam-01-scaled.jpg`, alt: 'Árbor — coworking', label: 'Coworking' },
    { src: `${SITE}/2024/12/Eraldo_Arbor-Concept-Home_EF_10-Playroom-Cam-03-scaled.jpg`, alt: 'Árbor — playroom', label: 'Playroom' },
  ],

  tipologias: [
    { nome: 'Apartamento padrão', areaPrivativa: 192.95, suites: 3 },
    { nome: 'Cobertura duplex', areaPrivativa: 373.16 },
  ],
  plantasTitulo: 'Escolha o seu layout',
  plantasTexto: 'Apartamento padrão de 3 suítes e coberturas duplex — cada uma com 2 pavimentos internos.',
  plantas: [
    { categoria: 'tipo', src: `${SITE}/2024/11/Planta-Arbor-Apartamentos-1.jpg`, alt: 'Árbor — planta apartamento padrão, folha 1', label: 'Apartamento padrão · 1', area: 192.95, suites: 3 },
    { categoria: 'tipo', src: `${SITE}/2024/11/Planta-Arbor-Apartamentos-2.jpg`, alt: 'Árbor — planta apartamento padrão, folha 2', label: 'Apartamento padrão · 2', area: 192.95, suites: 3 },
    { categoria: 'duplex', src: `${SITE}/2024/11/Planta-Arbor-Coberturas-Inferior-1.jpg`, alt: 'Árbor — planta cobertura duplex 1, pavimento inferior', label: 'Cobertura 1 · Inferior', area: 373.16 },
    { categoria: 'duplex', src: `${SITE}/2024/11/Planta-Arbor-Coberturas-Superior-1.jpg`, alt: 'Árbor — planta cobertura duplex 1, pavimento superior', label: 'Cobertura 1 · Superior', area: 373.16 },
    { categoria: 'duplex', src: `${SITE}/2024/11/Planta-Arbor-Coberturas-Inferior-2.jpg`, alt: 'Árbor — planta cobertura duplex 2, pavimento inferior', label: 'Cobertura 2 · Inferior', area: 373.16 },
    { categoria: 'duplex', src: `${SITE}/2024/11/Planta-Arbor-Coberturas-Superior-2.jpg`, alt: 'Árbor — planta cobertura duplex 2, pavimento superior', label: 'Cobertura 2 · Superior', area: 373.16 },
    { categoria: 'comum', src: `${SITE}/2024/12/Arbor-Plantas-Humanizadas_Lazer.png`, alt: 'Árbor — planta do pavimento de lazer', label: 'Área de lazer' },
    { categoria: 'comum', src: `${SITE}/2024/12/Arbor-Plantas-Humanizadas_Terreo.png`, alt: 'Árbor — planta do térreo', label: 'Térreo' },
    { categoria: 'comum', src: `${SITE}/2024/12/Arbor-Plantas-Humanizadas_Subsolo.png`, alt: 'Árbor — planta do subsolo', label: 'Subsolo' },
    { categoria: 'comum', src: `${SITE}/2024/12/Arbor-Plantas-Humanizadas_G1.png`, alt: 'Árbor — planta da garagem G1', label: 'Garagem G1' },
  ],
  plantasGrupos: [
    { titulo: 'Apartamento padrão', categoria: 'tipo' },
    { titulo: 'Coberturas duplex', categoria: 'duplex' },
    { titulo: 'Áreas comuns e garagem', categoria: 'comum' },
  ],

  lazerTitulo: 'Doze espaços para viver bem',
  lazerTexto: 'Do bike space ao wine bar — áreas pensadas para cada momento do seu dia.',
  lazerImg: `${SITE}/2024/12/Eraldo_Arbor-Concept-Home_EF_12-Piscina-scaled.jpg`,
  lazerImgAlt: 'Árbor — piscina',
  lazer: ['Bike space', 'Pet place', 'Lounge família', 'Espaço zen', 'Playground', 'Fire place', 'Piscina com prainha e deck', 'Bar na piscina', '2 espaços gourmet', 'Wellness center', 'Wine bar', 'Coworking', 'Playroom'],

  localizacaoTitulo: 'Centro de Criciúma',
  localizacaoTexto: 'Rua Barão do Rio Branco — no coração da cidade, perto de tudo.',
  mapsQuery: 'Rua Barão do Rio Branco, 453, Centro, Criciúma - SC',

  politicaComercial: {
    condicoes: [
      { titulo: 'Condição 1 (tabela)', texto: '20% de entrada, 20% em 6 reforços anuais e 60% em parcelas mensais, corrigidos pelo CUB/SINDUSCON-SC durante a obra (IGPM após o habite-se).' },
      { titulo: 'Condição 2', texto: '5% de desconto para pagamento até as chaves — 20% de entrada e saldo em 27 parcelas mensais corrigidas pelo CUB.' },
      { titulo: 'Condição 3', texto: '10% de desconto para pagamento à vista.' },
    ],
    correcaoCub: true,
    cubValor: 3121.62,
    cubReferencia: 'julho/2026',
    observacao: 'Tabela poderá sofrer alterações sem prévio aviso.',
  },

  ctaFinalTitulo: 'Garanta a sua unidade no Árbor.',
  ctaFinalTexto: 'O Árbor está em construção no Centro de Criciúma. Fale com Stiven para conhecer plantas, valores e condições de pagamento direto com a Eraldo Construções.',

  faq: [
    { pergunta: 'Como funciona o financiamento direto do Árbor?', resposta: 'Parcelamento direto com a construtora: 20% de entrada, 20% em 6 reforços anuais e 60% em parcelas mensais corrigidas pelo CUB/SC durante a obra. Há também condições com desconto para pagamento até as chaves ou à vista. Fale com Stiven para a tabela atualizada.' },
    { pergunta: 'Qual a previsão de entrega do Árbor?', resposta: 'Entrega prevista para outubro de 2028, no Centro de Criciúma/SC. Obra iniciada em abril de 2025.' },
    { pergunta: 'O Árbor já iniciou as obras?', resposta: 'Sim, a obra está em andamento. Fale com Stiven para saber a etapa atual.' },
    { pergunta: 'Quantos pavimentos e apartamentos tem o Árbor?', resposta: '25 pavimentos, com apartamentos padrão de 3 suítes (192,95 m² privativos) e coberturas duplex (373,16 m² privativos) — 2 unidades por andar.' },
    { pergunta: 'Quem é a construtora do Árbor?', resposta: 'Eraldo Construções, com atuação em Tubarão, Criciúma, Laguna, Imbituba e Balneário Rincão. Stiven Allan atende como corretor parceiro para este e outros lançamentos da Eraldo.' },
  ],

  fontes: {
    siteUrl: 'https://www.eraldoconstrucoes.com.br/empreendimentos/arbor/',
    catalogoArquivo: 'ÁRBOR.pdf (Drive — MATERIAL DE VENDAS/CATÁLOGOS)',
    tabelaArquivo: 'TABELA ARBOR 06-07-26.pdf',
    tabelaVigencia: '2026-07-06',
  },
}
