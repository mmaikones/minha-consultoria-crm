import { useState } from 'react';
import { Trophy, Settings, Gift, Clock, Medal, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RulesTab from '../components/gamification/RulesTab';
import RewardsTab from '../components/gamification/RewardsTab';
import RedemptionsTab from '../components/gamification/RedemptionsTab';
import LeaderboardTab from '../components/gamification/LeaderboardTab';
import { gamificationStats } from '../data/mockGamification';
import MarketingNav from '../components/marketing/MarketingNav';

type Tab = 'rules' | 'rewards' | 'redemptions' | 'leaderboard';

interface GamificationProps {
    showHeader?: boolean;
}

export default function Gamification({ showHeader = true }: GamificationProps) {
    const [activeTab, setActiveTab] = useState<Tab>('rules');
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const tabs = [
        { id: 'rules' as Tab, label: 'Regras de Pontuação', icon: Settings },
        { id: 'rewards' as Tab, label: 'Loja de Recompensas', icon: Gift },
        { id: 'redemptions' as Tab, label: 'Histórico de Resgates', icon: Clock },
        { id: 'leaderboard' as Tab, label: 'Ranking', icon: Medal },
    ];

    return (
        <div className="space-y-6">
            {/* Marketing Navigation */}
            {showHeader && <MarketingNav />}

            {/* Header */}
            {showHeader && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <Trophy className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Fidelidade & Gamificação
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Gerencie pontos, recompensas e engajamento
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {gamificationStats.totalPointsDistributed.toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Pontos Distribuídos</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <Gift className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {gamificationStats.activeRewards}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Recompensas Ativas</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {gamificationStats.pendingRedemptions}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Resgates Pendentes</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {gamificationStats.totalRedemptions}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Resgates Totais</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Tab Headers */}
                <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'rules' && (
                        <RulesTab onSave={() => showToast('✅ Regras atualizadas com sucesso!')} />
                    )}
                    {activeTab === 'rewards' && (
                        <RewardsTab onSave={() => showToast('✅ Recompensa salva com sucesso!')} />
                    )}
                    {activeTab === 'redemptions' && (
                        <RedemptionsTab onDeliver={() => showToast('✅ Resgate marcado como entregue!')} />
                    )}
                    {activeTab === 'leaderboard' && <LeaderboardTab />}
                </div>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl z-50 font-medium"
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
