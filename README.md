# Fit360 - Sistema de Gestão para Profissionais de Fitness

## 📋 Visão Geral

O **Fit360** é um CRM completo para profissionais de fitness (personal trainers, nutricionistas, fisioterapeutas). O sistema permite gerenciar alunos, criar protocolos de treino/dieta, comunicar via WhatsApp, controlar finanças e gamificar a experiência do aluno.

---

## 🏗️ Arquitetura

### Stack Tecnológico

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Estilização** | Tailwind CSS + CSS Variables |
| **Estado** | React Query (TanStack Query) + Context API |
| **Backend** | Supabase (PostgreSQL + Auth + RLS) |
| **WhatsApp** | Evolution API v2 |
| **Pagamentos** | Stripe |
| **Animações** | Framer Motion |
| **Drag & Drop** | @hello-pangea/dnd |

### Estrutura de Pastas

```
src/
├── components/          # Componentes reutilizáveis
│   ├── chat/            # ConnectionManager, ChatWindow
│   ├── financial/       # Componentes financeiros
│   ├── gamification/    # Badges, Rewards, LeaderboardTab
│   ├── kanban/          # KanbanBoard, KanbanColumn
│   ├── marketing/       # PlansManager, CampaignsManager
│   ├── modals/          # Modais diversos
│   ├── protocols/       # Editor de protocolos
│   ├── schedule/        # Agenda
│   ├── student/         # Componentes do portal do aluno
│   ├── students/        # StudentKanbanCard, ExcelImportModal, etc.
│   ├── superadmin/      # Dashboard do superadmin
│   └── ui/              # Componentes base (Button, Card, etc.)
├── contexts/            # React Contexts
│   ├── AuthContext.tsx  # Autenticação e sessão
│   ├── ChatContext.tsx  # Estado do chat WhatsApp
│   └── ThemeContext.tsx # Tema claro/escuro
├── data/                # Dados mockados para desenvolvimento
├── hooks/               # Custom hooks React Query
│   ├── useStudents.ts   # CRUD de alunos
│   ├── useProtocols.ts  # CRUD de protocolos
│   ├── usePayments.ts   # CRUD de pagamentos
│   └── useStudentInsights.ts # Insights e métricas
├── lib/                 # Configurações e tipos
│   ├── supabase.ts      # Cliente Supabase
│   └── database.types.ts # Tipos TypeScript do banco
├── pages/               # Páginas da aplicação
│   ├── auth/            # Login, Registro
│   ├── student/         # Portal do aluno
│   └── superadmin/      # Painel superadmin
├── services/            # Serviços de API
│   ├── evolutionService.ts  # WhatsApp Evolution API
│   ├── stripeService.ts     # Pagamentos Stripe
│   ├── aiService.ts         # Serviço de IA
│   └── whatsappService.ts   # Mensagens WhatsApp
└── types/               # Tipagens TypeScript
```

---

## 📱 Páginas Principais

### Área do Profissional (`/admin/*`)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/admin/dashboard` | Dashboard.tsx | Visão geral, métricas, gráficos |
| `/admin/alunos` | Students.tsx | Kanban de alunos por plano |
| `/admin/student/:id` | StudentProfile.tsx | Perfil detalhado do aluno |
| `/admin/protocolos` | Protocols.tsx | Lista de protocolos |
| `/admin/protocolo/:id` | ProtocolEditor.tsx | Editor de treinos/dietas |
| `/admin/mensagens` | Messages.tsx | Chat WhatsApp integrado |
| `/admin/financeiro` | Financial.tsx | Controle financeiro |
| `/admin/marketing` | Marketing.tsx | Campanhas e planos |
| `/admin/biblioteca` | Library.tsx | Exercícios, Alimentos, Documentos |
| `/admin/anotacoes` | Notes.tsx | Anotações e histórico |
| `/admin/agenda` | Schedule.tsx | Agendamento de sessões |
| `/admin/relatorios` | Reports.tsx | Relatórios e analytics |
| `/admin/gamificacao` | Gamification.tsx | Sistema de badges e recompensas |
| `/admin/configuracoes` | Settings.tsx | Configurações da conta |

### Área do Aluno (`/student/*`)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/student/dashboard` | StudentDashboard.tsx | Dashboard do aluno |
| `/student/treino` | WorkoutView.tsx | Visualização do treino |
| `/student/dieta` | DietView.tsx | Visualização da dieta |
| `/student/evolucao` | ProgressView.tsx | Gráficos de evolução |
| `/student/perfil` | StudentProfilePage.tsx | Perfil pessoal |

### Páginas Públicas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | LandingPage.tsx | Página inicial |
| `/login` | LoginPro.tsx | Login do profissional |
| `/anamnese/:id` | AnamnesePublic.tsx | Formulário de anamnese |
| `/checkout/:planId` | Checkout.tsx | Checkout de pagamento |

---

## 🗄️ Banco de Dados (Supabase)

### Tabelas Principais

#### `professionals`
```sql
id UUID PRIMARY KEY
email TEXT UNIQUE NOT NULL
name TEXT NOT NULL
phone TEXT
avatar_url TEXT
business_name TEXT
specialty TEXT  -- 'personal' | 'nutricionista' | 'fisioterapeuta'
created_at TIMESTAMPTZ
```

#### `students`
```sql
id UUID PRIMARY KEY
professional_id UUID REFERENCES professionals(id)
name TEXT NOT NULL
email TEXT NOT NULL
phone TEXT
avatar_url TEXT
goal TEXT
status TEXT DEFAULT 'active'  -- 'active' | 'inactive' | 'paused'
plan_type TEXT  -- 'mensal' | 'trimestral' | 'semestral' | 'anual'
plan_start DATE
plan_end DATE
weight DECIMAL
height DECIMAL
birth_date DATE
gender TEXT  -- 'male' | 'female'
notes TEXT
health_conditions TEXT[]
injuries TEXT[]
medications TEXT[]
streak_days INTEGER DEFAULT 0
xp_points INTEGER DEFAULT 0
custom_data JSONB  -- Campos personalizados
created_at TIMESTAMPTZ
```
**UNIQUE CONSTRAINT**: `(professional_id, email)`

#### `protocols`
```sql
id UUID PRIMARY KEY
professional_id UUID REFERENCES professionals(id)
student_id UUID REFERENCES students(id)
type TEXT NOT NULL  -- 'workout' | 'diet' | 'both'
name TEXT NOT NULL
description TEXT
content JSONB  -- Estrutura do protocolo
is_template BOOLEAN DEFAULT false
status TEXT DEFAULT 'draft'  -- 'draft' | 'active' | 'archived'
starts_at DATE
ends_at DATE
created_at TIMESTAMPTZ
```

#### `payments`
```sql
id UUID PRIMARY KEY
professional_id UUID REFERENCES professionals(id)
student_id UUID REFERENCES students(id)
amount DECIMAL NOT NULL
status TEXT DEFAULT 'pending'  -- 'pending' | 'completed' | 'failed'
payment_method TEXT  -- 'pix' | 'credit_card' | 'boleto'
stripe_payment_id TEXT
paid_at TIMESTAMPTZ
due_date DATE
created_at TIMESTAMPTZ
```

### Row Level Security (RLS)

Todas as tabelas usam RLS. A função principal é:
```sql
CREATE OR REPLACE FUNCTION get_my_professional_id()
RETURNS UUID AS $$
  SELECT id FROM professionals WHERE auth.uid() = id
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

Políticas padrão:
- Profissional vê apenas seus próprios dados
- Aluno vê apenas seus próprios dados
- Dados de alunos só são acessíveis pelo profissional dono

---

## 🔌 Integrações

### Evolution API (WhatsApp)

**Configuração**: `src/config/evolution.ts`
```typescript
export const evolutionConfig = {
    baseUrl: import.meta.env.VITE_EVOLUTION_API_URL,
    apiKey: import.meta.env.VITE_EVOLUTION_API_KEY,
    defaultInstance: import.meta.env.VITE_EVOLUTION_INSTANCE,
};
```

**Serviço**: `src/services/evolutionService.ts`

| Método | Descrição |
|--------|-----------|
| `createInstance(name)` | Cria nova instância WhatsApp |
| `deleteInstance(name)` | Remove instância |
| `getQRCode(name)` | Gera QR Code para conexão |
| `getConnectionState(name)` | Verifica status (open/close/connecting) |
| `sendText(to, message)` | Envia mensagem de texto |
| `sendMedia(to, url, caption)` | Envia mídia |
| `logoutInstance(name)` | Desconecta instância |
| `fetchChats()` | Busca conversas |
| `fetchMessages(chatId)` | Busca mensagens de um chat |

### Stripe (Pagamentos)

**Serviço**: `src/services/stripeService.ts`

| Método | Descrição |
|--------|-----------|
| `createCheckoutSession(plan)` | Cria sessão de checkout |
| `createPaymentIntent(amount)` | Cria intent de pagamento |
| `getPaymentStatus(id)` | Verifica status do pagamento |

---

## 🪝 Hooks (React Query)

### `useStudents.ts`

```typescript
// Listar todos os alunos
const { data: students, isLoading } = useStudents();

// Buscar aluno por ID
const { data: student } = useStudent(id);

// Criar aluno
const createStudent = useCreateStudent();
await createStudent.mutateAsync({ name, email, phone });

// Atualizar aluno
const updateStudent = useUpdateStudent();
await updateStudent.mutateAsync({ id, updates: { name: 'Novo Nome' } });

// Excluir aluno
const deleteStudent = useDeleteStudent();
await deleteStudent.mutateAsync(id);
```

### `useProtocols.ts`

```typescript
// Listar protocolos
const { data: protocols } = useProtocols();

// Criar protocolo
const createProtocol = useCreateProtocol();
await createProtocol.mutateAsync({ name, type, content });

// Atualizar protocolo
const updateProtocol = useUpdateProtocol();
await updateProtocol.mutateAsync({ id, updates });
```

### `usePayments.ts`

```typescript
// Listar pagamentos
const { data: payments } = usePayments();

// Criar pagamento
const createPayment = useCreatePayment();
await createPayment.mutateAsync({ student_id, amount, due_date });
```

---

## 🔒 Autenticação

### AuthContext

```typescript
const { user, professional, role, signIn, signUp, signOut } = useAuth();

// Login
await signIn(email, password);

// Cadastro
await signUp(email, password, { name, specialty });

// Logout
await signOut();

// Verificar role
if (role === 'professional') { ... }
if (role === 'student') { ... }
if (role === 'superadmin') { ... }
```

---

## 🎨 Temas e Estilos

### CSS Variables (`src/index.css`)

```css
:root {
    --primary-500: #10B981;  /* Cor principal */
    --primary-600: #059669;
    --background: #FAFAFA;
    --foreground: #0F172A;
    --card: #FFFFFF;
    --muted-foreground: #666666;
}

.dark {
    --background: #0F172A;
    --foreground: #F8FAFC;
    --card: #1E293B;
    --muted-foreground: #B8B8B8;
}
```

### ThemeContext

```typescript
const { theme, setTheme } = useTheme();
setTheme('light' | 'dark' | 'system');
```

---

## 📥 Importação de Alunos (Excel)

### Fluxo de 4 Etapas
1. **Upload**: Selecionar arquivo Excel/CSV
2. **Mapeamento**: Associar colunas da planilha aos campos do sistema
3. **Preview**: Visualizar dados antes de importar
4. **Resultado**: Resumo de sucesso/falhas

### Campos Suportados
- `name` - Nome do aluno
- `email` - Email (obrigatório)
- `phone` - Telefone
- `goal` - Objetivo
- `weight` - Peso (kg)
- `height` - Altura (cm)
- `birth_date` - Data de nascimento
- `gender` - Gênero (male/female)
- `plan_type` - Tipo de plano
- `notes` - Observações

### Campos Personalizados
O sistema suporta campos personalizados via coluna `custom_data` (JSONB).

---

## ⚙️ Variáveis de Ambiente

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Evolution API (WhatsApp)
VITE_EVOLUTION_API_URL=https://api.evolution.com
VITE_EVOLUTION_API_KEY=sua-api-key
VITE_EVOLUTION_INSTANCE=fitpro-main

# Stripe (opcional)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🚀 Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar dev server
npm run dev

# Build de produção
npm run build

# Lint
npm run lint

# Preview do build
npm run preview
```

---

## 📊 Métricas e KPIs

O Dashboard exibe:
- Total de alunos ativos
- Receita mensal
- Taxa de retenção
- Alunos com plano expirando
- Gráfico de evolução de alunos
- Top alunos por aderência

---

## 🎮 Gamificação

### Sistema de XP
- Check-in diário: +10 XP
- Completar treino: +50 XP
- Streak de 7 dias: +100 XP

### Badges
- 🥉 Iniciante (0-100 XP)
- 🥈 Intermediário (100-500 XP)
- 🥇 Avançado (500-1000 XP)
- 💎 Elite (1000+ XP)

---

## 🔧 Solução de Problemas

### Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `duplicate key value` | Aluno já existe | Import usa upsert |
| `PGRST301` | RLS bloqueando | Verificar políticas RLS |
| `Evolution 500` | Problema no servidor Evolution | Verificar status da API |
| `custom_data column not found` | Migração não executada | Executar `003_custom_fields.sql` |

---

## 📅 Migrações Pendentes

Execute no SQL Editor do Supabase:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_additional_tables.sql`
3. `supabase/migrations/003_custom_fields.sql`

---

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Console do navegador (F12)
2. Logs do Supabase (Dashboard > Logs)
3. Status da Evolution API
