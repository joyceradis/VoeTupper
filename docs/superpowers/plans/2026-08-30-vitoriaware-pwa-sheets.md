# VoeTupper Vitoriaware PWA + Sheets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a Vitoriaware-first PWA whose primary interface is an operational work queue and whose pilot datastore is a private, per-workspace Google Sheet copied from a sanitized master template.

**Architecture:** The public/static pilot is refactored into a mobile-first PWA with explicit adapter boundaries. A sanitized Google Sheet template is created immediately. Server-only Google Sheets integration and real authentication are prepared behind interfaces and activated only when secure server credentials/runtime are available; private Sheets are never exposed directly to the browser.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, PWA manifest/service worker, Google Sheets API contract, Google Drive template provisioning, Canva-generated/original brand system.

**Spec:** `docs/superpowers/specs/2026-08-30-vitoriaware-pwa-sheets-design.md`

## Global Constraints
- Pilot vocabulary is Vitoriaware / Espírito Santo only.
- Vitrine and Semana remain distinct concepts.
- UI is utility-first; no hero/slogan/template-AI decoration.
- Pink is brand accent, not a full-screen palette.
- Never expose Tupper.NET passwords or Google service credentials.
- Never publish the operational Sheet to the web.
- CPF/phone are not passwords.
- New workspaces receive a zeroed spreadsheet copy, never a copy containing real team data.

---

### Task 1: Sanitized workspace template

**Files:**
- External: Google Drive master Sheet copied from operational workbook.
- Create: `docs/template-contract.md`
- Test: `src/lib/template-contract.test.ts`

**Interfaces:**
- Produces: stable workbook tab/column contract used by the PWA and future Google Sheets adapter.

- [ ] Write a failing contract test asserting required tabs and PEDIDOS fields.
- [ ] Run `npm test` and verify failure.
- [ ] Create a sanitized Drive copy of the operational workbook.
- [ ] Clear real consultant/order/credential data while preserving formulas, validation, formatting, SEMANAS structure and hidden operational tabs.
- [ ] Write CONFIG template metadata: product, Vitoriaware, Espírito Santo, template version, official portal URL.
- [ ] Document the stable sheet contract.
- [ ] Run tests and commit.

### Task 2: Utility-first PWA information architecture

**Files:**
- Modify: `index.html`
- Create: `src/lib/pilot-ui-contract.test.ts`

**Interfaces:**
- Produces: Today/Orders/Closing/Team flows using the same operational concepts as the Sheet.

- [ ] Write failing tests requiring: active Vitrine + Semana + closing state, `O que precisa ser resolvido`, `Ação agora`, `Sem pedido`, `Portal`, `Print`, explicit `Próxima ação`, Tupper.NET action, searchable Equipe and short order intake.
- [ ] Add tests rejecting previous AI-template copy/slogans.
- [ ] Run test and verify failure.
- [ ] Rebuild static pilot around dense work queue and compact metrics.
- [ ] Add order states: RECEBIDO -> CONFERIDO -> NO PORTAL -> PRINT ENVIADO -> FINALIZADO, plus CANCELADO.
- [ ] Add `Conferido`, `Portal`, `Print`, `Finalizado` direct actions instead of a generic stage button.
- [ ] Add search-first Equipe and WhatsApp action.
- [ ] Preserve progressive HTML shell so JavaScript failure cannot produce blank page.
- [ ] Run tests and commit.

### Task 3: Sheet adapter contract

**Files:**
- Create: `src/lib/sheets/types.ts`
- Create: `src/lib/sheets/mapper.ts`
- Create: `src/lib/sheets/mapper.test.ts`

**Interfaces:**
- Produces: `SheetSnapshot`, `OrderRow`, `ConsultantRow`, `WeekRow`, `ActionRow`; mapping between Sheet rows and PWA domain.

- [ ] Write failing mapper tests with sanitized fixture rows matching the existing workbook.
- [ ] Verify RED.
- [ ] Implement row parsers/normalizers and next-action derivation.
- [ ] Verify GREEN and commit.

### Task 4: Workspace/auth boundary

**Files:**
- Create: `src/lib/auth/model.ts`
- Create: `src/lib/workspace/model.ts`
- Create: `src/lib/auth/model.test.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces: `UserIdentity`, `WorkspaceMembership`, `WorkspaceSheetBinding` and validation rules.

- [ ] Write failing tests rejecting CPF/phone-as-password designs and requiring a separate secret/magic-link identity.
- [ ] Define owner/member roles and display handles such as `empresaria01` independent from authentication secret.
- [ ] Add environment contracts for site URL, Google client/service credentials, template Sheet ID and transactional mail sender.
- [ ] Keep secrets server-only and commit.

### Task 5: Provisioning service contract

**Files:**
- Create: `src/lib/provisioning/plan.ts`
- Create: `src/lib/provisioning/plan.test.ts`
- Create: `docs/provisioning-runbook.md`

**Interfaces:**
- Produces: deterministic provisioning plan: copy template -> rename -> CONFIG patch -> bind workspace.

- [ ] Write failing tests proving new workspaces never point at the master/another workspace Sheet.
- [ ] Implement provisioning-plan builder with generated workspace slug/title.
- [ ] Document Google Drive actions and required server permissions.
- [ ] Run tests and commit.

### Task 6: PWA polish and installability

**Files:**
- Modify: `manifest.webmanifest`
- Modify: `logo.svg` or replace with approved original brand asset.
- Create: `sw.js`
- Modify: `index.html`
- Test: `src/lib/pwa-static.test.ts`

**Interfaces:**
- Produces: installable, resilient PWA shell with versioned static assets.

- [ ] Write failing tests for manifest scope/start_url/icons/theme and service-worker registration.
- [ ] Implement offline shell/cache versioning without caching private future API responses.
- [ ] Ensure mobile navigation and tap targets are usable.
- [ ] Verify tests and commit.

### Task 7: Deployment and evidence gate

**Files:**
- Modify: `.github/workflows/ci.yml` only if needed.
- Create: `docs/pilot-readiness.md`

**Interfaces:**
- Produces: verified public UI pilot plus explicit list of what remains blocked on secure server/OAuth infrastructure.

- [ ] Run `npm test`, `npm run typecheck`, `npm run build`.
- [ ] Verify GitHub Pages deployment from exact commit.
- [ ] Confirm the static UI never exposes real Sheet IDs containing data, credentials or private records.
- [ ] Record template Sheet ID privately in operational context/CONFIG only; do not commit private credentials.
- [ ] Document the single infrastructure handoff needed to enable real authenticated Sheets sync and no-reply email.
