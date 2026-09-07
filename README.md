<p align="center"><img src="public/logo-192.png" width="112" alt="Logo VoeTupper"></p>

# VoeTupper

Uma ferramenta de apoio à rotina de pedidos, metas e equipe da Vitoriaware.

**[Abrir a demonstração, sem senha](https://voetupper-serra-v3.joyceradis.chatgpt.site/?demo=1)** · [Endereço pelo GitHub](https://joyceradis.github.io/VoeTupper/)

O GitHub guarda o código e o histórico. O GitHub Pages encaminha para a demonstração hospedada em Sites. Os dois endereços levam à mesma experiência.

## Estado atual

**V3.1: demonstração corrigida. V4 operacional em planejamento.** A demonstração usa pessoas e valores fictícios identificados como exemplos. Ela ainda não contém a equipe real de Ritheli e não substitui o Tupper.NET.

### O que funciona nesta demonstração

- Home com **quanto falta para a meta** em destaque e realizado em segundo plano;
- metas, Radar e Corrida separados por Vitrine;
- exemplo da Vitrine 09/2026 com encerramento em **07/09/2026, segunda-feira às 12h50**, horário de São Paulo, conforme informação da operação;
- Radar com navegação direta para Corrida e Pessoas;
- lista compacta de pessoas no escopo do perfil, busca por nome/grupo/código e botão para copiar o código informado;
- nomes de inativas revelados por ação explícita;
- árvore expansível da rede e ilustração do Espírito Santo;
- atalhos para o Tupper.NET da Vitoriaware e a Vitrine Digital oficial;
- conferência inicial de CSV, sem cadastrar ou salvar as linhas.

### O que ainda precisa ser implementado ou conectado

| Parte | Situação real |
| --- | --- |
| Pedidos | O fluxo local da V2 está preservado no código; ainda não foi integrado à interface V3. |
| Equipe real e contas | Existe preparação de autenticação e banco; a demonstração não provisiona contas nem importa a equipe. |
| Senhas Tupper.NET | Cofre e cópia de senhas ainda indisponíveis. Nenhuma senha de portal é recebida nesta demonstração. |
| Produtos e ofertas | Há atalhos oficiais. Não há sincronização das ofertas privadas, catálogo de códigos ou leitura de fotos. |
| Comunidade | Composição visual; publicação, curtidas e comentários ainda não persistem. |
| Metas | Exibição e cálculos funcionam com o conjunto carregado. A definição, o bloqueio por Vitrine e a correção auditada ainda dependem do fluxo de gravação. |
| Mapa | Ilustrativo; não representa vendas geográficas em tempo real. |

## Direção da V4

As consultoras continuam enviando pedidos pelo WhatsApp. A ferramenta deve ajudar a empresária a identificar produtos, copiar códigos, conferir e organizar o fechamento no portal oficial.

O pedido precisa distinguir **quem solicitou** de **qual cadastro recebeu o lançamento**. Uma compra passada no cadastro da empresária por limite de crédito não pode ser atribuída automaticamente à meta oficial da consultora.

Leia a [estrutura da V4 e a pesquisa oficial](docs/superpowers/specs/2026-09-07-voetupper-v4-apoio-pedidos.md): fluxo, regras de Vitrine, ofertas, credenciais, reconhecimento e critérios para uso real.

## Dados e acesso

A demonstração pública contém apenas exemplos. Dados reais exigem autenticação e autorização no servidor, respeitando Distribuição, Empresária, Líder e Consultora. A hierarquia de gestão não concede automaticamente acesso às senhas pessoais de terceiros.

CPF, senhas, arquivos reais da operação e contatos não devem entrar neste repositório público. O acesso ao VoeTupper é separado do acesso ao Tupper.NET.

## Desenvolvimento

Node.js 22 e npm:

```bash
npm ci
npm run dev
```

```bash
npm test
npm run typecheck
npm run build
```

- `src/features/v3`: interface e regras atuais;
- `src/components/v2`: fluxo local anterior, incluindo pedidos;
- `supabase/migrations`: preparação do banco e políticas de acesso;
- `docs/superpowers/specs`: decisões e propostas de produto;
- `docs/superpowers/plans`: planos anteriores.

A V3 evoluiu a partir da V2. O histórico e a branch `feat/voetupper-v2` preservam o trabalho anterior.

O VoeTupper é uma ferramenta independente. Não é um serviço oficial da Tupperware e não envia pedidos ao portal automaticamente.
