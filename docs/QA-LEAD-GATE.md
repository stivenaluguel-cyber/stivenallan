# Lead gate — estado, achados e QA executada

> **QA funcional EXECUTADA em 05/08/2026 com a service role real.** Resultado
> passo a passo em §10, no fim deste documento. Um P0 novo foi encontrado e
> corrigido (banner de cookies enterrando o formulário). O que ficou de fora:
> a tela do Kanban, que exige login de admin.


Documento de retomada. **Não contém segredo nenhum** — só nomes de variáveis.

Última atualização: 05/08/2026, madrugada. Trabalho autônomo sem a service role.

---

## 1. Estado atual

| Item | Situação |
|---|---|
| Branch | `feat/lead-gate-cadastro-unico` |
| Worktree | `stivenallan-lead-gate` |
| HEAD | `b804ef0` |
| Publicado no remoto | até `4363ed3`. **Os 8 commits novos são locais** — nada foi enviado |
| Drift com `origin/main` | nenhum. `origin/main` continua em `a73a1e7` |
| Diff vs main | 55 arquivos, +4002 / −28 |
| `TZ=UTC npx vitest run` | 1740 testes, 136 arquivos, tudo verde |
| `npx tsc --noEmit` | limpo |
| `npm run build` | sai com 0 |
| `npm run lint` | **não configurado** — `next lint` abre prompt interativo pedindo pra criar ESLint. Não criei config: seria decisão ampla, fora do escopo desta QA |
| Produção | intocada. Migration não aplicada, flags inexistentes na Vercel, nenhum merge/deploy |

### Commits locais

```
b804ef0 docs(lead-gate): resultado da QA funcional executada com a chave real
7c6d945 fix(lead-gate): banner de cookies enterrava o formulário no 1º acesso
ff8c861 docs(lead-gate): estado, achados e roteiro de QA para retomada
74b4c7d fix(lead-gate): acessibilidade do formulário e do painel
1e759ed fix(lead-gate): build sorteava quais páginas saíam estáticas
f63d692 fix(lead-gate): 4 bugs de identidade em resolve_lead_for_gate
c5c3497 fix(lead-gate): conteúdo protegido vazava no HTML estático do ISR
6a68bcd fix(sentry): token de sessão e JWT de admin iam em claro pro Sentry
d041ee4 fix(analytics): interruptor real de mensuração; ID falso não desligava nada
```

Cada um tem a evidência completa na mensagem. Nenhum `push`, conforme combinado.

---

## 2. Bancos

| | project_ref | Papel |
|---|---|---|
| Produção | `xpkznaqgctfkoonqpcye` | **não tocar.** Confirmado sem as tabelas novas |
| Descartável | `pauvicgtaqgulwdxwcgf` | schema completo reconstruído, baseline limpo |

**Como o descartável foi montado:** 22 migrations reais aplicadas em ordem
cronológica (os 10 arquivos "marcador histórico", que contêm só `SELECT 1;`,
foram pulados de propósito — o DDL real deles já está no baseline), depois a
migration da feature. 55 tabelas no schema `public`.

**Estado dos dados agora:** 3 `properties` de seed **mais os dados sintéticos
da QA executada** (6 leads `QA_LEAD_GATE`, 7 sessões, 7 interesses, 11
eventos). Deixei tudo no lugar para você poder revisar — inventário e SQL de
limpeza em §10.

Properties de seed:
- `parco-savello-santa-barbara-criciuma-sc` (9 fotos, 7 plantas sintéticas)
- `monte-leone-centro-criciuma-sc`
- `piazza-castello-centro-icara-sc`

---

## 3. Variáveis necessárias (só nomes)

Já preenchidas em `.env.local` (chmod 600, gitignored, confirmado):

```
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL              -> aponta pro descartável
NEXT_PUBLIC_SUPABASE_ANON_KEY         -> anon do descartável
LEAD_GATE_ENABLED                     -> true
LEAD_GATE_SLUGS                       -> parco-savello-santa-barbara-criciuma-sc
LEAD_PROPERTY_HISTORY_ENABLED         -> true
NEXT_PUBLIC_ANALYTICS_DISABLED        -> true
```

```
SUPABASE_SERVICE_ROLE_KEY             -> preenchida em 05/08, formato sb_secret_
```

Deixadas ausentes de propósito: `META_CAPI_TOKEN`, `EVOLUTION_API_URL`,
`EVOLUTION_API_KEY`, `RESEND_API_KEY`.

---

## 4. Bugs encontrados e corrigidos

Todos reproduzidos antes de corrigir — nenhum veio só de leitura de código.

### P0 — Conteúdo protegido vazava no HTML estático (`c5c3497`)

O status default do contexto era `'unlocked'`. No SSR não há cookie nem fetch,
então o default é o que vale, e o `GatedContent` caía no ramo liberado e
escrevia o conteúdo dentro do HTML. As 36 páginas são ISR (`revalidate = 3600`):
esse HTML é gerado uma vez e servido igual para todos. `curl` bastava.

Teste novo (`gated-content-ssr.test.tsx`) faz `renderToStaticMarkup` e afirma
que a marcação não contém o conteúdo. **Confirmei que ele falha com o default
antigo restaurado** — é guarda de verdade.

Alcance real: latente, porque `GatedContent` ainda não tem ponto de uso (ver §6).

### P1 — Token de sessão e JWT de admin iam em claro pro Sentry (`6a68bcd`)

Não é específico do lead gate: **já vale para produção hoje**, com o
`dashboard_token`.

Sem `dataCollection` explícito, `cookies` não resolve para `false` — vira um
objeto com deny-list, e a regra do SDK é `include.cookies = cookies !== false`.
A deny-list padrão cobre `forwarded`, `-ip`, `remote-`, `via`, `-user`; nenhum
casa com `sa_session` nem `dashboard_token`. Verifiquei executando
`resolveDataCollectionOptions` do SDK instalado (10.65.0) com a config real do
projeto, não por leitura.

No caminho de **evento** os headers são copiados sem passar por deny-list
nenhuma — a filtragem só existe no caminho de span. Por isso a correção tem duas
camadas: `dataCollection: { cookies: false }` e um `beforeSend` que remove o
header `Cookie`. Os outros headers ficam: jogar user-agent e referer fora
tornaria erro de produção indiagnosticável.

### P1 — Analytics: ID falso não desligava nada (`d041ee4`)

`NEXT_PUBLIC_GA4_ID` **não existe na Vercel** — produção depende só do fallback
hardcoded. Qualquer ambiente sem env própria manda dado pras contas reais.

O detalhe que muda a solução: pôr um ID falso não resolve. O `<Script>` do GA4
monta `googletagmanager.com/gtag/js?id=<falso>` e baixa; o snippet do Pixel
baixa `connect.facebook.net` **antes** de usar o id. A requisição sai igual.
`AnalyticsScripts.tsx` renderizava o Pixel checando só o consentimento, nunca o
id.

Agora `NEXT_PUBLIC_ANALYTICS_DISABLED` zera todos os ids (inclusive o pixel
hardcoded do Casa Guaíba Park) e o componente exige id não-vazio. Corrigiu de
quebra um bug latente: o src era `analytics ? GA4_ID : GADS_ID`, então com GA4
vazio aceitar analytics **impedia** o Google Ads de carregar.

Fallback de produção preservado de propósito — removê-lo derrubaria a
mensuração hoje. O teste trava esse valor para o remédio não virar apagão.

### P1 — 4 bugs de identidade em `resolve_lead_for_gate` (`f63d692`)

Reproduzidos e revalidados contra o Postgres do descartável.

1. **Busca por e-mail case-sensitive e sem índice.** `where email = p_email` num
   banco cujo dado gravado não é normalizado (`/api/admin/leads` grava
   `body.email` cru). Reproduzido: e-mail em caixa diferente **criava lead
   duplicado**. E o `leads_email_lower_idx` é funcional em `lower(email)`, então
   nunca casava — `EXPLAIN` mostrava `Seq Scan on leads` a cada submissão; o
   índice criado nessa mesma migration estava **morto**. Agora
   `lower(email) = lower(p_email)`: `EXPLAIN` passa a `Index Scan`.
2. **Conflito contaminava o e-mail.** Detectado o conflito, caía no merge
   normal com `email = coalesce(email, p_email)`. Com o lead do telefone sem
   e-mail (típico de lead de WhatsApp/Instagram), ele **recebia o e-mail do
   outro lead**. Reproduzido: dois leads passaram a compartilhar o mesmo
   endereço, permanentemente e sem UNIQUE para impedir.
3. **Conflito reinserido a cada submissão.** Reproduzido: 2 submissões = 2
   linhas na fila de revisão. Agora índice único parcial por par normalizado.
   Revalidado: 3 submissões = 1 linha.
4. **Corrida na criação devolvia HTTP 500.** `FOR UPDATE` não trava linha que
   ainda não existe. A perdedora batia no unique e o 23505 virava 500 — usuário
   sem cookie e sem conteúdo, apesar de o lead dele já existir. Agora
   insert-otimista-com-catch, mesmo padrão de `upsert-instagram-lead.ts`.
   Handler exercitado isoladamente no banco.

### P1 — Build sorteava quais páginas saíam estáticas (`1e759ed`)

Esta branch pôs uma consulta ao Supabase dentro de `RelatedProperties`, que é o
ponto único renderizado pelas 36 páginas — virou uma ida à rede por página
durante o build. No Next 15, fetch não cacheado em Server Component tira a rota
do prerender, e como isso depende de concluir a chamada, o resultado passou a
variar por **latência**:

```
mesmo commit, dois builds limpos -> 8 e 28 páginas dinâmicas
```

Descoberto porque duas execuções do mesmo build discordaram. Antes de culpar a
edição em curso, reconstruí o mesmo HEAD duas vezes e reproduzi a divergência
sem alteração nenhuma.

Corrigido com `next: { revalidate: 3600 }` no fetch. Medido depois, 3 builds
limpos: **9, 9, 10** — 20 páginas deixaram de oscilar. Parco Savello sai
estática com `revalidate 1h` nos 3.

**Não ficou 100% determinístico:** restam 2 páginas oscilando e 7 sempre
dinâmicas. Parte delas nem declara `export const revalidate`, o que sugere causa
própria e anterior. Não confirmei contra `origin/main` — fica como pendência.

### P1/P2 — Acessibilidade (`74b4c7d`)

- `name` + `autoComplete` nos 3 campos pessoais (WCAG 1.3.5 AA).
- `aria-describedby` nos selects e no checkbox — o foco pós-submit vai pro
  primeiro campo inválido; se fosse select, anunciava "inválido" sem o motivo.
- **Latch no painel.** `shouldShowEarlyGate` é uma FAIXA (25–40%), não limiar:
  passar de 40% desmontava o painel e **destruía tudo que o usuário digitara**.
  Rolar é o reflexo de quem quer ver o que o painel cobre, e abrir o teclado
  muda `innerHeight` (logo, a fração) sem rolagem nenhuma.
- **Escape fecha** e devolve o foco. O × ficava dentro do container rolável:
  sumia do topo assim que o usuário descia até os selects — com o painel
  ocupando 70% da tela, era ficar preso.
- **Painel não cobre mais o botão de WhatsApp.** Era full-width opaco com
  z-index 60 contra os 50 do `WppFloat`.
- Altura em `dvh` + safe-area: com `vh`, o teclado virtual escondia o botão de
  enviar sem forma de alcançar.

---

## 5. Achado de segurança — Vercel (aberto, nada executado)

**Preview herda `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e
`SUPABASE_SERVICE_ROLE_KEY` de produção.** Severidade alta.

Evidência (`vercel env ls production`, sem valores):

```
SUPABASE_SERVICE_ROLE_KEY      Encrypted    Preview, Production    41d
NEXT_PUBLIC_SUPABASE_URL       Encrypted    Preview, Production    41d
NEXT_PUBLIC_SUPABASE_ANON_KEY  Encrypted    Preview, Production    41d
```

Toda Preview de qualquer branch roda com a `service_role` de produção — chave
que ignora RLS e tem escrita total sobre os leads. O escopo `Preview` não é por
branch: vale para todas.

**Classificação da afirmação "qualquer PR público recebe os segredos":
PROVÁVEL, não comprovado.** O que está comprovado é que o repositório é público
(`githubRepoVisibility: "public"`) e que as três variáveis estão no escopo
Preview. O que **não** verifiquei é a configuração de build de PRs de fork
desta conta — Vercel tem proteção própria para forks, e não consegui confirmá-la
por leitura. Não trate como comprovado sem checar.

**Exposição concreta hoje:** o push da branch gerou o Preview
`dpl_2AxjjJ9oEaQTm8i8DNxhaPGvSbJr` (READY), apontando pro banco de produção.
Está **inofensivo** porque `LEAD_GATE_ENABLED` não existe em nenhum ambiente da
Vercel — nenhuma rota nova executa. Não usei nem liguei flag nele.

**Varredura do bundle client-side** (`.next/static`, build real):

| Procurado | Ocorrências |
|---|---|
| `sb_secret` | 0 |
| `SUPABASE_SERVICE_ROLE_KEY` | 0 |
| JWT com `role: service_role` | 0 |
| literal `service_role` | 0 |
| source maps (`.map`) publicados | 0 |

**Sem segredo no bundle.**

Os IDs de GA4/Pixel **continuam presentes** como string mesmo com o kill switch
ligado — mas como código inalcançável, não como configuração ativa. Verifiquei
o bundle gerado:

```js
d = "true".trim().toLowerCase(),  u = ""!==d && "false"!==d && "0"!==d,   // u = true
p = u ? "" : (…||"G-5TWF0JTG8H"),   f = u ? "" : (…||"364836344657445"),
m = u ? {} : {"/casa-guaiba-park":"1796321424680587"}
```

Ou seja: `u` é `true`, então os ids resolvem para `""`/`{}` e o
`AnalyticsScripts` não injeta script nenhum. O minificador só não removeu as
strings mortas do outro ramo do ternário. Não é vazamento — measurement ID de
GA4 e ID de Pixel são públicos por natureza (aparecem em qualquer requisição).

### Plano de restrição (não executado, aguarda autorização)

| Ambiente | URL / ANON | SERVICE_ROLE |
|---|---|---|
| Production | produção | produção |
| Preview por branch | banco isolado da branch | do banco isolado |
| Preview sem branch definida | isolado padrão, leitura | **ausente** |
| Development | local/QA | do local/QA |

Ordem que **não** deixa produção sem variável:

1. Adicionar as 3 com escopo `preview` + `--git-branch` para cada branch que
   precise de banco isolado. Variável com branch tem precedência, então isso já
   protege sem tirar nada de ninguém.
2. Criar o par padrão de Preview apontando pro isolado permanente, **sem**
   `SUPABASE_SERVICE_ROLE_KEY` — assim branch sem config falha visivelmente em
   vez de escrever em produção calada.
3. Só então recriar as 3 com escopo **`production` apenas**.
4. Adicionar `development`.
5. Redeploy de produção + um Preview descartável para confirmar.

Fazer o passo 3 antes do 2 abre janela em que Previews quebram no build.

**Questão separada:** rotacionar a `service_role` de produção. Ela esteve
disponível em toda Preview construída nos últimos 41 dias, de um repositório
público. Não sei dizer se houve acesso indevido. Exige atualizar a variável e
redeployar — decisão sua, fora do escopo desta QA.

---

## 6. Pendências

### Bloqueante

**A service role do descartável não está no `.env.local`.** Sem ela as rotas do
gate não escrevem e a QA funcional não roda. É a única coisa que me impediu de
executar os 20 passos.

### Achado de escopo — a metade "liberação progressiva" não está ligada

`GatedContent` e `WhatsAppAfterLead` têm **zero pontos de uso**. Confirmado por
grep: fora dos próprios arquivos, só aparecem em comentários.

Na prática, hoje o piloto no Parco Savello:
- ✅ mostra o formulário (25–40% e no rodapé)
- ✅ intercepta clique de WhatsApp
- ✅ registra interesse e alimenta o Kanban
- ❌ **não bloqueia foto, planta, disponibilidade ou catálogo**

A infraestrutura existe e está testada, mas nenhuma página a chama. Se a
expectativa era ver conteúdo bloqueado amanhã, isso precisa ser plugado antes —
é trabalho de integração nas páginas, não de componente.

### Não corrigido, precisa de decisão sua

1. **Normalização de telefone divergente.** O gate usa `normalizarCelularBR`
   (tira o DDI); todo o resto usa `normalizePhone` (mantém). Um lead do Meta Ads
   entra como `5548999998888` e o gate procura `48999998888` — não acha, e cria
   duplicado. É exatamente o cenário que o cadastro único deveria resolver, e o
   de maior volume. Corrigir exige mexer nos fluxos existentes **e** fazer
   backfill dos dados já gravados: decisão de dados, não de código.
2. **Contraste.** Bronze como texto dá 4.14:1 (exigido 4.5:1) e a borda dos
   campos 1.17:1 (exigido 3:1) — os campos ficam quase invisíveis contra o
   fundo. Mexer no token afeta o site inteiro.
3. **Sem endpoint de revogação de sessão.** `revoked_at` é lido em toda leitura
   mas nada nunca escreve nele. Um titular que peça exclusão (LGPD) ou um token
   vazado só se corta por `DELETE` manual. Com TTL de 180 dias e sem rotação, um
   comprometimento é permanente na prática.
4. **Sem faxina de sessões.** O índice por `expires_at` foi criado prevendo um
   job que não existe. Cada submissão cria sessão nova, sem revogar as
   anteriores.
5. **PII em `localStorage` nas rotas legadas.** `FormContato` e
   `LeadCaptureModal` gravam `{id, nome}` do lead em claro — na mesma página
   onde o gate atua, o que anula a promessa de "lead_id nunca sai do servidor".
6. **2 páginas ainda oscilam** entre estático e dinâmico no build (§4).

---

## 7. Quando você inserir a chave amanhã

### Passo 0 — preencher

Dashboard do Supabase → projeto `pauvicgtaqgulwdxwcgf` → Project Settings →
API Keys → aba **Secret keys** → copiar para `SUPABASE_SERVICE_ROLE_KEY` em
`.env.local`. Confira o ref no topo da página antes de copiar.

### Passo 1 e 2 — validar sem imprimir valor

```bash
node node_modules/.qa-verify-env.mjs
```

Esse script já existe e imprime **só booleanos**. Ele confere o `project_ref`
extraído da URL, se o ref de produção aparece em algum valor, se a service role
foi mesmo preenchida, se o analytics está desligado, se Evolution/Resend estão
ausentes — e faz uma prova funcional: lê `lead_access_sessions` (RLS ligada, sem
policy) com a service role e confirma que a mesma leitura com a anon é
bloqueada. Se a chave estiver errada ou for de outro projeto, ele acusa
`Invalid API key`.

Não siga adiante se qualquer linha vier com ✗.

### Passo 3 — subir o servidor

```bash
npm run dev
```

**Não use o Vercel Preview** — ele herda credenciais de produção (§5).

### Passos 4 a 10 — roteiro funcional

| # | Passo | O que confirmar |
|---|---|---|
| 4 | Abrir Parco Savello, rolar até ~30% | painel aparece; conteúdo público legível; WhatsApp flutuante **visível** |
| 5 | Clicar num CTA de WhatsApp | não navega; rola até o formulário e foca o 1º campo |
| 6 | Submeter vazio | 7 mensagens específicas; foco no 1º inválido; nenhum retorno silencioso |
| 7 | Cadastrar `QA_LEAD_GATE Teste` | "Informações liberadas"; sem reload; sem pulo de scroll |
| 8 | DevTools → Application → Cookies | `sa_session` com HttpOnly; **sem** Secure (dev é http); SameSite Lax; Path `/` |
| 9 | DevTools → Network | zero requisição a google-analytics, googletagmanager, connect.facebook.net, graph.facebook.com, Evolution e ao Supabase de produção |
| 10 | Abrir Monte Leone no mesmo navegador | **não** pede cadastro de novo |
| 11 | Clicar WhatsApp já liberado | abre direto, contextualizado |
| 12 | Kanban → abrir o lead | chip "Interesses" e o drawer com os 2 empreendimentos |
| 13 | Aba anônima, mesmo telefone/e-mail | reconhece, **não** duplica |
| 14 | Revogar: `update lead_access_sessions set revoked_at = now()` | gate volta a aparecer |
| 15 | Adulterar o cookie à mão | gate volta; cookie é limpo |
| 16 | 6 submissões seguidas | 429 na 6ª (limite 5/60s) |
| 17 | Abrir Piazza Castello (fora de `LEAD_GATE_SLUGS`) | comportamento antigo, sem gate |
| 18 | Teclado só (Tab/Enter/Escape) | tudo alcançável; Escape fecha; foco volta |
| 19 | 360×800, 390×844, 768×1024, 1440×900 | sem overflow horizontal; botão de enviar alcançável com teclado aberto |
| 20 | Zoom 200% | formulário utilizável |

### Queries de validação

```sql
select whatsapp, nome, email, status, estagio_funil, property_name
  from leads order by created_at desc;

select property_slug, view_count, unlocked_at is not null as liberou,
       whatsapp_clicked_at, gallery_viewed_at, floorplan_viewed_at
  from lead_property_interests order by last_seen_at desc;

select count(*) as sessoes_ativas from lead_access_sessions
 where revoked_at is null and expires_at > now();

select * from lead_identity_conflicts where resolved_at is null;
```

### Limpeza (só dados de QA)

```sql
delete from lead_identity_conflicts;
delete from lead_property_interests;
delete from lead_access_sessions;
delete from lead_eventos;
delete from leads where nome like 'QA_LEAD_GATE%';
```

As 3 `properties` de seed podem ficar — são sintéticas e o banco é descartável.

---

## 8. Checklist antes de cogitar produção

- [ ] Decidir a normalização de telefone e o backfill (§6.1)
- [ ] Plugar `GatedContent` nas seções, ou assumir que o piloto é só formulário
- [ ] Criar endpoint de revogação de sessão
- [ ] Corrigir contraste
- [ ] Aplicar o plano de escopo de env da Vercel (§5)
- [ ] Decidir sobre rotacionar a service role de produção
- [ ] Rodar o roteiro de 20 passos com a chave
- [ ] Revisar os 6 commits locais e só então `push`
- [ ] Aplicar a migration em produção — **exige sua autorização explícita**

## 9. Rollback

`supabase/rollback/20260805003000_lead_gate_identity_and_sessions_rollback.sql`.

Confirmei via query read-only que **os 13 objetos nomeados nele existem com o
nome exato** no descartável — com `IF EXISTS`, um typo faria o objeto sobreviver
ao rollback em silêncio. O índice novo de conflitos não precisou entrar: cai
junto no `drop table`.

Não executei o rollback: derrubaria o schema que a QA de amanhã precisa.

Atenção: o rollback **remove colunas** de `lead_eventos`, então destrói o dado
gravado nelas depois da migration.

---

## 10. QA funcional executada — 05/08/2026

Servidor local `npm run dev` na porta 3007, apontando só para o descartável.
**O Vercel Preview não foi usado** (herda credencial de produção, §5).

### Gates de segurança antes de começar

Todos verdes: `project_ref` = `pauvicgtaqgulwdxwcgf`; ref de produção ausente
de qualquer valor de variável; service role provada com privilégio real
(leu `lead_access_sessions`, que tem RLS ligada e zero policy, enquanto a
mesma leitura com a chave anon veio bloqueada).

**Rede durante toda a sessão: 100% em `localhost:3007`.** Zero requisição para
google-analytics, googletagmanager, connect.facebook.net, graph.facebook.com,
Evolution ou Supabase de produção. Verificado no painel de rede, não presumido.

### Resultados

| # | Passo | Resultado |
|---|---|---|
| 1 | Página carrega, gate ativo | ✅ `/api/lead-access/status` → `{unlocked:false}` |
| 2 | Painel aparece na faixa 25–40% | ✅ apareceu em 0,30 |
| 3 | WhatsApp interceptado com gate bloqueado | ✅ clique cancelado, URL intacta |
| 4 | Submit vazio → erro por campo | ✅ 3 mensagens específicas, `aria-describedby` ligado, foco no 1º inválido |
| 5 | Cadastro completo | ✅ lead + sessão + interesse + 3 eventos gravados |
| 6 | Cookie `sa_session` | ✅ `HttpOnly`, `SameSite=lax`, `Path=/`, 180 dias, sem `Secure` (correto em http) e invisível ao JS |
| 7 | Telefone normalizado | ✅ `(48) 90000-1234` → `48900001234` |
| 8 | Dedup por e-mail em caixa mista | ✅ `QA.Lead.Gate.MARIA@…` casou com o lead existente — 1 lead, 0 conflitos |
| 9 | Segundo empreendimento | ✅ sem novo cadastro, sessão reconhecida |
| 10 | WhatsApp já liberado | ✅ abre direto, sem interceptar |
| 11 | Histórico de interesses | ✅ 2 empreendimentos, `view_count` 1 em cada |
| 12 | Dados do chip/drawer do Kanban | ✅ query devolve os 2 empreendimentos com datas e marcos |
| 13 | Revogar sessão no banco | ✅ status volta a `false`, `/lead-track` → 401 |
| 14 | Cookie adulterado | ✅ `{unlocked:false}` + `Set-Cookie` de expiração |
| 15 | Sem cookie | ✅ `{unlocked:false}`; `/lead-track` → 401 |
| 16 | Rate limit (5/60s) | ✅ 1–5 → 201, 6ª e 7ª → 429 |
| 17 | Honeypot preenchido | ✅ 400, nenhum lead criado |
| 18 | Consentimento desmarcado | ✅ 400, nenhum lead criado |
| 19 | `propertyId` de outro imóvel com slug do Parco | ✅ 400 — o servidor revalida o par |
| 20 | Slug fora do piloto (Piazza Castello) | ✅ formulário legado "Tenho interesse", WhatsApp NÃO interceptado |
| 21 | Escape fecha o painel | ✅ fecha (assíncrono, um tick depois) |
| 22 | Latch: rolar para fora da faixa | ✅ painel permanece aberto, dado digitado preservado |

### Breakpoints

| Viewport | Altura do painel | Reserva do WhatsApp | × dentro da tela | Alvos < 24px | Overflow horizontal |
|---|---|---|---|---|---|
| 360×800 | 560 (70dvh) | 88px | ✅ 44×44 | 0 | não |
| 390×844 | 591 (70dvh) | 88px | ✅ | 0 | não |
| 768×1024 | 717 (70dvh) | 93px | ✅ | 0 | não |
| 1440×900 | 630 (70dvh) | 93px | ✅ | 0 | não |

(93px nos maiores = 88 + largura da barra de rolagem.)

### P0 novo encontrado e corrigido — `7c6d945`

**O banner de cookies enterrava o formulário no primeiro acesso.** Os dois são
`position: fixed` no rodapé; o banner tem z-index 9999 contra os 60 do painel.
Medido em 375×812: **232px do painel cobertos**, exatamente a faixa do checkbox
de consentimento e do botão de enviar.

Só aparece para quem chega pela primeira vez — que é precisamente o público que
o gate existe para converter. Nenhum teste unitário pegaria: depende de dois
elementos fixos coexistirem numa tela real.

Corrigido fazendo o painel esperar a decisão de cookies. Não empilhei o painel
acima do banner de propósito: isso obrigaria a pessoa a decidir sobre
privacidade e sobre entregar os dados ao mesmo tempo, com o aviso de
privacidade escondido atrás do formulário que coleta os dados.

### O que NÃO foi verificado

- **Tela do Kanban.** Exige login de admin, e não posso digitar senha. Verifiquei
  os dados que a alimentam (query do chip e do drawer), não o visual.
- **Leitor de tela real.** Verifiquei a semântica (`aria-describedby`, `role`,
  labels, foco), não o comportamento do VoiceOver/NVDA.
- **Teclado virtual real.** O `dvh` está aplicado, mas só um aparelho físico
  confirma o comportamento com o teclado aberto.
- **Contraste.** Segue como pendência (§6.2) — decisão de token, afeta o site todo.

### Dados sintéticos deixados no descartável

Deixei tudo no banco para você revisar. Nada de PII real; todos os nomes têm o
prefixo `QA_LEAD_GATE`, telefones na faixa `489000xxxxx` e e-mails em
`@exemplo.invalid`.

| Tabela | Linhas |
|---|---|
| `leads` | 6 (1 do fluxo completo + 5 do teste de rate limit) |
| `lead_access_sessions` | 7 |
| `lead_property_interests` | 7 |
| `lead_eventos` | 11 |
| `lead_identity_conflicts` | 0 |
| `properties` | 3 (seed) |

Limpeza quando quiser, com o SQL do §7.

---

## 11. Liberação progressiva conectada — 05/08/2026 (commit `dfe0c6c`)

### Mapa do conteúdo

**Público (prévia, sem cadastro)**

| Bloco | Detalhe |
|---|---|
| Hero + imagem principal | completo |
| Nome, construtora, cidade/bairro | completo |
| Status e previsão de entrega | maio/2028, Santa Bárbara |
| Resumo e especificações | 3 dorm (2 suítes), 93–94 m², vaga |
| Galeria | **4 das 8 fotos** (hero, fachada, vista aérea, acesso principal) |
| Diferenciais | os 11 |
| Lazer e amenidades | as 12 |
| Localização | completo |
| Financiamento direto | explicação geral + os 3 passos |
| FAQ (SEO/JSON-LD) | completo |
| CRECI, privacidade, rodapé | completo |

**Atrás do cadastro**

| Bloco | Detalhe |
|---|---|
| Galeria | as outras **4 fotos** (torre, entorno, lazer, paisagismo) |
| Plantas | as **7 oficiais**, com metragem |
| Disponibilidade | espelho por unidade |
| Catálogo/materiais | `LeadCaptureButton` com `gateEnabled` |
| CTA de WhatsApp contextualizado | "Falar sobre estas plantas" |

Nenhuma contagem foi inventada: os teasers calculam por subtração sobre os
dados reais da página.

### O achado que mudou a arquitetura

Envolver os blocos em `<GatedContent>` passando o conteúdo como `children`
**não protege nada**. Medido no HTML servido a um visitante sem cookie:

```
\"galeria\":[{\"src\":\"https://estilofontana.com.br/.../apartamento-tipo-final-01...\"}]
```

`GatedContent` é Client Component, e o Next serializa os `children` no payload
RSC embutido no HTML — mesmo sem renderizá-los. As 7 URLs de planta e as 4
fotos restritas saíam para qualquer `curl`.

Ler o cookie no servidor também não resolve: `cookies()` tira a rota do cache
estático, e as 36 páginas são `revalidate = 3600` de propósito.

**Arquitetura adotada:** o conteúdo restrito vive em
`lib/lead-gate/conteudo-restrito.ts` (marcado `server-only`), só as CONTAGENS
atravessam para o lado público, e `/api/lead-gate/content` entrega os itens
após validar a sessão. `ConteudoLiberado` busca de lá depois do desbloqueio.

`/api/espelho/[slug]` passou a exigir sessão **só nos slugs do piloto** — sem
isso, gatear o espelho na página seria teatro. As 35 páginas fora do piloto
seguem anônimas (verificado: Piazza Castello continua 200).

### Verificações

| Verificação | Resultado |
|---|---|
| HTML anônimo: URLs de planta | **0** (antes: 7) |
| HTML anônimo: fotos restritas | **0** (antes: 4) |
| HTML anônimo: conteúdo público | íntegro (diferenciais, amenidades, financiamento, CRECI) |
| Teasers com contagem real | "Mais 4 imagens", "7 plantas oficiais" |
| `/api/lead-gate/content` sem sessão | 401 |
| `/api/espelho/parco-savello` sem sessão | 401 |
| `/api/espelho/piazza-castello` (fora do piloto) | 200, inalterado |
| Cadastro → sessão | 201, `{unlocked:true}` |
| API entrega plantas com sessão | 7 itens |
| Após recarregar: plantas no DOM | 7 |
| Após recarregar: fotos restritas no DOM | 4 |
| Teaser some, formulário do rodapé some | sim |
| CTA "Falar sobre estas plantas" | presente, com mensagem citando a planta |
| Marcos no banco | `unlocked_at`, `floorplan_viewed_at`, `gallery_viewed_at` |
| Build | Parco `○` estático, `revalidate 1h` |
| Testes / tsc | 1740 verdes / limpo |

### Bloqueios encontrados

**1. Dev server não carrega Client Components novos.** Qualquer arquivo de
client component recém-criado falha na hidratação com
`Cannot read properties of undefined (reading 'call')` em `options.factory`.
Provado com um componente trivial (`ProbeNovo`) que só renderiza uma `<div>`:
o servidor entrega o HTML certo, o cliente não monta. Persiste após
`rm -rf .next`, `rm -rf node_modules/.cache` e reinícios limpos. **Não é bug do
código** — o build de produção funciona. A QA foi feita em `next start` na
porta 3008. Investigar antes da próxima sessão de QA em dev.

**2. Kanban não verificado visualmente.** O banco descartável tem **zero
`admin_users`**, então não existe conta para autenticar; e criar conta ou
digitar senha está fora do que posso fazer. Verifiquei o que alimenta a tela
(as queries do chip e do drawer devolvem os empreendimentos com contagem,
datas e marcos), não o visual. A aba do Chrome disponível era a página de
**API keys** do Supabase — não interagi com ela.

### Limitação documentada, não resolvida

As URLs das plantas apontam para `estilofontana.com.br`, host público de
terceiro. O gate impede a **descoberta** da URL sem cadastro, não o acesso de
quem já a tem. Proteção do arquivo exigiria proxy autenticado ou URL assinada,
o que depende de mover o material para storage próprio — fora do escopo do
piloto, conforme combinado.

### Dados sintéticos acumulados

Todos com prefixo `QA_LEAD_GATE`, telefones `489000xxxxx`, e-mails
`@exemplo.invalid`. Limpeza com o SQL do §7 (não executado).
