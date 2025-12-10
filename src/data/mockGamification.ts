export interface PointRule {
    id: string;
    action: string;
    points: number;
    description: string;
}

export interface Reward {
    id: string;
    title: string;
    description: string;
    cost: number;
    image: string;
    stock: number | 'unlimited';
    active: boolean;
}

export interface Redemption {
    id: string;
    studentId: string;
    studentName: string;
    studentAvatar: string;
    rewardId: string;
    rewardTitle: string;
    points: number;
    date: string;
    status: 'pendente' | 'entregue' | 'cancelado';
}

export interface LeaderboardEntry {
    rank: number;
    studentId: string;
    studentName: string;
    studentAvatar: string;
    totalPoints: number;
    checkins: number;
    streakDays: number;
}

export const mockRules: PointRule[] = [
    { id: 'r1', action: 'Check-in de Treino', points: 10, description: 'Cada treino registrado no app' },
    { id: 'r2', action: 'Check-in de Dieta (Dia 100%)', points: 15, description: 'Completar todas as refeições do dia' },
    { id: 'r3', action: 'Renovação de Plano', points: 500, description: 'Ao renovar qualquer plano' },
    { id: 'r4', action: 'Foto de Evolução', points: 50, description: 'Enviar foto para comparativo' },
    { id: 'r5', action: 'Bater Meta de Peso', points: 100, description: 'Atingir meta estabelecida' },
    { id: 'r6', action: 'Indicar um Amigo', points: 200, description: 'Quando o amigo se cadastra' },
    { id: 'r7', action: 'Streak de 7 Dias', points: 50, description: 'Bônus por 7 dias seguidos' },
    { id: 'r8', action: 'Streak de 30 Dias', points: 200, description: 'Bônus por 30 dias seguidos' },
];

export const mockRewards: Reward[] = [
    { id: 'rw1', title: '15 Dias Extra', description: 'Adicione 15 dias ao seu plano atual', cost: 500, image: '🎁', stock: 'unlimited', active: true },
    { id: 'rw2', title: 'Camiseta Exclusiva', description: 'Camiseta oficial da consultoria', cost: 800, image: '👕', stock: 10, active: true },
    { id: 'rw3', title: 'Consultoria Nutricional', description: '1 hora com nutricionista parceiro', cost: 1200, image: '🥗', stock: 5, active: true },
    { id: 'rw4', title: '20% OFF Renovação', description: 'Desconto na próxima renovação', cost: 1000, image: '💰', stock: 'unlimited', active: true },
    { id: 'rw5', title: 'Garrafa Térmica', description: 'Garrafa de 1L personalizada', cost: 600, image: '🍶', stock: 15, active: true },
    { id: 'rw6', title: 'Treino VIP', description: 'Sessão exclusiva personalizada', cost: 1500, image: '⭐', stock: 3, active: true },
    { id: 'rw7', title: 'Mês Grátis', description: '1 mês adicional no plano', cost: 2000, image: '🏆', stock: 2, active: true },
    { id: 'rw8', title: 'Kit Suplementos', description: 'Whey + Creatina + Shaker', cost: 2500, image: '💪', stock: 5, active: false },
];

export const mockRedemptions: Redemption[] = [
    { id: 'rd1', studentId: '1', studentName: 'João Silva', studentAvatar: 'JS', rewardId: 'rw1', rewardTitle: '15 Dias Extra', points: 500, date: '2024-12-05', status: 'pendente' },
    { id: 'rd2', studentId: '2', studentName: 'Maria Santos', studentAvatar: 'MS', rewardId: 'rw4', rewardTitle: '20% OFF Renovação', points: 1000, date: '2024-12-04', status: 'pendente' },
    { id: 'rd3', studentId: '4', studentName: 'Ana Costa', studentAvatar: 'AC', rewardId: 'rw2', rewardTitle: 'Camiseta Exclusiva', points: 800, date: '2024-12-01', status: 'entregue' },
    { id: 'rd4', studentId: '5', studentName: 'Carlos Mendes', studentAvatar: 'CM', rewardId: 'rw5', rewardTitle: 'Garrafa Térmica', points: 600, date: '2024-11-28', status: 'entregue' },
    { id: 'rd5', studentId: '8', studentName: 'Juliana Pereira', studentAvatar: 'JP', rewardId: 'rw6', rewardTitle: 'Treino VIP', points: 1500, date: '2024-11-25', status: 'entregue' },
    { id: 'rd6', studentId: '3', studentName: 'Pedro Oliveira', studentAvatar: 'PO', rewardId: 'rw3', rewardTitle: 'Consultoria Nutricional', points: 1200, date: '2024-12-06', status: 'pendente' },
];

export const mockLeaderboard: LeaderboardEntry[] = [
    { rank: 1, studentId: '4', studentName: 'Ana Costa', studentAvatar: 'AC', totalPoints: 2850, checkins: 45, streakDays: 28 },
    { rank: 2, studentId: '2', studentName: 'Maria Santos', studentAvatar: 'MS', totalPoints: 2340, checkins: 38, streakDays: 21 },
    { rank: 3, studentId: '9', studentName: 'Lucas Ferreira', studentAvatar: 'LF', totalPoints: 1980, checkins: 32, streakDays: 14 },
    { rank: 4, studentId: '1', studentName: 'João Silva', studentAvatar: 'JS', totalPoints: 1750, checkins: 28, streakDays: 12 },
    { rank: 5, studentId: '10', studentName: 'Beatriz Almeida', studentAvatar: 'BA', totalPoints: 1620, checkins: 25, streakDays: 10 },
    { rank: 6, studentId: '8', studentName: 'Juliana Pereira', studentAvatar: 'JP', totalPoints: 1450, checkins: 22, streakDays: 8 },
    { rank: 7, studentId: '5', studentName: 'Carlos Mendes', studentAvatar: 'CM', totalPoints: 1280, checkins: 20, streakDays: 5 },
    { rank: 8, studentId: '3', studentName: 'Pedro Oliveira', studentAvatar: 'PO', totalPoints: 1100, checkins: 18, streakDays: 4 },
    { rank: 9, studentId: '6', studentName: 'Fernanda Lima', studentAvatar: 'FL', totalPoints: 890, checkins: 14, streakDays: 3 },
    { rank: 10, studentId: '11', studentName: 'Gabriel Santos', studentAvatar: 'GS', totalPoints: 720, checkins: 12, streakDays: 2 },
];

export const gamificationStats = {
    totalPointsDistributed: 18540,
    activeRewards: 7,
    pendingRedemptions: 3,
    totalRedemptions: 24,
};
