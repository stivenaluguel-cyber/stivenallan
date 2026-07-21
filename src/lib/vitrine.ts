import { imoveis } from "@/data/imoveis";
import { EMPREENDIMENTOS, type Empreendimento } from "@/lib/empreendimentos";
import { createClient } from "@/lib/supabase/server";

// Item da vitrine da Home, no mesmo formato do array estatico @/data/imoveis.
export type ImovelVitrine = (typeof imoveis)[number];

// Busca o nome de exibicao de cada construtora cadastrada (tabela `construtoras`),
// indexado por slug. Isolado em try/catch proprio: se a consulta falhar, retorna um
// mapa vazio e cada chamador cai no fallback seguro (construtora_slug cru).
async function getConstrutorasPorSlug(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<Map<string, string>> {
  try {
    const { data } = await supabase.from("construtoras").select("slug, nome");
    const mapa = new Map<string, string>();
    if (Array.isArray(data)) {
      for (const c of data) {
        if (c?.slug && c?.nome) mapa.set(c.slug, c.nome);
      }
    }
    return mapa;
  } catch {
    return new Map();
  }
}

// Mapeia uma linha de properties (snake_case, superset) para o formato ImovelVitrine.
function mapDbToImovel(p: any, construtorasPorSlug: Map<string, string>): ImovelVitrine {
  return {
    id: p.id ?? p.slug,
    nome: p.nome ?? "",
    slug: p.slug,
    construtora_slug: p.construtora_slug ?? "",
    construtora: construtorasPorSlug.get(p.construtora_slug) ?? p.construtora_slug ?? "",
    bairro: p.bairro ?? "",
    cidade: p.cidade ?? "",
    uf: p.uf ?? "",
    status: p.status ?? "",
    exibir_preco: p.exibir_preco ?? false,
    preco: p.preco ?? null,
    frase: p.frase ?? "",
    img: p.cover_image_url ?? p.img ?? "",
    ativo: p.ativo !== false && p.oculto !== true,
  } as ImovelVitrine;
}

// Vitrine da Home: estaticos de @/data/imoveis + empreendimentos do banco
// (ativos/nao-ocultos) que NAO existam no estatico. Dedupe por slug, estatico vence.
export async function getVitrineImoveis(): Promise<ImovelVitrine[]> {
  const estaticos = imoveis;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("properties")
      .select("*");
    if (!Array.isArray(data)) return estaticos;
    const construtorasPorSlug = await getConstrutorasPorSlug(supabase);
    const slugsEstaticos = new Set(estaticos.map((e) => e.slug));
    const extras = data
      .filter((p) => p && p.slug && !slugsEstaticos.has(p.slug))
      .filter((p) => p.oculto !== true && p.ativo !== false)
      .map((p) => mapDbToImovel(p, construtorasPorSlug));
    return [...estaticos, ...extras];
  } catch {
    return estaticos;
  }
}

// Vitrine de /empreendimentos: EMPREENDIMENTOS estaticos + do banco (dedupe por slug, estatico vence).
export async function getVitrineEmpreendimentos(): Promise<Empreendimento[]> {
  const estaticos = EMPREENDIMENTOS;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("properties")
      .select("*");
    if (!Array.isArray(data)) return estaticos;
    const construtorasPorSlug = await getConstrutorasPorSlug(supabase);
    const slugsEstaticos = new Set(estaticos.map((e) => e.slug));
    const extras: Empreendimento[] = data
      .filter((p) => p && p.slug && !slugsEstaticos.has(p.slug))
      .filter((p) => p.oculto !== true && p.ativo !== false)
      .map((p) => ({
        slug: p.slug,
        nome: p.nome ?? "",
        construtoraSlug: p.construtora_slug ?? "",
        cidade: p.cidade ?? "",
        bairro: p.bairro ?? "",
        uf: p.uf ?? "",
        imagem: p.cover_image_url ?? "",
        oculto: p.oculto === true,
        statusObra: p.status ?? "",
        dorms: p.dormitorios ?? null,
        areaMin: undefined,
        areaMax: undefined,
        exibirPreco: p.exibir_preco ?? false,
        precoAPartirDe: p.preco ?? null,
        frase: p.frase ?? "",
        descricao: p.descricao ?? "",
        imagens: Array.isArray(p.galeria) ? p.galeria : [],
        diferenciais: Array.isArray(p.diferenciais) ? p.diferenciais : [],
        videoUrl: p.video_url ?? null,
        catalogoUrl: p.book_pdf_url ?? null,
        construtoraNome: construtorasPorSlug.get(p.construtora_slug) ?? p.construtora_slug ?? "",
      }) as Empreendimento);
    return [...estaticos, ...extras];
  } catch {
    return estaticos;
  }
}
