-- Lead gate: o formulário grava telefone no formato local (DDD+número), mas
-- integrações como Meta/Evolution podem ter gravado o mesmo contato com 55.
-- A resolução passa a procurar as duas representações antes de criar lead.
--
-- Deliberadamente NÃO faz backfill nem cria UNIQUE funcional: o dado legado
-- pode já conter os dois formatos e uma mudança destrutiva exige auditoria
-- própria. O gate apenas deixa de criar um terceiro lead e escolhe o formato
-- local exato de forma determinística quando ambos já existem.

create or replace function public.resolve_lead_for_gate(
  p_whatsapp text,
  p_email text,
  p_nome text,
  p_property_id uuid,
  p_property_name text,
  p_source text,
  p_utm_source text,
  p_utm_medium text,
  p_utm_campaign text,
  p_utm_content text,
  p_utm_term text,
  p_gclid text,
  p_fbclid text,
  p_faixa_investimento text,
  p_prazo_compra text,
  p_entrada_disponivel text
) returns jsonb
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_by_phone record;
  v_by_email record;
  v_lead_id uuid;
  v_conflito boolean := false;
  v_created boolean := false;
  v_whatsapp_digits text;
  v_whatsapp_local text;
begin
  if p_whatsapp is null or btrim(p_whatsapp) = '' then
    raise exception 'resolve_lead_for_gate: whatsapp é obrigatório';
  end if;
  if p_nome is null or btrim(p_nome) = '' then
    raise exception 'resolve_lead_for_gate: nome é obrigatório';
  end if;
  if p_email is null or btrim(p_email) = '' then
    raise exception 'resolve_lead_for_gate: email é obrigatório';
  end if;

  -- Defesa em profundidade: mesmo que outro chamador invoque a RPC sem passar
  -- pelo normalizador TypeScript, a função reduz +55/55 ao formato local.
  v_whatsapp_digits := regexp_replace(p_whatsapp, '[^0-9]', '', 'g');
  v_whatsapp_local := case
    when length(v_whatsapp_digits) in (12, 13) and left(v_whatsapp_digits, 2) = '55'
      then substring(v_whatsapp_digits from 3)
    else v_whatsapp_digits
  end;
  if length(v_whatsapp_local) not in (10, 11) then
    raise exception 'resolve_lead_for_gate: whatsapp inválido';
  end if;
  p_whatsapp := v_whatsapp_local;

  -- Usa o índice único bruto de whatsapp nas duas alternativas. Se o legado
  -- já tiver ambas, o formato local exato vence; depois, o lead mais antigo.
  select id into v_by_phone
    from public.leads
   where whatsapp in (p_whatsapp, '55' || p_whatsapp)
   order by (whatsapp = p_whatsapp) desc, created_at asc
   limit 1
     for update;

  select id into v_by_email
    from public.leads
   where lower(email) = lower(p_email)
   order by created_at asc
   limit 1
     for update;

  if v_by_phone.id is not null and v_by_email.id is not null and v_by_phone.id <> v_by_email.id then
    v_lead_id := v_by_phone.id;
    v_conflito := true;
    insert into public.lead_identity_conflicts (lead_id_a, lead_id_b, whatsapp, email)
      values (v_by_phone.id, v_by_email.id, p_whatsapp, p_email)
      on conflict do nothing;
    update public.leads set requer_atencao = true where id in (v_by_phone.id, v_by_email.id);
  elsif v_by_phone.id is not null then
    v_lead_id := v_by_phone.id;
  elsif v_by_email.id is not null then
    v_lead_id := v_by_email.id;
  else
    begin
      insert into public.leads (
        whatsapp, email, nome, property_id, property_name, origem, source, status, estagio_funil,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, fbclid,
        faixa_investimento, prazo_compra, entrada_disponivel, requer_atencao
      ) values (
        p_whatsapp, p_email, p_nome, p_property_id, p_property_name, 'Site', p_source, 'novo', 'primeiro_contato',
        p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, p_utm_term, p_gclid, p_fbclid,
        p_faixa_investimento, p_prazo_compra, p_entrada_disponivel, false
      ) returning id into v_lead_id;
      v_created := true;
    exception when unique_violation then
      select id into v_lead_id
        from public.leads
       where whatsapp in (p_whatsapp, '55' || p_whatsapp)
       order by (whatsapp = p_whatsapp) desc, created_at asc
       limit 1;
      v_created := false;
    end;
  end if;

  if not v_created then
    update public.leads set
      nome = coalesce(nome, p_nome),
      email = coalesce(email, case when v_conflito then null else p_email end),
      property_id   = case when property_id is null then p_property_id   else property_id   end,
      property_name = case when property_id is null then p_property_name else property_name end,
      faixa_investimento = coalesce(faixa_investimento, p_faixa_investimento),
      prazo_compra = coalesce(prazo_compra, p_prazo_compra),
      entrada_disponivel = coalesce(entrada_disponivel, p_entrada_disponivel),
      utm_source = coalesce(utm_source, p_utm_source),
      utm_medium = coalesce(utm_medium, p_utm_medium),
      utm_campaign = coalesce(utm_campaign, p_utm_campaign),
      utm_content = coalesce(utm_content, p_utm_content),
      utm_term = coalesce(utm_term, p_utm_term),
      gclid = coalesce(gclid, p_gclid),
      fbclid = coalesce(fbclid, p_fbclid),
      updated_at = now()
    where id = v_lead_id;
  end if;

  return jsonb_build_object('leadId', v_lead_id, 'created', v_created, 'conflito', v_conflito);
end;
$function$;

revoke all on function public.resolve_lead_for_gate(
  text, text, text, uuid, text, text, text, text, text, text, text, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.resolve_lead_for_gate(
  text, text, text, uuid, text, text, text, text, text, text, text, text, text, text, text, text
) to service_role;
