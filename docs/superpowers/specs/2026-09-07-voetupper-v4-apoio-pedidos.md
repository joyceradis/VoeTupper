# VoeTupper V4: apoio à rotina de pedidos

Data: 07/09/2026. Estado: proposta estruturada a partir do relato de Joyce; implementação operacional pendente. Atualiza as premissas anteriores, inclusive o fechamento às 12h00. Não representa funcionalidades já entregues.

## Objetivo e decisão de produto

Reduzir o trabalho de Ritheli entre WhatsApp, revista e Tupper.NET. O fluxo inicial é usado pela empresária; consultoras podem continuar no WhatsApp, sem criar conta em outra plataforma para pedir.

Foram consideradas três abordagens: rede social como entrada principal, substituir o portal e uma mesa de apoio ao lado do WhatsApp e do portal. A terceira atende melhor à rotina descrita. Comunidade e reconhecimento permanecem no projeto; fila de pedidos e valor faltante orientam a primeira tela.

Evoluir o repositório existente, reaproveitando etapas da V2 e visualização de metas da V3. Não apagar cadastros ou backups. A V2 usa armazenamento local: mudar de domínio não transfere a equipe. Recuperar a lista real exige exportação autorizada do navegador de origem ou relatório da operação, com revisão de duplicidades antes de gravar.

## Premissas da operação

- Pedidos chegam por texto, foto, áudio e dúvidas no WhatsApp.
- O lançamento pode usar o cadastro de quem pediu ou da empresária por disponibilidade de crédito.
- Fechamento semanal: segunda-feira às **12h50**, `America/Sao_Paulo`.
- **07/09/2026** encerra a semana e a **Vitrine 09**. Não inferir próximas Vitrines pelo mês.
- Meta individual definida por Vitrine; o realizado muda conforme os pedidos oficiais.
- Joyce informou Consultora Estrela como pedido **acima de R$ 3.350**. Regra provisória da operação relatada: confirmar vigência, base de cálculo, tratamento do valor exato e titular beneficiada antes de conceder reconhecimento oficial.
- Prazo de inatividade para Cadastro de H desconhecido. Não inventar elegibilidade ou pontuação de recrutamento.

## Mesa de pedidos

Primeira tela: usuária, Vitrine, data e horário do prazo, **Faltam R$ X**, barra de progresso e fila de pendências. Realizado e meta em texto secundário. Rascunhos como previsão separada, nunca venda oficial concluída.

| Etapa | Ação | Apoio esperado |
| --- | --- | --- |
| WhatsApp | Reunir mensagens/fotos de quem pediu | Vários anexos e observações por pedido; não exigir formulário da consultora. |
| Identificação | Conferir produto, tamanho, cor e quantidade | Busca por nome/código e foto lado a lado; leitura sugerida sempre revisável. |
| Preparação | Escolher cadastro para lançamento | Solicitante e titular distintos; copiar códigos confirmados. |
| Portal | Lançar no Tupper.NET | Abrir portal oficial; abrir a página não marca pedido como enviado. |
| Conferência | Compartilhar resumo e aguardar resposta | Resumo copiável com produtos, quantidades e valores; empresária decide quando enviar. |
| Finalização | Confirmar envio oficial | Associar comprovante/número do pedido antes de atualizar o total confirmado. |

Pedido: `requestedByPersonId`, `portalAccountPersonId`, `handledByPersonId`, `vitrineId`, `weekId`, itens e etapas. Se o portal reunir compras de várias pessoas em um pedido, alocações ligam cada item à solicitante e a um único pedido oficial. Conciliar a soma com o pedido do portal, evitando duplicar o total da empresária.

Compras solicitadas e meta oficial são métricas diferentes. Não transferir crédito de vendas ou reconhecimento entre pessoas por suposição. Troca de titularidade deve permanecer visível e registrada.

## Produtos, códigos e ofertas

Guardar códigos como texto, inclusive zeros iniciais. Não impor prefixo 8 ou seis dígitos. Cada item guarda código original, código confirmado no portal quando houver, nome, capacidade, cor, imagem/referência, fonte e data de conferência. Não retirar sufixos automaticamente.

**Copiar código** copia exatamente o código confirmado e informa sucesso/falha. Código não confirmado fica sinalizado. Não inventar código, preço ou capacidade a partir de foto ambígua.

Separar catálogo da Vitrine, preço de consumidor da loja pública e oferta autenticada da consultora. Registrar distribuição, período, vigência, atualização e condição de compra. Não recomendar oferta vencida ou sem validade confirmada como disponível. Sugestões partem do valor faltante; não prometem prêmio não confirmado nem acrescentam produtos automaticamente.

## Totais e integração

1. Verificar em sessão autorizada relatórios de pedidos, equipe e ofertas disponíveis para exportação.
2. Priorizar importação revisada de relatório ou tabela copiada. Meta definida uma vez; realizado calculado dos registros oficiais sem redigitar cada total.
3. Identificar pedidos e atualizações: reimportar o mesmo relatório não pode somar vendas de novo. Mostrar origem, horário, período e diferenças a conciliar.
4. Confirmar se existe API ou integração oficial autorizada. A pesquisa pública desta etapa não comprovou esse acesso.
5. Só então considerar sincronização automática. A página pública não é acesso ao banco da Tupperware; não usar interfaces privadas sem autorização.

## Metas e reconhecimento

Meta única por pessoa + Vitrine + tipo. Definição pelo nível responsável; após confirmação, a home consulta o alvo. Correção excepcional com motivo, autor, data, valor anterior e novo. Não sobrescrever meta histórica ao iniciar outra Vitrine.

O servidor deve impor as mesmas regras da interface. Valores em centavos; percentual não chega a 100% por arredondamento enquanto falta valor. Não misturar Vitrines, rascunhos com confirmados, nem meta individual com total da equipe.

Para reuniões, gerar tabela e gráficos legíveis: pessoa, função, meta, realizado confirmado, **faltam**, percentual e reconhecimento validado. Comparação entre pessoas do mesmo nível e escopo. Cor acompanha rótulos, sem ser a única indicação de situação.

Consultora acessa seu contexto, líder seu grupo, empresária seu distrito e distribuição seus distritos autorizados. Dados de gestão sobem na hierarquia; não descem automaticamente. Nomes de inativas só aparecem por ação explícita da responsável. Cadastro de H aguarda regulamento confirmado.

## Acesso e senhas

Login VoeTupper e login Tupper.NET distintos. Código/CPF é texto, preservando zeros. Senha de terceiros exige autorização específica da titular para quem presta apoio; cargo superior não concede esse acesso automaticamente.

Cofre precisa de autenticação persistente, autorização por credencial no servidor, criptografia com chave fora do banco, revogação e histórico sem registrar a senha. Cópia/revelação só por ação autorizada, inicialmente oculta. Não guardar senha em código, navegador, CSV, demonstração ou respostas gerais da rede.

Não solicitar senha no chat para implementar. A demonstração não armazena credenciais. Uma tela de cofre sem implementação não pode afirmar que já criptografa ou guarda dados.

## Linguagem e identidade

Usar Vitrine, Consultora, Líder, Empresária, Distribuição, recrutamento, reconhecimento e Tupper.NET. Frases diretas: “Faltam R$ X”, “Aguardando confirmação”, “Quem precisa do seu apoio”.

Usar imagens de produtos e tampas reais na revisão visual. Jeitoso/Jeitosinho têm referências oficiais; confirmar a peça específica de Criativa antes de redesenhar. A tampa do logotipo atual ainda não foi corrigida. Preservar identidade independente VoeTupper sem apresentar o projeto como serviço oficial da marca.

## Pesquisa oficial em 07/09/2026

| Fonte | Verificação |
| --- | --- |
| [Tupper.NET Vitoriaware](https://pedidos.tupperware.com.br/grandevitoria/Default.aspx) | Distribuição no Espírito Santo e login por código/senha. Não houve sessão autenticada ou acesso a ofertas privadas. |
| [Portal do consultor](https://portal.tupperware.com.br/en/login) | CPF ou código completo e senha. |
| [Vitrine Digital](https://www.tupperware.com.br/pages/vitrine-digital) | Links de Vitrines 09 e 10; a lista de compra pode ser enviada à consultora pelo WhatsApp. |
| [Vitrine 09.2026 vinculada pelo site oficial](https://view.publitas.com/tupperware-digital-09-2026/vitrine-09-2026/page/1) | Destino identificado; leitor sem texto suficiente para extrair catálogo completo validado nesta etapa. |
| [Ofertas da loja](https://www.tupperware.com.br/collections/ofertas) | Canal público; não comprova condições da consultora dentro do pedido. |
| [Jeitosinho 400ml Mix Temperos](https://www.tupperware.com.br/products/jeitosinho-400ml-mix-temperos) | Nome, imagens e SKU público `870229.000`; formato de lançamento no portal não confirmado. |
| [História: 80 anos](https://www.tupperware.com.br/pages/80-anos) | Referência à trajetória iniciada com uma tigela em 1946, cores e conexões humanas. |

## Critérios para a V4 operacional

- Abrir demonstração pelo Mac; autenticação e escopo verificados antes de dados reais.
- Importar equipe com revisão e backup.
- Ensaiar pedido com solicitante diferente da titular, sem duplicar venda.
- Copiar código confirmado e acessar prazo/pendências em poucos cliques.
- Importar relatório duas vezes com o mesmo total; mostrar origem/data.
- Manter meta estável, corrigir com auditoria, separar histórico.
- Só anunciar cofre, reconhecimento e ofertas ativos após implementação e verificação.

## Correção na base V3.1

Implementados nesta etapa: destaque ao faltante, fechamento do exemplo às 12h50, filtro de metas por Vitrine, Radar para aba correta, busca e cópia de código informado de pessoa, atalhos oficiais e textos precisos sobre cofre/importador. As demais funções acima são planejamento da V4.
