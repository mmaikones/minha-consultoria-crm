
import { useState, useEffect } from 'react';
import { X, Building2, User, CreditCard, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Tenant {
    id: string;
    name: string;
    owner: string;
    plan: 'starter' | 'pro' | 'enterprise';
    status: 'active' | 'trial' | 'suspended';
    studentsCount: number;
    mrr: number;
    lastActive: string;
}

interface TenantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (tenant: Tenant) => void;
    initialData?: Tenant | null;
}

const emptyTenant: Tenant = {
    id: '',
    name: '',
    owner: '',
    plan: 'starter',
    status: 'active',
    studentsCount: 0,
    mrr: 0,
    lastActive: 'Agora'
};

export default function TenantModal({ isOpen, onClose, onSave, initialData }: TenantModalProps) {
    const [formData, setFormData] = useState<Tenant>(emptyTenant);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? { ...initialData } : { ...emptyTenant, id: Date.now().toString() });
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                {initialData ? 'Editar Empresa' : 'Nova Empresa'}
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Nome da Empresa
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        placeholder="Ex: Iron Gym"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Responsável
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.owner}
                                        onChange={e => setFormData({ ...formData, owner: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        placeholder="Nome do dono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Plano
                                    </label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            value={formData.plan}
                                            onChange={e => setFormData({ ...formData, plan: e.target.value as any })}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 appearance-none"
                                        >
                                            <option value="starter">Starter</option>
                                            <option value="pro">Pro</option>
                                            <option value="enterprise">Enterprise</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Status
                                    </label>
                                    <div className="relative">
                                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 appearance-none"
                                        >
                                            <option value="active">Ativo</option>
                                            <option value="trial">Trial</option>
                                            <option value="suspended">Suspenso</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Optional: MRR override for admins */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    MRR (Mock)
                                </label>
                                <input
                                    type="number"
                                    value={formData.mrr}
                                    onChange={e => setFormData({ ...formData, mrr: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 mt-4"
                            >
                                Salvar Empresa
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
