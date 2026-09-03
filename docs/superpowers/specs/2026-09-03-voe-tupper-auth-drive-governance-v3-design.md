# VoeTupper v3: autenticação, Drive e governança multiusuário

## Objetivo

Transformar o VoeTupper em uma rede multiusuário com identidade única por pessoa, autenticação por e-mail, visibilidade por papel e escopo, persistência segura e uma planilha administrativa privada no Google Drive para onboarding, conferência e contingência.

## Hierarquia canônica

```text
Brasil
  Distribuição por estado
    Distrito administrado por Empresária
      Líder
        Grupo
          Consultora / Revendedora
```

No Espírito Santo:

- Distribuição ES: Gerusa
- Distrito Norte: Giseli Aguilar
- Distrito Noroeste: Adriana Junta
- Distrito Serra: Ritheli Radis
- Distrito Vitória: Tatiana Madeira
- Distrito Vila Velha e Sul: Adriana Maia
- Distrito Cariacica: Vanessa Luciana

Gerusa é Distribuição ES, não Distrito.

## Identidade única

Cada pessoa tem um único `person_id` durante toda a vida na rede.

Mudanças de Consultora para Líder são transições de papel e vínculo, nunca criação de uma segunda pessoa.

A promoção registra:

- papel anterior;
- papel novo;
- data de vigência;
- grupo de origem;
- grupo novo;
- pessoas que migraram com a nova Líder;
- responsável que aprovou a mudança.

## Regra de governança

A regra do produto é:

> Administra dentro do próprio escopo. Compete apenas com pares autorizados. Não recebe inteligência gerencial de níveis superiores nem bastidores de outras árvores.

### Distribuição

Vê os seis Distritos e os indicadores autorizados de todos eles.

Pode administrar Empresárias, metas estaduais, estrutura territorial e políticas de acesso.

### Empresária

Vê em detalhe somente o próprio Distrito.

Pode ver de outras Empresárias da mesma Distribuição apenas indicadores agregados aprovados:

- posição;
- percentual de meta;
- crescimento percentual;
- recrutamento agregado;
- ativação agregada;
- badges e conquistas.

Não vê Líderes, grupos, Consultoras, pedidos, telefones, códigos, CPF, senhas ou faturamento individual de outro Distrito.

### Líder

Vê em detalhe apenas o próprio grupo.

Pode comparar-se com outras Líderes do mesmo Distrito apenas por indicadores agregados.

Não vê grupos concorrentes nem métricas gerenciais da Empresária.

### Consultora

Vê o próprio perfil, pedidos, metas, conquistas, Líder e grupo.

Não vê ranking de Empresárias, ranking de Líderes, faturamento da Empresária ou dados operacionais de outras pessoas.

## Autenticação

### Identificador

O login preferencial é e-mail.

Perfis podem existir sem e-mail, mas ficam com status `aguardando_email` e sem conta autenticável.

### Senha temporária de onboarding

Para o piloto inicial, a senha temporária padrão autorizada é:

```text
Tupper123
```

Regras obrigatórias:

- uso apenas como senha inicial;
- troca obrigatória no primeiro acesso;
- nunca publicar em GitHub, logs, HTML, JavaScript público ou documentação pública do produto;
- a planilha privada do Drive pode registrar a senha temporária apenas enquanto o onboarding estiver pendente;
- após a primeira troca, a planilha deve marcar `senha_trocada = sim` e não deve receber a nova senha;
- recuperação posterior ocorre por e-mail;
- a senha real nunca fica armazenada na planilha.

### Sessão

A sessão autenticada não deve depender de `localStorage` artesanal.

A infraestrutura recomendada continua sendo Supabase Auth + sessão padrão do SDK.

## Persistência principal

Supabase Postgres será a fonte de verdade da aplicação multiusuário.

Entidades mínimas:

- `people`
- `auth_identities`
- `distributions`
- `districts`
- `groups`
- `memberships`
- `goals`
- `orders`
- `performance_snapshots`
- `achievements`
- `network_events`
- `audit_log`

## RLS

Toda tabela de negócio deve ter Row Level Security.

As políticas devem partir de `auth.uid()` e resolver a pessoa autenticada, papel atual e escopo corrente.

Nenhuma regra de segurança pode depender apenas de filtro no frontend.

## Planilha administrativa no Google Drive

Criar uma planilha privada chamada:

```text
VoeTupper | Diretório e Onboarding ES
```

Ela será espelho administrativo e área de onboarding, não banco de autenticação.

### Aba `Empresárias`

Colunas:

- `person_id`
- `nome`
- `distribuicao`
- `distrito`
- `papel`
- `email_login`
- `status_login`
- `senha_temporaria`
- `troca_obrigatoria`
- `senha_trocada`
- `data_ativacao`
- `observacao`

Linhas iniciais:

- Giseli Aguilar | Distribuição ES | Norte | Empresária
- Adriana Junta | Distribuição ES | Noroeste | Empresária
- Ritheli Radis | Distribuição ES | Serra | Empresária | e-mail fornecido pela usuária
- Tatiana Madeira | Distribuição ES | Vitória | Empresária
- Adriana Maia | Distribuição ES | Vila Velha e Sul | Empresária
- Vanessa Luciana | Distribuição ES | Cariacica | Empresária

Somente Ritheli recebe e-mail preenchido enquanto os demais não forem confirmados.

A coluna `senha_temporaria` pode conter `Tupper123` enquanto `status_login` for `aguardando_email` ou `convite_pendente`.

### Aba `Pessoas`

Uma linha por pessoa real.

Colunas mínimas:

- `person_id`
- `nome`
- `email`
- `telefone`
- `papel_atual`
- `distribuicao`
- `distrito`
- `grupo`
- `lider_person_id`
- `status`
- `origem_dado`
- `ultima_atualizacao`

### Aba `Movimentações`

Registra promoção, migração de grupo e mudança de Distrito.

### Aba `Governança`

Documenta de forma legível quem pode ver o quê.

### Aba `Importações`

Controle de cargas legadas e reconciliação.

## Relação banco x planilha

O banco é fonte de verdade para runtime.

A planilha é:

- diretório administrativo;
- onboarding;
- conferência;
- exportação;
- auditoria humana;
- contingência limitada.

No início, sincronização preferencial banco → planilha.

Planilha → banco só em operações explícitas e validadas.

## Interface

Manter a direção visual rosa forte, feminina, limpa e mobile-first.

A inspiração informal `Barbie + Canva + rosa raiz` significa:

- rosa dominante de marca;
- branco para superfícies;
- cards arredondados;
- ícones simples;
- hierarquia visual forte;
- nada de aparência corporativa genérica;
- nada de copiar assets, marcas ou layouts protegidos de terceiros.

### Mobile

Menu principal:

- Hoje
- Rede
- Pedidos
- Perfil

Rede:

- Mural
- Ranking
- Árvore
- Grupos

### Desktop

- sidebar persistente;
- árvore e perfil lado a lado quando útil;
- ranking mais denso;
- filtros por período;
- operação e contexto social no mesmo produto.

## README e ROADMAP

O repositório deve passar a ter documentação de produto e governança de nível proprietário:

### README

Deve explicar:

- visão do produto;
- hierarquia real;
- princípios de identidade;
- governança;
- arquitetura técnica;
- modelo de segurança;
- fluxo de onboarding;
- limites do piloto;
- como executar localmente;
- como configurar ambientes;
- o que nunca deve ser commitado.

### ROADMAP

Deve separar:

- piloto Serra;
- multiusuário ES;
- autenticação e RLS;
- migração de dados;
- ranking e mural;
- expansão para outras Distribuições;
- observabilidade;
- auditoria;
- notificações por e-mail;
- governança nacional futura.

## Auditoria

Toda mudança sensível deve gerar `audit_log`:

- criação de pessoa;
- alteração de papel;
- promoção para Líder;
- migração de grupo;
- mudança de Distrito;
- criação/desativação de acesso;
- alteração de meta;
- mudança de permissão;
- importação em massa.

## Segurança e privacidade

Nunca expor em interfaces sociais:

- senha;
- CPF;
- telefone de terceiros;
- credenciais externas;
- pedidos individuais de outro escopo;
- valores detalhados de outro Distrito;
- e-mail privado sem necessidade funcional.

Toda ação privilegiada deve ser auditável.

## Critério de conclusão desta fase

A fase está pronta quando existir:

1. modelo de dados e RLS versionados no repositório;
2. integração de autenticação preparada;
3. login por e-mail preparado;
4. fluxo de troca obrigatória de senha temporária;
5. planilha privada no Drive com as seis Empresárias;
6. identidade única e promoção sem duplicação;
7. matriz de governança aplicada em queries e UI;
8. README e ROADMAP atualizados;
9. testes automatizados de autorização e regressão;
10. documentação de migração do piloto local para multiusuário.
