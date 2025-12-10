import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    Lightbulb,
    Bell,
    X,
    ChevronRight,
    CheckCircle,
    Info
} from 'lucide-react';
import { useStudentInsights, Insight } from '../../hooks/useStudentInsights';

// Compact notification item - inline style
interface NotificationItemProps {
    insight: Insight;
    onDismiss: (id: string) => void;
    onAction?: () => void;
}

const typeIcons = {
    alert: AlertTriangle,
    warning: Bell,
    suggestion: Lightbulb,
    achievement: CheckCircle,
};

const typeColors = {
    alert: 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    suggestion: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    achievement: 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
};

function NotificationItem({ insight, onDismiss, onAction }: NotificationItemProps) {
    const Icon = typeIcons[insight.type];
    const colorClass = typeColors[insight.type];

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${colorClass} group cursor-pointer hover:shadow-sm transition-all`}
            onClick={onAction}
        >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {insight.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {insight.message}
                </p>
            </div>
            {(insight.actionTemplate || insight.actionUrl) && (
                <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
            <button
                onClick={(e) => { e.stopPropagation(); onDismiss(insight.id); }}
                className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all"
            >
                <X className="w-3 h-3 text-slate-400" />
            </button>
        </motion.div>
    );
}

// Main compact notifications component for student profile
interface StudentNotificationsProps {
    studentId: string;
    studentName: string;
    maxVisible?: number;
    onNavigate?: (url: string) => void;
}

export default function StudentNotifications({
    studentId,
    studentName,
    maxVisible = 3,
    onNavigate
}: StudentNotificationsProps) {
    const {
        insights,
        isLoading,
        dismissInsight,
        highPriorityCount
    } = useStudentInsights(studentId, studentName);

    const [showAll, setShowAll] = useState(false);

    const visibleInsights = showAll ? insights : insights.slice(0, maxVisible);
    const hiddenCount = insights.length - maxVisible;

    const handleAction = (insight: Insight) => {
        if (insight.actionUrl && onNavigate) {
            onNavigate(insight.actionUrl);
        } else if (insight.actionUrl) {
            window.location.href = insight.actionUrl;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (insights.length === 0) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-sm text-green-700 dark:text-green-300">
                    Tudo certo! Nenhuma pendência.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {/* Header with count */}
            {highPriorityCount > 0 && (
                <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {highPriorityCount} notificação{highPriorityCount > 1 ? 'ões' : ''} importante{highPriorityCount > 1 ? 's' : ''}
                    </span>
                </div>
            )}

            {/* Notifications list */}
            <AnimatePresence>
                {visibleInsights.map(insight => (
                    <NotificationItem
                        key={insight.id}
                        insight={insight}
                        onDismiss={dismissInsight}
                        onAction={() => handleAction(insight)}
                    />
                ))}
            </AnimatePresence>

            {/* Show more / less */}
            {hiddenCount > 0 && !showAll && (
                <button
                    onClick={() => setShowAll(true)}
                    className="w-full text-xs text-primary font-medium py-1 hover:underline"
                >
                    Ver mais {hiddenCount} notificação{hiddenCount > 1 ? 'ões' : ''}
                </button>
            )}
            {showAll && insights.length > maxVisible && (
                <button
                    onClick={() => setShowAll(false)}
                    className="w-full text-xs text-slate-400 font-medium py-1 hover:underline"
                >
                    Mostrar menos
                </button>
            )}
        </div>
    );
}
