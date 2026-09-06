# VoeTupper V3.0 Foundation and Network Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clean VoeTupper V3.0 with one understandable entry point, Vitrine-based goals, role-scoped people, a living Espírito Santo network view, ranking by progress, profile onboarding, and a safe boundary between demonstration and real data.

**Architecture:** Keep the tested Next.js and React runtime, but create the V3 experience in a separate `src/features/v3` boundary. Pure domain functions define scope, Vitrine, priorities, and ranking; repository adapters provide either explicit demo data or authenticated Supabase data. Existing V2 files stay untouched until V3 passes verification.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.8, Vitest 3, Supabase JS/SSR, PostgreSQL RLS, static export for preview.

**Spec:** `docs/superpowers/specs/2026-09-06-voetupper-v3-operacao-rede-design.md`

## Global Constraints

- The Vitrine is the primary period; week is auxiliary metadata.
- The default operational deadline is Monday at 12:00 in `America/Sao_Paulo`.
- No visible copy may contain an em dash.
- Real and demonstration data must never share a repository, cache key, or runtime state.
- Unknown data remains `null`; the interface must not invent people, groups, values, or product codes.
- Operational detail flows upward through the hierarchy and never downward.
- Mobile and notebook layouts must both remain usable.
- V2 and `main` remain preserved; implementation stays on `feat/voetupper-v3`.
- No TupperNet credential may appear in Git, fixtures, localStorage, logs, or analytics.

---

## File Structure

### Domain

- `src/features/v3/domain/model.ts`: V3 entities and discriminated state types.
- `src/features/v3/domain/vitrine.ts`: deadline and Vitrine calculations.
- `src/features/v3/domain/scope.ts`: hierarchy visibility rules.
- `src/features/v3/domain/insights.ts`: Home priorities and ranking projections.
- `src/features/v3/domain/*.test.ts`: pure behavior tests.

### Data and authentication

- `src/features/v3/data/repository.ts`: repository interface and load result types.
- `src/features/v3/data/demo-repository.ts`: explicit fake-data adapter used only by `?demo=1`.
- `src/features/v3/data/supabase-repository.ts`: authenticated real-data adapter.
- `src/features/v3/data/map-supabase.ts`: database row to domain mapping.
- `src/features/v3/auth/session.ts`: Supabase session and onboarding boundary.
- `supabase/migrations/0008_v3_vitrines_profiles.sql`: Vitrine and profile fields required by V3.0.

### Interface

- `src/features/v3/VoeTupperV3.tsx`: composition root and view routing.
- `src/features/v3/components/V3Shell.tsx`: single shell and adaptive navigation.
- `src/features/v3/components/AccessView.tsx`: clear VoeTupper account entry.
- `src/features/v3/components/HomeView.tsx`: personalized Radar.
- `src/features/v3/components/NetworkView.tsx`: Pessoas, Estrutura, and Corrida da Vitrine.
- `src/features/v3/components/PeopleList.tsx`: compact scope-aware directory.
- `src/features/v3/components/LivingNetwork.tsx`: state overview and expandable tree.
- `src/features/v3/components/VitrineRace.tsx`: goal progress ranking.
- `src/features/v3/components/ProfileView.tsx`: registration and profile data.
- `src/features/v3/components/ui.tsx`: V3 primitives and icons.
- `src/features/v3/v3.css`: V3 tokens, layouts, motion, and responsive rules.
- `src/app/page.tsx`: switch the root from V2 to V3 only after all views pass.

### Import and verification

- `src/features/v3/import/parse-team.ts`: in-memory CSV parsing and normalization.
- `src/features/v3/import/parse-team.test.ts`: malformed, duplicate, and unknown-group cases.
- `src/features/v3/components/TeamImport.tsx`: import preview and review UI.
- `src/features/v3/components/views.test.tsx`: server-rendered view contracts.
- `src/features/v3/copy.test.ts`: prohibited-copy and demo-leak checks.

---

### Task 1: Define the V3 domain boundary

**Files:**
- Create: `src/features/v3/domain/model.ts`
- Create: `src/features/v3/domain/scope.ts`
- Create: `src/features/v3/domain/scope.test.ts`

**Interfaces:**
- Consumes: no V2 state types.
- Produces: `V3Snapshot`, `Viewer`, `Person`, `Membership`, `Vitrine`, `Goal`, `canViewPerson(viewer, target)` and `filterPeopleForViewer(viewer, people)`.

- [ ] **Step 1: Write failing hierarchy tests**

```ts
import { describe, expect, it } from 'vitest';
import { canViewPerson } from './scope';

const consultant = { personId: 'c1', role: 'CONSULTANT', distributionId: 'es', districtId: 'serra', groupId: 'g1' } as const;
const leader = { personId: 'l1', role: 'LEADER', distributionId: 'es', districtId: 'serra', groupId: 'g1' } as const;
const owner = { personId: 'o1', role: 'BUSINESS_OWNER', distributionId: 'es', districtId: 'serra' } as const;

describe('V3 scope', () => {
  it('lets a leader see consultants only in her group', () => {
    expect(canViewPerson(leader, consultant)).toBe(true);
    expect(canViewPerson(leader, { ...consultant, personId: 'c2', groupId: 'g2' })).toBe(false);
  });

  it('lets an owner see her district and prevents details from flowing down', () => {
    expect(canViewPerson(owner, leader)).toBe(true);
    expect(canViewPerson(consultant, owner)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test and verify the missing module failure**

Run: `npm test -- src/features/v3/domain/scope.test.ts`

Expected: FAIL because `model.ts` and `scope.ts` do not exist.

- [ ] **Step 3: Implement the minimal domain model and scope rules**

```ts
export type NetworkRole = 'DISTRIBUTION' | 'BUSINESS_OWNER' | 'LEADER' | 'CONSULTANT';
export type PersonStatus = 'NEW' | 'ACTIVE' | 'PAUSED' | 'INACTIVE' | 'REACTIVATION_ELIGIBLE' | 'REACTIVATED';

export type Viewer = {
  personId: string;
  role: NetworkRole;
  distributionId: string;
  districtId?: string;
  groupId?: string;
};

export type Person = Viewer & {
  displayName: string;
  status: PersonStatus;
  businessCode: string | null;
};
```

```ts
export function canViewPerson(viewer: Viewer, target: Viewer) {
  if (viewer.personId === target.personId) return true;
  if (viewer.distributionId !== target.distributionId) return false;
  if (viewer.role === 'DISTRIBUTION') return true;
  if (viewer.role === 'BUSINESS_OWNER') return viewer.districtId === target.districtId;
  if (viewer.role === 'LEADER') return viewer.groupId === target.groupId && target.role === 'CONSULTANT';
  return false;
}
```

- [ ] **Step 4: Run the domain tests**

Run: `npm test -- src/features/v3/domain/scope.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the domain boundary**

```bash
git add src/features/v3/domain
git commit -m "feat: define V3 network domain"
```

### Task 2: Model Vitrines and Monday noon closing

**Files:**
- Create: `src/features/v3/domain/vitrine.ts`
- Create: `src/features/v3/domain/vitrine.test.ts`
- Modify: `src/features/v3/domain/model.ts`
- Create: `supabase/migrations/0008_v3_vitrines_profiles.sql`
- Modify: `src/lib/domain/supabase-governance.test.ts`

**Interfaces:**
- Consumes: `Vitrine` from `model.ts`.
- Produces: `getVitrineStatus(vitrine, now)`, `formatClosing(vitrine)`, and database tables `vitrines`, `vitrine_goals`.

- [ ] **Step 1: Write failing Vitrine tests**

```ts
import { describe, expect, it } from 'vitest';
import { getVitrineStatus } from './vitrine';

const vitrine = {
  id: 'v09-2026',
  label: 'Vitrine 09/2026',
  opensAt: '2026-08-25T12:00:00-03:00',
  closesAt: '2026-09-07T12:00:00-03:00',
  timezone: 'America/Sao_Paulo',
} as const;

it('keeps the Vitrine open until Monday at noon', () => {
  expect(getVitrineStatus(vitrine, new Date('2026-09-07T14:59:59Z'))).toBe('OPEN');
  expect(getVitrineStatus(vitrine, new Date('2026-09-07T15:00:00Z'))).toBe('CLOSED');
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- src/features/v3/domain/vitrine.test.ts`

Expected: FAIL because `getVitrineStatus` does not exist.

- [ ] **Step 3: Implement the Vitrine functions and migration**

```ts
export function getVitrineStatus(vitrine: Vitrine, now: Date): 'PLANNED' | 'OPEN' | 'CLOSED' {
  if (now.getTime() < Date.parse(vitrine.opensAt)) return 'PLANNED';
  return now.getTime() < Date.parse(vitrine.closesAt) ? 'OPEN' : 'CLOSED';
}
```

```sql
create table if not exists public.vitrines(
  id uuid primary key default gen_random_uuid(),
  distribution_id uuid not null references public.distributions(id) on delete cascade,
  label text not null,
  opens_at timestamptz not null,
  closes_at timestamptz not null,
  timezone text not null default 'America/Sao_Paulo',
  unique(distribution_id,label),
  check(closes_at > opens_at)
);

create table if not exists public.vitrine_goals(
  id uuid primary key default gen_random_uuid(),
  vitrine_id uuid not null references public.vitrines(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  goal_type text not null check(goal_type in ('sales','recruitment','activity')),
  target_value numeric(14,2) not null check(target_value >= 0),
  current_value numeric(14,2) not null default 0 check(current_value >= 0),
  unique(vitrine_id,person_id,goal_type)
);
```

- [ ] **Step 4: Add and verify RLS policies**

Add these policies and extend `src/lib/domain/supabase-governance.test.ts` to assert both tables enable RLS and contain scoped policies:

```sql
alter table public.vitrines enable row level security;
alter table public.vitrine_goals enable row level security;

create policy vitrines_scoped_read on public.vitrines for select
using(exists(
  select 1 from public.memberships viewer
  where viewer.person_id=public.current_person_id()
    and viewer.ended_at is null
    and viewer.distribution_id=vitrines.distribution_id
));

create policy vitrines_admin_write on public.vitrines for all
using(public.can_admin_scope(distribution_id,null))
with check(public.can_admin_scope(distribution_id,null));

create policy vitrine_goals_scoped_read on public.vitrine_goals for select
using(exists(
  select 1
  from public.memberships target
  join public.vitrines v on v.id=vitrine_goals.vitrine_id
  where target.person_id=vitrine_goals.person_id
    and target.ended_at is null
    and target.distribution_id=v.distribution_id
    and public.can_read_operational_scope(target.person_id,target.distribution_id,target.district_id,target.group_id)
));

create policy vitrine_goals_admin_write on public.vitrine_goals for all
using(exists(
  select 1 from public.memberships target
  where target.person_id=vitrine_goals.person_id
    and target.ended_at is null
    and public.can_admin_scope(target.distribution_id,target.district_id)
))
with check(exists(
  select 1 from public.memberships target
  where target.person_id=vitrine_goals.person_id
    and target.ended_at is null
    and public.can_admin_scope(target.distribution_id,target.district_id)
));
```

Run: `npm test -- src/features/v3/domain/vitrine.test.ts src/lib/domain/supabase-governance.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the Vitrine model**

```bash
git add src/features/v3/domain supabase/migrations/0008_v3_vitrines_profiles.sql src/lib/domain/supabase-governance.test.ts
git commit -m "feat: model V3 Vitrines and goals"
```

### Task 3: Add repository adapters and explicit data modes

**Files:**
- Create: `src/features/v3/data/repository.ts`
- Create: `src/features/v3/data/demo-repository.ts`
- Create: `src/features/v3/data/supabase-repository.ts`
- Create: `src/features/v3/data/map-supabase.ts`
- Create: `src/features/v3/data/repository.test.ts`

**Interfaces:**
- Consumes: domain types and `createClient()` from `src/lib/supabase/client.ts`.
- Produces: `V3Repository.loadSnapshot(): Promise<LoadSnapshotResult>` and `createRepository({ demo, client })`.

- [ ] **Step 1: Write failing mode-separation tests**

```ts
import { describe, expect, it } from 'vitest';
import { createRepository } from './repository';

it('never falls back to fake people in real mode', async () => {
  const repository = createRepository({ demo: false, client: null });
  await expect(repository.loadSnapshot()).resolves.toEqual({ kind: 'configuration-required' });
});

it('loads labelled example data only in demo mode', async () => {
  const result = await createRepository({ demo: true, client: null }).loadSnapshot();
  expect(result.kind).toBe('ready');
  if (result.kind === 'ready') expect(result.snapshot.mode).toBe('DEMO');
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run: `npm test -- src/features/v3/data/repository.test.ts`

Expected: FAIL because repository adapters do not exist.

- [ ] **Step 3: Implement the adapter contract**

```ts
export type LoadSnapshotResult =
  | { kind: 'ready'; snapshot: V3Snapshot }
  | { kind: 'signed-out' }
  | { kind: 'configuration-required' }
  | { kind: 'error'; message: string };

export interface V3Repository {
  loadSnapshot(): Promise<LoadSnapshotResult>;
}
```

`createRepository` must return the demo adapter only when `demo === true`. Missing Supabase configuration in real mode returns `configuration-required` and an empty operational surface.

- [ ] **Step 4: Map authenticated Supabase rows without widening scope**

Query `current_person_id()`, current membership, Vitrine, people, groups, goals, and `leader_scoreboard`. Map nulls without defaulting names or values. Return database errors as `{ kind: 'error' }` without exposing SQL or row content.

```ts
export function createSupabaseRepository(client: SupabaseClient): V3Repository {
  return {
    async loadSnapshot() {
      const { data: personId, error: identityError } = await client.rpc('current_person_id');
      if (identityError) return { kind: 'error', message: 'Não foi possível abrir sua rede.' };
      if (!personId) return { kind: 'signed-out' };

      const [membership, people, groups, vitrines, goals, race] = await Promise.all([
        client.from('memberships').select('*').eq('person_id', personId).is('ended_at', null).single(),
        client.from('people').select('id,display_name,status,source_member_id'),
        client.from('groups').select('id,name,district_id'),
        client.from('vitrines').select('*').order('closes_at', { ascending: true }).limit(1).maybeSingle(),
        client.from('vitrine_goals').select('*'),
        client.from('leader_scoreboard').select('*'),
      ]);
      const failed = [membership, people, groups, vitrines, goals, race].find(result => result.error);
      if (failed?.error) return { kind: 'error', message: 'Não foi possível abrir sua rede.' };
      return mapSupabaseSnapshot({ personId, membership, people, groups, vitrines, goals, race });
    },
  };
}
```

Run: `npm test -- src/features/v3/data/repository.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the data boundary**

```bash
git add src/features/v3/data
git commit -m "feat: separate V3 real and demo data"
```

### Task 4: Build the single entry point and adaptive shell

**Files:**
- Create: `src/features/v3/VoeTupperV3.tsx`
- Create: `src/features/v3/components/AccessView.tsx`
- Create: `src/features/v3/components/V3Shell.tsx`
- Create: `src/features/v3/components/ui.tsx`
- Create: `src/features/v3/v3.css`
- Create: `src/features/v3/components/shell.test.tsx`

**Interfaces:**
- Consumes: `createRepository`, Supabase Auth, viewer display name and role.
- Produces: destinations `home`, `network`, and `profile`; accessible login states; `V3Shell`.

- [ ] **Step 1: Write failing shell and access tests**

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { AccessView } from './AccessView';

it('distinguishes the VoeTupper account from the TupperNet portal', () => {
  const html = renderToStaticMarkup(<AccessView mode="signin" busy={false} onSubmit={async () => {}} />);
  expect(html).toContain('Entrar no VoeTupper');
  expect(html).toContain('Este acesso não é a senha do TupperNet');
  expect(html).toContain('Esqueci minha senha');
  expect(html).not.toContain('empresaria01-teste');
});
```

- [ ] **Step 2: Run the view test and verify failure**

Run: `npm test -- src/features/v3/components/shell.test.tsx`

Expected: FAIL because the V3 shell does not exist.

- [ ] **Step 3: Implement clear authentication states**

Use e-mail as the VoeTupper identifier. Support sign-in, password-reset request, configuration-required, loading, and authenticated states. Demo mode bypasses authentication and carries a persistent `Demonstração` label.

The entry copy must include:

```text
Entrar no VoeTupper
Use seu e-mail para acessar sua rede.
Este acesso não é a senha do TupperNet.
```

- [ ] **Step 4: Implement the genie-style navigation**

Use a CSS grid navigation whose active item grows from `44px` to `minmax(92px, 1fr)` with a 220ms cubic-bezier transition. Add `@media (prefers-reduced-motion: reduce)` to remove the transform and width animation.

```css
.v3-nav-item { min-width: 44px; transition: flex 220ms cubic-bezier(.2,.8,.2,1), transform 220ms cubic-bezier(.2,.8,.2,1); }
.v3-nav-item[aria-current="page"] { flex: 1 1 112px; transform: translateY(-2px); }
@media (prefers-reduced-motion: reduce) {
  .v3-nav-item { transition: none; }
  .v3-nav-item[aria-current="page"] { transform: none; }
}
```

Run: `npm test -- src/features/v3/components/shell.test.tsx && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit the V3 shell**

```bash
git add src/features/v3
git commit -m "feat: build clear V3 entry and shell"
```

### Task 5: Build the personalized Home Radar

**Files:**
- Create: `src/features/v3/domain/insights.ts`
- Create: `src/features/v3/domain/insights.test.ts`
- Create: `src/features/v3/components/HomeView.tsx`
- Modify: `src/features/v3/v3.css`
- Create: `src/features/v3/components/home.test.tsx`

**Interfaces:**
- Consumes: viewer, current Vitrine, goals, people, and pending work from `V3Snapshot`.
- Produces: `buildPriorityCards(snapshot)` and role-aware `HomeView`.

- [ ] **Step 1: Write failing priority tests**

```ts
it('places near-goal people before low-movement people', () => {
  const cards = buildPriorityCards(snapshotWith({ nearGoal: ['l1'], lowMovement: ['l2'] }));
  expect(cards.map(card => card.kind)).toEqual(['NEAR_GOAL', 'LOW_MOVEMENT']);
});

it('does not place inactive people directly on the Home', () => {
  expect(buildPriorityCards(snapshotWith({ inactive: ['c1'] }))).toEqual([]);
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run: `npm test -- src/features/v3/domain/insights.test.ts`

Expected: FAIL because `buildPriorityCards` does not exist.

- [ ] **Step 3: Implement deterministic priority ordering**

Order priorities by: deadline-blocking action, near goal, pending confirmation, unidentified item, low movement. Never include inactive people in the direct list.

- [ ] **Step 4: Render the personalized Home**

Render viewer first name, Vitrine label, Monday noon closing, active countdown, personal goals, and `Quem precisa de você hoje`. Empty state copy is `Tudo em dia por aqui`.

```tsx
<header className="v3-home-heading">
  <p>{snapshot.vitrine.label}</p>
  <h1>Bom dia, {firstName(snapshot.viewer.displayName)}.</h1>
  <span>Fecha segunda-feira às 12h</span>
</header>
<PriorityList cards={buildPriorityCards(snapshot)} empty="Tudo em dia por aqui" />
```

Run: `npm test -- src/features/v3/domain/insights.test.ts src/features/v3/components/home.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the Home Radar**

```bash
git add src/features/v3/domain src/features/v3/components src/features/v3/v3.css
git commit -m "feat: add personalized V3 radar"
```

### Task 6: Build Pessoas, Mapa Vivo, and Corrida da Vitrine

**Files:**
- Create: `src/features/v3/components/NetworkView.tsx`
- Create: `src/features/v3/components/PeopleList.tsx`
- Create: `src/features/v3/components/LivingNetwork.tsx`
- Create: `src/features/v3/components/VitrineRace.tsx`
- Create: `src/features/v3/domain/network.ts`
- Create: `src/features/v3/domain/network.test.ts`
- Create: `src/features/v3/components/network.test.tsx`
- Modify: `src/features/v3/v3.css`

**Interfaces:**
- Consumes: scope-filtered people, groups, goals, and district aggregates.
- Produces: `buildNetworkTree(snapshot)`, `buildVitrineRace(snapshot)`, and three network modes.

- [ ] **Step 1: Write failing network tests**

```ts
it('puts Gerusa above districts and never inside a district region', () => {
  const tree = buildNetworkTree(snapshot);
  expect(tree.root.label).toBe('Gerusa');
  expect(tree.root.role).toBe('DISTRIBUTION');
  expect(tree.districts.some(district => district.ownerName === 'Gerusa')).toBe(false);
});

it('sorts the race by progress and identifies who is almost there', () => {
  const race = buildVitrineRace(snapshot);
  expect(race[0]).toMatchObject({ personId: 'l2', status: 'ALMOST_THERE' });
  expect(race[0].remaining).toBeGreaterThanOrEqual(0);
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run: `npm test -- src/features/v3/domain/network.test.ts`

Expected: FAIL because network builders do not exist.

- [ ] **Step 3: Implement the compact People list**

Default to active/new people. Status totals are buttons. Only after clicking the responsible-person total may the user select inactive or reactivation-eligible people. Render only `filterPeopleForViewer` output.

```tsx
const visible = filterPeopleForViewer(snapshot.viewer, snapshot.people);
const listed = showInactive
  ? visible
  : visible.filter(person => person.status === 'ACTIVE' || person.status === 'NEW');
return <PeopleList people={listed} onOpenStatuses={() => setShowInactive(true)} />;
```

- [ ] **Step 4: Implement the Mapa Vivo**

Render a decorative Espírito Santo silhouette with district nodes, not exact person geolocation. Gerusa appears in a separate state-level crown card. Selecting a district opens a vertical tree with Empresária, groups, Líderes, and Consultoras.

```tsx
<section aria-label="Mapa Vivo da Rede">
  <DistributionCrown person={tree.root} />
  <EspíritoSantoSilhouette districts={tree.districts} onSelect={setSelectedDistrictId} />
  {selectedDistrict ? <DistrictTree district={selectedDistrict} /> : null}
</section>
```

- [ ] **Step 5: Implement the Corrida da Vitrine**

Compute `progress = target > 0 ? current / target : null` and `remaining = target > 0 ? Math.max(0, target - current) : null`. Rank only comparable roles and Vitrine. Use `ALMOST_THERE` when progress is at least 0.8 and below 1.

```ts
const status = progress === null ? 'NO_GOAL'
  : progress >= 1 ? 'ACHIEVED'
  : progress >= 0.8 ? 'ALMOST_THERE'
  : progress > 0 ? 'MOVING'
  : 'NEEDS_SUPPORT';
```

Run: `npm test -- src/features/v3/domain/network.test.ts src/features/v3/components/network.test.tsx && npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit the network experience**

```bash
git add src/features/v3
git commit -m "feat: build the V3 living network"
```

### Task 7: Add profile onboarding and safe team import

**Files:**
- Create: `src/features/v3/components/ProfileView.tsx`
- Create: `src/features/v3/components/TeamImport.tsx`
- Create: `src/features/v3/import/parse-team.ts`
- Create: `src/features/v3/import/parse-team.test.ts`
- Create: `src/features/v3/components/profile.test.tsx`
- Modify: `src/features/v3/data/repository.ts`
- Modify: `src/features/v3/data/supabase-repository.ts`
- Modify: `src/features/v3/v3.css`

**Interfaces:**
- Consumes: authenticated viewer and district administration permission.
- Produces: `parseTeamCsv(text)`, `reviewTeamRows(rows)`, `repository.updateProfile(input)`, and `repository.importTeam(batch)`.

- [ ] **Step 1: Write failing parser tests**

```ts
it('keeps unknown groups pending instead of inventing a link', () => {
  const result = reviewTeamRows(parseTeamCsv('Nome;Grupo;Código\nAna;Grupo não confirmado;123'));
  expect(result.rows[0]).toMatchObject({ displayName: 'Ana', groupId: null, status: 'PENDING_REVIEW' });
});

it('flags repeated code and name pairs', () => {
  const result = reviewTeamRows(parseTeamCsv('Nome;Código\nAna;123\nAna;123'));
  expect(result.issues[0].kind).toBe('POSSIBLE_DUPLICATE');
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run: `npm test -- src/features/v3/import/parse-team.test.ts`

Expected: FAIL because the import parser does not exist.

- [ ] **Step 3: Implement in-memory parsing and review**

Accept CSV, TSV, or semicolon-separated text. Do not write raw files to localStorage. Preserve raw values for review and submit only after an authorized administrator confirms the batch.

- [ ] **Step 4: Implement the one-time profile**

Render display name, legal name if collected, role, code, contact, scope, status, and notification preference. Place a separate `Acesso ao TupperNet` card showing code and `Cofre disponível na próxima etapa`; no password field exists in V3.0.

```tsx
<ProfileIdentity person={snapshot.viewer} membership={snapshot.membership} />
<PortalAccessCard businessCode={snapshot.viewer.businessCode} status="Cofre disponível na próxima etapa" />
{canAdmin(snapshot.viewer) ? <TeamImport repository={repository} /> : null}
```

- [ ] **Step 5: Implement the import UI and repository mutations**

Allow Empresária or Distribuição to select a file, preview rows, resolve groups, mark duplicate decisions, and confirm one transactional batch. Other roles do not render the import action.

```ts
export type TeamImportBatch = {
  fileName: string;
  rows: ReviewedTeamRow[];
  decisions: Array<{ rowIndex: number; action: 'CREATE' | 'LINK' | 'SKIP'; personId?: string }>;
};

export interface V3Repository {
  loadSnapshot(): Promise<LoadSnapshotResult>;
  updateProfile(input: ProfileInput): Promise<MutationResult>;
  importTeam(batch: TeamImportBatch): Promise<MutationResult>;
}
```

Run: `npm test -- src/features/v3/import/parse-team.test.ts src/features/v3/components/profile.test.tsx && npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit onboarding and import**

```bash
git add src/features/v3
git commit -m "feat: add V3 profile and safe team import"
```

### Task 8: Switch the root, verify, and publish a separate preview

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Create: `src/features/v3/components/views.test.tsx`
- Create: `src/features/v3/copy.test.ts`
- Modify: `README.md`
- Modify: `.openai/hosting.json`

**Interfaces:**
- Consumes: complete V3 composition root.
- Produces: root V3 runtime, honest demo URL, and a private V3 preview deployment.

- [ ] **Step 1: Write failing root and copy tests**

```ts
it('uses V3 as the only root application', async () => {
  const source = await readFile('src/app/page.tsx', 'utf8');
  expect(source).toContain("from '@/features/v3/VoeTupperV3'");
  expect(source).not.toContain('components/v2');
});

it('contains no provisional account or em dash in V3 visible copy', async () => {
  const files = await loadV3Sources();
  expect(files).not.toContain('empresaria01-teste');
  expect(files).not.toContain('—');
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run: `npm test -- src/features/v3/components/views.test.tsx src/features/v3/copy.test.ts`

Expected: FAIL while the root still imports V2.

- [ ] **Step 3: Switch the root and document the modes**

`src/app/page.tsx` must import only `VoeTupperV3`. README must state that `/` is authenticated real mode and `/?demo=1` is visibly labelled demonstration mode. Keep V2 files only for rollback during the branch review.

- [ ] **Step 4: Run the complete verification suite**

Run: `npm test`

Expected: all tests pass.

Run: `npm run typecheck`

Expected: exit code 0.

Run: `npm run build`

Expected: static export succeeds and produces `out/index.html`.

- [ ] **Step 5: Inspect mobile and notebook layouts**

Verify login, Home, People filters, Mapa Vivo, Corrida da Vitrine, Profile, import empty state, configuration-required state, and `?demo=1`. Confirm no fake person appears in real mode and no private credential exists in built assets.

- [ ] **Step 6: Publish without replacing V2 or main**

Deploy the `out` directory to a new private V3 preview project. Do not reuse or overwrite the V2 project ID. Record the new preview URL in README and `.openai/hosting.json` only on the V3 branch.

- [ ] **Step 7: Commit the verified V3.0 preview**

```bash
git add src/app src/features/v3 README.md .openai/hosting.json
git commit -m "feat: publish VoeTupper V3 foundation"
```

---

## Completion Gate

V3.0 is complete only when the real root never falls back to demo data, the demo bypass is visibly labelled, permissions are enforced in both UI and RLS, the deadline is Monday at noon, no provisional username remains, the V2 deployment is untouched, and the V3 preview passes tests, typecheck, static export, and visual inspection.
