# VoeTupper MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a mobile-first, multi-tenant direct-selling operations MVP centered on Today, Orders, Closing and Team.

**Architecture:** Next.js/TypeScript PWA with a small domain layer and Supabase/PostgreSQL persistence. Tenant-owned records carry `workspace_id` and are protected by RLS. Tupperware-specific language is configuration only; no third-party portal credentials or unauthorized automation are stored or performed.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase, Zod, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-30-voe-tupper-mvp-design.md`

## Global Constraints

- Mobile-first at ~390px; no horizontal tables for core flows.
- Management by exception: terminal orders leave the default queue.
- Vitrine/campaign and week remain distinct; order creation asks only for week and derives campaign.
- No Tupperware logos/artwork, no claim of affiliation, no portal password field, no scraping or portal automation.
- No real consultant data or secrets in git.
- Every tenant-owned table uses `workspace_id` plus RLS.
- Minimal personal data; optional phone; deletion/export paths represented in schema and product copy.
- WCAG 2.2 AA target and large touch targets.

---

### Task 1: Runnable product shell and domain tests

**Files:** package/config files, `src/app/*`, `src/lib/domain/order.ts`, `src/lib/domain/order.test.ts`.

**Interfaces:** `OrderStage`, `nextOrderStage(stage)`, `nextActionLabel(stage)`.

- [ ] Write tests asserting the exact RECEIVED → ORGANIZED → PORTAL_DONE → CONFIRMATION_SENT → COMPLETED transition and terminal CANCELLED behavior.
- [ ] Run tests and confirm RED before implementation.
- [ ] Implement minimal domain functions and responsive shell/navigation.
- [ ] Run unit tests and build.
- [ ] Commit.

### Task 2: Supabase schema, tenant isolation and legal baseline

**Files:** `supabase/migrations/0001_mvp.sql`, `src/lib/supabase/*`, `.env.example`, privacy/terms pages.

**Interfaces:** tables `workspaces`, `workspace_members`, `consultants`, `campaigns`, `weeks`, `orders`, `offers`, `recognitions`, `audit_events`; all business records tenant scoped.

- [ ] Add SQL assertions/documented checks for cross-workspace denial and required RLS policies.
- [ ] Create schema with enums, constraints, indexes, RLS and membership-based policies.
- [ ] Add auth-aware server client boundaries without exposing service-role credentials.
- [ ] Add concise privacy/non-affiliation/acceptable-use copy and data-rights contact placeholder driven by environment/config, not a fake entity.
- [ ] Verify SQL structure and TypeScript build.
- [ ] Commit.

### Task 3: Today command center

**Files:** `src/app/page.tsx`, `src/components/today/*`, `src/lib/domain/dashboard.ts`, tests.

**Interfaces:** `buildTodaySummary({week, orders, consultants, offers})` returns actionable counts and queue.

- [ ] Write failing tests for pending counts, no-order consultants, realized amount and urgency ordering.
- [ ] Implement derived metrics only; do not persist duplicate dashboard totals.
- [ ] Build compact mobile command center with one primary New Order CTA and secondary Closing/Team/Portal actions.
- [ ] Verify empty states and 390px layout via Playwright smoke test.
- [ ] Commit.

### Task 4: Fast order capture and progression

**Files:** `src/app/orders/*`, `src/components/orders/*`, server actions/repository, tests.

**Interfaces:** create order requires consultant, week, source channel, summary; amount optional. `advanceOrder` enforces valid transitions server-side.

- [ ] Write failing validation/transition tests.
- [ ] Implement Zod input schemas and server-side authorization.
- [ ] Implement thumb-friendly New Order flow with current week preselected.
- [ ] Implement stage progression and cancellation confirmation.
- [ ] Add audit event on terminal/destructive transitions without logging free-text/phone payloads.
- [ ] Verify create → progress → complete workflow.
- [ ] Commit.

### Task 5: Closing queue

**Files:** `src/app/closing/*`, `src/components/closing/*`, tests.

**Interfaces:** default query returns only active-week non-terminal orders; filters `all`, `portal`, `confirmation`, `unresolved`.

- [ ] Write failing queue/filter tests.
- [ ] Implement management-by-exception query and one-tap next action.
- [ ] Ensure completed/cancelled orders disappear from default queue.
- [ ] Verify mobile workflow.
- [ ] Commit.

### Task 6: Team and consultant history

**Files:** `src/app/team/*`, `src/components/team/*`, validation/repository tests.

**Interfaces:** consultant stores display name, optional business code, optional phone, status and optional leader note; never portal password.

- [ ] Write failing validation tests including rejection of unsupported credential/password fields.
- [ ] Implement searchable team cards, create/edit flow and consultant history.
- [ ] Add status controls active/new/paused/inactive.
- [ ] Verify no credential field exists in UI/schema/API.
- [ ] Commit.

### Task 7: Weekly setup, offers and lightweight recognition

**Files:** `src/app/settings/weeks/*`, `src/components/week/*`, tests.

**Interfaces:** campaign has many weeks; week has starts/closes/team_goal/status; offers attach to week or campaign.

- [ ] Write failing tests proving campaign derives from selected week and weekly totals do not mix cycles.
- [ ] Implement minimal week/campaign setup and active offer entry.
- [ ] Surface offers on Today without a separate analytics module.
- [ ] Generate recognition candidates from operational results with manual confirmation.
- [ ] Commit.

### Task 8: Commercial hardening and pilot readiness

**Files:** onboarding, `README.md`, `SECURITY.md`, `.github/workflows/ci.yml`, Playwright tests, sanitized seed/demo.

**Interfaces:** pilot can create workspace, configure week, add consultant, process order, close it and return next week.

- [ ] Add end-to-end mobile test for login/onboarding → consultant → week → order → completion.
- [ ] Add CI for unit tests, typecheck/build and secret scanning/dependency audit where supported.
- [ ] Add sanitized demo only and spreadsheet migration documentation explicitly excluding passwords and ambiguous records.
- [ ] Add product telemetry event names that exclude message contents and personal-data payloads.
- [ ] Document deployment variables, backup expectation, privacy/trademark release gates and pricing experiment per workspace/month.
- [ ] Run full test/build verification and inspect git for real data/secrets.
- [ ] Commit and open PR for review.
