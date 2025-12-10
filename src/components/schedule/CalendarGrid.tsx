import { CalendarEvent } from '../../types/schedule';

interface CalendarGridProps {
    currentDate: Date;
    events: CalendarEvent[];
    onDateClick: (date: string) => void;
    onEventClick: (event: CalendarEvent) => void;
}

export default function CalendarGrid({ currentDate, events, onDateClick, onEventClick }: CalendarGridProps) {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday

    const days = [];
    const prefixDays = firstDayOfMonth; // Empty cells before 1st of month

    // Add empty prefix days
    for (let i = 0; i < prefixDays; i++) {
        days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const getEventsForDay = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => e.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Week Headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr">
                {days.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className="min-h-[100px] bg-slate-50/30 dark:bg-slate-900/10 border-b border-r border-slate-100 dark:border-slate-800/50" />;
                    }

                    const dayEvents = getEventsForDay(day);

                    return (
                        <div
                            key={day}
                            onClick={() => onDateClick(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
                            className={`min-h-[120px] p-2 border-b border-r border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors cursor-pointer relative group
                                ${isToday(day) ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}
                            `}
                        >
                            <span className={`
                                inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium mb-1
                                ${isToday(day)
                                    ? 'bg-primary-600 text-white'
                                    : 'text-slate-700 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm'
                                }
                            `}>
                                {day}
                            </span>

                            <div className="space-y-1 mt-1">
                                {dayEvents.map(event => (
                                    <div
                                        key={event.id}
                                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                                        className={`
                                            px-2 py-1 rounded text-xs truncate border-l-2 cursor-pointer hover:opacity-80 transition-opacity
                                            ${event.type === 'training'
                                                ? 'bg-blue-100 text-blue-700 border-blue-500 dark:bg-blue-900/30 dark:text-blue-300'
                                                : event.type === 'consultation'
                                                    ? 'bg-purple-100 text-purple-700 border-purple-500 dark:bg-purple-900/30 dark:text-purple-300'
                                                    : 'bg-slate-100 text-slate-700 border-slate-500 dark:bg-slate-700 dark:text-slate-300'
                                            }
                                        `}
                                    >
                                        <span className="font-semibold mr-1">{event.time}</span>
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
