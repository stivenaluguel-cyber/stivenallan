-- ─────────────────────────────────────────────────────────────────────
-- O imóvel que o cliente dá na troca.
--
-- Permuta já existe dos dois lados do negócio, mas só um deles estava no
-- sistema: a tabela de preços diz quando uma condição NÃO aceita permuta
-- (plano_pagamento -> opcoes_pagamento -> aceitaPermuta = false, hoje em 155
-- das 576 unidades). O que faltava era o lado do cliente — quem ofereceu um
-- imóvel na troca vivia numa anotação solta, então cruzar "quem tem o quê"
-- com "onde cabe" era memória do corretor.
--
-- Dois campos e não uma tabela: o lead oferece um imóvel, não uma carteira.
-- Se um dia oferecer dois, isto vira tabela — inventar a tabela agora seria
-- pagar a complexidade antes de precisar dela.
-- ─────────────────────────────────────────────────────────────────────

alter table public.leads
  add column if not exists "permuta_descricao" text,
  add column if not exists "permuta_valor" numeric(14,2);

alter table public.leads
  add constraint leads_permuta_valor_check check (permuta_valor is null or permuta_valor >= 0);

-- Índice parcial: a tela de permutas pergunta "quem ofereceu imóvel na
-- troca?", que é um punhado de leads dentro da base inteira.
create index if not exists leads_permuta_idx
  on public.leads (permuta_valor)
  where permuta_valor is not null;

comment on column public.leads.permuta_descricao is
  'Imóvel oferecido pelo cliente na troca (texto livre: tipo, bairro, estado).';
comment on column public.leads.permuta_valor is
  'Valor estimado do imóvel dado na permuta. Estimativa do cliente até ter avaliação.';
