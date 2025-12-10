import { useState, useEffect, useCallback, useMemo } from 'react';

// Types
export interface InsightMetadata {
    metric: string;
    threshold: number;
    current: number;
    percentChange: number;
}

export interface Insight {
    id: string;
    priority: 'high' | 'medium' | 'low';
    type: 'warning' | 'suggestion' | 'achievement' | 'alert';
    title: string;
    message: string;
    actionTemplate?: string;
    actionUrl?: string;
    dismissedAt?: string;
    metadata: InsightMetadata;
}

export interface StudentMetrics {
    checkInsThisWeek: number;
    expectedWeekly: number;
    weightLossThisMonth: number;
    avgMonthlyWeightLoss: number;
    dietCheckInsThisWeek: number;
    totalDaysThisWeek: number;
    daysUntilRenewal: number;
    lastStrengthIncrease: number;
    daysSinceLastTraining: number;
    daysSinceLastEvaluation: number;
}

interface UseStudentInsightsOptions {
    cacheHours?: number;
    autoFetch?: boolean;
}

interface UseStudentInsightsReturn {
    insights: Insight[];
    isLoading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    dismissInsight: (insightId: string) => Promise<void>;
    highPriorityCount: number;
    hasAlerts: boolean;
}

// Mock metrics generator
const generateMockMetrics = (_studentId: string): StudentMetrics => {
    // Note: _studentId could be used to seed deterministic random values in real implementation
    return {
        checkInsThisWeek: Math.floor(Math.random() * 5),
        expectedWeekly: 4,
        weightLossThisMonth: 1.5 + Math.random() * 2,
        avgMonthlyWeightLoss: 1.2,
        dietCheckInsThisWeek: Math.floor(Math.random() * 7),
        totalDaysThisWeek: 7,
        daysUntilRenewal: [7, 14, 30, 60][Math.floor(Math.random() * 4)],
        lastStrengthIncrease: Math.random() > 0.5 ? 5 : 0,
        daysSinceLastTraining: Math.floor(Math.random() * 7),
        daysSinceLastEvaluation: Math.floor(Math.random() * 60) + 10,
    };
};

// Insight rules engine
const generateInsights = (studentId: string, studentName: string, metrics: StudentMetrics): Insight[] => {
    const insights: Insight[] = [];
    const firstName = studentName.split(' ')[0];

    // Rule 1 - Aderência Baixa
    const adherenceRatio = metrics.checkInsThisWeek / metrics.expectedWeekly;
    if (adherenceRatio < 0.5) {
        insights.push({
            id: `adherence-low-${studentId}`,
            priority: 'high',
            type: 'alert',
            title: `${firstName}, cadê você?`,
            message: `Você completou apenas ${Math.round(adherenceRatio * 100)}% dos treinos dessa semana. Quer retomar?`,
            actionTemplate: 'Volta aos Treinos',
            metadata: {
                metric: 'adherence',
                threshold: 50,
                current: Math.round(adherenceRatio * 100),
                percentChange: -Math.round((1 - adherenceRatio) * 100),
            },
        });
    }

    // Rule 2 - Progresso Acelerado
    const progressRatio = metrics.weightLossThisMonth / metrics.avgMonthlyWeightLoss;
    if (progressRatio > 1.5) {
        insights.push({
            id: `progress-fast-${studentId}`,
            priority: 'low',
            type: 'achievement',
            title: 'Parabéns! 🎉',
            message: `Seu progresso acelerou ${Math.round((progressRatio - 1) * 100)}% comparado à média. Ótimo trabalho!`,
            actionTemplate: 'Parabéns pelo Progresso',
            metadata: {
                metric: 'weight_loss',
                threshold: 150,
                current: Math.round(progressRatio * 100),
                percentChange: Math.round((progressRatio - 1) * 100),
            },
        });
    }

    // Rule 3 - Dieta Incompleta
    const dietRatio = metrics.dietCheckInsThisWeek / metrics.totalDaysThisWeek;
    if (dietRatio < 0.6) {
        insights.push({
            id: `diet-incomplete-${studentId}`,
            priority: 'medium',
            type: 'warning',
            title: 'Atenção à Alimentação',
            message: `Você preencheu o check-in de dieta em apenas ${Math.round(dietRatio * 100)}% dos dias.`,
            actionTemplate: 'Lembrete de Dieta',
            metadata: {
                metric: 'diet_checkins',
                threshold: 60,
                current: Math.round(dietRatio * 100),
                percentChange: -Math.round((0.6 - dietRatio) * 100),
            },
        });
    }

    // Rule 4 - Vencimento de Plano
    if (metrics.daysUntilRenewal === 7) {
        insights.push({
            id: `renewal-soon-${studentId}`,
            priority: 'high',
            type: 'suggestion',
            title: 'Seu plano vence em 7 dias',
            message: 'Aproveite o desconto early bird: +2 meses grátis!',
            actionUrl: `/admin/student/${studentId}?tab=dados-pessoais`,
            metadata: {
                metric: 'days_until_renewal',
                threshold: 7,
                current: 7,
                percentChange: 0,
            },
        });
    }

    // Rule 5 - Força Progressão
    if (metrics.lastStrengthIncrease > 0 && metrics.daysSinceLastTraining > 3) {
        insights.push({
            id: `strength-return-${studentId}`,
            priority: 'low',
            type: 'suggestion',
            title: 'Hora de voltar aos treinos',
            message: 'Você teve ganho de força. Volte para manter o progresso!',
            actionTemplate: 'Volta aos Treinos',
            metadata: {
                metric: 'strength_progression',
                threshold: 3,
                current: metrics.daysSinceLastTraining,
                percentChange: metrics.lastStrengthIncrease,
            },
        });
    }

    // Rule 6 - Avaliação Atrasada
    if (metrics.daysSinceLastEvaluation > 45) {
        insights.push({
            id: `evaluation-overdue-${studentId}`,
            priority: 'medium',
            type: 'alert',
            title: 'Avaliação vencida',
            message: `Última avaliação foi há ${metrics.daysSinceLastEvaluation} dias. Agende uma nova!`,
            actionUrl: `/admin/student/${studentId}?action=schedule-eval`,
            metadata: {
                metric: 'days_since_evaluation',
                threshold: 45,
                current: metrics.daysSinceLastEvaluation,
                percentChange: Math.round(((metrics.daysSinceLastEvaluation - 45) / 45) * 100),
            },
        });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

// Cache management
const CACHE_KEY_PREFIX = 'fitpro_insights_';
const DEFAULT_CACHE_HOURS = 6;

interface CachedData {
    insights: Insight[];
    timestamp: number;
}

const getCachedInsights = (studentId: string, cacheHours: number): Insight[] | null => {
    try {
        const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${studentId}`);
        if (!cached) return null;

        const data: CachedData = JSON.parse(cached);
        const now = Date.now();
        const cacheExpiry = data.timestamp + (cacheHours * 60 * 60 * 1000);

        if (now < cacheExpiry) {
            return data.insights;
        }
        return null;
    } catch {
        return null;
    }
};

const setCachedInsights = (studentId: string, insights: Insight[]): void => {
    try {
        const data: CachedData = {
            insights,
            timestamp: Date.now(),
        };
        localStorage.setItem(`${CACHE_KEY_PREFIX}${studentId}`, JSON.stringify(data));
    } catch {
        // Silently fail if localStorage is full
    }
};

/**
 * Hook for fetching and managing student insights with automatic recommendations
 * 
 * @param studentId - The ID of the student
 * @param studentName - The name of the student (for personalized messages)
 * @param options - Configuration options
 * @returns Insights data and management functions
 * 
 * @example
 * ```tsx
 * const { insights, isLoading, dismissInsight, highPriorityCount } = useStudentInsights(
 *   student.id,
 *   student.name,
 *   { cacheHours: 6 }
 * );
 * ```
 */
export function useStudentInsights(
    studentId: string,
    studentName: string,
    options: UseStudentInsightsOptions = {}
): UseStudentInsightsReturn {
    const { cacheHours = DEFAULT_CACHE_HOURS, autoFetch = true } = options;

    const [insights, setInsights] = useState<Insight[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchInsights = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Check cache first
            const cached = getCachedInsights(studentId, cacheHours);
            if (cached) {
                setInsights(cached);
                setIsLoading(false);
                return;
            }

            // Simulate API call - replace with real endpoint
            // GET /api/students/{studentId}/insights
            await new Promise(resolve => setTimeout(resolve, 500));

            // Generate mock metrics and insights
            const metrics = generateMockMetrics(studentId);
            const generatedInsights = generateInsights(studentId, studentName, metrics);

            // Cache the results
            setCachedInsights(studentId, generatedInsights);
            setInsights(generatedInsights);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch insights'));
        } finally {
            setIsLoading(false);
        }
    }, [studentId, studentName, cacheHours]);

    const dismissInsight = useCallback(async (insightId: string) => {
        try {
            // Simulate API call - replace with real endpoint
            // POST /api/students/{studentId}/insights/{insightId}/dismiss
            await new Promise(resolve => setTimeout(resolve, 200));

            setInsights(prev =>
                prev.map(insight =>
                    insight.id === insightId
                        ? { ...insight, dismissedAt: new Date().toISOString() }
                        : insight
                )
            );

            // Update cache
            const updatedInsights = insights.map(insight =>
                insight.id === insightId
                    ? { ...insight, dismissedAt: new Date().toISOString() }
                    : insight
            );
            setCachedInsights(studentId, updatedInsights);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to dismiss insight'));
        }
    }, [studentId, insights]);

    const refresh = useCallback(async () => {
        // Clear cache and refetch
        localStorage.removeItem(`${CACHE_KEY_PREFIX}${studentId}`);
        await fetchInsights();
    }, [studentId, fetchInsights]);

    // Computed values
    const activeInsights = useMemo(() =>
        insights.filter(i => !i.dismissedAt),
        [insights]
    );

    const highPriorityCount = useMemo(() =>
        activeInsights.filter(i => i.priority === 'high').length,
        [activeInsights]
    );

    const hasAlerts = useMemo(() =>
        activeInsights.some(i => i.type === 'alert'),
        [activeInsights]
    );

    // Auto-fetch on mount
    useEffect(() => {
        if (autoFetch) {
            fetchInsights();
        }
    }, [autoFetch, fetchInsights]);

    return {
        insights: activeInsights,
        isLoading,
        error,
        refresh,
        dismissInsight,
        highPriorityCount,
        hasAlerts,
    };
}

export default useStudentInsights;
