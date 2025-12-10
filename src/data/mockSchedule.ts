import { CalendarEvent } from '../types/schedule';

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const mockEvents: CalendarEvent[] = [
    {
        id: '1',
        title: 'Treino - João Silva',
        date: formatDate(today),
        time: '10:00',
        duration: 60,
        type: 'training',
        studentId: '1',
        description: 'Treino de Superiores'
    },
    {
        id: '2',
        title: 'Anamnese - Maria Oliveira',
        date: formatDate(today),
        time: '14:00',
        duration: 90,
        type: 'consultation',
        studentId: '2',
        description: 'Avaliação inicial'
    },
    {
        id: '3',
        title: 'Treino - Pedro Santos',
        date: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)),
        time: '08:00',
        duration: 60,
        type: 'training',
        studentId: '3'
    },
    {
        id: '4',
        title: 'Bloqueado',
        date: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)),
        time: '12:00',
        duration: 60,
        type: 'blocked',
        description: 'Almoço'
    }
];
