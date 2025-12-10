export interface Reward {
    id: string;
    name: string;
    description: string;
    cost: number;
    image: string;
    category: 'discount' | 'product' | 'service' | 'bonus';
}

export const mockRewards: Reward[] = [
    {
        id: 'r1',
        name: '15 Dias Extra',
        description: 'Ganhe 15 dias adicionais no seu plano atual',
        cost: 500,
        image: '🎁',
        category: 'bonus',
    },
    {
        id: 'r2',
        name: 'Camiseta Exclusiva',
        description: 'Camiseta oficial da consultoria',
        cost: 800,
        image: '👕',
        category: 'product',
    },
    {
        id: 'r3',
        name: 'Consultoria Nutricional',
        description: '1 hora com nutricionista parceiro',
        cost: 1200,
        image: '🥗',
        category: 'service',
    },
    {
        id: 'r4',
        name: '20% OFF Renovação',
        description: 'Desconto na próxima renovação',
        cost: 1000,
        image: '💰',
        category: 'discount',
    },
    {
        id: 'r5',
        name: 'Garrafa Térmica',
        description: 'Garrafa de 1L com logo',
        cost: 600,
        image: '🍶',
        category: 'product',
    },
    {
        id: 'r6',
        name: 'Treino VIP',
        description: 'Sessão exclusiva de treino personalizado',
        cost: 1500,
        image: '⭐',
        category: 'service',
    },
    {
        id: 'r7',
        name: 'Mês Grátis',
        description: '1 mês adicional sem custo',
        cost: 2000,
        image: '🏆',
        category: 'bonus',
    },
    {
        id: 'r8',
        name: 'Kit Suplementos',
        description: 'Whey + Creatina + Shaker',
        cost: 2500,
        image: '💪',
        category: 'product',
    },
];
