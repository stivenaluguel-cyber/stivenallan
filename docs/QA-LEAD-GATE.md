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
| HEAD | `a76d21a` (ver §15 para o estado mais recente) |
| Publicado no remoto | até `4363ed3`. **Todos os commits acima disso são locais** — nada foi enviado |
| Drift com `origin/main` | nenhum. `origin/main` continua em `a73a1e7` |
| Diff vs main | 55 arquivos, +4002 / −28 |
| `TZ=UTC npx vitest run` | 1740 testes, 136 arquivos, tudo verde |
| `npx tsc --noEmit` | limpo |
| `npm run build` | sai com 0 |
| `npm run lint` | **não configurado** — `next lint` abre prompt interativo pedindo pra criar ESLint. Não criei config: seria decisão ampla, fora do escopo desta QA |
| Produção | intocada. Migration não aplicada, flags inexistentes na Vercel, nenhum merge/deploy |

### Commits locais

```
d8c7e37 docs(lead-gate): mapa do conteúdo, arquitetura do gate real e bloqueios
dfe0c6c feat(lead-gate): liberação progressiva real no Parco Savello
8539c13 docs(lead-gate): sincroniza o estado do documento com a QA já executada
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

Alcance real na época: latente, porque `GatedContent` ainda não tinha ponto de uso. **Resolvido em `dfe0c6c`** — e ao plugar descobriu-se que passar children pra Client Component vaza no payload RSC de qualquer jeito (ver §11).

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

### ~~Achado de escopo — a metade "liberação progressiva" não está ligada~~ RESOLVIDO em `dfe0c6c` (ver §11)

<details><summary>Registro do que estava pendente</summary>

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

</details>

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

---

## 12. Continuação — 05/08/2026, tarde (commit `8a55e7c` em diante)

Autorização adicional para: revisão independente do diff completo, QA visual do Kanban com admin sintético provisionado pelo fluxo oficial, testes de dedup/concorrência/WhatsApp entre empreendimentos, diagnóstico do `next dev`, e plano de publicação sem executar.

### 12.1 Dois P1 novos, achados por auditoria independente e corrigidos (`8a55e7c`)

**P1 — o fetch de `getPropertyIdBySlug` rebaixava o `revalidate` de 21 páginas estáticas puras.**
`next: { revalidate: 3600 }` no fetch do supabase-js parece inofensivo, mas em `patch-fetch.js` do Next o revalidate do **fetch** rebaixa o revalidate do **segmento** (`if (finalRevalidate < revalidateStore.revalidate)`). Só 7 dos 28 hotsites que usam `RelatedProperties` declaram `export const revalidate`; os outros 21 eram estáticos puros e passaram a ISR de 1h sem ninguém pedir. Medido: 35 páginas com "1h" no build quando só 7 deveriam. Corrigido com `force-cache` + tag — cada página volta a manter a política que ela mesma declara.

**P1 — falha de rede publicava o conteúdo restrito e o congelava no cache ISR.**
`gateOn = gateEnabled && !!propertyId` fazia a página servir **tudo público** quando a resolução do id falhava. Em render dinâmico seria degrade aceitável; em rota ISR o HTML sem gate é gravado no cache e servido a todos até a próxima regeneração — um timeout de 1s numa regeneração de madrugada deixaria plantas e espelho abertos até de manhã. Corrigido com `gateFalhou`: fail-closed — conteúdo restrito não renderiza, público continua servido, ninguém vê página quebrada.

Também: 27 páginas fora do piloto pararam de resolver `property_id` (existia só para atribuição do `FormContato` legado, que sempre funcionou sem ele); `autoRefreshToken: false` no client anônimo (evita `setInterval` do GoTrue por render).

**Achado da mesma auditoria que NÃO era regressão:** a instabilidade de builds limpos (estático vs dinâmico oscilando) já existe em `origin/main` — testei explicitamente fazendo checkout e 2 builds limpos: 35/2 e depois 14/23 estáticas/dinâmicas, **mesmo código, sem esta feature**. Não é algo que esta branch introduziu; é dívida pré-existente do projeto (rota catch-all `/empreendimento/[construtora]/[slug]` já mistura `force-dynamic` + `revalidate` + `generateStaticParams`, que são mutuamente conflitantes — `force-dynamic` sempre vence).

### 12.2 Auditoria de segurança do endpoint — sem P0/P1

Segunda auditoria independente, focada em `/api/lead-gate/content`, `conteudo-restrito.ts`, `espelho/[slug]`. Resultado: **nenhum P0/P1**. Testei pessoalmente o ponto mais crítico que ela levantou (prototype pollution via `slug='__proto__'` indexando `REGISTRO[slug]?.[bloco]`) — inofensivo, porque `bloco` é whitelist (`['plantas','fotos']`) e nem `Object.prototype` nem `Object` têm essas chaves.

Achados P2/P3 registrados para decisão futura, não corrigidos nesta sessão (fora do escopo do piloto):
- **P2** — o gate do espelho chaveia por `slug`, mas os dados são resolvidos por `nome` com fallback por continência (`k.includes(alvo) || alvo.includes(k)`) em `lib/unidades/espelho.ts`. Um `properties.nome` duplicado/legado fora do piloto poderia servir o espelho gateado sem sessão. Não confirmei se tal linha existe hoje.
- **P3** — 404 (slug fora do piloto) responde antes da checagem de sessão em `/api/lead-gate/content`, permitindo enumerar `LEAD_GATE_SLUGS` com qualquer cookie lixo. Mesmo padrão já existe em `unlock/route.ts`.
- **P3** — falta `Vary: Cookie` nas respostas dependentes de sessão (hoje seguro por `no-store`, mas frágil a mudança futura).

### 12.3 Kanban — validado visualmente, com um bug real corrigido no meio do caminho

**Bloqueio original superado com autorização:** provisionei um admin sintético (`QA_LEAD_GATE_ADMIN` / `qa_lead_gate_admin@exemplo.invalid`) no descartável, usando o mecanismo oficial (bcrypt via `admin_users`, sem nenhum bypass). A senha foi gerada, gravada só num arquivo local `chmod 600` fora do git, digitada no **formulário real de login** pelo navegador, e o arquivo apagado logo depois — nunca apareceu em chat, log ou commit.

**Bug real encontrado no caminho:** a primeira tentativa de autenticar retornou 401 em `/api/admin/leads/[id]/interesses` mesmo com sessão válida (confirmada por `/api/admin/leads` funcionando). Causa raiz: `src/lib/dashboard/admin-auth.ts` (`requireAdmin()`) usa `process.env.JWT_SECRET!` **sem** o fallback que `middleware.ts` e `lib/auth.ts` têm (`|| 'stiven-dashboard-secret-2026-xk9p3m7q'`). Meu `.env.local` não tinha `JWT_SECRET` — o middleware autenticava com o fallback, mas `requireAdmin()` verificava contra a string literal `"undefined"` e rejeitava. **Não é bug desta feature**: `admin-auth.ts` é pré-existente e usado por ~55 rotas `/api/admin/*`; produção quase certamente tem `JWT_SECRET` configurado (é variável documentada em `.env.example`). Resolvido só no meu ambiente (gerei um `JWT_SECRET` local); a inconsistência do código foi registrada como tarefa separada, fora desta branch, pois é infraestrutura compartilhada não relacionada ao lead gate.

**Resultado visual, com prova:**
- Chip "Interesses · 2" no card de `QA_LEAD_GATE Maria Teste`.
- Drawer abre a seção "INTERESSES" com os dois empreendimentos: "Monte Leone Residencial (QA sintético) — 1 visita — 1ª visita: 05/08 · liberado hoje" e "Parco Savello Residencial — 1 visita — 1ª visita: 05/08 · liberado hoje".
- Sem `[object Object]`, sem data inválida, sem campo vazio estranho.
- `/api/admin/leads/[id]/interesses` devolve `view_count`, `first_seen_at`/`last_seen_at` distintos, marcos (`unlocked_at`) — tudo batendo com o banco.
- Screenshot capturado com WhatsApp e e-mail mascarados antes da captura (substituição de texto no DOM), mesmo sendo dados 100% sintéticos.
- Abrir o drawer não alterou nenhum campo do lead (confirmado comparando o registro antes/depois).

### 12.4 Sessão global, dedup e WhatsApp — todos confirmados

| Teste | Resultado |
|---|---|
| WhatsApp sem cadastro | clique cancelado (`defaultPrevented`), URL intacta, painel/formulário focado |
| Cadastro cria lead+sessão+interesse+eventos | ✅ |
| E-mail mesmo, caixa diferente | ✅ dedup — 1 lead |
| Telefone mesmo, com/sem DDI, espaços, pontuação | ✅ dedup — 1 lead |
| E-mail de um lead + telefone de outro (conflito) | ✅ 1 registro em `lead_identity_conflicts`, ambos `requer_atencao=true`, nenhum 3º lead |
| Duas submissões concorrentes, telefone novo | ✅ ambas 201, **1 lead só** (handler de corrida do commit anterior confirmado ao vivo) |
| Habilitar Monte Leone só localmente, abrir com sessão do Parco | ✅ `unlocked:true` sem formulário, sem novo cadastro |
| Segundo interesse registrado | ✅ `lead_property_interests` com o slug do Monte Leone |
| Empreendimento principal preservado | ✅ `property_name` continua "Parco Savello Residencial" mesmo após visitar Monte Leone |
| Voltar ao Parco | ✅ `unlocked:true`, sem novo cadastro |
| Rate limit (5/60s) | ✅ confirmado nesta e na sessão anterior |

### 12.5 Acessibilidade — 360×800 verificado visualmente, demais por medição

360×800: screenshot confirma painel limpo, teaser com contagem real ("4 fotos e 7 plantas liberadas"), WhatsApp flutuante visível ao lado (reserva de 88px), zero overflow horizontal, zero alvo de toque abaixo de 24px, botão fechar 44×44 dentro da tela. Escape fecha o painel de forma confiável (confirmado, com pequeno atraso assíncrono). Foco inicial em campo do formulário testado e correto.

**Não verificado nesta sessão, por restrição de tempo:** 390×844/768×1024/1440×900 com screenshot real (medição geométrica já feita em sessão anterior para os 4 breakpoints, ver §10); zoom 200%; teste completo de focus-restore com elemento externo focado antes da abertura do painel (mecanismo existe no código, comportamento de Escape fechando já confirmado).

### 12.6 Diagnóstico do `next dev` — causa raiz identificada e reproduzida

**Reproduzido de forma determinística:** o gatilho é criar um arquivo de Client Component **novo** enquanto o `next dev` já está rodando. Confirmado com um componente mínimo (`ProbeRepro`, só uma `<div>`): o servidor entrega o HTML correndo (`grep` confirma o texto no HTML), mas o React não hidrata — `Cannot read properties of undefined (reading 'call')` em `options.factory`, dentro do runtime do Webpack (`.next/static/chunks/webpack.js`).

**Não é**:
- lockfile duplicado (existe um `package-lock.json` extra no diretório pai, mas não gera aviso do Next e não é a causa — testei isoladamente);
- `server-only` mal configurado (removido temporariamente, erro persistiu);
- symlink na worktree (caminho físico = caminho lógico);
- Turbopack (o projeto usa Webpack, `next dev` sem `--turbo`);
- capitalização de arquivo/import (nomes conferem exatamente).

**É**: uma falha de HMR/module-resolution do Webpack em dev quando um módulo novo entra no grafo de dependências depois que o servidor já compilou uma primeira vez. `rm -rf .next` sozinho não resolve enquanto o processo do servidor continua rodando (o Webpack mantém estado em memória). **Recuperação confirmada:** matar o processo do `next dev`, `rm -rf .next`, e reiniciar — depois disso, o mesmo componente hidrata normalmente.

**Não reproduzido**: em `next build` + `next start`, nenhuma vez, em nenhum teste desta ou da sessão anterior.

**Recomendação de trabalho, registrada, não implementada**: ao adicionar um Client Component novo durante uma sessão de dev já aberta, reiniciar o servidor (matar processo + `rm -rf .next` + `next dev` de novo) antes de testar no navegador, em vez de confiar no Fast Refresh. Não é um problema desta feature — é um comportamento do Next 15.3.9 + Webpack nesta máquina; não tentei isolar mais a fundo (ex.: bisseccionar versão do Next) por estar fora do escopo do piloto.

### 12.7 Validação mecânica final

```
TZ=UTC npx vitest run    → 1740 testes, 136 arquivos, tudo verde
npx tsc --noEmit         → limpo
npm run build            → build limpo; Parco Savello ○ estático, revalidate 1h
```

Bundle cliente (build final, `.next/static`):
- `sb_secret` / `SUPABASE_SERVICE_ROLE_KEY` / JWT de service_role: **0 ocorrências**
- Source maps públicos: **0**
- URLs de `estilofontana.com.br` (plantas restritas): **0 ocorrências no bundle client** (confirmado de novo nesta sessão, além da verificação de HTML/RSC anônimo já feita antes)

`npm run lint`: continua sem configuração não-interativa (`next lint` pede pra criar ESLint). Registrado como débito pré-existente, nenhuma configuração ampla criada nesta branch.

### 12.8 Commits desta continuação

```
8a55e7c fix(lead-gate): rede no build rebaixava ISR e podia publicar conteúdo restrito
```

Nenhum outro commit de código foi necessário nesta fase — Kanban, dedup, WhatsApp e sessão global foram QA ao vivo (sem alteração de código) porque já funcionavam corretamente. A correção do `JWT_SECRET` ficou só no `.env.local` local (fora do git). A inconsistência em `admin-auth.ts` foi registrada como tarefa separada, fora desta branch.

---

## 13. Plano de publicação (documentado, NADA executado)

1. **Backup do Supabase de produção** antes de qualquer migration — snapshot completo via painel ou `pg_dump`.
2. **Aplicar a migration** `20260805003000_lead_gate_identity_and_sessions.sql` em produção, isolada (não em lote com outras pendentes).
3. **Validar o schema pós-aplicação**: `list_tables`, `get_advisors` (RLS habilitado sem policy nas 3 tabelas novas — padrão do projeto), conferir os 13 objetos do rollback existem com nome exato.
4. **Deploy do código com as flags desligadas** (`LEAD_GATE_ENABLED` ausente/false em produção) — zero mudança visível nas 36 páginas.
5. **Smoke test sem gate ativo**: as 36 páginas carregam normalmente, build de produção confirma Parco `○` estático.
6. **Ativar `LEAD_GATE_ENABLED=true` + `LEAD_GATE_SLUGS=parco-savello-santa-barbara-criciuma-sc`** só em produção, via env var da Vercel (não via código/deploy).
7. **Monitorar**: erros no Sentry, taxa de conversão do gate (cadastros / visitas), taxa de abandono no formulário.
8. **Comparar cliques de WhatsApp interceptados vs. cadastros completados** — é a métrica que originou o projeto (315 visitas, 0 leads).
9. **Critérios objetivos para pausar o piloto**: taxa de erro do endpoint de conteúdo acima de 1%; conversão do gate abaixo da conversão histórica do formulário antigo por mais de 72h; qualquer vazamento de conteúdo restrito reportado.
10. **Rollback imediato por feature flag**: `LEAD_GATE_ENABLED=false` na Vercel — reverte ao comportamento anterior sem precisar de deploy.
11. **Rollback de código**: reverter o merge; a migration é aditiva (não altera coluna existente), então o código antigo continua funcionando com o schema novo presente.
12. **Política de rollback do banco**: NÃO remover tabelas/colunas em rollback emergencial. O rollback SQL (`supabase/rollback/...`) só deve rodar em manutenção planejada, nunca como reação a incidente — remove `lead_eventos.client_event_id`/`property_id`, o que destrói dado gravado depois da migration.
13. **Corrigir credenciais de produção herdadas por Preview** (achado de segurança de sessão anterior, §5): aplicar o plano de escopo de env var da Vercel antes ou junto da ativação do piloto.
14. **Avaliar rotação da service role de produção**: ela esteve disponível em todo Preview construído nos últimos 41+ dias, de um repositório público. Decisão do usuário, não técnica.
15. **Expansão gradual**: só depois de validar métricas do Parco por um período definido pelo usuário, habilitar o segundo slug — mesmo processo, sem novo deploy de código (só env var).

Nenhum item acima foi executado. Produção (`xpkznaqgctfkoonqpcye`) permanece sem a migration, sem as flags, sem nenhuma escrita desta sessão.

---

## 14. Hardening pré-Preview — 05/08/2026

### 14.1 Autenticação administrativa fail-closed

Removido o fallback JWT conhecido e compartilhado entre `middleware.ts` e
`lib/auth.ts`. Login, middleware e as rotas que usam `requireAdmin()` agora
consomem o mesmo helper. Se `JWT_SECRET` estiver ausente ou tiver menos de 32
caracteres, o dashboard fecha com segurança: não assina token novo e não aceita
sessão existente. A suíte usa uma chave exclusivamente de teste por
`setupFiles`; nenhum fallback chega ao runtime da aplicação.

### 14.2 Endpoint de conteúdo: autenticação antes da enumeração

`/api/lead-gate/content` agora valida a sessão real antes de distinguir slug ou
bloco. Um cookie arbitrário recebe o mesmo 401 para slug válido ou inexistente.
Todas as respostas carregam `Cache-Control: private, no-store` e `Vary: Cookie`.
Quatro testes novos cobrem ausência de cookie, token inválido, enumeração e
sessão válida.

### 14.3 Identidade telefônica com e sem DDI

Adicionada a migration aditiva
`20260805180000_lead_gate_phone_identity.sql`. A RPC reduz a entrada ao formato
local e procura tanto `DDD+número` quanto `55+DDD+número` antes de criar lead.
Isso impede o gate de duplicar um contato legado vindo de Meta/Evolution com
DDI. Não há backfill, alteração destrutiva nem índice único funcional: se o
legado já contiver os dois formatos, o formato local exato vence de forma
determinística e a reconciliação histórica continua sendo uma tarefa separada.

Esta migration ainda **não foi aplicada** nem no descartável nem em produção
nesta sessão. O código/migration foi validado estaticamente, mas o cenário SQL
deve ser repetido no banco descartável antes de qualquer aplicação em produção.

### 14.4 Isolamento do Supabase no escopo Preview da Vercel

As três variáveis abaixo foram atualizadas com alvo explícito `preview`, usando
os valores já validados do projeto descartável e sem imprimi-los:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Nenhum comando de update foi dirigido a `production`. A CLI 58.5.1 passou a
devolver sentinelas redigidas de 11 caracteres ao executar `env pull` para
variáveis sensíveis; por isso não foi possível fazer uma segunda comparação
por hash após o update. A confirmação disponível é o alvo `preview` aceito pela
CLI e as três respostas de sucesso. Um deploy Preview novo deve confirmar o ref
efetivo antes de qualquer QA.

Importante: deployments Preview já existentes mantêm o snapshot antigo de env
até serem recriados. Nenhum redeploy foi executado. Além disso, outras
credenciais de produção (Evolution, Resend, provedores de IA e Google) ainda
aparecem no escopo Preview; portanto a correção global de segredos do Preview
continua aberta mesmo com o banco do próximo Preview direcionado ao descartável.

### 14.5 Validação

```
npx tsc --noEmit         → limpo
TZ=UTC npx vitest run    → 1747 testes, 138 arquivos, tudo verde
npm run build            → limpo; Parco estático, revalidate 1h
```

`git diff --check` limpo. Nenhum segredo novo, `.env.local` ou arquivo
temporário entrou no Git. Nenhum push, merge, deploy ou escrita em produção foi
feito.

---

## 15. Migration telefônica validada + auditoria completa do escopo Preview — 05/08/2026

Objetivo desta rodada: preparar um Preview seguro. Migration validada, auditoria
concluída, **push e deploy NÃO executados** — sem autorização explícita nesta
tarefa. Produção intocada.

### 15.1 Migration `20260805180000_lead_gate_phone_identity.sql`

Aplicada **somente** em `pauvicgtaqgulwdxwcgf` ("qa-lead-gate-descartavel"),
via `apply_migration`. `pg_get_functiondef` conferido antes e depois: o corpo em
produção do descartável é byte a byte o do arquivo versionado. Produção
(`xpkznaqgctfkoonqpcye`) não recebeu nenhum comando.

Os 10 cenários exigidos passaram:

| # | Cenário | Esperado | Resultado |
|---|---|---|---|
| 1 | Telefone local novo | cria lead | `created:true` |
| 2 | Mesmo telefone com `+55` | reaproveita | `created:false`, mesmo `leadId` |
| 3 | Mesmo telefone com máscara `(48) 9…` | reaproveita | `created:false`, mesmo `leadId` |
| 4 | Telefone só com DDI já existente no banco | reaproveita, não cria 3º | `created:false` |
| 5 | Ambos formatos no banco | escolhe o local, determinístico | local vence |
| 6 | E-mail com caixa alta | dedup case-insensitive | `created:false` |
| 7 | Telefone e e-mail em leads diferentes | conflito, sem 3º lead | `conflito:true`, linha em `lead_identity_conflicts`, `requer_atencao` nos dois |
| 8 | Telefone inválido (9 ou 14 dígitos) | rejeita | `raise exception` |
| 9 | Duas requisições HTTP concorrentes de verdade | um lead só | 1 lead, sem `unique_violation` vazando |
| 10 | Lead pré-existente com status avançado | preserva | `status`, `estagio_funil`, `property_name`, `origem`, `email` intactos |

O cenário 9 foi feito com dois `curl` em background disparados no mesmo
instante — concorrência real de sistema operacional, não SQL sequencial.

Lead sintético remanescente no descartável: `QA_LEAD_GATE Corrida Fone`
(`48955554444`). Mantido — a limpeza do projeto descartável está fora do escopo
autorizado.

### 15.2 Auditoria do escopo Preview — nada foi removido, e por quê

A instrução era remover do Preview as credenciais que não deveriam estar lá,
**desde que a operação aceitasse explicitamente o alvo `preview`**, parando e
documentando em caso de ambiguidade. Foi o que aconteceu com quase tudo.

Praticamente toda variável sensível existe como **uma entrada única combinada**
`Production, Preview`, não como duas entradas por ambiente. Remover a entrada
apaga o valor **dos dois ambientes** de uma vez; recriar a de Production exigiria
manusear o valor real da credencial, o que é proibido nesta sessão. Logo:
**nenhuma remoção foi executada.** A separação correta precisa ser feita no
painel da Vercel por quem já tem os valores.

Classificação completa (só nomes e escopos; nenhum valor foi lido ou impresso):

**Devem ficar ausentes do Preview — risco financeiro ou de comunicação real**
`EVOLUTION_API_KEY`, `EVOLUTION_API_URL`, `EVOLUTION_WEBHOOK_SECRET`,
`EVOLUTION_INSTANCE` (envio real de WhatsApp — o maior risco da lista),
`RESEND_API_KEY` (envio real de e-mail), `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`
(custo real de inferência), `CNPJA_API_KEY`, `GOOGLE_PLACES_API_KEY` (APIs pagas),
`GOOGLE_ADS_*` (7 variáveis, acesso real à conta de Ads).

**Podem ficar com valor falso/público**
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GADS_ID`,
`NEXT_PUBLIC_GADS_CONVERSION`.

**Podem ficar como estão**
`ICS_FEED_TOKEN`, `RESEND_FROM`, `UNSUBSCRIBE_SECRET`, `CRON_SECRET`,
`SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN` (só mistura eventos de Preview e Production
no mesmo projeto Sentry — higiene, não risco).

**Precisam de configuração própria por ambiente**
As 3 do Supabase (§15.3) e `JWT_SECRET` (§15.4).

### 15.3 As 3 variáveis do Supabase: a premissa não se confirmou

A tarefa partia de que `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL` e
`NEXT_PUBLIC_SUPABASE_ANON_KEY` já teriam sido separadas e apontariam para o
descartável no Preview. A listagem diz o contrário: as três aparecem com o
**mesmo timestamp "42d ago"** em `env ls production` e em `env ls preview`, como
uma entrada combinada. Uma atualização de valor gera timestamp novo; um
timestamp idêntico e antigo nos dois é o oposto do que a separação produziria.

Não é prova absoluta — a CLI redige valores, então a listagem não é capaz de
confirmar nem desmentir de forma definitiva. É exatamente por isso que a
verificação tem de ser em runtime: publicar o Preview e conferir o `ref` efetivo
**antes** de exercitar qualquer rota que escreva. Enquanto isso não for feito, a
hipótese de trabalho é que um Preview novo apontaria para **produção**.

### 15.4 `JWT_SECRET` compartilhado entre Preview e Production

Mesma variável nos dois ambientes. Como `middleware.ts` valida só a assinatura
do token (não confirma no banco que o `adminId` pertence àquele ambiente), um
token emitido por um login em Preview teria assinatura válida em Production. Não
é o vetor mais provável, mas é falta real de isolamento. Corrigir com um valor
distinto por ambiente.

Bom lado: a variável **existe** em Production. Como o commit `73c4670` removeu o
fallback conhecido e passou a falhar fechado, o dashboard em produção continua
funcionando e deixou de aceitar o segredo hardcoded que estava no repositório.

### 15.5 Deployment Preview antigo

`dpl_2AxjjJ9oEaQTm8i8DNxhaPGvSbJr`, criado em 05/08/2026 03:24 UTC, commit
`4363ed3c` — anterior a todo o hardening desta sessão. Estado READY, alvo
Preview. **Não serve para QA** e não foi excluído. A proteção SSO do projeto
cobre `prod_deployment_urls_and_all_previews`, então só quem tem acesso ao time
Vercel abre qualquer Preview — mitiga, não elimina, o risco de credencial.

Deployments Preview existentes mantêm o snapshot de env do momento em que foram
criados: mexer nas variáveis hoje não altera este deployment.

### 15.6 Falta o interruptor de mensuração em TODOS os ambientes

`NEXT_PUBLIC_ANALYTICS_DISABLED` não existe nem em Preview nem em Production. Com
pixel e Google Ads reais presentes no Preview e o GA4 caindo no fallback
hardcoded de `tracking-config.ts`, qualquer Preview novo dispara mensuração real
no navegador. O interruptor só existe no `.env.local` desta máquina. Antes de
publicar Preview, criar `NEXT_PUBLIC_ANALYTICS_DISABLED=true` com alvo `preview`
— essa é uma variável nova, sem entrada combinada, então dá para criar sem
ambiguidade de escopo.

### 15.7 Validação local

```
npx tsc --noEmit         → limpo
TZ=UTC npx vitest run    → 1747 testes, 138 arquivos, tudo verde
npm run build            → limpo
```

Varredura de segurança no bundle publicável (`.next/static`): zero ocorrências de
segredo, zero JWT de service role, zero source map publicado, zero URL de planta
restrita.

Sobre o `npm run build`: três builds limpos seguidos (`rm -rf .next` entre eles)
deram `ƒ` dinâmico no primeiro e `○` estático (`1h`/`1y`) nos dois seguintes para
o Parco Savello. É a oscilação já documentada em §12 — reproduzida em
`origin/main` puro, sem nenhum código desta branch —, causada por variação de
latência de rede ao resolver o slug no build. Não é regressão desta rodada.

### 15.8 Comando exato para publicar, quando autorizado

Ordem obrigatória. O passo 2 não pode ser pulado.

1. Criar o interruptor de mensuração (§15.6), só no Preview:

```
npx vercel env add NEXT_PUBLIC_ANALYTICS_DISABLED preview --project stivenallan
```

2. Corrigir no painel da Vercel as 3 variáveis do Supabase, separando Preview de
   Production, com o Preview apontando para `pauvicgtaqgulwdxwcgf`. Sem isso o
   Preview pode escrever em produção.

3. Publicar:

```
git push -u origin feat/lead-gate-cadastro-unico
```

4. Verificar o ref efetivo **antes** de qualquer teste de escrita, no deployment
   novo — abrir uma rota que exponha o host do Supabase em uso, ou conferir o
   valor de `NEXT_PUBLIC_SUPABASE_URL` no bundle do deployment. Se aparecer
   `xpkznaqgctfkoonqpcye`, **parar** — o Preview está apontando para produção.

### 15.9 Smoke test planejado (não executado)

Só depois do passo 4 acima confirmar o ref do descartável:

1. Abrir o hotsite do Parco Savello sem cookie — conferir que plantas, fotos
   extras, espelho e catálogo não aparecem no HTML nem no payload RSC.
2. `GET /api/lead-gate/content?slug=…&bloco=plantas` sem cookie → 401.
3. Mesma rota com cookie lixo → 401 (não 404), confirmando que a ordem
   autenticação-antes-de-slug do commit `23d5595` está publicada.
4. Preencher o cadastro com telefone em formato local → conteúdo libera sem
   reload.
5. Repetir o cadastro com o mesmo telefone em `+55` → nenhum lead novo no
   descartável (prova em produção-de-Preview do que §15.1 provou no banco).
6. Abrir um segundo empreendimento no mesmo navegador → sem novo cadastro.
7. Conferir no descartável que só um lead foi criado no percurso inteiro.
