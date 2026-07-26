-- Gate C0: corrige os 2 templates da régua de e-mail (D+2 e D+7) semeados
-- pela migration histórica 0011_automacao_followup.sql. A 0011 permanece
-- imutável — este arquivo apenas atualiza os dados que ela criou, tanto numa
-- instalação nova (replay completo do repositório) quanto na instalação já
-- existente em produção.
--
-- Risco encontrado (auditoria read-only, 2026-07-26): ordem=0 continha
-- "nenhuma análise bancária no processo" e uma pergunta retórica sobre
-- "comprar apartamento sem banco" — mesma família de claim de crédito
-- absoluto já removida do restante do site no Gate A. ordem=1 continha
-- linguagem de escassez/urgência não comprovada ("a tabela é reajustada a
-- cada fase da obra... as condições de hoje não são as mesmas do mês que
-- vem"). Nenhuma das duas fazia a ressalva de que a aprovação não é
-- automática.
--
-- GUARD EXATO (revisão obrigatória desta rodada): a versão anterior deste
-- arquivo verificava apenas `ordem` e `assunto` — isso não protegia uma
-- edição manual do corpo que tivesse preservado o assunto original. A
-- migration só atualiza quando `ordem`, `dias_minimos`, `assunto` E
-- md5(corpo_html) coincidem simultaneamente com o estado exato semeado pela
-- 0011. Os hashes abaixo foram calculados e conferidos contra produção via
-- consulta read-only em 2026-07-26 (comparando md5() do texto literal desta
-- migration com o md5(corpo_html) hoje em produção — ambos batem
-- exatamente, confirmando ausência de edição manual ou divergência de
-- whitespace):
--   ordem=0: md5 esperado 4208bf469bb94bc65552ccbd719a2eed
--   ordem=1: md5 esperado 6fa2bdbe789c92674ca6f0b79dd0ff22
-- Antes do UPDATE, conta quantas linhas batem integralmente nesses 4 campos
-- e exige exatamente 2 — lança exceção antes de qualquer UPDATE se não
-- forem exatamente 2 (não afirma proteção contra edição manual além do que
-- este hash realmente verifica: se o corpo mudou uma vírgula sequer, o
-- guard já rejeita).
--
-- Não altera `ordem` nem `dias_minimos`. Não toca `leads` nem qualquer
-- tabela de envio/cron. Não contém BEGIN/COMMIT explícitos — o bloco DO
-- abaixo já é uma única unidade transacional (uma exceção não capturada
-- reverte todo o bloco automaticamente, incluindo o UPDATE se a contagem
-- pós-update também não bater). Destinada exclusivamente ao Supabase MCP
-- apply_migration.
--
-- NUMERAÇÃO: este arquivo foi renumerado de 0020 para 0024 em 2026-07-26,
-- depois que a PR #22 ("Modo Foco") foi mergeada em main enquanto esta PR
-- ainda estava aberta, ocupando 0020-0023
-- (0020_modo_foco.sql, 0021_modo_foco_client_event_id.sql,
-- 0022_modo_foco_hardening.sql, 0023_agenda_idempotencia.sql) — nenhuma
-- delas toca automacao_email_passos ou qualquer tabela desta migration.
-- 0024 confirmado livre em todas as branches locais/remotas e no banco
-- remoto no momento desta renumeração.

do $$
declare
  v_count integer;
  v_hash_0 constant text := '4208bf469bb94bc65552ccbd719a2eed';
  v_hash_1 constant text := '6fa2bdbe789c92674ca6f0b79dd0ff22';
begin
  select count(*) into v_count
  from public.automacao_email_passos
  where (ordem = 0 and dias_minimos = 2
         and assunto = 'Por que ninguém te explicou o financiamento sem banco?'
         and md5(corpo_html) = v_hash_0)
     or (ordem = 1 and dias_minimos = 7
         and assunto = 'A tabela do {empreendimento} muda com a obra'
         and md5(corpo_html) = v_hash_1);

  if v_count <> 2 then
    raise exception 'Gate C0: esperava exatamente 2 linhas com ordem+dias_minimos+assunto+md5(corpo_html) batendo integralmente com o estado semeado pela 0011, mas encontrou % -- abortando sem alterar nada (conteudo pode ja ter sido editado manualmente).', v_count;
  end if;

  update public.automacao_email_passos
  set
    assunto = case ordem
      when 0 then 'Como funciona a negociação direta com a construtora'
      when 1 then 'Confira as condições atuais de {empreendimento}'
    end,
    corpo_html = case ordem
      when 0 then '
      <p>Olá {nome},</p>
      <p>Na compra direta, a negociação ocorre com a construtora, sem depender de financiamento bancário.</p>
      <p>A construtora poderá realizar análise cadastral e de capacidade de pagamento conforme suas políticas — a aprovação não é automática. As condições de entrada, parcelas, índices, prazos e disponibilidade variam conforme o empreendimento e a tabela vigente.</p>
      <p><a href="https://stivenallan.com.br/guia/financiamento-direto-construtora" style="color:#1A5C3A;font-weight:700">→ Entenda a negociação direta com a construtora</a></p>
      <p>Se quiser confirmar as condições atuais de {empreendimento}, <a href="https://wa.me/5548991642332" style="color:#1A5C3A">fale comigo pelo WhatsApp</a>.</p>
    '
      when 1 then '
      <p>Olá {nome},</p>
      <p>As condições comerciais de {empreendimento} podem ser atualizadas pela construtora conforme a tabela vigente.</p>
      <p>Se quiser, posso confirmar os valores, os prazos e a disponibilidade informados atualmente pela construtora. A consulta não cria compromisso de compra.</p>
      <p><a href="https://wa.me/5548991642332" style="color:#1A5C3A;font-weight:700">→ Consultar condições pelo WhatsApp</a></p>
    '
    end
  where (ordem = 0 and dias_minimos = 2
         and assunto = 'Por que ninguém te explicou o financiamento sem banco?'
         and md5(corpo_html) = v_hash_0)
     or (ordem = 1 and dias_minimos = 7
         and assunto = 'A tabela do {empreendimento} muda com a obra'
         and md5(corpo_html) = v_hash_1);

  get diagnostics v_count = row_count;
  if v_count <> 2 then
    raise exception 'Gate C0: esperava atualizar exatamente 2 linhas (ordem 0 e 1), mas atualizou % -- abortando. Estado mudou entre a contagem pre-update e o UPDATE (corrida concorrente) ou os predicados nao bateram no UPDATE.', v_count;
  end if;
end $$;
