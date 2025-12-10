Papel:
Você é o Tech Lead responsável por revisar o Fit360 como um todo e deixá-lo pronto para produção (shippable), com foco em qualidade, UX e consistência.

Contexto do projeto:
- Áreas:
  - Admin: /admin/dashboard, /admin/alunos, /admin/student/:id, /admin/protocolos, /admin/protocolo/:id, /admin/mensagens, /admin/financeiro, /admin/marketing, /admin/biblioteca, /admin/anotacoes, /admin/agenda, /admin/relatorios, /admin/gamificacao, /admin/configuracoes.
  - Student: /student/dashboard, /student/treino, /student/dieta, /student/evolucao, /student/perfil.
  - Públicas: /, /login, /anamnese/:id, /checkout/:planId.
- Contexts principais:
  - AuthContext.tsx, ChatContext.tsx, ThemeContext.tsx.
- Integracões: Supabase, Evolution API, Stripe.
- Estilos: Tailwind + CSS Variables em src/index.css.

Objetivo geral:
Passar um “pente fino” geral:
- Garantir proteção de rotas por autenticação e roles.
- Melhorar UX (loading, erros, toasts).
- Verificar consistência de tema/claro/escuro.
- Criar um checklist de lançamento.

Tarefas detalhadas:

1. Autenticação e proteção de rotas
- Revisar AuthContext.tsx e rotas:
  - Garantir que rotas /admin/* exigem role 'professional' ou 'superadmin'.
  - Rotas /student/* exigem role 'student'.
  - Rotas públicas não exigem login.
- Verificar redirecionamentos:
  - Após login do profissional → /admin/dashboard.
  - Após login do aluno → /student/dashboard.
  - Após logout → /login ou landing page.

2. UX de carregamento e erros
- Revisar páginas que usam React Query (students, protocolos, financeiro, mensagens, etc.).
- Garantir:
  - Estados de loading visíveis (spinners, skeletons ou placeholders).
  - Mensagens de erro amigáveis ao usuário (sem mostrar detalhes técnicos).
- Preferir padronizar componentes de loading e de erro em src/components/ui.

3. Tema e estilos
- Revisar ThemeContext.tsx e src/index.css:
  - Garantir que o toggle de tema (light/dark/system) funciona em páginas-chave.
  - Verificar contraste de cores, principalmente:
    - background, foreground, card, muted-foreground, primary-500/600.
- Ajustar classes Tailwind onde necessário para manter consistência visual no dashboard, alunos, protocolos, financeiro e mensagens.

4. Performance e organização
- Identificar pontos óbvios de otimização:
  - Evitar re-fetch desnecessário de dados que poderiam ser cacheados.
  - Evitar renders pesadas em listas grandes (ex: alunos, mensagens, pagamentos), usando memoização quando fizer sentido.
- Verificar se há console.log desnecessário e removê-los.

5. Documentação e checklist
- Criar docs/fit360-launch-checklist.md contendo:
  - Variáveis de ambiente obrigatórias (Supabase, Evolution API, Stripe).
  - Migrações Supabase que devem estar aplicadas.
  - Fluxos críticos testados:
    - Login profissional e aluno.
    - Criar/editar aluno.
    - Criar/ativar protocolo e aluno visualizando treino/dieta.
    - Criar cobrança, pagar (Stripe) e ver no dashboard.
    - Conectar WhatsApp, enviar mensagem manual, ver conversas.
- Adicionar notas sobre qualquer limitação conhecida ou dívida técnica.

Políticas e modo de trabalho:
- Sempre gerar Implementation Plan antes de fazer alterações grandes.
- Priorizar mudanças que aumentem qualidade sem reescrever o sistema inteiro.
- Comentar no código apenas quando a intenção não for óbvia.
