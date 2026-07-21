import type { Empreendimento } from './types'

// Fontes: site oficial (eraldoconstrucoes.com.br/empreendimentos/play-residence) +
// Drive público "MATERIAL DE VENDAS" (TABELA PLAY 01-07-26.pdf). URLs de imagem
// confirmadas publicamente acessíveis (200, sem sessão) antes de usar aqui.
//
// Posicionamento (instrução explícita do usuário): imóvel PRONTO PARA MORAR — obra
// concluída em 17/03/2025. Nada de linguagem de lançamento/pré-lançamento/entrega
// futura; CTA principal é agendar visita/conhecer unidades disponíveis.
//
// Campos deliberadamente ocultos/ausentes (sem fonte confirmada):
// - CEP e número de registro de incorporação: não localizados em nenhuma das 3
//   fontes verificadas (site, MATERIAIS DE APOIO/PLAY RESIDENCE, catálogo do
//   Complexo Alliance) — ficam ocultos até surgir fonte oficial.
// - Plantas: NENHUMA imagem de planta foi localizada em nenhuma das 3 fontes.
//   Por instrução explícita do usuário, a seção de plantas fica completamente
//   OCULTA (plantas: []) — sem placeholder, sem mensagem de ausência.
// - Metragem específica dos 14 estúdios: não confirmada.
// - "Garagem adicional: R$ 65.000,00" consta na tabela, mas não é exibida como
//   copy pública (mesmo padrão das outras 7 páginas: nunca preço absoluto em
//   texto — "fale com Stiven" cobre esse detalhe na conversa).
// - correção CUB: a tabela cita o CUB/SC apenas como referência histórica (imóvel
//   pronto, sem correção de obra em andamento) — por isso correcaoCub fica false.
const SITE = 'https://www.eraldoconstrucoes.com.br/wp-content/uploads'

export const play: Empreendimento = {
  slug: 'play-residence-vila-moema-tubarao-sc',
  nome: 'Play Residence',
  construtoraSlug: 'eraldo',
  cidade: 'Tubarão',
  uf: 'SC',
  bairro: 'Vila Moema',
  endereco: 'Av. Marcolino Martins Cabral, esquina com Rua Paraguai e Rua Porto Alegre',
  status: 'entregue',

  dataConclusao: '17 de março de 2025',

  pavimentos: 17,
  totalUnidades: 42,

  eyebrow: 'Eraldo Construções · Vila Moema · Tubarão/SC',
  heroTitulo: 'Pronto para morar. Pronto para viver.',
  heroSubtitulo: 'Play Residence — residencial anexo ao Complexo Alliance, pronto para morar em Tubarão.',
  heroImg: `${SITE}/2024/12/Herobanner-Play-Residence.jpg`,
  heroImgAlt: 'Play Residence — fachada, Vila Moema, Tubarão SC',

  conceitoTitulo: ['Onde bem-estar, trabalho', 'e convivência se encontram.'],
  conceitoTextoDestaque: 'Descubra uma nova maneira de viver a vida em um lugar acolhedor, versátil e criativo — residencial anexo ao Complexo Alliance.',
  conceitoTexto: '17 pavimentos na Vila Moema, com 42 apartamentos, 14 estúdios e cobertura duplex — obra concluída, pronta para morar.',
  conceitoChips: [
    { ico: '🔑', label: 'Pronto para morar' },
    { ico: '🏢', label: '17 pavimentos' },
    { ico: '🏠', label: '42 apartamentos' },
    { ico: '✅', label: 'Concluído em 03/2025' },
  ],
  conceitoImg: `${SITE}/2024/12/DJI_0083-HDR-scaled.jpg`,
  conceitoImgAlt: 'Play Residence — vista aérea do Complexo Alliance',
  conceitoStatusLabel: 'Pronto para morar',

  metricas: [
    { val: '17', label: 'Pavimentos' },
    { val: '42', label: 'Apartamentos' },
    { val: '14', label: 'Estúdios' },
    { val: '03/2025', label: 'Obra concluída' },
  ],
  metricasExtras: [
    { n: '1', label: 'Cobertura duplex' },
    { n: '2', label: 'Elevadores' },
  ],

  diferenciaisGrupos: [
    {
      titulo: 'Segurança & Acesso',
      itens: [
        { ico: '🪪', title: 'Acesso facial e QR Code', desc: 'Reconhecimento facial e QR Code no controle de acesso.' },
        { ico: '📹', title: 'Monitoramento eletrônico', desc: 'Áreas comuns com vigilância contínua.' },
        { ico: '🛗', title: '2 elevadores', desc: 'Circulação vertical ágil para os moradores.' },
        { ico: '🔐', title: 'Fechadura digital com biometria', desc: 'Segurança na entrada dos apartamentos.' },
      ],
    },
    {
      titulo: 'Conforto & Tecnologia',
      itens: [
        { ico: '🪟', title: 'Persianas automatizadas', desc: 'Esquadrias automatizadas nos apartamentos.' },
        { ico: '❄️', title: 'Pré-instalação para ar-condicionado', desc: 'Tubulação de cobre pronta para climatizar.' },
        { ico: '🌐', title: 'Cabeamento de internet', desc: 'Rede estruturada em todos os quartos e no living.' },
        { ico: '🧱', title: 'Forro de gesso com bordas negativas', desc: 'Acabamento nobre em todos os ambientes.' },
        { ico: '🔇', title: 'Contrapiso com atenuante de ruídos', desc: 'Conforto sonoro no impacto entre andares.' },
        { ico: '🔥', title: 'Pré-instalação de água quente a gás', desc: 'Água quente pronta para instalar.' },
      ],
    },
    {
      titulo: 'Sustentabilidade',
      itens: [
        { ico: '💧', title: 'Reúso de água da chuva', desc: 'Aproveitamento na limpeza das áreas comuns.' },
      ],
    },
    {
      titulo: 'Design & Acabamento',
      itens: [
        { ico: '🚿', title: 'Nicho nos banheiros', desc: 'Espaço extra de organização no banho.' },
      ],
    },
  ],
  fichaTecnicaExtra: [],

  galeriaTitulo: 'Conheça o Play Residence',
  galeriaTexto: 'Imagens reais do empreendimento pronto, anexo ao Complexo Alliance.',
  galeria: [
    { src: `${SITE}/2024/12/Fachada-1-Play.jpg`, alt: 'Play Residence — fachada, vista aérea', label: 'Fachada' },
    { src: `${SITE}/2024/12/DJI_0027-HDR-Edit-scaled.jpg`, alt: 'Play Residence — vista aérea do complexo', label: 'Vista aérea' },
    { src: `${SITE}/2024/12/DJI_0065-HDR-Edit-scaled.jpg`, alt: 'Play Residence — vista aérea da região', label: 'Entorno' },
  ],

  tipologias: [
    { nome: 'Apartamento', areaPrivativa: 61, dormitorios: 2, observacao: 'Área aproximada, com 1 a 2 vagas conforme unidade — sem correspondência confirmada por número de apartamento específico.' },
    { nome: 'Estúdio', observacao: '14 unidades. Metragem específica não confirmada com segurança na fonte disponível.' },
    { nome: 'Cobertura duplex', observacao: 'Área não confirmada com segurança na fonte disponível.' },
  ],
  plantasTitulo: '',
  plantasTexto: '',
  plantas: [],
  plantasGrupos: [],

  lazerTitulo: 'Lazer completo, já em funcionamento',
  lazerTexto: 'Piscina, espaço fitness, coworking, playground e muito mais — tudo pronto para usar.',
  lazerImg: `${SITE}/2024/12/DJI_0083-HDR-scaled.jpg`,
  lazerImgAlt: 'Play Residence — vista aérea do Complexo Alliance',
  lazer: ['Piscina', 'Espaço fitness', 'Playground', 'Espaço gourmet', 'Lavanderia coletiva', 'Terraço', 'Coworking', 'Brinquedoteca'],

  localizacaoTitulo: 'Vila Moema, Tubarão',
  localizacaoTexto: 'Av. Marcolino Martins Cabral, esquina com Rua Paraguai — anexo ao Complexo Alliance.',
  mapsQuery: 'Av. Marcolino Martins Cabral, Vila Moema, Tubarão - SC',

  politicaComercial: {
    condicoes: [
      { titulo: 'Estrutura de pagamento', texto: '30% de entrada e 70% via financiamento bancário.' },
    ],
    correcaoCub: false,
  },

  ctaFinalTitulo: 'Conheça o seu Play Residence.',
  ctaFinalTexto: 'O Play Residence está pronto para morar na Vila Moema, anexo ao Complexo Alliance. Fale com Stiven para agendar uma visita e conhecer as unidades disponíveis.',

  faq: [
    { pergunta: 'O Play Residence já está pronto?', resposta: 'Sim, a obra foi concluída em 17 de março de 2025. É um imóvel pronto para morar, anexo ao Complexo Alliance.' },
    { pergunta: 'Como funciona o pagamento do Play Residence?', resposta: '30% de entrada e 70% via financiamento bancário. Fale com Stiven para a tabela atualizada, incluindo condições para vaga de garagem adicional.' },
    { pergunta: 'Quais tipologias o Play Residence tem?', resposta: 'Apartamentos, 14 estúdios e uma cobertura duplex. Fale com Stiven para saber quais unidades estão disponíveis e suas metragens.' },
    { pergunta: 'Quantos pavimentos e apartamentos tem o Play Residence?', resposta: '17 pavimentos, com 42 apartamentos, 14 estúdios e uma cobertura duplex.' },
    { pergunta: 'Quem é a construtora do Play Residence?', resposta: 'Eraldo Construções, com atuação em Tubarão, Criciúma, Laguna, Imbituba e Balneário Rincão. Stiven Allan atende como corretor parceiro para este e outros empreendimentos da Eraldo.' },
  ],

  fontes: {
    siteUrl: 'https://www.eraldoconstrucoes.com.br/empreendimentos/play-residence/',
    catalogoArquivo: 'COMPLEXO ALLIANCE — ETR/IBIS/PLAY RESIDENCE (Drive — MATERIAL DE VENDAS/CATÁLOGOS)',
    tabelaArquivo: 'TABELA PLAY 01-07-26.pdf',
    tabelaVigencia: '2026-07-01',
    materiaisApoioPasta: 'MATERIAIS DE APOIO/PLAY RESIDENCE',
  },
}
