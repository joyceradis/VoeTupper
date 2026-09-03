# VoeTupper Rede Social MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evoluir o piloto estático do VoeTupper para uma rede operacional inspirada na lógica social do Orkut, preservando a simplicidade mobile, o fluxo de pedidos e a privacidade entre pares.

**Architecture:** A versão publicada no GitHub Pages continuará usando `app.js` como núcleo operacional e `product-v6.js` como camada progressiva. A nova camada social será implementada como extensão compatível do estado local existente: perfis e papéis, metas múltiplas, árvore, ranking, mural derivado e navegação `Hoje | Rede | Pedidos | Perfil`. O fechamento continuará acessível pela Home e pelo fluxo de pedidos, sem ocupar uma aba fixa.

**Tech Stack:** JavaScript estático, HTML/CSS, localStorage/sessionStorage, PWA service worker, Vitest para contratos estáticos, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-03-voe-tupper-rede-social-design.md`

## Global Constraints

- Não usar travessão em microcopy visível ao usuário.
- Manter rosa apenas como identidade e acento, sem aparência de dashboard genérico.
- Priorizar uso em iPhone e respeitar `safe-area-inset-bottom`.
- Não expor CPF, telefone, código, senha, pedidos ou valores detalhados entre pares.
- Não inventar nomes de líderes ou vínculos inexistentes. Registros sem papel confirmado permanecem como revendedoras/consultoras até edição humana.
- O botão externo deve usar rótulo neutro `Abrir Tupperware` e URL configurável, sem acoplamento visual ao portal antigo.
- Metas devem aceitar tipos diferentes, incluindo vendas e recrutamento. O piloto deve iniciar com meta de recrutamento 45 e progresso editável/derivável sem inventar realizados.
- Preservar Pedidos e Fechamento já existentes.

---

### Task 1: Contrato de produto e regressão

**Files:**
- Modify: `src/static-pilot.test.ts`

**Interfaces:**
- Consumes: assets estáticos atuais.
- Produces: contrato verificável para navegação, metas, Rede, Perfil, portal configurável, microcopy e safe area.

- [ ] **Step 1: Write the failing tests**

Adicionar testes que exijam:

```ts
expect(product).toContain("['today','Hoje']")
expect(product).toContain("['network','Rede']")
expect(product).toContain("['orders','Pedidos']")
expect(product).toContain("['profile','Perfil']")
expect(product).toContain('Mural')
expect(product).toContain('Ranking')
expect(product).toContain('Árvore')
expect(product).toContain('Meta de recrutamento')
expect(product).toContain('target:45')
expect(product).toContain('Abrir Tupperware')
expect(productCss).toContain('safe-area-inset-bottom')
expect(product).not.toContain('Distrito Grande Vitória</span><strong>Gerusa</strong></div><div class="vt6-network-branch"><span>Vitoriaware')
expect(bundle).not.toContain('—')
```

Também manter os testes existentes de pedido, fechamento, credenciais e scripts parseáveis.

- [ ] **Step 2: Run CI and verify RED**

Abrir PR da branch contra `main` para disparar CI. Esperado: `npm test` falha especificamente nos novos contratos ainda não implementados.

- [ ] **Step 3: Commit tests**

Commit: `test: define rede social mobile contract`

---

### Task 2: Estado compatível, papéis e metas múltiplas

**Files:**
- Modify: `product-v6.js`

**Interfaces:**
- Consumes: `state.workspace`, `state.consultants`, `state.orders`.
- Produces: `state.social`, `state.goals`, normalização de `role`, utilitários de metas e contagens.

- [ ] **Step 1: Implement minimal state migration**

Criar migração idempotente que preserve dados existentes e acrescente:

```js
state.social ??= { portalUrl: VT6_DEFAULT_EXTERNAL_URL };
state.goals ??= [
  {id:'sales', type:'sales', label:'Vendas', target:Number(state.workspace.goal)||0, current:null, unit:'BRL'},
  {id:'recruitment', type:'recruitment', label:'Novas consultoras', target:45, current:0, unit:'people'}
];
```

Normalizar cada pessoa com `role` igual a `leader` ou `consultant`, usando `consultant` como padrão seguro.

- [ ] **Step 2: Add goal helpers**

Adicionar funções puras para meta atual, percentual, progresso e edição sem misturar faturamento com recrutamento.

- [ ] **Step 3: Extend consultant form**

Adicionar seletor `Papel na rede` com opções `Revendedora / Consultora` e `Líder`, preservando os demais campos.

- [ ] **Step 4: Verify tests**

Esperado: contratos de metas e papel passam; demais testes permanecem verdes.

- [ ] **Step 5: Commit**

Commit: `feat: add social roles and multi-goal state`

---

### Task 3: Navegação mobile e portal configurável

**Files:**
- Modify: `product-v6.js`
- Modify: `product-v6.css`

**Interfaces:**
- Produces: navegação `Hoje | Rede | Pedidos | Perfil`, acesso a Fechamento via Home, botão `Abrir Tupperware`.

- [ ] **Step 1: Override navigation and rendering**

Criar `vt6Nav()` e renderização explícita de `network` e `profile`. Manter `closing` como rota interna acessada por botão.

- [ ] **Step 2: Replace quick actions**

Usar quatro ações claras:

```text
Novo pedido
Fechamento
Abrir Tupperware
Rede
```

- [ ] **Step 3: Make external URL configurable**

Usar `state.social.portalUrl || VT6_DEFAULT_EXTERNAL_URL`; nunca depender do texto `Tupper.NET` para navegação principal.

- [ ] **Step 4: Fix bottom navigation ergonomics**

No CSS, garantir área de toque mínima de 44px, ícones simples, texto legível e:

```css
padding-bottom: calc(10px + env(safe-area-inset-bottom));
```

- [ ] **Step 5: Verify tests and commit**

Commit: `feat: simplify mobile navigation and external access`

---

### Task 4: Home orientada a ação, metas e rede

**Files:**
- Modify: `product-v6.js`
- Modify: `product-v6.css`

**Interfaces:**
- Produces: Home compacta, metas múltiplas e resumo de rede.

- [ ] **Step 1: Compact empty state**

Quando não houver pendências, substituir o card alto por um estado curto `Tudo certo por enquanto` e `Nenhum pedido pendente`.

- [ ] **Step 2: Add goals card**

Renderizar vendas e recrutamento separadamente. Não mostrar `R$ 0,00` como foco principal quando não houver produção.

- [ ] **Step 3: Add network snapshot**

Mostrar líderes confirmadas, consultoras ativas, novas do ciclo quando informadas e botão para Rede.

- [ ] **Step 4: Keep recent orders compact**

Mostrar pedidos recentes somente quando existirem; caso contrário, usar uma linha de estado vazio curta.

- [ ] **Step 5: Verify tests and commit**

Commit: `feat: make home action and goals focused`

---

### Task 5: Rede, mural, ranking e árvore

**Files:**
- Modify: `product-v6.js`
- Modify: `product-v6.css`

**Interfaces:**
- Produces: `networkView()`, `vt6Wall()`, `vt6Ranking()`, `vt6Tree()`.

- [ ] **Step 1: Build Rede surface**

Criar segmentos `Mural`, `Ranking`, `Árvore` dentro da tela Rede, com estado local da aba selecionada.

- [ ] **Step 2: Correct canonical hierarchy**

A árvore deve representar visualmente:

```text
Distrito Grande Vitória
Gerusa
Serra
Ritheli Radis de Souza de Oliveira, Empresária
Líderes confirmadas
Revendedoras vinculadas
```

`Vitoriaware` pode aparecer como identidade da operação, nunca como nó entre Gerusa e Ritheli.

- [ ] **Step 3: Build ranking among leaders only**

Comparar somente registros `role === 'leader'`. Calcular indicadores apenas a partir de dados presentes. Quando não houver produção comparável, mostrar `Ainda não há dados suficientes para o ranking`.

- [ ] **Step 4: Build automatic wall**

Derivar movimentos seguros dos dados existentes, como meta atingida, novo pedido, nova consultora informada ou mudança de ranking. Sem postagens manuais no MVP.

- [ ] **Step 5: Verify tests and commit**

Commit: `feat: add network wall ranking and tree`

---

### Task 6: Perfil e conquistas

**Files:**
- Modify: `product-v6.js`
- Modify: `product-v6.css`

**Interfaces:**
- Produces: perfil da Empresária e perfis resumidos de líderes/consultoras.

- [ ] **Step 1: Create current profile**

Perfil da Empresária Serra deve mostrar nome, papel, praça, metas, tamanho da rede e conquistas derivadas.

- [ ] **Step 2: Add member profile cards**

Perfis de líderes vistos pela Empresária podem abrir detalhes operacionais autorizados. A camada visual deve estar preparada para, futuramente, limitar pares a indicadores agregados.

- [ ] **Step 3: Add achievements**

Conquistas só aparecem quando suportadas por dados. Sem badges fictícios.

- [ ] **Step 4: Verify tests and commit**

Commit: `feat: add network profiles and achievements`

---

### Task 7: PWA cache, regressão e publicação segura

**Files:**
- Modify: `index.html`
- Modify: `sw.js`
- Modify: `src/static-pilot.test.ts`

**Interfaces:**
- Produces: versão de assets atualizada e cache PWA renovado.

- [ ] **Step 1: Bump asset query version**

Atualizar `product-v6.css` e `product-v6.js` para `v=7`.

- [ ] **Step 2: Bump service worker cache**

Atualizar chave de cache para evitar que o iPhone da usuária permaneça com shell antigo.

- [ ] **Step 3: Run full CI**

Esperado:

```text
npm test PASS
npm run typecheck PASS
npm run build PASS
```

- [ ] **Step 4: Review diff for privacy and microcopy**

Confirmar que não existe senha, CPF, telefone ou credencial nova em texto público e que a microcopy visível não contém travessão.

- [ ] **Step 5: Merge only after green CI**

Atualizar a versão pública somente quando todos os checks estiverem verdes.
