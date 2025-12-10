
import { useState } from 'react';
import {
    Users,
    Building2,
    DollarSign,
    Activity,
    Search,
    Filter,
    MoreHorizontal,
    Shield,
    Plus,
    Edit2,
    Trash2,
    Power,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import TenantModal, { Tenant } from '../../components/superadmin/TenantModal';
import { motion, AnimatePresence } from 'framer-motion';

const initialTenants: Tenant[] = [
    {
        id: '1',
        name: 'Iron Gym Consultoria',
        owner: 'Carlos Silva',
        plan: 'pro',
        status: 'active',
        studentsCount: 145,
        mrr: 4500,
        lastActive: '2 min atrás'
    },
    {
        id: '2',
        name: 'Amanda Personal',
        owner: 'Amanda Costa',
        plan: 'starter',
        status: 'active',
        studentsCount: 42,
        mrr: 1200,
        lastActive: '1 hora atrás'
    },
    {
        id: '3',
        name: 'Team Vortex',
        owner: 'Marcos Oliveira',
        plan: 'enterprise',
        status: 'active',
        studentsCount: 380,
        mrr: 12500,
        lastActive: '5 min atrás'
    },
    {
        id: '4',
        name: 'NutriFit Pro',
        owner: 'Julia Santos',
        plan: 'pro',
        status: 'trial',
        studentsCount: 15,
        mrr: 0,
        lastActive: '1 dia atrás'
    },
    {
        id: '5',
        name: 'CrossLife Box',
        owner: 'Pedro Rocha',
        plan: 'enterprise',
        status: 'suspended',
        studentsCount: 210,
        mrr: 6800,
        lastActive: '2 meses atrás'
    }
];

export default function SuperAdminDashboard() {
    const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

    // Dropdown State
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    // Calculated Metrics
    const totalTenants = tenants.length;
    const totalStudents = tenants.reduce((acc, t) => acc + t.studentsCount, 0);
    const totalMRR = tenants.reduce((acc, t) => acc + t.mrr, 0);
    const activeTenants = tenants.filter(t => t.status === 'active').length;

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.owner.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    // Actions
    const handleAdd = () => {
        setEditingTenant(null);
        setIsModalOpen(true);
        setOpenDropdownId(null);
    };

    const handleEdit = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setIsModalOpen(true);
        setOpenDropdownId(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
            setTenants(prev => prev.filter(t => t.id !== id));
        }
        setOpenDropdownId(null);
    };

    const handleToggleStatus = (tenant: Tenant) => {
        const newStatus = tenant.status === 'suspended' ? 'active' : 'suspended';
        setTenants(prev => prev.map(t =>
            t.id === tenant.id ? { ...t, status: newStatus } : t
        ));
        setOpenDropdownId(null);
    };

    const handleSave = (tenantData: Tenant) => {
        if (editingTenant) {
            // Edit
            setTenants(prev => prev.map(t => t.id === tenantData.id ? tenantData : t));
        } else {
            // Create
            setTenants(prev => [...prev, tenantData]);
        }
    };

    const [activeTab, setActiveTab] = useState<'tenants' | 'financial'>('tenants');

    // Financial Mock Data
    const transactions = [
        { id: 't1', tenant: 'Iron Gym', plan: 'Pro', amount: 297, date: '09/12/2024', status: 'paid' },
        { id: 't2', tenant: 'Amanda Personal', plan: 'Starter', amount: 97, date: '09/12/2024', status: 'paid' },
        { id: 't3', tenant: 'Team Vortex', plan: 'Enterprise', amount: 897, date: '08/12/2024', status: 'paid' },
        { id: 't4', tenant: 'CrossLife Box', plan: 'Enterprise', amount: 897, date: '05/12/2024', status: 'failed' },
        { id: 't5', tenant: 'Iron Gym', plan: 'Pro', amount: 297, date: '09/11/2024', status: 'paid' },
    ];

    const planStats = [
        { name: 'Starter', count: 12, price: 97, color: 'bg-blue-500' },
        { name: 'Pro', count: 45, price: 297, color: 'bg-purple-500' },
        { name: 'Enterprise', count: 8, price: 897, color: 'bg-emerald-500' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8" onClick={() => setOpenDropdownId(null)}>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-8 h-8 text-primary-600" />
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Super Admin</h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400">
                            Visão global do SaaS e gerenciamento de empresas
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                            Configurações Globais
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAdd(); }}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Nova Empresa
                        </button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex space-x-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                    <button
                        onClick={() => setActiveTab('tenants')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tenants'
                                ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        Visão Geral
                    </button>
                    <button
                        onClick={() => setActiveTab('financial')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'financial'
                                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        Financeiro
                    </button>
                </div>

                {/* KPI Cards (Global) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
                                +12%
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total de Empresas</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalTenants}</h3>
                        <p className="text-xs text-slate-400 mt-2">{activeTenants} ativas</p>
                    </Card>

                    <Card className="p-6 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                                <Users className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
                                +8.5%
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Alunos Gerenciados</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalStudents}</h3>
                        <p className="text-xs text-slate-400 mt-2">Em todas as instâncias</p>
                    </Card>

                    <Card className="p-6 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
                                +15%
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">MRR Global</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalMRR)}</h3>
                        <p className="text-xs text-slate-400 mt-2">Receita Recorrente Mensal</p>
                    </Card>

                    <Card className="p-6 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                                <Activity className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                                98%
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Saúde do Sistema</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Estável</h3>
                        <p className="text-xs text-slate-400 mt-2">Latência média: 45ms</p>
                    </Card>
                </div>

                {/* TENANTS TAB */}
                {activeTab === 'tenants' && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Empresas Cadastradas</h2>

                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar empresa..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 w-64"
                                    />
                                </div>
                                <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                    <Filter className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto min-h-[400px]">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Empresa</th>
                                        <th className="px-6 py-4">Plano</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-center">Alunos</th>
                                        <th className="px-6 py-4">MRR</th>
                                        <th className="px-6 py-4">Última Atividade</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredTenants.map((tenant) => (
                                        <tr key={tenant.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold shrink-0">
                                                        {tenant.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{tenant.name}</p>
                                                        <p className="text-xs text-slate-500">{tenant.owner}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tenant.plan === 'enterprise'
                                                    ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
                                                    : tenant.plan === 'pro'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                                                        : 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                    }`}>
                                                    {tenant.plan.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tenant.status === 'active'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : tenant.status === 'trial'
                                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {tenant.status === 'active' ? 'Ativo' : tenant.status === 'trial' ? 'Teste' : 'Suspenso'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-300">
                                                {tenant.studentsCount}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                                {formatCurrency(tenant.mrr)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {tenant.lastActive}
                                            </td>
                                            <td className="px-6 py-4 text-right relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenDropdownId(openDropdownId === tenant.id ? null : tenant.id);
                                                    }}
                                                    className={`p-2 rounded-lg transition-colors ${openDropdownId === tenant.id ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                                >
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {openDropdownId === tenant.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                        <div className="p-1">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleEdit(tenant); }}
                                                                className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg flex items-center gap-2"
                                                            >
                                                                <Edit2 className="w-4 h-4 text-blue-500" />
                                                                Editar Dados
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleToggleStatus(tenant); }}
                                                                className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg flex items-center gap-2"
                                                            >
                                                                {tenant.status === 'suspended' ? (
                                                                    <>
                                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                                        Ativar Empresa
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <XCircle className="w-4 h-4 text-amber-500" />
                                                                        Suspender
                                                                    </>
                                                                )}
                                                            </button>
                                                            <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(tenant.id); }}
                                                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Excluir
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* FINANCIAL TAB */}
                {activeTab === 'financial' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Transaction History */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Últimos Pagamentos</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Empresa</th>
                                            <th className="px-6 py-4">Plano</th>
                                            <th className="px-6 py-4">Valor</th>
                                            <th className="px-6 py-4">Data</th>
                                            <th className="px-6 py-4 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {transactions.map((t) => (
                                            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                    {t.tenant}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">
                                                    {t.plan}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                                    {formatCurrency(t.amount)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">
                                                    {t.date}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.status === 'paid'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {t.status === 'paid' ? 'Pago' : 'Falha'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Plan Distribution */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Distribuição de Planos</h2>
                            <div className="space-y-6">
                                {planStats.map(stat => (
                                    <div key={stat.name}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{stat.name}</span>
                                            <span className="text-slate-900 dark:text-white font-bold">{stat.count}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${stat.color}`}
                                                style={{ width: `${(stat.count / totalTenants) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Valor: {formatCurrency(stat.price)}/mês
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Ticket Médio</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {formatCurrency(totalMRR / totalTenants)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <TenantModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingTenant}
            />
        </div>
    );
}
