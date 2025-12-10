export interface Plan {
    id: string;
    name: string;
    price: number;
    durationInDays: number;
    description: string;
    features: string[];
    activeStudents: number;
    color: string;
}

export const mockPlans: Plan[] = [
    {
        id: 'p1',
        name: 'Consultoria Mensal',
        price: 150.00,
        durationInDays: 30,
        description: 'Acompanhamento básico para iniciantes.',
        features: ['Treino Personalizado', 'Suporte via Chat', 'Análise Mensal'],
        activeStudents: 12,
        color: 'bg-blue-500'
    },
    {
        id: 'p2',
        name: 'Plano Trimestral',
        price: 400.00,
        durationInDays: 90,
        description: 'O mais popular! Desconto progressivo.',
        features: ['Tudo do Mensal', 'Dieta Personalizada', 'Ajustes Quinzenais', 'Videochamada mensal'],
        activeStudents: 45,
        color: 'bg-purple-500'
    },
    {
        id: 'p3',
        name: 'Anual Premium',
        price: 1500.00,
        durationInDays: 365,
        description: 'Para quem busca transformação total.',
        features: ['Acesso Total', 'Consulta Nutricional', 'Camiseta Exclusiva', 'Prioridade no Suporte'],
        activeStudents: 5,
        color: 'bg-amber-500'
    }
];
