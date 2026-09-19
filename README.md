<p align="center">
  <img src="public/logo-192.png" width="112" alt="Logo VoeTupper">
</p>

# VoeTupper

<p align="center">
  <strong>CRM operacional e gestão de rede para venda direta.</strong>
</p>

<p align="center">
  <em>Sales-network CRM built with Next.js, React, TypeScript and Supabase for hierarchy, goals, permissions and operational workflows.</em>
</p>

## O que este repositório demonstra

| Competência | Evidência no projeto |
| --- | --- |
| Frontend moderno | Next.js 15, React 19 e TypeScript |
| Modelagem de domínio | Vitrines, metas, hierarquia, permissões, prioridades e ranking separados da camada visual |
| Backend / dados | Supabase, SSR client e migrations versionadas |
| Validação | Zod para contratos de dados e regras de entrada |
| Qualidade | Vitest, typecheck com TypeScript e build verificável |
| Authorization thinking | escopo de visualização modelado por papel e responsabilidade operacional |

**Portfolio signal:** Next.js · React · TypeScript · Supabase · Zod · Vitest · domain modeling · authorization design

<p align="center">
  Pessoas, metas, estrutura e movimento da Vitrine em uma experiência mobile-first.
</p>

<p align="center">
  <a href="https://voetupper-serra-v3.joyceradis.chatgpt.site/?demo=1"><strong>Abrir demonstração V3</strong></a>
</p>

## O produto

O VoeTupper foi criado para organizar uma operação real de venda direta com múltiplos níveis de liderança. A aplicação reúne prioridades, pessoas, estrutura da rede, metas individuais e interação da comunidade sem exigir que a usuária transforme sua rotina em uma planilha complexa.

O fechamento operacional considera a **Vitrine** como período principal e ocorre na **segunda-feira às 12:00**, no horário de São Paulo.

## Problema

A gestão de uma rede distribuída exige responder rapidamente:

- quem está ativa ou inativa;
- quem está próxima da meta;
- quais grupos precisam de atenção;
- como a estrutura está distribuída;
- quais prioridades mudaram nesta Vitrine;
- o que cada nível hierárquico pode ou não visualizar.

O VoeTupper transforma essas perguntas em um workflow operacional.

```text
PESSOAS
  ↓
ESTRUTURA DA REDE
  ↓
META INDIVIDUAL
  ↓
PROGRESSO DA VITRINE
  ↓
PRIORIDADES
  ↓
AÇÃO DA LIDERANÇA
```

## Capacidades da V3

- Home personalizada com Radar de prioridades;
- destaque para pessoas próximas da meta;
- Comunidade com interações rápidas;
- visão compacta da equipe conforme nível de acesso;
- proteção de dados de inativas até abertura explícita;
- Mapa Vivo do Espírito Santo;
- árvore hierárquica da rede;
- Corrida da Vitrine baseada no percentual da meta individual;
- perfil com informações operacionais;
- importação CSV com revisão de duplicidades e grupos;
- separação entre conta do VoeTupper e acesso ao TupperNet;
- navegação adaptativa para celular;
- ambiente de demonstração separado dos dados reais.

## Hierarquia e autorização

```text
DISTRIBUIÇÃO
    ↓
EMPRESÁRIA DO DISTRITO
    ↓
LÍDER DO GRUPO
    ↓
CONSULTORA
```

A visibilidade acompanha a responsabilidade operacional. Consultoras não recebem informações privadas de níveis superiores; Líderes acessam o próprio grupo; Empresárias acessam o próprio Distrito; a Distribuição visualiza os Distritos sob sua responsabilidade.

## Privacidade por desenho

- credenciais de serviços externos não são armazenadas em código ou exemplos;
- dados de demonstração são separados dos dados reais;
- o sistema não inventa pessoas para completar grupos ou totais;
- CPF, telefone real, exportações operacionais e senhas não devem ser publicados no repositório;
- a arquitetura de backend prevê autenticação e políticas de acesso.

## Stack e arquitetura

A V3 utiliza uma arquitetura moderna de frontend com camada de domínio separada dos dados e regras de autorização.

```text
src/features/v3/
├── domain/              # Vitrines, permissões, prioridades e ranking
└── data/                # separação entre dados reais e demonstração

supabase/
└── migrations/          # modelo autenticado e políticas de acesso

docs/superpowers/
├── specs/               # decisões de produto e arquitetura
└── plans/               # planos de implementação versionados
```

## Desenvolvimento

Requisitos: Node.js 22 e npm.

```bash
npm ci
npm run dev
```

Verificação:

```bash
npm test
npm run typecheck
npm run build
```

## Evolução

A V2 permanece preservada na branch `feat/voetupper-v2`. A V3 foi desenvolvida separadamente antes de se tornar a versão atual, preservando histórico e permitindo comparação entre decisões de produto.

## Independência

O VoeTupper é uma ferramenta independente de organização para venda direta. Não é afiliado, patrocinado ou endossado pela Tupperware e não automatiza login ou envio de pedidos em serviços de terceiros.

## Autoria

Projeto idealizado e desenvolvido por **Dra. Joyce Radis** para uma operação real de rede, como aplicação de produto digital, CRM, modelagem de permissões e inteligência operacional.
