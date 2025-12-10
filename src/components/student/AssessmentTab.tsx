import { Plus, Camera, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockAssessments } from '../../data/mockAssessments';
import MeasurementsTab from './MeasurementsTab';

export default function AssessmentTab() {
    const chartData = mockAssessments.map(a => ({
        date: new Date(a.date).toLocaleDateString('pt-BR', { month: 'short' }),
        bf: a.bodyFat,
    }));

    const beforeAssessment = mockAssessments.find(a => a.photoUrl === 'before');
    const afterAssessment = mockAssessments.find(a => a.photoUrl === 'after');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Avaliações Físicas
                </h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    <span>Nova Avaliação</span>
                </button>
            </div>

            {/* Before & After Photos */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Camera className="w-5 h-5 text-slate-500" />
                    <h3 className="font-medium text-slate-900 dark:text-white">Comparativo Visual</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Before */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                        <div className="aspect-[3/4] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-lg mb-3 flex items-center justify-center">
                            <span className="text-4xl opacity-50">📷</span>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">Inicial</p>
                            <p className="text-xs text-slate-500">
                                {beforeAssessment && new Date(beforeAssessment.date).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                {beforeAssessment?.weight}kg • {beforeAssessment?.bodyFat}% BF
                            </p>
                        </div>
                    </div>

                    {/* After */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border-2 border-green-500">
                        <div className="aspect-[3/4] bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-lg mb-3 flex items-center justify-center">
                            <span className="text-4xl">💪</span>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-green-600">Atual</p>
                            <p className="text-xs text-slate-500">
                                {afterAssessment && new Date(afterAssessment.date).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-xs text-green-600 mt-1 font-medium">
                                {afterAssessment?.weight}kg • {afterAssessment?.bodyFat}% BF
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Summary */}
                {beforeAssessment && afterAssessment && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center gap-6">
                        <div className="text-center">
                            <p className="text-lg font-bold text-green-600">
                                -{beforeAssessment.weight - afterAssessment.weight}kg
                            </p>
                            <p className="text-xs text-slate-500">Peso</p>
                        </div>
                        <div className="w-px h-8 bg-green-200 dark:bg-green-800" />
                        <div className="text-center">
                            <p className="text-lg font-bold text-green-600">
                                -{beforeAssessment.bodyFat - afterAssessment.bodyFat}%
                            </p>
                            <p className="text-xs text-slate-500">Gordura</p>
                        </div>
                        <div className="w-px h-8 bg-green-200 dark:bg-green-800" />
                        <div className="text-center">
                            <p className="text-lg font-bold text-green-600">
                                -{beforeAssessment.waist - afterAssessment.waist}cm
                            </p>
                            <p className="text-xs text-slate-500">Cintura</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Body Fat Chart */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingDown className="w-5 h-5 text-green-500" />
                    <h3 className="font-medium text-slate-900 dark:text-white">Evolução do % Gordura</h3>
                </div>

                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                }}
                                formatter={(value: number) => [`${value}%`, 'Body Fat']}
                            />
                            <Line
                                type="monotone"
                                dataKey="bf"
                                stroke="#22c55e"
                                strokeWidth={3}
                                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Measurements Section */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <MeasurementsTab />
            </div>
        </div>
    );
}
