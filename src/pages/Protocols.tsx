import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Dumbbell, Apple, Zap, Filter, X, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import ProtocolCard from '../components/protocols/ProtocolCard';
import AssignProtocolModal from '../components/modals/AssignProtocolModal';
import { Protocol as MockProtocol, ProtocolType, ProtocolStatus } from '../data/mockProtocols'; // Keep types only
import { Student } from '../data/mockStudents'; // Type only
import { motion, AnimatePresence } from 'framer-motion';
import { useProtocols, useCreateProtocol, useDeleteProtocol } from '../hooks/useProtocols';
import { useAuth } from '../contexts/AuthContext';
import type { Protocol as SupabaseProtocol } from '../lib/database.types';

type FilterType = 'all' | 'workout' | 'diet' | 'combo';
type StatusFilter = 'all' | ProtocolStatus;

// Type alias for unified use
type Protocol = MockProtocol;

// Convert Supabase protocol to mock format for component compatibility
const convertSupabaseProtocol = (p: SupabaseProtocol): Protocol => ({
    id: p.id,
    name: p.name,
    type: p.type as ProtocolType,
    status: (p.status || 'draft') as ProtocolStatus,
    description: p.description || '',
    aiGenerated: p.ai_generated,
    workoutDays: [],
    meals: [],
    studentsUsing: [],
    createdAt: p.created_at.split('T')[0],
    updatedAt: p.updated_at.split('T')[0],
});

export default function Protocols() {
    const navigate = useNavigate();
    const { professional } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [assignModal, setAssignModal] = useState<{ isOpen: boolean; protocol: Protocol | null }>({
        isOpen: false,
        protocol: null,
    });
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    // Fetch from Supabase
    const { data: supabaseProtocols, isLoading, refetch } = useProtocols();
    const createProtocol = useCreateProtocol();
    const deleteProtocol = useDeleteProtocol();

    // Use real data from Supabase
    const protocols = useMemo(() => {
        if (supabaseProtocols && supabaseProtocols.length > 0) {
            return supabaseProtocols.map(convertSupabaseProtocol);
        }
        // Return empty array - no fallback to mock data
        return [];
    }, [supabaseProtocols]);

    const filteredProtocols = protocols.filter(protocol => {
        const matchesSearch = protocol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            protocol.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || protocol.type === filterType;
        const matchesStatus = statusFilter === 'all' || protocol.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    // Count pending reviews for notification
    const pendingReviewCount = protocols.filter(p => p.status === 'pending_review').length;

    const handleEdit = (protocol: Protocol) => {
        navigate(`/admin/protocolos/${protocol.id}`);
    };

    const handleDuplicate = async (protocol: Protocol) => {
        if (professional?.id) {
            try {
                await createProtocol.mutateAsync({
                    name: `Cópia de ${protocol.name}`,
                    type: protocol.type,
                    status: 'draft',
                    description: protocol.description,
                    ai_generated: false,
                });
                showToast(`"Cópia de ${protocol.name}" criado com sucesso!`);
            } catch (error) {
                console.error('Error duplicating:', error);
            }
        } else {
            showToast('Protocolo duplicado (modo demo)');
        }
    };

    const handleAssign = (protocol: Protocol) => {
        setAssignModal({ isOpen: true, protocol });
    };

    const handleConfirmAssign = async (studentIds: string[], notify: boolean) => {
        // In real implementation, this would assign protocols to students via Supabase
        // For now, we just show a toast
        const notifyMsg = notify ? ' e notificação enviada' : '';
        showToast(`${studentIds.length} aluno(s) atribuído(s)${notifyMsg}!`);
        setAssignModal({ isOpen: false, protocol: null });
    };


    const handleCreateNew = (type: ProtocolType) => {
        setShowTypeModal(false);
        navigate(`/admin/protocolos/novo?type=${type}`);
    };

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const filters: { id: FilterType; label: string; icon?: React.ComponentType<{ className?: string }>; color?: string }[] = [
        { id: 'all', label: 'Todos' },
        { id: 'workout', label: 'Treinos', icon: Dumbbell, color: 'text-blue-500' },
        { id: 'diet', label: 'Dietas', icon: Apple, color: 'text-green-500' },
        { id: 'combo', label: 'Combos', icon: Zap, color: 'text-purple-500' },
    ];

    const typeOptions = [
        { id: 'workout' as ProtocolType, label: 'Treino', icon: '🏋️', description: 'Apenas exercícios e séries', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800' },
        { id: 'diet' as ProtocolType, label: 'Dieta', icon: '🍎', description: 'Apenas refeições e alimentos', color: 'bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800' },
        { id: 'combo' as ProtocolType, label: 'Combo', icon: '⚡', description: 'Treino + Dieta no mesmo protocolo', color: 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 hover:from-purple-100 hover:to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-700' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Protocolos</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gerencie seus treinos, dietas e combos
                    </p>
                </div>
                <button
                    onClick={() => setShowTypeModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                    <Plus className="w-5 h-5" />
                    <span>Novo Protocolo</span>
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 overflow-x-auto">
                    {filters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setFilterType(filter.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${filterType === filter.id
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            {filter.icon && <filter.icon className={`w-4 h-4 ${filterType === filter.id ? filter.color : ''}`} />}
                            <span>{filter.label}</span>
                            {filter.id !== 'all' && (
                                <span className="text-xs bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded-full">
                                    {protocols.filter(p => p.type === filter.id).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar protocolos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setStatusFilter('pending_review')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'pending_review'
                            ? 'bg-amber-100 text-amber-700 border border-amber-300 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-amber-50'
                            }`}
                    >
                        <Clock className="w-4 h-4" />
                        <span>Pendentes</span>
                        {pendingReviewCount > 0 && (
                            <span className="bg-amber-500 text-white px-1.5 py-0.5 text-xs rounded-full font-bold">
                                {pendingReviewCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setStatusFilter('active')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'active'
                            ? 'bg-green-100 text-green-700 border border-green-300 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-green-50'
                            }`}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Ativos</span>
                    </button>
                    {statusFilter !== 'all' && (
                        <button
                            onClick={() => setStatusFilter('all')}
                            className="text-xs text-slate-500 hover:text-slate-700 underline"
                        >
                            Limpar
                        </button>
                    )}
                </div>
            </div>

            {/* Grid */}
            {filteredProtocols.length === 0 ? (
                <div className="text-center py-12">
                    <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">
                        Nenhum protocolo encontrado
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProtocols.map(protocol => (
                        <ProtocolCard
                            key={protocol.id}
                            protocol={protocol}
                            onEdit={handleEdit}
                            onDuplicate={handleDuplicate}
                            onAssign={handleAssign}
                        />
                    ))}
                </div>
            )}

            {/* Assignment Modal */}
            <AssignProtocolModal
                isOpen={assignModal.isOpen}
                protocol={assignModal.protocol}
                onClose={() => setAssignModal({ isOpen: false, protocol: null })}
                onConfirm={handleConfirmAssign}
            />

            {/* Type Selection Modal */}
            <AnimatePresence>
                {showTypeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowTypeModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Qual tipo de protocolo?
                                </h2>
                                <button
                                    onClick={() => setShowTypeModal(false)}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {typeOptions.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleCreateNew(option.id)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${option.color}`}
                                    >
                                        <span className="text-3xl">{option.icon}</span>
                                        <div className="text-left">
                                            <p className="font-semibold text-slate-900 dark:text-white">{option.label}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{option.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse">
                    <span>✓</span>
                    <span>{toast}</span>
                </div>
            )}
        </div>
    );
}
