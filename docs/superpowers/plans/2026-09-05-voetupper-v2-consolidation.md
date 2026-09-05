# VoeTupper V2 Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild VoeTupper as one clean, functional, mobile-first React application while preserving the current pilot and safely migrating same-origin local data.

**Architecture:** The Next.js application becomes the only V2 product surface and exports to static files. Pure domain modules own state transitions and selectors, a local adapter owns pilot persistence and access, and feature components consume those boundaries without reading browser storage directly.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.8, Zod 3, Vitest 3, browser Web Crypto, localStorage, static PWA assets.

**Spec:** `docs/superpowers/specs/2026-09-04-voetupper-v2-consolidation-design.md`

## Global Constraints

- Keep `main` unchanged until Joyce explicitly approves V2.
- Build only in `feat/voetupper-v2`.
- Use the official `logo-192.png` and `logo-512.png` supplied by Joyce.
- Use one React/Next product surface; legacy root HTML, JS, and CSS do not remain V2 runtime sources.
- Main body text is at least 16 px, operational labels are at least 14 px, and touch targets are at least 44 px.
- Mobile navigation is exactly `Hoje`, `Rede`, `Pedidos`, `Perfil` and respects `safe-area-inset-bottom`.
- Visible microcopy contains no em dash character.
- No real CPF, external password, imported file, phone number, or private operational export may be committed.
- Local pilot access must not be described as production authentication.
- Ranking and achievements must be derived from present data and must not fabricate results.
- The external portal setting accepts only HTTPS URLs.
- Persistence failures must stay visible and must never report a false success.
- The current legacy state key is never deleted automatically.

---

## Planned file structure

```text
next.config.ts                         Static export configuration
public/manifest.webmanifest            Install metadata
public/sw.js                           Offline shell cache
public/logo-192.png                    Official small logo
public/logo-512.png                    Official large logo
src/app/layout.tsx                     V2 metadata and viewport
src/app/page.tsx                       V2 entrypoint
src/app/globals.css                    Complete responsive visual system
src/components/v2/VoeTupperApp.tsx     Session and top-level view orchestration
src/components/v2/AppShell.tsx         Desktop sidebar and mobile navigation
src/components/v2/LoginView.tsx        Local pilot access
src/components/v2/TodayView.tsx        Action-first home
src/components/v2/OrdersView.tsx       History and closing queue
src/components/v2/OrderDialog.tsx      New-order form
src/components/v2/NetworkView.tsx      Wall, ranking, tree, and directory
src/components/v2/ProfileView.tsx      Identity, goals, and settings
src/components/v2/ui.tsx               Shared icons and small visual primitives
src/lib/v2/model.ts                    V2 state and fixture types
src/lib/v2/reducer.ts                  Explicit business actions
src/lib/v2/selectors.ts                Derived summaries, wall, ranking, and tree
src/lib/v2/migration.ts                Legacy state conversion
src/lib/v2/storage.ts                  Pilot persistence port and local adapter
src/lib/v2/auth.ts                     Local access compatibility and upgrade
src/lib/v2/validation.ts               Form and URL validation
src/lib/v2/*.test.ts                   Domain and persistence behavior tests
src/components/v2/views.test.tsx       Rendered accessibility and copy contracts
```

Existing `src/lib/domain` governance and promotion code remains in place and continues to be verified. The V2 modules may import its role types and order stage helpers but do not mutate those modules merely for visual work.

---

### Task 1: V2 state, validation, and selectors

**Files:**
- Create: `src/lib/v2/model.ts`
- Create: `src/lib/v2/validation.ts`
- Create: `src/lib/v2/selectors.ts`
- Test: `src/lib/v2/model.test.ts`
- Test: `src/lib/v2/selectors.test.ts`

**Interfaces:**
- Produces: `V2State`, `Person`, `Goal`, `NetworkEvent`, `createEmptyState()`, `createDemoState()`, `parseBRL()`, `validateHttpsUrl()`, `selectToday()`, `selectWall()`, `selectLeaderRanking()`, `selectNetworkTree()`.
- Consumes: `OrderStage`, `SourceChannel`, and `NetworkRole` from existing domain modules.

- [ ] **Step 1: Write failing state and validation tests**

```ts
it('creates a blank Serra pilot without fabricated results', () => {
  const state = createEmptyState();
  expect(state.version).toBe(2);
  expect(state.workspace.districtName).toBe('Serra');
  expect(state.people.map(person => person.name)).toEqual(['Gerusa', 'Ritheli Radis']);
  expect(state.orders).toEqual([]);
  expect(state.events).toEqual([]);
});

it.each([
  ['1.234,56', 1234.56],
  ['0,50', 0.5],
  ['', undefined],
  ['-1', null],
  ['abc', null],
])('parses Brazilian money %s', (raw, expected) => {
  expect(parseBRL(raw)).toBe(expected);
});

it.each([
  ['https://pedidos.example.com', true],
  ['http://pedidos.example.com', false],
  ['javascript:alert(1)', false],
])('validates external URL %s', (raw, expected) => {
  expect(validateHttpsUrl(raw)).toBe(expected);
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm test -- src/lib/v2/model.test.ts src/lib/v2/selectors.test.ts`

Expected: FAIL because `model`, `validation`, and `selectors` do not exist.

- [ ] **Step 3: Add the minimal V2 model**

Define these exact public shapes:

```ts
export type GoalUnit = 'BRL' | 'PEOPLE' | 'ORDERS' | 'PERCENT';
export type GoalType = 'SALES' | 'RECRUITMENT' | 'ORDERS' | 'RETENTION';
export type PersonStatus = 'ACTIVE' | 'NEW' | 'PAUSED' | 'INACTIVE' | 'REVIEW';

export type Person = {
  id: string;
  name: string;
  role: NetworkRole;
  status: PersonStatus;
  businessCode?: string;
  phone?: string;
  distributionId: string;
  districtId?: string;
  groupId?: string;
  leaderId?: string;
};

export type Goal = {
  id: string;
  type: GoalType;
  label: string;
  target: number;
  current: number;
  unit: GoalUnit;
  periodId: string;
};

export type V2Order = {
  id: string;
  consultantId: string;
  weekId: string;
  source: SourceChannel;
  summary: string;
  quantity?: number;
  amount?: number;
  payment?: string;
  note?: string;
  stage: OrderStage;
  createdAt: string;
};

export type V2State = {
  version: 2;
  workspace: {
    distributionId: string;
    distributionName: string;
    distributionManagerName: string;
    districtId: string;
    districtName: string;
    ownerPersonId: string;
    operationName: string;
    externalUrl: string;
    week: Week;
    campaignLabel: string;
  };
  people: Person[];
  orders: V2Order[];
  goals: Goal[];
  events: NetworkEvent[];
  updatedAt: string;
};
```

`createEmptyState()` includes Gerusa as `DISTRIBUTION`, Ritheli as `BUSINESS_OWNER`, zero goals for sales and recruitment, and no operational event. `createDemoState()` derives all wall content from its demo people, goals, and orders and is selected only by `?demo=1` when no saved state exists.

- [ ] **Step 4: Add independent selectors**

`selectToday(state)` returns literal keys `pending`, `forPortal`, `forConfirmation`, `withoutCompletedOrder`, `revenue`, `goals`, and `queue`.

`selectWall(state)` derives ordered events from state facts. `selectLeaderRanking(state, dimension)` returns `[]` unless at least two leaders have comparable data. `selectNetworkTree(state)` returns nested nodes beginning with Distribuição ES and never inserts Vitoriaware as a node.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm test -- src/lib/v2/model.test.ts src/lib/v2/selectors.test.ts`

Expected: both files pass with no failed tests.

- [ ] **Step 6: Commit**

```bash
git add src/lib/v2
git commit -m "feat: define VoeTupper V2 domain"
```

---

### Task 2: Legacy migration and local persistence

**Files:**
- Create: `src/lib/v2/migration.ts`
- Create: `src/lib/v2/storage.ts`
- Test: `src/lib/v2/migration.test.ts`
- Test: `src/lib/v2/storage.test.ts`

**Interfaces:**
- Consumes: `V2State`, `createEmptyState()`, `ORDER_STAGES`.
- Produces: `migrateLegacyState(raw, now)`, `PilotStore`, `createLocalPilotStore(storage)`, `LoadResult`.

- [ ] **Step 1: Write migration tests against hand-built legacy data**

```ts
it('migrates legacy booleans to the exact order stage', () => {
  const migrated = migrateLegacyState(JSON.stringify({
    workspace: { name: 'Empresária Serra', goal: 5000 },
    consultants: [{ id: 'c1', name: 'Ana', status: 'ATIVA', role: 'consultant' }],
    orders: [{ id: 'o1', consultantId: 'c1', week: '36/2026', summary: 'Pedido', checked: true, portal: true, print: false, finalized: false, cancelled: false }],
  }), '2026-09-05T12:00:00.000Z');
  expect(migrated.orders[0].stage).toBe('PORTAL_DONE');
  expect(migrated.people[0].status).toBe('ACTIVE');
});

it('does not invent a group for an ambiguous legacy person', () => {
  const migrated = migrateLegacyState(legacyWithoutGroup, now);
  expect(migrated.people[0].groupId).toBeUndefined();
  expect(migrated.people[0].status).toBe('REVIEW');
});
```

- [ ] **Step 2: Write persistence tests with an in-memory Storage implementation**

Cover these outcomes independently:

- existing V2 state loads without migration;
- valid legacy state is backed up before V2 is written;
- malformed legacy JSON returns an empty state and a visible `warning`;
- failed `setItem` returns `{ saved: false }` and keeps the caller's state untouched;
- calling `load()` twice returns the same migrated IDs.

- [ ] **Step 3: Run focused tests and verify RED**

Run: `npm test -- src/lib/v2/migration.test.ts src/lib/v2/storage.test.ts`

Expected: FAIL because migration and persistence modules do not exist.

- [ ] **Step 4: Implement the migration boundary**

Use these constants and result shape:

```ts
export const V2_STATE_KEY = 'voetupper-v2-state-v1';
export const LEGACY_STATE_KEY = 'voetupper-vitoriaware-state-v1';
export const LEGACY_BACKUP_KEY = 'voetupper-vitoriaware-state-v1:backup';

export type LoadResult = {
  state: V2State;
  source: 'v2' | 'legacy' | 'empty' | 'demo';
  warning?: string;
};

export interface PilotStore {
  load(options?: { demo?: boolean }): LoadResult;
  save(state: V2State): { saved: boolean; warning?: string };
}
```

The local adapter validates parsed data, writes the untouched legacy string to `LEGACY_BACKUP_KEY`, writes V2 only after successful migration, and never removes `LEGACY_STATE_KEY`.

- [ ] **Step 5: Run focused and full tests**

Run: `npm test -- src/lib/v2/migration.test.ts src/lib/v2/storage.test.ts`

Expected: focused tests pass.

Run: `npm test`

Expected: all existing and new tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/v2/migration.ts src/lib/v2/storage.ts src/lib/v2/migration.test.ts src/lib/v2/storage.test.ts
git commit -m "feat: migrate VoeTupper pilot data safely"
```

---

### Task 3: Reducer and local access gateway

**Files:**
- Create: `src/lib/v2/reducer.ts`
- Create: `src/lib/v2/auth.ts`
- Test: `src/lib/v2/reducer.test.ts`
- Test: `src/lib/v2/auth.test.ts`

**Interfaces:**
- Consumes: `V2State`, `V2Order`, `Person`, `Goal`, existing order transition helpers.
- Produces: `V2Action`, `v2Reducer(state, action)`, `LocalAccessGateway`, `createLocalAccessGateway(storage, sessionStorage, crypto)`.

- [ ] **Step 1: Write reducer tests for observable state changes**

```ts
it('adds a received order at the start of history', () => {
  const next = v2Reducer(state, { type: 'orderCreated', order });
  expect(next.orders[0]).toEqual(order);
  expect(next.events[0].kind).toBe('ORDER_RECEIVED');
});

it('advances an order and leaves completed orders in history', () => {
  const completed = ['orderAdvanced','orderAdvanced','orderAdvanced','orderAdvanced']
    .reduce(current => v2Reducer(current, { type: 'orderAdvanced', orderId: 'o1' }), state);
  expect(completed.orders[0].stage).toBe('COMPLETED');
  expect(selectToday(completed).queue).toEqual([]);
  expect(completed.orders).toHaveLength(1);
});

it('updates one goal without changing another goal', () => {
  const next = v2Reducer(state, { type: 'goalUpdated', goalId: 'recruitment', target: 45, current: 17 });
  expect(next.goals.find(goal => goal.id === 'recruitment')).toMatchObject({ target: 45, current: 17 });
  expect(next.goals.find(goal => goal.id === 'sales')).toEqual(state.goals.find(goal => goal.id === 'sales'));
});
```

Also cover `orderCancelled`, `personAdded`, `externalUrlUpdated`, unknown IDs, and unchanged person identity during a role update.

- [ ] **Step 2: Write local access tests**

Use fixed byte fixtures rather than mocking browser calls. Verify:

- `empresaria01-teste` maps to the legacy handle for compatibility;
- a valid legacy SHA-256 record signs in;
- a successful legacy sign-in writes a PBKDF2 record;
- a new password requires eight characters, a letter, and a symbol;
- sign-out clears only the session marker;
- wrong credentials never alter the stored record.

- [ ] **Step 3: Run focused tests and verify RED**

Run: `npm test -- src/lib/v2/reducer.test.ts src/lib/v2/auth.test.ts`

Expected: FAIL because reducer and gateway modules do not exist.

- [ ] **Step 4: Implement explicit reducer actions**

```ts
export type V2Action =
  | { type: 'orderCreated'; order: V2Order }
  | { type: 'orderAdvanced'; orderId: string }
  | { type: 'orderCancelled'; orderId: string }
  | { type: 'personAdded'; person: Person }
  | { type: 'goalUpdated'; goalId: string; target: number; current: number }
  | { type: 'externalUrlUpdated'; url: string };
```

Each successful action updates `updatedAt`. Unknown IDs and invalid terminal transitions return the same state reference.

- [ ] **Step 5: Implement the access port**

```ts
export interface LocalAccessGateway {
  hasCredential(): boolean;
  isSignedIn(): boolean;
  create(handle: string, password: string): Promise<{ ok: boolean; error?: string }>;
  signIn(handle: string, password: string): Promise<{ ok: boolean; error?: string }>;
  signOut(): void;
}
```

PBKDF2 uses SHA-256, a random 16-byte salt, and 120,000 iterations. Legacy verification exists only to preserve the current pilot and upgrades after a successful password check.

- [ ] **Step 6: Run focused and full tests, then commit**

Run: `npm test -- src/lib/v2/reducer.test.ts src/lib/v2/auth.test.ts`

Run: `npm test`

Expected: all tests pass.

```bash
git add src/lib/v2
git commit -m "feat: add V2 actions and local access"
```

---

### Task 4: App shell and action-first Today view

**Files:**
- Create: `src/components/v2/ui.tsx`
- Create: `src/components/v2/AppShell.tsx`
- Create: `src/components/v2/TodayView.tsx`
- Create: `src/components/v2/VoeTupperApp.tsx`
- Create: `src/components/v2/views.test.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `V2State`, `selectToday()`, `PilotStore`, `V2Action`.
- Produces: `VoeTupperApp`, `AppShell`, `TodayView`, `Icon`, `ProgressBar`, the V2 visual token system.

- [ ] **Step 1: Write rendered-behavior tests before components**

Use `renderToStaticMarkup` with literal state fixtures.

```tsx
it('renders the four primary destinations and no closing tab', () => {
  const html = renderToStaticMarkup(<AppShell active="today" onNavigate={() => undefined}><div /></AppShell>);
  expect(html).toContain('Hoje');
  expect(html).toContain('Rede');
  expect(html).toContain('Pedidos');
  expect(html).toContain('Perfil');
  expect(html).not.toContain('>Fechamento</button>');
});

it('puts the primary order action and current work before secondary content', () => {
  const html = renderToStaticMarkup(<TodayView state={stateWithPendingOrder} dispatch={() => undefined} onOpenOrder={() => undefined} onOpenClosing={() => undefined} onNavigate={() => undefined} />);
  expect(html.indexOf('Novo pedido')).toBeLessThan(html.indexOf('Metas do ciclo'));
  expect(html).toContain('O que precisa de você');
});
```

Also assert the rendered views contain no em dash and all icon-only buttons have accessible labels.

- [ ] **Step 2: Run component tests and verify RED**

Run: `npm test -- src/components/v2/views.test.tsx`

Expected: FAIL because V2 components do not exist.

- [ ] **Step 3: Build the shell and visual tokens**

Use CSS variables rooted at:

```css
:root {
  --brand: #e91e63;
  --brand-strong: #c61155;
  --brand-soft: #fff0f6;
  --plum: #2d1823;
  --muted: #735f69;
  --surface: #ffffff;
  --canvas: #fff8fb;
  --line: #efdfe6;
  --success: #237a4b;
  --warning: #9a6500;
  --danger: #a52b3f;
}
```

The shell uses a persistent sidebar from 900 px upward and bottom navigation below 900 px. Every nav button contains an inline functional SVG icon from `ui.tsx`, visible text, and `aria-current` for the active destination.

- [ ] **Step 4: Build the smallest coherent Today slice**

The first viewport includes the cycle context, `Novo pedido`, pending queue or compact success strip, goal cards, and network summary. The screen consumes selectors and dispatch callbacks only.

- [ ] **Step 5: Wire the entrypoint without persistence side effects during render**

`VoeTupperApp` loads state in a client effect, shows a compact branded loading state, persists only after a reducer action, and shows a persistent warning if `PilotStore.save()` fails.

- [ ] **Step 6: Run component tests, types, and build**

Run: `npm test -- src/components/v2/views.test.tsx`

Run: `npm run typecheck`

Run: `npm run build`

Expected: all commands exit 0 and the root route renders the recognizable VoeTupper V2 Today surface.

- [ ] **Step 7: Commit**

```bash
git add src/app src/components/v2
git commit -m "feat: build VoeTupper V2 shell and today view"
```

---

### Task 5: Functional order and closing flows

**Files:**
- Create: `src/lib/v2/order-form.ts`
- Create: `src/components/v2/OrderDialog.tsx`
- Create: `src/components/v2/OrdersView.tsx`
- Modify: `src/components/v2/TodayView.tsx`
- Modify: `src/components/v2/VoeTupperApp.tsx`
- Modify: `src/components/v2/views.test.tsx`
- Modify: `src/app/globals.css`
- Test: `src/lib/v2/order-flow.test.ts`

**Interfaces:**
- Consumes: `v2Reducer`, `parseBRL`, `nextActionLabel`, people eligible for orders.
- Produces: `createOrderFromForm(input, context)`, `OrderDialog`, `OrdersView` with `history` and `closing` modes.

- [ ] **Step 1: Write a failing order creation test**

```ts
it('derives week and date and starts the order at received', () => {
  expect(createOrderFromForm({
    consultantId: 'c1', source: 'AUDIO', summary: '2 potes', amount: '199,90', quantity: '2', payment: 'PIX', note: ''
  }, { weekId: 'week-36', now: '2026-09-05T15:00:00.000Z', id: 'o1' })).toEqual({
    id: 'o1', consultantId: 'c1', weekId: 'week-36', source: 'AUDIO', summary: '2 potes', amount: 199.9, quantity: 2, payment: 'PIX', stage: 'RECEIVED', createdAt: '2026-09-05T15:00:00.000Z'
  });
});
```

Add separate cases for blank optional value, negative value, missing person, blank summary, and inactive person.

- [ ] **Step 2: Write rendered flow contracts**

Verify that the dialog has associated labels, `Recebi por`, `Resumo / itens`, Brazilian numeric input modes, Cancelar and Salvar actions. Verify closing mode omits completed and cancelled orders but history retains them.

- [ ] **Step 3: Run focused tests and verify RED**

Run: `npm test -- src/lib/v2/order-flow.test.ts src/components/v2/views.test.tsx`

Expected: FAIL because the form adapter and views do not exist.

- [ ] **Step 4: Implement the order dialog and views**

Use controlled form state. Inline validation stays beside the invalid field. On success, dispatch `orderCreated`, close the dialog, and return to Hoje. Cancel requires the native confirmation boundary only when an existing order is being cancelled.

The closing queue labels actions as `Conferir`, `Lançar no portal`, `Enviar print`, and `Finalizar`, while preserving the existing domain stage enum internally.

- [ ] **Step 5: Run focused and full tests, then commit**

Run: `npm test -- src/lib/v2/order-flow.test.ts src/components/v2/views.test.tsx`

Run: `npm test`

Expected: all tests pass.

```bash
git add src/components/v2 src/lib/v2/order-form.ts src/lib/v2/order-flow.test.ts src/app/globals.css
git commit -m "feat: add V2 order and closing flows"
```

---

### Task 6: Network wall, ranking, tree, and directory

**Files:**
- Create: `src/components/v2/NetworkView.tsx`
- Modify: `src/components/v2/VoeTupperApp.tsx`
- Modify: `src/components/v2/views.test.tsx`
- Modify: `src/lib/v2/selectors.ts`
- Modify: `src/lib/v2/selectors.test.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `selectWall`, `selectLeaderRanking`, `selectNetworkTree`, `Person`.
- Produces: `NetworkView` with modes `wall`, `ranking`, `tree`, and `directory`.

- [ ] **Step 1: Extend selector tests for privacy and truthfulness**

```ts
it('returns no ranking when fewer than two leaders have comparable data', () => {
  expect(selectLeaderRanking(stateWithOneLeader, 'RECRUITMENT')).toEqual([]);
});

it('builds the canonical Serra path without an operation node', () => {
  const tree = selectNetworkTree(state);
  expect(tree.label).toBe('Distribuição Espírito Santo');
  expect(tree.children[0].label).toBe('Distrito Serra');
  expect(JSON.stringify(tree)).not.toContain('Vitoriaware');
});
```

Also verify directory search normalizes accents and does not return hidden private fields in peer summaries.

- [ ] **Step 2: Add failing rendered contracts**

Render each internal mode and assert:

- Mural content corresponds to derived events;
- Ranking empty state says `Ainda não há dados suficientes para comparar`;
- the tree exposes expandable labels and person counts;
- directory results show name, role, status, and business code when allowed;
- the page contains no external password or CPF label.

- [ ] **Step 3: Run focused tests and verify RED**

Run: `npm test -- src/lib/v2/selectors.test.ts src/components/v2/views.test.tsx`

Expected: FAIL on the new behavior.

- [ ] **Step 4: Implement the four network modes**

Use a segmented control inside Rede. The tree uses a vertical pink spine and native `details` elements for disclosure. Directory search stays local to the component and does not write to business state.

Profile drill-down is a dialog with only fields already authorized for the current pilot owner context.

- [ ] **Step 5: Run focused tests, full tests, and types**

Run: `npm test -- src/lib/v2/selectors.test.ts src/components/v2/views.test.tsx`

Run: `npm test`

Run: `npm run typecheck`

Expected: all commands exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/components/v2 src/lib/v2 src/app/globals.css
git commit -m "feat: add V2 network experience"
```

---

### Task 7: Profile, goals, external access, and login

**Files:**
- Create: `src/components/v2/ProfileView.tsx`
- Create: `src/components/v2/LoginView.tsx`
- Modify: `src/components/v2/VoeTupperApp.tsx`
- Modify: `src/components/v2/views.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `LocalAccessGateway`, `Goal`, `validateHttpsUrl`, reducer actions.
- Produces: accessible pilot login, profile summary, editable goals, and HTTPS-only external access setting.

- [ ] **Step 1: Write failing rendered contracts**

Verify:

- the login shows the official logo and `Acesso deste aparelho`;
- it never says the local access is secure multiuser authentication;
- the profile identifies Ritheli as Empresária of Distrito Serra;
- sales and recruitment goals render with their own units;
- achievements are absent when selectors return none;
- the external URL field has an explicit label and inline invalid state.

- [ ] **Step 2: Run component tests and verify RED**

Run: `npm test -- src/components/v2/views.test.tsx`

Expected: FAIL because profile and login components do not exist.

- [ ] **Step 3: Implement access states**

When no credential exists, show first-access creation. When a credential exists, show sign-in. Demo query mode may enter a temporary demo session without storing a credential. Sign-out clears the session only.

- [ ] **Step 4: Implement profile actions**

Goal edits reject negative values and preserve unrelated goals. The external URL saves only after `validateHttpsUrl` returns true. Open the external destination with `target="_blank"` and `rel="noreferrer noopener"`.

- [ ] **Step 5: Run focused tests, full tests, types, and build**

Run: `npm test -- src/components/v2/views.test.tsx src/lib/v2/auth.test.ts src/lib/v2/reducer.test.ts`

Run: `npm test`

Run: `npm run typecheck`

Run: `npm run build`

Expected: all commands exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/components/v2 src/app/globals.css
git commit -m "feat: complete V2 profile and pilot access"
```

---

### Task 8: Static export, PWA, and retirement of the legacy runtime

**Files:**
- Create: `next.config.ts`
- Create: `public/manifest.webmanifest`
- Create: `public/sw.js`
- Create: `src/components/v2/ServiceWorkerRegistration.tsx`
- Copy: `logo-192.png` to `public/logo-192.png`
- Copy: `logo-512.png` to `public/logo-512.png`
- Modify: `src/app/layout.tsx`
- Modify: `.github/workflows/ci.yml`
- Create: `src/lib/v2/pwa.test.ts`
- Delete: legacy root runtime files and their static-source tests after equivalent behavior is protected in V2 tests.

**Interfaces:**
- Consumes: complete V2 app and official PNG assets.
- Produces: `out/index.html`, installable manifest, offline shell, CI verification for the feature branch.

- [ ] **Step 1: Write failing PWA artifact tests**

```ts
it('declares both official PNG sizes and valid files', () => {
  expect(manifest.icons).toEqual([
    { src: '/logo-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  ]);
  expect(readPngSize('public/logo-192.png')).toEqual([192, 192]);
  expect(readPngSize('public/logo-512.png')).toEqual([512, 512]);
});
```

Also execute `public/sw.js` in a controlled event harness and assert install caches `/`, the manifest, both logos, and Next static assets without intercepting non-GET or cross-origin requests.

- [ ] **Step 2: Run the PWA test and verify RED**

Run: `npm test -- src/lib/v2/pwa.test.ts`

Expected: FAIL because public PWA artifacts do not exist.

- [ ] **Step 3: Configure static export and assets**

`next.config.ts` exports:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
```

The service worker uses a versioned cache and discovers same-origin `/_next/static/` assets from the built page rather than hard-coding content hashes.

- [ ] **Step 4: Remove the obsolete V2 runtime surface**

Delete root `index.html`, `app.js`, `app.css`, `hotfix.js`, `hotfix.css`, `product-v6.js`, `product-v6.css`, `network-es.js`, `network-es.css`, `mobile-v7.css`, `pilot-display.js`, `pilot-network.js`, `import-team.js`, `operational-import.js`, `operational-import-csv.js`, `operational-import-review.js`, and `operational-import.css` from the V2 branch only.

Delete or rewrite tests whose only behavior was grepping those legacy sources. Keep data, governance, migration, PWA, and user-observable tests.

- [ ] **Step 5: Extend CI and build**

Add `feat/voetupper-v2` to push branches. Preserve the pull request trigger for `main`.

Run: `npm test`

Run: `npm run typecheck`

Run: `npm run build`

Expected: all exit 0 and `out/index.html`, `out/manifest.webmanifest`, `out/logo-192.png`, and `out/logo-512.png` exist.

- [ ] **Step 6: Validate output references**

Run a local static-reference checker that parses each `src` and `href` from `out/index.html`, ignores external URLs and fragments, and fails if a referenced local file is absent.

Run: `git diff --check`

Expected: no missing local assets and no whitespace errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: make React the VoeTupper V2 runtime"
```

---

### Task 9: Final verification, private preview, and branch publication

**Files:**
- Create or modify: `.openai/hosting.json` only through the Sites registration flow if a private Site preview is created.
- Modify: `README.md` with the V2 run, safety, and preview status.

**Interfaces:**
- Consumes: validated static export and Git branch.
- Produces: a private preview URL and a published `feat/voetupper-v2` branch; does not change `main`.

- [ ] **Step 1: Update README accurately**

Document the V2 architecture, local pilot boundary, same-origin migration behavior, static export command, and features intentionally excluded from this first delivery. Do not describe Supabase or Drive as connected.

- [ ] **Step 2: Run the complete fresh verification gate**

Run in this order:

```bash
npm test
npm run typecheck
npm run build
git diff --check
git status --short
```

Expected: zero failed tests, typecheck exit 0, build exit 0, no whitespace errors, and only intended tracked changes before the final commit.

- [ ] **Step 3: Commit the verified handoff**

```bash
git add README.md .openai/hosting.json
git commit -m "docs: prepare VoeTupper V2 preview"
```

If `.openai/hosting.json` was not created, stage only `README.md`.

- [ ] **Step 4: Publish a private preview**

Use the Sites registration and hosting flow once. Set `static.directory` to `out`, package only public export artifacts, deploy the verified version, and retain the returned private URL. Do not browse the deployed URL from the agent runtime.

- [ ] **Step 5: Publish the feature branch without changing main**

Create the exact tested Git tree on `joyceradis/VoeTupper`, create commits with the local parent order, and move only `refs/heads/feat/voetupper-v2` with `force: false`. Fetch the remote branch and compare its tree SHA with the verified local tree SHA.

- [ ] **Step 6: Report the decision point**

Give Joyce the private preview URL and the GitHub branch or commit link. State clearly that `main` still serves the current stable version and will change only after her approval.
