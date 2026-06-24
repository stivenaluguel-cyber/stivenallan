import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Build-safe: only instantiate if env vars are available
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any)

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// Admin client (server-side only - uses service_role key)
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export type Database = {
  public: {
    Tables: {
      construtoras: {
        Row: {
          id: string
          nome: string
          slug: string
          logo_url: string | null
          site_url: string | null
          website: string | null
          created_at: string
        }
      }
      empreendimentos: {
        Row: {
          id: string
          construtora_id: string | null
          nome: string
          slug: string
          descricao: string | null
          cidade: string | null
          uf: string
          bairro: string | null
          endereco: string | null
          status: 'lancamento' | 'em_obras' | 'pronto' | 'vendido'
          tipo: string | null
          dorms_min: number | null
          dorms_max: number | null
          quartos_min: number | null
          quartos_max: number | null
          vagas_min: number | null
          vagas_max: number | null
          area_min: number | null
          area_max: number | null
          preco_min: number | null
          preco_max: number | null
          preco_a_partir: number | null
          thumb_url: string | null
          video_tour_url: string | null
          previsao_entrega: string | null
          latitude: number | null
          longitude: number | null
          destaque: boolean
          ativo: boolean | null
          publicado: boolean | null
          created_at: string
          updated_at: string
        }
      }
      empreendimento_midias: {
        Row: {
          id: string
          empreendimento_id: string
          tipo: 'foto' | 'video' | 'planta' | 'tour360'
          url: string
          url_thumb: string | null
          ordem: number
          principal: boolean
          created_at: string
        }
      }
      tipologias: {
        Row: {
          id: string
          empreendimento_id: string
          nome: string
          quartos: number | null
          banheiros: number | null
          vagas: number | null
          area_util: number | null
          preco: number | null
          disponivel: boolean
          created_at: string
        }
      }
      leads: {
        Row: {
          id: string
          nome: string
          telefone: string
          email: string | null
          mensagem: string | null
          canal_preferido: string | null
          origem: string | null
          empreendimento_id: string | null
          pagina_origem: string | null
          status: 'novo' | 'contato' | 'qualificado' | 'proposta' | 'fechado' | 'perdido'
          created_at: string
          updated_at: string
        }
        Insert: {
          nome: string
          telefone: string
          email?: string | null
          mensagem?: string | null
          canal_preferido?: string | null
          origem?: string | null
          empreendimento_id?: string | null
          pagina_origem?: string | null
          status?: string
        }
      }
      lead_interacoes: {
        Row: {
          id: string
          lead_id: string
          tipo: 'nota' | 'ligacao' | 'whatsapp' | 'email' | 'visita' | 'proposta'
          descricao: string
          created_at: string
        }
        Insert: {
          lead_id: string
          tipo?: string
          descricao: string
        }
      }
    }
  }
}

// Helper type for empreendimento with construtora joined
export type EmpreendimentoComConstrutora = Database['public']['Tables']['empreendimentos']['Row'] & {
  construtoras: Database['public']['Tables']['construtoras']['Row'] | null
}
