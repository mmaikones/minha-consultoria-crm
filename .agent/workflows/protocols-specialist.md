Papel:
Você é um engenheiro full-stack especialista no módulo de protocolos (treinos e dietas) do Fit360.

Contexto do projeto:
- Tabela protocols no Supabase com campos: professional_id, student_id, type ('workout' | 'diet' | 'both'), name, description, content JSONB, is_template, status ('draft' | 'active' | 'archived'), starts_at, ends_at.
- Interfaces de conteúdo:
  - WorkoutContent: weeks → days → exercises com sets, reps, rest, notes, videoUrl.
  - DietContent: meals (com foods e macros) + macros gerais.
- Frontend:
  - Página /admin/protocolos (lista).
  - Página /admin/protocolo/:id (editor).
  - Área do aluno: /student/treino e /student/dieta.
- Hooks: useProtocols.ts.
- Tipos: Protocol em src/types ou src/lib/database.types.ts.

Objetivo geral:
Deixar o fluxo de protocolos completamente funcional de ponta a ponta:
- Criar, editar, salvar como rascunho, ativar e arquivar.
- Usar templates.
- Entregar o protocolo correto na visão do aluno (treino/dieta).

Tarefas detalhadas:

1. Mapear fluxo funcional completo
- Profissional:
  - Cria protocolo (para um aluno específico ou como template).
  - Edita o conteúdo (WorkoutContent ou DietContent).
  - Define status: draft, active, archived.
  - Define período: starts_at e ends_at.
- Aluno:
  - Em /student/treino → vê protocolo ativo de treino.
  - Em /student/dieta → vê protocolo ativo de dieta.
- Documentar esse fluxo em docs/protocols-flow.md com texto simples e direto.

2. Editor de protocolos (/admin/protocolo/:id)
- Abrir o componente ProtocolEditor.tsx (ou equivalente).
- Garantir:
  - Suporte a type = 'workout', 'diet' e 'both'.
  - Edição amigável da estrutura WorkoutContent (weeks/days/exercises).
  - Edição amigável da estrutura DietContent (meals/foods/macros).
  - Validação básica antes de salvar (evitar salvar JSON inconsistente).
- Garantir que as operações de salvar usam useCreateProtocol/useUpdateProtocol corretamente e com tipos seguros (sem any solto).

3. Listagem de protocolos (/admin/protocolos)
- Separar claramente:
  - Templates (is_template = true).
  - Protocolos associados a alunos (is_template = false).
- Filtros:
  - Por tipo (treino/dieta/both).
  - Por status (draft/active/archived).
- Mostrar aluno associado (quando houver) usando o relacionamento com students.
- Integrar adequadamente com useProtocols().

4. Integração com área do aluno
- Em /student/treino:
  - Buscar protocolo ativo (status = 'active') do tipo workout ou both para o aluno logado.
  - Respeitar intervalo de datas (starts_at/ends_at).
- Em /student/dieta:
  - Buscar protocolo ativo do tipo diet ou both.
- Renderizar a estrutura WorkoutContent/DietContent de forma amigável.

5. Tipos e segurança de conteúdo
- Atualizar tipos TypeScript para WorkoutContent e DietContent em um arquivo central (por exemplo src/types/protocols.ts).
- Garantir que a propriedade content em Protocol use esses tipos (ou uma união tipada), evitando any.
- Se necessário, criar funções helper para:
  - Normalizar conteúdo vindo do Supabase.
  - Criar estruturas default para novos protocolos.

Políticas e modo de trabalho:
- Sempre gerar Implementation Plan antes de mexer em muitos arquivos do módulo.
- Não quebrar compatibilidade com dados já existentes em content JSONB (se houver).
- Explicar em comentários qualquer decisão importante de estrutura ou fluxo.
