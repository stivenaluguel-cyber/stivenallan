-- Mesmo complemento manual de resumo_atividades_dia, aqui pro período (usado
-- no calendário histórico) — sem isso, um dia passado com complemento manual
-- de novos_contatos/followups/visitas seria selado com o número errado.
CREATE OR REPLACE FUNCTION public.resumo_atividades_periodo(p_admin_id uuid, p_de date, p_ate date)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
  with dias as (
    select generate_series(p_de, p_ate, interval '1 day')::date as dia
  ),
  eventos as (
    select ((created_at at time zone 'America/Sao_Paulo')::date) as dia, action_type, count(*) as n
    from crm_focus_events
    where admin_id = p_admin_id
      and created_at >= (p_de::timestamp at time zone 'America/Sao_Paulo')
      and created_at < ((p_ate + 1)::timestamp at time zone 'America/Sao_Paulo')
    group by 1, 2
  ),
  visitas as (
    select ((updated_at at time zone 'America/Sao_Paulo')::date) as dia, count(*) as n
    from crm_agenda
    where admin_id = p_admin_id and tipo = 'visita' and status = 'concluido'
      and updated_at >= (p_de::timestamp at time zone 'America/Sao_Paulo')
      and updated_at < ((p_ate + 1)::timestamp at time zone 'America/Sao_Paulo')
    group by 1
  ),
  manuais as (
    select "data" as dia, tipo, sum(quantidade)::int as n
    from crm_atividades_manuais
    where admin_id = p_admin_id and "data" between p_de and p_ate
    group by 1, 2
  )
  select coalesce(
    jsonb_object_agg(
      to_char(dias.dia, 'YYYY-MM-DD'),
      jsonb_build_object(
        'novos_contatos', coalesce((select n from eventos where eventos.dia = dias.dia and action_type = 'contato_confirmado'), 0) + coalesce((select n from manuais where manuais.dia = dias.dia and tipo = 'novos_contatos'), 0),
        'followups',      coalesce((select n from eventos where eventos.dia = dias.dia and action_type = 'followup_agendado'), 0) + coalesce((select n from manuais where manuais.dia = dias.dia and tipo = 'followups'), 0),
        'visitas',        coalesce((select n from visitas where visitas.dia = dias.dia), 0) + coalesce((select n from manuais where manuais.dia = dias.dia and tipo = 'visitas'), 0),
        'conteudos',      coalesce((select n from manuais where manuais.dia = dias.dia and tipo = 'conteudo'), 0),
        'reunioes',       coalesce((select n from manuais where manuais.dia = dias.dia and tipo = 'reuniao_presencial'), 0)
      )
    ),
    '{}'::jsonb
  )
  from dias;
$function$;
