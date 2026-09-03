# Matriz RLS do VoeTupper

Esta matriz descreve o contrato de autorização da camada multiusuário. A interface pode ocultar elementos por UX, mas a autorização real deve permanecer no Postgres por Row Level Security.

## Princípio

**Administra dentro do próprio escopo. Compara apenas agregados de pares autorizados. Não recebe bastidores de outras árvores.**

## Escopos

| Papel | Escopo operacional detalhado | Comparação autorizada |
| --- | --- | --- |
| Distribuição | Todos os Distritos da própria Distribuição | Consolidados estaduais |
| Empresária | Próprio Distrito | Outras Empresárias da mesma Distribuição, somente agregados aprovados |
| Líder | Próprio grupo | Outras Líderes do mesmo Distrito, somente agregados aprovados |
| Consultora | Própria pessoa, pedidos, metas, grupo e Líder | Nenhum ranking gerencial |

## Recursos

| Recurso | Distribuição | Empresária | Líder | Consultora |
| --- | --- | --- | --- | --- |
| `people` | leitura da própria Distribuição | leitura do próprio Distrito | leitura das Consultoras do próprio grupo | própria pessoa |
| `memberships` | administração da própria Distribuição | administração do próprio Distrito | administração limitada ao próprio grupo | leitura do próprio vínculo |
| `groups` | leitura da própria Distribuição | leitura do próprio Distrito | próprio grupo | próprio grupo |
| `orders` | detalhe da própria Distribuição | detalhe do próprio Distrito | detalhe do próprio grupo | próprios pedidos |
| `goals` | escopo estadual | próprio Distrito | próprio grupo | próprias metas |
| `performance_snapshots` | detalhe autorizado da Distribuição | detalhe do próprio Distrito | detalhe do próprio grupo | próprio desempenho |
| `achievements` | própria Distribuição | próprio Distrito | próprio grupo | próprias conquistas |
| `network_events` | própria Distribuição | próprio Distrito | próprio grupo | eventos do próprio escopo pessoal |
| `audit_log` | escopo administrado | próprio Distrito | próprio grupo quando autorizado | sem acesso gerencial |

## Rankings de pares

### Empresárias

A view `business_owner_scoreboard` expõe somente:

- pessoa e Distrito necessários para identificar o par;
- percentual de meta;
- crescimento percentual;
- recrutamento agregado;
- ativação agregada;
- ciclo e data do snapshot.

Ela não expõe pedidos individuais, telefone, CPF, código, senha ou faturamento bruto de outro Distrito.

### Líderes

A view `leader_scoreboard` é limitada ao mesmo Distrito para observadores com papel `LEADER`. Empresárias podem consultar o scoreboard apenas no próprio Distrito e a Distribuição pode consultar os Distritos sob sua responsabilidade.

## Identidade única

`people.id` é a identidade canônica. Papel e posição ficam em `memberships`.

Uma promoção Consultora → Líder:

1. encerra o membership atual;
2. preserva o mesmo `person_id`;
3. cria novo membership `LEADER`;
4. migra somente pessoas selecionadas explicitamente;
5. rejeita migração entre Distritos no mesmo fluxo.

## Migração do piloto

A migration `0003_network_core.sql` adiciona o modelo hierárquico sem apagar a estrutura antiga do piloto. A migration `0004_network_rls.sql` substitui a política ampla de pedidos (`orders_member`) pelas regras hierárquicas quando o ambiente multiusuário for efetivamente migrado.

A versão estática pública não deve ser convertida para autenticação real até que URL, chaves Supabase, onboarding e migração da base Serra estejam validados em ambiente próprio.
