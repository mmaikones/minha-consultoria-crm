import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Star,
    AlertTriangle,
    Activity,
    Target,
    Dumbbell,
    Calendar,
    Utensils,
    MessageSquare,
    ClipboardCheck,
    Sparkles,
    RefreshCw
} from 'lucide-react';

// Types
interface HealthScoreBreakdown {
    adherence: number;
    bodyComposition: number;
    strength: number;
    consistency: number;
    nutrition: number;
}

interface HealthScore {
    overall: number;
    breakdown: HealthScoreBreakdown;
    trend: 'improving' | 'stable' | 'declining';
    lastUpdated: string;
}

interface HealthScoreDashboardProps {
    studentId: string;
    studentName?: string;
}

// Mock data generator
const generateMockHealthScore = (studentId: string): HealthScore => {
    // Simulate different scores based on student ID for variety
    const seed = studentId.charCodeAt(0) || 1;
    const baseScore = 50 + (seed % 40);

    return {
        overall: Math.min(95, Math.max(35, baseScore + Math.floor(Math.random() * 20))),
        breakdown: {
            adherence: Math.min(100, Math.max(20, baseScore + Math.floor(Math.random() * 30))),
            bodyComposition: Math.min(100, Math.max(25, baseScore + Math.floor(Math.random() * 25))),
            strength: Math.min(100, Math.max(30, baseScore + Math.floor(Math.random() * 35))),
            consistency: Math.min(100, Math.max(15, baseScore + Math.floor(Math.random() * 40))),
            nutrition: Math.min(100, Math.max(20, baseScore + Math.floor(Math.random() * 30))),
        },
        trend: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)] as HealthScore['trend'],
        lastUpdated: new Date().toISOString(),
    };
};

// Calculate score from breakdown
const calculateOverallScore = (breakdown: HealthScoreBreakdown): number => {
    return Math.round(
        (breakdown.adherence * 0.3) +
        (breakdown.bodyComposition * 0.25) +
        (breakdown.consistency * 0.2) +
        (breakdown.nutrition * 0.15) +
        (breakdown.strength * 0.1)
    );
};

// Get color based on score
const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
};

const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
};

const getScoreGradient = (score: number): string => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-amber-600';
    return 'from-red-500 to-rose-600';
};

// ============================================
// SUB-COMPONENT: HealthScoreCircle
// ============================================
interface HealthScoreCircleProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    showStar?: boolean;
}

function HealthScoreCircle({ score, size = 'lg', showStar = false }: HealthScoreCircleProps) {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedScore(score), 100);
        return () => clearTimeout(timer);
    }, [score]);

    const sizes = {
        sm: { outer: 80, stroke: 6, text: 'text-xl' },
        md: { outer: 120, stroke: 8, text: 'text-3xl' },
        lg: { outer: 160, stroke: 10, text: 'text-5xl' },
    };

    const { outer, stroke, text } = sizes[size];
    const radius = (outer - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (animatedScore / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={outer} height={outer} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={outer / 2}
                    cy={outer / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={stroke}
                    className="text-slate-200 dark:text-slate-700"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={outer / 2}
                    cy={outer / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - progress }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                />
                <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" className={score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'} stopColor="currentColor" />
                        <stop offset="100%" className={score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600'} stopColor="currentColor" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    className={`${text} font-bold ${getScoreColor(score)}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    {animatedScore}
                </motion.span>
                <span className="text-xs text-slate-500 font-medium">de 100</span>
            </div>

            {/* Star badge for high score */}
            {showStar && score >= 80 && (
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1, type: 'spring' }}
                    className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg"
                >
                    <Star className="w-4 h-4 text-white fill-white" />
                </motion.div>
            )}
        </div>
    );
}

// ============================================
// SUB-COMPONENT: ScoreBreakdown
// ============================================
interface ScoreBreakdownProps {
    breakdown: HealthScoreBreakdown;
}

const breakdownConfig = [
    { key: 'adherence', label: 'Aderência', icon: Target, weight: '30%', description: 'Check-ins vs meta' },
    { key: 'bodyComposition', label: 'Composição', icon: Activity, weight: '25%', description: '% gordura vs meta' },
    { key: 'consistency', label: 'Consistência', icon: Calendar, weight: '20%', description: 'Frequência regular' },
    { key: 'nutrition', label: 'Nutrição', icon: Utensils, weight: '15%', description: 'Check-in dieta' },
    { key: 'strength', label: 'Força', icon: Dumbbell, weight: '10%', description: 'Evolução de força' },
] as const;

function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {breakdownConfig.map(({ key, label, icon: Icon, weight, description }, index) => {
                const score = breakdown[key as keyof HealthScoreBreakdown];
                return (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`w-8 h-8 rounded-lg ${getScoreBgColor(score)}/10 flex items-center justify-center`}>
                                <Icon className={`w-4 h-4 ${getScoreColor(score)}`} />
                            </div>
                            <span className="text-xs font-medium text-slate-500">{weight}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
                        <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
                            <span className="text-xs text-slate-400">/100</span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(score)}`}
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{description}</p>
                    </motion.div>
                );
            })}
        </div>
    );
}

// ============================================
// SUB-COMPONENT: ScoreTrend
// ============================================
interface ScoreTrendProps {
    trend: HealthScore['trend'];
    percentChange?: number;
}

function ScoreTrend({ trend, percentChange = 5 }: ScoreTrendProps) {
    const config = {
        improving: {
            icon: TrendingUp,
            color: 'text-green-500',
            bg: 'bg-green-50 dark:bg-green-900/20',
            label: 'Melhorando',
            sign: '+',
        },
        stable: {
            icon: Minus,
            color: 'text-yellow-500',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            label: 'Estável',
            sign: '',
        },
        declining: {
            icon: TrendingDown,
            color: 'text-red-500',
            bg: 'bg-red-50 dark:bg-red-900/20',
            label: 'Declinando',
            sign: '-',
        },
    };

    const { icon: Icon, color, bg, label, sign } = config[trend];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${bg}`}
        >
            <Icon className={`w-4 h-4 ${color}`} />
            <span className={`text-sm font-medium ${color}`}>{label}</span>
            {trend !== 'stable' && (
                <span className={`text-xs font-bold ${color}`}>
                    {sign}{percentChange}%
                </span>
            )}
        </motion.div>
    );
}

// ============================================
// SUB-COMPONENT: ActionCards
// ============================================
interface ActionCardsProps {
    score: number;
    breakdown: HealthScoreBreakdown;
}

function ActionCards({ score, breakdown }: ActionCardsProps) {
    // Generate actions based on lowest scores
    const getActions = () => {
        const actions = [];

        // Alert if score is low
        if (score < 60) {
            actions.push({
                icon: AlertTriangle,
                title: 'Atenção Necessária',
                description: 'Score abaixo do ideal. Agendar check-in urgente.',
                color: 'text-red-500',
                bg: 'bg-red-50 dark:bg-red-900/20',
                border: 'border-red-200 dark:border-red-800',
                action: 'Agendar Check-in',
            });
        }

        // Suggest improvements based on lowest scores
        const sortedBreakdown = Object.entries(breakdown)
            .sort(([, a], [, b]) => a - b)
            .slice(0, 2);

        sortedBreakdown.forEach(([key, value]) => {
            if (value < 70) {
                const config: Record<string, any> = {
                    adherence: {
                        icon: ClipboardCheck,
                        title: 'Aumentar Aderência',
                        description: 'Enviar lembrete de check-in semanal',
                        action: 'Enviar Lembrete',
                    },
                    nutrition: {
                        icon: Utensils,
                        title: 'Melhorar Nutrição',
                        description: 'Revisar plano alimentar do aluno',
                        action: 'Revisar Dieta',
                    },
                    consistency: {
                        icon: Calendar,
                        title: 'Aumentar Consistência',
                        description: 'Agendar treinos fixos na agenda',
                        action: 'Agendar Treinos',
                    },
                    bodyComposition: {
                        icon: Activity,
                        title: 'Otimizar Composição',
                        description: 'Ajustar protocolo de treino/dieta',
                        action: 'Ajustar Protocolo',
                    },
                    strength: {
                        icon: Dumbbell,
                        title: 'Desenvolver Força',
                        description: 'Aumentar progressão de carga',
                        action: 'Ver Treino',
                    },
                };

                if (config[key]) {
                    actions.push({
                        ...config[key],
                        color: 'text-primary-600',
                        bg: 'bg-primary-50 dark:bg-primary-900/20',
                        border: 'border-primary-200 dark:border-primary-800',
                    });
                }
            }
        });

        // Add positive reinforcement for high scores
        if (score >= 80) {
            actions.push({
                icon: Sparkles,
                title: 'Excelente Performance!',
                description: 'Enviar mensagem de parabéns ao aluno',
                color: 'text-green-500',
                bg: 'bg-green-50 dark:bg-green-900/20',
                border: 'border-green-200 dark:border-green-800',
                action: 'Enviar Parabéns',
            });
        }

        // Always add quick message option
        actions.push({
            icon: MessageSquare,
            title: 'Enviar Mensagem',
            description: 'Entrar em contato com o aluno',
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800',
            action: 'Abrir Chat',
        });

        return actions.slice(0, 4);
    };

    const actions = getActions();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actions.map((action, index) => (
                <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className={`p-4 rounded-xl border ${action.border} ${action.bg} cursor-pointer hover:shadow-md transition-all group`}
                >
                    <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm`}>
                            <action.icon className={`w-5 h-5 ${action.color}`} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{action.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
                        </div>
                    </div>
                    <button className={`mt-3 w-full py-2 rounded-lg text-xs font-medium ${action.color} bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors`}>
                        {action.action}
                    </button>
                </motion.div>
            ))}
        </div>
    );
}

// ============================================
// MAIN COMPONENT: HealthScoreDashboard
// ============================================
export default function HealthScoreDashboard({ studentId, studentName }: HealthScoreDashboardProps) {
    const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchHealthScore = async (refresh = false) => {
        if (refresh) setIsRefreshing(true);
        else setIsLoading(true);

        // Simulate API call - replace with real endpoint
        // GET /api/students/{studentId}/health-score
        await new Promise(resolve => setTimeout(resolve, 800));

        const data = generateMockHealthScore(studentId);
        // Recalculate overall to ensure consistency
        data.overall = calculateOverallScore(data.breakdown);

        setHealthScore(data);
        setIsLoading(false);
        setIsRefreshing(false);
    };

    useEffect(() => {
        fetchHealthScore();
    }, [studentId]);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                    <div className="flex justify-center">
                        <div className="w-40 h-40 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!healthScore) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary-500" />
                        Score de Saúde
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Atualizado em {new Date(healthScore.lastUpdated).toLocaleDateString('pt-BR')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ScoreTrend trend={healthScore.trend} />
                    <button
                        onClick={() => fetchHealthScore(true)}
                        disabled={isRefreshing}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Main Score Circle */}
            <div className="flex flex-col items-center py-4">
                <HealthScoreCircle score={healthScore.overall} showStar />

                {/* Alert for low score */}
                <AnimatePresence>
                    {healthScore.overall < 60 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                        >
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                                Score baixo - Recomendado agendar check-in
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Score Breakdown */}
            <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Detalhamento por Categoria
                </h4>
                <ScoreBreakdown breakdown={healthScore.breakdown} />
            </div>

            {/* Action Cards */}
            <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Ações Sugeridas
                </h4>
                <ActionCards score={healthScore.overall} breakdown={healthScore.breakdown} />
            </div>
        </div>
    );
}

// Export sub-components for potential individual use
export { HealthScoreCircle, ScoreBreakdown, ScoreTrend, ActionCards };
export type { HealthScore, HealthScoreBreakdown };
