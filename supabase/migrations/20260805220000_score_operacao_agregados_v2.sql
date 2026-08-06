-- Recalibração do Score de Operação (ago/2026), duas mudanças:
--
-- 1. Portfólio removido. Não existe coluna de publicação/destaque em
--    empreendimentos_unidades nem em empreendimentos — "disponivel" só
--    distingue vendida/não-vendida, e as 578 unidades entraram num único
--    import em lote, então o componente ficava saturado (25/25) pra
--    sempre e não media nada do esforço do corretor. Ver comentário em
--    src/lib/score/operacao.ts.
--
-- 2. `interacoes7d` virou `followups7d`: em vez de contar QUALQUER linha de
--    leads_interacoes, conta só as que representam contato humano
--    deliberado do corretor. A lista de tipos ('nota', 'proposta') tem que
--    ficar em sincronia manual com TIPOS_FOLLOWUP_ATIVO em
--    src/lib/score/interacoes.ts — não dá pra compartilhar a constante
--    entre SQL e TS, mas o motivo de cada exclusão está documentado lá:
--    'simulacao' e 'reserva' são majoritariamente (ou só) o lead mexendo
--    sozinho nas rotas públicas do espelho, sem corretor envolvido;
--    'status_change' é mudança de estágio (automática ou humana, mas não é
--    "contato"); 'proposta_aceita' é o resultado da 'proposta' já contada,
--    não um contato novo.
--
-- 3. Diversificação trocou de fonte: em vez de empreendimentos com unidade
--    disponivel (que também saturava, 33 de 39 sempre disponíveis), conta
--    empreendimentos distintos que geraram lead de verdade
--    (leads.empreendimento_interesse) nos últimos 90 dias — mede alcance
--    comercial, não tamanho do inventário importado.
create or replace function public.score_operacao_agregados()
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'followups7d', (
      select count(*) from public.leads_interacoes
      where created_at >= now() - interval '7 days'
        and tipo in ('nota', 'proposta')
    ),
    'empreendimentosComLead90d', (
      select count(distinct empreendimento_interesse) from public.leads
      where created_at >= now() - interval '90 days'
        and empreendimento_interesse is not null
    ),
    'leads30dTotal', (
      select count(*) from public.leads
      where created_at >= now() - interval '30 days'
    ),
    'leads30dAtendidos1h', (
      select count(*) from public.leads
      where created_at >= now() - interval '30 days'
        and primeiro_atendimento_em is not null
        and primeiro_atendimento_em - created_at < interval '1 hour'
    ),
    'leadsParados', (
      select count(*) from public.leads where requer_atencao
    ),
    'leadsTotal', (
      select count(*) from public.leads
    ),
    'unidadesTotal', (
      select count(*) from public.empreendimentos_unidades
    )
  )
$$;

grant execute on function public.score_operacao_agregados() to service_role;
