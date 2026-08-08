// AUTO-GERADO — NÃO EDITE MANUALMENTE.
//
// Gerado de verdade pelo Supabase CLI via introspecção read-only do projeto
// remoto real (não é transcrição manual de migrations):
//
//   npx supabase gen types typescript --project-id xpkznaqgctfkoonqpcye --schema public
//
// Projeto: xpkznaqgctfkoonqpcye ("stivenaluguel-cyber's Project", região
// us-east-2 — o mesmo ref usado em NEXT_PUBLIC_SUPABASE_URL em produção).
// CLI já estava autenticado nesta sessão (login de uma sessão anterior) —
// nenhuma credencial foi criada, exposta ou inventada pra gerar isto.
// Gerado em 2026-08-08 (Item 10A: regenerado após a migration
// 20260808020000_crm_agenda_property_id.sql — único diff real vs a versão
// anterior é crm_agenda.property_id em Row/Insert/Update + o Relationship
// crm_agenda_property_id_fkey; nenhum outro schema drift). Cobre as 73
// tabelas do schema `public` na íntegra — não é um subconjunto nem contém
// stubs/`any` em lugar nenhum.
//
// Pra regenerar depois de uma migration nova, rode o mesmo comando acima
// (read-only, não altera nada no banco) e substitua este arquivo inteiro.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nome: string
          senha_hash: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          nome?: string
          senha_hash: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          senha_hash?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      agendamentos: {
        Row: {
          created_at: string | null
          data_hora: string
          empreendimento_id: string | null
          id: string
          lead_id: string | null
          observacoes: string | null
          status: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_hora: string
          empreendimento_id?: string | null
          id?: string
          lead_id?: string | null
          observacoes?: string | null
          status?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_hora?: string
          empreendimento_id?: string | null
          id?: string
          lead_id?: string | null
          observacoes?: string | null
          status?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      alertas_leilao: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          email: string
          enviado_1h: boolean | null
          enviado_24h: boolean | null
          enviado_4h: boolean | null
          id: number
          imovel_id: string
          nome: string
          notificado: boolean | null
          telefone: string
          unsubscribe_token: string
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          email: string
          enviado_1h?: boolean | null
          enviado_24h?: boolean | null
          enviado_4h?: boolean | null
          id?: number
          imovel_id: string
          nome: string
          notificado?: boolean | null
          telefone?: string
          unsubscribe_token: string
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          email?: string
          enviado_1h?: boolean | null
          enviado_24h?: boolean | null
          enviado_4h?: boolean | null
          id?: number
          imovel_id?: string
          nome?: string
          notificado?: boolean | null
          telefone?: string
          unsubscribe_token?: string
        }
        Relationships: []
      }
      automacao_email_passos: {
        Row: {
          assunto: string
          corpo_html: string
          dias_minimos: number
          ordem: number
        }
        Insert: {
          assunto: string
          corpo_html: string
          dias_minimos: number
          ordem: number
        }
        Update: {
          assunto?: string
          corpo_html?: string
          dias_minimos?: number
          ordem?: number
        }
        Relationships: []
      }
      automacao_regras: {
        Row: {
          acao_params: Json
          acao_tipo: string
          ativo: boolean
          created_at: string
          filtro_estagio: string[] | null
          gatilho_params: Json
          gatilho_tipo: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          acao_params?: Json
          acao_tipo: string
          ativo?: boolean
          created_at?: string
          filtro_estagio?: string[] | null
          gatilho_params?: Json
          gatilho_tipo: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          acao_params?: Json
          acao_tipo?: string
          ativo?: boolean
          created_at?: string
          filtro_estagio?: string[] | null
          gatilho_params?: Json
          gatilho_tipo?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      automacao_regras_execucoes: {
        Row: {
          executado_em: string
          id: string
          lead_id: string
          regra_id: string
        }
        Insert: {
          executado_em?: string
          id?: string
          lead_id: string
          regra_id: string
        }
        Update: {
          executado_em?: string
          id?: string
          lead_id?: string
          regra_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automacao_regras_execucoes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automacao_regras_execucoes_regra_id_fkey"
            columns: ["regra_id"]
            isOneToOne: false
            referencedRelation: "automacao_regras"
            referencedColumns: ["id"]
          },
        ]
      }
      automacao_whatsapp_intervalos: {
        Row: {
          dias: number
          ordem: number
        }
        Insert: {
          dias: number
          ordem: number
        }
        Update: {
          dias?: number
          ordem?: number
        }
        Relationships: []
      }
      automacao_whatsapp_mensagens: {
        Row: {
          estagio_funil: string
          mensagem: string
          ordem: number
        }
        Insert: {
          estagio_funil: string
          mensagem: string
          ordem: number
        }
        Update: {
          estagio_funil?: string
          mensagem?: string
          ordem?: number
        }
        Relationships: []
      }
      base_conhecimento: {
        Row: {
          aprovado: boolean
          ativo: boolean
          busca: unknown
          created_at: string
          id: string
          lead_id_origem: string | null
          origem: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          aprovado?: boolean
          ativo?: boolean
          busca?: unknown
          created_at?: string
          id?: string
          lead_id_origem?: string | null
          origem?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          aprovado?: boolean
          ativo?: boolean
          busca?: unknown
          created_at?: string
          id?: string
          lead_id_origem?: string | null
          origem?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "base_conhecimento_lead_id_origem_fkey"
            columns: ["lead_id_origem"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      campanha_destinatarios: {
        Row: {
          campanha_id: string
          email: string
          enviado_em: string | null
          id: string
          lead_id: string | null
          resend_message_id: string | null
          status: string
        }
        Insert: {
          campanha_id: string
          email: string
          enviado_em?: string | null
          id?: string
          lead_id?: string | null
          resend_message_id?: string | null
          status?: string
        }
        Update: {
          campanha_id?: string
          email?: string
          enviado_em?: string | null
          id?: string
          lead_id?: string | null
          resend_message_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campanha_destinatarios_campanha_id_fkey"
            columns: ["campanha_id"]
            isOneToOne: false
            referencedRelation: "campanhas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campanha_destinatarios_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      campanha_eventos: {
        Row: {
          campanha_id: string
          created_at: string
          id: string
          lead_id: string | null
          metadata: Json | null
          tipo: string
        }
        Insert: {
          campanha_id: string
          created_at?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          tipo: string
        }
        Update: {
          campanha_id?: string
          created_at?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "campanha_eventos_campanha_id_fkey"
            columns: ["campanha_id"]
            isOneToOne: false
            referencedRelation: "campanhas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campanha_eventos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      campanhas: {
        Row: {
          agendada_para: string | null
          assunto: string
          corpo_html: string
          criado_em: string
          enviada_em: string | null
          id: string
          segmento: Json
          status: string
          titulo: string
        }
        Insert: {
          agendada_para?: string | null
          assunto: string
          corpo_html: string
          criado_em?: string
          enviada_em?: string | null
          id?: string
          segmento: Json
          status?: string
          titulo: string
        }
        Update: {
          agendada_para?: string | null
          assunto?: string
          corpo_html?: string
          criado_em?: string
          enviada_em?: string | null
          id?: string
          segmento?: Json
          status?: string
          titulo?: string
        }
        Relationships: []
      }
      configuracoes_cub: {
        Row: {
          atualizado_por: string | null
          created_at: string
          fonte: string | null
          id: string
          mes_referencia: string
          notas: string | null
          updated_at: string
          valor_m2: number
          variacao_anual: number | null
          variacao_mensal: number | null
        }
        Insert: {
          atualizado_por?: string | null
          created_at?: string
          fonte?: string | null
          id?: string
          mes_referencia: string
          notas?: string | null
          updated_at?: string
          valor_m2: number
          variacao_anual?: number | null
          variacao_mensal?: number | null
        }
        Update: {
          atualizado_por?: string | null
          created_at?: string
          fonte?: string | null
          id?: string
          mes_referencia?: string
          notas?: string | null
          updated_at?: string
          valor_m2?: number
          variacao_anual?: number | null
          variacao_mensal?: number | null
        }
        Relationships: []
      }
      construtoras: {
        Row: {
          cidade: string | null
          created_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          nome: string
          site_url: string | null
          slug: string
          telefone: string | null
          uf: string | null
        }
        Insert: {
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          site_url?: string | null
          slug: string
          telefone?: string | null
          uf?: string | null
        }
        Update: {
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          site_url?: string | null
          slug?: string
          telefone?: string | null
          uf?: string | null
        }
        Relationships: []
      }
      crm_agenda: {
        Row: {
          admin_id: string | null
          client_event_id: string | null
          cliente_id: string | null
          created_at: string
          descricao: string | null
          fim: string | null
          id: string
          inicio: string
          lead_id: string | null
          lembrete_min: number | null
          local: string | null
          property_id: string | null
          status: string | null
          tipo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          client_event_id?: string | null
          cliente_id?: string | null
          created_at?: string
          descricao?: string | null
          fim?: string | null
          id?: string
          inicio: string
          lead_id?: string | null
          lembrete_min?: number | null
          local?: string | null
          property_id?: string | null
          status?: string | null
          tipo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          client_event_id?: string | null
          cliente_id?: string | null
          created_at?: string
          descricao?: string | null
          fim?: string | null
          id?: string
          inicio?: string
          lead_id?: string | null
          lembrete_min?: number | null
          local?: string | null
          property_id?: string | null
          status?: string | null
          tipo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_agenda_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_agenda_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "crm_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_agenda_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_agenda_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_anexos: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          lead_id: string | null
          mime_type: string | null
          nome_arquivo: string
          observacao: string | null
          proposta_id: string | null
          storage_path: string
          tamanho_bytes: number | null
          tipo: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          mime_type?: string | null
          nome_arquivo: string
          observacao?: string | null
          proposta_id?: string | null
          storage_path: string
          tamanho_bytes?: number | null
          tipo?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          mime_type?: string | null
          nome_arquivo?: string
          observacao?: string | null
          proposta_id?: string | null
          storage_path?: string
          tamanho_bytes?: number | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_anexos_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_anexos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_anexos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "crm_propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_ativacoes_instagram: {
        Row: {
          abordado_em: string | null
          anotacoes: string | null
          contexto: string | null
          created_at: string
          id: string
          lead_id: string | null
          nome: string | null
          origem: string
          status: string
          updated_at: string
          username: string
        }
        Insert: {
          abordado_em?: string | null
          anotacoes?: string | null
          contexto?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          nome?: string | null
          origem: string
          status?: string
          updated_at?: string
          username: string
        }
        Update: {
          abordado_em?: string | null
          anotacoes?: string | null
          contexto?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          nome?: string | null
          origem?: string
          status?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_ativacoes_instagram_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_atividades_manuais: {
        Row: {
          admin_id: string
          created_at: string
          data: string
          id: string
          observacao: string | null
          quantidade: number
          tipo: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          data: string
          id?: string
          observacao?: string | null
          quantidade?: number
          tipo: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          data?: string
          id?: string
          observacao?: string | null
          quantidade?: number
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_atividades_manuais_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_clientes: {
        Row: {
          busca_bairros: string | null
          busca_dorms_min: number | null
          busca_tipo: string | null
          busca_valor_max: number | null
          busca_valor_min: number | null
          cidade: string | null
          corretor_resp: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string | null
          estado: string | null
          estado_civil: string | null
          id: string
          lead_id: string | null
          nome: string
          notas: string | null
          origem: string | null
          perfil_busca: string | null
          renda_mensal: number | null
          status: string | null
          tags: string | null
          telefone: string | null
          telefone2: string | null
          tem_fgts: boolean | null
          updated_at: string
        }
        Insert: {
          busca_bairros?: string | null
          busca_dorms_min?: number | null
          busca_tipo?: string | null
          busca_valor_max?: number | null
          busca_valor_min?: number | null
          cidade?: string | null
          corretor_resp?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          estado?: string | null
          estado_civil?: string | null
          id?: string
          lead_id?: string | null
          nome: string
          notas?: string | null
          origem?: string | null
          perfil_busca?: string | null
          renda_mensal?: number | null
          status?: string | null
          tags?: string | null
          telefone?: string | null
          telefone2?: string | null
          tem_fgts?: boolean | null
          updated_at?: string
        }
        Update: {
          busca_bairros?: string | null
          busca_dorms_min?: number | null
          busca_tipo?: string | null
          busca_valor_max?: number | null
          busca_valor_min?: number | null
          cidade?: string | null
          corretor_resp?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          estado?: string | null
          estado_civil?: string | null
          id?: string
          lead_id?: string | null
          nome?: string
          notas?: string | null
          origem?: string | null
          perfil_busca?: string | null
          renda_mensal?: number | null
          status?: string | null
          tags?: string | null
          telefone?: string | null
          telefone2?: string | null
          tem_fgts?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_clientes_corretor_resp_fkey"
            columns: ["corretor_resp"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_clientes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_comissao_parcelas: {
        Row: {
          comissao_id: string
          created_at: string
          data_pagamento: string | null
          data_prevista: string
          descricao: string | null
          id: string
          numero: number
          status: string
          updated_at: string
          valor: number
        }
        Insert: {
          comissao_id: string
          created_at?: string
          data_pagamento?: string | null
          data_prevista: string
          descricao?: string | null
          id?: string
          numero: number
          status?: string
          updated_at?: string
          valor: number
        }
        Update: {
          comissao_id?: string
          created_at?: string
          data_pagamento?: string | null
          data_prevista?: string
          descricao?: string | null
          id?: string
          numero?: number
          status?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_comissao_parcelas_comissao_id_fkey"
            columns: ["comissao_id"]
            isOneToOne: false
            referencedRelation: "crm_comissoes"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_comissao_participantes: {
        Row: {
          comissao_id: string
          corretor_id: string | null
          created_at: string
          id: string
          nome: string | null
          observacoes: string | null
          papel: string
          percentual: number
        }
        Insert: {
          comissao_id: string
          corretor_id?: string | null
          created_at?: string
          id?: string
          nome?: string | null
          observacoes?: string | null
          papel: string
          percentual: number
        }
        Update: {
          comissao_id?: string
          corretor_id?: string | null
          created_at?: string
          id?: string
          nome?: string | null
          observacoes?: string | null
          papel?: string
          percentual?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_comissao_participantes_comissao_id_fkey"
            columns: ["comissao_id"]
            isOneToOne: false
            referencedRelation: "crm_comissoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_comissao_participantes_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "crm_corretores"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_comissoes: {
        Row: {
          corretor_captador_id: string | null
          corretor_vendedor_id: string | null
          created_at: string
          data_recebimento: string | null
          data_venda: string | null
          empreendimento_id: string | null
          id: string
          lead_id: string | null
          observacoes: string | null
          percentual_captador: number
          percentual_total: number
          percentual_vendedor: number
          proposta_id: string | null
          status: string
          updated_at: string
          valor_comissao: number
          valor_venda: number
        }
        Insert: {
          corretor_captador_id?: string | null
          corretor_vendedor_id?: string | null
          created_at?: string
          data_recebimento?: string | null
          data_venda?: string | null
          empreendimento_id?: string | null
          id?: string
          lead_id?: string | null
          observacoes?: string | null
          percentual_captador?: number
          percentual_total?: number
          percentual_vendedor?: number
          proposta_id?: string | null
          status?: string
          updated_at?: string
          valor_comissao: number
          valor_venda: number
        }
        Update: {
          corretor_captador_id?: string | null
          corretor_vendedor_id?: string | null
          created_at?: string
          data_recebimento?: string | null
          data_venda?: string | null
          empreendimento_id?: string | null
          id?: string
          lead_id?: string | null
          observacoes?: string | null
          percentual_captador?: number
          percentual_total?: number
          percentual_vendedor?: number
          proposta_id?: string | null
          status?: string
          updated_at?: string
          valor_comissao?: number
          valor_venda?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_comissoes_corretor_captador_id_fkey"
            columns: ["corretor_captador_id"]
            isOneToOne: false
            referencedRelation: "crm_corretores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_comissoes_corretor_vendedor_id_fkey"
            columns: ["corretor_vendedor_id"]
            isOneToOne: false
            referencedRelation: "crm_corretores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_comissoes_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_comissoes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_comissoes_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "crm_propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_corretores: {
        Row: {
          admin_id: string | null
          ativo: boolean
          created_at: string
          creci: string | null
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          percentual_padrao: number
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          admin_id?: string | null
          ativo?: boolean
          created_at?: string
          creci?: string | null
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          percentual_padrao?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          admin_id?: string | null
          ativo?: boolean
          created_at?: string
          creci?: string | null
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          percentual_padrao?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_corretores_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_focus_events: {
        Row: {
          action_type: string
          admin_id: string | null
          client_event_id: string
          created_at: string
          id: string
          lead_id: string
          metadata: Json
          next_stage: string | null
          points: number
          previous_stage: string | null
          session_id: string
        }
        Insert: {
          action_type: string
          admin_id?: string | null
          client_event_id: string
          created_at?: string
          id?: string
          lead_id: string
          metadata?: Json
          next_stage?: string | null
          points?: number
          previous_stage?: string | null
          session_id: string
        }
        Update: {
          action_type?: string
          admin_id?: string | null
          client_event_id?: string
          created_at?: string
          id?: string
          lead_id?: string
          metadata?: Json
          next_stage?: string | null
          points?: number
          previous_stage?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_focus_events_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_focus_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_focus_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "crm_focus_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_focus_session_leads: {
        Row: {
          client_event_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          lead_id: string
          position: number
          primary_action: string | null
          session_id: string
          snoozed_until: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_event_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          lead_id: string
          position: number
          primary_action?: string | null
          session_id: string
          snoozed_until?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_event_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          position?: number
          primary_action?: string | null
          session_id?: string
          snoozed_until?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_focus_session_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_focus_session_leads_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "crm_focus_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_focus_sessions: {
        Row: {
          admin_id: string | null
          created_at: string
          earned_points: number
          filtros: Json
          finished_at: string | null
          id: string
          processed_leads: number
          skipped_leads: number
          started_at: string
          status: string
          total_leads: number
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          earned_points?: number
          filtros?: Json
          finished_at?: string | null
          id?: string
          processed_leads?: number
          skipped_leads?: number
          started_at?: string
          status?: string
          total_leads?: number
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          earned_points?: number
          filtros?: Json
          finished_at?: string | null
          id?: string
          processed_leads?: number
          skipped_leads?: number
          started_at?: string
          status?: string
          total_leads?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_focus_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_lead_envolvidos: {
        Row: {
          created_at: string
          email: string | null
          id: string
          lead_id: string
          nome: string
          observacoes: string | null
          papel: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          lead_id: string
          nome: string
          observacoes?: string | null
          papel: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          lead_id?: string
          nome?: string
          observacoes?: string | null
          papel?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_lead_envolvidos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_metas_dia_historico: {
        Row: {
          admin_id: string
          cumpridas: number
          data: string
          dia_completo: boolean
          id: string
          metas: Json
          percentual: number
          resumo: Json
          selado_em: string
          total: number
        }
        Insert: {
          admin_id: string
          cumpridas?: number
          data: string
          dia_completo?: boolean
          id?: string
          metas?: Json
          percentual?: number
          resumo?: Json
          selado_em?: string
          total?: number
        }
        Update: {
          admin_id?: string
          cumpridas?: number
          data?: string
          dia_completo?: boolean
          id?: string
          metas?: Json
          percentual?: number
          resumo?: Json
          selado_em?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_metas_dia_historico_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_metas_diarias: {
        Row: {
          admin_id: string
          ativo: boolean
          conteudos: number
          created_at: string
          followups: number
          id: string
          novos_contatos: number
          reunioes: number
          sla_primeiro_atendimento_min: number
          updated_at: string
          visitas: number
        }
        Insert: {
          admin_id: string
          ativo?: boolean
          conteudos?: number
          created_at?: string
          followups?: number
          id?: string
          novos_contatos?: number
          reunioes?: number
          sla_primeiro_atendimento_min?: number
          updated_at?: string
          visitas?: number
        }
        Update: {
          admin_id?: string
          ativo?: boolean
          conteudos?: number
          created_at?: string
          followups?: number
          id?: string
          novos_contatos?: number
          reunioes?: number
          sla_primeiro_atendimento_min?: number
          updated_at?: string
          visitas?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_metas_diarias_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: true
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_metas_mensais: {
        Row: {
          admin_id: string
          competencia: string
          created_at: string
          id: string
          meta_propostas: number
          meta_vendas: number
          meta_vgv: number
          updated_at: string
        }
        Insert: {
          admin_id: string
          competencia: string
          created_at?: string
          id?: string
          meta_propostas?: number
          meta_vendas?: number
          meta_vgv?: number
          updated_at?: string
        }
        Update: {
          admin_id?: string
          competencia?: string
          created_at?: string
          id?: string
          meta_propostas?: number
          meta_vendas?: number
          meta_vgv?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_metas_mensais_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_notas_fiscais: {
        Row: {
          admin_id: string
          competencia: string
          created_at: string
          id: string
          numero: string
          storage_path: string
          updated_at: string
          valor: number
        }
        Insert: {
          admin_id: string
          competencia: string
          created_at?: string
          id?: string
          numero: string
          storage_path: string
          updated_at?: string
          valor: number
        }
        Update: {
          admin_id?: string
          competencia?: string
          created_at?: string
          id?: string
          numero?: string
          storage_path?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_notas_fiscais_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_notificacoes: {
        Row: {
          admin_id: string | null
          corpo: string | null
          created_at: string
          id: string
          lida: boolean | null
          link: string | null
          metadata: Json | null
          tipo: string
          titulo: string
        }
        Insert: {
          admin_id?: string | null
          corpo?: string | null
          created_at?: string
          id?: string
          lida?: boolean | null
          link?: string | null
          metadata?: Json | null
          tipo: string
          titulo: string
        }
        Update: {
          admin_id?: string | null
          corpo?: string | null
          created_at?: string
          id?: string
          lida?: boolean | null
          link?: string | null
          metadata?: Json | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_notificacoes_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_preferencias: {
        Row: {
          admin_id: string
          bio: string | null
          created_at: string
          creci: string | null
          foto_url: string | null
          id: string
          instagram: string | null
          marca_dagua_largura_relativa: number
          marca_dagua_logo_path: string | null
          marca_dagua_opacidade: number
          marca_dagua_posicao: string
          meta_diaria_followups: number
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          admin_id: string
          bio?: string | null
          created_at?: string
          creci?: string | null
          foto_url?: string | null
          id?: string
          instagram?: string | null
          marca_dagua_largura_relativa?: number
          marca_dagua_logo_path?: string | null
          marca_dagua_opacidade?: number
          marca_dagua_posicao?: string
          meta_diaria_followups?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          admin_id?: string
          bio?: string | null
          created_at?: string
          creci?: string | null
          foto_url?: string | null
          id?: string
          instagram?: string | null
          marca_dagua_largura_relativa?: number
          marca_dagua_logo_path?: string | null
          marca_dagua_opacidade?: number
          marca_dagua_posicao?: string
          meta_diaria_followups?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_preferencias_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: true
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_propostas: {
        Row: {
          client_event_id: string | null
          cliente_id: string | null
          cliente_nome: string | null
          condicoes_pgto: string | null
          corretor_id: string | null
          created_at: string
          cub_valor_m2: number | null
          data_venda: string | null
          empreendimento_id: string | null
          id: string
          lead_id: string | null
          notas: string | null
          numero: string
          simulacao_json: Json | null
          status: string
          unidade_id: string | null
          updated_at: string
          validade_ate: string | null
          valor_a_receber: number
          valor_entrada: number | null
          valor_proposto: number
          valor_recebido: number
        }
        Insert: {
          client_event_id?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          condicoes_pgto?: string | null
          corretor_id?: string | null
          created_at?: string
          cub_valor_m2?: number | null
          data_venda?: string | null
          empreendimento_id?: string | null
          id?: string
          lead_id?: string | null
          notas?: string | null
          numero?: string
          simulacao_json?: Json | null
          status?: string
          unidade_id?: string | null
          updated_at?: string
          validade_ate?: string | null
          valor_a_receber?: number
          valor_entrada?: number | null
          valor_proposto?: number
          valor_recebido?: number
        }
        Update: {
          client_event_id?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          condicoes_pgto?: string | null
          corretor_id?: string | null
          created_at?: string
          cub_valor_m2?: number | null
          data_venda?: string | null
          empreendimento_id?: string | null
          id?: string
          lead_id?: string | null
          notas?: string | null
          numero?: string
          simulacao_json?: Json | null
          status?: string
          unidade_id?: string | null
          updated_at?: string
          validade_ate?: string | null
          valor_a_receber?: number
          valor_entrada?: number | null
          valor_proposto?: number
          valor_recebido?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_propostas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "crm_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_propostas_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_propostas_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_propostas_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_propostas_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos_unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_proprietarios: {
        Row: {
          anotacoes: string | null
          autorizacao: boolean
          bairro: string | null
          cidade: string | null
          created_at: string
          dormitorios: string | null
          email: string | null
          endereco: string | null
          estagio: string
          exclusividade: boolean
          fbclid: string | null
          gclid: string | null
          id: string
          intencao: string
          link_anuncio: string | null
          metragem: string | null
          motivo_perda: string | null
          nome: string
          origem: string | null
          property_id: string | null
          proximo_contato: string | null
          publicado_em: string | null
          tipo_imovel: string | null
          ultimo_contato: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          valor_acordado: number | null
          valor_pretendido: number | null
          whatsapp: string
        }
        Insert: {
          anotacoes?: string | null
          autorizacao?: boolean
          bairro?: string | null
          cidade?: string | null
          created_at?: string
          dormitorios?: string | null
          email?: string | null
          endereco?: string | null
          estagio?: string
          exclusividade?: boolean
          fbclid?: string | null
          gclid?: string | null
          id?: string
          intencao?: string
          link_anuncio?: string | null
          metragem?: string | null
          motivo_perda?: string | null
          nome: string
          origem?: string | null
          property_id?: string | null
          proximo_contato?: string | null
          publicado_em?: string | null
          tipo_imovel?: string | null
          ultimo_contato?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          valor_acordado?: number | null
          valor_pretendido?: number | null
          whatsapp: string
        }
        Update: {
          anotacoes?: string | null
          autorizacao?: boolean
          bairro?: string | null
          cidade?: string | null
          created_at?: string
          dormitorios?: string | null
          email?: string | null
          endereco?: string | null
          estagio?: string
          exclusividade?: boolean
          fbclid?: string | null
          gclid?: string | null
          id?: string
          intencao?: string
          link_anuncio?: string | null
          metragem?: string | null
          motivo_perda?: string | null
          nome?: string
          origem?: string | null
          property_id?: string | null
          proximo_contato?: string | null
          publicado_em?: string | null
          tipo_imovel?: string | null
          ultimo_contato?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          valor_acordado?: number | null
          valor_pretendido?: number | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_proprietarios_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_push_subscriptions: {
        Row: {
          admin_id: string | null
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_agent: string | null
        }
        Insert: {
          admin_id?: string | null
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_agent?: string | null
        }
        Update: {
          admin_id?: string | null
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_push_subscriptions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_simulacoes: {
        Row: {
          admin_id: string | null
          chaves_valor: number | null
          client_event_id: string | null
          correcao: string | null
          created_at: string
          detalhes: Json
          empreendimento_nome: string | null
          empreendimento_slug: string | null
          entrada: number | null
          id: string
          lead_id: string | null
          parcelas_qtd: number | null
          parcelas_valor: number | null
          reforcos_qtd: number | null
          reforcos_valor: number | null
          valor_imovel: number
        }
        Insert: {
          admin_id?: string | null
          chaves_valor?: number | null
          client_event_id?: string | null
          correcao?: string | null
          created_at?: string
          detalhes?: Json
          empreendimento_nome?: string | null
          empreendimento_slug?: string | null
          entrada?: number | null
          id?: string
          lead_id?: string | null
          parcelas_qtd?: number | null
          parcelas_valor?: number | null
          reforcos_qtd?: number | null
          reforcos_valor?: number | null
          valor_imovel: number
        }
        Update: {
          admin_id?: string | null
          chaves_valor?: number | null
          client_event_id?: string | null
          correcao?: string | null
          created_at?: string
          detalhes?: Json
          empreendimento_nome?: string | null
          empreendimento_slug?: string | null
          entrada?: number | null
          id?: string
          lead_id?: string | null
          parcelas_qtd?: number | null
          parcelas_valor?: number | null
          reforcos_qtd?: number | null
          reforcos_valor?: number | null
          valor_imovel?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_simulacoes_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_simulacoes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      cron_runs: {
        Row: {
          cron_name: string
          details: Json | null
          duration_ms: number | null
          ended_at: string | null
          enviados: number | null
          erros_envio: number | null
          id: string
          motivo: string | null
          processados: number | null
          pulados: number | null
          started_at: string
          status: string
        }
        Insert: {
          cron_name: string
          details?: Json | null
          duration_ms?: number | null
          ended_at?: string | null
          enviados?: number | null
          erros_envio?: number | null
          id?: string
          motivo?: string | null
          processados?: number | null
          pulados?: number | null
          started_at?: string
          status?: string
        }
        Update: {
          cron_name?: string
          details?: Json | null
          duration_ms?: number | null
          ended_at?: string | null
          enviados?: number | null
          erros_envio?: number | null
          id?: string
          motivo?: string | null
          processados?: number | null
          pulados?: number | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      diferenciais_empreendimento: {
        Row: {
          categoria: string | null
          created_at: string | null
          descricao: string
          empreendimento_id: string | null
          icone: string | null
          id: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          descricao: string
          empreendimento_id?: string | null
          icone?: string | null
          id?: string
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          descricao?: string
          empreendimento_id?: string | null
          icone?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diferenciais_empreendimento_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      empreendimento_midias: {
        Row: {
          created_at: string | null
          empreendimento_id: string | null
          id: string
          legenda: string | null
          ordem: number | null
          tipo: string | null
          url: string
          url_thumb: string | null
        }
        Insert: {
          created_at?: string | null
          empreendimento_id?: string | null
          id?: string
          legenda?: string | null
          ordem?: number | null
          tipo?: string | null
          url: string
          url_thumb?: string | null
        }
        Update: {
          created_at?: string | null
          empreendimento_id?: string | null
          id?: string
          legenda?: string | null
          ordem?: number | null
          tipo?: string | null
          url?: string
          url_thumb?: string | null
        }
        Relationships: []
      }
      empreendimentos: {
        Row: {
          area_privativa_max: number | null
          area_privativa_min: number | null
          bairro: string | null
          cep: string | null
          cidade: string
          construtora: string | null
          construtora_id: string | null
          created_at: string | null
          descricao_completa: string | null
          descricao_curta: string | null
          endereco: string | null
          exibir_preco: boolean | null
          id: string
          imagem_capa_url: string | null
          imagens_urls: string[] | null
          landing_page_url: string | null
          latitude: number | null
          longitude: number | null
          maps_embed_url: string | null
          nome: string
          preco_a_partir: number | null
          preco_a_partir_de: number | null
          preco_ate: number | null
          previsao_entrega: string | null
          slug: string
          status_obra: string | null
          status_venda: string | null
          total_unidades: number | null
          uf: string | null
          unidades_disponiveis: number | null
          updated_at: string | null
          video_url: string | null
          whatsapp: string | null
        }
        Insert: {
          area_privativa_max?: number | null
          area_privativa_min?: number | null
          bairro?: string | null
          cep?: string | null
          cidade?: string
          construtora?: string | null
          construtora_id?: string | null
          created_at?: string | null
          descricao_completa?: string | null
          descricao_curta?: string | null
          endereco?: string | null
          exibir_preco?: boolean | null
          id?: string
          imagem_capa_url?: string | null
          imagens_urls?: string[] | null
          landing_page_url?: string | null
          latitude?: number | null
          longitude?: number | null
          maps_embed_url?: string | null
          nome: string
          preco_a_partir?: number | null
          preco_a_partir_de?: number | null
          preco_ate?: number | null
          previsao_entrega?: string | null
          slug: string
          status_obra?: string | null
          status_venda?: string | null
          total_unidades?: number | null
          uf?: string | null
          unidades_disponiveis?: number | null
          updated_at?: string | null
          video_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          area_privativa_max?: number | null
          area_privativa_min?: number | null
          bairro?: string | null
          cep?: string | null
          cidade?: string
          construtora?: string | null
          construtora_id?: string | null
          created_at?: string | null
          descricao_completa?: string | null
          descricao_curta?: string | null
          endereco?: string | null
          exibir_preco?: boolean | null
          id?: string
          imagem_capa_url?: string | null
          imagens_urls?: string[] | null
          landing_page_url?: string | null
          latitude?: number | null
          longitude?: number | null
          maps_embed_url?: string | null
          nome?: string
          preco_a_partir?: number | null
          preco_a_partir_de?: number | null
          preco_ate?: number | null
          previsao_entrega?: string | null
          slug?: string
          status_obra?: string | null
          status_venda?: string | null
          total_unidades?: number | null
          uf?: string | null
          unidades_disponiveis?: number | null
          updated_at?: string | null
          video_url?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empreendimentos_construtora_id_fkey"
            columns: ["construtora_id"]
            isOneToOne: false
            referencedRelation: "construtoras"
            referencedColumns: ["id"]
          },
        ]
      }
      empreendimentos_tabelas_precos: {
        Row: {
          admin_id: string | null
          competencia: string
          created_at: string
          cub_valor_m2: number | null
          empreendimento_slug: string
          id: string
          nome_arquivo: string
          observacao: string | null
          storage_path: string
          tamanho_bytes: number | null
        }
        Insert: {
          admin_id?: string | null
          competencia: string
          created_at?: string
          cub_valor_m2?: number | null
          empreendimento_slug: string
          id?: string
          nome_arquivo: string
          observacao?: string | null
          storage_path: string
          tamanho_bytes?: number | null
        }
        Update: {
          admin_id?: string | null
          competencia?: string
          created_at?: string
          cub_valor_m2?: number | null
          empreendimento_slug?: string
          id?: string
          nome_arquivo?: string
          observacao?: string | null
          storage_path?: string
          tamanho_bytes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "empreendimentos_tabelas_precos_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      empreendimentos_unidades: {
        Row: {
          andar: number | null
          bloco: string | null
          condicoes_negociacao: string | null
          created_at: string
          cub_fator: number | null
          disponivel: boolean | null
          dormitorios: number | null
          empreendimento_id: string
          id: string
          lead_id_reserva: string | null
          metragem: number
          orientacao: string | null
          plano_pagamento: Json | null
          reservado_ate: string | null
          suites: number | null
          unidade: string
          updated_at: string
          valor_entrada_min: number | null
          valor_promocional: number | null
          valor_tabela: number | null
          vendida_em: string | null
        }
        Insert: {
          andar?: number | null
          bloco?: string | null
          condicoes_negociacao?: string | null
          created_at?: string
          cub_fator?: number | null
          disponivel?: boolean | null
          dormitorios?: number | null
          empreendimento_id: string
          id?: string
          lead_id_reserva?: string | null
          metragem?: number
          orientacao?: string | null
          plano_pagamento?: Json | null
          reservado_ate?: string | null
          suites?: number | null
          unidade: string
          updated_at?: string
          valor_entrada_min?: number | null
          valor_promocional?: number | null
          valor_tabela?: number | null
          vendida_em?: string | null
        }
        Update: {
          andar?: number | null
          bloco?: string | null
          condicoes_negociacao?: string | null
          created_at?: string
          cub_fator?: number | null
          disponivel?: boolean | null
          dormitorios?: number | null
          empreendimento_id?: string
          id?: string
          lead_id_reserva?: string | null
          metragem?: number
          orientacao?: string | null
          plano_pagamento?: Json | null
          reservado_ate?: string | null
          suites?: number | null
          unidade?: string
          updated_at?: string
          valor_entrada_min?: number | null
          valor_promocional?: number | null
          valor_tabela?: number | null
          vendida_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empreendimentos_unidades_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      ig_comment_automacao_cliques: {
        Row: {
          automacao_id: string
          button_index: number | null
          commenter_id: string | null
          created_at: string
          id: string
        }
        Insert: {
          automacao_id: string
          button_index?: number | null
          commenter_id?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          automacao_id?: string
          button_index?: number | null
          commenter_id?: string | null
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ig_comment_automacao_cliques_automacao_id_fkey"
            columns: ["automacao_id"]
            isOneToOne: false
            referencedRelation: "ig_comment_automacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      ig_comment_automacao_execucoes: {
        Row: {
          automacao_id: string
          comment_id: string | null
          comment_text: string | null
          commenter_id: string | null
          commenter_username: string | null
          created_at: string
          dm_status: string | null
          error: string | null
          id: string
          media_id: string | null
          public_reply_status: string | null
        }
        Insert: {
          automacao_id: string
          comment_id?: string | null
          comment_text?: string | null
          commenter_id?: string | null
          commenter_username?: string | null
          created_at?: string
          dm_status?: string | null
          error?: string | null
          id?: string
          media_id?: string | null
          public_reply_status?: string | null
        }
        Update: {
          automacao_id?: string
          comment_id?: string | null
          comment_text?: string | null
          commenter_id?: string | null
          commenter_username?: string | null
          created_at?: string
          dm_status?: string | null
          error?: string | null
          id?: string
          media_id?: string | null
          public_reply_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ig_comment_automacao_execucoes_automacao_id_fkey"
            columns: ["automacao_id"]
            isOneToOne: false
            referencedRelation: "ig_comment_automacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      ig_comment_automacao_pendentes: {
        Row: {
          automacao_id: string
          commenter_id: string
          created_at: string
          id: string
        }
        Insert: {
          automacao_id: string
          commenter_id: string
          created_at?: string
          id?: string
        }
        Update: {
          automacao_id?: string
          commenter_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ig_comment_automacao_pendentes_automacao_id_fkey"
            columns: ["automacao_id"]
            isOneToOne: false
            referencedRelation: "ig_comment_automacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      ig_comment_automacoes: {
        Row: {
          ativo: boolean
          created_at: string
          dm_buttons: Json
          dm_message: string | null
          follow_prompt: string | null
          id: string
          keywords: string[]
          match_type: string
          media_id: string | null
          nome: string
          only_once_per_user: boolean
          public_reply: string | null
          require_follow: boolean
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          dm_buttons?: Json
          dm_message?: string | null
          follow_prompt?: string | null
          id?: string
          keywords?: string[]
          match_type?: string
          media_id?: string | null
          nome: string
          only_once_per_user?: boolean
          public_reply?: string | null
          require_follow?: boolean
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          dm_buttons?: Json
          dm_message?: string | null
          follow_prompt?: string | null
          id?: string
          keywords?: string[]
          match_type?: string
          media_id?: string | null
          nome?: string
          only_once_per_user?: boolean
          public_reply?: string | null
          require_follow?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      ig_content_calendar: {
        Row: {
          alcance: number | null
          compartilhamentos: number | null
          created_at: string
          data: string | null
          id: string
          interacoes: number | null
          linha: string
          observacoes: string | null
          post_url: string | null
          roteiro: string | null
          status: string
          tipo: string
          titulo: string
          updated_at: string
          watch_time_seg: number | null
        }
        Insert: {
          alcance?: number | null
          compartilhamentos?: number | null
          created_at?: string
          data?: string | null
          id?: string
          interacoes?: number | null
          linha: string
          observacoes?: string | null
          post_url?: string | null
          roteiro?: string | null
          status?: string
          tipo: string
          titulo: string
          updated_at?: string
          watch_time_seg?: number | null
        }
        Update: {
          alcance?: number | null
          compartilhamentos?: number | null
          created_at?: string
          data?: string | null
          id?: string
          interacoes?: number | null
          linha?: string
          observacoes?: string | null
          post_url?: string | null
          roteiro?: string | null
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
          watch_time_seg?: number | null
        }
        Relationships: []
      }
      ig_metricas_semanais: {
        Row: {
          alcance: number | null
          alcance_educativo: number | null
          alcance_imovel: number | null
          cliques_bio: number | null
          created_at: string
          custo_por_visita: number | null
          gasto_ads: number | null
          id: string
          leads_qualificados: number | null
          novos_seguidores: number | null
          novos_seguidores_locais: number | null
          observacoes: string | null
          seguidores: number | null
          semana_inicio: string
          taxa_engajamento: number | null
          tempo_resposta_medio_min: number | null
          updated_at: string
          visitas_perfil: number | null
        }
        Insert: {
          alcance?: number | null
          alcance_educativo?: number | null
          alcance_imovel?: number | null
          cliques_bio?: number | null
          created_at?: string
          custo_por_visita?: number | null
          gasto_ads?: number | null
          id?: string
          leads_qualificados?: number | null
          novos_seguidores?: number | null
          novos_seguidores_locais?: number | null
          observacoes?: string | null
          seguidores?: number | null
          semana_inicio: string
          taxa_engajamento?: number | null
          tempo_resposta_medio_min?: number | null
          updated_at?: string
          visitas_perfil?: number | null
        }
        Update: {
          alcance?: number | null
          alcance_educativo?: number | null
          alcance_imovel?: number | null
          cliques_bio?: number | null
          created_at?: string
          custo_por_visita?: number | null
          gasto_ads?: number | null
          id?: string
          leads_qualificados?: number | null
          novos_seguidores?: number | null
          novos_seguidores_locais?: number | null
          observacoes?: string | null
          seguidores?: number | null
          semana_inicio?: string
          taxa_engajamento?: number | null
          tempo_resposta_medio_min?: number | null
          updated_at?: string
          visitas_perfil?: number | null
        }
        Relationships: []
      }
      interacoes: {
        Row: {
          canal: string | null
          created_at: string | null
          direcao: string
          id: string
          intencao_detectada: string | null
          lead_id: string | null
          mensagem: string
          mid: string | null
          processado_por_ia: boolean | null
          sentimento: string | null
        }
        Insert: {
          canal?: string | null
          created_at?: string | null
          direcao: string
          id?: string
          intencao_detectada?: string | null
          lead_id?: string | null
          mensagem: string
          mid?: string | null
          processado_por_ia?: boolean | null
          sentimento?: string | null
        }
        Update: {
          canal?: string | null
          created_at?: string | null
          direcao?: string
          id?: string
          intencao_detectada?: string | null
          lead_id?: string | null
          mensagem?: string
          mid?: string | null
          processado_por_ia?: boolean | null
          sentimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interacoes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_access_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          last_seen_at: string
          lead_id: string
          revoked_at: string | null
          token_hash: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          last_seen_at?: string
          lead_id: string
          revoked_at?: string | null
          token_hash: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          last_seen_at?: string
          lead_id?: string
          revoked_at?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_access_sessions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_eventos: {
        Row: {
          anon_id: string | null
          client_event_id: string | null
          created_at: string | null
          id: string
          lead_id: string | null
          property_id: string | null
          slug: string | null
          tipo: string
        }
        Insert: {
          anon_id?: string | null
          client_event_id?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          property_id?: string | null
          slug?: string | null
          tipo: string
        }
        Update: {
          anon_id?: string | null
          client_event_id?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          property_id?: string | null
          slug?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_eventos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_eventos_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_identity_conflicts: {
        Row: {
          detected_at: string
          email: string | null
          id: string
          lead_id_a: string
          lead_id_b: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          whatsapp: string | null
        }
        Insert: {
          detected_at?: string
          email?: string | null
          id?: string
          lead_id_a: string
          lead_id_b: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          whatsapp?: string | null
        }
        Update: {
          detected_at?: string
          email?: string | null
          id?: string
          lead_id_a?: string
          lead_id_b?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_identity_conflicts_lead_a_fkey"
            columns: ["lead_id_a"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_identity_conflicts_lead_b_fkey"
            columns: ["lead_id_b"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_identity_conflicts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_interacoes: {
        Row: {
          created_at: string | null
          descricao: string
          id: string
          lead_id: string | null
          tipo: string | null
        }
        Insert: {
          created_at?: string | null
          descricao: string
          id?: string
          lead_id?: string | null
          tipo?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string
          id?: string
          lead_id?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      lead_property_interests: {
        Row: {
          availability_viewed_at: string | null
          catalog_downloaded_at: string | null
          created_at: string
          fbclid: string | null
          first_seen_at: string
          floorplan_viewed_at: string | null
          gallery_viewed_at: string | null
          gclid: string | null
          id: string
          last_seen_at: string
          last_view_counted_at: string | null
          lead_id: string
          property_id: string
          property_slug: string
          source: string | null
          unlocked_at: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          view_count: number
          whatsapp_clicked_at: string | null
        }
        Insert: {
          availability_viewed_at?: string | null
          catalog_downloaded_at?: string | null
          created_at?: string
          fbclid?: string | null
          first_seen_at?: string
          floorplan_viewed_at?: string | null
          gallery_viewed_at?: string | null
          gclid?: string | null
          id?: string
          last_seen_at?: string
          last_view_counted_at?: string | null
          lead_id: string
          property_id: string
          property_slug: string
          source?: string | null
          unlocked_at?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          view_count?: number
          whatsapp_clicked_at?: string | null
        }
        Update: {
          availability_viewed_at?: string | null
          catalog_downloaded_at?: string | null
          created_at?: string
          fbclid?: string | null
          first_seen_at?: string
          floorplan_viewed_at?: string | null
          gallery_viewed_at?: string | null
          gclid?: string | null
          id?: string
          last_seen_at?: string
          last_view_counted_at?: string | null
          lead_id?: string
          property_id?: string
          property_slug?: string
          source?: string | null
          unlocked_at?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          view_count?: number
          whatsapp_clicked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_property_interests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_property_interests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          alerta_sem_atendimento: boolean | null
          anotacoes: string | null
          atendimento_humano_ativo: boolean
          cidade_interesse: string | null
          cliente_id: string | null
          contacted: boolean | null
          created_at: string | null
          email: string | null
          email_followup_em: string | null
          email_followup_etapa: number
          empreendimento_interesse: string | null
          entrada_disponivel: string | null
          estagio_funil: string | null
          faixa_investimento: string | null
          fbclid: string | null
          gclid: string | null
          id: string
          kanban_ordem: number | null
          lead_score: number | null
          lead_score_atualizado_em: string | null
          lead_score_detalhe: Json
          motivacao: string | null
          nome: string | null
          observacoes_ia: string | null
          orcamento_max: number | null
          orcamento_min: number | null
          origem: string | null
          perfil: string | null
          permuta_descricao: string | null
          permuta_valor: number | null
          prazo_compra: string | null
          primeiro_atendimento_em: string | null
          property_id: string | null
          property_name: string | null
          proximo_followup: string | null
          requer_atencao: boolean | null
          source: string | null
          status: string | null
          temperatura: number | null
          tentativas_followup: number | null
          ultimo_contato: string | null
          unsubscribe_motivo: string | null
          unsubscribed_at: string | null
          updated_at: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          whatsapp: string
          whatsapp_optout_at: string | null
          whatsapp_optout_motivo: string | null
          whatsapp_original_pre_normalize: string | null
        }
        Insert: {
          alerta_sem_atendimento?: boolean | null
          anotacoes?: string | null
          atendimento_humano_ativo?: boolean
          cidade_interesse?: string | null
          cliente_id?: string | null
          contacted?: boolean | null
          created_at?: string | null
          email?: string | null
          email_followup_em?: string | null
          email_followup_etapa?: number
          empreendimento_interesse?: string | null
          entrada_disponivel?: string | null
          estagio_funil?: string | null
          faixa_investimento?: string | null
          fbclid?: string | null
          gclid?: string | null
          id?: string
          kanban_ordem?: number | null
          lead_score?: number | null
          lead_score_atualizado_em?: string | null
          lead_score_detalhe?: Json
          motivacao?: string | null
          nome?: string | null
          observacoes_ia?: string | null
          orcamento_max?: number | null
          orcamento_min?: number | null
          origem?: string | null
          perfil?: string | null
          permuta_descricao?: string | null
          permuta_valor?: number | null
          prazo_compra?: string | null
          primeiro_atendimento_em?: string | null
          property_id?: string | null
          property_name?: string | null
          proximo_followup?: string | null
          requer_atencao?: boolean | null
          source?: string | null
          status?: string | null
          temperatura?: number | null
          tentativas_followup?: number | null
          ultimo_contato?: string | null
          unsubscribe_motivo?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp: string
          whatsapp_optout_at?: string | null
          whatsapp_optout_motivo?: string | null
          whatsapp_original_pre_normalize?: string | null
        }
        Update: {
          alerta_sem_atendimento?: boolean | null
          anotacoes?: string | null
          atendimento_humano_ativo?: boolean
          cidade_interesse?: string | null
          cliente_id?: string | null
          contacted?: boolean | null
          created_at?: string | null
          email?: string | null
          email_followup_em?: string | null
          email_followup_etapa?: number
          empreendimento_interesse?: string | null
          entrada_disponivel?: string | null
          estagio_funil?: string | null
          faixa_investimento?: string | null
          fbclid?: string | null
          gclid?: string | null
          id?: string
          kanban_ordem?: number | null
          lead_score?: number | null
          lead_score_atualizado_em?: string | null
          lead_score_detalhe?: Json
          motivacao?: string | null
          nome?: string | null
          observacoes_ia?: string | null
          orcamento_max?: number | null
          orcamento_min?: number | null
          origem?: string | null
          perfil?: string | null
          permuta_descricao?: string | null
          permuta_valor?: number | null
          prazo_compra?: string | null
          primeiro_atendimento_em?: string | null
          property_id?: string | null
          property_name?: string | null
          proximo_followup?: string | null
          requer_atencao?: boolean | null
          source?: string | null
          status?: string | null
          temperatura?: number | null
          tentativas_followup?: number | null
          ultimo_contato?: string | null
          unsubscribe_motivo?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp?: string
          whatsapp_optout_at?: string | null
          whatsapp_optout_motivo?: string | null
          whatsapp_original_pre_normalize?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "crm_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_empreendimento_interesse_fkey"
            columns: ["empreendimento_interesse"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_interacoes: {
        Row: {
          admin_id: string | null
          client_event_id: string | null
          created_at: string
          descricao: string
          estagio_de: string | null
          estagio_para: string | null
          id: string
          lead_id: string
          tipo: string
        }
        Insert: {
          admin_id?: string | null
          client_event_id?: string | null
          created_at?: string
          descricao: string
          estagio_de?: string | null
          estagio_para?: string | null
          id?: string
          lead_id: string
          tipo?: string
        }
        Update: {
          admin_id?: string | null
          client_event_id?: string | null
          created_at?: string
          descricao?: string
          estagio_de?: string | null
          estagio_para?: string | null
          id?: string
          lead_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_interacoes_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_interacoes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          admin_id: string | null
          created_at: string | null
          expires_at: string
          id: string
          token: string
          used: boolean | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          used?: boolean | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_tokens_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          aceita_financiamento: boolean
          aceita_permuta: boolean
          ativo: boolean | null
          bairro: string | null
          book_pdf_url: string | null
          cidade: string | null
          comodidades: string[]
          construtora_slug: string
          cor_acento: string | null
          corretor_captador_id: string | null
          cover_image_url: string | null
          descricao: string | null
          descricao_curta: string | null
          diferenciais: string[] | null
          dormitorios: string | null
          endereco: string | null
          exibir_preco: boolean | null
          faq: Json | null
          frase: string | null
          galeria: string[] | null
          id: string
          lazer: string[] | null
          metragem: string | null
          mobilia: string | null
          nome: string | null
          oculto: boolean | null
          ordem: number | null
          origem: string | null
          parcelamento_construtora: boolean
          plantas: string[] | null
          preco: number | null
          previsao_entrega: string | null
          slug: string
          status: string | null
          status_venda: string
          suites: string | null
          uf: string | null
          vagas: string | null
          video_url: string | null
        }
        Insert: {
          aceita_financiamento?: boolean
          aceita_permuta?: boolean
          ativo?: boolean | null
          bairro?: string | null
          book_pdf_url?: string | null
          cidade?: string | null
          comodidades?: string[]
          construtora_slug: string
          cor_acento?: string | null
          corretor_captador_id?: string | null
          cover_image_url?: string | null
          descricao?: string | null
          descricao_curta?: string | null
          diferenciais?: string[] | null
          dormitorios?: string | null
          endereco?: string | null
          exibir_preco?: boolean | null
          faq?: Json | null
          frase?: string | null
          galeria?: string[] | null
          id?: string
          lazer?: string[] | null
          metragem?: string | null
          mobilia?: string | null
          nome?: string | null
          oculto?: boolean | null
          ordem?: number | null
          origem?: string | null
          parcelamento_construtora?: boolean
          plantas?: string[] | null
          preco?: number | null
          previsao_entrega?: string | null
          slug: string
          status?: string | null
          status_venda?: string
          suites?: string | null
          uf?: string | null
          vagas?: string | null
          video_url?: string | null
        }
        Update: {
          aceita_financiamento?: boolean
          aceita_permuta?: boolean
          ativo?: boolean | null
          bairro?: string | null
          book_pdf_url?: string | null
          cidade?: string | null
          comodidades?: string[]
          construtora_slug?: string
          cor_acento?: string | null
          corretor_captador_id?: string | null
          cover_image_url?: string | null
          descricao?: string | null
          descricao_curta?: string | null
          diferenciais?: string[] | null
          dormitorios?: string | null
          endereco?: string | null
          exibir_preco?: boolean | null
          faq?: Json | null
          frase?: string | null
          galeria?: string[] | null
          id?: string
          lazer?: string[] | null
          metragem?: string | null
          mobilia?: string | null
          nome?: string | null
          oculto?: boolean | null
          ordem?: number | null
          origem?: string | null
          parcelamento_construtora?: boolean
          plantas?: string[] | null
          preco?: number | null
          previsao_entrega?: string | null
          slug?: string
          status?: string | null
          status_venda?: string
          suites?: string | null
          uf?: string | null
          vagas?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_corretor_captador_id_fkey"
            columns: ["corretor_captador_id"]
            isOneToOne: false
            referencedRelation: "crm_corretores"
            referencedColumns: ["id"]
          },
        ]
      }
      properties_fotos: {
        Row: {
          admin_id: string | null
          altura_original: number | null
          created_at: string
          id: string
          largura_original: number | null
          ordem: number
          processado_em: string | null
          property_id: string
          storage_path_original: string
          storage_path_processada: string | null
        }
        Insert: {
          admin_id?: string | null
          altura_original?: number | null
          created_at?: string
          id?: string
          largura_original?: number | null
          ordem?: number
          processado_em?: string | null
          property_id: string
          storage_path_original: string
          storage_path_processada?: string | null
        }
        Update: {
          admin_id?: string | null
          altura_original?: number | null
          created_at?: string
          id?: string
          largura_original?: number | null
          ordem?: number
          processado_em?: string | null
          property_id?: string
          storage_path_original?: string
          storage_path_processada?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_fotos_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_fotos_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      prospeccao_campanhas: {
        Row: {
          abordagem: string | null
          admin_id: string | null
          alvo: string | null
          created_at: string
          criterios: Json
          estrategia: string | null
          exemplos: string | null
          id: string
          leads_entregues: number
          leads_solicitados: number
          localizacao: string | null
          nome: string
          problema: string | null
          produto: string
          publico: string | null
          queries_busca: Json
          status: string
          updated_at: string
        }
        Insert: {
          abordagem?: string | null
          admin_id?: string | null
          alvo?: string | null
          created_at?: string
          criterios?: Json
          estrategia?: string | null
          exemplos?: string | null
          id?: string
          leads_entregues?: number
          leads_solicitados?: number
          localizacao?: string | null
          nome: string
          problema?: string | null
          produto: string
          publico?: string | null
          queries_busca?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          abordagem?: string | null
          admin_id?: string | null
          alvo?: string | null
          created_at?: string
          criterios?: Json
          estrategia?: string | null
          exemplos?: string | null
          id?: string
          leads_entregues?: number
          leads_solicitados?: number
          localizacao?: string | null
          nome?: string
          problema?: string | null
          produto?: string
          publico?: string | null
          queries_busca?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospeccao_campanhas_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      prospeccao_leads: {
        Row: {
          campanha_id: string
          classificacao: string | null
          cnpj: string | null
          contexto_ia: string | null
          created_at: string
          endereco: string | null
          id: string
          lead_id: string | null
          nome: string
          place_id: string
          rating: number | null
          rating_count: number | null
          razao_social: string | null
          score: number | null
          score_acessibilidade: number | null
          score_fit: number | null
          score_potencial: number | null
          site: string | null
          situacao_cnpj: string | null
          socios: Json | null
          status: string
          telefone: string | null
          tipos: Json
        }
        Insert: {
          campanha_id: string
          classificacao?: string | null
          cnpj?: string | null
          contexto_ia?: string | null
          created_at?: string
          endereco?: string | null
          id?: string
          lead_id?: string | null
          nome: string
          place_id: string
          rating?: number | null
          rating_count?: number | null
          razao_social?: string | null
          score?: number | null
          score_acessibilidade?: number | null
          score_fit?: number | null
          score_potencial?: number | null
          site?: string | null
          situacao_cnpj?: string | null
          socios?: Json | null
          status?: string
          telefone?: string | null
          tipos?: Json
        }
        Update: {
          campanha_id?: string
          classificacao?: string | null
          cnpj?: string | null
          contexto_ia?: string | null
          created_at?: string
          endereco?: string | null
          id?: string
          lead_id?: string | null
          nome?: string
          place_id?: string
          rating?: number | null
          rating_count?: number | null
          razao_social?: string | null
          score?: number | null
          score_acessibilidade?: number | null
          score_fit?: number | null
          score_potencial?: number | null
          site?: string | null
          situacao_cnpj?: string | null
          socios?: Json | null
          status?: string
          telefone?: string | null
          tipos?: Json
        }
        Relationships: [
          {
            foreignKeyName: "prospeccao_leads_campanha_id_fkey"
            columns: ["campanha_id"]
            isOneToOne: false
            referencedRelation: "prospeccao_campanhas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospeccao_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      tipologias: {
        Row: {
          area_privativa_m2: number | null
          area_total_m2: number | null
          created_at: string | null
          dormitorios: number | null
          empreendimento_id: string | null
          id: string
          nome: string
          planta_url: string | null
          preco_a_partir_de: number | null
          preco_ate: number | null
          suites: number | null
          unidades_disponiveis: number | null
          vagas: number | null
        }
        Insert: {
          area_privativa_m2?: number | null
          area_total_m2?: number | null
          created_at?: string | null
          dormitorios?: number | null
          empreendimento_id?: string | null
          id?: string
          nome: string
          planta_url?: string | null
          preco_a_partir_de?: number | null
          preco_ate?: number | null
          suites?: number | null
          unidades_disponiveis?: number | null
          vagas?: number | null
        }
        Update: {
          area_privativa_m2?: number | null
          area_total_m2?: number | null
          created_at?: string | null
          dormitorios?: number | null
          empreendimento_id?: string | null
          id?: string
          nome?: string
          planta_url?: string | null
          preco_a_partir_de?: number | null
          preco_ate?: number | null
          suites?: number | null
          unidades_disponiveis?: number | null
          vagas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tipologias_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      advance_focus_session_lead: {
        Args: {
          p_action_type: string
          p_admin_id: string
          p_client_event_id: string
          p_is_primary: boolean
          p_is_skip: boolean
          p_lead_id: string
          p_metadata: Json
          p_next_stage: string
          p_points: number
          p_previous_stage: string
          p_session_id: string
          p_snoozed_until?: string
          p_target_status?: string
        }
        Returns: Json
      }
      cancel_alert: { Args: { p_token: string }; Returns: undefined }
      definir_participantes_comissao: {
        Args: { p_comissao_id: string; p_participantes: Json }
        Returns: undefined
      }
      leads_parados: {
        Args: { p_dias_min?: number; p_limite?: number }
        Returns: {
          dias_parado: number
          estagio_funil: string
          lead_id: string
          lead_score: number
          nome: string
          origem: string
          ultima_movimentacao: string
          whatsapp: string
        }[]
      }
      meta_diaria_agregados: { Args: { p_dias?: number }; Returns: Json }
      portfolio_precos_referencia: { Args: never; Returns: Json }
      record_focus_event: {
        Args: {
          p_action_type: string
          p_admin_id: string
          p_client_event_id: string
          p_is_primary: boolean
          p_is_skip: boolean
          p_lead_id: string
          p_metadata: Json
          p_next_stage: string
          p_points: number
          p_previous_stage: string
          p_session_id: string
        }
        Returns: Json
      }
      record_property_interest: {
        Args: {
          p_event_type: string
          p_fbclid: string
          p_gclid: string
          p_lead_id: string
          p_property_id: string
          p_property_slug: string
          p_source: string
          p_utm_campaign: string
          p_utm_medium: string
          p_utm_source: string
          p_view_dedup_minutes?: number
        }
        Returns: undefined
      }
      relatorio_vendas: { Args: { p_ate: string; p_de: string }; Returns: Json }
      resolve_lead_for_gate: {
        Args: {
          p_email: string
          p_entrada_disponivel: string
          p_faixa_investimento: string
          p_fbclid: string
          p_gclid: string
          p_nome: string
          p_prazo_compra: string
          p_property_id: string
          p_property_name: string
          p_source: string
          p_utm_campaign: string
          p_utm_content: string
          p_utm_medium: string
          p_utm_source: string
          p_utm_term: string
          p_whatsapp: string
        }
        Returns: Json
      }
      resumo_atividades_dia: {
        Args: { p_admin_id: string; p_data: string }
        Returns: Json
      }
      resumo_atividades_periodo: {
        Args: { p_admin_id: string; p_ate: string; p_de: string }
        Returns: Json
      }
      score_operacao_agregados: { Args: never; Returns: Json }
      sinais_lead_score: { Args: { p_lead_ids: string[] }; Returns: Json }
      start_focus_session: {
        Args: { p_admin_id: string; p_filtros: Json; p_lead_ids: string[] }
        Returns: Json
      }
      sum_focus_points_month: { Args: { p_admin_id: string }; Returns: number }
      tempo_medio_movimentacoes: {
        Args: { p_ate: string; p_de: string; p_limite?: number }
        Returns: {
          estagio_funil: string
          lead_id: string
          media_horas: number
          movimentacoes: number
          nome: string
          whatsapp: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
