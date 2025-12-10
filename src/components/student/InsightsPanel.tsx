import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    Sparkles,
    Lightbulb,
    Bell,
    X,
    ChevronRight,
    ExternalLink,
    MessageSquare,
    RefreshCw
} from 'lucide-react';
import { useStudentInsights, Insight } from '../../hooks/useStudentInsights';

// ============================================
// InsightCard Component
// ============================================
interface InsightCardProps {
    insight: Insight;
    onDismiss: (id: string) => void;
    onAction: (actionType: 'template' | 'url', payload: string) => void;
}

const typeConfig = {
    alert: {
        icon: AlertTriangle,
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        iconColor: 'text-red-500',
        badge: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    },
    warning: {
        icon: Bell,
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        iconColor: 'text-yellow-500',
        badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    },
    suggestion: {
        icon: Lightbulb,
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        iconColor: 'text-blue-500',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    },
    achievement: {
        icon: Sparkles,
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        iconColor: 'text-green-500',
        badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    },
};

const priorityLabels = {
    high: 'Urgente',
    medium: 'Médio',
    low: 'Baixo',
};

export function InsightCard({ insight, onDismiss, onAction }: InsightCardProps) {
    const config = typeConfig[insight.type];
    const Icon = config.icon;

    const handleAction = () => {
        if (insight.actionUrl) {
            onAction('url', insight.actionUrl);
        } else if (insight.actionTemplate) {
            onAction('template', insight.actionTemplate);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`relative p-4 rounded-xl border ${config.border} ${config.bg} group`}
        >
            {/* Dismiss button */}
            <button
                onClick={() => onDismiss(insight.id)}
                className="absolute top-3 right-3 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all"
            >
                <X className="w-4 h-4 text-slate-400" />
            </button>

            <div className="flex gap-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                            {insight.title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.badge}`}>
                            {priorityLabels[insight.priority]}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {insight.message}
                    </p>

                    {/* Metrics */}
                    {insight.metadata && (
                        <div className="flex items-center gap-4 mb-3 text-xs">
                            <span className="text-slate-500">
                                {insight.metadata.metric}: <strong className={config.iconColor}>{insight.metadata.current}%</strong>
                            </span>
                            {insight.metadata.percentChange !== 0 && (
                                <span className={insight.metadata.percentChange > 0 ? 'text-green-500' : 'text-red-500'}>
                                    {insight.metadata.percentChange > 0 ? '+' : ''}{insight.metadata.percentChange}%
                                </span>
                            )}
                        </div>
                    )}

                    {/* Action button */}
                    {(insight.actionTemplate || insight.actionUrl) && (
                        <button
                            onClick={handleAction}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 ${config.iconColor} hover:shadow-md transition-all`}
                        >
                            {insight.actionUrl ? (
                                <>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Ver Detalhes
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    {insight.actionTemplate}
                                </>
                            )}
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ============================================
// InsightsPanel Component
// ============================================
interface InsightsPanelProps {
    studentId: string;
    studentName: string;
    onSendMessage?: (templateName: string) => void;
    onNavigate?: (url: string) => void;
}

export default function InsightsPanel({
    studentId,
    studentName,
    onSendMessage,
    onNavigate
}: InsightsPanelProps) {
    const {
        insights,
        isLoading,
        refresh,
        dismissInsight,
        highPriorityCount,
        hasAlerts
    } = useStudentInsights(studentId, studentName);

    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refresh();
        setIsRefreshing(false);
    };

    const handleAction = (actionType: 'template' | 'url', payload: string) => {
        if (actionType === 'template' && onSendMessage) {
            onSendMessage(payload);
        } else if (actionType === 'url' && onNavigate) {
            onNavigate(payload);
        } else if (actionType === 'url') {
            // Fallback to window navigation
            window.location.href = payload;
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-primary-500" />
                        Insights & Recomendações
                    </h3>
                    {highPriorityCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                            {highPriorityCount} urgente{highPriorityCount > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Insights list */}
            {insights.length === 0 ? (
                <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Tudo certo por aqui! 🎉
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                        Nenhuma recomendação pendente para este aluno.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {insights.map(insight => (
                            <InsightCard
                                key={insight.id}
                                insight={insight}
                                onDismiss={dismissInsight}
                                onAction={handleAction}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Alert indicator */}
            {hasAlerts && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2"
                >
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                        Este aluno precisa de atenção imediata
                    </span>
                </motion.div>
            )}
        </div>
    );
}

// Export only default as main component
// InsightCard is already exported as named export above

