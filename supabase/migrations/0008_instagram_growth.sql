-- 0008_instagram_growth.sql
-- Traz o plano de crescimento do Instagram (@stivenallan.ofc) pro dashboard:
-- calendário de conteúdo de 30 dias com roteiros completos, e histórico semanal
-- de métricas usado pra calcular os gatilhos de decisão (G1-G9 do plano).
-- Aditivo e idempotente — pode rodar em prod sem risco.

create table if not exists public.ig_content_calendar (
  id uuid primary key default gen_random_uuid(),
  data date, -- null = roteiro de reserva, ainda sem data agendada
  tipo text not null
    check (tipo in ('reel_educativo', 'reel_imovel', 'story', 'story_campanha')),
  linha text not null
    check (linha in ('oportunidade', 'fontana')),
  titulo text not null,
  roteiro text, -- gancho/CTA resumido ou roteiro cena-a-cena completo
  status text not null default 'planejado'
    check (status in ('planejado', 'a_gravar', 'gravado', 'editado', 'publicado')),
  post_url text,
  alcance integer,
  interacoes integer,
  compartilhamentos integer,
  watch_time_seg numeric,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.ig_content_calendar is
  'Calendário editorial do Instagram: 1 linha por peça de conteúdo (reel/story). data=null é roteiro de reserva sem agendamento. Preencher alcance/interacoes/watch_time_seg ao marcar publicado — alimenta os gatilhos G3/G4/G5.';

create index if not exists ig_content_calendar_data_idx on public.ig_content_calendar (data);
create index if not exists ig_content_calendar_status_idx on public.ig_content_calendar (status);

alter table public.ig_content_calendar enable row level security;

create table if not exists public.ig_metricas_semanais (
  id uuid primary key default gen_random_uuid(),
  semana_inicio date not null unique, -- segunda-feira da semana de referência
  seguidores integer,
  novos_seguidores integer,
  novos_seguidores_locais integer,
  alcance integer,
  alcance_educativo integer,
  alcance_imovel integer,
  taxa_engajamento numeric,
  visitas_perfil integer,
  cliques_bio integer,
  leads_qualificados integer,
  gasto_ads numeric,
  custo_por_visita numeric,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.ig_metricas_semanais is
  'Snapshot semanal manual (rotina de segunda/sexta do plano de growth) — base pra comparar contra as metas 30/60/90 dias e disparar os gatilhos G2/G3/G6/G7/G9 em crm_notificacoes.';

create index if not exists ig_metricas_semanais_semana_idx on public.ig_metricas_semanais (semana_inicio desc);

alter table public.ig_metricas_semanais enable row level security;

-- Seed: só roda se a tabela estiver vazia (evita duplicar em reruns manuais).
do $$
begin
  if not exists (select 1 from public.ig_content_calendar limit 1) then

    insert into public.ig_content_calendar (data, tipo, linha, titulo, roteiro, observacoes) values

    -- SEMANA 1 (13-18/07)
    ('2026-07-13', 'reel_educativo', 'oportunidade', 'Reflexão urgência: o custo de esperar (guia CUB/SC)',
     E'CENA 1 (0-5s): "Se você tá pensando em comprar na planta e não sabe o que é CUB, para tudo e assiste isso aqui." — texto na tela: "Você sabe o que é CUB?"\nCENA 2 (5-18s): "CUB é o Custo Unitário Básico da construção, calculado todo mês pelo Sinduscon. É ele que corrige as parcelas de um contrato direto com a construtora. Não é juro de banco." — "CUB = custo real da construção / índice oficial (Sinduscon-SC)"\nCENA 3 (18-32s): "Eu já sentei com cliente que tinha pavor de \'parcela que corrige\' — porque ninguém nunca explicou a diferença entre correção e juros. Quando ele entendeu, fechou em uma semana." — "correção ≠ juros / informação muda decisão"\nCENA 4 (32-44s): "Eu escrevi um guia explicando o CUB em SC do zero: como ele é calculado, como afeta sua parcela, e o que perguntar antes de assinar." — "guia: CUB/SC e a sua parcela"\nCENA 5 (44-52s): "Quem entende o índice negocia melhor. Quem não entende, adia. Manda CUB no direct que te envio o guia." — "Digite CUB no direct"\n\nPalavra-chave direct: CUB. Guia: cub-sc-correcao-parcelas.',
     'Réplica da fórmula do reel campeão (939 alcance, 8,5s watch time). Reel 19h + stories 3 ondas.'),

    ('2026-07-14', 'story', 'oportunidade', 'Como encontro imóveis abaixo do valor em Criciúma (sequência-ímã 3 cards)',
     'Big idea + curiosidade + identificação, sem vender direto. Guia de apoio: onde-investir-sul-santa-catarina.',
     'CTA: OPORTUNIDADE no direct.'),

    ('2026-07-15', 'reel_educativo', 'fontana', 'Manifesto: Morar bem não deveria depender de um banco',
     E'CENA 1 (0-4s): "Eu já vi cliente desistir do apartamento dos sonhos por causa de uma palavra: \'reprovado\'." — "REPROVADO."\nCENA 2 (4-14s): "E o que mais me incomoda é que ele nem precisava do banco. Financiamento bancário e financiamento direto com a construtora são dois jogos completamente diferentes: prazos diferentes, correção diferente, e principalmente — quem aprova você é diferente." — "banco ≠ construtora / são DOIS JOGOS diferentes"\nCENA 3 (14-28s): "No banco, você entra na fila de um sistema: score, comitê, seguro, taxa. Direto com a construtora, a conversa é com quem construiu o prédio e quer você morando nele. Morar bem não deveria depender de um banco te dar permissão." — "Morar bem não deveria depender de um banco." (B-roll: fachada/obra Fontana)\nCENA 4 (28-40s): "Eu escrevi um guia comparando os dois, ponto por ponto, sem enrolação." — "Guia completo: direto vs bancário"\nCENA 5 (40-48s): "Cada mês que você passa \'esperando juros baixar\' é um mês pagando aluguel. Me manda SEM BANCO no direct que eu te envio o guia agora." — "Digite SEM BANCO no direct"\n\nPalavra-chave direct: SEM BANCO. Guia: financiamento-direto-vs-bancario.',
     'Reel 19h + stories.'),

    ('2026-07-16', 'story', 'fontana', 'Bastidores de obra: Lavis Residencial (Centro, Criciúma, em obras)',
     'Tour 3-4 cards + caixinha "o que quer ver da obra?".',
     'CTA: WhatsApp 48 99164-2332.'),

    ('2026-07-17', 'reel_imovel', 'fontana', 'Apresentação: Monte Leone Residencial (na planta, Centro, Criciúma)',
     E'IDEIA ÚNICA: "A hora que você ganha de volta."\nCENA 1 (0-5s): "Faz uma conta comigo: quanto tempo da tua vida você passa dentro do carro por morar longe de tudo?" — "Quanto tempo você perde no trânsito?" (você dentro do carro parado)\nCENA 2 (5-16s): "Agora imagina acordar no centro de Criciúma. Descer e resolver a vida a pé... O carro vira opção, não obrigação. Isso é uma hora de vida devolvida, todos os dias." — "1 hora de vida devolvida. Todo dia." (caminhando pelo centro)\nCENA 3 (16-30s): "É essa vida que o Monte Leone está sendo desenhado pra entregar. Ele ainda está na planta — quem chega agora escolhe a unidade, o andar, a vista. Quem chega depois, escolhe o que sobrou." — "MONTE LEONE — Centro, Criciúma / quem chega antes, escolhe"\nCENA 4 (30-42s): "Direto com a construtora, sem banco no meio do caminho. Porque morar bem não deveria depender da permissão de um gerente." — "direto com a construtora / sem banco no caminho"\nCENA 5 (42-52s): "Valores sob consulta. Manda MONTE LEONE no direct que eu te mostro o projeto completo." — "Sob consulta / Digite MONTE LEONE no direct"\n\nPalavra-chave direct: MONTE LEONE. Sem specs em lista — zero interações comprovado.',
     'Reel 12h (almoço de sexta, planeja fim de semana) + stories tour.'),

    ('2026-07-18', 'story', 'fontana', 'Prova social: Calliano Residencial e Due Fratelli Residencial (entregues, Centro)',
     '"Promessa cumprida" + quiz.',
     'CTA: destaque Prova Social. Stories 10h-12h.'),

    -- SEMANA 2 (20-25/07)
    ('2026-07-20', 'reel_educativo', 'oportunidade', 'Compra inteligente: quem compra antes paga menos (guia planta vs pronto)',
     E'CENA 1 (0-4s): "\'Vou esperar ficar pronto pra ver como ficou.\' Essa frase já custou muito dinheiro pra muita gente." — "\'vou esperar ficar pronto\'"\nCENA 2 (4-16s): "Reflexão honesta: na planta, você entra no melhor momento de preço e escolhe unidade, andar, posição solar. Pronto, você paga pela obra concluída e pela pressa dos outros." — "planta = melhor momento / pronto = paga a espera"\nCENA 3 (16-30s): "O erro não é escolher um ou outro. O erro é escolher sem saber por quê." — "o erro é escolher SEM SABER por quê"\nCENA 4 (30-42s): "No meu site tem um guia comparando planta e pronto ponto a ponto." — "guia: planta vs pronto"\nCENA 5 (42-50s): "As melhores unidades na planta saem antes do prédio existir. Digite PLANTA no direct." — "Digite PLANTA no direct"\n\nPalavra-chave direct: PLANTA. Guia: apartamento-na-planta-vs-pronto.',
     'Reel 19h + stories (enquete planta × pronto).'),

    ('2026-07-21', 'story', 'oportunidade', 'Bastidor de garimpo de imóvel abaixo do valor (card "3 sinais")',
     'Guia de apoio: comprar-apartamento-na-planta-criciuma.',
     'CTA: OPORTUNIDADE no direct.'),

    ('2026-07-22', 'reel_educativo', 'fontana', 'Como funciona o financiamento direto com a construtora',
     E'CENA 1 (0-4s): "A pergunta que eu mais recebo no direct: \'Stiven, como funciona comprar sem banco?\'" — "Comprar SEM banco: como funciona?" (selfie caminhando)\nCENA 2 (4-16s): "Funciona assim: a própria construtora parcela o imóvel pra você, durante a obra e depois dela. Sem gerente, sem comitê, sem esperar 60 dias por resposta." — "a PRÓPRIA construtora parcela / sem gerente, sem comitê"\nCENA 3 (16-30s): "Financiamento direto não é um \'plano B\' pra quem o banco recusou. É a forma mais livre de comprar um imóvel de alto padrão." — "não é plano B / é LIBERDADE"\nCENA 4 (30-42s): "No meu site tem um guia completo sobre financiamento direto com construtora." — "guia completo e gratuito"\nCENA 5 (42-50s): "Os melhores apartamentos com condição direta são os que vendem primeiro. Digite DIRETO no direct." — "Digite DIRETO no direct"\n\nPalavra-chave direct: DIRETO. Guia: financiamento-direto-construtora.',
     'Reel 19h + stories.'),

    ('2026-07-23', 'story', 'fontana', 'Bastidores: Fidenza Residencial (Cruzeiro do Sul, Criciúma, em obras)',
     'Tour de obra + enquete de acabamentos.',
     'CTA: WhatsApp 48 99164-2332.'),

    ('2026-07-24', 'reel_imovel', 'fontana', 'Apresentação: Águas de Marano Residencial (Frente Mar, Balneário Piçarras, em obras)',
     'Gancho: "Tem gente que viaja para ver o mar. E tem gente que abre a cortina." Sem roteiro cena-a-cena escrito ainda — usar estrutura do Bloco C (Monte Leone) como referência: 5 cenas, ideia única de estilo de vida, zero specs.',
     'CTA: valores sob consulta, WhatsApp 48 99164-2332. Reel 12h + stories tour.'),

    ('2026-07-25', 'story', 'fontana', 'Lifestyle litoral: Villammare Residencial e Mar Positano Residencial (Balneário Rincão)',
     '"O sábado que pode ser todo dia."',
     'CTA: destaque Empreendimentos. Stories 10h-12h.'),

    -- SEMANA 3 (27/07-01/08) — sequência-funil frente mar
    ('2026-07-27', 'reel_educativo', 'oportunidade', 'Onde o m² ainda vai valorizar (guia onde investir no sul de SC)',
     E'CENA 1 (0-5s): "A maioria dos meus seguidores não mora aqui. E é exatamente por isso que esse vídeo existe." — "Você não mora em SC? Assiste."\nCENA 2 (5-18s): "Todo mês eu recebo mensagem de São Paulo, de Campinas, do Rio Grande do Sul: \'onde vale a pena investir no sul de Santa Catarina?\'. A resposta é um mapa: Criciúma pra morar e alugar, o litoral pra valorizar, a serra pra quem pensa fora da caixa." — "Criciúma / litoral / serra: 3 teses diferentes"\nCENA 3 (18-32s): "Os grandes centros já precificaram tudo. Aqui, a região ainda está no meio do movimento. Quem olha antes da manada, escolhe. Quem olha depois, disputa." — "quem olha ANTES escolhe / quem olha depois disputa"\nCENA 4 (32-44s): "Eu organizei tudo num guia: onde investir no sul de SC, região por região." — "guia: onde investir no sul de SC"\nCENA 5 (44-54s): "Manda INVESTIR no direct que eu te envio o guia — de onde você estiver." — "Digite INVESTIR no direct"\n\nPalavra-chave direct: INVESTIR. Guia: onde-investir-sul-santa-catarina.',
     'Reel 19h + stories.'),

    ('2026-07-28', 'story', 'oportunidade', 'Cidades do guia "onde investir" em ranking + enquete "onde você investiria?"',
     'Guia de apoio: onde-investir-sul-santa-catarina.',
     'CTA: OPORTUNIDADE no direct.'),

    ('2026-07-29', 'reel_educativo', 'fontana', 'Frente mar: Rincão ou Laguna? (guia comparativo)',
     E'CENA 1 (0-5s): "Rincão ou Laguna? Essa é a briga que acontece toda semana no meu WhatsApp." — "Rincão x Laguna: qual frente mar?"\nCENA 2 (5-18s): "Rincão é o litoral em plena construção, do lado de Criciúma. Laguna, no Mar Grosso, é tradição, história e um mar que já tem nome. São duas teses diferentes." — "Rincão = construção e proximidade / Laguna = tradição e Mar Grosso"\nCENA 3 (18-32s): "Frente mar é o único produto imobiliário que não se fabrica mais. A faixa de areia é a mesma pra sempre. Isso não é discurso de vendedor — é geografia." — "frente mar não se fabrica / é GEOGRAFIA"\nCENA 4 (32-44s): "Eu comparei os dois destinos num guia: perfil de cada praia, momento de cada mercado." — "guia: Rincão ou Laguna?"\nCENA 5 (44-54s): "Digite FRENTE MAR no direct que eu te mando o guia e te digo, com sinceridade, qual das duas combina com o seu momento." — "Digite FRENTE MAR no direct"\n\nPalavra-chave direct: FRENTE MAR. Guia: apartamento-frente-mar-rincao-ou-laguna.',
     'Reel 19h + stories. Colheita da audiência aquecida qua/qui.'),

    ('2026-07-30', 'story', 'fontana', 'Rincão × Laguna (do guia) + bastidores Mar di Atrani Residencial (Balneário Rincão, em obras)',
     '4 cards comparativos.',
     'CTA: WhatsApp 48 99164-2332.'),

    ('2026-07-31', 'reel_imovel', 'fontana', 'Apresentação: Mar di Nizza Residencial (Mar Grosso, Laguna, em obras)',
     'Gancho: "Em Laguna, o Mar Grosso ganhou um novo horizonte — e ele tem varanda." Sem roteiro cena-a-cena escrito ainda — usar estrutura do Bloco C (Mar di Licata, ver roteiro de reserva) como referência, adaptando pra Mar di Nizza.',
     'CTA: valores sob consulta, WhatsApp 48 99164-2332. Reel 12h + stories tour.'),

    ('2026-08-01', 'story', 'fontana', 'Lifestyle Mar Grosso: Mar di Licata Residencial + Mar di Nizza Residencial + quiz "Rincão ou Laguna?"',
     'Ver roteiro de reserva do Mar di Licata (Bloco C2) pra aproveitar trechos.',
     'CTA: destaque Empreendimentos. Stories 10h-12h.'),

    -- SEMANA 4 (03-08/08)
    ('2026-08-03', 'reel_educativo', 'oportunidade', 'Erros de quem compra na planta (guia comprar em Criciúma)',
     E'CENA 1 (0-5s): "Eu nasci vendo Criciúma como cidade do carvão. Hoje eu vendo Criciúma como cidade de guindaste. Olha em volta." — "Criciúma mudou. Você viu?"\nCENA 2 (5-18s): "O centro tá verticalizando, bairros como Comerciário, Michel e Santa Bárbara receberam projetos que não deviam nada a capital nenhuma. Quem compra na planta aqui participa dessa transformação desde o início." — "quem compra na planta participa da transformação / quem espera, paga por ela"\nCENA 3 (18-32s): "Daqui a alguns anos, você vai olhar pros prédios prontos no centro e pensar: \'ainda bem que eu entrei\' ou \'eu vi acontecer e fiquei olhando\'. A diferença entre elas foi informação." — "\'ainda bem que entrei\' OU \'fiquei olhando\'"\nCENA 4 (32-44s): "Por isso escrevi um guia completo sobre comprar na planta em Criciúma: etapas, contrato, correção, entrega." — "guia: comprar na planta em Criciúma"\nCENA 5 (44-52s): "Manda CRICIUMA no direct que eu te envio o guia — e se quiser, já te conto o que tá nascendo no centro agora." — "Digite CRICIUMA no direct"\n\nPalavra-chave direct: CRICIUMA. Guia: comprar-apartamento-na-planta-criciuma.',
     'Reel 19h + stories.'),

    ('2026-08-04', 'story', 'oportunidade', '"Qual seu maior medo ao comprar na planta?" (3 cards "erros" + caixinha)',
     'Guia de apoio: apartamento-na-planta-vs-pronto.',
     'CTA: OPORTUNIDADE no direct.'),

    ('2026-08-05', 'reel_educativo', 'fontana', 'Educativo-bastidor: o que uma obra em dia revela (Tremezzo Residencial)',
     'Gancho: "Uma obra em dia conta a verdade que nenhum material de vendas conta." Sem roteiro cena-a-cena completo — seguir estrutura padrão de 5 cenas (gancho / desenvolvimento / reflexão / prova / CTA) usando B-roll real da obra do Tremezzo (Centro, Criciúma, em obras).',
     'CTA: "Acompanhe no destaque Bastidores de Obra". Reel 19h + stories.'),

    ('2026-08-06', 'story', 'fontana', 'Transparência: como a parcela corrige pelo CUB + caixinha de dúvidas',
     'Guia de apoio: cub-sc-correcao-parcelas.',
     'CTA: WhatsApp 48 99164-2332.'),

    ('2026-08-07', 'reel_imovel', 'fontana', 'Apresentação: Piazza Castello Residencial (pronto, Centro, Içara)',
     'Ângulo "chave na mão". Gancho: "Enquanto alguns esperam a obra ficar pronta, outros já recebem a chave em Içara." Sem roteiro cena-a-cena escrito ainda — usar estrutura do Bloco C3 (Pianezze, ver roteiro de reserva) como referência, adaptando pra Piazza Castello.',
     'CTA: valores sob consulta, WhatsApp 48 99164-2332. Reel 12h + stories tour + FAQ.'),

    ('2026-08-08', 'story', 'fontana', 'Prova social prontos: Pianezze Residencial (Içara) + Villaggio Verde Residenziale (Criciúma)',
     'Ver roteiro de reserva do Pianezze (Bloco C3) pra aproveitar trechos.',
     'CTA: destaque Prova Social. Stories 10h-12h.'),

    -- FECHAMENTO DO CICLO (10-11/08)
    ('2026-08-10', 'reel_educativo', 'oportunidade', 'Callback do dia 1: quanto o CUB andou em 30 dias',
     'Revisitar o gancho do REEL de 13/07 (CUB) atualizando com o dado real do índice do mês. Gancho: "Há 30 dias eu avisei que esperar custa caro. O índice confirmou." Guia: cub-sc-correcao-parcelas.',
     'CTA: OPORTUNIDADE no direct. Reel 19h + stories recap (enquete "qual tema repetir?").'),

    ('2026-08-11', 'story', 'oportunidade', 'Revisão do ciclo: métricas dos 13 reels',
     'Manter criativos campeões da campanha Meta e desligar perdedores (regra do curso), planejar próximo ciclo com os 2 temas de maior alcance.',
     'CTA: OPORTUNIDADE no direct. Bastidor dos números.'),

    -- BLOCO A — 5 story-ímãs da campanha Meta "visitas ao perfil" (teste R$6/dia/24h, só stories)
    ('2026-07-13', 'story_campanha', 'fontana', 'Story ímã 1: "O banco não precisa participar"',
     E'Big idea: morar bem não deveria depender de um banco. Curiosidade: existe um caminho de compra que quase ninguém conhece. Identificação: quem tem renda boa mas trava na burocracia bancária.\nFala (12s): "Eu vendo apartamento de alto padrão todos os meses pra gente que nunca pisou num banco pra comprar. Morar bem não deveria depender de um gerente aprovar a sua vida. Existe outro caminho — e ele tá no meu perfil."\nTexto na tela: 0-4s "ALTO PADRÃO SEM BANCO?" / 5-9s "Morar bem não deveria depender de um banco." / 10-12s "O caminho tá no meu perfil →"\nEnquadramento: plano médio, fundo com obra de alto padrão ou skyline do centro desfocado, golden hour.',
     'Criativo de campanha Meta "visitas ao perfil" — teste R$6/dia/24h.'),

    ('2026-07-13', 'story_campanha', 'fontana', 'Story ímã 2: "Negociar com quem constrói"',
     E'Big idea: comprar direto da construtora é negociar com quem decide. Curiosidade: o que muda sem intermediário. Identificação: quem já teve proposta travada por análise de crédito.\nFala (13s): "Sabe a diferença entre comprar com banco e comprar direto com a construtora? No banco, você negocia com um sistema. Aqui, você negocia com quem tá levantando o prédio. Isso muda tudo — e eu explico no meu perfil."\nTexto na tela: 0-4s "banco = sistema" / 5-9s "construtora = pessoas que decidem" / 10-13s "eu explico no perfil →"\nEnquadramento: caminhando dentro de uma obra Fontana, selfie estabilizada.',
     'Criativo de campanha Meta "visitas ao perfil" — teste R$6/dia/24h.'),

    ('2026-07-13', 'story_campanha', 'fontana', 'Story ímã 3: "O litoral que ainda está em construção"',
     E'Big idea: o litoral sul de SC é dos últimos onde ainda se constrói frente mar. Curiosidade: por que gente de fora do estado olha pra cá. Identificação: público de SP/Campinas que acha que "chegou tarde".\nFala (14s): "Toda semana recebo mensagem de gente de São Paulo perguntando a mesma coisa: \'ainda dá tempo de comprar frente mar?\'. Em quase todo litoral do Brasil, não. Aqui no sul de Santa Catarina, ainda. Por enquanto. Vem ver no meu perfil."\nTexto na tela: 0-5s "\'Ainda dá tempo de comprar frente mar?\'" / 6-10s "Na maioria dos litorais: NÃO." / 11-14s "No sul de SC: por enquanto. Perfil →"\nEnquadramento: na praia (Mar Grosso ou Balneário Rincão), mar ao fundo.',
     'Criativo de campanha Meta "visitas ao perfil" — teste R$6/dia/24h. Fala direto com o público de SP, maior do perfil.'),

    ('2026-07-13', 'story_campanha', 'oportunidade', 'Story ímã 4: "O imóvel que não chega no portal"',
     E'Big idea: os melhores imóveis abaixo do valor de mercado nunca aparecem nos portais. Curiosidade: onde eles aparecem primeiro. Identificação: quem passa horas no Zap/OLX e sente que só sobra o que ninguém quis.\nFala (13s): "Deixa eu te contar uma coisa que os portais não te contam: imóvel bom, abaixo do valor de mercado, não chega a ser anunciado. Ele é vendido antes. A pergunta é: pra quem? Pra quem fica sabendo primeiro. Toca no meu perfil."\nTexto na tela: 0-5s "Imóvel abaixo do mercado NÃO vai pro portal." / 6-10s "Ele é vendido ANTES." / 11-13s "Fica sabendo primeiro → perfil"\nEnquadramento: sentado à mesa, celular na mão, plano fechado.',
     'Criativo de campanha Meta "visitas ao perfil" — teste R$6/dia/24h.'),

    ('2026-07-13', 'story_campanha', 'oportunidade', 'Story ímã 5: "Sua capacidade de compra está encolhendo"',
     E'Versão story do post campeão (939 alcance, 8,5s retenção). Big idea: ou você compra hoje, ou sua capacidade de compra diminui. Identificação: quem "espera o momento certo" há dois anos.\nFala (12s): "Enquanto você espera o \'momento certo\', o imóvel corrige, o aluguel sobe e o teu dinheiro compra menos. Ou você compra hoje, ou a tua capacidade de compra diminui. Simples assim. No meu perfil eu mostro por onde começar."\nTexto na tela: 0-4s "Você não tá esperando. Tá encolhendo." / 5-9s "Ou compra hoje, ou compra menos amanhã." / 10-12s "Por onde começar → perfil"\nEnquadramento: igual ao reel campeão — plano fechado, fala direta, zero cenário elaborado, corte seco no meio da frase.',
     'Criativo de campanha Meta "visitas ao perfil" — teste R$6/dia/24h. Fórmula já validada com dados reais.'),

    -- Roteiros de reserva (Bloco C2/C3) — sem data, pra ciclos futuros ou substituição
    (null, 'reel_imovel', 'fontana', '[Reserva] Mar di Licata Residencial (Laguna, Mar Grosso — em obras)',
     E'IDEIA ÚNICA: "Viver onde os outros passam férias." Palavra-chave direct: LICATA.\nCENA 1 (0-5s, som de mar 2s antes): "Tem gente que espera o ano inteiro por dez dias disso aqui." — "10 dias por ano. É isso?"\nCENA 2 (5-16s): "Tem gente que decidiu inverter a lógica: em vez de visitar o mar, morar nele." — "em vez de visitar o mar… MORAR nele"\nCENA 3 (16-30s): "O Mar di Licata está subindo agora, no Mar Grosso, em Laguna. Obra subindo significa: dá pra entrar enquanto o prédio ainda é promessa." — "MAR DI LICATA — Mar Grosso, Laguna / em obras"\nCENA 4 (30-42s): "Direto com a construtora, sem banco decidindo se você merece o mar. Frente mar é o único imóvel que não se fabrica mais." — "frente mar não se fabrica mais"\nCENA 5 (42-54s): "Valores sob consulta. Digite LICATA no direct e eu te mando as fotos da obra dessa semana." — "Sob consulta / Digite LICATA no direct"',
     'Roteiro de reserva — usar em ciclo futuro ou como substituto de um apresentação-Sex.'),

    (null, 'reel_imovel', 'fontana', '[Reserva] Pianezze Residencial (Içara, Centro — pronto)',
     E'IDEIA ÚNICA: "A mudança que não precisa esperar." Palavra-chave direct: PIANEZZE.\nCENA 1 (0-5s): "Sabe qual é a palavra mais subestimada do mercado imobiliário? Pronto." — "PRONTO." (close numa chave)\nCENA 2 (5-16s): "Pronto significa: a vida que você quer não está a três anos de distância. Está a uma assinatura." — "sem espera / sem render / de verdade"\nCENA 3 (16-30s): "O Pianezze está pronto, no centro de Içara — a dez minutos de Criciúma e a vinte da praia. A mudança deixa de ser projeto e vira data." — "PIANEZZE — Centro, Içara / a mudança vira DATA"\nCENA 4 (30-42s): "Mesmo pronto, a compra pode ser direto com a construtora — condições conversadas com quem construiu." — "pronto + direto com a construtora"\nCENA 5 (42-52s): "Valores sob consulta. Manda PIANEZZE no direct que eu agendo a tua visita ainda essa semana." — "Sob consulta / Digite PIANEZZE no direct"',
     'Roteiro de reserva — usar em ciclo futuro ou como substituto de um apresentação-Sex.');

  end if;
end $$;

insert into public.ig_metricas_semanais (
  semana_inicio, seguidores, novos_seguidores, novos_seguidores_locais,
  taxa_engajamento, observacoes
) values (
  '2026-07-06', 5947, 26, null, 1.34,
  'Baseline pré-campanha (referência 12/07/2026, via API Instagram, janela de 90 dias): cadência 6 posts/90d, alcance total 62,3K (~20,8K/mês), alcance educativo 2,8× maior que anúncio, ~9% dos seguidores localizados estão na região de atuação (Criciúma 377 vs SP 624). Visitas ao perfil, cliques na bio e leads/mês ainda sem baseline — documentar na semana 1 da campanha.'
)
on conflict (semana_inicio) do nothing;
