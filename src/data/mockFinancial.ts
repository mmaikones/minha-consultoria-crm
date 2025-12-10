export type PaymentStatus = 'pago' | 'pendente' | 'atrasado';

export interface Transaction {
    id: string;
    studentId: string;
    studentName: string;
    plan: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';
    amount: number;
    dueDate: string;
    status: PaymentStatus;
}

export interface MonthlyRevenue {
    month: string;
    receita: number;
}

export const mockTransactions: Transaction[] = [
    { id: 't1', studentId: '1', studentName: 'João Silva', plan: 'Mensal', amount: 200, dueDate: '2024-12-10', status: 'pendente' },
    { id: 't2', studentId: '2', studentName: 'Maria Santos', plan: 'Trimestral', amount: 540, dueDate: '2024-12-15', status: 'pago' },
    { id: 't3', studentId: '3', studentName: 'Pedro Oliveira', plan: 'Semestral', amount: 960, dueDate: '2024-12-01', status: 'pago' },
    { id: 't4', studentId: '4', studentName: 'Ana Costa', plan: 'Anual', amount: 1680, dueDate: '2025-03-01', status: 'pago' },
    { id: 't5', studentId: '5', studentName: 'Carlos Mendes', plan: 'Mensal', amount: 200, dueDate: '2024-12-07', status: 'atrasado' },
    { id: 't6', studentId: '8', studentName: 'Juliana Pereira', plan: 'Trimestral', amount: 540, dueDate: '2024-12-08', status: 'atrasado' },
    { id: 't7', studentId: '9', studentName: 'Lucas Ferreira', plan: 'Semestral', amount: 960, dueDate: '2025-01-01', status: 'pago' },
    { id: 't8', studentId: '10', studentName: 'Beatriz Almeida', plan: 'Anual', amount: 1680, dueDate: '2025-05-01', status: 'pago' },
    { id: 't9', studentId: '11', studentName: 'Gabriel Santos', plan: 'Mensal', amount: 200, dueDate: '2024-12-03', status: 'atrasado' },
];

export const monthlyRevenue: MonthlyRevenue[] = [
    { month: 'Jul', receita: 4200 },
    { month: 'Ago', receita: 4800 },
    { month: 'Set', receita: 5100 },
    { month: 'Out', receita: 5400 },
    { month: 'Nov', receita: 6200 },
    { month: 'Dez', receita: 5800 },
];

export const financialSummary = {
    expectedRevenue: 6960,
    receivedRevenue: 5040,
    overdueAmount: 940,
};
