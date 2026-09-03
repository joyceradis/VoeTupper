# VoeTupper Governance

Governança define quem pode decidir, quem pode alterar, quem pode visualizar e como mudanças de alto impacto são auditadas.

## 1. Princípio central

**Administra dentro do próprio escopo. Compete apenas com pares autorizados. Não recebe inteligência gerencial de níveis superiores nem bastidores de outras árvores.**

A hierarquia organizacional não é uma licença automática para ler qualquer dado abaixo ou acima. A autorização depende do papel, do escopo atual e do tipo de recurso.

## 2. Papéis organizacionais

### Distribuição

Responsável por estrutura estadual, Distritos, Empresárias, metas estaduais, políticas e consolidação autorizada.

### Empresária

Responsável por um Distrito. Administra Líderes, grupos, Consultoras, pedidos, metas e movimentações daquele Distrito.

### Líder

Responsável por um grupo. Administra membros e operação do próprio grupo.

### Consultora

Responsável pelo próprio perfil e operação individual.

## 3. Hierarquia territorial

```text
Brasil
  Distribuição por estado
    Distrito
      Líder
        Grupo
          Consultora
```

No Espírito Santo, Gerusa representa a Distribuição ES. Os Distritos iniciais são Norte, Noroeste, Serra, Vitória, Vila Velha e Sul, e Cariacica.

## 4. Identidade

Uma pessoa possui um único `person_id`.

Papel é propriedade do vínculo atual, não da identidade. Promoção, transferência ou mudança de grupo nunca cria uma segunda pessoa.

Mudanças de vínculo devem registrar:

- valor anterior;
- valor novo;
- vigência;
- aprovador;
- motivo ou referência operacional quando necessário.

## 5. Matriz de visibilidade

| Observador | Detalhe próprio | Pares | Outros escopos | Nível superior |
| --- | --- | --- | --- | --- |
| Distribuição | Estrutura estadual | Empresárias por consolidado | Conforme política nacional futura | Não aplicável no piloto |
| Empresária | Distrito completo | Empresárias da mesma Distribuição por agregados | Sem composição interna | Institucional da Distribuição |
| Líder | Grupo completo | Líderes do mesmo Distrito por agregados | Sem composição interna | Sem métricas gerenciais da Empresária |
| Consultora | Próprios dados | Social do próprio nível quando habilitado | Sem dados operacionais | Sem inteligência gerencial |

## 6. Comparação entre pares

### Empresária x Empresária

Permitido:

- posição;
- percentual da meta;
- crescimento percentual;
- recrutamento agregado;
- ativação agregada;
- conquistas e badges.

Proibido:

- composição de Líderes e grupos;
- nomes de Consultoras;
- pedidos individuais;
- valores individuais;
- telefone, CPF, e-mail privado, código ou senha.

### Líder x Líder

Comparação somente dentro do mesmo Distrito e apenas por métricas agregadas aprovadas.

### Consultora x Consultora

Opcional e configurável por política do Distrito. Nunca libera métricas de Líder ou Empresária.

## 7. Autoridade para mudanças sensíveis

### Promoção Consultora → Líder

No piloto ES, a Empresária do Distrito pode iniciar e aprovar a promoção. A operação precisa selecionar explicitamente quais pessoas migram para o novo grupo.

### Transferência entre grupos

Líder pode solicitar ou operar dentro do próprio escopo conforme política do Distrito. Mudanças que cruzam grupos devem ser auditadas e respeitar autoridade da Empresária.

### Transferência entre Distritos

Exige decisão administrativa do nível responsável pelos dois escopos e registro de auditoria.

### Criação e bloqueio de acesso

Conta autenticável exige e-mail confirmado. Acesso é ligado a `person_id`, nunca criado como identidade paralela.

## 8. Governança técnica

Mudanças nas áreas abaixo exigem revisão antes do merge:

- schema do banco;
- RLS;
- autenticação;
- criação de papel novo;
- nova view agregada;
- importação em massa;
- código que manipula credenciais;
- mudança da hierarquia canônica;
- integração com fornecedor externo.

## 9. Fonte de verdade

Supabase Postgres é fonte de verdade do runtime multiusuário.

Google Drive é ferramenta administrativa para onboarding, conferência e auditoria humana. Divergências críticas devem ser reconciliadas em favor do banco após validação, nunca sobrescritas automaticamente pela planilha.

## 10. Segurança por desenho

O frontend pode decidir o que renderizar, mas não decide o que o usuário tem autorização para ler.

A sequência correta é:

```text
Auth → pessoa → membership → RLS → dado autorizado → UI
```

Rankings entre pares usam views agregadas específicas. O cliente não recebe tabela bruta de outro escopo para depois ocultar colunas.

## 11. Auditoria

Devem gerar `audit_log`:

- criação ou desativação de identidade;
- promoção;
- mudança de papel;
- migração de grupo;
- mudança de Distrito;
- alteração de meta;
- mudança de política;
- importação em massa;
- alteração administrativa de vínculo.

Logs não devem incluir senhas ou cópias desnecessárias de PII.

## 12. Processo de decisão de produto

Prioridade de decisão:

1. segurança e privacidade;
2. coerência com a operação real;
3. redução de trabalho;
4. clareza mobile;
5. gamificação e estética.

Uma funcionalidade social não entra se exigir exposição de dados que viole a governança.

## 13. Escala

A arquitetura pode crescer para outras Distribuições, mas nenhuma regra de acesso deve depender de nomes fixos do Espírito Santo.

Expansão nacional exige novo papel apenas quando houver necessidade operacional comprovada. O organograma não deve crescer antes do produto.
