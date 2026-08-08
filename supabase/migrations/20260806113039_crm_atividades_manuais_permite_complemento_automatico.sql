-- A tabela só aceitava tipo IN ('conteudo','reuniao_presencial') — trava
-- que impedia o complemento manual das 3 atividades automáticas
-- (novos_contatos/followups/visitas) recém-habilitado no app. Só relaxa a
-- lista permitida, não mexe em linha nenhuma existente.
alter table public.crm_atividades_manuais drop constraint crm_atividades_manuais_tipo_check;
alter table public.crm_atividades_manuais add constraint crm_atividades_manuais_tipo_check
  check (tipo = any (array['conteudo', 'reuniao_presencial', 'novos_contatos', 'followups', 'visitas']));
