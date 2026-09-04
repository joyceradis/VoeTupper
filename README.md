# VoeTupper — operação e rede para venda direta

`VoeTupper` é o codinome do repositório e do piloto atual.

## Problema

Líderes e Empresárias de venda direta recebem pedidos, pendências e resultados por WhatsApp, áudio, foto, relatórios e planilhas, mas precisam transformar isso em execução estruturada. O produto combina operação diária com uma rede hierárquica simples de navegar.

## Regra de produto

Se um dado pode ser derivado, não é pedido de novo. Se algo foi concluído, sai da fila operacional. Se uma função não reduz trabalho, erro, risco ou melhora retenção, não entra no MVP.

## Hierarquia

Distribuição → Distrito → Grupo → Pessoa/Vínculo → Resultado semanal.

Pessoa e vínculo são entidades distintas: `people` guarda a identidade canônica; `memberships` guarda papel, escopo e histórico. Promoções preservam o mesmo `person_id`.

## Dados operacionais

A camada multiusuário versionada em `supabase/migrations` inclui:

- períodos semanais;
- resultados em nível distrito, grupo ou pessoa;
- agregados de grupo sem pessoa fictícia;
- total de vendas calculado por veteranas + recrutas;
- importação em preview antes da gravação;
- aliases e duplicidades com confirmação administrativa;
- reconhecimento separado de cargo e atividade semanal;
- reconciliação entre totais transcritos e calculados;
- trilha de auditoria e RLS por hierarquia.

## Importação no piloto

CSV pode ser pré-visualizado no navegador apenas em memória para mapeamento e conferência. XLS/XLSX e a gravação definitiva dependem do backend autenticado. Arquivos e linhas importadas não são persistidos em `localStorage`.

## Rodar

```bash
npm install
npm run dev
```

A interface inicia com dados sanitizados para demonstração. O schema Supabase é a base para persistência autenticada do piloto.

## Verificação

```bash
npm test
npm run typecheck
npm run build
```

## Dados reais

Nunca commite exportações da operação. CPF, telefone, arquivos importados e demais dados pessoais não devem ser versionados no GitHub público. **Senhas de portais de terceiros são excluídas por desenho.** Registros ambíguos e aliases exigem confirmação humana.

## Autorização

Distribuição e Empresária podem realizar ações administrativas dentro do próprio escopo. Líder opera e acompanha o próprio grupo, mas não altera identidade canônica, vínculos estruturais, duplicidades ou lotes de importação. Consultora/Recruta acessa apenas o próprio escopo autorizado.

Veja `docs/security/rls-matrix.md` para a matriz de RLS.

## Independência de fornecedores

O software não é afiliado, patrocinado ou endossado pela Tupperware ou por outras empresas de venda direta. Não inclui logotipos de terceiros, catálogos, scraping, automação de login ou submissão automática em portais de terceiros.

Antes de uso real multiusuário: configurar entidade operadora, privacidade/termos definitivos, autenticação Supabase, backup, monitoramento, revisão de marca e canal de direitos do titular.
