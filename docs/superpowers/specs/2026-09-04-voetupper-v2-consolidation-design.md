# VoeTupper V2: consolidação funcional e visual

## Status

Desenho aprovado em conversa em 04/09/2026. Este documento registra o escopo da primeira entrega funcional para revisão antes do plano de implementação.

## Objetivo

Reconstruir o VoeTupper como uma única aplicação coerente, mobile-first e funcional, preservando o aprendizado do piloto atual sem continuar a pilha de sobrescritas em JavaScript e CSS.

A V2 deve servir ao trabalho diário da Empresária Serra e, ao mesmo tempo, preparar o produto para autenticação e persistência multiusuário futuras. A versão atual permanece intacta na `main` até a aprovação da nova experiência.

## Usuária principal e tarefa central

A primeira usuária é a Empresária responsável pelo Distrito Serra. Ela precisa transformar pedidos recebidos por WhatsApp, áudios, fotos e ligações em ações organizadas, acompanhar metas de naturezas diferentes e navegar pela própria rede sem depender de planilhas durante a operação diária.

A primeira tela deve responder, sem exigir exploração:

1. O que precisa ser feito agora?
2. Como estão as metas desta semana ou vitrine?
3. Quem da rede precisa de atenção?

## Escopo da primeira entrega

### Incluído

- acesso local do piloto e continuidade do acesso já criado;
- migração segura dos dados locais da versão atual;
- navegação `Hoje`, `Rede`, `Pedidos` e `Perfil`;
- registro, listagem e avanço de pedidos;
- fila de fechamento baseada na próxima ação;
- metas de vendas e recrutamento como grandezas distintas;
- mural automático derivado de eventos reais;
- ranking entre pessoas do mesmo nível, somente quando houver dados suficientes;
- árvore hierárquica e diretório da rede;
- perfis resumidos compatíveis com o papel da pessoa;
- configuração do endereço externo usado pela equipe;
- experiência responsiva em celular e computador;
- instalação como PWA e funcionamento do shell sem conexão;
- dados sanitizados para demonstração e prévia.

### Fora desta primeira entrega

- autenticação real com Supabase;
- sincronização multiusuário e entre dispositivos;
- gravação em Google Drive ou Google Sheets;
- importação completa de XLS/XLSX e gravação de lotes;
- postagem manual, comentários, curtidas ou mensagens;
- automação de login ou envio em portal de terceiros;
- administração estadual completa;
- dados, credenciais ou documentos reais no repositório.

Esses itens não aparecerão como controles inertes. A arquitetura será preparada para recebê-los em fases posteriores.

## Hierarquia canônica

A V2 adota a estrutura mais recente do produto:

```text
Brasil
  Distribuição Espírito Santo, Gerusa
    Distrito Serra, Ritheli Radis, Empresária
      Líder
        Grupo
          Consultora ou Revendedora
```

Uma pessoa mantém a mesma identidade quando muda de papel. Registros sem vínculo confirmado aparecem como `Vínculo a conferir`; a interface não inventa líder, grupo ou resultado para completar a árvore.

`Vitoriaware` pode identificar a operação, mas não aparece como nível hierárquico.

## Direção visual

A tese visual é **rede feminina de alta energia com clareza operacional**.

- rosa intenso da identidade como cor de ação e navegação;
- branco para superfícies principais;
- rosa muito claro para agrupamento e profundidade;
- ameixa escuro para texto e contraste;
- dourado usado apenas em reconhecimento sustentado por dados;
- cantos arredondados e sombras leves, sem aparência de template genérico;
- tipografia de sistema cuidadosamente dimensionada para evitar dependência de rede;
- corpo de texto com pelo menos 16 px e rótulos operacionais com pelo menos 14 px;
- controles com área de toque mínima de 44 px;
- foco visível, contraste e informação de estado que não dependem somente de cor.

A decisão visual memorável será a **espinha da rede**: a árvore usa uma linha vertical rosa com nós de pessoas e grupos, permitindo compreender a hierarquia no celular sem um diagrama largo. A logo aparece grande no acesso e como assinatura discreta dentro do aplicativo.

Não haverá travessão em textos visíveis. A linguagem será curta, humana, profissional e familiar às usuárias: Empresária, Líder, Consultora, Grupo, Vitrine e Semana.

## Estrutura de navegação

### Celular

A navegação inferior fixa contém quatro destinos:

- Hoje
- Rede
- Pedidos
- Perfil

Ela respeita `safe-area-inset-bottom`, mantém texto e ícone visíveis e não encosta na barra do navegador.

### Computador

Uma barra lateral persistente contém a mesma navegação, identidade do Distrito e ação de saída. O conteúdo pode usar duas colunas quando isso reduz rolagem, sem transformar o produto em um painel excessivamente denso.

### Fechamento

Fechamento é um fluxo operacional, não uma aba principal. Ele é aberto pela tela Hoje ou pelos Pedidos e mostra apenas itens que ainda exigem ação.

## Telas e fluxos

### Acesso

- exibe a logo e a identidade VoeTupper;
- reconhece o acesso local já criado no piloto;
- no primeiro uso, cria senha local separada de qualquer credencial externa;
- informa com clareza que esse acesso protege apenas o aparelho atual;
- oferece saída sem apagar os dados operacionais.

### Hoje

O primeiro viewport contém:

1. contexto da Vitrine, Semana e prazo;
2. ação principal `Novo pedido`;
3. fila compacta do que precisa ser feito;
4. progresso das metas prioritárias;
5. resumo curto da rede.

Quando não houver pendências, o estado vazio será uma faixa curta. Pedidos e módulos vazios não ocuparão grandes áreas apenas para preencher espaço.

### Novo pedido

O formulário abre como painel inferior no celular e diálogo no computador. Campos essenciais:

- Consultora;
- origem do pedido;
- resumo ou itens;
- quantidade opcional;
- valor opcional;
- pagamento opcional;
- observação opcional.

Vitrine, Semana e data são derivados automaticamente. Valores brasileiros aceitam vírgula decimal e não aceitam negativos.

Após salvar, o pedido entra no início da fila com a próxima ação `Conferir`.

### Pedidos e fechamento

Os estágios são:

```text
Recebido -> Conferido -> Portal -> Print enviado -> Finalizado
```

Cancelar exige confirmação. Pedidos finalizados ou cancelados deixam a fila ativa, mas permanecem no histórico. Pesquisa e filtros permitem localizar pessoa, status e período sem esconder a ação principal.

### Rede

A tela Rede contém quatro visões internas:

- Mural
- Ranking
- Árvore
- Diretório

O mural é gerado por fatos existentes, como novo pedido, nova Consultora informada ou meta atingida. Não existem publicações fictícias.

O ranking compara apenas pares autorizados e oferece dimensões compatíveis com os dados disponíveis. Sem base comparável, mostra uma mensagem objetiva em vez de fabricar posições.

A árvore mostra o caminho da Distribuição ao Grupo e permite expandir os membros. O diretório prioriza pesquisa por nome ou código e conduz ao perfil autorizado.

### Perfil

O Perfil reúne:

- nome, papel e Distrito;
- contagens da rede;
- metas ativas;
- conquistas derivadas;
- endereço externo usado pela equipe;
- informação de que o piloto é local neste primeiro ciclo.

Conquistas só aparecem quando houver evento que as sustente.

## Arquitetura da aplicação

### Superfície única

A V2 usa o aplicativo React/Next já presente no repositório como única superfície de produto. Os scripts estáticos sobrepostos deixam de ser a implementação principal da V2.

O projeto será exportável como site estático para manter compatibilidade com hospedagem simples e PWA. Não serão adicionadas dependências de interface sem necessidade comprovada.

### Limites de módulos

```text
UI de telas e componentes
        |
Estado da aplicação e casos de uso
        |
Domínio puro: pedidos, metas, rede e permissões
        |
Portas de persistência e autenticação
        |
Adaptador local do piloto agora, Supabase depois
```

- `domain` contém regras puras e não conhece navegador ou React;
- `application` coordena ações, estado e migrações;
- `infrastructure` implementa armazenamento local e acesso local do piloto;
- `features` reúne componentes por fluxo;
- componentes compartilhados cuidam apenas de apresentação e acessibilidade.

### Estado

Um `AppProvider` com reducer centraliza o estado funcional. Alterações ocorrem por ações explícitas, como `orderCreated`, `orderAdvanced`, `goalUpdated` e `personAdded`. A persistência acontece após ações confirmadas, não durante a digitação de formulários.

Estado transitório de interface, como aba interna, painel aberto ou texto de pesquisa, não é persistido como dado de negócio.

### Portas futuras

As telas não acessam `localStorage` ou Supabase diretamente. Elas usam interfaces de armazenamento e autenticação. A primeira implementação é local; uma implementação futura poderá usar Supabase sem reescrever regras e componentes.

## Migração e continuidade dos dados

A migração lê o estado legado `voetupper-vitoriaware-state-v1` quando ainda não existe estado V2.

Regras:

1. validar a estrutura antes de transformar;
2. preservar pessoas, pedidos, metas e vínculos reconhecidos;
3. converter etapas antigas de pedido para o novo enum;
4. marcar campos ambíguos para conferência;
5. gravar primeiro uma cópia de segurança do valor legado;
6. salvar o estado V2 somente após validação completa;
7. manter a migração idempotente;
8. nunca apagar automaticamente a chave legada.

O acesso local reutiliza os registros atuais quando válidos. A prévia privada, por usar outra origem, trabalha com dados sanitizados; a migração real acontece somente quando a V2 for servida no mesmo endereço da versão atual.

## Tratamento de erros

- formulários mostram validação junto ao campo relevante;
- falha de armazenamento mantém a sessão em memória e exibe aviso persistente sem fingir que o dado foi salvo;
- estado local corrompido não quebra a aplicação e pode ser exportado para diagnóstico antes de iniciar uma base limpa;
- links externos aceitam apenas `https://`;
- ausência de dados produz estados vazios curtos e úteis;
- ações destrutivas exigem confirmação;
- erros inesperados são apresentados em linguagem simples, sem expor detalhes ou dados pessoais.

## Segurança e privacidade

- o acesso local não será descrito como autenticação de produção;
- CPF, senha externa, arquivos importados e dados pessoais reais não entram no GitHub;
- credenciais de terceiros não aparecem em mural, ranking, árvore ou perfil;
- dados entre pares seguem visualização agregada;
- fixtures e capturas usam somente informações sanitizadas;
- nenhuma ação no portal externo é automatizada.

## PWA e publicação

- manifesto usa os PNGs oficiais de 192 e 512 px;
- o shell essencial é armazenado para abertura sem conexão;
- cada publicação altera a versão do cache;
- a V2 será construída em `feat/voetupper-v2`;
- uma prévia privada será entregue antes de qualquer substituição;
- a `main` continuará sendo a versão estável até aprovação explícita;
- a troca final será feita por integração revisável, sem apagar o histórico.

## Estratégia de testes

O desenvolvimento seguirá ciclos teste, falha esperada, implementação mínima e refatoração.

### Unidade

- criação e avanço de pedidos;
- cálculo de próxima ação;
- metas com dinheiro, pessoas, pedidos e percentual;
- agregações da tela Hoje;
- construção e visibilidade da rede;
- normalização e migração do estado legado;
- validação de URL e valores brasileiros.

### Integração

- criar pedido atualiza fila, metas e histórico;
- finalizar remove da fila sem apagar o histórico;
- adicionar pessoa atualiza diretório e árvore;
- troca de papel preserva a identidade;
- salvar e recarregar mantém o estado;
- falha de armazenamento não informa sucesso falso.

### Contratos estáticos

- quatro destinos principais;
- ausência de travessão em microcopy;
- ícones e manifesto válidos;
- cache versionado;
- nenhum segredo ou dado proibido nos arquivos públicos.

### Verificação final

- suíte completa de testes;
- checagem de tipos;
- build de produção e exportação estática;
- comparação da árvore Git publicada com a árvore verificada;
- inspeção da prévia pela usuária antes de alterar a `main`.

## Critérios de aceitação

A primeira V2 está pronta para apresentação quando:

1. a interface possui uma única fonte de implementação;
2. as quatro áreas principais funcionam em celular e computador;
3. a Empresária consegue registrar e concluir um pedido;
4. metas de vendas e recrutamento são independentes;
5. Rede mostra mural, ranking, árvore e diretório sem inventar dados;
6. os dados do piloto atual podem ser migrados com segurança;
7. falhas de persistência são visíveis e recuperáveis;
8. o PWA usa a identidade visual oficial;
9. testes, tipos e build terminam sem falhas;
10. a versão atual permanece disponível até a aprovação da V2.

