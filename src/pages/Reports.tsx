import { useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Search,
    LucideIcon
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    monthlyMetrics,
    retentionData,
    goalDistribution,
    ageDistribution,
    reportSummary
} from '../data/mockReports';

type Period = '3m' | '6m' | '12m';

// KPI Card component defined outside to avoid recreation on each render
interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color: string;
}

function KPICard({ title, value, subtitle, icon: Icon, trend, trendUp, color }: KPICardProps) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trend}
                    </div>
                )}
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{title}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
    );
}

export default function Reports() {
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('6m');
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Relatórios</h1>
                    <p className="text-sm text-slate-500">Analytics e métricas da consultoria</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* Search & Filter */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar aluno..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-48"
                        />
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        {(['3m', '6m', '12m'] as Period[]).map(period => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedPeriod === period
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400'
                                    }`}
                            >
                                {period === '3m' ? '3 meses' : period === '6m' ? '6 meses' : '12 meses'}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 whitespace-nowrap">
                        <Download className="w-3.5 h-3.5" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KPICard
                    title="Alunos Ativos"
                    value={reportSummary.activeStudents}
                    subtitle={`de ${reportSummary.totalStudents} total`}
                    icon={Users}
                    trend="+12.5%"
                    trendUp={true}
                    color="bg-blue-500"
                />
                <KPICard
                    title="Receita (6m)"
                    value={`R$ ${(reportSummary.totalRevenue / 1000).toFixed(1)}k`}
                    subtitle="Projetado: R$ 95k"
                    icon={DollarSign}
                    trend="+18%"
                    trendUp={true}
                    color="bg-green-500"
                />
                <KPICard
                    title="Ticket Médio"
                    value={`R$ ${reportSummary.avgTicket}`}
                    icon={Target}
                    trend="+5.2%"
                    trendUp={true}
                    color="bg-purple-500"
                />
                <KPICard
                    title="Taxa de Churn"
                    value={`${reportSummary.churnRate}%`}
                    subtitle="Meta: < 5%"
                    icon={TrendingDown}
                    trend="-0.8%"
                    trendUp={true}
                    color="bg-orange-500"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Revenue + Students Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">
                        Receita vs Novos Alunos
                    </h3>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyMetrics}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickFormatter={v => `${v / 1000}k`} />
                                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                                <Bar yAxisId="left" dataKey="revenue" fill="#22c55e" name="Receita (R$)" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="right" dataKey="newStudents" fill="#3b82f6" name="Novos Alunos" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Retention Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">
                        Taxas de Retenção
                    </h3>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={retentionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                                    formatter={(value: number) => [`${value}%`, 'Retenção']}
                                />
                                <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Goal Distribution */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">
                        Objetivos dos Alunos
                    </h3>
                    <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={goalDistribution as any}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={65}
                                    paddingAngle={2}
                                    dataKey="count"
                                >
                                    {goalDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {goalDistribution.map(g => (
                            <div key={g.goal} className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                                <span className="text-[10px] text-slate-600 dark:text-slate-400">{g.goal}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Age Distribution */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">
                        Distribuição por Idade
                    </h3>
                    <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ageDistribution} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                                <YAxis dataKey="range" type="category" stroke="#94a3b8" fontSize={10} width={40} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                                <Bar dataKey="male" fill="#3b82f6" name="Homens" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="female" fill="#ec4899" name="Mulheres" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monthly Summary */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">
                        Fluxo Mensal
                    </h3>
                    <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyMetrics}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                                <Bar dataKey="newStudents" fill="#22c55e" name="Novos" stackId="a" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="renewals" fill="#3b82f6" name="Renovações" stackId="a" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="cancellations" fill="#ef4444" name="Cancelamentos" stackId="b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-4">
                <h3 className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Insights Automáticos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-white/90 text-xs">📈 Crescimento de receita de <strong>18%</strong> nos últimos 6 meses</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-white/90 text-xs">⏰ Maior retenção em alunos com objetivo <strong>Hipertrofia</strong></p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-white/90 text-xs">👥 Faixa <strong>25-34 anos</strong> representa 43% da base</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
