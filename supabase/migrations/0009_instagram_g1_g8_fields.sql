-- 0009_instagram_g1_g8_fields.sql
-- Fecha os gatilhos G1 (custo por visita do criativo ativo) e G8 (velocidade
-- de resposta no direct), que tinham ficado de fora da 0008 por falta de
-- coluna pra guardar o dado. custo_por_visita já existia (nunca foi usada
-- nos gatilhos); esta migração só adiciona tempo_resposta_medio_min.
-- Aditivo e idempotente — pode rodar em prod sem risco.

alter table public.ig_metricas_semanais
  add column if not exists tempo_resposta_medio_min numeric;

comment on column public.ig_metricas_semanais.custo_por_visita is
  'Custo por visita ao perfil do criativo ativo/campeão na semana (R$) — alimenta o gatilho G1.';

comment on column public.ig_metricas_semanais.tempo_resposta_medio_min is
  'Tempo médio de primeira resposta no direct em horário comercial, em minutos — alimenta o gatilho G8.';
