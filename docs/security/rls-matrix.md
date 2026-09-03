# Matriz RLS do VoeTupper

Esta matriz descreve o contrato de autorização da camada multiusuário. A interface pode ocultar elementos por UX, mas a autorização real deve permanecer no Postgres por Row Level Security.

## Princípio

**Administra dentro do próprio escopo. Compara apenas agregados de pares autorizados. Não recebe bastidores de outras árvores.**

Operação cotidiana e administração estrutural são permissões diferentes. Líder pode operar o próprio grupo, mas não pode alterar identidade canônica, vínculos, aliases, importações conciliadas ou estrutura do Distrito.

## Escopos

| Papel | Escopo operacional detalhado | Administração estrutural | Comparação autorizada |
| --- | --- | --- | --- |
| Distribuição | Todos os Distritos da própria Distribuição | própria Distribuição | consolidados estaduais |
| Empresária | próprio Distrito | próprio Distrito | outras Empresárias da mesma Distribuição, somente agregados aprovados |
| Líder | próprio grupo | não | outras Líderes do mesmo Distrito, somente agregados aprovados |
| Consultora | própria pessoa, pedidos, metas, grupo e Líder | não | nenhum ranking gerencial |
| Recruta | próprio perfil e escopo autorizado durante ativação | não | nenhum ranking gerencial |

## Recursos

| Recurso | Distribuição | Empresária | Líder | Consultora/Recruta |
| --- | --- | --- | --- | --- |
| `people` | leitura da própria Distribuição | leitura do próprio Distrito | leitura das pessoas autorizadas do próprio grupo | própria pessoa |
| `memberships` | administração da própria Distribuição | administração do próprio Distrito | leitura do próprio escopo | próprio vínculo |
| `member_aliases` | resolve identidade | resolve identidade no próprio Distrito | leitura autorizada | própria identidade quando autorizada |
| `groups` | leitura da própria Distribuição | leitura do próprio Distrito | próprio grupo | próprio grupo |
| `orders` | detalhe da própria Distribuição | detalhe do próprio Distrito | detalhe do próprio grupo | próprios pedidos |
| `goals` | escopo estadual | próprio Distrito | próprio grupo | próprias metas |
| `weekly_performance` | detalhe autorizado da Distribuição | detalhe do próprio Distrito | detalhe/agregado do próprio grupo | próprio desempenho |
| `recognitions` | própria Distribuição | próprio Distrito | leitura do próprio grupo | reconhecimentos autorizados |
| `network_events` | própria Distribuição | próprio Distrito | próprio grupo | eventos do próprio escopo pessoal |
| `import_batches` / `import_rows` / `import_issues` | administra | administra no próprio Distrito | sem escrita | sem acesso administrativo |
| `reconciliations` | administra | administra no próprio Distrito | leitura somente quando explicitamente exposta | sem acesso administrativo |
| `audit_log` | escopo administrado | próprio Distrito | sem acesso gerencial estrutural | sem acesso gerencial |

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
5. rejeita migração entre Distritos no mesmo fluxo;
6. exige ação administrativa da Distribuição ou Empresária autorizada.

Aliases e grafias semelhantes nunca fazem merge automático. A confirmação administrativa fica registrada por `confirmed_by_person_id` e `confirmed_at`.

## Importação e qualidade

A migration `0005_operational_data.sql` separa:

- `import_rows.raw_name`: exatamente o que veio da fonte;
- `people.canonical_name`: identidade validada;
- `memberships`: vínculo e papel atual/histórico;
- `weekly_performance`: fato semanal em nível `district`, `group` ou `member`;
- `reconciliations`: comparação entre valor transcrito e valor calculado;
- `recognitions`: reconhecimento independente de atividade semanal e cargo atual.

Valor desconhecido deve permanecer `null`. Agregado de grupo sem pessoas detalhadas permanece em nível `group` com `person_id = null`; não se cria membro fictício para fechar total.

A migration `0006_admin_permissions.sql` restringe mudanças estruturais, resolução de identidade e importações para `DISTRIBUTION` e `BUSINESS_OWNER` dentro do escopo autorizado.

## Piloto Serra / nome Plenitude

O seed operacional mantém o Distrito canônico atual de Serra e registra **Distrito Plenitude** como nome de exibição/alias `pending_review`, com `business_name = Vitoriaware`, até confirmação do nome oficial. Isso evita transformar uma nomenclatura ainda não confirmada em chave estrutural definitiva.

## Migração do piloto

A migration `0003_network_core.sql` adiciona o modelo hierárquico sem apagar a estrutura antiga do piloto. A migration `0004_network_rls.sql` substitui a política ampla de pedidos (`orders_member`) pelas regras hierárquicas quando o ambiente multiusuário for efetivamente migrado.

A versão estática pública não deve ser convertida para autenticação real até que URL, chaves Supabase, onboarding e migração da base Serra estejam validados em ambiente próprio. Arquivos importados no preview estático ficam apenas em memória; a gravação real depende do backend autenticado.
