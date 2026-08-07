import { describe, expect, it } from 'vitest'
import type { Database } from './database.generated'

// Testes de TIPO pro Database OFICIAL (gerado de verdade pelo Supabase CLI —
// ver cabeçalho de ./database.generated.ts). A validação que importa
// acontece em `npx tsc --noEmit` — se este arquivo não compilar, o types
// mudou de forma incompatível. As asserções em runtime são propositalmente
// triviais (o valor real está em o TypeScript aceitar/rejeitar as
// atribuições, não no que `expect()` verifica).

type LeadRow = Database['public']['Tables']['leads']['Row']
type LeadInsert = Database['public']['Tables']['leads']['Insert']
type LeadUpdate = Database['public']['Tables']['leads']['Update']
type PropertyRow = Database['public']['Tables']['properties']['Row']
type AdminUserRow = Database['public']['Tables']['admin_users']['Row']

describe('Database gerado — leads', () => {
  it('1) colunas reais de leads compilam: whatsapp, estagio_funil, lead_score (não "telefone")', () => {
    const lead: LeadRow = {
      id: 'lead-1',
      whatsapp: '5548999999999',
      nome: null,
      email: null,
      perfil: null,
      orcamento_min: null,
      orcamento_max: null,
      prazo_compra: null,
      cidade_interesse: null,
      estagio_funil: 'primeiro_contato',
      status: 'novo',
      lead_score: 42,
      requer_atencao: false,
      empreendimento_interesse: null,
      tentativas_followup: 0,
      ultimo_contato: null,
      proximo_followup: null,
      origem: 'whatsapp',
      observacoes_ia: null,
      motivacao: null,
      created_at: null,
      updated_at: null,
      kanban_ordem: 0,
      temperatura: 3,
      cliente_id: null,
      primeiro_atendimento_em: null,
      alerta_sem_atendimento: false,
      property_id: null,
      property_name: null,
      source: 'book_download',
      contacted: false,
      anotacoes: null,
      faixa_investimento: null,
      entrada_disponivel: null,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
      gclid: null,
      fbclid: null,
      email_followup_etapa: 0,
      email_followup_em: null,
      unsubscribed_at: null,
      whatsapp_original_pre_normalize: null,
      atendimento_humano_ativo: false,
      unsubscribe_motivo: null,
      lead_score_detalhe: {},
      lead_score_atualizado_em: null,
      permuta_descricao: null,
      permuta_valor: null,
      whatsapp_optout_at: null,
      whatsapp_optout_motivo: null,
    }
    expect(lead.whatsapp).toBe('5548999999999')
    expect(lead.estagio_funil).toBe('primeiro_contato')
    expect(lead.lead_score).toBe(42)
  })

  it('2) Insert de leads: só whatsapp é obrigatório (todo o resto tem default ou é nullable)', () => {
    const insertMinimo: LeadInsert = { whatsapp: '5548999999999' }
    expect(insertMinimo.whatsapp).toBe('5548999999999')
  })

  it('2b) Update de leads: tudo opcional, {} é um Update válido', () => {
    const updateVazio: LeadUpdate = {}
    expect(updateVazio).toEqual({})
  })

  it('4) coluna inexistente ("telefone", nome do tipo manual antigo) é rejeitada pelo TypeScript', () => {
    // @ts-expect-error — "telefone" nunca foi uma coluna real de `leads`
    // (era só o tipo manual antigo, desatualizado). Se esta linha compilar
    // sem erro, os tipos regrediram e pararam de proteger contra reintroduzir
    // esse engano histórico específico.
    const insertComColunaInexistente: LeadInsert = { whatsapp: '5548999999999', telefone: '123' }
    expect(insertComColunaInexistente).toBeDefined()
  })
})

describe('Database gerado — properties', () => {
  it('3) colunas atuais de properties (tabela unificada, não "empreendimentos" legado) aparecem no tipo', () => {
    const propriedade: Pick<PropertyRow, 'slug' | 'construtora_slug' | 'aceita_financiamento' | 'status_venda' | 'comodidades'> = {
      slug: 'exemplo-criciuma-sc',
      construtora_slug: 'fontana',
      aceita_financiamento: true,
      status_venda: 'ativo',
      comodidades: ['piscina', 'churrasqueira'],
    }
    expect(propriedade.slug).toBe('exemplo-criciuma-sc')
    expect(propriedade.aceita_financiamento).toBe(true)
  })

  it('coluna inexistente em properties é rejeitada pelo TypeScript', () => {
    // @ts-expect-error — "preco_a_partir" era do tipo manual antigo de
    // `empreendimentos` (tabela legada) — em `properties` a coluna real
    // equivalente é "preco".
    const propriedadeErrada: Pick<PropertyRow, 'slug'> = { slug: 'x', preco_a_partir: 100 }
    expect(propriedadeErrada).toBeDefined()
  })
})

describe('Database gerado — admin_users', () => {
  it('3b) admin_users expõe email/senha_hash/nome, sem campos inventados', () => {
    const admin: Pick<AdminUserRow, 'email' | 'senha_hash' | 'nome'> = {
      email: 'admin@stivenallan.com.br',
      senha_hash: '$2a$10$hashDeExemploNuncaUmaSenhaReal',
      nome: 'Stiven Allan',
    }
    expect(admin.email).toContain('@')
  })
})
