// Reports Mock Data

export interface MonthlyMetric {
    month: string;
    newStudents: number;
    renewals: number;
    cancellations: number;
    revenue: number;
}

export interface StudentRetention {
    period: string;
    rate: number;
}

export interface GoalDistribution {
    goal: string;
    count: number;
    color: string;
}

export interface AgeDistribution {
    range: string;
    male: number;
    female: number;
}

export const monthlyMetrics: MonthlyMetric[] = [
    { month: 'Jul', newStudents: 8, renewals: 12, cancellations: 2, revenue: 8500 },
    { month: 'Ago', newStudents: 12, renewals: 15, cancellations: 3, revenue: 11200 },
    { month: 'Set', newStudents: 10, renewals: 18, cancellations: 1, revenue: 12800 },
    { month: 'Out', newStudents: 15, renewals: 20, cancellations: 4, revenue: 14500 },
    { month: 'Nov', newStudents: 18, renewals: 22, cancellations: 2, revenue: 16200 },
    { month: 'Dez', newStudents: 14, renewals: 25, cancellations: 3, revenue: 18900 },
];

export const retentionData: StudentRetention[] = [
    { period: '1 mês', rate: 95 },
    { period: '3 meses', rate: 82 },
    { period: '6 meses', rate: 68 },
    { period: '12 meses', rate: 45 },
    { period: '24 meses', rate: 28 },
];

export const goalDistribution: GoalDistribution[] = [
    { goal: 'Hipertrofia', count: 35, color: '#3b82f6' },
    { goal: 'Emagrecimento', count: 28, color: '#22c55e' },
    { goal: 'Condicionamento', count: 15, color: '#f59e0b' },
    { goal: 'Saúde', count: 12, color: '#8b5cf6' },
    { goal: 'Competição', count: 10, color: '#ef4444' },
];

export const ageDistribution: AgeDistribution[] = [
    { range: '18-24', male: 12, female: 8 },
    { range: '25-34', male: 25, female: 18 },
    { range: '35-44', male: 15, female: 12 },
    { range: '45-54', male: 8, female: 6 },
    { range: '55+', male: 4, female: 3 },
];

export const reportSummary = {
    totalStudents: 100,
    activeStudents: 85,
    avgRetention: 6.2, // months
    avgTicket: 189, // R$
    monthlyGrowth: 12.5, // %
    churnRate: 3.2, // %
    totalRevenue: 82100, // R$ (6 months)
    projectedRevenue: 95000, // R$
};
