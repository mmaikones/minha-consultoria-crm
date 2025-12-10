import { useState } from 'react';
import { Dumbbell, Apple, Zap, MoreVertical, Edit, Copy, Users, User } from 'lucide-react';
import type { Protocol } from '../../data/mockProtocols';

interface ProtocolCardProps {
    protocol: Protocol;
    onEdit: (protocol: Protocol) => void;
    onDuplicate: (protocol: Protocol) => void;
    onAssign: (protocol: Protocol) => void;
}

const getTypeConfig = (type: Protocol['type']) => {
    switch (type) {
        case 'workout':
            return {
                icon: Dumbbell,
                bg: 'bg-blue-50 dark:bg-blue-900/20',
                color: 'text-blue-600',
                badge: 'Treino',
                badgeBg: 'bg-blue-100/50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400',
                accentBorder: 'hover:border-blue-200 dark:hover:border-blue-800',
            };
        case 'diet':
            return {
                icon: Apple,
                bg: 'bg-green-50 dark:bg-green-900/20',
                color: 'text-green-600',
                badge: 'Dieta',
                badgeBg: 'bg-green-100/50 text-green-700 dark:bg-green-900/50 dark:text-green-400',
                accentBorder: 'hover:border-green-200 dark:hover:border-green-800',
            };
        case 'combo':
            return {
                icon: Zap,
                bg: 'bg-purple-50 dark:bg-purple-900/20',
                color: 'text-purple-600',
                badge: 'Combo',
                badgeBg: 'bg-purple-100/50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400',
                accentBorder: 'hover:border-purple-200 dark:hover:border-purple-800',
            };
    }
};

export default function ProtocolCard({ protocol, onEdit, onDuplicate, onAssign }: ProtocolCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const config = getTypeConfig(protocol.type);
    const Icon = config.icon;

    const handleCardClick = () => {
        // Prevent edit when clicking specific interactive elements if needed, 
        // though usually stopPropagation on those elements is better.
        onEdit(protocol);
    };

    return (
        <div
            onClick={handleCardClick}
            className={`group relative bg-card rounded-2xl border border-border/50 p-5 cursor-pointer 
            transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${config.accentBorder}`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 ${config.bg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                        <Icon className={`w-6 h-6 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${config.badgeBg}`}>
                                {config.badge}
                            </span>
                        </div>
                        <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                            {protocol.name}
                        </h3>
                        {protocol.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {protocol.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Menu Button - Stop Propagation */}
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                }}
                            />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-xl shadow-xl border border-border z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(protocol);
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Editar</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDuplicate(protocol);
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                    <span>Duplicar</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAssign(protocol);
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    <span>Atribuir</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Footer Stats */}
            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-border/50 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-muted-foreground/70" />
                    {protocol.studentsUsing.length === 0
                        ? 'Sem alunos'
                        : `${protocol.studentsUsing.length} alunos`
                    }
                </span>

                {protocol.type === 'combo' && (
                    <>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>{protocol.workoutDays?.length || 0} treinos</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>{protocol.meals?.length || 0} refs</span>
                    </>
                )}
                {protocol.type === 'workout' && (
                    <>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>{protocol.workoutDays?.length || 0} dias</span>
                    </>
                )}
                {protocol.type === 'diet' && (
                    <>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>{protocol.meals?.length || 0} refs</span>
                    </>
                )}
            </div>
        </div>
    );
}
