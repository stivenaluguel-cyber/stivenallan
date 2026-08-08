-- Enriquecimento sob demanda via cnpja.com (nome → CNPJ + sócios) — só
-- roda quando o corretor clica num lead específico, nunca em lote pra
-- campanha inteira (a API é paga por crédito; ver comentário em
-- src/lib/prospeccao/cnpja.ts). Colunas ficam null até o corretor pedir.
--
-- Sem sócio_cpf de propósito: CPF de sócio nunca vem completo em nenhuma
-- fonte legítima (Receita Federal mascara por LGPD, mesmo em APIs pagas) —
-- gravar o texto mascarado (`***123456**`) não tem valor pro corretor, e
-- criar uma coluna sugere que existe um dado ali que na prática não existe.
alter table public.prospeccao_leads
  add column cnpj text,
  add column razao_social text,
  add column situacao_cnpj text,
  add column socios jsonb;

comment on column public.prospeccao_leads.socios is
  'Array de {nome, cargo} vindo do cnpja.com. Nunca inclui CPF — a Receita Federal mascara em qualquer fonte legítima.';
