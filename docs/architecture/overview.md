# Arquitetura VoeTupper Multiusuário

## Objetivo

Separar identidade, autorização, dados operacionais e representação social para que cada camada possa evoluir sem quebrar a governança.

## Fluxo principal

```text
Pessoa
  |
Login por e-mail
  |
Supabase Auth
  |
auth.uid()
  |
auth_identities
  |
person_id
  |
membership atual
  |
+-----------------------------+
| papel                       |
| distribuição                |
| distrito                    |
| grupo                       |
+-----------------------------+
  |
RLS Postgres
  |
+-----------------------+-------------------------+
| detalhe do próprio    | scoreboards agregados |
| escopo                | de pares autorizados  |
+-----------------------+-------------------------+
  |
Repositories
  |
UI role-aware
```

## Limites de responsabilidade

### Auth

Responde somente: quem está autenticado?

Não decide o que a pessoa pode visualizar.

### Identity

`auth_identities` resolve conta autenticada para `person_id`.

### Membership

Responde qual papel e escopo estão vigentes.

### Governance

Define quais relações e métricas são permitidas para cada papel.

### RLS

Executa a autorização no banco. É a barreira de segurança efetiva.

### Aggregate views

Entregam comparação entre pares sem liberar tabela operacional do concorrente.

### Repository layer

Traduz intenção da UI para consultas autorizadas. Nunca usa consulta cross-scope bruta para montar ranking.

### UI

Apresenta apenas o que o backend autorizou. Ocultar um componente não substitui RLS.

## Modelo territorial

```text
Brasil
  Distribuição ES
    Distrito Norte
    Distrito Noroeste
    Distrito Serra
    Distrito Vitória
    Distrito Vila Velha e Sul
    Distrito Cariacica
```

Cada Distrito possui uma Empresária. Dentro do Distrito, Líderes administram grupos de Consultoras.

## Identidade e histórico

`people` não carrega cargo como identidade permanente.

`memberships` guarda papel e escopo com vigência. Somente uma membership pode estar corrente por pessoa.

Uma promoção encerra a membership de Consultora e cria uma membership de Líder com o mesmo `person_id`.

## Ranking

Empresária x Empresária usa `business_owner_scoreboard`.

Líder x Líder usa `leader_scoreboard`.

Essas views contêm apenas métricas permitidas para comparação. Valores operacionais detalhados permanecem nas tabelas protegidas do próprio escopo.

## Google Drive

```text
Supabase Postgres
      |
exportação / sincronização controlada
      |
VoeTupper | Diretório e Onboarding ES
```

A planilha é uma superfície administrativa privada. Ela ajuda onboarding e reconciliação, mas não substitui banco, Auth ou RLS.

## Frontend legado e frontend multiusuário

Durante a transição existem duas responsabilidades:

- piloto estático atual: continuidade operacional;
- app Next.js multiusuário: nova arquitetura autenticada.

O piloto não será removido até a arquitetura nova possuir backend real, migrations aplicadas, RLS testada e migração Serra reconciliada.

## Erros e estados degradados

O app deve distinguir:

- backend não configurado;
- usuário não autenticado;
- primeiro acesso com troca obrigatória;
- conta autenticada sem membership;
- acesso negado por política;
- dado ainda não disponível;
- erro técnico transitório.

Nunca fazer fallback silencioso para `localStorage` quando uma consulta multiusuário retorna `access_denied`.

## Auditabilidade

Operações críticas devem gerar `audit_log` com ator, sujeito, escopo, ação, estado anterior e posterior quando aplicável.

Senha, token e PII desnecessária ficam fora do log.

## Evolução

A arquitetura deve permanecer data-driven. Novas Distribuições entram por dados e política, não por arquivos duplicados ou condições hardcoded por estado.
