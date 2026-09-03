# VoeTupper Multiusuário v3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o VoeTupper de piloto local para uma arquitetura multiusuário com autenticação por e-mail, governança hierárquica, identidade única, Supabase + RLS, planilha administrativa no Drive e documentação de produto madura.

**Architecture:** O frontend multiusuário passa a usar o app Next.js existente em `src/`, com Supabase Auth/Postgres como fonte de verdade e políticas RLS no banco. O Google Drive mantém uma planilha privada de onboarding e auditoria administrativa. A versão estática atual continua sendo o piloto público até o novo ambiente ter URL e chaves Supabase válidas; não publicar uma camada de autenticação incompleta.

**Tech Stack:** Next.js 15, React 19, TypeScript, Supabase JS/SSR, Postgres, Row Level Security, Vitest, Google Sheets como espelho administrativo.

**Spec:** `docs/superpowers/specs/2026-09-03-voe-tupper-auth-drive-governance-v3-design.md`

## Global Constraints

- Gerusa é Distribuição ES.
- Existem seis Distritos iniciais: Norte, Noroeste, Serra, Vitória, Vila Velha e Sul, Cariacica.
- Uma pessoa existe uma única vez por `person_id`.
- Promoção Consultora → Líder altera vínculo e papel, nunca duplica pessoa.
- Empresária compara apenas agregados de outras Empresárias da mesma Distribuição.
- Líder compara apenas agregados de outras Líderes do mesmo Distrito.
- Consultora não recebe métricas gerenciais de níveis superiores.
- `Tupper123` é apenas senha temporária de onboarding e exige troca no primeiro acesso.
- A nova senha nunca é armazenada no Google Sheets ou no repositório.
- RLS é obrigatória para dados multiusuário.
- Service role nunca vai para frontend ou GitHub.
- Microcopy da interface não usa travessão.
- Mobile continua prioridade, com desktop responsivo.

---

### Task 1: Modelo de domínio e matriz de governança

**Files:**
- Create: `src/lib/domain/network.ts`
- Create: `src/lib/domain/governance.ts`
- Create: `src/lib/domain/network.test.ts`
- Create: `src/lib/domain/governance.test.ts`
- Modify: `src/lib/domain/types.ts`

**Interfaces:**
- Produces: `NetworkRole`, `ScopeRef`, `Membership`, `ViewerContext`, `canViewMetric`, `canViewPerson`, `canManageScope`, `promoteConsultantToLeader`.

- [ ] **Step 1: Write failing governance tests**

Cobrir:

```ts
expect(canViewMetric(empresariaSerra, empresariaVitoria, 'district_revenue_detail')).toBe(false)
expect(canViewMetric(empresariaSerra, empresariaVitoria, 'district_goal_percent')).toBe(true)
expect(canViewMetric(leaderA, leaderB, 'leader_goal_percent')).toBe(true)
expect(canViewMetric(leaderA, leaderOtherDistrict, 'leader_goal_percent')).toBe(false)
expect(canViewMetric(consultant, empresariaSerra, 'district_revenue_detail')).toBe(false)
```

- [ ] **Step 2: Write failing promotion tests**

Garantir que promoção preserva `personId`, cria membership `LEADER`, encerra membership antiga e recebe lista explícita de membros migrados.

- [ ] **Step 3: Implement types and pure governance functions**

Definir papéis:

```ts
type NetworkRole='DISTRIBUTION'|'BUSINESS_OWNER'|'LEADER'|'CONSULTANT'
```

Definir visibilidade por matriz explícita, nunca por `role` comparado numericamente.

- [ ] **Step 4: Run targeted tests**

Run: `npm test -- src/lib/domain/governance.test.ts src/lib/domain/network.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `feat: model network governance and promotions`

---

### Task 2: Schema Supabase e RLS versionados

**Files:**
- Create: `supabase/migrations/202609030001_network_core.sql`
- Create: `supabase/migrations/202609030002_rls.sql`
- Create: `supabase/seed.sql`
- Create: `docs/security/rls-matrix.md`

**Interfaces:**
- Produces tabelas: `people`, `auth_identities`, `distributions`, `districts`, `groups`, `memberships`, `goals`, `orders`, `performance_snapshots`, `achievements`, `network_events`, `audit_log`.

- [ ] **Step 1: Create core schema**

Incluir UUIDs, timestamps, constraints de membership corrente e FKs que impeçam vínculos órfãos.

- [ ] **Step 2: Seed ES structure**

Inserir:

```text
Distribuição ES | Gerusa
Norte | Giseli Aguilar
Noroeste | Adriana Junta
Serra | Ritheli Radis
Vitória | Tatiana Madeira
Vila Velha e Sul | Adriana Maia
Cariacica | Vanessa Luciana
```

Criar pessoas e memberships de Distribuição/Empresária sem inventar e-mails.

- [ ] **Step 3: Add helper SQL functions**

Criar funções `current_person_id()`, `current_membership()`, `same_distribution(a,b)`, `same_district(a,b)` com `security definer` mínimo e `search_path` fixado.

- [ ] **Step 4: Add RLS policies**

Políticas mínimas:

- pessoa vê próprio perfil;
- Empresária lê detalhe do próprio Distrito;
- Líder lê detalhe do próprio grupo;
- Consultora lê próprio operacional;
- pares recebem somente views agregadas, não tabelas brutas;
- Distribuição ES acessa consolidados estaduais;
- `audit_log` somente append por funções autorizadas.

- [ ] **Step 5: Create aggregate views**

Criar `business_owner_scoreboard` e `leader_scoreboard` com campos agregados permitidos.

- [ ] **Step 6: Document the RLS matrix**

Mapear cada papel × recurso × ação.

- [ ] **Step 7: Commit**

Commit: `feat: add Supabase schema and scoped RLS`

---

### Task 3: Cliente Supabase e autenticação com troca obrigatória

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/auth/session.ts`
- Create: `src/components/AuthGate.tsx`
- Create: `src/components/FirstAccessPassword.tsx`
- Create: `src/lib/auth/session.test.ts`
- Modify: `.env.example`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Produces: `getViewerContext()`, `requiresPasswordChange()`, `markPasswordChanged()`.

- [ ] **Step 1: Add environment contract**

`.env.example` deve incluir:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_MODE=multiuser
```

`SUPABASE_SERVICE_ROLE_KEY` fica server-only.

- [ ] **Step 2: Write auth state tests**

Cobrir usuário sem sessão, usuário com `must_change_password=true`, usuário ativo e usuário sem membership corrente.

- [ ] **Step 3: Implement browser/server clients**

Usar `@supabase/ssr` e `@supabase/supabase-js` já instalados.

- [ ] **Step 4: Implement `AuthGate`**

Estados:

```text
sem sessão → login
sessão + must_change_password → troca obrigatória
sessão + membership válida → app
sessão sem membership → acesso aguardando configuração
```

- [ ] **Step 5: Implement first-access password change**

A tela exige nova senha e confirmação; chama `supabase.auth.updateUser({password})`; em sucesso, atualiza metadata/tabela de onboarding para `must_change_password=false` via RPC autorizada.

- [ ] **Step 6: Wire page**

`src/app/page.tsx` renderiza `AuthGate` envolvendo o app multiusuário.

- [ ] **Step 7: Run tests/typecheck**

Run: `npm test && npm run typecheck`.

Expected: PASS.

- [ ] **Step 8: Commit**

Commit: `feat: add email auth and first-access password change`

---

### Task 4: Repositório de dados multiusuário

**Files:**
- Create: `src/lib/data/network-repository.ts`
- Create: `src/lib/data/orders-repository.ts`
- Create: `src/lib/data/goals-repository.ts`
- Create: `src/lib/data/network-repository.test.ts`

**Interfaces:**
- Produces: `loadMyNetwork(viewer)`, `loadPeerScoreboard(viewer)`, `loadMyOrders(viewer)`, `loadMyGoals(viewer)`.

- [ ] **Step 1: Write repository contract tests**

Mockar Supabase e garantir que Empresária nunca consulta tabela bruta de outro Distrito para ranking.

- [ ] **Step 2: Implement own-scope reads**

Detalhe vem de tabelas RLS-protected.

- [ ] **Step 3: Implement peer rankings**

Empresária usa exclusivamente `business_owner_scoreboard`; Líder usa exclusivamente `leader_scoreboard`.

- [ ] **Step 4: Implement empty/error states**

Erros de autorização viram estado `access_denied`, não fallback para dados locais.

- [ ] **Step 5: Commit**

Commit: `feat: add scoped multiuser repositories`

---

### Task 5: UI multiusuário e árvore territorial correta

**Files:**
- Refactor: `src/components/OperationsApp.tsx`
- Create: `src/components/app/AppShell.tsx`
- Create: `src/components/network/NetworkHome.tsx`
- Create: `src/components/network/NetworkTree.tsx`
- Create: `src/components/network/PeerRanking.tsx`
- Create: `src/components/network/ProfileCard.tsx`
- Create: `src/components/network/GroupsView.tsx`
- Modify: `src/app/globals.css`
- Test: `src/components/network/governance-ui.test.tsx`

**Interfaces:**
- Consumes repositories da Task 4.
- Produces navegação `Hoje | Rede | Pedidos | Perfil`.

- [ ] **Step 1: Split current monolith**

Extrair shell, Rede e Perfil de `OperationsApp.tsx` sem alterar regras de pedido existentes.

- [ ] **Step 2: Build role-aware tree**

Distribuição vê seis Distritos; Empresária vê próprio Distrito em profundidade e outros Distritos apenas como cards agregados; Líder vê próprio grupo; Consultora vê caminho próprio.

- [ ] **Step 3: Build peer ranking**

Não renderizar links para grupos/pessoas fora do escopo do observador.

- [ ] **Step 4: Build promotion flow UI**

Empresária seleciona Consultora, confirma promoção e escolhe explicitamente membros que migram.

- [ ] **Step 5: Preserve visual direction**

Rosa dominante, branco, cards limpos, 44 px touch targets, safe area, sem travessão.

- [ ] **Step 6: Add desktop layout**

Sidebar persistente acima de 900 px; árvore/perfil lado a lado quando houver espaço.

- [ ] **Step 7: Run UI tests/typecheck**

Run: `npm test && npm run typecheck`.

Expected: PASS.

- [ ] **Step 8: Commit**

Commit: `feat: add role-aware social network UI`

---

### Task 6: Planilha administrativa privada no Google Drive

**External artifact:**
- Create folder: `VoeTupper`
- Create Google Sheet: `VoeTupper | Diretório e Onboarding ES`

**Interfaces:**
- Produces abas `Empresárias`, `Pessoas`, `Movimentações`, `Governança`, `Importações`.

- [ ] **Step 1: Create Drive folder and spreadsheet**

Criar em My Drive, sem compartilhamento público.

- [ ] **Step 2: Populate `Empresárias`**

Inserir seis linhas. Preencher somente o e-mail confirmado de Ritheli. Usar `Tupper123` como senha temporária e `troca_obrigatoria=sim`.

- [ ] **Step 3: Add data validation and protected header formatting**

Status de login: `aguardando_email`, `convite_pendente`, `ativo`, `bloqueado`.

- [ ] **Step 4: Add `Governança` matrix**

Registrar matriz Distribuição/Empresária/Líder/Consultora em linguagem operacional.

- [ ] **Step 5: Record Drive reference**

Adicionar ao README apenas o nome do arquivo e finalidade. Não publicar o link privado nem senha temporária no repositório.

---

### Task 7: Migração do piloto local

**Files:**
- Create: `src/lib/migration/local-pilot.ts`
- Create: `src/lib/migration/local-pilot.test.ts`
- Create: `docs/migrations/local-pilot-to-multiuser.md`

**Interfaces:**
- Produces `normalizeLegacyConsultant()`, `dedupePeople()`, `buildMembershipCandidates()`.

- [ ] **Step 1: Write deduplication tests**

Não fundir pessoas apenas por nome. Prioridade de chave: `person_id` explícito > CPF autorizado > código de negócio + nome normalizado > revisão humana.

- [ ] **Step 2: Implement migration parser**

Gerar relatório de conflitos sem gravar automaticamente vínculos ambíguos.

- [ ] **Step 3: Document import workflow**

Serra entra primeiro; outras regiões só após dados confirmados.

- [ ] **Step 4: Commit**

Commit: `feat: add safe pilot migration pipeline`

---

### Task 8: README, ROADMAP, SECURITY e governança de repositório

**Files:**
- Rewrite: `README.md`
- Create: `ROADMAP.md`
- Modify: `SECURITY.md`
- Create: `GOVERNANCE.md`
- Create: `docs/architecture/overview.md`

**Interfaces:**
- Produces documentação operacional para proprietária, desenvolvedores e futuros colaboradores.

- [ ] **Step 1: Rewrite README**

Seções obrigatórias: visão, hierarquia, produto, arquitetura, segurança, onboarding, desenvolvimento, deploy, ambientes, dados, limites.

- [ ] **Step 2: Create ROADMAP**

Fases:

```text
0 Piloto Serra
1 Identidade e governança ES
2 Auth + RLS
3 Migração Serra
4 Rankings/mural confiáveis
5 E-mail e notificações
6 Auditoria/observabilidade
7 Expansão para outras Distribuições
8 Governança nacional
```

Cada fase contém entrada, saída e critérios de promoção.

- [ ] **Step 3: Upgrade SECURITY**

Documentar segredo, RLS, logs, incidentes, senha temporária, dados sensíveis e rotação.

- [ ] **Step 4: Create GOVERNANCE**

Definir papéis de produto, decisão de schema, aprovação de acesso, revisão de políticas, mudança de hierarquia e auditoria.

- [ ] **Step 5: Create architecture overview**

Fluxo: UI → Supabase Auth → RLS → Postgres → views agregadas → Drive mirror.

- [ ] **Step 6: Commit**

Commit: `docs: establish product governance and roadmap`

---

### Task 9: Verificação e release gate

**Files:**
- Modify: `.github/workflows/ci.yml`
- Create: `src/lib/domain/security-contract.test.ts`

**Interfaces:**
- Produces release gate reproduzível.

- [ ] **Step 1: Add security contract tests**

Falhar se `Tupper123`, `service_role`, e-mails privados conhecidos ou chaves aparecerem em assets públicos de build.

- [ ] **Step 2: Keep standard CI**

Run:

```text
npm test
npm run typecheck
npm run build
```

- [ ] **Step 3: Add migration lint checks**

Verificar presença de `enable row level security` nas tabelas multiusuário e ausência de `using (true)` em políticas sensíveis.

- [ ] **Step 4: Run complete CI**

Expected: all green.

- [ ] **Step 5: Do not replace public pilot until backend is configured**

Release multiusuário só ocorre quando `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` apontarem para projeto real e as migrations/RLS estiverem aplicadas.

- [ ] **Step 6: Commit**

Commit: `test: add multiuser security release gate`
