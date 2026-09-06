# VoeTupper V3: operação, rede e comunidade

Data: 6 de setembro de 2026

Status: proposta consolidada para revisão da usuária

## 1. Contexto

A V2 validou identidade visual, navegação e fluxos básicos, mas ainda é um protótipo local com dados simulados. A V3 transforma essa base em um produto multiusuário para a operação real do Distrito Serra.

O trabalho que hoje se espalha entre WhatsApp, bloco de notas, catálogo, calculadora e TupperNet deve permanecer reunido por pessoa, pedido e Vitrine. Ao mesmo tempo, a plataforma precisa ser agradável o bastante para gerar adesão espontânea entre usuárias que valorizam simplicidade, reconhecimento e interação social.

A V2 permanece preservada. A V3 nasce na branch `feat/voetupper-v3`. Nenhuma alteração será incorporada à branch principal sem autorização explícita.

## 2. Objetivos

1. Permitir cadastro único e acesso persistente de cada usuária.
2. Aplicar permissões conforme Distribuição, Empresária, Líder e Consultora.
3. Organizar metas individuais por Vitrine.
4. Mostrar prioridades operacionais sem expor ou constranger pessoas.
5. Reunir o ciclo completo de cada pedido.
6. Representar a rede do Espírito Santo de forma interativa e compreensível.
7. Oferecer interação social local com baixa fricção.
8. Importar a equipe real sem colocar dados pessoais ou credenciais no Git.
9. Usar linguagem familiar à operação da Tupperware sem representar o produto como oficial ou patrocinado pela marca.

## 3. Fora do primeiro lançamento

O primeiro lançamento não fará envio automático de pedidos ao TupperNet, captura automática de mensagens privadas do WhatsApp, scraping do portal, reconhecimento infalível de produtos por foto ou moderação social complexa.

Essas integrações exigem validação técnica, jurídica e de segurança própria. O fluxo inicial abre o portal e o WhatsApp por ações conscientes da usuária.

## 4. Princípios de experiência

- Uma informação já conhecida não é solicitada novamente.
- A tela inicial responde primeiro ao que precisa de atenção.
- Resultados concluídos saem da fila operacional.
- Valores negativos e inatividade são privados ao escopo de gestão.
- Reconhecimentos podem aparecer na comunidade, respeitando visibilidade.
- A linguagem é curta, humana e familiar: Vitrine, atividade, indicação, oportunidade, parceria, movimento, conquista e reconhecimento.
- Não haverá travessões nos textos visíveis.
- A interface deve funcionar no celular e continuar confortável em notebook.
- Animações reforçam orientação e prazer de uso, sem atrasar tarefas.

## 5. Fundação técnica

### 5.1 Aplicação

A V3 reaproveita o runtime React e Next.js validado na V2. Componentes visuais continuam separados das regras de domínio, persistência e autorização.

### 5.2 Backend

Um backend PostgreSQL autenticado será a fonte de verdade compartilhada. A base Supabase já modelada no repositório será evoluída em vez de criar um segundo sistema incompatível.

O navegador poderá manter cache operacional controlado, mas identidade, hierarquia, metas, pedidos compartilhados e credenciais externas não dependerão de `localStorage`.

### 5.3 Identidade e sessão

Cada pessoa recebe uma única identidade. O primeiro acesso conclui um cadastro orientado e os acessos seguintes reutilizam a conta.

O nome exibido na Home vem da pessoa autenticada. A aplicação nunca usa Ritheli como saudação fixa.

### 5.4 Hierarquia e autorização

O caminho canônico é:

1. Distribuição Espírito Santo: Gerusa.
2. Distrito: Empresária responsável.
3. Grupo: Líder responsável.
4. Consultora.

Distribuição vê os Distritos sob sua responsabilidade. Empresária vê seu Distrito. Líder vê seu grupo. Consultora vê seus próprios dados e a comunidade autorizada.

Informações operacionais sobem na hierarquia, mas não descem. Uma Consultora não vê métricas privadas da Líder ou Empresária. Uma Líder não vê a composição interna de outro grupo. Comparações entre pares usam apenas indicadores agregados autorizados.

## 6. Vitrine, fechamento e metas

A Vitrine é o período principal do produto. Semana permanece como uma marca auxiliar dentro da Vitrine quando necessária.

Cada Vitrine possui início, término e fechamento operacional. O fechamento padrão ocorre na segunda-feira às 12h no fuso `America/Sao_Paulo`.

Metas pertencem a uma pessoa, papel e Vitrine. Distribuição, Empresária, Líder e Consultora podem ter metas individuais distintas.

Metas iniciais:

- vendas em reais;
- recrutamento em pessoas;
- atividade quando a regra operacional for confirmada;
- outros indicadores configuráveis posteriormente.

Ao confirmar o cadastro de uma nova pessoa, o sistema registra quem realizou a indicação e acrescenta uma unidade à meta de recrutamento da responsável naquela Vitrine. O mesmo cadastro não pode pontuar duas vezes. Uma eventual indicação produtiva pode ser acompanhada como conquista separada, sem retirar o ponto concedido pelo cadastro.

## 7. Home e Radar

A Home é personalizada por usuária e papel.

Cabeçalho sugerido:

> Bom dia, Ritheli. Vamos colocar a Vitrine em movimento?

O topo mostra Vitrine atual, horário de fechamento e contagem regressiva. O bloco principal se chama `Quem precisa de você hoje` e organiza:

- pessoas próximas da meta;
- pedidos aguardando confirmação;
- produtos ainda sem identificação;
- pessoas com pouco movimento;
- ações pendentes antes do fechamento.

Cada item oferece uma próxima ação direta, como incentivar, abrir conversa, organizar pedido, consultar ofertas ou copiar mensagem.

## 8. Mural

O Mural possui duas áreas claramente separadas.

### 8.1 Meu dia

Área privada de gestão. Mostra prioridades e riscos somente ao nível autorizado.

Inativas não aparecem soltas no mural. A gestora abre o total de pessoas sob sua responsabilidade e então escolhe entre ativas, novas, pausadas, inativas e elegíveis a recadastro.

### 8.2 Nossa rede

Área social inspirada na facilidade de Twitter, Facebook e Orkut, sem copiar suas interfaces.

Permite publicações curtas, fotos, vídeos, reações e reconhecimentos. Eventos reais podem sugerir publicações de conquista, mas a pessoa ou gestora confirma antes de publicar quando houver informação individual.

Valores de vendas, inatividade, distância negativa da meta e detalhes de pedidos nunca entram no feed público automaticamente.

## 9. Rede

### 9.1 Pessoas

Lista compacta limitada ao escopo da usuária. Empresária vê seu Distrito; Líder vê seu grupo; Consultora vê seu próprio perfil e conexões autorizadas.

Filtros principais: ativas, novas, pausadas, inativas e recadastro. Busca por nome, código e grupo. O perfil abre em uma folha lateral ou inferior sem tirar a usuária do contexto.

### 9.2 Estrutura

A recomendação é um `Mapa Vivo da Rede`.

O contorno do Espírito Santo funciona como visão estadual. Gerusa ocupa a camada superior como responsável pela Distribuição, não como uma região colorida. Cada Distrito aparece como uma área ou ponto feminino de cor própria. O toque abre Empresária, grupos, Líderes e Consultoras em uma árvore vertical adequada ao celular.

O mapa comunica alcance estadual. A árvore comunica responsabilidade real. Nenhuma localização geográfica exata de pessoa é exibida.

### 9.3 Ranking

O ranking se chama `Corrida da Vitrine` e prioriza progresso proporcional à meta, não apenas venda bruta.

Para cada Líder autorizada, a Empresária vê:

- percentual realizado;
- valor realizado;
- quanto falta;
- tendência até o fechamento;
- situação: conquistou, quase lá, em movimento ou precisa de apoio;
- ação rápida para incentivar.

O destaque principal é `Quem está quase lá`. A interface evita humilhação, cores de fracasso e competição entre pessoas com metas incomparáveis.

## 10. Pedidos

Cada pedido possui uma sala ligada a uma pessoa e Vitrine.

Estados operacionais:

1. Chegou agora.
2. Identificar itens.
3. Montar pedido.
4. No portal.
5. Aguardando confirmação.
6. Confirmado.
7. Concluído ou cancelado.

A sala reúne texto, fotos, áudios, transcrição, dúvidas, itens, quantidades, valores, prints e histórico. A usuária pode interromper um pedido e retomar sem perder contexto.

Um painel mostra venda acumulada da pessoa, quanto falta para a meta, incentivos próximos e ofertas que podem ser úteis. Mensagens são sugeridas para revisão e cópia. O sistema não envia mensagens privadas sem ação consciente.

Ao concluir, o valor atualiza automaticamente a meta individual e os agregados autorizados da hierarquia.

## 11. Perfil e cadastro

Campos mínimos:

- nome completo;
- nome de exibição;
- foto opcional;
- papel atual;
- Distribuição, Distrito, grupo e responsável;
- código comercial;
- telefone;
- e-mail de acesso;
- status operacional;
- preferências de notificação;
- histórico de vínculos e mudanças de papel.

CPF e data de nascimento só entram se houver finalidade operacional confirmada e proteção compatível.

Promoção de Consultora para Líder altera o vínculo da mesma pessoa. Não cria cadastro duplicado.

## 12. Cofre de acesso ao portal

Credenciais do TupperNet ficam fora do perfil comum e fora do bundle do navegador.

Requisitos:

- criptografia no servidor;
- autorização por papel e escopo;
- senha oculta por padrão;
- revelar e copiar como ações separadas;
- reautenticação para acesso sensível;
- registro de quem revelou ou copiou;
- nunca registrar o valor em logs ou analytics;
- revogação e atualização de acesso;
- proibição de credenciais reais em Git, fixtures e modo demonstração.

A V3 oferece abrir o portal e copiar credenciais autorizadas. Login automatizado não faz parte do primeiro lançamento.

## 13. Menu e movimento

No celular, o menu usa uma cápsula inferior com efeito inspirado no movimento `gênio`: o item selecionado se expande de forma elástica, revela nome e recolhe os demais. No notebook, a barra lateral mantém o mesmo princípio com transição curta.

A animação respeita preferência de movimento reduzido e nunca bloqueia um clique.

## 14. Dados reais e migração

O repositório antigo possui `team.enc.json`, uma base criptografada da equipe. Os links fornecidos não incluem a chave de descriptografia. A V3 não tentará quebrar essa proteção.

Rotas seguras de migração:

1. importar com a chave privada antiga, se recuperada;
2. importar novamente o arquivo original;
3. cadastrar progressivamente pela interface.

A importação aceita prévia, mapeamento, revisão de nomes, grupos, duplicidades e confirmação administrativa. Nenhuma pessoa fictícia será criada para completar totais.

Modo demonstração e operação real permanecem separados. Nomes simulados nunca aparecem na conta real da Ritheli.

## 15. Cadastro H e inatividade

O Guia do Novo Consultor de 2026 informa que uma pessoa inativa por mais de 52 semanas pode ser recadastrada e tratada como novo Consultor no programa descrito. A V3 modelará o prazo como regra configurável até confirmação da aplicação exata no Distrito Serra.

Status sugeridos:

- nova;
- ativa;
- pausada;
- inativa;
- elegível a recadastro;
- recadastrada.

## 16. Falhas e estados vazios

- Sem rede: manter rascunho local não sensível e sincronizar depois.
- Conflito de edição: preservar versões e pedir confirmação humana.
- Produto desconhecido: manter pendência explícita, sem inventar código.
- Pessoa sem grupo confirmado: exibir `Vínculo a conferir`.
- Credencial indisponível: oferecer atualização ou recuperação, nunca mostrar valor antigo incerto.
- Falha de importação: nenhum lote parcial é confirmado.
- Sem equipe cadastrada: oferecer importar ou adicionar a primeira pessoa, sem dados fictícios.

## 17. Entregas

Este documento fixa a arquitetura comum e decompõe a V3 em entregas independentes. O próximo plano de implementação cobrirá somente a V3.0. V3.1, V3.2 e V3.3 receberão especificação e aprovação próprias antes de implementação.

### V3.0: fundação e rede real

- autenticação;
- cadastro único;
- hierarquia e permissões;
- Vitrine e fechamento na segunda-feira às 12h;
- importação segura da equipe;
- Pessoas compacta;
- Mapa Vivo da Rede;
- Corrida da Vitrine;
- Perfil real;
- novo menu.

### V3.1: operação de pedidos

- sala de pedido;
- anexos e áudio;
- estados operacionais;
- metas e agregados;
- mensagens sugeridas;
- cofre de acesso.

### V3.2: comunidade

- feed local;
- publicações e reações;
- reconhecimentos;
- controles de visibilidade;
- notificações leves.

### V3.3: catálogo inteligente

- busca unificada de produtos;
- auxílio de identificação por foto;
- códigos e ofertas por Vitrine;
- sugestões ligadas à meta.

## 18. Testes e critérios de aceitação

### Segurança

- cada papel enxerga somente o escopo permitido;
- Consultora não acessa dados gerenciais superiores;
- Líder não acessa composição interna de outro grupo;
- credenciais externas não aparecem em respostas comuns, logs ou fixtures;
- modo demonstração não acessa dados reais.

### Operação

- saudação usa a pessoa autenticada;
- Vitrine fecha na segunda-feira às 12h;
- metas são individuais e pertencem à Vitrine;
- concluir pedido atualiza agregados uma única vez;
- recrutamento distingue cadastro de indicação produtiva;
- inativas só aparecem após ação explícita da gestora;
- pedido pode ser interrompido e retomado no mesmo estado.

### Experiência

- fluxos principais funcionam em celular e notebook;
- navegação por toque tem alvos acessíveis;
- animações respeitam movimento reduzido;
- textos visíveis não contêm travessões;
- estados vazios não apresentam pessoas fictícias.

## 19. Referências de linguagem

- Tupperware Brasil, Portal de oportunidade: https://portal.tupperware.com.br/
- Guia do Novo Consultor Tupperware 2026: https://pedidos.tupperware.com.br/planalto/comunicados/ComunicadoACCMegaRev_Guia%20Digital%20do%20Novo%20Consultor.pdf

O VoeTupper é um produto independente. O uso dessas referências serve para respeitar o vocabulário da operação, não para alegar afiliação, patrocínio ou endosso.
