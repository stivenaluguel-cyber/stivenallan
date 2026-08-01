# Rollout de 30 dias — funil IG → DM → Kanban

Fases do método adaptadas para a realidade da conta (nunca abordou em massa,
campanhas pausadas, webhook de DM ainda bloqueado pela Meta). Cada semana só
começa se a anterior fechou dentro das regras.

## Semana 1 — Ativação manual (R$ 0)

- Preencher a fila em `/dashboard/ativacao` com novos seguidores, curtidas,
  comentários e reações de story olhados no próprio app.
- Abordar usando os playbooks copiados da fila — meta de 20/dia
  (`META_DIARIA_ABORDAGENS`), sem exceção nos primeiros dias.
- Objetivo da semana: rotina redonda de abordagem + resposta, e primeiros
  cards em "Respondeu"/"Virou lead".

## Semana 2 — Aquisição paga (R$ 5,50/dia)

- Reativar a campanha de visitas ao perfil (`120247009933030778`).
- Acompanhar custo por visita diariamente contra a régua do
  `benchmarks.md` (≤ 0,30 ok · 0,31–0,39 observar · ≥ 0,40 sugerir pausa).
- A fila de ativação continua — anúncio traz visita, quem vira seguidor entra
  na fila como `novo_seguidor`.

## Semana 3 — + Remarketing (R$ 5,50/dia)

- Reativar a campanha de DM remarketing (`120247009936300778`, público de
  engajadores IG 365d).
- DM que chegar por anúncio é respondido no mesmo dia; conversa real vira
  lead no CRM e o card é vinculado.

## Semana 4 — Escalar para R$ 15/dia (condicional)

Escalar **somente se as duas condições valerem ao mesmo tempo**:

1. Custo por visita dentro da meta (≤ R$ 0,30) na semana inteira.
2. SLA de resposta ok — DMs e leads respondidos no mesmo dia, contador de
   abordagens batendo a meta sem acumular pendência.

Se uma das duas falhar, manter R$ 11/dia e corrigir o gargalo primeiro.

## Guardrails (valem nas 4 semanas)

- **Sem scraping** de listas de seguidores/engajamento — a fila é manual.
- **Sem disparo em massa** nem automação de DM.
- **Parar no primeiro aviso da conta** (limite de ação, aviso de spam,
  qualquer restrição) e só voltar dias depois, com volume menor.
- **Respeitar o "não quero"**: pediu pra parar, vira `ignorado` e não recebe
  mais nada.
- **LGPD**: registrar só o que a pessoa tornou público (username, interação);
  nada de compilar dados pessoais de outras fontes; apagar registro se a
  pessoa pedir.
