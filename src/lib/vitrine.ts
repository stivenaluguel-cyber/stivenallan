import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { imoveis } from "@/data/imoveis";
import { EMPREENDIMENTOS, type Empreendimento, type StatusObra } from "@/lib/empreendimentos";
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

export type DadosVivos = { status?: StatusObra; exibirPreco: boolean; preco: number | null };

/**
 * Status e preço mínimo AO VIVO, indexados por slug — o que impede as
 * vitrines de precisarem de edição manual toda vez que algo muda.
 *
 * `status` vem de `properties` (cadastro editável em /dashboard/admin,
 * publicado imediatamente). `preco` vem do MENOR `valor_tabela` disponível em
 * `empreendimentos_unidades` — a mesma tabela que os scripts de importação
 * mensal (Fontana e Eraldo) atualizam a cada tabela nova que a construtora
 * manda. Achado real: `imoveis.ts` tinha status desatualizado em mais da
 * metade dos 27 empreendimentos (14/27) e preço zerado em todos — o
 * conserto pontual do Piazza Castello (hardcodar um número) teria que se
 * repetir todo mês, prédio por prédio, para sempre.
 *
 * Preço vencendo por espelho > properties > estático: a unidade é o dado
 * mais granular e mais fresco. Um prédio sem unidade importada ainda pode
 * ter `properties.preco` setado à mão; na ausência dos dois, cai no
 * `Sob consulta` do array estático — nunca mostra número inventado.
 *
 * Client PRÓPRIO, com a service role — não o `createClient()` de cookies
 * (RLS) que o resto deste arquivo usa. Achado testando esta função: RLS
 * libera `properties` para o público, mas bloqueia `empreendimentos` e
 * `empreendimentos_unidades` — a consulta não dá erro, só devolve 0 linhas
 * em silêncio, e a página cai pro "Sob consulta" sem avisar nada. A API
 * pública do espelho (`/api/espelho/[slug]`) já lida com as MESMAS duas
 * tabelas do mesmo jeito, pelo mesmo motivo: é dado de vitrine, não dado de
 * uma sessão de usuário — não precisa (nem deve) passar pela RLS por cookie.
 */
export async function getDadosVivosPorSlug(): Promise<Map<string, DadosVivos>> {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const [{ data: props }, { data: emps }, { data: unidades }] = await Promise.all([
      supabase.from("properties").select("slug, status, exibir_preco, preco"),
      supabase.from("empreendimentos").select("id, slug"),
      supabase.from("empreendimentos_unidades").select("empreendimento_id, valor_tabela, disponivel"),
    ]);

    const slugPorEmpId = new Map<string, string>();
    for (const e of emps ?? []) {
      if (e?.id && e?.slug) slugPorEmpId.set(e.id as string, e.slug as string);
    }

    const minPorSlug = new Map<string, number>();
    for (const u of unidades ?? []) {
      if (u.disponivel === false) continue;
      const slug = slugPorEmpId.get(u.empreendimento_id as string);
      const valor = Number(u.valor_tabela);
      if (!slug || !(valor > 0)) continue;
      const atual = minPorSlug.get(slug);
      if (atual === undefined || valor < atual) minPorSlug.set(slug, valor);
    }

    const out = new Map<string, DadosVivos>();
    for (const p of props ?? []) {
      if (!p?.slug) continue;
      const precoVivo = minPorSlug.get(p.slug as string);
      out.set(p.slug as string, {
        status: (p.status as StatusObra) || undefined,
        exibirPreco: precoVivo !== undefined || Boolean(p.exibir_preco),
        preco: precoVivo !== undefined ? Math.round(precoVivo) : ((p.preco as number | null) ?? null),
      });
    }
    // Preço ao vivo de empreendimento sem linha em `properties` — não deveria
    // acontecer, mas não custa não perder o dado se acontecer.
    for (const [slug, min] of minPorSlug) {
      if (!out.has(slug)) out.set(slug, { exibirPreco: true, preco: Math.round(min) });
    }
    return out;
  } catch {
    return new Map();
  }
}

/** Sobrepõe status/preço vivos num item da vitrine, preservando o resto do conteúdo estático. */
export function comDadosVivosImovel(item: ImovelVitrine, vivos?: DadosVivos): ImovelVitrine {
  if (!vivos) return item;
  return {
    ...item,
    status: vivos.status || item.status,
    exibir_preco: vivos.exibirPreco || item.exibir_preco,
    preco: vivos.exibirPreco ? vivos.preco : item.preco,
  };
}

export function comDadosVivosEmpreendimento(item: Empreendimento, vivos?: DadosVivos): Empreendimento {
  if (!vivos) return item;
  return {
    ...item,
    statusObra: vivos.status || item.statusObra,
    exibirPreco: vivos.exibirPreco || item.exibirPreco,
    precoAPartirDe: vivos.exibirPreco ? (vivos.preco ?? undefined) : item.precoAPartirDe,
  };
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
// (ativos/nao-ocultos) que NAO existam no estatico. Dedupe por slug, estatico
// vence para CONTEÚDO (nome/frase/imagem) — status e preço vêm sempre da
// camada viva, por cima do estático e dos extras igualmente.
export async function getVitrineImoveis(): Promise<ImovelVitrine[]> {
  const estaticos = imoveis;
  try {
    const supabase = await createClient();
    const [{ data }, vivos] = await Promise.all([
      supabase.from("properties").select("*"),
      getDadosVivosPorSlug(),
    ]);
    if (!Array.isArray(data)) return estaticos.map((e) => comDadosVivosImovel(e, vivos.get(e.slug)));
    const construtorasPorSlug = await getConstrutorasPorSlug(supabase);
    const slugsEstaticos = new Set(estaticos.map((e) => e.slug));
    const extras = data
      .filter((p) => p && p.slug && !slugsEstaticos.has(p.slug))
      .filter((p) => p.oculto !== true && p.ativo !== false)
      .map((p) => mapDbToImovel(p, construtorasPorSlug));
    return [
      ...estaticos.map((e) => comDadosVivosImovel(e, vivos.get(e.slug))),
      ...extras.map((e) => comDadosVivosImovel(e, vivos.get(e.slug))),
    ];
  } catch {
    return estaticos;
  }
}

// Vitrine de /empreendimentos: EMPREENDIMENTOS estaticos + do banco (dedupe por
// slug, estatico vence para conteúdo — status/preço sempre vivos).
export async function getVitrineEmpreendimentos(): Promise<Empreendimento[]> {
  const estaticos = EMPREENDIMENTOS;
  try {
    const supabase = await createClient();
    const [{ data }, vivos] = await Promise.all([
      supabase.from("properties").select("*"),
      getDadosVivosPorSlug(),
    ]);
    if (!Array.isArray(data)) return estaticos.map((e) => comDadosVivosEmpreendimento(e, vivos.get(e.slug)));
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
    return [
      ...estaticos.map((e) => comDadosVivosEmpreendimento(e, vivos.get(e.slug))),
      ...extras.map((e) => comDadosVivosEmpreendimento(e, vivos.get(e.slug))),
    ];
  } catch {
    return estaticos;
  }
}
