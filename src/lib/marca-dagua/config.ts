import type { SupabaseClient } from '@supabase/supabase-js'
import type { ConfigMarcaDagua } from './posicionamento'
import { logWarn, logError } from '@/lib/log'

const SOURCE = 'lib/marca-dagua/config'

export const CONFIG_PADRAO: ConfigMarcaDagua = {
  posicao: 'inferior-direita',
  opacidade: 0.6,
  larguraRelativa: 0.25,
}

export type PreferenciasMarcaDagua = ConfigMarcaDagua & { logoPath: string | null }

/**
 * Lê a config de marca d'água do dono da operação. Tolerante à migration
 * 20260806090000 ainda não ter sido aplicada neste ambiente (colunas ou até
 * a tabela toda podem não existir): cai no padrão em vez de derrubar quem
 * chama — mesma postura defensiva de src/app/api/admin/meta-diaria/route.ts.
 */
export async function buscarPreferencias(client: SupabaseClient, adminId: string): Promise<PreferenciasMarcaDagua> {
  const { data, error } = await client
    .from('crm_preferencias')
    .select('marca_dagua_logo_path, marca_dagua_posicao, marca_dagua_opacidade, marca_dagua_largura_relativa')
    .eq('admin_id', adminId)
    .maybeSingle()

  if (error) {
    if (error.code === '42P01' || error.code === '42703') {
      logWarn(SOURCE, 'tabela/colunas de marca d\'água ainda não existem neste ambiente — usando padrão', { adminId, code: error.code })
    } else {
      logError(SOURCE, 'falha ao buscar preferências de marca d\'água, usando padrão', error, { adminId })
    }
    return { ...CONFIG_PADRAO, logoPath: null }
  }

  if (!data || !data.marca_dagua_logo_path) return { ...CONFIG_PADRAO, logoPath: null }

  return {
    logoPath: data.marca_dagua_logo_path,
    posicao: (data.marca_dagua_posicao as ConfigMarcaDagua['posicao']) ?? CONFIG_PADRAO.posicao,
    opacidade: data.marca_dagua_opacidade != null ? Number(data.marca_dagua_opacidade) : CONFIG_PADRAO.opacidade,
    larguraRelativa: data.marca_dagua_largura_relativa != null ? Number(data.marca_dagua_largura_relativa) : CONFIG_PADRAO.larguraRelativa,
  }
}

export const BUCKET_LOGO = 'marcas-dagua'
export const BUCKET_FOTOS = 'imoveis'

export function caminhoLogo(adminId: string): string {
  return `logos/${adminId}.png`
}

/** Baixa os bytes da logo salva. `null` se não houver logo configurada ou o download falhar. */
export async function baixarLogo(client: SupabaseClient, logoPath: string): Promise<Buffer | null> {
  const { data, error } = await client.storage.from(BUCKET_LOGO).download(logoPath)
  if (error || !data) return null
  return Buffer.from(await data.arrayBuffer())
}

export function ehPosicaoValida(v: unknown): v is ConfigMarcaDagua['posicao'] {
  return v === 'centro' || v === 'inferior-direita' || v === 'inferior-esquerda'
}
