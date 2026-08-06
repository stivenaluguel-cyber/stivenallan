-- Notas fiscais da PJ, mês a mês. Motivo direto: hiato real de notas
-- fiscais encontrado em auto de infração CRECI-SC — este bloco existe pra
-- tornar o hiato visível ANTES de virar achado de novo, não só registrar
-- as notas que já têm.
--
-- Investigação de schema antes de criar (via Supabase MCP, não pelas
-- migrations locais): não existe tabela financeira que sirva pra isso.
-- `crm_comissoes`/`crm_comissao_parcelas` são sobre a comissão de cada
-- VENDA (percentual, participantes, parcelamento) — conceito diferente de
-- nota fiscal da PJ, que é por competência (mês), não por venda. `crm_anexos`
-- é documento do PROCESSO DE VENDA (RG, CPF, contrato) anexado a um lead ou
-- proposta — não tem admin_id obrigatório, não tem competência/valor/número,
-- e semanticamente é outra coisa. Tabela nova é o caminho certo.
--
-- NÃO APLICADA em produção — escreve schema novo. Aguarda autorização
-- explícita.
create table public.crm_notas_fiscais (
  "id" uuid primary key default gen_random_uuid(),
  "admin_id" uuid not null references public.admin_users(id) on delete cascade,
  -- Sempre dia 1 do mês — é uma COMPETÊNCIA (mês/ano), não uma data exata
  -- de emissão. O check abaixo impede gravar um dia diferente por engano
  -- (ex.: salvar a data de emissão real em vez do mês de referência), o
  -- que quebraria a régua (ela compara competências como "YYYY-MM-01").
  "competencia" date not null,
  "numero" text not null,
  "valor" numeric(12,2) not null,
  "storage_path" text not null,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint crm_notas_fiscais_valor_positivo check (valor > 0),
  constraint crm_notas_fiscais_competencia_dia1 check (extract(day from competencia) = 1),
  -- Único POR COMPETÊNCIA, não único a tabela inteira: a PJ pode emitir
  -- mais de uma nota no mesmo mês (comissões de vendas diferentes
  -- faturadas separadamente) — o que não pode é o MESMO número de nota
  -- repetido dentro do mesmo mês (entrada duplicada por engano).
  constraint crm_notas_fiscais_numero_unico_por_competencia unique (admin_id, competencia, numero)
);

-- A régua busca "da primeira competência até hoje" ordenado — índice cobre
-- exatamente essa consulta.
create index crm_notas_fiscais_admin_competencia_idx
  on public.crm_notas_fiscais (admin_id, competencia desc);

-- RLS ligado SEM policy — verificado por introspecção (pg_policies) que
-- este é o padrão real do projeto pra tabela de documento sensível
-- equivalente: `crm_anexos` (RLS on, zero policies) é o precedente mais
-- direto, não o `service_role_all` explícito usado em tabelas mais antigas
-- (`leads`, `crm_proprietarios`). Funciona porque o login do painel é JWT
-- próprio via `admin_users` (cookie `dashboard_token`), não Supabase Auth —
-- não existe sessão com `auth.uid()` pra uma policy checar. O acesso real
-- é 100% via service_role no backend (`requireAdmin()` + filtro por
-- `admin_id` na query), que ignora RLS por definição do Postgres/Supabase
-- independente de policy existir.
alter table public.crm_notas_fiscais enable row level security;

-- Bucket PRIVADO — nota fiscal tem CNPJ e valores, não pode ficar em bucket
-- público nem gerar URL adivinhável. Mesmo padrão do bucket `documentos`
-- (crm_anexos): sem nenhuma policy em storage.objects pra este bucket
-- (verificado: `documentos` também não tem policy nenhuma, diferente de
-- `midias`, que é público) — deny-by-default pra anon/authenticated, só
-- service_role acessa, e o frontend recebe o PDF via signed URL de curta
-- duração gerada no backend (nunca a URL pública direta).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('notas-fiscais', 'notas-fiscais', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;
