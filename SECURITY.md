# Security

VoeTupper trata identidade, estrutura organizacional, pedidos e indicadores de desempenho. Segurança deve ser aplicada no backend e comprovada antes de cada release multiusuário.

## Modelo de ameaça prioritário

Os riscos principais são:

- acesso cruzado entre Distritos;
- acesso de Líder a grupo concorrente;
- exposição de métricas gerenciais a Consultoras;
- vazamento de senha ou token em GitHub, log ou planilha;
- duplicação de identidade durante promoção ou migração;
- importação de dados para escopo incorreto;
- configuração RLS permissiva;
- uso de service-role no browser.

## Autenticação

O login preferencial é e-mail via Supabase Auth.

O onboarding pode usar uma senha temporária mantida fora do repositório. Regras:

- troca obrigatória no primeiro acesso;
- a senha definitiva nunca é gravada em Google Sheets;
- recuperação posterior ocorre pelo provedor de autenticação;
- nenhuma senha entra em log, evento de auditoria ou telemetria;
- conta sem membership corrente não entra no app mesmo que a autenticação seja válida.

## Segredos

Nunca commitar:

- `.env` real;
- `SUPABASE_SERVICE_ROLE_KEY`;
- API keys privadas;
- OAuth client secrets;
- service-account JSON;
- senha temporária de onboarding;
- senha de portal de terceiro;
- exportação operacional com PII.

Browser recebe apenas configuração explicitamente pública, como Supabase URL e anon key. A anon key só é aceitável com RLS correta.

## Row Level Security

Todas as tabelas multiusuário de negócio devem ter RLS habilitada.

A autorização deve resolver:

```text
auth.uid()
  → auth_identities.person_id
  → membership atual
  → papel + distribuição + distrito + grupo
  → política de recurso
```

Não usar `using (true)` ou política equivalente em tabela sensível.

## Comparação entre pares

Comparações entre Empresárias e entre Líderes devem usar views agregadas dedicadas.

O frontend não deve receber linhas brutas de outro Distrito ou grupo para depois ocultar detalhes.

## Google Drive

A planilha administrativa no Drive pode conter dados de onboarding necessários para administração privada, mas:

- não é fonte de sessão;
- não armazena a nova senha após a primeira troca;
- não deve ser compartilhada publicamente;
- não deve ser referenciada por link público dentro do repositório;
- alterações críticas originadas na planilha precisam de validação antes de chegar ao banco.

## Auditoria

Mudanças sensíveis devem gerar evento estruturado com o mínimo de dados necessário.

Nunca incluir em `audit_log`:

- senha;
- token;
- conteúdo completo de pedidos quando não necessário;
- telefone ou CPF sem justificativa operacional.

## Importação e migração

Não unir pessoas somente por nome.

Ordem de confiança recomendada:

1. `person_id` já existente;
2. identificador forte autorizado;
3. código de negócio + nome normalizado;
4. revisão humana.

Conflito ambíguo deve parar a importação daquele registro.

## Dependências e supply chain

- manter lockfile versionado;
- revisar atualizações de dependências;
- não executar scripts de origem desconhecida em CI;
- preferir actions fixadas em versões confiáveis;
- restringir permissões do `GITHUB_TOKEN` ao mínimo.

## Logging e observabilidade

Erros de produção devem ser úteis sem carregar PII desnecessária.

Não registrar:

- corpo completo de formulários sensíveis;
- cabeçalhos de autenticação;
- cookies;
- senha;
- token;
- dados de outro escopo apenas para depuração.

## Incidentes

Se houver suspeita de vazamento:

1. impedir nova exposição;
2. rotacionar segredos afetados;
3. identificar escopo e período;
4. preservar evidência técnica;
5. corrigir política ou código;
6. testar regressão;
7. avaliar obrigações de comunicação e privacidade aplicáveis;
8. documentar causa raiz e ação preventiva.

## Release gate

A versão multiusuário só pode ser promovida quando:

- `npm test` passa;
- `npm run typecheck` passa;
- `npm run build` passa;
- migrations foram revisadas;
- RLS foi aplicada no projeto real;
- testes de acesso cruzado foram executados;
- senha e segredos não aparecem em assets públicos;
- backup e rollback são compatíveis com o risco da mudança;
- CI está verde no commit exato do release.

## Reporting

Antes de um piloto externo ou pago, configurar canal privado de segurança e privacidade. Relatórios com exploit, token, credencial ou PII não devem ser publicados em issue pública.
