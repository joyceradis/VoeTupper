# VoeTupper pilot readiness

## Delivered in the current pilot
- Vitoriaware-first operational vocabulary.
- Installable PWA shell with offline static assets.
- Pilot first-access login using a separate password (not CPF/phone/Tupper.NET credential).
- Workspace identity for `Empresária Serra` in the static pilot.
- Distinct Vitrine and Semana with date-based cycle derivation.
- Work queue driven by explicit next actions: Conferir -> Portal -> Print -> Finalizar, plus Cancelar.
- Short order intake with automatic Vitrine/Semana/date.
- Search-first team directory and WhatsApp action.
- Goal/revenue and exception counters.
- Sanitized private Google Sheet master template for Vitoriaware.
- Provisioning proof: a second workspace Sheet was successfully created from the sanitized master and CONFIG was patched without copying customer data.
- TypeScript contracts/tests for template structure, Sheet row mapping, authentication model, workspace binding and provisioning plan.

## Security boundary
The public GitHub Pages pilot does **not** contain Google service credentials, private spreadsheet IDs, Tupper.NET passwords or real team data. The current login protects only the local pilot state on a single browser; it is not represented as production authentication.

## What is intentionally not enabled on GitHub Pages
Private live Google Sheets synchronization, multi-device authentication, automatic workspace provisioning and transactional no-reply email require a trusted server runtime. Putting Google or mail secrets in a static PWA would expose them to every browser user.

## Secure runtime handoff
When server infrastructure is enabled, configure these server-only values:
- `GOOGLE_WORKSPACE_CLIENT_ID`
- `GOOGLE_WORKSPACE_CLIENT_SECRET` or a scoped service account where appropriate
- `GOOGLE_SHEETS_TEMPLATE_ID`
- transactional `MAIL_FROM`
- mail provider API key

The production flow is:
`PWA -> authenticated server -> authorized workspace -> private Sheet copy`.

## Authentication target
Use email magic-link or a proper user-created password. Operational handles such as `empresaria01` are display/login identifiers, not secrets. CPF and phone numbers are never passwords.

## Transactional email target
Use a dedicated no-reply address on the Workspace domain with SPF/DKIM/DMARC and a transactional mail provider. The onboarding message is concise: access ready, workspace created, CTA to open VoeTupper. Canva references have been generated for this email system, but the sending infrastructure remains server-side.
