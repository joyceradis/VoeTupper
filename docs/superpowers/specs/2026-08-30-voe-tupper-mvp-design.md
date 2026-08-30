# VoeTupper MVP — Product and Architecture Design

## 1. Objective

Build a mobile-first operational SaaS MVP for leaders in direct-selling networks who currently coordinate consultants, weekly cycles, orders and follow-up through WhatsApp, notes and company portals.

The product must reduce cognitive load and repeated manual work. It must not reproduce a spreadsheet as a web application.

`VoeTupper` is a temporary project codename. Commercial branding must be independent from Tupperware unless written trademark authorization is obtained.

## 2. Product principles

1. **Efficiency:** every user-entered field must trigger an action, calculation, filter or required record. Derived data is never requested twice.
2. **Utility:** the home screen answers “what requires my action now?”.
3. **Low cognitive load:** mobile-first, large targets, short labels, progressive disclosure, minimal typing.
4. **Management by exception:** completed work disappears from the operational queue; exceptions remain visible.
5. **Legality and privacy by design:** collect the minimum personal data necessary; separate tenants; log sensitive actions; provide retention/deletion paths.
6. **Vendor independence:** the domain model is generic enough for other direct-selling networks. Tupperware-specific vocabulary is an adapter/configuration, not the core architecture.
7. **No unauthorized automation:** MVP does not scrape, reverse-engineer or automate Tupper.NET or other third-party portals. It may provide a user-initiated external link.
8. **No third-party password vault in MVP:** consultant portal passwords from the pilot spreadsheet will not be migrated into the SaaS.
9. **No real data in source control:** the GitHub repository contains no consultant names, credentials, phones or operational records.

## 3. Market rationale

Brazilian direct selling is a large, established market with approximately R$50 billion in annual business volume and roughly 3 million independent entrepreneurs. The channel is strongly relationship-driven and increasingly digital; WhatsApp is a major operational surface.

Tupperware itself supports a relationship-led consultant model, weekly incentives and digital ordering flows. Its Vitrine Digital sends a consumer order to a consultant through WhatsApp, while Tupper.NET remains a separate operational portal. This creates a practical coordination gap between unstructured messages and structured operational execution.

The initial wedge is Tupperware leadership because the workflow is known and an accessible pilot exists. The addressable product category is broader: operational software for direct-selling leaders and small distributed sales networks.

## 4. Legal and commercial guardrails

### Trademark and affiliation

Tupperware’s published terms reserve its trademarks, logos and site content. The consultant engagement terms also restrict unauthorized use/reproduction of the brand. Therefore:

- do not use Tupperware logos, proprietary artwork, catalogue imagery or copied UI;
- do not imply that the product is official, endorsed or integrated with Tupperware;
- use `VoeTupper` only as an internal codename until branding review;
- commercial release should use an independent brand and an explicit non-affiliation statement when referring descriptively to compatible workflows.

### Data protection

The MVP will be designed around LGPD principles and ANPD small-business security guidance:

- data minimization and purpose limitation;
- tenant isolation;
- authenticated access;
- least privilege;
- encrypted transport and managed encrypted storage;
- deletion/export path;
- basic processing records and privacy notice;
- incident-response contact/channel;
- no unnecessary sensitive or credential data.

A small-business exemption does not eliminate LGPD duties or minimum security obligations.

### WhatsApp

MVP uses user-initiated share/deep-link behavior only. It will not send automated WhatsApp messages through unofficial mechanisms. A future official WhatsApp Business Platform integration requires a separate compliance and product review against then-current Meta terms and messaging rules.

## 5. MVP scope

### 5.1 Today

The default screen is an operational command center, not analytics.

Shows:
- active Vitrine/campaign label;
- active week;
- closing date/time when configured;
- weekly goal and realized amount;
- count of orders requiring action;
- portal-pending count;
- confirmation/print-pending count;
- consultants with no completed order in the active week;
- active offers/incentives entered by the leader;
- a short “Do now” queue ordered by urgency.

Primary actions:
- New order;
- Closing queue;
- Team;
- Open company portal (external, user initiated).

### 5.2 Orders

Fast order capture optimized for information arriving through WhatsApp.

Required fields:
- consultant;
- active week (preselected);
- source channel: audio, photo, text, other;
- short item/order summary;
- total amount when known.

Optional fields:
- item quantity;
- payment method;
- note.

Operational stages:
`RECEIVED → ORGANIZED → PORTAL_DONE → CONFIRMATION_SENT → COMPLETED`

Alternative terminal state:
`CANCELLED`

The interface exposes the next useful action rather than asking the user to interpret statuses.

### 5.3 Closing

A queue containing only non-terminal orders for the active week.

Each card shows:
- consultant;
- current stage;
- amount if available;
- source channel;
- next action;
- one-tap progression to the next stage.

Filters are intentionally minimal: all, portal, confirmation, unresolved.

### 5.4 Team

MVP stores only operationally necessary consultant information:
- display name;
- consultant/business code if needed by the leader;
- phone number, optional;
- status: active, new, paused, inactive;
- leader-owned note, optional.

No portal password field.

A consultant detail page shows current status and order history. It does not become a general-purpose CRM in MVP.

### 5.5 Weekly cycle

Vitrine/campaign and week are distinct concepts.

A campaign may contain multiple weeks. An order belongs to exactly one week; the campaign is derived from the week. Users do not select both when creating an order.

Week fields:
- label/number;
- campaign;
- starts_at;
- closes_at;
- team_goal;
- status.

### 5.6 Offers and recognition

Offers/incentives are lightweight records attached to a week or campaign. They are surfaced on Today when active.

Recognition in MVP is generated from operational results (for example goal reached or highest realized amount) and may be manually confirmed by the leader. No complex gamification engine.

## 6. Explicitly out of MVP

- AI parsing of audio/photos;
- automatic Tupper.NET login or order submission;
- storage of consultant portal passwords;
- WhatsApp Business API automation;
- inventory management;
- customer/end-consumer CRM;
- accounting/financial reconciliation;
- multi-level compensation calculation;
- catalogue/product scraping;
- complex BI dashboards;
- native iOS/Android apps;
- white-label customization.

These require demonstrated demand before implementation.

## 7. Architecture

### Recommended approach

A responsive PWA with a hosted relational backend.

Recommended stack for implementation planning:
- Next.js + TypeScript;
- Tailwind CSS with accessible reusable components;
- Supabase/PostgreSQL for Auth, relational data and Row Level Security;
- Zod for boundary validation;
- Vitest for domain/unit tests;
- Playwright for critical mobile workflows;
- Vercel or equivalent managed deployment.

The stack minimizes infrastructure work while preserving a migration path as the product grows.

### Multi-tenant model

Every business record belongs to a `workspace_id`. Access is constrained by membership and database Row Level Security, not merely UI filtering.

Core entities:
- `users`
- `workspaces`
- `workspace_members`
- `consultants`
- `campaigns`
- `weeks`
- `orders`
- `offers`
- `recognitions`
- `audit_events`

A workspace represents one leader/team organization. This prevents the future SaaS from becoming one shared database with informal customer separation.

## 8. Data flow

### New order

1. User taps New order.
2. Current week is preselected.
3. User selects consultant and captures the minimum order information.
4. System creates order at `RECEIVED`.
5. Order immediately appears in Closing with computed next action.
6. Each progression is persisted and optionally recorded as an audit event.
7. `COMPLETED` or `CANCELLED` removes it from the default operational queue.

### Dashboard

Dashboard values are derived from persisted records. No duplicated “reported” metric is stored when it can be calculated from orders/weeks.

## 9. Collaboration and growth architecture

The product is designed for progressive collaboration:

**Pilot:** one workspace, one primary leader, real workflow validation.

**Paid beta:** multiple independent workspaces, invitation-based membership, owner/member roles, onboarding, feedback capture and usage telemetry.

**Growth:** configurable direct-selling vocabulary, import/export, official integrations only where contracts/APIs permit, billing, support/admin tooling and cross-company templates without cross-tenant data exposure.

Roles in the initial schema:
- `owner`: workspace administration and data management;
- `member`: operational order/team work.

Do not implement more roles until a real workflow requires them.

## 10. Commercial readiness

The MVP must measure whether it creates economic value. Privacy-respecting product events should capture:
- time from order receipt to completion;
- number of orders processed per week;
- unresolved orders at closing;
- number of manual stage transitions;
- weekly active workspaces;
- repeat usage across consecutive weeks.

Pilot success criteria:
- primary leader can complete the core flow without instruction after onboarding;
- order entry takes materially less time than the spreadsheet/notes workflow;
- closing queue accurately represents outstanding work;
- the leader voluntarily returns the following week;
- no portal passwords are required to deliver core value.

Commercial validation precedes feature expansion. Pricing should initially be tested per workspace/month, not per consultant, because the economic buyer is the leader/team operator and value is operational leverage.

## 11. UX constraints

- Designed first for ~390 px mobile viewport, then desktop.
- Primary action reachable with one thumb where practical.
- No horizontal scrolling in operational screens.
- No table as the default mobile interaction.
- One primary CTA per task state.
- Status is expressed as an action when possible (“Send confirmation”) rather than internal jargon (“Stage 4”).
- Forms use defaults, autocomplete and large selection controls.
- Empty states tell the user what to do next.
- Destructive actions require confirmation; routine progression does not.
- Accessibility target: WCAG 2.2 AA for contrast, labels, keyboard behavior and focus states.

## 12. Security baseline

- authentication required for all workspace data;
- RLS on every tenant-owned table;
- no secrets in repository or browser bundle;
- server-side authorization for mutations;
- input validation at trust boundaries;
- rate limiting on abuse-sensitive endpoints;
- production error reporting without personal-data payloads;
- dependency and secret scanning in CI;
- backup/restore capability from managed database provider;
- audit events for membership changes, exports and destructive operations;
- sanitized demo/seed data only.

## 13. Migration from current spreadsheet

The existing spreadsheet is a research corpus and pilot data source, not the application database.

Migration rules:
- never migrate the password column;
- import only consultant fields required by MVP;
- flag ambiguous/duplicate records for human confirmation rather than guessing;
- do not commit exported real data to GitHub;
- use a one-time authenticated import path or local migration script with ignored input files;
- preserve source identifiers only when operationally necessary.

## 14. Testing and release gates

Before a paid pilot:
- domain tests for order-stage transitions and weekly calculations;
- authorization/RLS tests proving cross-workspace isolation;
- Playwright mobile flow: login → create order → advance stages → complete;
- accessibility smoke checks;
- no secrets/real personal data in git history;
- privacy notice and terms appropriate to the actual operating entity;
- trademark/non-affiliation review of commercial name and marketing;
- backup and error-monitoring verification.

## 15. Product roadmap gate

No feature enters the roadmap merely because it is technically interesting. A post-MVP feature must satisfy at least one:
- removes repeated manual work observed in pilot;
- reduces closing errors/risk;
- measurably improves activation/retention;
- is requested by multiple paying workspaces;
- is necessary for legal/security/commercial operation.

This is the controlling efficiency rule for product growth.
