# VoeTupper: Rede, Perfil, Ranking e Hierarquia

## Objetivo

Evoluir o VoeTupper de um CRM operacional para uma rede social de venda direta orientada por relacionamento, metas, reconhecimento e desempenho.

A referência mental é a lógica do Orkut, não o visual antigo. A usuária entra pela pessoa e pela rede: vê perfil, posição na hierarquia, conexões, grupos, conquistas, metas e movimentos da comunidade. A camada social nasce dos mesmos dados operacionais usados para pedidos, fechamento, recrutamento e gestão.

O produto deve continuar simples para usuárias mais velhas, com linguagem familiar, poucos elementos por tela, alvos de toque grandes e navegação previsível.

## Princípio central

> Quem está acima administra. Quem está no mesmo nível compete. Quem está abaixo participa.

Esse princípio governa navegação, permissões, ranking e exposição de dados.

## Hierarquia canônica

A árvore do piloto Serra deve representar:

1. Espírito Santo
2. Distrito Grande Vitória
3. Gerusa, responsável pelo distrito
4. Serra, Ritheli Radis de Souza de Oliveira, Empresária
5. Líderes
6. Revendedoras ou Consultoras vinculadas a cada líder

`Vitoriaware` é identidade da operação/rede e não deve aparecer como nível hierárquico entre Gerusa e a Empresária Serra.

A mesma estrutura deve ser extensível para outras empresárias e distritos sem alterar o modelo conceitual.

## Conceito social

O VoeTupper deve funcionar como uma rede profissional e comunitária da venda direta.

Cada pessoa relevante pode ter:

- foto ou avatar;
- nome;
- função na rede;
- cidade ou praça;
- tempo de rede, quando disponível;
- metas ativas;
- conquistas;
- posição em rankings compatíveis com seu papel;
- rede subordinada ou conexões autorizadas;
- grupos ou comunidades;
- movimentos recentes gerados pelo sistema.

Não copiar identidade visual, marca ou elementos protegidos do Orkut. A inspiração é somente comportamental: perfil, rede, comunidades, reconhecimento e navegação por pessoas.

## Modelo de acesso por papel

### Empresária

A Empresária administra a própria árvore completa. Pode visualizar:

- líderes subordinadas;
- revendedoras/consultoras por líder e grupo;
- produção e pedidos;
- status de cadastro/recadastro;
- pendências;
- metas e evolução;
- recrutamento;
- ativação;
- composição completa da própria rede;
- ranking das líderes;
- movimentos e conquistas da rede.

No piloto, Ritheli é a Empresária Serra.

### Líder

A Líder vê a própria equipe em detalhe e as demais líderes da mesma Empresária em modo competitivo agregado.

Na própria equipe, pode visualizar:

- revendedoras vinculadas;
- produção individual;
- pedidos;
- quem ainda não pediu;
- cadastros e pendências;
- metas e evolução da equipe;
- recrutamento da própria equipe;
- conquistas e atividade recente.

Ao visualizar outra Líder do mesmo nível, não recebe acesso aos bastidores da equipe concorrente. Pode ver apenas:

- perfil público interno;
- posição no ranking;
- percentual de metas selecionadas;
- crescimento versus período anterior;
- quantidade agregada de revendedoras ativas;
- quantidade agregada de novas consultoras quando autorizada;
- badges e conquistas;
- indicadores comparativos previamente autorizados.

Não pode ver de outra Líder:

- nomes das revendedoras;
- telefones;
- códigos;
- senhas;
- pedidos individuais;
- faturamento detalhado por pessoa;
- CPF, e-mail, nascimento ou dados cadastrais privados.

### Revendedora / Consultora

A Revendedora participa da própria operação e pode ter perfil pessoal com:

- nome e foto;
- líder responsável;
- praça;
- metas pessoais quando existirem;
- conquistas;
- marcos de atividade;
- posição em rankings autorizados.

O MVP não precisa conceder acesso de gestão sobre outras pessoas.

### Distrito / gestão superior

O nível superior pode consolidar as árvores subordinadas. Uma gestora de distrito como Gerusa poderá visualizar empresárias e indicadores agregados por território conforme política de acesso.

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
- progresso de metas quando autorizado;
- badges.

Valores financeiros absolutos não são padrão de exposição entre árvores.

## Navegação mobile

A navegação inferior deve ter quatro destinos principais:

- Hoje
- Rede
- Pedidos
- Perfil

`Fechamento` deixa de ocupar uma aba fixa e passa a ser acessado por Hoje e Pedidos.

A barra inferior deve:

- respeitar a safe area do iPhone;
- ter ícones simples;
- usar texto legível;
- ter área de toque confortável;
- não ficar visualmente colada à barra do Safari;
- indicar claramente a aba ativa.

A palavra `Equipe` deixa de ser o nome principal do módulo social e vira parte da Rede.

## Tela Hoje

A tela Hoje continua sendo a central operacional e deve preservar o que já funcionou no teste com a Empresária Serra.

Estrutura recomendada:

1. Cabeçalho com praça, vitrine, semana e prazo.
2. Ações rápidas: Novo pedido, Fechamento, Abrir Tupperware, Rede.
3. Pendências somente quando existirem.
4. Metas do ciclo.
5. Resumo da rede.
6. Atividade recente.

Estados vazios não devem ocupar meia tela. Quando não houver pendências, usar uma faixa compacta com mensagem objetiva.

## Metas

Meta não é sinônimo de faturamento.

O produto deve aceitar múltiplos tipos de meta simultaneamente, por exemplo:

- vendas;
- recrutamento de novas consultoras;
- ativação de novas consultoras;
- desenvolvimento de líderes;
- pedidos;
- retenção;
- metas definidas pelo distrito ou empresária.

Exemplo do piloto:

- meta de recrutamento: 45 novas consultoras;
- progresso: 17 de 45;
- restante: 28.

Cada meta deve ter:

- tipo;
- título;
- período;
- valor alvo;
- valor realizado;
- unidade, como R$, pessoas, pedidos ou percentual;
- responsável;
- origem da meta, quando útil;
- visibilidade.

A Home deve mostrar as metas mais relevantes do período sem tratar todas como dinheiro.

## Tela Rede

A tela Rede é a espinha dorsal social e hierárquica do produto.

Ela deve ter três visões principais:

- Mural
- Ranking
- Árvore

Pode haver também acesso a Grupos dentro da Rede.

### Mural

O mural não depende de postagem manual no primeiro ciclo.

Ele deve ser gerado automaticamente a partir de eventos úteis, por exemplo:

- equipe atingiu uma meta;
- líder subiu no ranking;
- nova consultora entrou na rede;
- equipe completou sequência de crescimento;
- praça alcançou marco agregado;
- líder desenvolveu nova líder;
- consultora atingiu marco pessoal, quando a visibilidade permitir.

O objetivo é reconhecimento e senso de comunidade, não entretenimento vazio.

### Ranking

O Ranking compara apenas pessoas ou unidades do mesmo nível.

Categorias iniciais:

- Líder x Líder dentro da mesma Empresária;
- futuramente Empresária x Empresária dentro do mesmo Distrito;
- futuramente Revendedora x Revendedora em contextos autorizados.

Indicadores possíveis:

- posição;
- percentual da meta;
- crescimento versus período anterior;
- revendedoras ativas;
- novas consultoras;
- ativação;
- sequência positiva;
- badges.

O ranking deve permitir trocar a dimensão comparada. Exemplo: vendas, recrutamento ou crescimento.

Evitar como padrão:

- faturamento absoluto detalhado entre pares;
- dados pessoais;
- composição da equipe concorrente;
- exposição punitiva de baixo desempenho.

### Árvore

A árvore deve:

- mostrar o ponto atual da usuária na hierarquia;
- permitir expandir e recolher níveis;
- diferenciar visualmente Distrito, Empresária, Líder e Revendedora;
- mostrar contadores por nó;
- permitir tocar em um nó para abrir o perfil correspondente quando permitido;
- esconder níveis e dados não autorizados;
- funcionar bem em celular.

Exemplo do piloto:

Espírito Santo

Distrito Grande Vitória

Gerusa

Serra, Ritheli, Empresária

Líder A

Revendedoras da Líder A

Líder B

Revendedoras da Líder B

## Perfil

Perfil é uma superfície central do produto.

Perfil de uma pessoa pode conter:

- foto ou avatar;
- nome;
- função;
- praça;
- líder ou superior imediato;
- tempo de rede, quando disponível;
- metas ativas;
- conquistas;
- ranking;
- indicadores públicos internos;
- grupos dos quais participa;
- movimentos recentes.

Perfil visto por superior pode mostrar dados operacionais adicionais conforme permissão.

Perfil visto por par deve respeitar a política de competição agregada.

## Grupos e comunidades

A lógica de comunidades do Orkut pode ser reinterpretada como grupos úteis da rede.

Exemplos:

- Empresárias ES;
- Líderes Serra;
- Novas Consultoras Setembro;
- Top Vitrine 09;
- Treinamento de novas líderes.

No primeiro ciclo, grupos podem ser derivados da estrutura e das condições do sistema. Não é necessário criar postagem manual, fórum ou moderação social completa.

## Conquistas e reconhecimento

Conquistas devem reforçar comportamentos desejados.

Exemplos:

- Meta batida;
- Maior crescimento;
- Destaque em recrutamento;
- Primeira venda;
- Primeira consultora recrutada;
- Nova líder desenvolvida;
- Sequência de semanas positivas;
- Equipe 100% ativa.

Conquistas aparecem em perfil e mural conforme visibilidade.

## Linguagem de interface

A interface deve parecer humana e familiar.

Regras:

- evitar travessão em microcopy;
- evitar texto com aparência genérica de IA;
- preferir frases curtas;
- usar linguagem simples;
- manter tom profissional, acolhedor e direto;
- preservar nomes conhecidos pelo público, como líder, empresária, consultora, vitrine e grupo.

## Acesso ao portal externo

O botão não deve depender do endereço antigo do Tupper.NET.

Usar rótulo `Abrir Tupperware` ou equivalente neutro e uma URL configurável por workspace.

A troca do site externo não deve exigir mudança estrutural no aplicativo.

O VoeTupper não automatiza login nem submissão de pedidos em portal de terceiros no primeiro ciclo.

## Dados e modelo

O modelo atual baseado apenas em `consultants` com campos livres de `leader`, `group` e `district` é insuficiente.

A evolução deve introduzir entidades explícitas ou estrutura equivalente para:

- territory/state;
- district;
- business_area/empresária;
- leader;
- consultant;
- membership/parent relationship;
- profile;
- groups;
- performance snapshots;
- goals;
- goal progress;
- achievements;
- network events.

No piloto local, a migração deve preservar compatibilidade com os registros existentes.

A UI não deve inferir hierarquia apenas por texto livre quando já houver relacionamento estruturado.

## Segurança e privacidade

Credenciais de portais de terceiros nunca entram em ranking, perfil público interno, mural ou árvore comparativa.

Dados pessoais e operacionais devem obedecer ao princípio de menor privilégio.

A camada social deve operar preferencialmente com indicadores agregados e derivados.

## Estratégia de MVP

Primeiro ciclo:

1. Corrigir persistência da base de consultoras no aparelho da Empresária Serra.
2. Corrigir hierarquia Gerusa, Empresária Serra, Líderes e Revendedoras.
3. Separar papel Empresária, Líder e Revendedora.
4. Ajustar navegação mobile para Hoje, Rede, Pedidos e Perfil.
5. Tornar a árvore navegável.
6. Criar ranking de líderes da Serra com métricas agregadas.
7. Criar perfil resumido de Líder e Empresária.
8. Criar metas multiobjetivo, incluindo recrutamento.
9. Criar mural automático da rede.
10. Tornar o acesso ao portal externo configurável.

Fora do primeiro ciclo:

- rede estadual completa;
- comparação entre empresárias;
- conta individual completa para todas as revendedoras;
- postagem manual;
- comentários;
- curtidas;
- mensagens sociais;
- fórum de grupos;
- automação de login em portal de terceiros.

## Critérios de sucesso

A mudança está correta quando:

- a base de consultoras persiste corretamente no celular da Empresária Serra;
- a árvore representa Gerusa, Empresária Serra, Líderes e Revendedoras sem usar Vitoriaware como nível hierárquico;
- a Empresária consegue administrar a própria rede;
- uma Líder consegue comparar desempenho com outras Líderes sem enxergar dados privados delas;
- metas aceitam dinheiro, pessoas, pedidos e outras unidades;
- recrutamento de novas consultoras pode ser acompanhado como meta;
- o mural é útil sem exigir postagem manual;
- perfis e conquistas dão identidade às pessoas da rede;
- o menu mobile é confortável no iPhone;
- o botão de acesso externo pode trocar de URL sem alterar a arquitetura;
- a experiência continua simples para usuárias com baixa familiaridade digital;
- o produto parece uma rede de pessoas e operação, não uma planilha disfarçada;
- a arquitetura permite expansão futura para outras empresárias e distritos.
