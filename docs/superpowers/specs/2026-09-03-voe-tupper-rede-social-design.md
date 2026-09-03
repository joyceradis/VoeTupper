# VoeTupper — Rede, Ranking e Hierarquia

## Objetivo

Evoluir o VoeTupper de um CRM operacional isolado para uma rede de venda direta orientada por hierarquia, desempenho e competição saudável, sem expor dados operacionais sensíveis entre pares.

O produto continua priorizando execução de pedidos, fechamento e gestão da equipe. A camada social nasce dos mesmos dados operacionais e deve reduzir cobrança manual, aumentar visibilidade de desempenho e criar estímulo competitivo entre pessoas do mesmo nível hierárquico.

## Princípio central

> Quem está acima administra. Quem está no mesmo nível compete. Quem está abaixo participa.

Esse princípio governa navegação, permissões, ranking e exposição de dados.

## Hierarquia canônica

A árvore do piloto Serra deve representar:

1. Espírito Santo
2. Distrito Grande Vitória
3. Gerusa — responsável pelo distrito
4. Serra — Ritheli Radis de Souza de Oliveira — Empresária
5. Líderes
6. Revendedoras / Consultoras vinculadas a cada líder

`Vitoriaware` é identidade da operação/rede e não deve aparecer como nível hierárquico entre Gerusa e a Empresária Serra.

A mesma estrutura deve ser extensível para outras empresárias e distritos sem alterar o modelo conceitual.

## Modelo de acesso por papel

### Empresária

A Empresária administra a própria árvore completa. Pode visualizar:

- líderes subordinadas;
- revendedoras/consultoras por líder e grupo;
- produção e pedidos;
- status de cadastro/recadastro;
- pendências;
- metas e evolução;
- composição completa da própria rede.

No piloto, Ritheli é a Empresária Serra.

### Líder

A Líder vê a própria equipe em detalhe e as demais líderes da mesma Empresária em modo competitivo agregado.

Na própria equipe, pode visualizar:

- revendedoras vinculadas;
- produção individual;
- pedidos;
- quem ainda não pediu;
- cadastros e pendências;
- meta e evolução da equipe.

Ao visualizar outra Líder do mesmo nível, não recebe acesso aos bastidores da equipe concorrente. Pode ver apenas:

- posição no ranking;
- percentual da meta;
- crescimento versus período anterior;
- quantidade agregada de revendedoras ativas;
- badges e conquistas;
- indicadores comparativos previamente autorizados.

Não pode ver de outra Líder:

- nomes das revendedoras;
- telefones;
- códigos;
- senhas;
- pedidos individuais;
- faturamento detalhado por pessoa;
- dados cadastrais.

### Revendedora / Consultora

A Revendedora participa da própria operação e pode receber uma visão pessoal de desempenho. O MVP não precisa conceder acesso de gestão sobre outras pessoas.

### Distrito / gestão superior

O nível superior pode consolidar as árvores subordinadas. No futuro, uma gestora de distrito como Gerusa poderá visualizar empresárias e indicadores agregados por território conforme política de acesso.

## Regra de visibilidade

### Dentro da própria árvore

Transparência operacional conforme o papel e necessidade de gestão.

### Entre pares

Competição por indicadores agregados, sem exposição de dados operacionais privados.

### Fora da própria árvore

Visão institucional e agregada. Exemplo:

- nome da praça/empresária;
- quantidade de líderes;
- quantidade de revendedoras ativas;
- posição ou evolução;
- percentual de meta quando autorizado;
- badges.

Valores financeiros absolutos não são padrão de exposição entre árvores.

## Superfícies do produto

O VoeTupper passa a ter dois blocos conceituais.

### Operação

- Hoje
- Pedidos
- Fechamento

### Rede

- Rede
- Ranking
- Perfil

A navegação mobile pode continuar enxuta; se necessário, Perfil fica acessível pelo avatar/cabeçalho em vez de ocupar uma aba fixa.

## Tela Rede

A tela Rede é a espinha dorsal visual do produto, não apenas uma visualização alternativa de lista.

Ela deve:

- mostrar o ponto atual da usuária na hierarquia;
- permitir expandir e recolher níveis;
- diferenciar visualmente Distrito, Empresária, Líder e Revendedora;
- mostrar contadores por nó;
- permitir tocar/clicar em um nó para abrir o perfil correspondente quando permitido;
- esconder níveis/dados não autorizados pela política de acesso;
- funcionar bem em celular.

Exemplo do piloto:

Espírito Santo
→ Distrito Grande Vitória — Gerusa
→ Serra — Ritheli Radis de Souza de Oliveira — Empresária
→ Líder A
→ Revendedoras da Líder A
→ Líder B
→ Revendedoras da Líder B

## Tela Ranking

O Ranking deve comparar apenas pessoas ou unidades do mesmo nível.

Categorias iniciais:

- Líder × Líder dentro da mesma Empresária;
- futuramente Empresária × Empresária dentro do mesmo Distrito;
- futuramente Revendedora × Revendedora em contextos autorizados.

Indicadores do MVP para líderes:

- posição;
- percentual da meta;
- variação versus semana anterior;
- quantidade de revendedoras ativas;
- sequência de semanas positivas;
- badges.

Evitar como padrão:

- faturamento absoluto detalhado entre pares;
- dados pessoais;
- composição da equipe concorrente.

## Perfil

Cada nó humano relevante pode ter um perfil resumido.

Perfil de Líder, quando visto por par:

- nome;
- função;
- praça/Empresária;
- posição semanal;
- percentual da meta;
- crescimento;
- quantidade agregada de revendedoras ativas;
- conquistas/badges.

Perfil visto por superior pode mostrar dados operacionais adicionais conforme permissão.

## Feed de movimentos da rede

Não criar uma rede social baseada em postagem manual no MVP.

O feed deve ser derivado automaticamente dos dados operacionais e exibir apenas eventos úteis, por exemplo:

- equipe atingiu 100% da meta;
- líder subiu posições no ranking;
- equipe completou sequência de crescimento;
- praça atingiu marco agregado;
- revendedora atingiu marco pessoal, quando a visibilidade permitir.

O objetivo é reconhecimento e estímulo, não entretenimento.

## Gamificação

Gamificação deve reforçar comportamento comercial desejado sem criar punição pública.

Elementos permitidos no MVP:

- posição;
- evolução;
- percentual de meta;
- badges;
- sequências positivas;
- marcos de equipe.

Evitar:

- rankings humilhantes;
- alertas públicos de baixo desempenho individual;
- exposição de pendências privadas;
- linguagem punitiva.

## Dados e modelo

O modelo atual baseado apenas em `consultants` com campos livres de `leader`, `group` e `district` é insuficiente para a visão de rede.

A evolução deve introduzir entidades explícitas ou uma estrutura equivalente para:

- territory/state;
- district;
- business_area / empresária;
- leader;
- consultant;
- membership/parent relationship;
- performance snapshots;
- goals;
- achievements.

No piloto local, a migração pode preservar compatibilidade com os registros existentes, mas a UI não deve inferir hierarquia apenas por texto livre quando já houver relacionamento estruturado.

## Segurança e privacidade

Credenciais de portais de terceiros nunca entram em ranking, perfil público, feed ou árvore comparativa.

Dados pessoais e operacionais devem obedecer ao princípio de menor privilégio.

A camada social deve operar preferencialmente com indicadores agregados e derivados.

## Estratégia de MVP

Primeiro ciclo:

1. Corrigir a hierarquia do piloto Serra.
2. Separar papel Empresária, Líder e Revendedora.
3. Tornar a árvore navegável.
4. Criar ranking de líderes da Serra com dados agregados.
5. Criar perfil resumido de líder.
6. Criar movimentos automáticos da rede a partir dos dados existentes.

Fora do primeiro ciclo:

- rede estadual completa;
- comparação entre empresárias;
- conta individual de todas as revendedoras;
- feed manual;
- comentários, curtidas ou mensagens sociais;
- automação de login em portal de terceiros.

## Critérios de sucesso

A mudança está correta quando:

- a árvore representa Gerusa → Empresária Serra → Líderes → Revendedoras sem usar Vitoriaware como nível hierárquico;
- a Empresária consegue administrar a própria rede;
- uma Líder consegue comparar desempenho com outras Líderes sem enxergar dados privados delas;
- o ranking usa métricas do mesmo nível hierárquico;
- o produto continua operacional e não vira uma rede social de postagem;
- a experiência mobile continua simples;
- o modelo permite expansão futura para outras empresárias e distritos.
