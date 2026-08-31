# Vitoriaware workbook template contract

The pilot uses one private Google Sheet per workspace. A sanitized master template exists in Google Drive and is copied for each new Empresária/Líder workspace.

## Required tabs
`INÍCIO`, `PEDIDOS`, `FECHAMENTO`, `EQUIPE`, `SEMANAS`, `OFERTAS`, `METAS`, `RECONHECIMENTO`, hidden `AJUDA`, `AÇÕES`, `_BASE_PEDIDOS`, `CONFIG`.

## PEDIDOS columns
`Vitrine (auto)`, `Semana`, `Consultora`, `Data`, `Recebi por`, `Resumo / itens`, `Qtd.`, `Valor`, `Pagamento`, `Conferido`, `Portal`, `Print`, `Finalizado`, `Cancelado`, `Observação`, `Status`, `Próxima ação`.

Vitrine is derived from Semana. Status and Próxima ação are derived from the operational checkboxes/state. `_BASE_PEDIDOS` remains formula-driven and is not directly edited by users.

## Sanitization rules
The master template contains no real consultant names, phone numbers, CPF, orders or portal credentials. The EQUIPE credential column is retained only as a migration warning and is labeled `Senha do portal — não armazenar`; the PWA must never write to it.

## CONFIG baseline
- Produto: VoeTupper
- Versão template: Vitoriaware Template 1.0
- Distribuição: Vitoriaware / Grande Vitória
- Estado: Espírito Santo
- Workspace: NOVO WORKSPACE
- Papel principal: EMPRESÁRIA
- Security rule: do not store Tupper.NET passwords, CPF or authentication secrets in the workbook.

The actual master spreadsheet ID is an infrastructure value and must not be committed to this public repository. Use a server-side environment variable when provisioning is enabled.
