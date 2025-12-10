import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, AlignLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarEvent, EventType } from '../../types/schedule';
import { mockStudents } from '../../data/mockStudents';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<CalendarEvent, 'id'>) => void;
    initialDate?: string;
    existingEvent?: CalendarEvent;
}

export default function EventModal({ isOpen, onClose, onSave, initialDate, existingEvent }: EventModalProps) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('09:00');
    const [duration, setDuration] = useState(60);
    const [type, setType] = useState<EventType>('training');
    const [studentId, setStudentId] = useState('');
    const [description, setDescription] = useState('');

    // Sync form state when modal opens or event changes
     
    useEffect(() => {
        if (isOpen) {
            if (existingEvent) {
                setTitle(existingEvent.title);
                setDate(existingEvent.date);
                setTime(existingEvent.time);
                setDuration(existingEvent.duration);
                setType(existingEvent.type);
                setStudentId(existingEvent.studentId || '');
                setDescription(existingEvent.description || '');
            } else {
                setTitle('');
                setDate(initialDate || new Date().toISOString().split('T')[0]);
                setTime('09:00');
                setDuration(60);
                setType('training');
                setStudentId('');
                setDescription('');
            }
        }
    }, [isOpen, initialDate, existingEvent]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title: title || (type === 'training' ? 'Treino' : type === 'consultation' ? 'Consulta' : 'Bloqueado'),
            date,
            time,
            duration,
            type,
            studentId: studentId || undefined,
            description
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {existingEvent ? 'Editar Agendamento' : 'Novo Agendamento'}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        {/* Type Selection */}
                        <div className="grid grid-cols-3 gap-2">
                            {(['training', 'consultation', 'blocked'] as EventType[]).map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`py-2 px-1 rounded-lg text-xs font-medium capitalize border transition-all
                                        ${type === t
                                            ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {t === 'training' ? 'Treino' : t === 'consultation' ? 'Consulta' : 'Bloqueio'}
                                </button>
                            ))}
                        </div>

                        {/* Title (Optional based on type) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Ex: Treino de Força"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                            />
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Horário</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={e => setTime(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Student Selection (if not blocked) */}
                        {type !== 'blocked' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Aluno</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <select
                                        value={studentId}
                                        onChange={e => {
                                            setStudentId(e.target.value);
                                            // Auto-fill title if empty
                                            if (!title && e.target.value) {
                                                const s = mockStudents.find(st => st.id === e.target.value);
                                                if (s) setTitle(`${type === 'training' ? 'Treino' : 'Consulta'} - ${s.name.split(' ')[0]}`);
                                            }
                                        }}
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                                    >
                                        <option value="">Selecione um aluno...</option>
                                        {mockStudents.map(student => (
                                            <option key={student.id} value={student.id}>{student.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observações</label>
                            <div className="relative">
                                <AlignLeft className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Salvar
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
