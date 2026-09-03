# VoeTupper

VoeTupper é uma plataforma independente para operação, desenvolvimento e governança de redes de venda direta. O produto combina execução diária, estrutura hierárquica, metas, perfis, rankings por pares e histórico de evolução profissional sem transformar a rede em uma planilha aberta para todo mundo.

> Status: piloto operacional publicado. Arquitetura multiusuário em desenvolvimento. O piloto público não será substituído até autenticação, RLS e migração de dados passarem pelo release gate.

## Visão de produto

A rede tem uma estrutura real. O software deve respeitá-la.

```text
Brasil
  Distribuição por estado
    Distrito administrado por Empresária
      Líder
        Grupo
          Consultora / Revendedora
```

No piloto do Espírito Santo, a Distribuição ES possui seis Distritos: Norte, Noroeste, Serra, Vitória, Vila Velha e Sul, e Cariacica.

A experiência social usa conceitos familiares de perfil, rede, mural, ranking, grupos e conquistas, mas os dados exibidos dependem do papel de quem está olhando.

## Princípio de identidade

Uma pessoa existe uma única vez.

O `person_id` acompanha a pessoa durante toda a trajetória. Se uma Consultora se torna Líder, o sistema altera papel e vínculo, preserva histórico, pedidos e conquistas e registra a promoção. O grupo que migra com a nova Líder é escolhido explicitamente. Pessoas não são duplicadas para representar cargos novos.

## Princípio de governança

**Administra dentro do próprio escopo. Compete apenas com pares autorizados. Não recebe inteligência gerencial de níveis superiores nem bastidores de outras árvores.**

Isso significa:

- Distribuição administra o estado e seus Distritos.
- Empresária administra em detalhe somente o próprio Distrito.
- Empresárias da mesma Distribuição podem comparar indicadores agregados autorizados.
- Líder administra o próprio grupo e pode comparar agregados com outras Líderes do mesmo Distrito.
- Consultora vê seu contexto operacional e social, sem métricas gerenciais de níveis superiores.

A matriz completa está em [`GOVERNANCE.md`](./GOVERNANCE.md).

## Arquitetura

```text
Interface Next.js
      |
Supabase Auth
      |
Identidade + Membership atual
      |
Postgres com RLS
      |
+----------------------+----------------------+
| dados do próprio     | views agregadas de  |
| escopo               | pares autorizados   |
+----------------------+----------------------+
      |
Auditoria e eventos
      |
Espelho administrativo no Google Drive
```

### Fonte de verdade

Supabase Postgres será a fonte de verdade do runtime multiusuário para identidade, vínculos, metas, pedidos, eventos, rankings e permissões.

A planilha privada `VoeTupper | Diretório e Onboarding ES`, mantida no Google Drive da proprietária, é usada para onboarding, conferência, auditoria humana e contingência limitada. Ela não é o banco de sessão nem armazena a senha definitiva do usuário.

## Autenticação

O login preferencial é e-mail.

O onboarding pode usar uma senha temporária definida fora do repositório. O primeiro acesso exige troca de senha. A senha definitiva é gerenciada pelo provedor de autenticação e nunca é escrita em Google Sheets, GitHub, logs ou assets públicos.

Contas sem e-mail confirmado podem existir como perfis da rede, mas permanecem sem acesso autenticável.

## Segurança

O sistema usa defesa em profundidade:

1. autenticação identifica a conta;
2. `auth_identities` liga a conta a uma pessoa;
3. `memberships` determina papel e escopo atual;
4. RLS filtra dados no banco;
5. views agregadas entregam comparação entre pares sem revelar tabelas brutas de terceiros;
6. `audit_log` registra mudanças sensíveis;
7. testes de segurança impedem permissões abertas e vazamento acidental de segredos.

Nunca confiar em esconder componentes no frontend como mecanismo de autorização.

Leia [`SECURITY.md`](./SECURITY.md) antes de alterar autenticação, schema, políticas ou integrações.

## Produto

A navegação principal é:

```text
Hoje | Rede | Pedidos | Perfil
```

`Rede` concentra:

```text
Mural | Ranking | Árvore | Grupos
```

Metas são entidades independentes. Vendas, recrutamento, ativação, retenção e desenvolvimento de Líderes não devem ser comprimidos em um único indicador financeiro.

## Design

A direção visual é mobile-first, rosa, clara e reconhecível. A interface prioriza:

- superfícies brancas;
- rosa como identidade forte;
- cards de baixa densidade visual;
- tipografia legível;
- ícones simples;
- alvos de toque com pelo menos 44 px;
- safe area correta no iPhone;
- desktop mais denso sem virar dashboard corporativo genérico.

O produto não copia layouts, assets ou identidade visual protegida de terceiros.

## Estrutura do repositório

```text
src/app                 App Router
src/components          UI e fluxos
src/lib/domain          regras puras de negócio e governança
src/lib/auth            estado de autenticação
src/lib/supabase        clientes e configuração
src/lib/data            acesso a dados por escopo
supabase/migrations     schema e RLS versionados
supabase/seed.sql       estrutura inicial sanitizada
scripts                 validações e utilitários de release
docs                    arquitetura, segurança, migrações e specs
```

## Desenvolvimento local

```bash
npm install
npm run dev
```

Verificação mínima antes de qualquer merge:

```bash
npm test
npm run typecheck
npm run build
```

A branch multiusuário deve compilar mesmo sem um backend configurado, mas não deve fingir que autenticação está disponível quando as variáveis públicas do Supabase estiverem ausentes.

## Ambiente

Copie `.env.example` para `.env.local` e preencha apenas no ambiente local ou no provedor de deploy.

Nunca commitar:

- `.env*` reais;
- service-role keys;
- tokens;
- exportações da operação;
- CPF, telefone ou e-mail sem necessidade de fixture sanitizada;
- senha temporária ou definitiva;
- credenciais de portais de terceiros.

## Deploy e release gate

O piloto atual pode continuar no GitHub Pages enquanto a arquitetura multiusuário é construída em paralelo.

A versão multiusuário só pode substituir o piloto quando:

- projeto Supabase real estiver configurado;
- migrations estiverem aplicadas;
- RLS estiver validada;
- fluxo de login e troca obrigatória funcionar;
- dados Serra tiverem sido migrados e reconciliados;
- testes, typecheck e build estiverem verdes;
- revisão de segurança tiver sido concluída;
- não houver segredo ou PII em assets públicos.

O roadmap e os critérios de promoção entre fases estão em [`ROADMAP.md`](./ROADMAP.md).

## Auditoria

Mudanças de papel, promoção, migração de grupo, alteração de Distrito, criação ou bloqueio de acesso, alterações de meta e importações em massa devem ser auditáveis.

Decisões de schema, política de acesso e novos níveis hierárquicos exigem revisão explícita. Veja [`GOVERNANCE.md`](./GOVERNANCE.md).

## Independência

VoeTupper é um software independente. Não é afiliado, patrocinado ou endossado pela Tupperware ou por qualquer outra empresa de venda direta. Integrações com sistemas externos devem respeitar termos de uso, propriedade intelectual e proteção de dados.

## Roadmap

A estratégia é deliberadamente incremental: primeiro provar operação e governança em Serra, depois tornar Espírito Santo multiusuário, e só então preparar expansão para outras Distribuições.

Não escalar um modelo de permissão que ainda não foi provado com dados reais.
