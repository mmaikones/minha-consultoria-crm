import { useState } from 'react';
import { Clock, CheckCircle, Package, Gift } from 'lucide-react';
import { mockRedemptions, Redemption } from '../../data/mockGamification';

interface RedemptionsTabProps {
    onDeliver: () => void;
}

export default function RedemptionsTab({ onDeliver }: RedemptionsTabProps) {
    const [redemptions, setRedemptions] = useState<Redemption[]>(mockRedemptions);
    const [filter, setFilter] = useState<'all' | 'pendente' | 'entregue'>('all');

    const handleDeliver = (id: string) => {
        setRedemptions(prev =>
            prev.map(r =>
                r.id === id ? { ...r, status: 'entregue' as const } : r
            )
        );
        onDeliver();
    };

    const filteredRedemptions = redemptions.filter(r =>
        filter === 'all' ? true : r.status === filter
    );

    const pendingCount = redemptions.filter(r => r.status === 'pendente').length;
    const deliveredCount = redemptions.filter(r => r.status === 'entregue').length;

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Pendentes</p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{deliveredCount}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Entregues</p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                            <Gift className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{redemptions.length}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg w-fit">
                {[
                    { id: 'all', label: 'Todos' },
                    { id: 'pendente', label: 'Pendentes' },
                    { id: 'entregue', label: 'Entregues' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id as typeof filter)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.id
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Redemptions List */}
            <div className="space-y-3">
                {filteredRedemptions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhum resgate encontrado</p>
                    </div>
                ) : (
                    filteredRedemptions.map(redemption => (
                        <div
                            key={redemption.id}
                            className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                        >
                            {/* Student Avatar */}
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {redemption.studentAvatar}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-slate-900 dark:text-white truncate">
                                        {redemption.studentName}
                                    </p>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${redemption.status === 'pendente'
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        }`}>
                                        {redemption.status === 'pendente' ? 'Pendente' : 'Entregue'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {redemption.rewardTitle} • {redemption.points.toLocaleString()} pts
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                    {new Date(redemption.date).toLocaleDateString('pt-BR')}
                                </p>
                            </div>

                            {/* Action */}
                            {redemption.status === 'pendente' && (
                                <button
                                    onClick={() => handleDeliver(redemption.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors text-sm"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="hidden sm:inline">Marcar Entregue</span>
                                </button>
                            )}

                            {redemption.status === 'entregue' && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="hidden sm:inline">Entregue</span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
