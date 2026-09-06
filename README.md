<p align="center">
  <img src="public/logo-192.png" width="112" alt="Logo VoeTupper">
</p>

# VoeTupper V3

<p align="center">
  Pessoas, metas e movimento da Vitrine em um só lugar.
</p>

<p align="center">
  <a href="https://voetupper-serra-v3.joyceradis.chatgpt.site/?demo=1"><strong>Abrir o VoeTupper V3</strong></a>
</p>

Versão atual: **V3.0**

## O que é

O VoeTupper organiza a rotina de Empresárias, Líderes e Consultoras da Rede Serra. A V3 reúne prioridades, pessoas, estrutura da rede, metas individuais e interação da comunidade com uma experiência simples para celular e notebook.

O fechamento operacional considera a **Vitrine** como período principal e ocorre na **segunda-feira às 12:00**, no horário de São Paulo.

## O que já está disponível

- Home personalizada com Radar de prioridades;
- destaque para quem está quase alcançando a meta;
- Comunidade com interações rápidas;
- lista compacta de pessoas conforme o nível de acesso;
- inativas protegidas até a abertura explícita do total;
- Mapa Vivo do Espírito Santo e árvore da rede;
- Corrida da Vitrine baseada no percentual da meta individual;
- Perfil com informações operacionais relevantes;
- importação de equipe em CSV com revisão de duplicidades e grupos;
- separação clara entre a conta do VoeTupper e o acesso do TupperNet;
- menu adaptativo com movimento elástico no celular;
- modo de demonstração completamente separado dos dados reais.

## Hierarquia e privacidade

As informações operacionais sobem pela hierarquia autorizada:

1. Distribuição;
2. Empresária do Distrito;
3. Líder do Grupo;
4. Consultora.

Consultoras não recebem informações privadas de níveis superiores. Líderes enxergam apenas o próprio grupo. Empresárias enxergam o próprio Distrito. A Distribuição enxerga os Distritos sob sua responsabilidade.

Credenciais do TupperNet não são salvas no navegador, no Git, em exemplos ou em arquivos de demonstração. O cofre definitivo depende da conexão segura com o backend.

## Dados reais

A demonstração usa nomes e números identificados como exemplos. A equipe real deve entrar por importação revisada ou cadastro progressivo. O sistema não inventa pessoas para completar grupos ou totais.

Nunca publique neste repositório CPF, telefone real, exportações da operação ou senhas de portais externos.

## Desenvolvimento

Requisitos: Node.js 22 e npm.

```bash
npm ci
npm run dev
```

Verificação completa:

```bash
npm test
npm run typecheck
npm run build
```

## Estrutura da V3

- `src/features/v3`: experiência, regras e componentes da V3;
- `src/features/v3/domain`: Vitrines, permissões, prioridades e ranking;
- `src/features/v3/data`: separação entre dados reais e demonstração;
- `supabase/migrations`: modelo autenticado e políticas de acesso;
- `docs/superpowers/specs`: decisões de produto e arquitetura;
- `docs/superpowers/plans`: plano de implementação versionado.

## Versões anteriores

A V2 permanece preservada na branch `feat/voetupper-v2`. A V3 foi desenvolvida na branch `feat/voetupper-v3` antes de se tornar a versão atual.

## Independência

O VoeTupper é uma ferramenta independente de organização para venda direta. Não é afiliado, patrocinado ou endossado pela Tupperware e não automatiza login ou envio de pedidos em serviços de terceiros.
