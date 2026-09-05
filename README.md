# VoeTupper V2

VoeTupper é um piloto mobile-first para organizar pedidos, metas e pessoas da Rede Serra em um só lugar. Esta V2 foi reconstruída como uma única aplicação Next.js e React, com a logo oficial fornecida para o projeto.

## Estado desta entrega

A V2 está isolada na branch `feat/voetupper-v2`. A branch `main` continua com a versão estável e não deve ser alterada antes da aprovação da prévia.

Já funciona nesta primeira entrega:

- tela Hoje com prioridades, resumo do ciclo e metas;
- cadastro de pedido com validações em português;
- histórico e fechamento por etapas;
- cadastro e diretório de pessoas;
- mural derivado de fatos registrados;
- ranking apenas quando existem dados comparáveis;
- hierarquia Distribuição, Distrito, Líder, Grupo e Consultora;
- metas independentes de vendas e recrutamento;
- atalho configurável para um portal externo HTTPS;
- acesso local compatível com o piloto anterior;
- migração segura dos dados locais anteriores;
- instalação como PWA e modo offline para o shell do aplicativo.

## Limites do piloto local

Os dados são salvos no próprio navegador. Este acesso local evita que outra pessoa abra o piloto por acaso no mesmo aparelho, mas não é autenticação de produção nem separação multiusuário.

Na primeira abertura, o aplicativo procura a chave V2. Se ela ainda não existir e houver estado legado na mesma origem, ele:

1. preserva uma cópia exata do valor anterior;
2. converte somente os vínculos e etapas reconhecidos;
3. mantém dados ambíguos como vínculo a conferir;
4. grava o novo estado sem apagar a chave antiga.

Use `/?demo=1` para uma sessão temporária com dados sanitizados quando não houver estado salvo. O modo de demonstração não cria credencial.

## O que ficou para a próxima fase

Esta entrega não conecta Supabase, Google Drive ou outro backend. Também não inclui importação definitiva de planilhas, contas simultâneas, catálogo, automação de login em portais externos ou envio automático de pedidos.

Esses itens dependem de uma fase própria de backend, privacidade, autorização por papel, backup e importação assistida.

## Rodar localmente

Requisitos: Node.js 22 ou compatível e npm.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Verificar e exportar

```bash
npm test
npm run typecheck
npm run build
```

O build é estático e fica em `out/`. A configuração de hospedagem usa essa pasta sem incluir dados locais do navegador.

## Prévia

A prévia desta branch é publicada com acesso privado pelo Sites. A versão pública da `main` permanece inalterada durante a avaliação.

## Arquitetura

- `src/components/v2`: interface e fluxos do produto;
- `src/lib/v2`: modelo, reducer, seletores, migração, armazenamento e acesso local;
- `src/lib/domain`: regras de domínio e governança preservadas;
- `public`: logo, manifesto e service worker;
- `supabase`: desenho futuro de persistência, ainda não conectado à V2.

## Segurança de dados

Não versione CPF, telefone real, exportações da operação, arquivos importados ou senhas de portais externos. O atalho do portal aceita somente URLs HTTPS e nunca armazena a senha desse portal.

O software é uma ferramenta independente de organização para venda direta. Não automatiza acesso, coleta de sites ou submissão de pedidos em serviços de terceiros.
