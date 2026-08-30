# Security

## Baseline

- Never store third-party portal passwords.
- Never commit real consultant/customer data, exports, tokens or `.env` files.
- Every tenant-owned database row carries `workspace_id`; access is enforced with PostgreSQL RLS.
- Browser code receives only public/anon configuration. Service-role credentials must remain server-side and are not required by the current MVP.
- Audit events must contain event metadata, not free-text order contents or phone numbers.
- Production must use HTTPS, managed database encryption/backups and an incident-response contact.

## Reporting

Before paid pilot, configure a dedicated security/privacy contact in the operating entity's domain and publish it in product terms. Do not put vulnerability reports in public issues when they contain exploit details or personal data.

## Release gate

A paid release requires: authentication wired to persistence; cross-workspace RLS tests; backup/restore check; error reporting without PII payloads; dependency review; privacy/terms identifying the actual operator; and trademark/non-affiliation review.
