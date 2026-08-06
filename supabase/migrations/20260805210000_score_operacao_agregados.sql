-- Score de Operação (dashboard): uma única RPC que devolve, num round-trip
-- só, todos os agregados que a fórmula em src/lib/score/operacao.ts precisa.
-- Sem isso o card faria 6+ selects separados a cada carregamento — aqui é
-- uma chamada, o Postgres soma tudo de uma vez.
--
-- `disponivel = true` em empreendimentos_unidades significa "ainda não
-- vendida" (ver comentário em src/lib/unidades/espelho.ts) — é o que usamos
-- como "unidade ativa" tanto pro Portfólio quanto pra Diversificação.
create or replace function public.score_operacao_agregados()
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'interacoes7d', (
      select count(*) from public.leads_interacoes
      where created_at >= now() - interval '7 days'
    ),
    'unidadesAtivas', (
      select count(*) from public.empreendimentos_unidades
      where disponivel
    ),
    'empreendimentosDistintos', (
      select count(distinct empreendimento_id) from public.empreendimentos_unidades
      where disponivel
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
