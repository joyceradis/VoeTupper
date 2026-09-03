# VoeTupper Roadmap

Este roadmap usa gates de promoção. Uma fase não é considerada concluída porque a interface existe. Ela termina quando os critérios operacionais, de dados e de segurança foram comprovados.

## Princípios de execução

1. Governança antes de escala.
2. Identidade antes de gamificação ampla.
3. Dados agregados entre pares, dados detalhados somente no próprio escopo.
4. Migração com reconciliação humana para ambiguidades.
5. Segurança no banco, não apenas na interface.
6. Nenhum release multiusuário sem rollback e auditoria.

## Fase 0 | Piloto Serra

**Objetivo:** provar utilidade operacional em ambiente controlado.

**Escopo:** Hoje, Pedidos, Fechamento, Rede, metas, perfis e árvore local.

**Gate de saída:**

- fluxo usado em celular real;
- pedidos e fechamento compreensíveis sem treinamento técnico;
- hierarquia Serra validada;
- problemas de navegação mobile corrigidos;
- nenhum dado sensível publicado em GitHub.

**Status:** em operação e aprendizado.

## Fase 1 | Identidade e governança ES

**Objetivo:** transformar organograma em modelo de autorização.

**Entregas:**

- Distribuição ES;
- seis Distritos;
- `person_id` único;
- memberships historizadas;
- promoção Consultora para Líder sem duplicação;
- matriz Distribuição, Empresária, Líder e Consultora;
- planilha administrativa de onboarding no Drive.

**Gate de saída:**

- testes de governança verdes;
- nenhum caso autorizado depende de comparação numérica de cargo;
- promoção preserva identidade;
- seis Empresárias reconciliadas com dados confirmados.

## Fase 2 | Auth + RLS

**Objetivo:** tornar as regras de acesso obrigatórias no backend.

**Entregas:**

- Supabase Auth por e-mail;
- senha temporária apenas para primeiro acesso;
- troca obrigatória;
- recuperação por e-mail;
- schema Postgres;
- RLS em todas as tabelas de negócio;
- views agregadas para comparação entre pares;
- audit log.

**Gate de saída:**

- migrations aplicadas em projeto real;
- testes de acesso cruzado executados;
- Empresária não consegue consultar detalhe de outro Distrito;
- Líder não consegue consultar outro grupo;
- Consultora não consegue acessar métricas superiores;
- nenhuma service-role key chega ao browser.

## Fase 3 | Migração Serra

**Objetivo:** substituir o estado local do piloto por dados persistentes reconciliados.

**Entregas:**

- importador do legado;
- deduplicação conservadora;
- relatório de conflitos;
- vínculos Líder e grupo confirmados;
- pedidos e metas persistentes;
- rollback documentado.

**Gate de saída:**

- contagem de pessoas reconciliada;
- zero duplicação conhecida por promoção;
- conflitos ambíguos resolvidos manualmente;
- operação Serra executada no backend por um ciclo real.

## Fase 4 | Rede social confiável

**Objetivo:** fazer Mural, Ranking, Árvore, Grupos e Conquistas refletirem dados reais e autorizados.

**Entregas:**

- ranking Empresária x Empresária por agregados;
- ranking Líder x Líder no próprio Distrito;
- mural por escopo;
- conquistas derivadas;
- perfis role-aware;
- promoção e emancipação de grupo na interface.

**Gate de saída:**

- nenhum card social revela dado operacional fora do escopo;
- indicadores possuem origem auditável;
- estados sem dados não inventam ranking;
- testes de UI cobrem os quatro papéis.

## Fase 5 | E-mail e notificações

**Objetivo:** reduzir dependência de acompanhamento manual.

**Entregas:**

- convite de acesso;
- recuperação de senha;
- alertas de fechamento;
- notificações de metas e promoções;
- preferências por usuário;
- opt-out onde aplicável.

**Gate de saída:**

- domínio/remetente configurado;
- bounce e falhas observáveis;
- nenhum e-mail contém dado além do necessário;
- notificações podem ser desativadas conforme política.

## Fase 6 | Auditoria e observabilidade

**Objetivo:** operar com evidência, não por suposição.

**Entregas:**

- eventos de segurança;
- trilha de mudança de papel;
- logs sem PII desnecessária;
- alertas de erro;
- métricas de adoção e operação;
- backup e restore testados.

**Gate de saída:**

- incidente simulado com procedimento documentado;
- restauração testada;
- dashboards não armazenam conteúdo de pedidos ou credenciais.

## Fase 7 | Outras Distribuições

**Objetivo:** provar que o modelo suporta múltiplos estados sem quebrar isolamento.

**Pré-condição:** ES estabilizado por ciclos reais.

**Entregas:**

- onboarding de nova Distribuição;
- configuração territorial;
- isolamento entre estados;
- regras parametrizadas sem fork de código;
- importação assistida.

**Gate de saída:**

- testes multi-distribuição;
- nenhuma política assume Espírito Santo como caso especial;
- operação de pelo menos duas Distribuições sem vazamento de escopo.

## Fase 8 | Governança nacional

**Objetivo:** preparar administração nacional sem centralizar dados indevidamente.

**Entregas potenciais:**

- papel nacional;
- catálogo de políticas;
- delegação administrativa;
- auditoria de acessos privilegiados;
- scorecards nacionais agregados;
- gestão de versões de política.

**Gate de entrada:** esta fase só começa quando existir necessidade operacional real. Não será antecipada por estética de organograma.

## Critérios permanentes de release

Todo release candidato deve passar:

```text
npm test
npm run typecheck
npm run build
```

Além disso:

- migrations revisadas quando houver mudança de banco;
- RLS revisada quando houver novo recurso;
- segredo scan limpo;
- documentação atualizada;
- plano de rollback proporcional ao risco;
- CI verde no commit exato que será promovido.
