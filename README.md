# Voa — MVP de operação para venda direta

`VoeTupper` é o codinome do repositório. A interface usa **Voa** como nome provisório independente.

## Problema

Líderes de venda direta recebem pedidos e pendências por WhatsApp, áudio, foto e texto, mas precisam transformar isso em execução estruturada. O MVP reduz esse trabalho a quatro superfícies: **Hoje, Pedidos, Fechamento e Equipe**.

## Regra de produto

Se um dado pode ser derivado, não é pedido de novo. Se algo foi concluído, sai da fila operacional. Se uma função não reduz trabalho, erro, risco ou melhora retenção, não entra no MVP.

## Rodar

```bash
npm install
npm run dev
```

A interface inicia com dados sanitizados para demonstração. O schema Supabase está em `supabase/migrations` e é a base para persistência autenticada do piloto.

## Verificação

```bash
npm test
npm run typecheck
npm run build
```

## Dados reais

Nunca commite exportações da operação. A migração futura da planilha deve importar somente nome, código comercial necessário, telefone opcional e status. **Senhas de portais de terceiros são excluídas por desenho.** Registros ambíguos exigem confirmação humana.

## Independência de fornecedores

O software não é afiliado, patrocinado ou endossado pela Tupperware ou por outras empresas de venda direta. Não inclui logos, catálogos, scraping, automação de login ou submissão automática em portais de terceiros.

## Comercialização

O comprador inicial é o líder/equipe; o experimento de preço deve ser por workspace/mês. Métricas: tempo até concluir pedido, pendências no fechamento, pedidos por semana, retorno na semana seguinte e workspaces ativos. Telemetria não deve registrar conteúdo de mensagens ou dados pessoais.

Antes de cobrar: configurar entidade operadora, privacidade/termos definitivos, autenticação Supabase, backup, monitoramento, revisão de marca e canal de direitos do titular.
