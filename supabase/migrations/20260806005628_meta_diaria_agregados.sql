-- Agregado por dia pra alimentar o card de Meta Diária (lib/metas/diaria.ts)
-- — mesmo padrão de score_operacao_agregados: uma RPC só, sem N+1 no client.
--
-- Mesma definição de follow-up do componente Frequência do Score: tipo IN
-- ('nota', 'proposta') — manter em sincronia manual com
-- TIPOS_FOLLOWUP_ATIVO em src/lib/score/interacoes.ts (motivo de cada
-- exclusão documentado lá).
--
-- Sem filtro por admin_id: nenhuma das rotas que gravam 'nota'/'proposta'
-- em leads_interacoes grava admin_id hoje (gap real do sistema, não deste
-- código) — e como esta é uma operação solo (um único admin_users), a
-- contagem já é, na prática, só do corretor.
--
-- `p_dias`: janela de quantos dias pra trás olhar. Default 60 é generoso
-- pro streak (calcularStreak também tem um teto próprio de 365, mas nunca
-- vê dado além do que esta RPC devolver) sem escanear a tabela inteira pra
-- sempre. Só dias com pelo menos 1 follow-up aparecem no jsonb — dia
-- ausente é 0 na leitura (ver comentário em calcularFitaSemanal).
create or replace function public.meta_diaria_agregados(p_dias integer default 60)
returns jsonb
language sql
stable
as $$
  select coalesce(
    jsonb_object_agg(dia, qtd),
    '{}'::jsonb
  )
  from (
    select
      (created_at at time zone 'America/Sao_Paulo')::date::text as dia,
      count(*) as qtd
    from public.leads_interacoes
    where tipo in ('nota', 'proposta')
      and created_at >= now() - (p_dias || ' days')::interval
    group by 1
  ) contagem;
$$;

grant execute on function public.meta_diaria_agregados(integer) to service_role;
