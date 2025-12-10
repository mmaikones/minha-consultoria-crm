import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import CalendarGrid from '../components/schedule/CalendarGrid';
import EventModal from '../components/schedule/EventModal';
import { CalendarEvent } from '../types/schedule';
import { mockEvents } from '../data/mockSchedule';

export default function Schedule() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
        if (selectedEvent) {
            // Edit existing
            setEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...e, ...eventData } : e));
        } else {
            // Create new
            const newEvent: CalendarEvent = {
                ...eventData,
                id: Math.random().toString(36).substr(2, 9)
            };
            setEvents(prev => [...prev, newEvent]);
        }
        setIsModalOpen(false);
        setSelectedEvent(undefined);
    };

    const handleDateClick = (date: string) => {
        setSelectedDate(date);
        setSelectedEvent(undefined);
        setIsModalOpen(true);
    };

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setSelectedDate(event.date);
        setIsModalOpen(true);
    };

    const handleNewEvent = () => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setSelectedEvent(undefined);
        setIsModalOpen(true);
    };

    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agenda</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gerencie seus compromissos e aulas
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                        <span className="px-4 font-medium text-slate-900 dark:text-white capitalize min-w-[140px] text-center">
                            {monthName}
                        </span>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>
                    <button
                        onClick={handleNewEvent}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Novo Agendamento</span>
                        <span className="sm:hidden">Novo</span>
                    </button>
                </div>
            </div>

            <CalendarGrid
                currentDate={currentDate}
                events={events}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
            />

            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEvent}
                initialDate={selectedDate}
                existingEvent={selectedEvent}
            />
        </div>
    );
}
