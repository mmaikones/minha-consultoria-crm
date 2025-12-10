# Fit360 API Reference

## Supabase Client

### Configuração
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

---

## Students API

### Listar Alunos
```typescript
const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('professional_id', professionalId)
    .order('name');
```

### Buscar Aluno por ID
```typescript
const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single();
```

### Criar Aluno
```typescript
const { data, error } = await supabase
    .from('students')
    .insert({
        professional_id: professionalId,
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11999999999',
        goal: 'Emagrecimento',
        plan_type: 'mensal',
        plan_start: '2024-01-01',
        plan_end: '2024-01-31',
        status: 'active'
    })
    .select()
    .single();
```

### Atualizar Aluno
```typescript
const { data, error } = await supabase
    .from('students')
    .update({
        name: 'João Silva Atualizado',
        goal: 'Hipertrofia'
    })
    .eq('id', studentId)
    .select()
    .single();
```

### Excluir Aluno
```typescript
const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', studentId);
```

### Upsert (Insert ou Update)
```typescript
const { data, error } = await supabase
    .from('students')
    .upsert(
        {
            professional_id: professionalId,
            email: 'joao@email.com',
            name: 'João Silva',
            // outros campos...
        },
        {
            onConflict: 'professional_id,email',
            ignoreDuplicates: false
        }
    );
```

---

## Protocols API

### Listar Protocolos
```typescript
const { data, error } = await supabase
    .from('protocols')
    .select(`
        *,
        student:students(id, name, email)
    `)
    .eq('professional_id', professionalId)
    .order('created_at', { ascending: false });
```

### Criar Protocolo
```typescript
const { data, error } = await supabase
    .from('protocols')
    .insert({
        professional_id: professionalId,
        student_id: studentId,
        type: 'workout', // 'workout' | 'diet' | 'both'
        name: 'Treino A - Push',
        description: 'Treino de empurrar',
        content: {
            weeks: [
                {
                    id: '1',
                    name: 'Semana 1',
                    days: [
                        {
                            id: 'day1',
                            name: 'Segunda',
                            exercises: [
                                {
                                    id: 'ex1',
                                    name: 'Supino Reto',
                                    sets: 4,
                                    reps: '10-12',
                                    rest: '90s'
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        status: 'draft',
        starts_at: '2024-01-01',
        ends_at: '2024-03-31'
    })
    .select()
    .single();
```

### Estrutura do Content (Treino)
```typescript
interface WorkoutContent {
    weeks: {
        id: string;
        name: string;
        days: {
            id: string;
            name: string;
            exercises: {
                id: string;
                name: string;
                sets: number;
                reps: string;
                rest: string;
                notes?: string;
                videoUrl?: string;
            }[];
        }[];
    }[];
}
```

### Estrutura do Content (Dieta)
```typescript
interface DietContent {
    meals: {
        id: string;
        name: string; // 'Café da Manhã', 'Almoço', etc.
        time: string; // '07:00'
        foods: {
            id: string;
            name: string;
            quantity: string;
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
        }[];
    }[];
    macros: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}
```

---

## Payments API

### Listar Pagamentos
```typescript
const { data, error } = await supabase
    .from('payments')
    .select(`
        *,
        student:students(id, name, email)
    `)
    .eq('professional_id', professionalId)
    .order('due_date', { ascending: false });
```

### Criar Pagamento
```typescript
const { data, error } = await supabase
    .from('payments')
    .insert({
        professional_id: professionalId,
        student_id: studentId,
        amount: 150.00,
        due_date: '2024-01-15',
        status: 'pending',
        payment_method: 'pix'
    })
    .select()
    .single();
```

### Marcar como Pago
```typescript
const { data, error } = await supabase
    .from('payments')
    .update({
        status: 'completed',
        paid_at: new Date().toISOString()
    })
    .eq('id', paymentId);
```

---

## Evolution API (WhatsApp)

### Instância Base
```typescript
import { evolutionService } from '../services/evolutionService';
```

### Criar Instância
```typescript
const result = await evolutionService.createInstance('minha-instancia');
// result: { instance: { instanceName: string, status: string } }
```

### Gerar QR Code
```typescript
const result = await evolutionService.getQRCode('minha-instancia');
// result: { base64: string, code: string }
```

### Verificar Status de Conexão
```typescript
const result = await evolutionService.getConnectionState('minha-instancia');
// result: { instance: { state: 'open' | 'close' | 'connecting' } }
```

### Enviar Mensagem de Texto
```typescript
await evolutionService.sendText(
    '5511999999999@s.whatsapp.net', // número com @s.whatsapp.net
    'Olá! Sua mensagem aqui.'
);
```

### Enviar Mídia (Imagem/Vídeo/Documento)
```typescript
await evolutionService.sendMedia(
    '5511999999999@s.whatsapp.net',
    'https://exemplo.com/imagem.jpg',
    'media', // 'image' | 'video' | 'document'
    'Legenda da imagem'
);
```

### Buscar Conversas
```typescript
const chats = await evolutionService.fetchChats();
// chats: Array<{ id: string, name: string, lastMessage: string, ... }>
```

### Buscar Mensagens de um Chat
```typescript
const messages = await evolutionService.fetchMessages('5511999999999@s.whatsapp.net');
// messages: Array<{ id: string, body: string, fromMe: boolean, timestamp: number }>
```

### Desconectar Instância
```typescript
await evolutionService.logoutInstance('minha-instancia');
```

### Excluir Instância
```typescript
await evolutionService.deleteInstance('minha-instancia');
```

---

## Auth API

### Login
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
    email: 'email@exemplo.com',
    password: 'senha123'
});
```

### Cadastro
```typescript
const { data, error } = await supabase.auth.signUp({
    email: 'email@exemplo.com',
    password: 'senha123',
    options: {
        data: {
            name: 'Nome do Profissional',
            specialty: 'personal'
        }
    }
});
```

### Logout
```typescript
await supabase.auth.signOut();
```

### Obter Sessão Atual
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

### Listener de Auth
```typescript
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        // Usuário logou
    } else if (event === 'SIGNED_OUT') {
        // Usuário deslogou
    }
});
```

---

## Queries Comuns

### Alunos com Plano Expirando
```typescript
const oneWeekFromNow = new Date();
oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

const { data } = await supabase
    .from('students')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('status', 'active')
    .lte('plan_end', oneWeekFromNow.toISOString().split('T')[0]);
```

### Receita do Mês
```typescript
const startOfMonth = new Date();
startOfMonth.setDate(1);
startOfMonth.setHours(0, 0, 0, 0);

const { data } = await supabase
    .from('payments')
    .select('amount')
    .eq('professional_id', professionalId)
    .eq('status', 'completed')
    .gte('paid_at', startOfMonth.toISOString());

const total = data?.reduce((sum, p) => sum + p.amount, 0) || 0;
```

### Buscar Alunos por Nome/Email
```typescript
const { data } = await supabase
    .from('students')
    .select('*')
    .eq('professional_id', professionalId)
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(20);
```

---

## Tipos TypeScript

### Student
```typescript
interface Student {
    id: string;
    professional_id: string;
    name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    goal: string | null;
    status: 'active' | 'inactive' | 'paused';
    plan_type: 'mensal' | 'trimestral' | 'semestral' | 'anual' | null;
    plan_start: string | null;
    plan_end: string | null;
    weight: number | null;
    height: number | null;
    birth_date: string | null;
    gender: 'male' | 'female' | null;
    notes: string | null;
    health_conditions: string[] | null;
    injuries: string[] | null;
    medications: string[] | null;
    streak_days: number;
    xp_points: number;
    custom_data: Record<string, any> | null;
    created_at: string;
    updated_at: string;
}
```

### Protocol
```typescript
interface Protocol {
    id: string;
    professional_id: string;
    student_id: string | null;
    type: 'workout' | 'diet' | 'both';
    name: string;
    description: string | null;
    content: any; // WorkoutContent | DietContent
    is_template: boolean;
    status: 'draft' | 'active' | 'archived';
    starts_at: string | null;
    ends_at: string | null;
    created_at: string;
    updated_at: string;
}
```

### Payment
```typescript
interface Payment {
    id: string;
    professional_id: string;
    student_id: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    payment_method: 'pix' | 'credit_card' | 'boleto' | 'cash' | null;
    stripe_payment_id: string | null;
    due_date: string;
    paid_at: string | null;
    created_at: string;
}
```

---

## Erros Comuns

| Código | Mensagem | Causa | Solução |
|--------|----------|-------|---------|
| 23505 | duplicate key value | Registro já existe | Use upsert |
| 42703 | column does not exist | Coluna não existe | Execute migração |
| PGRST301 | Row level security | RLS bloqueando | Verificar política |
| 401 | Unauthorized | Token expirado | Fazer login novamente |
| 500 | Internal Server Error | Erro no servidor | Verificar logs |
