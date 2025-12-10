import { useState, useMemo } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Plus,
    X,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Settings,
    Check,
    DollarSign,
    Package,
    ShoppingBag
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CashFlowCategory,
    CashFlowTransaction,
    TransactionType,
    defaultCategories,
    mockCashFlowTransactions,
    getCategoryById,
    calculateTotals,
    getTransactionsByMonth
} from '../data/mockCashFlow';
import FinancialAIWidget from '../components/financial/FinancialAIWidget';

const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Plan prices helper (duplicated for now, could be shared)
const PLAN_PRICES: Record<string, number> = {
    'mensal': 150,
    'trimestral': 400,
    'semestral': 750,
    'anual': 1400,
    'novos_leads': 0
};

// Colors for charts
const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

// Import mockStudents to generate real financial data
import { mockStudents } from '../data/mockStudents';

// Generate transactions from Students
const generateStudentTransactions = (): CashFlowTransaction[] => {
    const transactions: CashFlowTransaction[] = [];

    // 1. Income from Student History
    mockStudents.forEach(student => {
        student.history?.forEach(event => {
            if (event.type === 'payment' || event.type === 'renewal' || event.type === 'signup') {
                // Parse amount from description if possible, else use Plan Price
                let amount = PLAN_PRICES[student.status] || 0;
                // If description contains "R$ XXX", try to extract? 
                // For simplicity, use the plan price associated with their CURRENT status (approximation)
                // Or if it's history, assume it matched the plan at the time.

                transactions.push({
                    id: `t-${student.id}-${event.id}`,
                    type: 'entrada',
                    categoryId: '1', // Vendas/Planos
                    description: `${event.description} - ${student.name}`,
                    amount: amount,
                    date: event.date,
                    status: 'completed',
                    paymentMethod: 'credit_card'
                });
            }
        });
    });

    // 2. Add some mock expenses to make the chart interesting
    // (Since user only said "students" are source of truth, expenses can be system defaults)
    const mockExpenses: CashFlowTransaction[] = mockCashFlowTransactions.filter(t => t.type === 'saida');

    return [...transactions, ...mockExpenses];
};


export default function Financial() {
    const today = new Date();
    const [categories, setCategories] = useState<CashFlowCategory[]>(defaultCategories);
    // Initialize with generated data
    const [transactions, setTransactions] = useState<CashFlowTransaction[]>(() => generateStudentTransactions());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CashFlowCategory | null>(null);

    // Form state
    const [newTransaction, setNewTransaction] = useState<{
        type: TransactionType;
        categoryId: string;
        description: string;
        amount: string;
        date: string;
        notes: string;
    }>({
        type: 'entrada',
        categoryId: '',
        description: '',
        amount: '',
        date: today.toISOString().split('T')[0],
        notes: ''
    });

    const [newCategory, setNewCategory] = useState({
        name: '',
        type: 'entrada' as TransactionType,
        icon: '📌',
        color: 'bg-slate-500'
    });

    const [toast, setToast] = useState<string | null>(null);

    // Filtered transactions for selected month
    const monthTransactions = useMemo(() =>
        getTransactionsByMonth(transactions, selectedYear, selectedMonth),
        [transactions, selectedYear, selectedMonth]
    );

    // Totals
    const totals = useMemo(() => calculateTotals(monthTransactions), [monthTransactions]);

    // Chart data for last 6 months
    const chartData = useMemo(() => {
        const data = [];
        for (let i = 5; i >= 0; i--) {
            let month = today.getMonth() - i;
            let year = today.getFullYear();
            if (month < 0) { month += 12; year--; }

            const monthTx = getTransactionsByMonth(transactions, year, month);
            const monthTotals = calculateTotals(monthTx);

            data.push({
                month: monthNames[month].substring(0, 3),
                entradas: monthTotals.entradas,
                saidas: monthTotals.saidas,
            });
        }
        return data;
    }, [transactions]);

    // Generate Sales Trend Data dynamically from transactions
    const salesTrendData = useMemo(() => {
        const data: Record<string, { vendas: number, receita: number }> = {};

        // Init last 6 months
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = monthNames[d.getMonth()].substring(0, 3);
            data[key] = { vendas: 0, receita: 0 };
        }

        transactions.forEach(t => {
            if (t.type === 'entrada') {
                const d = new Date(t.date);
                const key = monthNames[d.getMonth()]?.substring(0, 3);
                if (key && data[key]) {
                    data[key].vendas += 1;
                    data[key].receita += t.amount;
                }
            }
        });

        return Object.entries(data).map(([month, val]) => ({
            month,
            vendas: val.vendas,
            receita: val.receita
        }));
    }, [transactions]);

    // Generate Product Sales Data dynamically
    const productSalesData = useMemo(() => {
        const counts = {
            'mensal': 0, 'trimestral': 0, 'semestral': 0, 'anual': 0
        };
        const revenues = {
            'mensal': 0, 'trimestral': 0, 'semestral': 0, 'anual': 0
        };

        mockStudents.forEach(s => {
            if (s.status !== 'novos_leads' && counts.hasOwnProperty(s.status)) {
                // @ts-ignore
                counts[s.status]++;
                // @ts-ignore
                revenues[s.status] += (PLAN_PRICES[s.status] || 0);
            }
        });

        return Object.keys(counts).map((key, index) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            // @ts-ignore
            sales: counts[key],
            // @ts-ignore
            revenue: revenues[key],
            color: COLORS[index % COLORS.length]
        }));
    }, []);

    // Navigation
    const prevMonth = () => {
        if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(selectedYear - 1); }
        else setSelectedMonth(selectedMonth - 1);
    };

    const nextMonth = () => {
        if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(selectedYear + 1); }
        else setSelectedMonth(selectedMonth + 1);
    };

    // Handlers
    const handleAddTransaction = () => {
        if (!newTransaction.description || !newTransaction.amount || !newTransaction.categoryId) return;


        const transaction: CashFlowTransaction = {
            id: `cf-${Date.now()}`,
            type: newTransaction.type,
            categoryId: newTransaction.categoryId,
            description: newTransaction.description,
            amount: parseFloat(newTransaction.amount),
            date: newTransaction.date,
            notes: newTransaction.notes || undefined
        };

        setTransactions([transaction, ...transactions]);
        setNewTransaction({
            type: 'entrada',
            categoryId: '',
            description: '',
            amount: '',
            date: today.toISOString().split('T')[0],
            notes: ''
        });
        setShowAddModal(false);
        showToast('Transação adicionada!');
    };

    const handleDeleteTransaction = (id: string) => {
        setTransactions(transactions.filter(t => t.id !== id));
        showToast('Transação removida');
    };

    const handleSaveCategory = () => {
        if (!newCategory.name) return;

        if (editingCategory) {
            setCategories(categories.map(c =>
                c.id === editingCategory.id
                    ? { ...c, name: newCategory.name, icon: newCategory.icon, color: newCategory.color }
                    : c
            ));
            showToast('Categoria atualizada!');
        } else {

            const category: CashFlowCategory = {
                id: `cat-${Date.now()}`,
                name: newCategory.name,
                type: newCategory.type,
                icon: newCategory.icon,
                color: newCategory.color
            };
            setCategories([...categories, category]);
            showToast('Categoria criada!');
        }

        setNewCategory({ name: '', type: 'entrada', icon: '📌', color: 'bg-slate-500' });
        setEditingCategory(null);
        setShowCategoryModal(false);
    };

    const handleEditCategory = (category: CashFlowCategory) => {
        setEditingCategory(category);
        setNewCategory({
            name: category.name,
            type: category.type,
            icon: category.icon,
            color: category.color
        });
        setShowCategoryModal(true);
    };

    const handleDeleteCategory = (id: string) => {
        setCategories(categories.filter(c => c.id !== id));
        showToast('Categoria removida');
    };

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const categoriesFiltered = (type: TransactionType) => categories.filter(c => c.type === type);

    const [activeTab, setActiveTab] = useState<'cashflow' | 'subscriptions'>('subscriptions');

    // Subscriptions Mock Data
    const subscriptions = [
        { id: 'sub1', student: 'João Silva', plan: 'Trimestral', amount: 297, date: '09/12/2024', status: 'paid', nextDate: '09/01/2025' },
        { id: 'sub2', student: 'Maria Santos', plan: 'Mensal', amount: 120, date: '08/12/2024', status: 'paid', nextDate: '08/01/2025' },
        { id: 'sub3', student: 'Pedro Oliveira', plan: 'Semestral', amount: 550, date: '05/12/2024', status: 'pending', nextDate: '05/01/2025' },
        { id: 'sub4', student: 'Ana Costa', plan: 'Anual', amount: 997, date: '01/12/2024', status: 'paid', nextDate: '01/12/2025' },
        { id: 'sub5', student: 'Carlos Souza', plan: 'Mensal', amount: 120, date: '10/11/2024', status: 'failed', nextDate: '10/12/2024' },
    ];

    const subscriptionStats = {
        mrr: 4560,
        activeStudents: 42,
        churnRate: 2.4,
        pendingAmount: 550
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financeiro</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gerencie suas receitas, despesas e assinaturas</p>
                </div>

                {/* Tabs */}
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 w-fit">
                    <button
                        onClick={() => setActiveTab('subscriptions')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'subscriptions'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        Assinaturas (Alunos)
                    </button>
                    <button
                        onClick={() => setActiveTab('cashflow')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'cashflow'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        Fluxo de Caixa
                    </button>
                </div>
            </div>

            {/* SUBSCRIPTIONS TAB */}
            {activeTab === 'subscriptions' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* CFO Virtual Data */}
                    <FinancialAIWidget financialData={{
                        mrr: subscriptionStats.mrr,
                        activeStudents: subscriptionStats.activeStudents,
                        churnRate: subscriptionStats.churnRate,
                        pendingAmount: subscriptionStats.pendingAmount,
                        cashFlowBalance: totals.saldo
                    }} />

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">+12%</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">MRR (Recorrente)</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                R$ {subscriptionStats.mrr.toLocaleString('pt-BR')}
                            </h3>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Alunos Ativos</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                {subscriptionStats.activeStudents}
                            </h3>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                                    <TrendingDown className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">Este mês</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pendências</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                R$ {subscriptionStats.pendingAmount.toLocaleString('pt-BR')}
                            </h3>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                                    <Settings className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Planos Ativos</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">4</h3>
                            <p className="text-xs text-slate-400 mt-1">Mensal, Trimestral, Semestral, Anual</p>
                        </div>
                    </div>

                    {/* Subscription History */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Últimos Pagamentos</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Aluno</th>
                                        <th className="px-6 py-4">Plano</th>
                                        <th className="px-6 py-4">Valor</th>
                                        <th className="px-6 py-4">Data Pagamento</th>
                                        <th className="px-6 py-4">Próx. Cobrança</th>
                                        <th className="px-6 py-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {subscriptions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                {sub.student}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                                                    {sub.plan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                                R$ {sub.amount.toLocaleString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {sub.date}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {sub.nextDate}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sub.status === 'paid'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : sub.status === 'pending'
                                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {sub.status === 'paid' ? 'Pago' : sub.status === 'pending' ? 'Pendente' : 'Falha'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Best Selling Products Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sales by Product Pie Chart */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                        <Package className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Vendas por Produto</h2>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={productSalesData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={3}
                                                dataKey="revenue"
                                            >
                                                {productSalesData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1e293b',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: '#fff',
                                                    fontSize: '12px'
                                                }}
                                                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    {productSalesData.map((product) => (
                                        <div key={product.name} className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: product.color }}
                                            />
                                            <span className="text-sm text-slate-600 dark:text-slate-400">{product.name}</span>
                                            <span className="text-sm font-medium text-slate-900 dark:text-white ml-auto">
                                                {product.sales} vendas
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sales Trend Chart */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                        <ShoppingBag className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Evolução de Vendas</h2>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={salesTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                                            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}`} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1e293b',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: '#fff',
                                                    fontSize: '12px'
                                                }}
                                                formatter={(value: number, name: string) => [
                                                    name === 'vendas' ? `${value} vendas` : `R$ ${value.toLocaleString('pt-BR')}`,
                                                    name === 'vendas' ? 'Vendas' : 'Receita'
                                                ]}
                                            />
                                            <Legend />
                                            <Bar dataKey="vendas" fill="#6366f1" radius={[4, 4, 0, 0]} name="Vendas" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Best Sellers Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">🏆 Produtos Mais Vendidos</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">#</th>
                                        <th className="px-6 py-4">Produto</th>
                                        <th className="px-6 py-4">Vendas</th>
                                        <th className="px-6 py-4">Receita Total</th>
                                        <th className="px-6 py-4">% do Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {productSalesData
                                        .sort((a, b) => b.revenue - a.revenue)
                                        .map((product, index) => {
                                            const totalRevenue = productSalesData.reduce((sum, p) => sum + p.revenue, 0);
                                            const percentage = ((product.revenue / totalRevenue) * 100).toFixed(1);
                                            return (
                                                <tr key={product.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? 'bg-amber-100 text-amber-700' :
                                                            index === 1 ? 'bg-slate-200 text-slate-700' :
                                                                index === 2 ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-slate-100 text-slate-500'
                                                            }`}>
                                                            {index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: product.color }}
                                                            />
                                                            <span className="font-medium text-slate-900 dark:text-white">
                                                                Plano {product.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        {product.sales} unidades
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                                                        R$ {product.revenue.toLocaleString('pt-BR')}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full"
                                                                    style={{
                                                                        width: `${percentage}%`,
                                                                        backgroundColor: product.color
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-sm text-slate-500">{percentage}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* CASH FLOW TAB (Legacy View) */}
            {activeTab === 'cashflow' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setShowCategoryModal(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                        >
                            <Settings className="w-4 h-4" />
                            Categorias
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Nova Transação
                        </button>
                    </div>

                    {/* Month Selector + Summary Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Month Navigation */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </button>
                            <div className="text-center">
                                <p className="font-semibold text-slate-900 dark:text-white">{monthNames[selectedMonth]}</p>
                                <p className="text-sm text-slate-500">{selectedYear}</p>
                            </div>
                            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>

                        {/* Entradas */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-green-200 dark:border-green-900/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-green-600">
                                        R$ {totals.entradas.toLocaleString('pt-BR')}
                                    </p>
                                    <p className="text-xs text-slate-500">Entradas</p>
                                </div>
                            </div>
                        </div>

                        {/* Saídas */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-red-200 dark:border-red-900/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                                    <TrendingDown className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-red-600">
                                        R$ {totals.saidas.toLocaleString('pt-BR')}
                                    </p>
                                    <p className="text-xs text-slate-500">Saídas</p>
                                </div>
                            </div>
                        </div>

                        {/* Saldo */}
                        <div className={`bg-white dark:bg-slate-800 rounded-xl p-4 border ${totals.saldo >= 0 ? 'border-blue-200 dark:border-blue-900/50' : 'border-orange-200 dark:border-orange-900/50'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${totals.saldo >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-orange-100 dark:bg-orange-900/30'} rounded-xl flex items-center justify-center`}>
                                    <DollarSign className={`w-5 h-5 ${totals.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                                </div>
                                <div>
                                    <p className={`text-lg font-bold ${totals.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                        R$ {totals.saldo.toLocaleString('pt-BR')}
                                    </p>
                                    <p className="text-xs text-slate-500">Saldo do Mês</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Últimos 6 Meses</h2>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                        formatter={(value: number, name: string) => [`R$ ${value.toLocaleString('pt-BR')}`, name === 'entradas' ? 'Entradas' : 'Saídas']}
                                    />
                                    <Legend />
                                    <Bar dataKey="entradas" fill="#22c55e" radius={[4, 4, 0, 0]} name="Entradas" />
                                    <Bar dataKey="saidas" fill="#ef4444" radius={[4, 4, 0, 0]} name="Saídas" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Transactions List */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="font-semibold text-slate-900 dark:text-white text-sm">
                                Transações de {monthNames[selectedMonth]}
                            </h2>
                            <span className="text-xs text-slate-500">{monthTransactions.length} itens</span>
                        </div>

                        {monthTransactions.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-slate-500">Nenhuma transação neste mês</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-80 overflow-y-auto">
                                {monthTransactions
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map(transaction => {
                                        const category = getCategoryById(categories, transaction.categoryId);
                                        return (
                                            <div key={transaction.id} className="p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <div className={`w-9 h-9 ${category?.color || 'bg-slate-500'} rounded-xl flex items-center justify-center text-white text-sm`}>
                                                    {category?.icon || '📌'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                                                        {transaction.description}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {category?.name} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-semibold text-sm ${transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {transaction.type === 'entrada' ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR')}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteTransaction(transaction.id)}
                                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Transaction Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-5"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-slate-900 dark:text-white">Nova Transação</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Type Toggle */}
                                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                                    <button
                                        onClick={() => setNewTransaction({ ...newTransaction, type: 'entrada', categoryId: '' })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${newTransaction.type === 'entrada' ? 'bg-green-500 text-white' : 'text-slate-600 dark:text-slate-400'}`}
                                    >
                                        💰 Entrada
                                    </button>
                                    <button
                                        onClick={() => setNewTransaction({ ...newTransaction, type: 'saida', categoryId: '' })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${newTransaction.type === 'saida' ? 'bg-red-500 text-white' : 'text-slate-600 dark:text-slate-400'}`}
                                    >
                                        💸 Saída
                                    </button>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                                    <select
                                        value={newTransaction.categoryId}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, categoryId: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Selecione...</option>
                                        {categoriesFiltered(newTransaction.type).map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                                    <input
                                        type="text"
                                        value={newTransaction.description}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                        placeholder="Ex: Mensalidade João Silva"
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                {/* Amount + Date */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor (R$)</label>
                                        <input
                                            type="number"
                                            value={newTransaction.amount}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data</label>
                                        <input
                                            type="date"
                                            value={newTransaction.date}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddTransaction}
                                    disabled={!newTransaction.description || !newTransaction.amount || !newTransaction.categoryId}
                                    className="w-full py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Management Modal */}
            <AnimatePresence>
                {showCategoryModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                                <h2 className="font-semibold text-slate-900 dark:text-white">
                                    {editingCategory ? 'Editar Categoria' : 'Gerenciar Categorias'}
                                </h2>
                                <button onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                    {editingCategory ? 'Edite os dados abaixo' : 'Adicionar nova categoria'}
                                </p>
                                <div className="flex gap-2">
                                    <select
                                        value={newCategory.type}
                                        onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as TransactionType })}
                                        className="px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                                        disabled={!!editingCategory}
                                    >
                                        <option value="entrada">Entrada</option>
                                        <option value="saida">Saída</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Nome da categoria"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                                    />
                                    <button
                                        onClick={handleSaveCategory}
                                        disabled={!newCategory.name}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-xl disabled:opacity-50"
                                    >
                                        {editingCategory ? 'Salvar' : 'Criar'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {/* Entradas */}
                                <div>
                                    <h3 className="text-xs font-semibold text-green-600 uppercase mb-2">Categorias de Entrada</h3>
                                    <div className="space-y-1">
                                        {categoriesFiltered('entrada').map(cat => (
                                            <div key={cat.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                                <span className={`w-7 h-7 ${cat.color} rounded-lg flex items-center justify-center text-sm`}>{cat.icon}</span>
                                                <span className="flex-1 text-sm text-slate-900 dark:text-white">{cat.name}</span>
                                                <button onClick={() => handleEditCategory(cat)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded">
                                                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                                </button>
                                                <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Saídas */}
                                <div>
                                    <h3 className="text-xs font-semibold text-red-600 uppercase mb-2">Categorias de Saída</h3>
                                    <div className="space-y-1">
                                        {categoriesFiltered('saida').map(cat => (
                                            <div key={cat.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                                <span className={`w-7 h-7 ${cat.color} rounded-lg flex items-center justify-center text-sm`}>{cat.icon}</span>
                                                <span className="flex-1 text-sm text-slate-900 dark:text-white">{cat.name}</span>
                                                <button onClick={() => handleEditCategory(cat)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded">
                                                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                                </button>
                                                <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50"
                    >
                        <Check className="w-5 h-5" />
                        <span className="text-sm">{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
