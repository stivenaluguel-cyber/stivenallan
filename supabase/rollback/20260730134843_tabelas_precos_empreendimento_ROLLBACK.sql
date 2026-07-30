-- Rollback de 20260730134843_tabelas_precos_empreendimento.sql
--
-- ATENÇÃO: derruba a tabela e, com ela, o registro de qual PDF pertence a qual
-- empreendimento. Os arquivos em si continuam no bucket privado, sob
-- documentos/tabelas/<slug>/, mas sem esta tabela ninguém sabe mais a que mês
-- ou prédio cada um pertence. Baixe o que precisar guardar antes de rodar.

drop index if exists public.empreendimentos_tabelas_precos_recente_idx;
drop index if exists public.empreendimentos_tabelas_precos_unica;
drop table if exists public.empreendimentos_tabelas_precos;
