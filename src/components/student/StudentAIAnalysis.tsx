import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { generateStudentAnalysis } from '../../services/aiService';
import { Student } from '../../data/mockStudents';

interface StudentAIAnalysisProps {
    student: Student;
}

interface AnalysisResult {
    summary: string;
    trend: 'improving' | 'stable' | 'declining';
    riskLevel: 'high' | 'medium' | 'low';
    recommendations: string[];
}

export default function StudentAIAnalysis({ student }: StudentAIAnalysisProps) {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        setError(false);
        try {
            const result = await generateStudentAnalysis(student);
            setAnalysis(result);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    // Auto-analyze on mount if not already analyzed (optional, maybe make it on demand to save tokens)
    // For now, let's make it on demand via a button or auto if we want "Live Insights"
    // Let's go with "Click to Analyze" to show the "AI working" sensation

    if (!analysis && !loading) {
        return (
            <div className="card-base p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Insights</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Descubra tendências, riscos e oportunidades para {student.name.split(' ')[0]}.
                        </p>
                    </div>
                    <button
                        onClick={handleAnalyze}
                        className="ml-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        Gerar Análise
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="card-base p-6 flex flex-col items-center justify-center py-12 gap-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-600 rounded-full animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-slate-500 text-sm animate-pulse">Analisando performance e histórico...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card-base p-4 bg-red-50 text-red-600 text-sm text-center">
                Falha ao gerar análise. Tente novamente.
            </div>
        );
    }

    return (
        <div className="card-base p-6 border-l-4 border-l-indigo-500 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Sparkles className="w-32 h-32 text-indigo-600" />
            </div>

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-bold uppercase tracking-wider">
                            AI Output
                        </span>
                        <span className="text-xs text-slate-400">Gerado agora</span>
                    </div>
                    <button onClick={handleAnalyze} className="text-xs text-indigo-600 hover:underline">Atualizar</button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-relaxed">
                            {analysis?.summary}
                        </h3>

                        <div className="flex flex-wrap gap-2 mt-4">
                            {analysis?.trend === 'improving' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                    <TrendingUp className="w-3.5 h-3.5" /> Tendência Positiva
                                </span>
                            )}
                            {analysis?.trend === 'declining' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                    <TrendingDown className="w-3.5 h-3.5" /> Tendência de Queda
                                </span>
                            )}
                            {analysis?.trend === 'stable' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                                    <Minus className="w-3.5 h-3.5" /> Estável
                                </span>
                            )}

                            {analysis?.riskLevel === 'high' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Risco de Dropout Alto
                                </span>
                            )}
                            {analysis?.riskLevel === 'medium' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Risco Moderado
                                </span>
                            )}
                            {analysis?.riskLevel === 'low' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Engajamento Saudável
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="md:w-64 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-3">Recomendações</p>
                        <ul className="space-y-2">
                            {analysis?.recommendations.map((rec, i) => (
                                <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <span className="text-indigo-500">•</span>
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
