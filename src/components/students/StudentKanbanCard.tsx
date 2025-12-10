import { MoreVertical, MessageCircle, Calendar, TrendingUp, User, Target, Copy, Edit, Trash } from 'lucide-react';
import { Student } from '../../data/mockStudents';
import { useChat } from '../../contexts/ChatContext';
import { useState } from 'react';

interface StudentKanbanCardProps {
    student: Student;
    onClick: () => void;
    onDuplicate?: (student: Student) => void;
    onDelete?: (studentId: string) => void;
}

export default function StudentKanbanCard({ student, onClick, onDuplicate, onDelete }: StudentKanbanCardProps) {
    const { openChat } = useChat();
    const [showMenu, setShowMenu] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ativo': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'inativo': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'pendente': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col min-h-[180px]"
        >
            <div className={`absolute top-0 left-0 w-1 h-full ${student.isExpiring ? 'bg-red-500' : 'bg-transparent transition-colors group-hover:bg-primary-500'}`}></div>

            <div className="flex items-start justify-between mb-4 pl-2">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold shadow-inner ring-2 ring-white dark:ring-slate-700">
                        {student.avatar || student.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight text-[15px] group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {student.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium flex items-center gap-1">
                            <Target className="w-3 h-3 text-primary-500" />
                            {student.goal}
                        </p>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-200 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDuplicate?.(student);
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                <Copy className="w-4 h-4" />
                                Duplicar Aluno
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Edit logic placeholder
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                                Editar
                            </button>
                            <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onDelete && window.confirm(`Deseja realmente excluir ${student.name}?`)) {
                                        onDelete(student.id);
                                    }
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            >
                                <Trash className="w-4 h-4" />
                                Excluir
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats / Info - Pushed to bottom */}
            <div className="mt-auto">
                <div className="grid grid-cols-2 gap-2 mb-4 pl-2">
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5 flex flex-col items-center text-center border border-slate-100 dark:border-slate-700">
                        <TrendingUp className="w-4 h-4 text-emerald-500 mb-1.5" />
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Aderência</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{student.adherenceRate}%</span>
                    </div>
                    <div className={`bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5 flex flex-col items-center text-center border border-slate-100 dark:border-slate-700 ${student.daysRemaining < 7 ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20' : ''}`}>
                        <Calendar className={`w-4 h-4 mb-1.5 ${student.daysRemaining < 7 ? 'text-red-500' : 'text-blue-500'}`} />
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${student.daysRemaining < 7 ? 'text-red-400' : 'text-slate-400'}`}>Renovação</span>
                        <span className={`text-sm font-bold ${student.daysRemaining < 7 ? 'text-red-600' : 'text-slate-700 dark:text-slate-200'}`}>
                            {student.daysRemaining} dias
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-700 pl-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                openChat(student.phone, student.name, student.id);
                            }}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 dark:text-slate-500 hover:text-[#008069] dark:hover:text-[#00a884] transition-colors"
                            title="Conversar no WhatsApp"
                        >
                            <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                            className="p-2 bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title="Ver Perfil"
                        >
                            <User className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
