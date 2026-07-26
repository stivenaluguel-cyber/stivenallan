-- Caixa de entrada de conversas WhatsApp: flag de pausa da IA quando o
-- corretor assume a conversa manualmente pelo painel + unique index em
-- leads.whatsapp (necessário pro upsert atômico no webhook, que passa a
-- resolver-ou-criar o lead em TODO inbound message, não só quando a IA
-- chama atualizar_lead).

alter table leads add column if not exists atendimento_humano_ativo boolean not null default false;

create unique index if not exists leads_whatsapp_unique on leads(whatsapp) where whatsapp is not null;
