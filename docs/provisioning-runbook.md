# Provisioning a VoeTupper Vitoriaware workspace

## Preconditions
- A private sanitized Google Sheet master template exists.
- The authenticated server has Drive/Sheets permission to copy the template and patch CONFIG.
- The template spreadsheet ID is stored server-side as `GOOGLE_SHEETS_TEMPLATE_ID`; it is not embedded in the client.

## Provisioning sequence
1. Generate workspace ID and normalized display name.
2. Copy the sanitized master Sheet.
3. Rename the copy to `VoeTupper — <workspace name> — Vitoriaware`.
4. Patch CONFIG with Produto, Versão template, Distribuição, Estado, Workspace and Papel principal.
5. Persist the new spreadsheet ID in the workspace registry.
6. Invite the owner through the configured authentication provider.
7. Send the transactional welcome email from the configured no-reply address.

## Safety invariants
- Never bind a new workspace directly to the master template.
- Never copy a customer workspace to provision another customer.
- Never write CPF, phone number as password, Tupper.NET password or authentication secret to Sheets.
- Never publish the Sheet to the web.
- Never send Google service credentials to the browser.

## Pilot roles
- `EMPRESÁRIA`: owner of an operational workspace.
- `LÍDER`: owner/member depending on future hierarchy rules; pilot data model keeps role explicit.

## Current infrastructure boundary
The repository contains the provisioning contract, PWA UX and sheet mapping. Live provisioning requires a secure server runtime with Google OAuth/service-account credentials and a transactional mail provider. GitHub Pages alone cannot safely hold those credentials.
