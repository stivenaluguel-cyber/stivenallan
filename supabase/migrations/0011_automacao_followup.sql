-- Automação de follow-up editável sem código. As 3 tabelas abaixo substituem
-- os arrays hardcoded que hoje vivem em src/app/api/cron/followup/route.ts
-- (MENSAGENS_FOLLOWUP + intervalos) e src/app/api/cron/email-followup/route.ts
-- (ETAPAS). O seed reproduz EXATAMENTE os valores atuais — zero mudança de
-- comportamento até alguém editar pela tela /dashboard/automacoes.

-- Dias de espera até o próximo passo do WhatsApp, indexado por 'ordem'
-- (0-based, batendo com o array JS intervalos[idxIntervalo] atual).
create table automacao_whatsapp_intervalos (
  ordem int primary key,
  dias  int not null
);

insert into automacao_whatsapp_intervalos (ordem, dias) values
  (0, 1),
  (1, 3),
  (2, 7),
  (3, 14);

-- Mensagens de follow-up do WhatsApp por estágio do funil + passo. Só os 5
-- estágios que já recebem follow-up hoje (negociacao/fechado não recebem,
-- e este seed não muda isso).
create table automacao_whatsapp_mensagens (
  estagio_funil text not null,
  ordem         int not null,
  mensagem      text not null,
  primary key (estagio_funil, ordem)
);

insert into automacao_whatsapp_mensagens (estagio_funil, ordem, mensagem) values
  ('primeiro_contato', 0, 'Oi {nome}! Aqui é o Stiven 😊 Recebi seu interesse no {empreendimento}. Já separei as plantas e as condições direto com a construtora — prefere que eu envie por aqui, ou marcamos 10 minutinhos para eu te mostrar o que cabe no seu plano?'),
  ('primeiro_contato', 1, 'Oi {nome}! Uma informação importante sobre o {empreendimento}: quando a obra avança de fase, a tabela sobe. Se fizer sentido, te passo as condições de hoje, sem compromisso.'),
  ('primeiro_contato', 2, '{nome}, prometo que é minha última mensagem 😄 Se o momento não é agora, tudo bem. Quer que eu te avise quando houver novidade de obra ou condição especial no {empreendimento}? É só responder AVISA.'),
  ('qualificado', 0, 'Oi {nome}! Com base no seu perfil, tenho condicoes especiais para {empreendimento}. Podemos conversar hoje?'),
  ('qualificado', 1, 'Ola {nome}! Queria compartilhar uma novidade sobre {empreendimento} que pode te interessar muito.'),
  ('interessado', 0, '{nome}, que tal agendarmos uma visita ao {empreendimento}? Tenho horarios disponiveis essa semana.'),
  ('interessado', 1, 'Oi {nome}! Ainda pensando em {empreendimento}? Posso tirar qualquer duvida por aqui.'),
  ('proposta_enviada', 0, '{nome}, voce teve chance de analisar a proposta do {empreendimento}? Fico a disposicao para tirar qualquer duvida.'),
  ('proposta_enviada', 1, 'Oi {nome}! Queria saber se surgiu alguma duvida sobre a proposta. Posso agendar uma visita se preferir.'),
  ('visita_agendada', 0, 'Ola {nome}! Confirmando nossa visita ao {empreendimento}. Voce confirma presenca? Qualquer imprevisto me avisa.');

-- Régua de e-mail (assunto/corpo com placeholders {nome}/{empreendimento},
-- mesma convenção de substituição regex já usada no WhatsApp). O wrapper de
-- HTML (branding + rodapé de descadastro, montarHtml() em
-- src/lib/cron/email-followup-helpers.ts) continua sendo código — só o
-- fragmento interno do corpo vira dado aqui.
create table automacao_email_passos (
  ordem        int primary key,
  dias_minimos int not null,
  assunto      text not null,
  corpo_html   text not null
);

insert into automacao_email_passos (ordem, dias_minimos, assunto, corpo_html) values
  (0, 2, 'Por que ninguém te explicou o financiamento sem banco?', $$
      <p>Olá {nome},</p>
      <p>A pergunta que mais recebo é sempre a mesma: <strong>"como assim, comprar apartamento sem banco?"</strong></p>
      <p>É mais simples do que parece — e escrevi um guia completo explicando: entrada de 20%, parcelas durante a obra corrigidas pelo CUB/SC, e nenhuma análise bancária no processo.</p>
      <p><a href="https://stivenallan.com.br/guia/financiamento-direto-construtora" style="color:#1A5C3A;font-weight:700">→ Leia o guia do financiamento direto</a></p>
      <p>Se ficou qualquer dúvida sobre o {empreendimento}, <a href="https://wa.me/5548991642332" style="color:#1A5C3A">me chama no WhatsApp</a> que eu explico com os números do seu caso.</p>
    $$),
  (1, 7, 'A tabela do {empreendimento} muda com a obra', $$
      <p>Olá {nome},</p>
      <p>Um aviso honesto antes de eu parar de te escrever: <strong>a tabela do {empreendimento} é reajustada a cada fase da obra</strong>. As condições que eu te apresentaria hoje não são as mesmas do mês que vem.</p>
      <p>Se o momento não é agora, tudo bem — o link no rodapé te tira desta régua sem compromisso.</p>
      <p><a href="https://wa.me/5548991642332" style="color:#1A5C3A;font-weight:700">→ Ver os números de hoje no WhatsApp</a></p>
    $$);
