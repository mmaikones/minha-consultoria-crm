import { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Link2,
    CheckCircle,
    X,
    Share2,
    ExternalLink,
    Loader2,
    TrendingUp,
    Calendar,
    ShoppingBag
} from 'lucide-react';
import {
    Plan,
    getPlans,
    savePlan,
    deletePlan,
    formatPrice,
    calculateMonthlyPrice,
    copyLinkToClipboard,
    generateShareableLink,
    durationConfigs
} from '../services/stripeService';
import MarketingNav from '../components/marketing/MarketingNav';

// Sales metrics type for each plan
interface PlanSalesMetrics {
    totalSold: number;
    totalRevenue: number;
    lastSaleDate: string | null;
}

// Mock sales data (would come from Supabase in production)
const mockSalesData: Record<string, PlanSalesMetrics> = {
    'plan-mensal': { totalSold: 25, totalRevenue: 3000, lastSaleDate: '2024-12-08' },
    'plan-trimestral': { totalSold: 18, totalRevenue: 5346, lastSaleDate: '2024-12-07' },
    'plan-semestral': { totalSold: 12, totalRevenue: 6588, lastSaleDate: '2024-12-05' },
    'plan-anual': { totalSold: 8, totalRevenue: 7976, lastSaleDate: '2024-12-01' },
};

export default function Plans() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

    // Get sales metrics for a plan
    const getSalesMetrics = (planId: string): PlanSalesMetrics => {
        return mockSalesData[planId] || { totalSold: 0, totalRevenue: 0, lastSaleDate: null };
    };

    // Calculate total revenue across all plans
    const totalStats = useMemo(() => {
        const allMetrics = Object.values(mockSalesData);
        return {
            totalSales: allMetrics.reduce((sum, m) => sum + m.totalSold, 0),
            totalRevenue: allMetrics.reduce((sum, m) => sum + m.totalRevenue, 0),
        };
    }, []);

    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            const data = await getPlans();
            setPlans(data);
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleCopyLink = async (plan: Plan) => {
        const link = generateShareableLink(plan.id);
        const success = await copyLinkToClipboard(link);
        if (success) {
            setCopiedId(plan.id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    const handleDelete = async (planId: string) => {
        if (window.confirm('Deseja realmente desativar este plano?')) {
            try {
                await deletePlan(planId);
                // Refresh list
                setPlans(prev => prev.filter(p => p.id !== planId));
            } catch (error) {
                alert('Erro ao excluir plano');
            }
        }
    };

    const handleEdit = (plan: Plan) => {
        setEditingPlan(plan);
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingPlan(null);
        setShowModal(true);
    };

    const handleSavePlan = async (planData: Partial<Plan>) => {
        try {
            const dataToSave: Partial<Plan> = {
                ...planData,
                status: true, // Use status instead of isActive
            };

            if (editingPlan) {
                dataToSave.id = editingPlan.id;
            }

            // Using the service to save to Supabase
            const savedPlan = await savePlan(dataToSave);

            // Update local state without refetching for speed (optional, or just refetch)
            if (editingPlan) {
                setPlans(prev => prev.map(p => p.id === savedPlan.id ? savedPlan : p));
            } else {
                setPlans(prev => [...prev, savedPlan]);
            }

            setShowModal(false);
            setEditingPlan(null);
        } catch (error) {
            console.error('Error saving plan:', error);
            alert('Erro ao salvar plano');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Marketing Navigation */}
            <MarketingNav />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Planos</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gerencie seus planos e gere links de venda
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Date Filter */}
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
                        className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                        <option value="7d">Últimos 7 dias</option>
                        <option value="30d">Últimos 30 dias</option>
                        <option value="90d">Últimos 90 dias</option>
                        <option value="all">Todo período</option>
                    </select>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Plano
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Receita Total</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {formatPrice(totalStats.totalRevenue)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <ShoppingBag className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Vendas Totais</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {totalStats.totalSales} vendas
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Planos Ativos</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {plans.length} planos
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <div
                        key={plan.id}
                        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                        {/* Plan Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${plan.type === 'anual' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        plan.type === 'semestral' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                            plan.type === 'trimestral' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                        }`}>
                                        {durationConfigs[plan.type].label}
                                    </span>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                        {plan.name}
                                    </h3>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(plan)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        <Edit className="w-4 h-4 text-slate-400" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(plan.id)}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                {plan.description}
                            </p>
                        </div>

                        {/* Price */}
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                    {formatPrice(plan.price)}
                                </span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    /{durationConfigs[plan.type].label.toLowerCase()}
                                </span>
                            </div>
                            {plan.type !== 'mensal' && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Equivalente a {formatPrice(calculateMonthlyPrice(plan.price, plan.type))}/mês
                                </p>
                            )}
                        </div>

                        {/* Sales Metrics */}
                        {(() => {
                            const metrics = getSalesMetrics(plan.id);
                            return (
                                <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/10 dark:to-blue-900/10 border-y border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-emerald-600">{metrics.totalSold}</p>
                                                <p className="text-xs text-slate-500">vendas</p>
                                            </div>
                                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-600" />
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-blue-600">{formatPrice(metrics.totalRevenue)}</p>
                                                <p className="text-xs text-slate-500">receita</p>
                                            </div>
                                        </div>
                                        {metrics.lastSaleDate && (
                                            <div className="text-right">
                                                <p className="text-xs text-slate-400">Última venda</p>
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                                    {new Date(metrics.lastSaleDate).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Features */}
                        <div className="p-6">
                            <ul className="space-y-2 mb-6">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleCopyLink(plan)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${copiedId === plan.id
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                                        }`}
                                >
                                    {copiedId === plan.id ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Copiado!
                                        </>
                                    ) : (
                                        <>
                                            <Link2 className="w-4 h-4" />
                                            Copiar Link
                                        </>
                                    )}
                                </button>
                                <a
                                    href={generateShareableLink(plan.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {plans.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Share2 className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        Nenhum plano criado
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                        Crie seu primeiro plano para começar a vender
                    </p>
                    <button
                        onClick={handleCreate}
                        className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium"
                    >
                        Criar Primeiro Plano
                    </button>
                </div>
            )}

            {/* Plan Modal */}
            {showModal && (
                <PlanModal
                    plan={editingPlan}
                    onClose={() => { setShowModal(false); setEditingPlan(null); }}
                    onSave={handleSavePlan}
                />
            )}
        </div>
    );
}

// Plan Create/Edit Modal
interface PlanModalProps {
    plan: Plan | null;
    onClose: () => void;
    onSave: (data: Partial<Plan>) => void;
}

function PlanModal({ plan, onClose, onSave }: PlanModalProps) {
    const [formData, setFormData] = useState({
        name: plan?.name || '',
        description: plan?.description || '',
        price: plan?.price || 0,
        type: plan?.type || 'mensal' as Plan['type'],
        features: (Array.isArray(plan?.features) ? plan?.features.join('\n') : '') || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            type: formData.type,
            features: formData.features.split('\n').filter(f => f.trim())
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {plan ? 'Editar Plano' : 'Novo Plano'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Nome do Plano
                        </label>
                        <input
                            required
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500"
                            placeholder="Ex: Consultoria Online - Mensal"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Descrição
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 min-h-[80px]"
                            placeholder="Descreva o que está incluído..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Preço (R$)
                            </label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Duração
                            </label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as Plan['type'] }))}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="mensal">Mensal</option>
                                <option value="trimestral">Trimestral</option>
                                <option value="semestral">Semestral</option>
                                <option value="anual">Anual</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Benefícios (um por linha)
                        </label>
                        <textarea
                            value={formData.features}
                            onChange={e => setFormData(prev => ({ ...prev, features: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                            placeholder="Treino personalizado&#10;Dieta personalizada&#10;Suporte via WhatsApp"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                        >
                            {plan ? 'Salvar' : 'Criar Plano'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
