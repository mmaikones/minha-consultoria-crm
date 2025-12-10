export type EventType = 'training' | 'consultation' | 'blocked';

export interface CalendarEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    duration: number; // minutes
    type: EventType;
    studentId?: string;
    description?: string;
}
