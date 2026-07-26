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
-- Guardas: só atualiza se as 2 linhas existirem E ainda tiverem exatamente o
-- assunto original semeado pela 0011 (ou seja, se alguém já editou o
-- conteúdo manualmente pelo /dashboard/automacoes, esta migration não
-- sobrescreve — ela falha com exceção em vez de aplicar parcialmente ou
-- silenciosamente). Não altera `ordem` nem `dias_minimos`. Não toca `leads`
-- nem qualquer tabela de envio/cron. Não contém BEGIN/COMMIT explícitos — o
-- bloco DO abaixo já é uma única unidade transacional (uma exceção não
-- capturada reverte todo o bloco automaticamente). Destinada exclusivamente
-- ao Supabase MCP apply_migration.

do $$
declare
  v_count integer;
begin
  if (select count(*) from public.automacao_email_passos where ordem in (0, 1)) <> 2 then
    raise exception 'Gate C0: automacao_email_passos nao tem as 2 linhas esperadas (ordem 0 e 1) -- abortando sem alterar nada.';
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
      <p>A construtora poderá realizar análise cadastral e de capacidade de pagamento conforme suas políticas — a aprovação não é automática. Entrada, parcelas, índices, prazos e disponibilidade variam conforme o {empreendimento} e a tabela vigente.</p>
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
  where (ordem = 0 and assunto = 'Por que ninguém te explicou o financiamento sem banco?')
     or (ordem = 1 and assunto = 'A tabela do {empreendimento} muda com a obra');

  get diagnostics v_count = row_count;
  if v_count <> 2 then
    raise exception 'Gate C0: esperava atualizar exatamente 2 linhas (ordem 0 e 1), mas atualizou % -- abortando. O conteudo pode ja ter sido editado manualmente ou o texto antigo esperado nao bate.', v_count;
  end if;
end $$;
