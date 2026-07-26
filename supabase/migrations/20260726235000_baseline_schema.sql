-- BASELINE SCHEMA-ONLY (schema public) -- gerado por introspeccao read-only de producao
-- Snapshot exato: sem IF NOT EXISTS / DROP IF EXISTS / guardas condicionais.
-- Destinado exclusivamente a bancos novos. Nunca sera executado em producao.

-- uuid-ossp e pgcrypto sao pre-instaladas por padrao em todo projeto Supabase novo
-- (confirmado na validacao da Trilha 1) -- por isso nao sao recriadas aqui.

create sequence public.alertas_leilao_id_seq;

create table public.admin_users (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "senha_hash" text NOT NULL,
  "nome" text DEFAULT 'Stiven Allan'::text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

create table public.agendamentos (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "lead_id" uuid,
  "empreendimento_id" uuid,
  "data_hora" timestamp with time zone NOT NULL,
  "tipo" text DEFAULT 'visita'::text,
  "status" text DEFAULT 'agendado'::text,
  "observacoes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

create table public.alertas_leilao (
  "id" integer DEFAULT nextval('alertas_leilao_id_seq'::regclass) NOT NULL,
  "imovel_id" text NOT NULL,
  "nome" text NOT NULL,
  "email" text NOT NULL,
  "telefone" text DEFAULT ''::text NOT NULL,
  "criado_em" timestamp without time zone DEFAULT now(),
  "enviado_24h" boolean DEFAULT false,
  "enviado_4h" boolean DEFAULT false,
  "enviado_1h" boolean DEFAULT false,
  "ativo" boolean DEFAULT true,
  "notificado" boolean DEFAULT false,
  "unsubscribe_token" text NOT NULL
);

create table public.automacao_email_passos (
  "ordem" integer NOT NULL,
  "dias_minimos" integer NOT NULL,
  "assunto" text NOT NULL,
  "corpo_html" text NOT NULL
);

create table public.automacao_whatsapp_intervalos (
  "ordem" integer NOT NULL,
  "dias" integer NOT NULL
);

create table public.automacao_whatsapp_mensagens (
  "estagio_funil" text NOT NULL,
  "ordem" integer NOT NULL,
  "mensagem" text NOT NULL
);

create table public.campanha_destinatarios (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "campanha_id" uuid NOT NULL,
  "lead_id" uuid,
  "email" text NOT NULL,
  "resend_message_id" text,
  "status" text DEFAULT 'pendente'::text NOT NULL,
  "enviado_em" timestamp with time zone
);

create table public.campanha_eventos (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "campanha_id" uuid NOT NULL,
  "lead_id" uuid,
  "tipo" text NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

create table public.campanhas (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "titulo" text NOT NULL,
  "assunto" text NOT NULL,
  "corpo_html" text NOT NULL,
  "segmento" jsonb NOT NULL,
  "status" text DEFAULT 'rascunho'::text NOT NULL,
  "criado_em" timestamp with time zone DEFAULT now() NOT NULL,
  "enviada_em" timestamp with time zone
);

create table public.configuracoes_cub (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "mes_referencia" date NOT NULL,
  "valor_m2" numeric(10,2) NOT NULL,
  "variacao_mensal" numeric(6,4),
  "variacao_anual" numeric(6,4),
  "fonte" character varying(200) DEFAULT 'SINDUSCON-SC'::character varying,
  "notas" text,
  "atualizado_por" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

create table public.construtoras (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "nome" text NOT NULL,
  "slug" text NOT NULL,
  "logo_url" text,
  "site_url" text,
  "telefone" text,
  "email" text,
  "cidade" text,
  "uf" character(2) DEFAULT 'SC'::bpchar,
  "created_at" timestamp with time zone DEFAULT now()
);

create table public.crm_agenda (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "titulo" character varying(200) NOT NULL,
  "descricao" text,
  "tipo" character varying(30) DEFAULT 'visita'::character varying,
  "admin_id" uuid,
  "lead_id" uuid,
  "cliente_id" uuid,
  "inicio" timestamp with time zone NOT NULL,
  "fim" timestamp with time zone,
  "status" character varying(20) DEFAULT 'agendado'::character varying,
  "lembrete_min" smallint DEFAULT 30,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "local" text,
  "client_event_id" uuid
);

create table public.crm_clientes (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nome" character varying(200) NOT NULL,
  "email" character varying(254),
  "telefone" character varying(20),
  "telefone2" character varying(20),
  "cpf" character varying(14),
  "data_nascimento" date,
  "cidade" character varying(100),
  "estado" character(2) DEFAULT 'SC'::bpchar,
  "busca_tipo" text,
  "busca_valor_min" numeric(14,2),
  "busca_valor_max" numeric(14,2),
  "busca_dorms_min" smallint,
  "busca_bairros" text,
  "status" character varying(20) DEFAULT 'ativo'::character varying,
  "origem" character varying(50) DEFAULT 'outros'::character varying,
  "tags" text,
  "notas" text,
  "corretor_resp" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "perfil_busca" text,
  "renda_mensal" numeric(12,2),
  "estado_civil" text DEFAULT 'solteiro'::text,
  "tem_fgts" boolean DEFAULT false
);

create table public.crm_focus_events (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "lead_id" uuid NOT NULL,
  "admin_id" uuid,
  "action_type" text NOT NULL,
  "previous_stage" text,
  "next_stage" text,
  "points" integer DEFAULT 0 NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "client_event_id" uuid NOT NULL
);

create table public.crm_focus_sessions (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "admin_id" uuid,
  "status" text DEFAULT 'ativa'::text NOT NULL,
  "filtros" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "total_leads" integer DEFAULT 0 NOT NULL,
  "processed_leads" integer DEFAULT 0 NOT NULL,
  "skipped_leads" integer DEFAULT 0 NOT NULL,
  "earned_points" integer DEFAULT 0 NOT NULL,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "finished_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

create table public.crm_notificacoes (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "admin_id" uuid,
  "tipo" character varying(50) NOT NULL,
  "titulo" character varying(200) NOT NULL,
  "corpo" text,
  "lida" boolean DEFAULT false,
  "link" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

create table public.crm_propostas (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "numero" character varying(20) NOT NULL,
  "status" character varying(30) DEFAULT 'rascunho'::character varying NOT NULL,
  "lead_id" uuid,
  "cliente_id" uuid,
  "empreendimento_id" uuid,
  "unidade_id" uuid,
  "corretor_id" uuid,
  "valor_proposto" numeric(14,2) DEFAULT 0 NOT NULL,
  "valor_entrada" numeric(14,2),
  "condicoes_pgto" text,
  "simulacao_json" jsonb DEFAULT '{}'::jsonb,
  "cub_valor_m2" numeric(10,2),
  "validade_ate" timestamp with time zone,
  "notas" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

create table public.cron_runs (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "cron_name" text NOT NULL,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "ended_at" timestamp with time zone,
  "duration_ms" integer,
  "status" text DEFAULT 'running'::text NOT NULL,
  "motivo" text,
  "processados" integer,
  "enviados" integer,
  "pulados" integer,
  "erros_envio" integer,
  "details" jsonb
);

create table public.diferenciais_empreendimento (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "empreendimento_id" uuid,
  "icone" text,
  "descricao" text NOT NULL,
  "categoria" text,
  "created_at" timestamp with time zone DEFAULT now()
);

create table public.empreendimento_midias (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "empreendimento_id" uuid,
  "tipo" text DEFAULT 'foto'::text,
  "url" text NOT NULL,
  "url_thumb" text,
  "legenda" text,
  "ordem" smallint DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now()
);

create table public.empreendimentos (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "construtora_id" uuid,
  "nome" text NOT NULL,
  "slug" text NOT NULL,
  "descricao_curta" text,
  "descricao_completa" text,
  "cidade" text DEFAULT 'Criciúma'::text NOT NULL,
  "bairro" text,
  "uf" character(2) DEFAULT 'SC'::bpchar,
  "cep" text,
  "endereco" text,
  "latitude" numeric(10,7),
  "longitude" numeric(10,7),
  "status_obra" text DEFAULT 'lancamento'::text,
  "status_venda" text DEFAULT 'ativo'::text,
  "preco_a_partir_de" numeric(12,2),
  "preco_ate" numeric(12,2),
  "area_privativa_min" numeric(8,2),
  "area_privativa_max" numeric(8,2),
  "total_unidades" integer,
  "unidades_disponiveis" integer,
  "previsao_entrega" text,
  "landing_page_url" text,
  "imagem_capa_url" text,
  "video_url" text,
  "maps_embed_url" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "imagens_urls" text[] DEFAULT '{}'::text[],
  "whatsapp" text DEFAULT '5548916423321'::text,
  "construtora" text,
  "preco_a_partir" numeric,
  "exibir_preco" boolean DEFAULT false
);

create table public.empreendimentos_unidades (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "empreendimento_id" uuid NOT NULL,
  "bloco" character varying(50),
  "unidade" character varying(30) NOT NULL,
  "andar" smallint,
  "metragem" numeric(8,2) DEFAULT 0 NOT NULL,
  "dormitorios" smallint DEFAULT 2,
  "suites" smallint DEFAULT 0,
  "orientacao" character varying(30),
  "valor_tabela" numeric(14,2),
  "valor_promocional" numeric(14,2),
  "valor_entrada_min" numeric(14,2),
  "disponivel" boolean DEFAULT true,
  "reservado_ate" timestamp with time zone,
  "lead_id_reserva" uuid,
  "condicoes_negociacao" text,
  "cub_fator" numeric(6,4) DEFAULT 1.0,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

create table public.ig_content_calendar (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "data" date,
  "tipo" text NOT NULL,
  "linha" text NOT NULL,
  "titulo" text NOT NULL,
  "roteiro" text,
  "status" text DEFAULT 'planejado'::text NOT NULL,
  "post_url" text,
  "alcance" integer,
  "interacoes" integer,
  "compartilhamentos" integer,
  "watch_time_seg" numeric,
  "observacoes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

create table public.ig_metricas_semanais (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "semana_inicio" date NOT NULL,
  "seguidores" integer,
  "novos_seguidores" integer,
  "novos_seguidores_locais" integer,
  "alcance" integer,
  "alcance_educativo" integer,
  "alcance_imovel" integer,
  "taxa_engajamento" numeric,
  "visitas_perfil" integer,
  "cliques_bio" integer,
  "leads_qualificados" integer,
  "gasto_ads" numeric,
  "custo_por_visita" numeric,
  "observacoes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "tempo_resposta_medio_min" numeric
);

create table public.interacoes (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "lead_id" uuid,
  "canal" text DEFAULT 'whatsapp'::text,
  "direcao" text NOT NULL,
  "mensagem" text NOT NULL,
  "processado_por_ia" boolean DEFAULT false,
  "intencao_detectada" text,
  "sentimento" text,
  "created_at" timestamp with time zone DEFAULT now()
);

create table public.lead_eventos (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "lead_id" uuid,
  "anon_id" text,
  "tipo" text NOT NULL,
  "slug" text,
  "created_at" timestamp with time zone DEFAULT now()
);

create table public.lead_interacoes (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "lead_id" uuid,
  "tipo" text DEFAULT 'nota'::text,
  "descricao" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now()
);

create table public.leads (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "whatsapp" text NOT NULL,
  "nome" text,
  "email" text,
  "perfil" text DEFAULT 'indefinido'::text,
  "orcamento_min" numeric(12,2),
  "orcamento_max" numeric(12,2),
  "prazo_compra" text,
  "cidade_interesse" text,
  "estagio_funil" text DEFAULT 'primeiro_contato'::text,
  "status" text DEFAULT 'novo'::text,
  "lead_score" integer DEFAULT 0,
  "requer_atencao" boolean DEFAULT false,
  "empreendimento_interesse" uuid,
  "tentativas_followup" integer DEFAULT 0,
  "ultimo_contato" timestamp with time zone,
  "proximo_followup" timestamp with time zone,
  "origem" text DEFAULT 'whatsapp'::text,
  "observacoes_ia" text,
  "motivacao" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "kanban_ordem" integer DEFAULT 0,
  "temperatura" smallint DEFAULT 3,
  "cliente_id" uuid,
  "primeiro_atendimento_em" timestamp with time zone,
  "alerta_sem_atendimento" boolean DEFAULT false,
  "property_id" uuid,
  "property_name" text,
  "source" text DEFAULT 'book_download'::text,
  "contacted" boolean DEFAULT false,
  "anotacoes" text,
  "faixa_investimento" text,
  "entrada_disponivel" text,
  "utm_source" text,
  "utm_medium" text,
  "utm_campaign" text,
  "utm_content" text,
  "utm_term" text,
  "gclid" text,
  "fbclid" text,
  "email_followup_etapa" integer DEFAULT 0 NOT NULL,
  "email_followup_em" timestamp with time zone,
  "unsubscribed_at" timestamp with time zone,
  "whatsapp_original_pre_normalize" text,
  "atendimento_humano_ativo" boolean DEFAULT false NOT NULL,
  "unsubscribe_motivo" text
);

create table public.leads_interacoes (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "lead_id" uuid NOT NULL,
  "admin_id" uuid,
  "tipo" character varying(50) DEFAULT 'nota'::character varying NOT NULL,
  "descricao" text NOT NULL,
  "estagio_de" character varying(50),
  "estagio_para" character varying(50),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

create table public.password_reset_tokens (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "admin_id" uuid,
  "token" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "used" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now()
);

create table public.properties (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "construtora_slug" text NOT NULL,
  "cover_image_url" text,
  "book_pdf_url" text,
  "nome" text,
  "descricao" text,
  "descricao_curta" text,
  "cidade" text,
  "uf" text,
  "bairro" text,
  "endereco" text,
  "cor_acento" text,
  "video_url" text,
  "galeria" text[],
  "plantas" text[],
  "diferenciais" text[],
  "lazer" text[],
  "faq" jsonb,
  "dormitorios" text,
  "metragem" text,
  "vagas" text,
  "suites" text,
  "previsao_entrega" text,
  "status" text,
  "exibir_preco" boolean DEFAULT true,
  "preco" numeric,
  "frase" text,
  "ordem" integer,
  "oculto" boolean DEFAULT false,
  "ativo" boolean DEFAULT true,
  "origem" text DEFAULT 'static'::text
);

create table public.tipologias (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "empreendimento_id" uuid,
  "nome" text NOT NULL,
  "dormitorios" integer,
  "suites" integer,
  "vagas" integer,
  "area_privativa_m2" numeric(8,2),
  "area_total_m2" numeric(8,2),
  "preco_a_partir_de" numeric(12,2),
  "preco_ate" numeric(12,2),
  "unidades_disponiveis" integer,
  "planta_url" text,
  "created_at" timestamp with time zone DEFAULT now()
);

alter sequence public.alertas_leilao_id_seq owned by public.alertas_leilao.id;

alter table public.admin_users add constraint admin_users_pkey PRIMARY KEY (id);
alter table public.agendamentos add constraint agendamentos_pkey PRIMARY KEY (id);
alter table public.alertas_leilao add constraint alertas_leilao_pkey PRIMARY KEY (id);
alter table public.automacao_email_passos add constraint automacao_email_passos_pkey PRIMARY KEY (ordem);
alter table public.automacao_whatsapp_intervalos add constraint automacao_whatsapp_intervalos_pkey PRIMARY KEY (ordem);
alter table public.automacao_whatsapp_mensagens add constraint automacao_whatsapp_mensagens_pkey PRIMARY KEY (estagio_funil, ordem);
alter table public.campanha_destinatarios add constraint campanha_destinatarios_pkey PRIMARY KEY (id);
alter table public.campanha_eventos add constraint campanha_eventos_pkey PRIMARY KEY (id);
alter table public.campanhas add constraint campanhas_pkey PRIMARY KEY (id);
alter table public.configuracoes_cub add constraint configuracoes_cub_pkey PRIMARY KEY (id);
alter table public.construtoras add constraint construtoras_pkey PRIMARY KEY (id);
alter table public.crm_agenda add constraint crm_agenda_pkey PRIMARY KEY (id);
alter table public.crm_clientes add constraint crm_clientes_pkey PRIMARY KEY (id);
alter table public.crm_focus_events add constraint crm_focus_events_pkey PRIMARY KEY (id);
alter table public.crm_focus_sessions add constraint crm_focus_sessions_pkey PRIMARY KEY (id);
alter table public.crm_notificacoes add constraint crm_notificacoes_pkey PRIMARY KEY (id);
alter table public.crm_propostas add constraint crm_propostas_pkey PRIMARY KEY (id);
alter table public.cron_runs add constraint cron_runs_pkey PRIMARY KEY (id);
alter table public.diferenciais_empreendimento add constraint diferenciais_empreendimento_pkey PRIMARY KEY (id);
alter table public.empreendimento_midias add constraint empreendimento_midias_pkey PRIMARY KEY (id);
alter table public.empreendimentos add constraint empreendimentos_pkey PRIMARY KEY (id);
alter table public.empreendimentos_unidades add constraint empreendimentos_unidades_pkey PRIMARY KEY (id);
alter table public.ig_content_calendar add constraint ig_content_calendar_pkey PRIMARY KEY (id);
alter table public.ig_metricas_semanais add constraint ig_metricas_semanais_pkey PRIMARY KEY (id);
alter table public.interacoes add constraint interacoes_pkey PRIMARY KEY (id);
alter table public.lead_eventos add constraint lead_eventos_pkey PRIMARY KEY (id);
alter table public.lead_interacoes add constraint lead_interacoes_pkey PRIMARY KEY (id);
alter table public.leads add constraint leads_pkey PRIMARY KEY (id);
alter table public.leads_interacoes add constraint leads_interacoes_pkey PRIMARY KEY (id);
alter table public.password_reset_tokens add constraint password_reset_tokens_pkey PRIMARY KEY (id);
alter table public.properties add constraint properties_pkey PRIMARY KEY (id);
alter table public.tipologias add constraint tipologias_pkey PRIMARY KEY (id);
alter table public.admin_users add constraint admin_users_email_key UNIQUE (email);
alter table public.alertas_leilao add constraint alertas_leilao_imovel_id_email_key UNIQUE (imovel_id, email);
alter table public.alertas_leilao add constraint alertas_leilao_unsubscribe_token_key UNIQUE (unsubscribe_token);
alter table public.configuracoes_cub add constraint uq_cub_mes UNIQUE (mes_referencia);
alter table public.construtoras add constraint construtoras_slug_key UNIQUE (slug);
alter table public.empreendimentos add constraint empreendimentos_slug_key UNIQUE (slug);
alter table public.empreendimentos_unidades add constraint empreendimentos_unidades_empreendimento_id_unidade_key UNIQUE (empreendimento_id, unidade);
alter table public.ig_metricas_semanais add constraint ig_metricas_semanais_semana_inicio_key UNIQUE (semana_inicio);
alter table public.leads add constraint leads_whatsapp_key UNIQUE (whatsapp);
alter table public.password_reset_tokens add constraint password_reset_tokens_token_key UNIQUE (token);
alter table public.properties add constraint properties_construtora_slug_slug_key UNIQUE (construtora_slug, slug);
alter table public.agendamentos add constraint agendamentos_status_check CHECK ((status = ANY (ARRAY['agendado'::text, 'confirmado'::text, 'realizado'::text, 'cancelado'::text, 'no_show'::text])));
alter table public.agendamentos add constraint agendamentos_tipo_check CHECK ((tipo = ANY (ARRAY['visita'::text, 'videochamada'::text, 'reuniao'::text])));
alter table public.crm_focus_events add constraint crm_focus_events_action_type_check CHECK ((action_type = ANY (ARRAY['pular'::text, 'perdido'::text, 'followup_agendado'::text, 'visita_agendada'::text, 'visita_concluida'::text, 'visita_nao_ocorreu'::text, 'contato_confirmado'::text, 'anotacao'::text, 'etapa_alterada'::text, 'proposta_enviada'::text])));
alter table public.crm_focus_sessions add constraint crm_focus_sessions_status_check CHECK ((status = ANY (ARRAY['ativa'::text, 'concluida'::text, 'abandonada'::text])));
alter table public.cron_runs add constraint cron_runs_status_check CHECK ((status = ANY (ARRAY['running'::text, 'ok'::text, 'skipped'::text, 'error'::text])));
alter table public.empreendimento_midias add constraint empreendimento_midias_tipo_check CHECK ((tipo = ANY (ARRAY['foto'::text, 'video'::text, 'planta'::text, 'tour_360'::text])));
alter table public.empreendimentos add constraint empreendimentos_status_obra_check CHECK ((status_obra = ANY (ARRAY['lancamento'::text, 'em_obras'::text, 'pronto'::text])));
alter table public.empreendimentos add constraint empreendimentos_status_venda_check CHECK ((status_venda = ANY (ARRAY['ativo'::text, 'pausado'::text, 'encerrado'::text])));
alter table public.ig_content_calendar add constraint ig_content_calendar_linha_check CHECK ((linha = ANY (ARRAY['oportunidade'::text, 'fontana'::text])));
alter table public.ig_content_calendar add constraint ig_content_calendar_status_check CHECK ((status = ANY (ARRAY['planejado'::text, 'a_gravar'::text, 'gravado'::text, 'editado'::text, 'publicado'::text])));
alter table public.ig_content_calendar add constraint ig_content_calendar_tipo_check CHECK ((tipo = ANY (ARRAY['reel_educativo'::text, 'reel_imovel'::text, 'story'::text, 'story_campanha'::text])));
alter table public.interacoes add constraint interacoes_canal_check CHECK ((canal = ANY (ARRAY['whatsapp'::text, 'instagram'::text, 'email'::text, 'telefone'::text, 'presencial'::text])));
alter table public.interacoes add constraint interacoes_direcao_check CHECK ((direcao = ANY (ARRAY['entrada'::text, 'saida'::text])));
alter table public.interacoes add constraint interacoes_sentimento_check CHECK ((sentimento = ANY (ARRAY['positivo'::text, 'neutro'::text, 'negativo'::text])));
alter table public.lead_interacoes add constraint lead_interacoes_tipo_check CHECK ((tipo = ANY (ARRAY['nota'::text, 'ligacao'::text, 'whatsapp'::text, 'email'::text, 'visita'::text, 'proposta'::text])));
alter table public.leads add constraint leads_estagio_funil_check CHECK ((estagio_funil = ANY (ARRAY['primeiro_contato'::text, 'qualificado'::text, 'interessado'::text, 'proposta_enviada'::text, 'visita_agendada'::text, 'negociacao'::text, 'fechado'::text, 'perdido'::text, 'nurturing'::text])));
alter table public.leads add constraint leads_lead_score_check CHECK (((lead_score >= 0) AND (lead_score <= 100)));
alter table public.leads add constraint leads_perfil_check CHECK ((perfil = ANY (ARRAY['investidor'::text, 'moradia_propria'::text, 'ambos'::text, 'indefinido'::text])));
alter table public.leads add constraint leads_status_check CHECK ((status = ANY (ARRAY['novo'::text, 'em_atendimento'::text, 'qualificado'::text, 'proposta_enviada'::text, 'visita_agendada'::text, 'convertido'::text, 'perdido'::text, 'cold'::text])));
alter table public.agendamentos add constraint agendamentos_empreendimento_id_fkey FOREIGN KEY (empreendimento_id) REFERENCES empreendimentos(id);
alter table public.agendamentos add constraint agendamentos_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
alter table public.campanha_destinatarios add constraint campanha_destinatarios_campanha_id_fkey FOREIGN KEY (campanha_id) REFERENCES campanhas(id) ON DELETE CASCADE;
alter table public.campanha_destinatarios add constraint campanha_destinatarios_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
alter table public.campanha_eventos add constraint campanha_eventos_campanha_id_fkey FOREIGN KEY (campanha_id) REFERENCES campanhas(id) ON DELETE CASCADE;
alter table public.campanha_eventos add constraint campanha_eventos_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
alter table public.crm_agenda add constraint crm_agenda_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE;
alter table public.crm_agenda add constraint crm_agenda_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES crm_clientes(id) ON DELETE SET NULL;
alter table public.crm_agenda add constraint crm_agenda_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
alter table public.crm_clientes add constraint crm_clientes_corretor_resp_fkey FOREIGN KEY (corretor_resp) REFERENCES admin_users(id) ON DELETE SET NULL;
alter table public.crm_focus_events add constraint crm_focus_events_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL;
alter table public.crm_focus_events add constraint crm_focus_events_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
alter table public.crm_focus_events add constraint crm_focus_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES crm_focus_sessions(id) ON DELETE CASCADE;
alter table public.crm_focus_sessions add constraint crm_focus_sessions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL;
alter table public.crm_notificacoes add constraint crm_notificacoes_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE;
alter table public.crm_propostas add constraint crm_propostas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES crm_clientes(id) ON DELETE SET NULL;
alter table public.crm_propostas add constraint crm_propostas_corretor_id_fkey FOREIGN KEY (corretor_id) REFERENCES admin_users(id) ON DELETE SET NULL;
alter table public.crm_propostas add constraint crm_propostas_empreendimento_id_fkey FOREIGN KEY (empreendimento_id) REFERENCES empreendimentos(id) ON DELETE SET NULL;
alter table public.crm_propostas add constraint crm_propostas_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
alter table public.crm_propostas add constraint crm_propostas_unidade_id_fkey FOREIGN KEY (unidade_id) REFERENCES empreendimentos_unidades(id) ON DELETE SET NULL;
alter table public.diferenciais_empreendimento add constraint diferenciais_empreendimento_empreendimento_id_fkey FOREIGN KEY (empreendimento_id) REFERENCES empreendimentos(id) ON DELETE CASCADE;
alter table public.empreendimentos add constraint empreendimentos_construtora_id_fkey FOREIGN KEY (construtora_id) REFERENCES construtoras(id);
alter table public.empreendimentos_unidades add constraint empreendimentos_unidades_empreendimento_id_fkey FOREIGN KEY (empreendimento_id) REFERENCES empreendimentos(id) ON DELETE CASCADE;
alter table public.interacoes add constraint interacoes_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
alter table public.lead_eventos add constraint lead_eventos_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
alter table public.leads add constraint leads_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES crm_clientes(id) ON DELETE SET NULL;
alter table public.leads add constraint leads_empreendimento_interesse_fkey FOREIGN KEY (empreendimento_interesse) REFERENCES empreendimentos(id);
alter table public.leads add constraint leads_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id);
alter table public.leads_interacoes add constraint leads_interacoes_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL;
alter table public.leads_interacoes add constraint leads_interacoes_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
alter table public.password_reset_tokens add constraint password_reset_tokens_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE;
alter table public.tipologias add constraint tipologias_empreendimento_id_fkey FOREIGN KEY (empreendimento_id) REFERENCES empreendimentos(id) ON DELETE CASCADE;

CREATE INDEX campanha_destinatarios_campanha_idx ON public.campanha_destinatarios USING btree (campanha_id, status);
CREATE INDEX campanha_destinatarios_message_idx ON public.campanha_destinatarios USING btree (resend_message_id);
CREATE INDEX campanha_eventos_campanha_idx ON public.campanha_eventos USING btree (campanha_id);
CREATE UNIQUE INDEX crm_agenda_client_event_id_unique ON public.crm_agenda USING btree (client_event_id) WHERE (client_event_id IS NOT NULL);
CREATE INDEX idx_agenda_admin ON public.crm_agenda USING btree (admin_id, inicio);
CREATE INDEX crm_focus_events_lead_idx ON public.crm_focus_events USING btree (lead_id);
CREATE UNIQUE INDEX crm_focus_events_session_client_event_unique ON public.crm_focus_events USING btree (session_id, client_event_id);
CREATE INDEX crm_focus_events_session_idx ON public.crm_focus_events USING btree (session_id);
CREATE INDEX crm_focus_sessions_admin_ativa_idx ON public.crm_focus_sessions USING btree (admin_id, status) WHERE (status = 'ativa'::text);
CREATE INDEX idx_notif_admin ON public.crm_notificacoes USING btree (admin_id, lida, created_at DESC);
CREATE INDEX cron_runs_name_started_idx ON public.cron_runs USING btree (cron_name, started_at DESC);
CREATE INDEX cron_runs_status_idx ON public.cron_runs USING btree (status);
CREATE INDEX idx_midias_emp ON public.empreendimento_midias USING btree (empreendimento_id, ordem);
CREATE INDEX idx_midias_empreendimento ON public.empreendimento_midias USING btree (empreendimento_id);
CREATE INDEX idx_empreendimentos_status ON public.empreendimentos USING btree (status_venda);
CREATE INDEX idx_unidades_disp ON public.empreendimentos_unidades USING btree (empreendimento_id, disponivel);
CREATE INDEX idx_unidades_emp ON public.empreendimentos_unidades USING btree (empreendimento_id);
CREATE INDEX ig_content_calendar_data_idx ON public.ig_content_calendar USING btree (data);
CREATE INDEX ig_content_calendar_status_idx ON public.ig_content_calendar USING btree (status);
CREATE INDEX ig_metricas_semanais_semana_idx ON public.ig_metricas_semanais USING btree (semana_inicio DESC);
CREATE INDEX idx_interacoes_created ON public.interacoes USING btree (created_at DESC);
CREATE INDEX idx_interacoes_lead ON public.interacoes USING btree (lead_id);
CREATE INDEX idx_leads_estagio ON public.leads USING btree (estagio_funil);
CREATE INDEX idx_leads_proximo_followup ON public.leads USING btree (proximo_followup) WHERE (proximo_followup IS NOT NULL);
CREATE INDEX idx_leads_requer_atencao ON public.leads USING btree (requer_atencao) WHERE (requer_atencao = true);
CREATE INDEX idx_leads_status ON public.leads USING btree (status);
CREATE INDEX idx_leads_whatsapp ON public.leads USING btree (whatsapp);
CREATE INDEX leads_active_followup_idx ON public.leads USING btree (email_followup_etapa) WHERE (unsubscribed_at IS NULL);
CREATE INDEX leads_proximo_followup_idx ON public.leads USING btree (proximo_followup) WHERE (proximo_followup IS NOT NULL);
CREATE INDEX leads_utm_campaign_idx ON public.leads USING btree (utm_campaign);
CREATE INDEX leads_utm_source_idx ON public.leads USING btree (utm_source);
CREATE UNIQUE INDEX leads_whatsapp_unique ON public.leads USING btree (whatsapp) WHERE (whatsapp IS NOT NULL);
CREATE UNIQUE INDEX properties_slug_key ON public.properties USING btree (slug);

alter table public.admin_users enable row level security;
alter table public.agendamentos enable row level security;
alter table public.alertas_leilao enable row level security;
alter table public.automacao_email_passos enable row level security;
alter table public.automacao_whatsapp_intervalos enable row level security;
alter table public.automacao_whatsapp_mensagens enable row level security;
alter table public.campanha_destinatarios enable row level security;
alter table public.campanha_eventos enable row level security;
alter table public.campanhas enable row level security;
alter table public.configuracoes_cub enable row level security;
alter table public.construtoras enable row level security;
alter table public.crm_agenda enable row level security;
alter table public.crm_clientes enable row level security;
alter table public.crm_focus_events enable row level security;
alter table public.crm_focus_sessions enable row level security;
alter table public.crm_notificacoes enable row level security;
alter table public.crm_propostas enable row level security;
alter table public.cron_runs enable row level security;
alter table public.diferenciais_empreendimento enable row level security;
alter table public.empreendimento_midias enable row level security;
alter table public.empreendimentos enable row level security;
alter table public.empreendimentos_unidades enable row level security;
alter table public.ig_content_calendar enable row level security;
alter table public.ig_metricas_semanais enable row level security;
alter table public.interacoes enable row level security;
alter table public.lead_eventos enable row level security;
alter table public.lead_interacoes enable row level security;
alter table public.leads enable row level security;
alter table public.leads_interacoes enable row level security;
alter table public.password_reset_tokens enable row level security;
alter table public.properties enable row level security;
alter table public.tipologias enable row level security;

create policy service_role_all on public.agendamentos as PERMISSIVE for ALL to service_role using (true) with check (true);
create policy "permitir insert publico" on public.alertas_leilao as PERMISSIVE for INSERT to anon with check (true);
create policy read_construtoras on public.construtoras as PERMISSIVE for SELECT to anon using (true);
create policy service_role_all on public.construtoras as PERMISSIVE for ALL to service_role using (true) with check (true);
create policy service_role_all on public.diferenciais_empreendimento as PERMISSIVE for ALL to service_role using (true) with check (true);
create policy "Midias de empreendimentos publicados sao publicas" on public.empreendimento_midias as PERMISSIVE for SELECT to public using (true);
create policy auth_mid_all on public.empreendimento_midias as PERMISSIVE for ALL to public using ((auth.role() = 'authenticated'::text));
create policy pub_read_mid on public.empreendimento_midias as PERMISSIVE for SELECT to public using (true);
create policy service_role_all on public.empreendimentos as PERMISSIVE for ALL to service_role using (true) with check (true);
create policy service_role_all on public.interacoes as PERMISSIVE for ALL to service_role using (true) with check (true);
create policy insert_evento on public.lead_eventos as PERMISSIVE for INSERT to anon with check (true);
create policy read_eventos_service on public.lead_eventos as PERMISSIVE for SELECT to public using ((auth.role() = 'service_role'::text));
create policy "Qualquer um pode inserir lead_interacao" on public.lead_interacoes as PERMISSIVE for INSERT to public with check (true);
create policy auth_ins_inter on public.lead_interacoes as PERMISSIVE for INSERT to public with check ((auth.role() = 'authenticated'::text));
create policy auth_read_inter on public.lead_interacoes as PERMISSIVE for SELECT to public using ((auth.role() = 'authenticated'::text));
create policy insert_lead on public.leads as PERMISSIVE for INSERT to anon with check (true);
create policy read_leads on public.leads as PERMISSIVE for SELECT to public using ((auth.role() = 'service_role'::text));
create policy service_role_all on public.leads as PERMISSIVE for ALL to service_role using (true) with check (true);
create policy read_properties on public.properties as PERMISSIVE for SELECT to anon using (true);
create policy service_role_all on public.tipologias as PERMISSIVE for ALL to service_role using (true) with check (true);

CREATE OR REPLACE FUNCTION public.cancel_alert(p_token text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN UPDATE alertas_leilao SET ativo = false WHERE unsubscribe_token = p_token AND ativo = true; END; $function$;

CREATE OR REPLACE FUNCTION public.record_focus_event(p_session_id uuid, p_lead_id uuid, p_admin_id uuid, p_action_type text, p_previous_stage text, p_next_stage text, p_points integer, p_metadata jsonb, p_client_event_id uuid, p_is_skip boolean, p_is_primary boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_id uuid;
begin
  insert into crm_focus_events (
    session_id, lead_id, admin_id, action_type,
    previous_stage, next_stage, points, metadata, client_event_id
  ) values (
    p_session_id, p_lead_id, p_admin_id, p_action_type,
    p_previous_stage, p_next_stage, p_points, p_metadata, p_client_event_id
  )
  on conflict (session_id, client_event_id) do nothing
  returning id into v_id;

  if v_id is null then
    return jsonb_build_object('alreadyProcessed', true, 'points', 0);
  end if;

  update crm_focus_sessions
  set
    processed_leads = processed_leads + (case when p_is_primary and not p_is_skip then 1 else 0 end),
    skipped_leads = skipped_leads + (case when p_is_skip then 1 else 0 end),
    earned_points = earned_points + p_points,
    updated_at = now()
  where id = p_session_id;

  return jsonb_build_object('alreadyProcessed', false, 'points', p_points, 'eventId', v_id);
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;

revoke all on function public.record_focus_event(uuid, uuid, uuid, text, text, text, integer, jsonb, uuid, boolean, boolean) from public, anon, authenticated;
grant execute on function public.record_focus_event(uuid, uuid, uuid, text, text, text, integer, jsonb, uuid, boolean, boolean) to service_role;
