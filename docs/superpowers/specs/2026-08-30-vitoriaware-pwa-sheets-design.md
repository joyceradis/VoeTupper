# VoeTupper Vitoriaware-first PWA + Google Sheets Design

## Goal
Build a useful pilot for Empresárias and Líderes in the Vitoriaware/Grande Vitória operation, with a PWA as the interaction layer and a per-workspace Google Sheet copy as the operational datastore/template.

## Product principle
The app must understand the operation. If a value can be derived, do not ask the user to enter it. If a field does not change a decision or drive automation, hide it. The primary question answered by the product is: **what do I need to do now?**

## Scope
Pilot only for Vitoriaware / Espírito Santo. The operational vocabulary is native: Vitrine, Semana, Consultora, pedido recebido, conferido, portal, print, finalizado, metas, ofertas, reconhecimento and fechamento.

## UX
- Home is an operational queue, not a marketing dashboard.
- Header: active Vitrine, Semana, closing state, production/meta.
- Primary queue: unresolved orders sorted by next action.
- Primary actions: Novo pedido, Fechamento, Abrir Tupper.NET, Equipe.
- Pedidos: short intake form; Vitrine, Semana and date are automatic.
- Fechamento: unresolved orders only; next action is explicit.
- Equipe: search-first directory with name, code, phone, status and WhatsApp action.
- Pink is brand accent, not background decoration. White/ink/neutral surfaces dominate. Semantic colors only communicate state.
- Mobile-first PWA; desktop uses increased density rather than more decoration.

## Data architecture
Each workspace gets its own Google Sheet copied from a sanitized template. The sheet is the source of truth for the pilot.

`PWA -> authenticated server/API -> workspace registry -> Google Sheets API -> workspace spreadsheet`

The browser never receives Google service credentials. The Sheet remains private. Public GitHub Pages is therefore not the final authenticated runtime.

## Workbook contract
Template tabs preserved from the existing operational workbook:
- INÍCIO
- PEDIDOS
- FECHAMENTO
- EQUIPE
- SEMANAS
- OFERTAS
- METAS
- RECONHECIMENTO
- hidden AJUDA, AÇÕES, _BASE_PEDIDOS, CONFIG

Operational contract:
- PEDIDOS contains the user-editable order record.
- _BASE_PEDIDOS normalizes/feeds dashboards and closing logic.
- SEMANAS maps Semana to Vitrine and dates.
- FECHAMENTO and AÇÕES derive the queue.
- CONFIG identifies product version, distribution and portal URL.

## Workspace provisioning
A sanitized master template is created in Google Drive. New workspace flow:
1. create workspace record;
2. copy master template;
3. rename copy with workspace name;
4. write CONFIG values (workspace, role, Vitoriaware, Espírito Santo, portal URL, template version);
5. persist spreadsheet ID in workspace registry;
6. invite the user;
7. user enters onboarding and starts with an empty operation.

No real consultant names, phones, portal passwords or credentials may exist in the template.

## Authentication
Do not use CPF or phone number as a password. They are identifiers/predictable data, not secrets.

Pilot account model:
- username/handle for familiar login display, e.g. `empresaria01`;
- real authentication through email magic link or a proper password set by the user;
- first account can be labeled `Empresária Serra — piloto master` in the UI;
- password reset and invitation emails come from a transactional no-reply address on the user's Google Workspace domain when infrastructure is configured.

The architecture must support owner/member roles and future Líder workspaces.

## Security
- No Tupper.NET passwords in the PWA or public repository.
- Do not expose private Sheets via publish-to-web.
- Google OAuth/service credentials are server-only.
- Workspace-to-sheet mapping is authorized server-side.
- Sanitize logs and demo data.
- Keep an audit trail for provisioning, membership and destructive operations when persistent backend is enabled.

## Branding/legal
VoeTupper is an independent pilot brand. Do not copy Tupperware/Vitoriaware logos or protected artwork. Compatibility with Vitoriaware/Tupper.NET may be described factually. The visual identity must be original.

## Infrastructure strategy
Phase 1: create sanitized Google Sheet template, build the PWA UI and adapter contracts, preserve existing pilot behavior locally where server credentials are unavailable.
Phase 2: deploy authenticated server runtime, connect Google Sheets API, enable workspace provisioning and transactional email.
Phase 3: paid beta, telemetry, onboarding, role management and billing.

## Success criteria
- An Empresária can understand what needs action in under 5 seconds.
- New order entry needs only consultant, source, items/summary, quantity, value/payment when known.
- Week/Vitrine/date/status/next action are derived.
- Closing shows only unresolved work.
- A new workspace can be provisioned from a zeroed template without copying real data.
- No private spreadsheet or credential is exposed publicly.
