// Cash Flow Types and Mock Data

export type TransactionType = 'entrada' | 'saida';

export interface CashFlowCategory {
    id: string;
    name: string;
    type: TransactionType;
    icon: string;
    color: string;
}

export interface CashFlowTransaction {
    id: string;
    type: TransactionType;
    categoryId: string;
    description: string;
    amount: number;
    date: string;
    notes?: string;
    status?: 'completed' | 'pending' | 'failed';
    paymentMethod?: string;
}

// Predefined Categories
export const defaultCategories: CashFlowCategory[] = [
    // Entradas
    { id: 'cat-1', name: 'Mensalidades', type: 'entrada', icon: '💰', color: 'bg-green-500' },
    { id: 'cat-2', name: 'Avaliações', type: 'entrada', icon: '📊', color: 'bg-blue-500' },
    { id: 'cat-3', name: 'Consultoria Online', type: 'entrada', icon: '💻', color: 'bg-purple-500' },
    { id: 'cat-4', name: 'Vendas de Produtos', type: 'entrada', icon: '🛒', color: 'bg-teal-500' },
    { id: 'cat-5', name: 'Outros (Entrada)', type: 'entrada', icon: '➕', color: 'bg-slate-500' },

    // Saídas
    { id: 'cat-10', name: 'Anúncios/Marketing', type: 'saida', icon: '📢', color: 'bg-red-500' },
    { id: 'cat-11', name: 'Equipamentos', type: 'saida', icon: '🏋️', color: 'bg-orange-500' },
    { id: 'cat-12', name: 'Software/Apps', type: 'saida', icon: '📱', color: 'bg-indigo-500' },
    { id: 'cat-13', name: 'Aluguel/Espaço', type: 'saida', icon: '🏠', color: 'bg-amber-500' },
    { id: 'cat-14', name: 'Materiais', type: 'saida', icon: '📦', color: 'bg-cyan-500' },
    { id: 'cat-15', name: 'Impostos/Taxas', type: 'saida', icon: '📋', color: 'bg-rose-500' },
    { id: 'cat-16', name: 'Outros (Saída)', type: 'saida', icon: '➖', color: 'bg-slate-500' },
];

// Mock Transactions
export const mockCashFlowTransactions: CashFlowTransaction[] = [
    // Dezembro 2024 - Entradas
    { id: 'cf-1', type: 'entrada', categoryId: 'cat-1', description: 'João Silva - Mensal', amount: 200, date: '2024-12-05' },
    { id: 'cf-2', type: 'entrada', categoryId: 'cat-1', description: 'Maria Santos - Trimestral', amount: 500, date: '2024-12-03' },
    { id: 'cf-3', type: 'entrada', categoryId: 'cat-1', description: 'Pedro Oliveira - Semestral', amount: 900, date: '2024-12-01' },
    { id: 'cf-4', type: 'entrada', categoryId: 'cat-2', description: 'Avaliação - Ana Costa', amount: 150, date: '2024-12-04' },
    { id: 'cf-5', type: 'entrada', categoryId: 'cat-3', description: 'Consultoria - Lucas Ferreira', amount: 300, date: '2024-12-02' },
    { id: 'cf-6', type: 'entrada', categoryId: 'cat-1', description: 'Carlos Mendes - Mensal', amount: 200, date: '2024-12-06' },
    { id: 'cf-7', type: 'entrada', categoryId: 'cat-4', description: 'Venda Whey Protein', amount: 120, date: '2024-12-05' },

    // Dezembro 2024 - Saídas
    { id: 'cf-20', type: 'saida', categoryId: 'cat-10', description: 'Facebook/Instagram Ads', amount: 350, date: '2024-12-01', notes: 'Campanha Black Friday' },
    { id: 'cf-21', type: 'saida', categoryId: 'cat-10', description: 'Google Ads', amount: 200, date: '2024-12-01' },
    { id: 'cf-22', type: 'saida', categoryId: 'cat-12', description: 'Assinatura Canva Pro', amount: 55, date: '2024-12-01' },
    { id: 'cf-23', type: 'saida', categoryId: 'cat-14', description: 'Impressão de fichas', amount: 80, date: '2024-12-03' },
    { id: 'cf-24', type: 'saida', categoryId: 'cat-11', description: 'Elásticos de resistência', amount: 150, date: '2024-12-04' },

    // Novembro 2024 - Entradas
    { id: 'cf-30', type: 'entrada', categoryId: 'cat-1', description: 'Mensalidades Nov', amount: 3200, date: '2024-11-15' },
    { id: 'cf-31', type: 'entrada', categoryId: 'cat-2', description: 'Avaliações Nov', amount: 450, date: '2024-11-20' },

    // Novembro 2024 - Saídas
    { id: 'cf-40', type: 'saida', categoryId: 'cat-10', description: 'Ads Novembro', amount: 500, date: '2024-11-10' },
    { id: 'cf-41', type: 'saida', categoryId: 'cat-13', description: 'Aluguel sala', amount: 800, date: '2024-11-05' },
];

// Helper functions
export const getCategoryById = (categories: CashFlowCategory[], id: string) =>
    categories.find(c => c.id === id);

export const calculateTotals = (transactions: CashFlowTransaction[]) => {
    const entradas = transactions
        .filter(t => t.type === 'entrada')
        .reduce((sum, t) => sum + t.amount, 0);
    const saidas = transactions
        .filter(t => t.type === 'saida')
        .reduce((sum, t) => sum + t.amount, 0);
    return { entradas, saidas, saldo: entradas - saidas };
};

export const getTransactionsByMonth = (transactions: CashFlowTransaction[], year: number, month: number) => {
    return transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === year && date.getMonth() === month;
    });
};
