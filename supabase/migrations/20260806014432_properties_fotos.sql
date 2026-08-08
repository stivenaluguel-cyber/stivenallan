-- Fotos de imóvel com upload de verdade (arquivo → Supabase Storage), o que
-- hoje não existe: `properties.galeria`/`cover_image_url` são campos de URL
-- colada à mão (a galeria real hoje aponta pro Google Drive da construtora,
-- não pro Storage). Granularidade é POR EMPREENDIMENTO (`properties`) —
-- confirmado por introspecção: `empreendimentos_unidades` (o inventário
-- real de unidades) não tem nenhuma coluna de foto.
--
-- Original e processada (com marca d'água) ficam em paths separados no
-- mesmo bucket `imoveis` (já existe, público, sem restrição de tipo/tamanho
-- — não precisa de bucket novo aqui, só o de logo em
-- 20260806014423_marca_dagua_preferencias.sql). `storage_path_processada`
-- fica NULL até o processamento rodar (upload sem logo configurada) e é
-- regravada quando o corretor troca a logo e reprocessa em lote — o
-- original nunca é sobrescrito, é sempre a fonte da regeneração.
--
-- NÃO APLICADA em produção — escreve schema novo. Aguarda autorização
-- explícita.
create table public.properties_fotos (
  "id" uuid primary key default gen_random_uuid(),
  "property_id" uuid not null references public.properties(id) on delete cascade,
  "storage_path_original" text not null,
  "storage_path_processada" text,
  "largura_original" integer,
  "altura_original" integer,
  "ordem" integer not null default 0,
  "admin_id" uuid references public.admin_users(id) on delete set null,
  "created_at" timestamptz not null default now(),
  "processado_em" timestamptz,
  constraint properties_fotos_ordem_check check (ordem >= 0)
);

create index properties_fotos_property_idx on public.properties_fotos (property_id, ordem);
-- Cursor estável pra paginação da regeneração em lote (offset/limite por id).
create index properties_fotos_id_idx on public.properties_fotos (id);

-- Mesmo padrão de crm_preferencias/crm_metas_diarias: RLS ligado sem
-- policy — acesso real é via service_role no backend (requireAdmin() +
-- filtro na query), não há Supabase Auth aqui (login é JWT próprio via
-- admin_users).
alter table public.properties_fotos enable row level security;
