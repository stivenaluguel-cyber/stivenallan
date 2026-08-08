-- Permite complemento manual pra novos_contatos/followups/visitas, somado
-- ao automático (não substitui) — corretor pode registrar atividade real
-- feita fora do sistema, sem perder a contagem automática de verdade.
CREATE OR REPLACE FUNCTION public.resumo_atividades_dia(p_admin_id uuid, p_data date)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
  with limites as (
    select
      (p_data::timestamp at time zone 'America/Sao_Paulo') as ini,
      ((p_data + 1)::timestamp at time zone 'America/Sao_Paulo') as fim
  ),
  eventos as (
    select action_type, count(*) as n
    from crm_focus_events, limites
    where admin_id = p_admin_id and created_at >= limites.ini and created_at < limites.fim
    group by action_type
  ),
  visitas_agenda as (
    select count(*) as n
    from crm_agenda, limites
    where admin_id = p_admin_id and tipo = 'visita' and status = 'concluido'
      and updated_at >= limites.ini and updated_at < limites.fim
  ),
  manuais as (
    select tipo, sum(quantidade)::int as n
    from crm_atividades_manuais
    where admin_id = p_admin_id and "data" = p_data
    group by tipo
  )
  select jsonb_build_object(
    'novos_contatos', coalesce((select n from eventos where action_type = 'contato_confirmado'), 0) + coalesce((select n from manuais where tipo = 'novos_contatos'), 0),
    'followups',      coalesce((select n from eventos where action_type = 'followup_agendado'), 0) + coalesce((select n from manuais where tipo = 'followups'), 0),
    'visitas',        coalesce((select n from visitas_agenda), 0) + coalesce((select n from manuais where tipo = 'visitas'), 0),
    'conteudos',      coalesce((select n from manuais where tipo = 'conteudo'), 0),
    'reunioes',       coalesce((select n from manuais where tipo = 'reuniao_presencial'), 0)
  );
$function$;
