import type { Empreendimento } from './types'

// Fontes: site oficial (eraldoconstrucoes.com.br/empreendimentos/lessence-home-club) +
// Drive público "MATERIAL DE VENDAS" (TABELA L'ESSENCE 01-07-26.pdf). URLs de imagem
// confirmadas publicamente acessíveis (200, sem sessão) antes de usar aqui.
//
// Posicionamento (instrução explícita do usuário): imóvel PRONTO PARA MORAR — obra
// concluída em 26/06/2025. Nada de linguagem de lançamento/pré-lançamento/entrega
// futura; CTA principal é agendar visita/conhecer unidades disponíveis.
//
// Campos deliberadamente ocultos/ausentes (sem fonte confirmada):
// - CEP e número de registro de incorporação: não localizados nem no site nem na
//   tabela — ficam ocultos até surgir fonte oficial (registroIncorporacao omitido).
// - correção CUB: a tabela cita o CUB/SC apenas como referência histórica; como o
//   habite-se já foi concedido, a correção contratual passou a ser por IGPM — por
//   isso politicaComercial.correcaoCub fica false.
const SITE = 'https://www.eraldoconstrucoes.com.br/wp-content/uploads'

export const lessence: Empreendimento = {
  slug: 'lessence-home-club-cruzeiro-do-sul-criciuma-sc',
  nome: "L'Essence Home Club",
  construtoraSlug: 'eraldo',
  cidade: 'Criciúma',
  uf: 'SC',
  bairro: 'Cruzeiro do Sul',
  endereco: 'Rua Lauro Muller, 723 — a 350 m da Praça do Congresso',
  status: 'entregue',

  dataConclusao: '26 de junho de 2025',

  pavimentos: 16,
  totalUnidades: 67,
  unidadesPorAndar: 6,

  eyebrow: 'Eraldo Construções · Cruzeiro do Sul · Criciúma/SC',
  heroTitulo: 'Pronto para morar. Pronto para você.',
  heroSubtitulo: "L'Essence Home Club — pronto para morar no Cruzeiro do Sul, a 350 m da Praça do Congresso.",
  heroImg: `${SITE}/2024/11/Fachada-1-Lessence-scaled.jpg`,
  heroImgAlt: "L'Essence Home Club — fachada, Cruzeiro do Sul, Criciúma SC",

  conceitoTitulo: ['Sua essência,', 'em cada detalhe.'],
  conceitoTextoDestaque: 'Sinônimo de exclusividade, de algo próprio e ao mesmo tempo um sentimento que revela o que somos — cada um que olha para dentro de si encontra a sua essência em detalhes.',
  conceitoTexto: '16 pavimentos no Cruzeiro do Sul, com 67 apartamentos (6 por andar) — obra concluída, pronta para morar, com lazer completo já em funcionamento.',
  conceitoChips: [
    { ico: '🔑', label: 'Pronto para morar' },
    { ico: '🏢', label: '16 pavimentos' },
    { ico: '🏠', label: '67 unidades' },
    { ico: '✅', label: 'Concluído em 06/2025' },
  ],
  conceitoImg: `${SITE}/2024/11/LESSENCE-PISCINA-COM-PREDIO-2048x1408.jpg`,
  conceitoImgAlt: "L'Essence Home Club — piscina com vista para o prédio",
  conceitoStatusLabel: 'Pronto para morar',

  metricas: [
    { val: '16', label: 'Pavimentos' },
    { val: '67', label: 'Unidades' },
    { val: '6', label: 'Aptos por andar' },
    { val: '06/2025', label: 'Obra concluída' },
  ],
  metricasExtras: [
    { n: '80–384', label: 'M² privativos (todas as tipologias)' },
    { n: '1', label: 'Cobertura disponível' },
  ],

  diferenciaisGrupos: [
    {
      titulo: 'Segurança & Acesso',
      itens: [
        { ico: '🪪', title: 'Acesso facial e QR Code', desc: 'Controle de acesso com reconhecimento facial e QR Code.' },
        { ico: '📹', title: 'Monitoramento eletrônico', desc: 'Áreas comuns com vigilância contínua.' },
        { ico: '🚗', title: 'Garage Hall', desc: 'Recepção coberta para embarque e desembarque com conforto.' },
        { ico: '🔐', title: 'Fechadura digital', desc: 'Porta de entrada dos apartamentos.' },
      ],
    },
    {
      titulo: 'Conforto & Tecnologia',
      itens: [
        { ico: '🌐', title: 'Cabeamento de internet', desc: 'Rede estruturada em todos os quartos e no living.' },
        { ico: '❄️', title: 'Pré-instalação para ar-condicionado split', desc: 'Estrutura pronta para climatizar.' },
        { ico: '🪟', title: 'Persianas automatizadas', desc: 'Esquadrias automatizadas nos quartos.' },
        { ico: '🧱', title: 'Forro de gesso com bordas negativas', desc: 'Acabamento nobre em todos os ambientes.' },
        { ico: '🔇', title: 'Contrapiso com atenuante de ruídos', desc: 'Conforto sonoro no impacto entre andares.' },
        { ico: '🔥', title: 'Pré-instalação para aquecedor a gás', desc: 'Água quente pronta para instalar.' },
      ],
    },
    {
      titulo: 'Sustentabilidade',
      itens: [
        { ico: '🔋', title: 'Pré-disposição para carregador elétrico', desc: 'Carregamento individual de veículos elétricos.' },
        { ico: '🧊', title: 'Máquina de gelo', desc: 'Disponível nas áreas comuns.' },
      ],
    },
    {
      titulo: 'Design & Acabamento',
      itens: [
        { ico: '🏛️', title: 'Hall de entrada com pé direito triplo', desc: 'Recepção imponente na chegada.' },
        { ico: '🗄', title: 'Depósito individual', desc: 'Para todos os apartamentos.' },
        { ico: '🚿', title: 'Nicho nos banheiros', desc: 'Espaço extra de organização no banho.' },
        { ico: '🧱', title: 'Paredes mais espessas entre apartamentos', desc: 'Mais privacidade acústica entre unidades vizinhas.' },
        { ico: '🍖', title: 'Churrasqueira a carvão com exaustor', desc: 'Sistema de vedação dumper, sem fumaça dentro de casa.' },
      ],
    },
  ],
  fichaTecnicaExtra: [],

  galeriaTitulo: "Conheça o L'Essence Home Club",
  galeriaTexto: 'Imagens reais do empreendimento pronto e do lazer em funcionamento.',
  galeria: [
    { src: `${SITE}/2024/11/Fachada-2-Lessence.jpg`, alt: "L'Essence Home Club — fachada", label: 'Fachada' },
    { src: `${SITE}/2024/11/LESSENCE-PISCINA-COM-PREDIO-2048x1408.jpg`, alt: "L'Essence Home Club — piscina", label: 'Piscina' },
    { src: `${SITE}/2024/11/Background-1-6.png`, alt: "L'Essence Home Club — espaço gourmet", label: 'Espaço gourmet' },
    { src: `${SITE}/2024/11/Background-2-6.png`, alt: "L'Essence Home Club — espaço mulher", label: 'Espaço mulher' },
    { src: `${SITE}/2024/11/Background-3-4.png`, alt: "L'Essence Home Club — academia", label: 'Academia' },
    { src: `${SITE}/2024/11/Background-10.png`, alt: "L'Essence Home Club — coworking", label: 'Coworking' },
  ],

  tipologias: [
    { nome: 'Apartamento — Tipo 3/4', areaPrivativa: 80.36, dormitorios: 2, suites: 2 },
    { nome: 'Apartamento — Tipo 5/6', areaPrivativa: 98.43, dormitorios: 3, suites: 1 },
    { nome: 'Apartamento — Tipo 2', areaPrivativa: 119.47, dormitorios: 3, suites: 3 },
    { nome: 'Apartamento — Tipo 1', areaPrivativa: 120.03, dormitorios: 3, suites: 3 },
    { nome: 'Cobertura 1', areaPrivativa: 383.87, suites: 3, observacao: 'Piscina privativa e deck no terraço.' },
  ],
  plantasTitulo: 'Escolha o seu layout',
  plantasTexto: 'Seis tipologias de apartamento e uma cobertura — todas disponíveis para visita.',
  plantas: [
    { categoria: 'tipo', src: `${SITE}/2024/11/3-Planta-LEssence-Apto-Tipo-3-1.jpg`, alt: "L'Essence — planta apartamento tipo 3", label: 'Apto Tipo 3', area: 80.36, quartos: 2, suites: 2 },
    { categoria: 'tipo', src: `${SITE}/2024/11/3-Planta-LEssence-Apto-Tipo-4.jpg`, alt: "L'Essence — planta apartamento tipo 4", label: 'Apto Tipo 4', area: 80.36, quartos: 2, suites: 2 },
    { categoria: 'tipo', src: `${SITE}/2024/11/4-Planta-LEssence-Apto-Tipo-5-1.jpg`, alt: "L'Essence — planta apartamento tipo 5", label: 'Apto Tipo 5', area: 98.43, quartos: 3, suites: 1 },
    { categoria: 'tipo', src: `${SITE}/2024/11/4-Planta-LEssence-Apto-Tipo-6.jpg`, alt: "L'Essence — planta apartamento tipo 6", label: 'Apto Tipo 6', area: 98.43, quartos: 3, suites: 1 },
    { categoria: 'tipo', src: `${SITE}/2024/11/2-Planta-LEssence-Apto-Tipo-2.jpg`, alt: "L'Essence — planta apartamento tipo 2", label: 'Apto Tipo 2', area: 119.47, quartos: 3, suites: 3 },
    { categoria: 'tipo', src: `${SITE}/2024/11/2-Planta-LEssence-Apto-Tipo-1-1.jpg`, alt: "L'Essence — planta apartamento tipo 1", label: 'Apto Tipo 1', area: 120.03, quartos: 3, suites: 3 },
    { categoria: 'cobertura', src: `${SITE}/2024/11/1-Planta-LEssence-Cobertura-1-1.jpg`, alt: "L'Essence — planta da cobertura 1", label: 'Cobertura 1', area: 383.87, suites: 3 },
  ],
  plantasGrupos: [
    { titulo: 'Apartamentos', categoria: 'tipo' },
    { titulo: 'Cobertura', categoria: 'cobertura' },
  ],

  lazerTitulo: 'Lazer completo, já em funcionamento',
  lazerTexto: 'Espaço gourmet, espaço mulher, academia, coworking e muito mais — tudo pronto para usar.',
  lazerImg: `${SITE}/2024/11/LESSENCE-PISCINA-COM-PREDIO-2048x1408.jpg`,
  lazerImgAlt: "L'Essence Home Club — piscina",
  lazer: ['Espaço gourmet', 'Espaço mulher', 'Salão de festas', 'Piscina', 'Academia', 'Pet place', 'Coworking', 'Playground', 'Brinquedoteca', 'Bicicletário'],

  localizacaoTitulo: 'Cruzeiro do Sul, Criciúma',
  localizacaoTexto: 'Rua Lauro Muller, 723 — a 350 m da Praça do Congresso.',
  mapsQuery: 'Rua Lauro Muller, 723, Cruzeiro do Sul, Criciúma - SC',

  politicaComercial: {
    condicoes: [
      { titulo: 'Estrutura de pagamento', texto: '30% de entrada e 70% via financiamento bancário, ou direto com a construtora em até 120 parcelas mensais (IGPM + 0,75% ao mês).' },
      { titulo: 'Desconto à vista', texto: '10% de desconto para pagamento à vista.' },
    ],
    correcaoCub: false,
    observacao: 'Imóvel pronto: a correção contratual das parcelas diretas é por IGPM, não mais por CUB.',
  },

  ctaFinalTitulo: "Conheça o seu L'Essence Home Club.",
  ctaFinalTexto: "O L'Essence Home Club está pronto para morar no Cruzeiro do Sul. Fale com Stiven para agendar uma visita e conhecer as unidades disponíveis.",

  faq: [
    { pergunta: "O L'Essence Home Club já está pronto?", resposta: 'Sim, a obra foi concluída em 26 de junho de 2025. É um imóvel pronto para morar, com lazer completo já em funcionamento.' },
    { pergunta: "Como funciona o pagamento do L'Essence Home Club?", resposta: '30% de entrada e 70% via financiamento bancário, ou direto com a construtora em até 120 parcelas mensais corrigidas por IGPM, com 10% de desconto para pagamento à vista. Fale com Stiven para a tabela atualizada.' },
    { pergunta: "Quais tipologias o L'Essence Home Club tem disponíveis?", resposta: 'Seis tipologias de apartamento, de 80 m² a 120 m² privativos, e uma cobertura de 383,87 m² com piscina privativa. Fale com Stiven para saber quais unidades estão disponíveis.' },
    { pergunta: "Quantos pavimentos e apartamentos tem o L'Essence Home Club?", resposta: '16 pavimentos, com 67 unidades — 6 apartamentos por andar.' },
    { pergunta: "Quem é a construtora do L'Essence Home Club?", resposta: 'Eraldo Construções, com atuação em Tubarão, Criciúma, Laguna, Imbituba e Balneário Rincão. Stiven Allan atende como corretor parceiro para este e outros empreendimentos da Eraldo.' },
  ],

  fontes: {
    siteUrl: 'https://www.eraldoconstrucoes.com.br/empreendimentos/lessence-home-club/',
    catalogoArquivo: "L'ESSENCE (Drive — MATERIAL DE VENDAS/CATÁLOGOS)",
    tabelaArquivo: "TABELA L'ESSENCE 01-07-26.pdf",
    tabelaVigencia: '2026-07-01',
  },
}
