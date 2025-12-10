export type CampaignStatus = 'rascunho' | 'agendado' | 'enviado' | 'enviando' | 'erro';

export interface Campaign {
    id: string;
    name: string;
    date: string;
    targetAudience: string;
    targetCount: number;
    status: CampaignStatus;
    channel: 'whatsapp' | 'system' | 'both';
    message: string;
}

export const mockCampaigns: Campaign[] = [
    {
        id: '1',
        name: 'Promoção de Verão',
        date: '2024-11-15',
        targetAudience: 'Todos os alunos',
        targetCount: 150,
        status: 'enviado',
        channel: 'whatsapp',
        message: 'Olá {{nome}}, aproveite nossa promoção de verão! 🌞',
    },
    {
        id: '2',
        name: 'Aviso de Feriado',
        date: '2024-11-01',
        targetAudience: 'Ativos',
        targetCount: 120,
        status: 'enviado',
        channel: 'system',
        message: 'Aviso: Não haverá aula neste feriado.',
    },
    {
        id: '3',
        name: 'Renovação Mensal',
        date: '2024-10-25',
        targetAudience: 'Vencendo em 7 dias',
        targetCount: 15,
        status: 'enviado',
        channel: 'whatsapp',
        message: 'Olá {{nome}}, seu plano vence em breve. Renove agora!',
    },
    {
        id: '4',
        name: 'Desafio 30 Dias',
        date: '2024-12-20',
        targetAudience: 'Todos o alunos',
        targetCount: 155,
        status: 'agendado',
        channel: 'both',
        message: 'Prepare-se para o desafio de 30 dias! 💪',
    },
];

export const marketingStats = {
    messagesSentThisMonth: 65,
    openRate: 78.5,
    renewalsGenerated: 12,
};
