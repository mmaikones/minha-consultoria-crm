import { useNavigate } from 'react-router-dom';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, Target } from 'lucide-react';
import { Student } from '../../data/mockStudents';

interface CardProps {
    student: Student;
    index: number;
}

export default function Card({ student, index }: CardProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/admin/student/${student.id}`);
    };

    return (
        <Draggable draggableId={student.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={handleClick}
                    className={`p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-500 rotate-2' : ''
                        }`}
                >
                    <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {student.avatar}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-slate-900 dark:text-white text-sm truncate">
                                    {student.name}
                                </span>
                                {student.isExpiring && (
                                    <span className="flex-shrink-0 ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium rounded">
                                        Vencendo
                                    </span>
                                )}
                                {!student.isExpiring && student.status !== 'novos_leads' && (
                                    <span className="flex-shrink-0 ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium rounded">
                                        Ativo
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-2">
                                <Target className="w-3 h-3" />
                                <span>{student.goal}</span>
                            </div>

                            {student.status !== 'novos_leads' && (
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        {student.daysRemaining <= 7
                                            ? `Vence em ${student.daysRemaining} dias`
                                            : `${student.daysRemaining} dias restantes`
                                        }
                                    </span>
                                </div>
                            )}

                            {student.status === 'novos_leads' && (
                                <span className="text-xs text-slate-400">Aguardando contato</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
}
