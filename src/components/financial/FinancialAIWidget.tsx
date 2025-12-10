import { useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { generateFinancialInsights } from '../../services/aiService';

interface FinancialAIWidgetProps {
    financialData: {
        mrr: number;
        activeStudents: number;
        churnRate: number;
        pendingAmount: number;
        cashFlowBalance: number;
    };
}

interface FinancialAnalysis {
    status: 'healthy' | 'warning' | 'danger';
    title: string;
    insights: string[];
    forecast: string;
}

export default function FinancialAIWidget({ financialData }: FinancialAIWidgetProps) {
    const [analysis, setAnalysis] = useState<FinancialAnalysis | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const result = await generateFinancialInsights(financialData);
            setAnalysis(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!analysis && !loading) {
        return (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden mb-6">
                {/* Decorative */}
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="w-32 h-32" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Sparkles className="w-6 h-6 text-[#00FFEF]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">CFO Virtual</h3>
                            <p className="text-slate-300 text-sm">Use a IA para encontrar oportunidades de lucro ocultas.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleAnalyze}
                        className="px-5 py-2.5 bg-[#00FFEF] text-slate-900 font-bold rounded-xl hover:bg-[#00E5D7] transition-colors shadow-[0_0_20px_rgba(0,255,239,0.3)] flex items-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        Analisar Finanças
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl mb-6 flex items-center justify-center py-10 gap-3">
                <div className="w-5 h-5 border-2 border-white/20 border-t-[#00FFEF] rounded-full animate-spin" />
                <span className="text-sm font-medium animate-pulse">Processando dados financeiros...</span>
            </div>
        );
    }

    return (
        <div className={`rounded-2xl p-6 shadow-xl mb-6 border-l-4 relative overflow-hidden ${analysis?.status === 'healthy' ? 'bg-emerald-50 border-emerald-500' :
                analysis?.status === 'warning' ? 'bg-amber-50 border-amber-500' :
                    'bg-red-50 border-red-500'
            } dark:bg-slate-800`}>

            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${analysis?.status === 'healthy' ? 'bg-emerald-100 text-emerald-600' :
                            analysis?.status === 'warning' ? 'bg-amber-100 text-amber-600' :
                                'bg-red-100 text-red-600'
                        }`}>
                        {analysis?.status === 'healthy' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold ${analysis?.status === 'healthy' ? 'text-emerald-800 dark:text-emerald-400' :
                                analysis?.status === 'warning' ? 'text-amber-800 dark:text-amber-400' :
                                    'text-red-800 dark:text-red-400'
                            }`}>
                            {analysis?.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Análise de IA</p>
                    </div>
                </div>
                <button onClick={handleAnalyze} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase">Atualizar</button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Insights Estratégicos</p>
                    <ul className="space-y-2">
                        {analysis?.insights.map((insight, i) => (
                            <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <span className="text-primary mt-0.5">•</span>
                                {insight}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white/50 dark:bg-black/20 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase">Previsão</span>
                    </div>
                    <p className="text-slate-800 dark:text-white font-medium text-sm leading-relaxed">
                        "{analysis?.forecast}"
                    </p>
                </div>
            </div>
        </div>
    );
}
