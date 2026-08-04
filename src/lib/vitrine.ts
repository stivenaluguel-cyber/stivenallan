import { imoveis } from "@/data/imoveis";
import { EMPREENDIMENTOS, type Empreendimento } from "@/lib/empreendimentos";
import { createClient } from "@/lib/supabase/server";
import { getEraldoCardSpecs, AURA_RESIDENCE_POLITICA_FINANCIAMENTO } from "@/lib/eraldo-specs";
import { extrairFaixaNumerica, extrairInteiro } from "@/lib/imoveis/specs";

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

// Ficha técnica (dormitórios/suítes/metragem/vagas/entrega) de uma linha
// `properties` no formato do catálogo. Campo ausente ou não numérico vira
// undefined — o card e os filtros simplesmente não mostram aquele dado
// (nunca inventamos um número que não veio da fonte).
function specsDaLinhaDb(p: { dormitorios?: unknown; suites?: unknown; metragem?: unknown; vagas?: unknown; previsao_entrega?: unknown }) {
  const dormFaixa = extrairFaixaNumerica(typeof p.dormitorios === "string" ? p.dormitorios : undefined);
  const areaFaixa = extrairFaixaNumerica(typeof p.metragem === "string" ? p.metragem : undefined);
  const suitesNum = extrairInteiro(typeof p.suites === "string" ? p.suites : undefined);
  const vagasNum = extrairInteiro(typeof p.vagas === "string" ? p.vagas : undefined);
  return {
    dorms: typeof p.dormitorios === "string" && p.dormitorios ? p.dormitorios : undefined,
    suitesLabel: typeof p.suites === "string" && p.suites ? p.suites : undefined,
    metragemLabel: typeof p.metragem === "string" && p.metragem ? p.metragem : undefined,
    vagasLabel: typeof p.vagas === "string" && p.vagas ? p.vagas : undefined,
    previsaoEntregaLabel: typeof p.previsao_entrega === "string" && p.previsao_entrega ? p.previsao_entrega : undefined,
    dormitoriosMin: dormFaixa.min,
    dormitoriosMax: dormFaixa.max,
    suitesMin: suitesNum,
    suitesMax: suitesNum,
    areaMin: areaFaixa.min,
    areaMax: areaFaixa.max,
    vagasMin: vagasNum,
    vagasMax: vagasNum,
  };
}

// Vitrine de /empreendimentos: EMPREENDIMENTOS estaticos + do banco (dedupe por slug, estatico vence).
// Também enriquece cada item (estático OU extra) com ficha técnica real:
// Fontana via colunas de `properties` (populadas em 2026-07-06 a partir do
// conteúdo das próprias páginas, mas nunca antes lidas aqui pros estáticos);
// Eraldo via as `tipologias` reais de @/data/eraldo/*.
export async function getVitrineEmpreendimentos(): Promise<Empreendimento[]> {
  const estaticos = EMPREENDIMENTOS;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("properties")
      .select("*");
    if (!Array.isArray(data)) return estaticos.map(enriquecerComEraldo);
    const construtorasPorSlug = await getConstrutorasPorSlug(supabase);
    const dbPorSlug = new Map(data.filter((p) => p && p.slug).map((p) => [p.slug as string, p]));
    const slugsEstaticos = new Set(estaticos.map((e) => e.slug));

    const comFicha: Empreendimento[] = estaticos.map((e) => {
      const linha = dbPorSlug.get(e.slug);
      if (e.construtoraSlug === "eraldo") return enriquecerComEraldo(e);
      return linha ? { ...e, ...specsDaLinhaDb(linha) } : e;
    });

    const extras: Empreendimento[] = data
      .filter((p) => p && p.slug && !slugsEstaticos.has(p.slug))
      .filter((p) => p.oculto !== true && p.ativo !== false)
      .map((p) => {
        const base: Empreendimento = {
          slug: p.slug,
          nome: p.nome ?? "",
          construtoraSlug: p.construtora_slug ?? "",
          cidade: p.cidade ?? "",
          bairro: p.bairro ?? "",
          uf: p.uf ?? "",
          imagem: p.cover_image_url ?? "",
          oculto: p.oculto === true,
          statusObra: p.status ?? "",
          exibirPreco: p.exibir_preco ?? false,
          precoAPartirDe: p.preco ?? null,
          frase: p.frase ?? "",
          descricao: p.descricao ?? "",
          imagens: Array.isArray(p.galeria) ? p.galeria : [],
          diferenciais: Array.isArray(p.diferenciais) ? p.diferenciais : [],
          videoUrl: p.video_url ?? null,
          catalogoUrl: p.book_pdf_url ?? null,
          construtoraNome: construtorasPorSlug.get(p.construtora_slug) ?? p.construtora_slug ?? "",
          ...specsDaLinhaDb(p),
        };
        // Empreendimentos Eraldo existem em `properties` (pra virem o card/rota),
        // mas as colunas de ficha técnica lá são NULL — a fonte real é
        // @/data/eraldo/*.ts. Sem isto, os 9 cards Eraldo do catálogo
        // ficariam sem dormitórios/suítes/área/vagas mesmo a informação existindo.
        return base.construtoraSlug === "eraldo" ? enriquecerComEraldo(base) : base;
      });
    return [...comFicha, ...extras];
  } catch {
    return estaticos.map(enriquecerComEraldo);
  }
}

function enriquecerComEraldo(e: Empreendimento): Empreendimento {
  const specs = getEraldoCardSpecs(e.slug);
  if (!specs) {
    // Aura Residence é hand-crafted e não tem arquivo em @/data/eraldo/*, então
    // não aparece no índice de specs — mas o card do catálogo ainda precisa da
    // política de financiamento real dela (classificada a mão, ver eraldo-specs.ts).
    if (e.slug === 'aura-residence-centro-criciuma-sc') {
      return { ...e, politicaFinanciamento: AURA_RESIDENCE_POLITICA_FINANCIAMENTO };
    }
    return e;
  }
  return {
    ...e,
    politicaFinanciamento: specs.politicaFinanciamento,
    dorms: specs.dormitoriosMin !== undefined ? (specs.dormitoriosMin === specs.dormitoriosMax ? String(specs.dormitoriosMin) : `${specs.dormitoriosMin} a ${specs.dormitoriosMax}`) : undefined,
    dormitoriosMin: specs.dormitoriosMin,
    dormitoriosMax: specs.dormitoriosMax,
    suitesMin: specs.suitesMin,
    suitesMax: specs.suitesMax,
    suitesLabel: specs.suitesMin !== undefined ? (specs.suitesMin === specs.suitesMax ? String(specs.suitesMin) : `${specs.suitesMin} a ${specs.suitesMax}`) : undefined,
    areaMin: specs.areaMin,
    areaMax: specs.areaMax,
    metragemLabel: specs.areaMin !== undefined ? (specs.areaMin === specs.areaMax ? specs.areaMin.toLocaleString('pt-BR') : `${specs.areaMin.toLocaleString('pt-BR')} a ${specs.areaMax?.toLocaleString('pt-BR')}`) : undefined,
    vagasMin: specs.vagasMin,
    vagasMax: specs.vagasMax,
    vagasLabel: specs.vagasMin !== undefined ? (specs.vagasMin === specs.vagasMax ? String(specs.vagasMin) : `${specs.vagasMin} a ${specs.vagasMax}`) : undefined,
    previsaoEntregaLabel: specs.previsaoEntrega,
  };
}
