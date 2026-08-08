-- Pipeline de CAPTACAO DE IMOVEIS (proprietarios que querem vender ou alugar).
-- Deliberadamente separado de `leads` (funil de COMPRADORES): somar os dois na
-- mesma tabela destroi a leitura de metrica, porque "custo por lead" de
-- comprador e de proprietario medem negocios diferentes.
--
-- LGPD: NAO existe coluna de CPF/CNPJ aqui de proposito. Documento de
-- proprietario so aparece na fase de contrato, fora de tabela de marketing,
-- e nao ha necessidade operacional de guardar isso no pipeline de captacao.
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

  -- Origem e atribuicao (mesmo padrao de `leads`, pra medir custo por captacao)
  origem text,
  fbclid text,
  gclid text,
  utm_source text,
  utm_medium text,
  utm_campaign text,

  -- Operacao
  anotacoes text,
  ultimo_contato timestamptz,
  proximo_contato timestamptz,
  publicado_em timestamptz,
  link_anuncio text,
  -- Quando a captacao vira estoque publicado no site
  property_id uuid references public.properties(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

-- Dedupe: o mesmo proprietario nao deve virar dois cartoes por reenviar o
-- formulario. Indice parcial pra nao travar registros sem whatsapp valido.
create unique index if not exists crm_proprietarios_whatsapp_key
  on public.crm_proprietarios (whatsapp)
  where whatsapp is not null and whatsapp <> '';

create index if not exists idx_crm_proprietarios_estagio on public.crm_proprietarios (estagio);
create index if not exists idx_crm_proprietarios_proximo on public.crm_proprietarios (proximo_contato)
  where estagio not in ('concluido','perdido');

-- RLS: dado de proprietario e sensivel e NAO pode ser lido pelo anon. Ao
-- contrario de `properties` (catalogo publico), aqui so o service role entra.
alter table public.crm_proprietarios enable row level security;

drop policy if exists crm_proprietarios_service_only on public.crm_proprietarios;
create policy crm_proprietarios_service_only on public.crm_proprietarios
  for all to service_role using (true) with check (true);
