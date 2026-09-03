# VoeTupper Multiusuário: Identidade, Governança e Rede Territorial

## Objetivo

Evoluir o VoeTupper de um piloto local por navegador para uma rede multiusuário persistente, com identidade única por pessoa, autenticação por e-mail, governança por papel e escopo territorial e uma hierarquia compatível com a operação real informada.

A experiência social continua inspirada na lógica do Orkut, com perfil, rede, mural, ranking, grupos e conquistas. A infraestrutura deixa de depender de `localStorage` para dados de identidade, senha e relacionamento entre pessoas.

## Correção da hierarquia

A hierarquia canônica do produto passa a ser:

1. Brasil
2. Distribuição por estado
3. Distrito administrado por uma Empresária
4. Líder
5. Grupo
6. Consultora ou Revendedora

No Espírito Santo:

- Distribuição ES: Gerusa
- Distrito Norte: Giseli Aguilar
- Distrito Noroeste: Adriana Junta
- Distrito Serra: Ritheli Radis
- Distrito Vitória: Tatiana Madeira
- Distrito Vila Velha e Sul: Adriana Maia
- Distrito Cariacica: Vanessa Luciana

A palavra `Distrito` representa o território administrado por cada Empresária. Gerusa não deve ser apresentada como Distrito. Ela representa a Distribuição do Espírito Santo.

## Princípio de identidade

Uma pessoa existe uma única vez no VoeTupper.

O sistema não cria uma nova pessoa quando uma Consultora vira Líder. O mesmo `person_id` permanece e o vínculo organizacional muda.

Exemplo:

```text
Pessoa: Maria
Papel atual: Consultora
Distrito: Serra
Líder: Ana
Grupo: Grupo Ana
```

Após promoção:

```text
Pessoa: Maria
Papel atual: Líder
Distrito: Serra
Superior: Empresária Serra
Grupo próprio: Grupo Maria
```

O histórico registra a mudança de papel e data de vigência. A pessoa não perde pedidos, conquistas, tempo de rede ou histórico anterior.

## Promoção e emancipação de grupo

Quando uma Consultora se torna Líder, o VoeTupper deve permitir uma operação de promoção explícita.

A promoção deve:

1. alterar o papel atual da pessoa para Líder;
2. registrar a transição no histórico;
3. criar ou ativar o grupo da nova Líder;
4. permitir selecionar quais Consultoras migram com ela;
5. preservar todos os `person_id` existentes;
6. registrar de qual grupo cada pessoa saiu e para qual grupo foi;
7. recalcular contagens e indicadores sem duplicar pessoas.

Nenhuma migração de grupo deve ser inferida automaticamente apenas pelo nome da pessoa.

## Modelo de autorização

A autorização combina dois fatores:

- papel da pessoa;
- escopo organizacional em que ela está vinculada.

O sistema deve usar RBAC com escopo hierárquico, e não apenas um campo `role` no frontend.

### Distribuição

A Distribuição ES pode visualizar os seis Distritos do estado e consolidar indicadores autorizados.

Pode administrar:

- Empresárias do estado;
- metas estaduais ou por Distrito;
- indicadores agregados;
- estrutura de Distritos;
- políticas de acesso;
- movimentações de Empresárias quando aplicável.

Não precisa receber acesso a credenciais externas das Consultoras.

### Empresária

A Empresária administra completamente o próprio Distrito.

Pode visualizar no próprio Distrito:

- Líderes;
- grupos;
- Consultoras;
- pedidos;
- produção;
- metas;
- recrutamento;
- cadastro e recadastro;
- dados operacionais necessários;
- ranking das Líderes;
- movimentos da rede;
- histórico de promoção e migração.

Ao comparar com outra Empresária da mesma Distribuição, pode visualizar apenas indicadores agregados autorizados.

Exemplos permitidos entre Empresárias:

- posição no ranking estadual;
- percentual da meta;
- crescimento percentual;
- número agregado de novas Consultoras;
- número agregado de Consultoras ativas;
- badges e conquistas;
- tendência de desempenho.

Exemplos não permitidos entre Empresárias:

- nomes das Líderes da outra Empresária;
- nomes das Consultoras;
- composição de grupos;
- telefones;
- códigos;
- senhas;
- CPF;
- pedidos individuais;
- faturamento individual por pessoa;
- ficha operacional de qualquer membro do outro Distrito.

### Líder

A Líder administra o próprio grupo.

Pode visualizar em detalhe:

- membros do próprio grupo;
- pedidos e pendências do grupo;
- metas do grupo;
- recrutamento do grupo;
- dados necessários para operação e cadastro;
- progresso individual das próprias Consultoras quando autorizado.

Pode comparar seu desempenho apenas com outras Líderes do mesmo Distrito e apenas por indicadores agregados autorizados.

Não pode visualizar:

- grupos pertencentes a outra Líder;
- nomes das Consultoras da outra Líder;
- pedidos individuais da outra equipe;
- dados pessoais da outra equipe;
- ranking de Líderes de outro Distrito;
- indicadores gerenciais de Empresárias acima do seu nível.

### Consultora ou Revendedora

A Consultora visualiza sua própria área e os elementos sociais compatíveis com seu nível.

Pode visualizar:

- próprio perfil;
- Líder responsável;
- grupo atual;
- próprias metas, pedidos e conquistas;
- informações institucionais do Distrito necessárias para orientação;
- rankings de Consultoras apenas quando a política do Distrito permitir.

Não pode visualizar:

- faturamento da Empresária;
- comparação Empresária x Empresária;
- ranking de Líderes;
- dados de outros grupos;
- informações cadastrais de outras pessoas;
- métricas gerenciais superiores.

## Regra de governança resumida

A regra operacional do VoeTupper será:

> Administra dentro do próprio escopo. Compete apenas com pares autorizados. Não recebe inteligência gerencial de níveis superiores nem bastidores de outras árvores.

A visibilidade não é simplesmente `acima vê abaixo`. Ela depende da função operacional.

## Matriz de visibilidade

| Origem | Próprio escopo | Pares no mesmo escopo superior | Escopo de terceiros | Nível superior |
| --- | --- | --- | --- | --- |
| Distribuição | Completo para gestão estadual | N/A | N/A | Somente se houver nível nacional futuro |
| Empresária | Completo no próprio Distrito | Agregado de outras Empresárias da mesma Distribuição | Sem composição interna | Informações institucionais da Distribuição |
| Líder | Completo no próprio grupo | Agregado de Líderes do mesmo Distrito | Sem composição interna | Sem métricas gerenciais da Empresária |
| Consultora | Próprios dados | Apenas social autorizado no próprio nível | Sem dados operacionais | Sem métricas gerenciais de Líder ou Empresária |

## Modelo de dados recomendado

### `people`

Uma linha por pessoa real.

Campos principais:

- `id` UUID;
- `full_name`;
- `email` quando disponível;
- `phone` quando disponível;
- `birth_date` quando necessário para operação;
- `status`;
- `created_at`;
- `updated_at`.

Dados sensíveis devem ser minimizados e separados quando necessário.

### `auth_identities`

Vincula uma pessoa ao usuário autenticado.

- `person_id`;
- `auth_user_id`;
- `primary_email`;
- `email_verified_at`;
- `last_sign_in_at`.

Senha não é armazenada nesta tabela nem em planilha.

### `distributions`

- Brasil / UF;
- nome da Distribuição;
- responsável atual;
- status.

No piloto:

```text
ES | Distribuição Espírito Santo | Gerusa
```

### `districts`

- `id`;
- `distribution_id`;
- `name`;
- `region_label`;
- `business_owner_person_id`;
- `status`.

Seis registros iniciais no ES.

### `groups`

- `id`;
- `district_id`;
- `leader_person_id`;
- `name`;
- `status`;
- `created_at`.

### `memberships`

Fonte de verdade dos vínculos organizacionais.

- `person_id`;
- `role`;
- `distribution_id`;
- `district_id`;
- `group_id` quando aplicável;
- `parent_person_id` quando aplicável;
- `valid_from`;
- `valid_to`;
- `is_current`.

Essa tabela permite manter histórico sem duplicar pessoas.

### `goals`

Metas independentes de vendas.

Tipos iniciais:

- sales;
- recruitment;
- activation;
- orders;
- leader_development;
- retention;
- custom.

Cada meta tem alvo, período, responsável, escopo e visibilidade.

### `orders`

Pedidos vinculados a `person_id`, `district_id` e, quando aplicável, `group_id`.

### `performance_snapshots`

Guarda métricas agregadas por período para ranking sem precisar expor pedidos individuais.

### `achievements`

Conquistas derivadas de eventos reais.

### `network_events`

Eventos seguros para o Mural, como promoção, meta atingida, recrutamento e conquista.

## Autenticação

### Escolha recomendada

Usar Supabase Auth com login por e-mail.

O e-mail passa a ser a identidade de acesso preferencial. Para Ritheli, o login inicial pode usar o e-mail já fornecido pela usuária.

### Senha inicial

Não usar uma senha padrão compartilhada entre as seis Empresárias.

Fluxo recomendado:

1. cadastrar o e-mail validado da pessoa;
2. enviar convite ou link de definição de senha;
3. a própria pessoa cria a senha;
4. recuperação de senha ocorre por e-mail;
5. sessões persistem com o mecanismo seguro do Supabase Auth.

Se o e-mail de uma Empresária ainda não estiver disponível, a pessoa pode aparecer na Rede, mas a conta de login fica `aguardando e-mail` até o dado ser fornecido.

## Persistência e infraestrutura

### Banco principal

Supabase Postgres será a fonte de verdade para:

- identidade;
- estrutura da rede;
- vínculos;
- metas;
- pedidos compartilhados;
- rankings;
- eventos;
- perfis;
- permissões.

### Segurança de banco

Usar Row Level Security.

Toda consulta deve ser filtrada por políticas baseadas em `auth.uid()` e nos vínculos da pessoa autenticada.

Não confiar em filtros feitos apenas em JavaScript no navegador.

### GitHub Pages

O frontend pode continuar hospedado no GitHub Pages durante a próxima fase.

A chave pública `anon` do Supabase pode existir no frontend desde que RLS esteja corretamente configurado. Nenhuma `service_role` deve ser publicada no repositório ou frontend.

Operações privilegiadas, como convite administrativo, migração em massa ou sincronização externa, devem usar Supabase Edge Functions ou outro backend seguro.

### Google Drive e Planilha base

A planilha no Google Drive pode existir como espelho administrativo e ferramenta de conferência.

Ela não será fonte de verdade para:

- senha;
- sessão;
- autorização;
- relacionamento hierárquico crítico.

Uso recomendado da planilha:

- exportação periódica;
- auditoria humana;
- relatórios;
- conferência de cadastros;
- importação assistida de dados legados;
- contingência operacional limitada.

A sincronização inicial deve ser preferencialmente banco → planilha. Alterações bidirecionais ficam para fase posterior, porque aumentam risco de conflito.

## Contas iniciais das seis Empresárias

A Rede deve conter desde já os seis perfis de Empresária:

1. Giseli Aguilar, Distrito Norte
2. Adriana Junta, Distrito Noroeste
3. Ritheli Radis, Distrito Serra
4. Tatiana Madeira, Distrito Vitória
5. Adriana Maia, Distrito Vila Velha e Sul
6. Vanessa Luciana, Distrito Cariacica

Apenas contas com e-mail confirmado devem ser ativadas para login.

Não inventar e-mails.

## Interface

A direção visual permanece rosa, feminina e reconhecível, com a ideia informal de `Barbie + Canva + rosa raiz`, mas sem copiar propriedade intelectual de terceiros.

Princípios:

- rosa como cor dominante de identidade;
- branco para superfícies;
- cards com pouco ruído;
- ícones simples;
- tipografia legível;
- microcopy curta;
- sem travessão em textos de interface;
- alvos de toque de no mínimo 44 px;
- safe area correta no iPhone;
- layout responsivo de celular a desktop.

### Mobile

A prioridade continua sendo celular.

Menu principal:

- Hoje
- Rede
- Pedidos
- Perfil

Rede contém:

- Mural
- Ranking
- Árvore
- Grupos

### Desktop

No computador, a mesma arquitetura deve aproveitar espaço adicional:

- sidebar persistente;
- árvore e perfil lado a lado quando útil;
- ranking com filtros;
- painel operacional mais denso;
- sem transformar a interface em dashboard corporativo genérico.

## Perfis sociais

Cada pessoa pode ter um perfil social interno compatível com seu papel.

Campos visíveis dependem do observador.

Exemplo de perfil de Empresária visto por outra Empresária:

- nome;
- Distrito;
- posição agregada;
- crescimento;
- conquistas;
- metas públicas internas autorizadas.

Não mostra Líderes, Consultoras ou pedidos da outra árvore.

## Ranking

Rankings seguem a regra de pares.

### Empresária x Empresária

Dentro da mesma Distribuição ES.

Indicadores recomendados:

- percentual de meta;
- crescimento;
- recrutamento;
- ativação;
- posição geral.

Valores absolutos detalhados não são padrão.

### Líder x Líder

Somente dentro do mesmo Distrito.

### Consultora x Consultora

Somente se o Distrito habilitar. Nunca deve abrir métricas superiores.

## Mural

O Mural continua automático no MVP.

Eventos possíveis:

- nova Consultora entrou;
- Consultora foi promovida a Líder;
- grupo atingiu meta;
- Distrito atingiu meta;
- pessoa recebeu conquista;
- Líder subiu no ranking local;
- Empresária mudou de posição no ranking estadual.

A mensagem mostrada deve respeitar o escopo do observador.

## Privacidade

Nunca incluir em Mural, Ranking ou perfil comparativo:

- senha;
- CPF;
- código de portal;
- telefone privado sem finalidade autorizada;
- data de nascimento;
- pedido individual de terceiro;
- valor individual de terceiro;
- composição de grupo de outro Distrito.

## Migração do piloto atual

A migração deve preservar o que já existe no aparelho da Ritheli.

Estratégia:

1. criar o schema remoto;
2. cadastrar Distribuição ES e seis Distritos;
3. criar pessoa e conta da Ritheli;
4. importar as Consultoras do piloto para `people`;
5. mapear vínculos confirmados da Serra;
6. enviar os dados do navegador para o banco apenas com ação explícita e tela de conferência;
7. manter fallback local temporário durante a transição;
8. depois que a sincronização for estável, remover localStorage como fonte principal.

Não apagar dados locais antes de confirmar persistência remota.

## Estratégia de implantação

### Fase 1: Fundação

- Supabase Auth;
- schema de pessoas e rede;
- RLS;
- seis Distritos;
- login por e-mail;
- conta Ritheli;
- sessão persistente;
- migração segura da base Serra.

### Fase 2: Governança

- permissões por papel;
- árvore filtrada por escopo;
- perfis com visibilidade contextual;
- promoção de Consultora para Líder;
- migração de grupo;
- histórico de vínculo.

### Fase 3: Social e competição

- ranking Empresária x Empresária agregado;
- ranking Líder x Líder local;
- Mural com escopo;
- conquistas;
- grupos e comunidades.

### Fase 4: Integrações

- espelho no Google Sheets;
- e-mails transacionais personalizados;
- relatórios;
- eventual painel da Distribuição.

## Testes obrigatórios

### Autenticação

- login correto;
- senha incorreta;
- recuperação de senha;
- sessão persistente;
- logout;
- conta sem vínculo atual.

### Governança

- Consultora não consegue consultar métricas de Empresária;
- Líder não consegue consultar grupo de outra Líder;
- Líder não consegue consultar ranking de outro Distrito;
- Empresária não consegue listar membros de outro Distrito;
- Empresária consegue visualizar indicadores agregados das outras Empresárias;
- Distribuição consegue consolidar os seis Distritos;
- chamadas diretas ao banco também são bloqueadas por RLS quando não autorizadas.

### Identidade

- promoção não duplica pessoa;
- migração preserva histórico;
- pessoa não pode ter dois vínculos atuais conflitantes do mesmo tipo;
- Consultora promovida mantém pedidos e conquistas anteriores.

### Interface

- navegação mobile;
- safe area do iPhone;
- desktop responsivo;
- estados vazios;
- perfil sem dado sensível indevido;
- ausência de travessão na microcopy publicada.

## Critérios de sucesso

A arquitetura estará correta quando:

- Gerusa aparecer como Distribuição ES;
- houver seis Distritos e seis Empresárias no ES;
- cada pessoa tiver identidade única;
- promoção alterar vínculo em vez de duplicar pessoa;
- login usar e-mail e mecanismo de autenticação seguro;
- senha não for armazenada em planilha ou código;
- Empresária não enxergar composição interna de outro Distrito;
- Líder não enxergar composição interna de outra equipe;
- Consultora não enxergar métricas gerenciais superiores;
- rankings compararem somente pares autorizados;
- RLS impedir acesso indevido mesmo fora da UI;
- Ritheli consiga continuar usando o piloto durante a migração;
- a interface preserve a identidade rosa e continue simples no celular;
- a planilha do Drive funcione como espelho administrativo, não como cofre de credenciais.

## Decisões fechadas

- Gerusa é Distribuição ES.
- Empresária administra um Distrito.
- ES possui seis Distritos conhecidos nesta fase.
- Pessoas não são duplicadas ao mudar de papel.
- Empresárias podem comparar indicadores agregados entre si na mesma Distribuição.
- Empresárias não podem abrir a composição interna de outro Distrito.
- Líderes competem apenas com pares do mesmo Distrito.
- Consultoras não recebem inteligência gerencial dos níveis acima.
- Login preferencial é por e-mail.
- Não haverá senha padrão compartilhada.
- Supabase Auth + Postgres + RLS é a arquitetura recomendada.
- Google Sheets é espelho administrativo, não backend de autenticação.
- GitHub Pages pode continuar hospedando o frontend durante esta fase.
