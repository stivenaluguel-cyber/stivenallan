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
          created_at: string
        }
      }
      empreendimentos: {
        Row: {
          id: string
          construtora_id: string
          nome: string
          slug: string
          descricao: string | null
          cidade: string
          uf: string
          bairro: string | null
          endereco: string | null
          status: string
          tipo: string
          dorms_min: number | null
          dorms_max: number | null
          area_min: number | null
          area_max: number | null
          preco_a_partir: number | null
          thumb_url: string | null
          destaque: boolean
          created_at: string
          updated_at: string
        }
      }
      leads: {
        Row: {
          id: string
          nome: string
          telefone: string
          email: string | null
          mensagem: string | null
          canal_preferido: string
          empreendimento_id: string | null
          pagina_origem: string | null
          status: string
          created_at: string
        }
      }
    }
  }
}
