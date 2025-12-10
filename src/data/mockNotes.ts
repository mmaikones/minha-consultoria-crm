// mockStudents import removed - can be added back when linking notes to students

export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple';

export interface Note {
    id: string;
    title: string;
    content: string;
    color: NoteColor;
    isPinned: boolean;
    studentId?: string; // Optional link to a student
    createdAt: string;
    updatedAt: string;
}

export const noteColors: { value: NoteColor; label: string; bg: string; border: string; text: string }[] = [
    {
        value: 'yellow',
        label: 'Cream',
        bg: 'bg-amber-50 dark:bg-amber-50',
        border: 'border-amber-200 dark:border-amber-200',
        text: 'text-slate-900 dark:text-slate-900'
    },
    {
        value: 'pink',
        label: 'Rose',
        bg: 'bg-rose-50 dark:bg-rose-50',
        border: 'border-rose-200 dark:border-rose-200',
        text: 'text-slate-900 dark:text-slate-900'
    },
    {
        value: 'blue',
        label: 'Sky',
        bg: 'bg-sky-50 dark:bg-sky-50',
        border: 'border-sky-200 dark:border-sky-200',
        text: 'text-slate-900 dark:text-slate-900'
    },
    {
        value: 'green',
        label: 'Mint',
        bg: 'bg-emerald-50 dark:bg-emerald-50',
        border: 'border-emerald-200 dark:border-emerald-200',
        text: 'text-slate-900 dark:text-slate-900'
    },
    {
        value: 'purple',
        label: 'Lavender',
        bg: 'bg-violet-50 dark:bg-violet-50',
        border: 'border-violet-200 dark:border-violet-200',
        text: 'text-slate-900 dark:text-slate-900'
    },
];

export const getColorClasses = (color: NoteColor) => {
    return noteColors.find(c => c.value === color) || noteColors[0];
};

export const mockNotes: Note[] = [
    {
        id: '1',
        title: 'Ideias para Black Friday',
        content: `Promoções para novembro:

- 30% off no plano anual
- Bônus: 1 mês grátis para indicações
- Kit exclusivo (camiseta + garrafa)
- Sorteio de 3 meses grátis

Divulgação:
- Stories com countdown
- E-mail marketing 1 semana antes
- WhatsApp broadcast na véspera`,
        color: 'yellow',
        isPinned: true,
        createdAt: '2024-11-01T10:30:00',
        updatedAt: '2024-11-15T14:20:00',
    },
    {
        id: '2',
        title: 'Lista de Compras - Academia',
        content: `Equipamentos para comprar:

[ ] Conjunto de halteres (5-30kg)
[ ] Barra olímpica
[ ] Anilhas emborrachadas
[ ] Suporte para agachamento
[ ] Colchonetes (10 unidades)
[ ] Cordas de pular
[ ] Kettlebells (8, 12, 16kg)

Orçamento aprovado: R$ 15.000`,
        color: 'blue',
        isPinned: false,
        createdAt: '2024-10-20T09:00:00',
        updatedAt: '2024-11-10T11:45:00',
    },
    {
        id: '3',
        title: 'Protocolo João - Observações',
        content: `Anotações da última avaliação:

- Lesão antiga no ombro direito (cuidado com supino)
- Preferência por treinos pela manhã
- Objetivo: ganhar 5kg de massa até março
- Disponibilidade: seg/qua/sex

Progresso:
Mês 1: +1.5kg
Mês 2: +1.2kg

Ajustar volume de séries no próximo mês.`,
        color: 'green',
        isPinned: true,
        studentId: 'student-1',
        createdAt: '2024-09-15T16:00:00',
        updatedAt: '2024-12-01T10:30:00',
    },
    {
        id: '4',
        title: 'Metas 2025',
        content: `Objetivos do próximo ano:

NEGÓCIO:
- Alcançar 50 alunos ativos
- Faturamento mensal: R$ 30.000
- Lançar plataforma online

PESSOAL:
- Certificação CREF atualizada
- Curso de nutrição esportiva
- Workshop de marketing digital`,
        color: 'purple',
        isPinned: true,
        createdAt: '2024-12-01T08:00:00',
        updatedAt: '2024-12-05T17:00:00',
    },
    {
        id: '5',
        title: 'Lembrete: Pagamentos Pendentes',
        content: `Alunos com pagamento atrasado:

- Maria Silva - 5 dias
- Pedro Santos - 10 dias
- Ana Costa - 3 dias

Enviar mensagem cobrança amigável hoje!`,
        color: 'pink',
        isPinned: false,
        createdAt: '2024-12-05T08:00:00',
        updatedAt: '2024-12-05T08:00:00',
    },
];
