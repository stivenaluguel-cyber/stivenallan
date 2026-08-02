-- Pipeline de CAPTAÇÃO DE IMÓVEIS (proprietários que querem vender ou alugar).
--
-- Deliberadamente separado de `leads` (funil de COMPRADORES). Somar os dois na
-- mesma tabela destrói a leitura de métrica: "custo por lead" de comprador e de
-- proprietário medem negócios diferentes — um gera comissão de venda, o outro
-- gera estoque —, e as taxas intermediárias não são comparáveis entre si.
-- Somadas na mesma coluna viram uma média que não descreve nenhum dos dois.
--
-- LGPD: NÃO existe coluna de CPF/CNPJ aqui, de propósito. Documento de
-- proprietário aparece na fase de contrato, fora de tabela de marketing; não há
-- necessidade operacional de guardar isso no pipeline de captação, e guardar
-- sem necessidade é exatamente o que a lei manda evitar.
create table if not exists public.crm_proprietarios (
  id uuid primary key default gen_random_uuid(),

  -- Contato
  nome text not null,
  whatsapp text not null,
  email text,

  -- O que ele oferece
  intencao text not null default 'vender',
  tipo_imovel text,
  cidade text,
  bairro text,
  endereco text,
  metragem text,
  dormitorios text,
  valor_pretendido numeric(14,2),
  valor_acordado numeric(14,2),

  -- Pipeline
  estagio text not null default 'novo',
  autorizacao boolean not null default false,
  exclusividade boolean not null default false,
  motivo_perda text,

  -- Origem e atribuição (mesmo padrão de `leads`, pra medir custo por captação)
  origem text,
  fbclid text,
  gclid text,
  utm_source text,
  utm_medium text,
  utm_campaign text,

  -- Operação
  anotacoes text,
  ultimo_contato timestamptz,
  proximo_contato timestamptz,
  publicado_em timestamptz,
  link_anuncio text,
  -- Quando a captação vira estoque publicado no site
  property_id uuid references public.properties(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Vocabulário travado no banco, não só no TypeScript: o funil de compradores
-- já teve três vocabulários convivendo na mesma coluna por falta disto.
alter table public.crm_proprietarios drop constraint if exists crm_proprietarios_estagio_check;
alter table public.crm_proprietarios add constraint crm_proprietarios_estagio_check
  check (estagio in ('novo','contato_feito','pre_qualificado','avaliacao_agendada',
                     'visita_realizada','autorizacao','fotos_documentos','publicado',
                     'concluido','perdido'));

alter table public.crm_proprietarios drop constraint if exists crm_proprietarios_intencao_check;
alter table public.crm_proprietarios add constraint crm_proprietarios_intencao_check
  check (intencao in ('vender','alugar'));

alter table public.crm_proprietarios drop constraint if exists crm_proprietarios_tipo_check;
alter table public.crm_proprietarios add constraint crm_proprietarios_tipo_check
  check (tipo_imovel is null or tipo_imovel in ('apartamento','casa','terreno','comercial','outro'));

-- Dedupe: o mesmo proprietário não deve virar dois cartões por reenviar o
-- formulário do anúncio.
--
-- Índice TOTAL, não parcial, de propósito: `ON CONFLICT` não consegue inferir
-- índice que tenha cláusula WHERE, e o upsert da rota pública falhava com
-- 42P10. A cláusula seria redundante de qualquer forma — `whatsapp` é NOT NULL
-- e string vazia não passa pela validação da rota.
create unique index if not exists crm_proprietarios_whatsapp_key
  on public.crm_proprietarios (whatsapp);

create index if not exists idx_crm_proprietarios_estagio on public.crm_proprietarios (estagio);
create index if not exists idx_crm_proprietarios_proximo on public.crm_proprietarios (proximo_contato)
  where estagio not in ('concluido','perdido');

-- RLS: dado de proprietário é sensível e NÃO pode ser lido pelo anon. Ao
-- contrário de `properties` (catálogo público), aqui só o service role entra.
alter table public.crm_proprietarios enable row level security;

drop policy if exists crm_proprietarios_service_only on public.crm_proprietarios;
create policy crm_proprietarios_service_only on public.crm_proprietarios
  for all to service_role using (true) with check (true);
