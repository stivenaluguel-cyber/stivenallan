# Funil Instagram → DM → Kanban

Funil de aquisição pelo Instagram do @ do corretor: transformar interação
(seguir, curtir, comentar, reagir a story) em conversa no DM, e conversa em
lead no CRM. A abordagem é **manual** — a Meta não fornece listas de
seguidores/curtidas/comentários via API, e disparo automatizado em massa é
risco direto de bloqueio da conta.

## As 4 etapas

1. **Ativação** — o operador olha as listas no app do Instagram (novos
   seguidores, curtidas, comentários, stories), registra quem vale abordar na
   fila de `/dashboard/ativacao`, copia o playbook renderizado e manda o DM à
   mão. Meta diária conservadora: ver `META_DIARIA_ABORDAGENS` em
   `src/lib/instagram/playbooks.ts`.
2. **Conversa** — quem responde é qualificado no próprio DM (morar × investir,
   entrada, prazo). Quando a conversa é real, vira lead no CRM
   (`origem: 'Instagram DM'`, `estagio_funil: 'primeiro_contato'`) e o card da
   fila é vinculado ao lead (`lead_id`) e movido para "Virou lead".
3. **Follow-up** — manual por opção (o WhatsApp automático está desligado no
   projeto): o Kanban de leads em `/dashboard/leads` e o modo foco puxam o
   ritmo; o link `wa.me` pré-preenchido faz a ponte DM → WhatsApp.
4. **Fechamento** — fluxo normal do CRM: simulação, tabela do empreendimento,
   proposta, estágios do funil de compradores.

## O que está implementado onde

| Peça | Arquivo |
| --- | --- |
| Playbooks de abordagem (1 por origem) | `src/lib/instagram/playbooks.ts` |
| Vocabulário/tipos da fila + contador diário | `src/lib/instagram/ativacoes.ts` |
| Tabela da fila (`crm_ativacoes_instagram`) | `supabase/migrations/20260731003100_crm_ativacoes_instagram.sql` |
| API da fila (GET/POST lote/PATCH parcial/DELETE) | `src/app/api/admin/ativacoes/route.ts` |
| Kanban de ativação (5 status, copiar abordagem) | `src/app/dashboard/ativacao/page.tsx` |
| Webhook de DM (cria lead + interação) | `src/app/api/webhook/instagram/route.ts` |
| Dedup de lead por IGSID | `src/lib/leads/upsert-instagram-lead.ts` |

## Estado real da integração com a Meta (30/07/2026)

- Webhook **registrado** no app `crm-leads-webhook`: objeto `instagram`
  apontando para `/api/webhook/instagram`, resposta `{"success":true}` em
  29/07/2026. A validação HMAC e o handshake `hub.challenge` estão no ar.
- **Bloqueio atual**: a assinatura na conta do Instagram falha porque o App
  não tem a capacidade de mensagens. Erro literal da Meta:
  `(#3) Application does not have the capability to make this API call`.
- **Consequência prática**: enquanto a capacidade não for liberada no App
  (permissões de Instagram Messaging + revisão da Meta, se exigida), os DMs
  recebidos NÃO chegam ao webhook e não viram card/lead sozinhos. O funil
  roda 100% pela fila de ativação manual até lá.
